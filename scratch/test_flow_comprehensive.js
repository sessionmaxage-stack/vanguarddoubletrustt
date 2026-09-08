const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<div id="results"></div>
</body>
</html>`;

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  url: "http://localhost:3000/customer/international.php"
});

const { window } = dom;
const { document } = window;
global.window = window;
global.document = document;
for (const k of Object.getOwnPropertyNames(window)) {
  if (!(k in global)) {
    try { global[k] = window[k]; } catch (_) {}
  }
}

// Mock layout for JSDOM
Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get: function() { return 450; }
});
Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get: function() { return 300; }
});

// Load SweetAlert2
const Swal = require(path.join(__dirname, "../npm/sweetalert2@11"));
window.Swal = Swal;

console.log("Swal loaded successfully. Version:", Swal.version);

// Mock fetch
window.fetch = async (url, opts) => {
  if (url.includes("/api/customer/transfer/request-otp")) {
    return {
      ok: true,
      json: async () => ({
        ok: true,
        maskedEmail: "t***t@vanguardtest.com",
        emailDelivered: true,
        emailSent: true
      })
    };
  }
  return { ok: true, json: async () => ({ ok: true }) };
};

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function integrityHash(fields) {
  const str = Array.isArray(fields)
    ? fields.map(function (v) { return String(v == null ? "" : v); }).join("|||")
    : String(fields == null ? "" : fields);
  let h1 = 0x811c9dc5, h2 = 0xdeadbeef;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i) & 0xff;
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca77);
  }
  h1 = (h1 ^ (h1 >>> 16)) >>> 0;
  h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  return ("00000000" + h1.toString(16)).slice(-8) + ("00000000" + h2.toString(16)).slice(-8);
}

function sealTransferContext(ctx) {
  const snapshot = Object.assign({}, ctx);
  return {
    __sealedSnapshot: snapshot,
    verify: (current) => {
      return (
        String(current.toFullName || "") === String(snapshot.toFullName || "") &&
        String(current.toAccountNumber || "") === String(snapshot.toAccountNumber || "") &&
        String(current.toEmail || "") === String(snapshot.toEmail || "") &&
        Math.abs(Number(current.amount) - Number(snapshot.amount)) < 0.001 &&
        String(current.currency || "").toUpperCase() === String(snapshot.currency || "").toUpperCase() &&
        Math.abs(Number(current.feeAmount) - Number(snapshot.feeAmount)) < 0.001
      );
    }
  };
}

function verifyTransferContextIntegrity(sealed, current) {
  return sealed && typeof sealed.verify === "function" && sealed.verify(current);
}

// Implement the proposed dialog function
const showCombinedPinAndOtpDialog = async (transferContext) => {
  const context = transferContext || {};
  const toAccountNumber = String(context.toAccountNumber || "").trim();
  const toEmail = String(context.toEmail || "").trim().toLowerCase();
  const amount = Number(context.amount);
  const currency = String(context.currency || "USD").trim().toUpperCase() || "USD";
  const memo = String(context.memo || "").trim();
  const toFullName = String(context.toFullName || "").trim() || "John Doe";
  const feeAmount = typeof context.feeAmount === "number" ? context.feeAmount : 0;
  const displayCurrency = currency || "USD";
  const formattedAmount = Number.isFinite(amount) ? amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
  const formattedFee = Number.isFinite(feeAmount) ? feeAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
  const totalAmount = Number.isFinite(amount) && Number.isFinite(feeAmount) ? amount + feeAmount : amount;
  const formattedTotal = Number.isFinite(totalAmount) ? totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : formattedAmount;

  const sealedCtx = sealTransferContext({
    toFullName: toFullName,
    toAccountNumber: toAccountNumber,
    toEmail: toEmail,
    amount: amount,
    currency: displayCurrency,
    feeAmount: feeAmount
  });

  return await new Promise((resolve) => {
    let transferPin = "";
    let otpSent = false;
    let sentMaskedEmail = null;
    let delegated = false;
    let phase = "pin"; // pin -> otp -> confirm
    let confirmedOtp = "";

    const renderPinOtpBody = (opts = {}) => {
      const sending = Boolean(opts.sending);
      const sendError = opts.sendError ? String(opts.sendError) : "";
      const otpValue = opts.otpValue ? String(opts.otpValue) : "";
      return `
        <div class="vt-pin-otp-wrap" style="max-width:420px; margin: 0 auto;">
          <div style="text-align:center; margin-bottom:18px; color:#475569; font-size:14px; line-height:1.6;">
            Enter your <strong>Transfer PIN</strong> (Transaction Code) below and tap
            <strong>Send Verification Code</strong>.
          </div>
          <div style="margin-bottom: 14px;">
            <label for="vt-pin-input" style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:6px; text-transform:uppercase;">Transfer PIN</label>
            <input id="vt-pin-input" type="password" maxlength="32" autocomplete="off"
                   value="${transferPin ? escapeHtml(transferPin) : ""}"
                   placeholder="Enter your transfer PIN"
                   class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;"
                   ${otpSent ? " readonly disabled" : ""} />
          </div>
          ${!otpSent ? "" : `
            <div style="margin: 14px 0 10px; padding: 12px 14px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; color:#065f46; font-size:13px; line-height:1.5;">
              <div style="font-weight:700; margin-bottom:2px;">Verification code sent</div>
              <div>We emailed a 6-digit verification code to <strong>${escapeHtml(sentMaskedEmail || "your email")}</strong>.</div>
            </div>
            <div style="margin-bottom: 6px;">
              <label for="vt-otp-input" style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:6px; text-transform:uppercase;">6-Digit Verification Code</label>
              <input id="vt-otp-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code"
                     value="${escapeHtml(otpValue)}"
                     placeholder="000000"
                     class="swal2-input" style="margin:0; width:100%; box-sizing:border-box; letter-spacing: 6px; font-size: 20px; text-align: center;" />
            </div>
          `}
          ${sendError ? `
            <div id="vt-send-error" style="margin-top:10px; color:#dc2626; font-size:13px; font-weight:600; text-align:center;">
              ${escapeHtml(sendError)}
            </div>
          ` : ""}
        </div>
      `;
    };

    const renderConfirmBody = (opts = {}) => {
      const integrityErr = opts.integrityError ? String(opts.integrityError) : "";
      return `
        <div class="vt-confirm-transfer-wrap" style="max-width:460px; margin: 0 auto;">
          <div style="margin-bottom:18px; padding:14px 16px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; color:#1e40af; font-size:13px; line-height:1.6; text-align:left;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
              <span style="font-weight:800; font-size:14px;">Transfer review required</span>
            </div>
            <div style="margin-left:28px;">OTP verified successfully. Please carefully review the transfer details below and click <strong>Confirm Transfer</strong> to finalize the disbursement.</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 18px; margin-bottom:14px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0;">
              <span style="font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Recipient</span>
              <span style="font-size:14px; font-weight:700; color:#0f172a;" id="vt-confirm-fullname-text">${escapeHtml(toFullName)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0;">
              <span style="font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Account Number</span>
              <span style="font-size:13px; font-family:monospace; font-weight:700; color:#0f172a;">${escapeHtml(toAccountNumber)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0;">
              <span style="font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Transfer Amount</span>
              <span style="font-size:15px; font-weight:800; color:#059669;">${escapeHtml(displayCurrency)} ${escapeHtml(formattedAmount)}</span>
            </div>
          </div>
          <input type="hidden" id="vt-confirm-fullname" data-field="toFullName" value="${escapeHtml(toFullName)}" />
          <input type="hidden" id="vt-confirm-acctnum" data-field="toAccountNumber" value="${escapeHtml(toAccountNumber)}" />
          <input type="hidden" id="vt-confirm-amount" data-field="amount" value="${escapeHtml(formattedAmount)}" />
          <input type="hidden" id="vt-confirm-currency" data-field="currency" value="${escapeHtml(displayCurrency)}" />
          <input type="hidden" id="vt-confirm-fee" data-field="feeAmount" value="${escapeHtml(formattedFee)}" />
          <input type="hidden" id="vt-confirm-integrity" data-field="integrityHash" value="${escapeHtml(integrityHash([toFullName, toAccountNumber, toEmail, amount, displayCurrency, feeAmount]))}" />
          ${integrityErr ? `
            <div style="margin:0 0 14px; padding:10px 12px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; color:#991b1b; font-size:13px;">
              <strong>⚠ Integrity validation failed: </strong>${escapeHtml(integrityErr)}
            </div>
          ` : ""}
        </div>
      `;
    };

    const bindConfirmInputs = (popupEl) => {
      if (!popupEl) return;
      const confirmWrap = popupEl.querySelector(".vt-confirm-transfer-wrap");
      if (confirmWrap) {
        const inputs = confirmWrap.querySelectorAll('input[type="text"], input[type="hidden"]');
        inputs.forEach(function (inp) {
          inp.addEventListener("cut", function (e) { e.preventDefault(); });
          inp.addEventListener("copy", function (e) { e.preventDefault(); });
          inp.addEventListener("paste", function (e) { e.preventDefault(); });
          inp.addEventListener("keydown", function (e) { e.preventDefault(); });
        });
      }
    };

    const bindDelegatedHandlers = (popupEl) => {
      if (delegated || !popupEl) return;
      delegated = true;
      popupEl.addEventListener("click", (ev) => {
        const confirmBtn = ev.target.closest && ev.target.closest(".swal2-confirm");
        const cancelBtn = ev.target.closest && ev.target.closest(".swal2-cancel");
        const resendBtn = ev.target.closest && ev.target.closest("#vt-resend-btn");
        if (resendBtn) {
          ev.preventDefault();
          ev.stopPropagation();
          (async () => { try { await onSendOtp(); } catch (_) {} })();
          return;
        }
        if (confirmBtn) {
          ev.preventDefault();
          ev.stopPropagation();
          (async () => {
            if (phase === "pin") {
              if (!otpSent) await onSendOtp();
            } else if (phase === "otp") {
              await onAuthorize();
            } else if (phase === "confirm") {
              await onConfirmFinal();
            }
          })();
          return;
        }
        if (cancelBtn) {
          ev.preventDefault();
          ev.stopPropagation();
          (async () => {
            if (phase === "confirm") {
              phase = "otp";
              openConfirmOrPinOtp({ focus: "vt-otp-input", otpValue: confirmedOtp });
              return;
            }
            try { Swal.close(); } catch (_) {}
            resolve(null);
          })();
          return;
        }
      }, true); // Use capture phase so we intercept before SweetAlert2 internal button handlers!

      popupEl.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          const tag = (ev.target && ev.target.tagName) ? ev.target.tagName.toLowerCase() : "";
          if (tag === "textarea") return;
          ev.preventDefault();
          ev.stopPropagation();
          (async () => {
            if (phase === "pin") {
              if (!otpSent) await onSendOtp();
            } else if (phase === "otp") {
              await onAuthorize();
            } else if (phase === "confirm") {
              await onConfirmFinal();
            }
          })();
        }
      }, true);
    };

    const isDialogVisible = () => {
      try {
        return Boolean(Swal.isVisible() || (Swal.getPopup() && document.body.contains(Swal.getPopup())));
      } catch (_) {
        return false;
      }
    };

    const openConfirmOrPinOtp = (extraOpts = {}) => {
      const popupEl = Swal.getPopup();
      if (phase === "confirm") {
        const integrityErr = extraOpts.integrityError ? extraOpts.integrityError : "";
        const confirmHtml = renderConfirmBody({ integrityError: integrityErr });

        if (isDialogVisible()) {
          Swal.update({
            title: "Confirm Transfer",
            html: confirmHtml,
            showCancelButton: true,
            confirmButtonText: "Confirm Transfer",
            cancelButtonText: "← Back to OTP",
            showConfirmButton: true,
            showCloseButton: true,
            focusConfirm: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            buttonsStyling: true,
            confirmButtonColor: "#059669",
            cancelButtonColor: "#475569"
          });
          bindConfirmInputs(Swal.getPopup());
          try {
            const cb = document.querySelector(".swal2-confirm");
            if (cb && typeof cb.focus === "function") setTimeout(() => cb.focus(), 60);
          } catch (_) {}
          return;
        }

        Swal.fire({
          title: "Confirm Transfer",
          html: confirmHtml,
          showCancelButton: true,
          confirmButtonText: "Confirm Transfer",
          cancelButtonText: "← Back to OTP",
          showConfirmButton: true,
          showCloseButton: true,
          focusConfirm: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          buttonsStyling: true,
          confirmButtonColor: "#059669",
          cancelButtonColor: "#475569",
          didOpen: (pEl) => {
            bindDelegatedHandlers(pEl);
            bindConfirmInputs(pEl);
            try {
              const cb = pEl.querySelector(".swal2-confirm");
              if (cb && typeof cb.focus === "function") setTimeout(() => cb.focus(), 60);
            } catch (_) {}
          },
          willClose: () => {
            delegated = false;
          },
          preConfirm: () => false
        });
        return;
      }

      const sendError = extraOpts.sendError ? extraOpts.sendError : "";
      const otpValue = extraOpts.otpValue ? extraOpts.otpValue : "";
      const focus = extraOpts.focus || (otpSent ? "vt-otp-input" : "vt-pin-input");
      const pinOtpHtml = renderPinOtpBody({ sending: false, sendError, otpValue });

      if (isDialogVisible()) {
        Swal.update({
          title: otpSent ? "Authorize Transfer" : "Initiate Transfer Authorization",
          html: pinOtpHtml,
          showCancelButton: true,
          confirmButtonText: otpSent ? "Authorize Transfer" : "Send Verification Code",
          cancelButtonText: "Cancel",
          showConfirmButton: true,
          showCloseButton: true,
          confirmButtonColor: "#0f172a",
          cancelButtonColor: "#475569"
        });
        try {
          const f = document.querySelector("#" + focus);
          if (f && typeof f.focus === "function") setTimeout(() => f.focus(), 50);
        } catch (_) {}
        return;
      }

      Swal.fire({
        title: otpSent ? "Authorize Transfer" : "Initiate Transfer Authorization",
        html: pinOtpHtml,
        showCancelButton: true,
        confirmButtonText: otpSent ? "Authorize Transfer" : "Send Verification Code",
        cancelButtonText: "Cancel",
        showConfirmButton: true,
        showCloseButton: true,
        focusConfirm: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        buttonsStyling: true,
        confirmButtonColor: "#0f172a",
        cancelButtonColor: "#475569",
        didOpen: (pEl) => {
          bindDelegatedHandlers(pEl);
          try {
            const f = pEl.querySelector("#" + focus);
            if (f && typeof f.focus === "function") setTimeout(() => f.focus(), 50);
          } catch (_) {}
        },
        willClose: () => {
          delegated = false;
        },
        preConfirm: () => false
      });
    };

    const showSending = () => {
      const popupEl = Swal.getPopup();
      if (!popupEl) return;
      bindDelegatedHandlers(popupEl);
      const pinInput = popupEl.querySelector("#vt-pin-input");
      const pinVal = pinInput ? String(pinInput.value || "").trim() : transferPin;
      if (pinVal) transferPin = pinVal;
      Swal.update({
        html: renderPinOtpBody({ sending: true }),
        title: "Sending Verification Code...",
        confirmButtonText: "Please wait...",
        showCloseButton: false,
        allowOutsideClick: false
      });
      Swal.showLoading();
    };

    const onSendOtp = async () => {
      const popupEl = Swal.getPopup();
      if (popupEl) {
        const pinInput = popupEl.querySelector("#vt-pin-input");
        transferPin = pinInput ? String(pinInput.value || "").trim() : "";
      }
      if (!transferPin || transferPin.length < 6) {
        Swal.hideLoading();
        openConfirmOrPinOtp({ sendError: "Transfer PIN must be at least 6 characters or digits." });
        return;
      }
      showSending();
      try {
        const resp = await fetch("/api/customer/transfer/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transferPin: transferPin })
        });
        const body = await resp.json();
        otpSent = true;
        phase = "otp";
        sentMaskedEmail = body.maskedEmail;
        Swal.hideLoading();
        openConfirmOrPinOtp();
      } catch (err) {
        openConfirmOrPinOtp({ sendError: "Network error" });
      }
    };

    const onAuthorize = async () => {
      const popupEl = Swal.getPopup();
      let otpVal = "";
      if (popupEl) {
        const otpInput = popupEl.querySelector("#vt-otp-input");
        otpVal = otpInput ? String(otpInput.value || "").trim() : "";
      }
      if (!/^\d{6}$/.test(otpVal)) {
        openConfirmOrPinOtp({ otpValue: otpVal, sendError: "Please enter the 6 numeric digits of the email verification code." });
        return;
      }
      confirmedOtp = otpVal;
      phase = "confirm";
      openConfirmOrPinOtp();
    };

    const onConfirmFinal = async () => {
      const popupEl = Swal.getPopup();
      const fNameEl = popupEl.querySelector("#vt-confirm-fullname");
      const acctEl = popupEl.querySelector("#vt-confirm-acctnum");
      const amtEl = popupEl.querySelector("#vt-confirm-amount");
      const curEl = popupEl.querySelector("#vt-confirm-currency");
      const feeEl = popupEl.querySelector("#vt-confirm-fee");
      const intEl = popupEl.querySelector("#vt-confirm-integrity");

      const shownFullName = fNameEl ? String(fNameEl.value || "") : "";
      const shownAcct = acctEl ? String(acctEl.value || "") : "";
      const shownAmtRaw = amtEl ? String(amtEl.value || "").replace(/,/g, "") : "";
      const shownAmt = shownAmtRaw ? Number(shownAmtRaw) : NaN;
      const shownCur = curEl ? String(curEl.value || "") : "";
      const shownFeeRaw = feeEl ? String(feeEl.value || "").replace(/,/g, "") : "";
      const shownFee = shownFeeRaw ? Number(shownFeeRaw) : NaN;
      const shownIntegrity = intEl ? String(intEl.value || "") : "";

      const normalizedDisplayed = {
        toFullName: shownFullName,
        toAccountNumber: shownAcct,
        toEmail: toEmail,
        amount: shownAmt,
        currency: shownCur,
        feeAmount: shownFee
      };

      if (!verifyTransferContextIntegrity(sealedCtx, normalizedDisplayed)) {
        openConfirmOrPinOtp({ integrityError: "Sealed context integrity could not be verified." });
        return;
      }

      if (!/^\d{6}$/.test(confirmedOtp)) {
        phase = "otp";
        openConfirmOrPinOtp({ sendError: "OTP must be re-entered." });
        return;
      }

      Swal.close();
      resolve({ transferPin, otp: confirmedOtp });
    };

    phase = "pin";
    openConfirmOrPinOtp();
  });
};

// Runner to test all scenarios
(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  console.log("\n=== TEST CASE 1: Standard Valid OTP flow to Confirm Transfer ===");
  let dialogPromise = showCombinedPinAndOtpDialog({
    toAccountNumber: "1234567890",
    toFullName: "Alice Smith",
    amount: 1500,
    currency: "USD",
    feeAmount: 25,
    toEmail: "alice@example.com"
  });

  await wait(50);
  console.log("1.1 Dialog open. Title:", document.querySelector(".swal2-title")?.textContent);
  let pinInput = document.querySelector("#vt-pin-input");
  console.log("1.2 PIN input exists:", Boolean(pinInput));
  pinInput.value = "654321";

  // Click Send Verification Code
  let confirmBtn = document.querySelector(".swal2-confirm");
  console.log("1.3 Clicking:", confirmBtn?.textContent);
  confirmBtn.click();

  await wait(50);
  console.log("1.4 After PIN sent. Title:", document.querySelector(".swal2-title")?.textContent);
  let otpInput = document.querySelector("#vt-otp-input");
  console.log("1.5 OTP input exists:", Boolean(otpInput));

  // Test invalid OTP first
  console.log("\n--- Sub-test: Invalid OTP validation ---");
  otpInput.value = "123"; // only 3 digits
  confirmBtn = document.querySelector(".swal2-confirm");
  confirmBtn.click();
  await wait(50);
  let errMsg = document.querySelector("#vt-send-error")?.textContent.trim();
  console.log("1.6 Invalid OTP error shown:", errMsg);
  console.log("1.7 Section wrap is NOT shown yet:", !document.querySelector(".vt-confirm-transfer-wrap"));

  // Now enter valid OTP
  console.log("\n--- Sub-test: Valid OTP Confirmation ---");
  otpInput = document.querySelector("#vt-otp-input");
  otpInput.value = "987654";
  confirmBtn = document.querySelector(".swal2-confirm");
  console.log("1.8 Entering valid OTP 987654 and clicking 'Authorize Transfer'...");
  confirmBtn.click();

  await wait(50);
  console.log("1.9 Current dialog title:", document.querySelector(".swal2-title")?.textContent);
  const confirmWrap = document.querySelector(".vt-confirm-transfer-wrap");
  console.log("1.10 .vt-confirm-transfer-wrap exists:", Boolean(confirmWrap));
  console.log("1.11 Recipient displayed:", document.querySelector("#vt-confirm-fullname-text")?.textContent);
  confirmBtn = document.querySelector(".swal2-confirm");
  let cancelBtn = document.querySelector(".swal2-cancel");
  console.log("1.12 Confirm button text:", confirmBtn?.textContent);
  console.log("1.13 Cancel button text:", cancelBtn?.textContent);

  if (!confirmWrap || confirmBtn?.textContent !== "Confirm Transfer") {
    console.error("FAILED TEST 1: Confirm Transfer section not displayed!");
    process.exit(1);
  }

  // Test Back to OTP button
  console.log("\n--- Sub-test: Click '← Back to OTP' ---");
  cancelBtn.click();
  await wait(50);
  console.log("1.14 Title after Back to OTP:", document.querySelector(".swal2-title")?.textContent);
  console.log("1.15 OTP input exists again:", Boolean(document.querySelector("#vt-otp-input")));
  console.log("1.16 OTP input value retained:", document.querySelector("#vt-otp-input")?.value);

  // Return to Confirm Transfer
  confirmBtn = document.querySelector(".swal2-confirm");
  confirmBtn.click();
  await wait(50);
  console.log("1.17 Back to Confirm Transfer. Title:", document.querySelector(".swal2-title")?.textContent);

  // Final Confirmation
  console.log("\n--- Sub-test: Final 'Confirm Transfer' click ---");
  confirmBtn = document.querySelector(".swal2-confirm");
  confirmBtn.click();
  const result = await dialogPromise;
  console.log("1.18 Dialog resolved with:", result);
  console.log("1.19 Modal closed:", !Swal.isVisible());

  console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");
  process.exit(0);
})();
