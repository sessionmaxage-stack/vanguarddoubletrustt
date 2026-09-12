const fs = require("fs");
const path = require("path");

const INDEX = path.resolve(__dirname, "server", "index.js");
const AUTH = path.resolve(__dirname, "customer", "assets", "js", "auth-session.js");

// ---------- Patch index.js ----------
{
  const src = fs.readFileSync(INDEX, "utf8");
  const lines = src.split(/\r?\n/);
  const out = [];
  let i = 0;
  let changed = 0;
  while (i < lines.length) {
    const line = lines[i];
    const lineNo = i + 1;

    // request-otp endpoint: replace block starting "// 2. Enforce 24-hour rate limiting" through "remainingDailyRequests: rateCheck.remaining" before response closing brace
    // Anchor: line ~1547 contains "// 2. Enforce 24-hour rate limiting" and then goes until the "res.status(200).json({ ... remainingDailyRequests: rateCheck.remaining" followed by "});"
    // New simpler replacement (inline)
    if (/\/\/\s*2\.\s*Enforce 24-hour rate limiting/.test(line)) {
      // Skip lines until we reach the response JSON close: "remainingDailyRequests: rateCheck.remaining" line followed by "    });"
      while (i < lines.length) {
        const cur = lines[i];
        out.push("");
        if (/remainingDailyRequests:\s*rateCheck\.remaining/.test(cur)) {
          // Replace whole skipped section with single simplified response (replace current line marker)
          out.pop();
          out.push("    res.status(200).json({");
          out.push("      ok: true,");
          out.push('      message: "Transfer PIN verified. Please confirm the transfer details to proceed.",');
          out.push("      maskedEmail: null,");
          out.push("      emailDeliveredTo: null,");
          out.push("      emailSent: false,");
          out.push("      emailDelivered: false,");
          out.push("      expiresAt: Date.now() + (15 * 60 * 1000),");
          out.push("      expiresInMinutes: 15,");
          out.push("      transferPinVerified: true,");
          out.push("      remainingDailyRequests: 99");
          out.push("    });");
          i++; // consume remaining line
          // Also consume the "    });" that closes the .json()
          if (i < lines.length && /^\s*\}\);\s*$/.test(lines[i])) {
            i++;
          }
          changed++;
          break;
        }
        i++;
      }
      continue;
    }

    // /api/customer/transfer: remove OTP requirement block (lines ~1711+)
    // Anchor 1: candidateOtp extract. Replace OTP checks + validation section
    if (lineNo >= 1700 && lineNo <= 1960 && /const\s+candidateOtp\s*=\s*String\(b\.otp/.test(line)) {
      // Replace current candidateOtp line with nothing (remove it)
      // Then: find "if (!candidateOtp) { ... return; }" block -> skip all these lines
      // Also skip OTP validation section (decryptAndVerifyOtp calls + context binding)
      // Approach: output "// OTP removed - PIN only flow" placeholder (skip candidateOtp line, skip OTP if block)
      // Skip the current line (candidateOtp declaration) - do not push
      changed++;
      i++;
      // Continue with normal processing; downstream edits below will handle OTP checks
      continue;
    }

    if (lineNo >= 1700 && lineNo <= 1960 && /if\s*\(\s*!candidateOtp\s*\)/.test(line)) {
      // Skip entire if block (open brace -> matching close). The block usually spans ~4 lines: if (...) { res.status(400)... return; }
      let depth = 0;
      do {
        const cur = lines[i];
        const opens = (cur.match(/\{/g) || []).length;
        const closes = (cur.match(/\}/g) || []).length;
        depth += opens - closes;
        // do not push
        if (depth <= 0 && i > 0 && /^\s*\}\s*$/.test(cur)) { i++; break; }
        i++;
      } while (i < lines.length && depth > 0);
      changed++;
      continue;
    }

    // Change OTP-required error on transferPin check: remove "alongside the OTP" text
    if (lineNo >= 1700 && lineNo <= 1960 && /Transfer PIN \(Transaction Code\) is required alongside the OTP/.test(line)) {
      out.push('      res.status(400).json({ error: "Transfer PIN (Transaction Code) is required to authorize this transfer." });');
      changed++;
      i++;
      continue;
    }

    if (lineNo >= 1700 && lineNo <= 1960 && /Invalid Transfer PIN\. Please re-enter your Transaction Code alongside the email OTP\./.test(line)) {
      out.push('      res.status(401).json({ error: "Invalid Transfer PIN. Please re-enter your Transaction Code." });');
      changed++;
      i++;
      continue;
    }

    // Remove OTP decrypt block: lines starting with "// Two-step OTP verification: ..." through context binding checks
    if (lineNo >= 1700 && lineNo <= 1960 && /\/\/\s*Two-step OTP verification/.test(line)) {
      // Skip until we reach "// TRANSFER CONTEXT BINDING" check end (last "Please restart the transfer process." error for boundToEmail)
      // To be safe: skip until line right before the account status check block (line with "const senderAccount = senderDoc?.account || {};")
      while (i < lines.length) {
        const cur = lines[i];
        if (/const\s+senderAccount\s*=\s*senderDoc\?\.account\s*\|\|\s*\{\}/.test(cur)) break;
        i++;
      }
      // Note: we intentionally do NOT push lines we iterated over - thus removing entire OTP checks
      changed++;
      continue;
    }

    // /api/customer/transfer/execute endpoint (lines ~1955+): same OTP removal
    if (lineNo >= 1950 && lineNo <= 2200 && /const\s+candidateOtp\s*=\s*String\(b\.otp\s*\|\|\s*b\.otpCode/.test(line)) {
      changed++;
      i++; // skip candidateOtp declaration line entirely
      continue;
    }

    if (lineNo >= 1950 && lineNo <= 2200 && /if\s*\(\s*!candidateOtp\s*\)\s*\{/.test(line)) {
      // skip entire if block same way as before
      let depth = 0;
      do {
        const cur = lines[i];
        const opens = (cur.match(/\{/g) || []).length;
        const closes = (cur.match(/\}/g) || []).length;
        depth += opens - closes;
        if (depth <= 0 && i > 0 && /^\s*\}\s*$/.test(cur)) { i++; break; }
        i++;
      } while (i < lines.length && depth > 0);
      changed++;
      continue;
    }

    // execute endpoint: remove OTP decrypt + sequence check + context binding
    if (lineNo >= 1950 && lineNo <= 2200 && /const\s+storedOtpRecord\s*=\s*senderDoc\?\.security\?\.transferOtp;/.test(line)) {
      // skip until line with "const senderAccount = senderDoc?.account || {};"
      while (i < lines.length) {
        const cur = lines[i];
        if (/const\s+senderAccount\s*=\s*senderDoc\?\.account\s*\|\|\s*\{\}/.test(cur)) break;
        i++;
      }
      changed++;
      continue;
    }

    // execute endpoint: also remove the storedOtpRecord PIN-verified check section right BEFORE storedOtpRecord decrypt check
    // (already handled above by skipping to senderAccount line)

    // Also: on /api/customer/transfer final commit block, clear OTP is still fine to keep (resets OTP field to safe values).
    // The "writeOtpAuditRecord" import usage must stay, but the audit-record WRITE calls are now dead code since we replaced request-otp endpoint entirely.
    // -> no need to remove them, harmless.

    // Final: change the error message for request-otp endpoint's catch clause (from "initiate transfer authorization" -> "verify transfer authorization")
    if (/Unable to initiate transfer authorization\./.test(line)) {
      out.push(line.replace("Unable to initiate transfer authorization.", "Unable to verify transfer authorization."));
      i++;
      changed++;
      continue;
    }

    // For the /api/customer/transfer OTP-requirement line, also need to fix on execute endpoint.
    // Transfer PIN check on execute endpoint line currently says "required to execute this transfer" — keep it, that's fine.

    out.push(line);
    i++;
  }

  const result = out.join("\n");
  if (changed > 0) {
    fs.writeFileSync(INDEX, result, "utf8");
    console.log(`index.js patched (${changed} change blocks). Lines: ${lines.length} -> ${out.length}`);
  } else {
    console.log("index.js: NO CHANGES APPLIED (anchors not matched). Aborting patching.");
    process.exitCode = 1;
  }
}

// ---------- Patch auth-session.js ----------
{
  const src = fs.readFileSync(AUTH, "utf8");

  // Strategy: do string-based targeted replacements of the flow to collapse OTP out.
  let result = src;
  let changes = 0;

  // Replacement 1: showCombinedPinAndOtpDialog renderPinOtpBody introductory text - strip OTP mentions
  const oldIntro = `Enter your <strong>Transfer PIN</strong> (Transaction Code) below and tap
                <strong>Send Verification Code</strong>. A 6-digit OTP will be delivered exclusively to your admin-registered email address.
                After receiving the code, enter it alongside your PIN and tap
                <strong>Authorize Transfer</strong>.`;
  const newIntro = `Enter your <strong>Transfer PIN</strong> (Transaction Code) below and tap
                <strong>Proceed to Confirmation</strong>. You will then review the transfer details before completing the disbursement.`;
  if (result.includes(oldIntro)) {
    result = result.split(oldIntro).join(newIntro);
    changes++;
  } else {
    console.log("WARNING: auth-session.js intro anchor not matched");
  }

  // Replacement 2: Disable PIN input readonly logic (only apply readonly on old otpSent condition). Since otpSent will never be used again, keep PIN always editable on PIN screen. -> Keep current PIN editable (renderPinOtpBody always shows PIN editable). It already becomes readonly on !otpSent which is false — actually we want PIN always editable on PIN phase. Since we're jumping from phase=pin -> confirm, no issues.

  // Replacement 3: Remove OTP input block branch from renderPinOtpBody. In renderPinOtpBody: ${!otpSent ? "" : ` [entire OTP input branch] `}
  // We need to remove the OTP input completely; renderPinOtpBody only shows PIN input ever.
  // Replace the whole conditional OTP branch with empty string always.
  const otpBranchPattern = `\${!otpSent ? "" : \`
                <div style="margin: 14px 0 10px; padding: 12px 14px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; color:#065f46; font-size:13px; line-height:1.6;">
                  A verification code has been sent to your admin-registered email address:
                  <strong style="display:inline-block; margin-left:4px;">\${escapeHtml(sentMaskedEmail || "your registered email")}</strong>
                  <small style="display:block; margin-top:4px; color:#047857;">Code valid for 15 minutes. Check your inbox (and spam folder).</small>
                </div>
                <div>
                  <label for="vt-otp-input" style="display:block; text-align:left; font-size:12px; font-weight:700; color:#475569; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:6px;">
                    6-Digit Email Verification Code (OTP)
                  </label>
                  <input
                    id="vt-otp-input"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="6"
                    autocomplete="one-time-code"
                    placeholder="• • • • • •"
                    value="\${escapeHtml(otpValue)}"
                    class="swal2-input"
                    style="display:block; width:100%; height:54px; padding:8px 12px; box-sizing:border-box; text-align:center; letter-spacing:12px; font-size:28px; font-weight:900; border:1px solid #cbd5e1; border-radius:10px;"
                  />
                </div>
              \`}`;
  if (result.includes(otpBranchPattern)) {
    result = result.split(otpBranchPattern).join("");
    changes++;
  } else {
    console.log("WARNING: auth-session.js OTP branch pattern not matched (whitespace diff?), attempting looser fallback.");
    // Looser replacement: remove the whole branch by regex between ${!otpSent ? "" : ` and closing `} for OTP input section
    const otpLoose = /\$\{!otpSent \? "" : [`][\s\S]*?[`]\}/m;
    const firstHit = result.match(otpLoose);
    if (firstHit) {
      result = result.replace(otpLoose, "");
      changes++;
    } else {
      console.log("WARNING: looser OTP removal also failed");
    }
  }

  // Replacement 4: Change Swal button texts (Send Verification Code -> Proceed to Confirmation, Authorize Transfer -> Review & Confirm)
  // Located in openConfirmOrPinOtp() pin-otp branch: confirmButtonText: otpSent ? "Authorize Transfer" : "Send Verification Code"
  const oldBtnText = `confirmButtonText: otpSent ? "Authorize Transfer" : "Send Verification Code",`;
  const newBtnText = `confirmButtonText: "Proceed to Confirmation",`;
  if (result.includes(oldBtnText)) {
    result = result.split(oldBtnText).join(newBtnText);
    changes++;
  }
  const oldTitle = `title: otpSent ? "Authorize Transfer" : "Initiate Transfer Authorization",`;
  const newTitle = `title: "Transfer Authorization",`;
  if (result.includes(oldTitle)) {
    result = result.split(oldTitle).join(newTitle);
    changes++;
  }
  const oldFocus = `const focus = extraOpts.focus || (otpSent ? "vt-otp-input" : "vt-pin-input");`;
  const newFocus = `const focus = extraOpts.focus || "vt-pin-input";`;
  if (result.includes(oldFocus)) {
    result = result.split(oldFocus).join(newFocus);
    changes++;
  }

  // Replacement 5: showSending() function -> change title + button text
  const oldShowSending = `Swal.update({
            html: renderPinOtpBody({ sending: true }),
            title: "Sending Verification Code...",
            confirmButtonText: "Please wait...",
            showCloseButton: false,
            allowOutsideClick: false
          });`;
  const newShowSending = `Swal.update({
            html: renderPinOtpBody({ sending: true }),
            title: "Verifying Transfer PIN...",
            confirmButtonText: "Please wait...",
            showCloseButton: false,
            allowOutsideClick: false
          });`;
  if (result.includes(oldShowSending)) {
    result = result.split(oldShowSending).join(newShowSending);
    changes++;
  }

  // Replacement 6: Rewrite onSendOtp() handler -> on success, jump DIRECTLY to confirm phase (skip OTP input), no resend button injection, no otpSent=true, phase pin->confirm
  // Anchor text that uniquely identifies the onSendOtp success branch:
  //   otpSent = true;
  //   phase = "otp";
  //   sentMaskedEmail = body.maskedEmail || "your admin-registered email address";
  //   Swal.hideLoading();
  //   openConfirmOrPinOtp();
  //   setTimeout(() => { ... resend button injection ... }, 50);
  const oldSuccess = `            otpSent = true;
            phase = "otp";
            sentMaskedEmail = body.maskedEmail || "your admin-registered email address";
            Swal.hideLoading();
            openConfirmOrPinOtp();
            setTimeout(() => {
              try {
                const resendSpan = document.createElement("div");
                resendSpan.id = "vt-resend-wrap";
                resendSpan.style.textAlign = "center";
                resendSpan.style.margin = "14px 0 0";
                resendSpan.innerHTML = \`<a id="vt-resend-btn" href="javascript:void(0)" style="color:#475569;font-size:12px;text-decoration:underline;">Didn't get the email? Resend verification code</a>\`;
                const wrap = Swal.getHtmlContainer();
                if (wrap) wrap.appendChild(resendSpan);
                const rb = document.getElementById("vt-resend-btn");
                if (rb) rb.onclick = async () => { try { await onSendOtp(); } catch (_) {} };
              } catch (_) {}
            }, 50);`;
  const newSuccess = `            otpSent = true;
            confirmedOtp = "000000";
            phase = "confirm";
            sentMaskedEmail = null;
            Swal.hideLoading();
            openConfirmOrPinOtp();`;
  if (result.includes(oldSuccess)) {
    result = result.split(oldSuccess).join(newSuccess);
    changes++;
  } else {
    console.log("WARNING: onSendOtp success block NOT matched (whitespace diff expected). Attempting line-anchor replacement...");
    // Fallback: find phase = "otp"; line, replace with phase = "confirm"
    result = result.replace(
      /phase\s*=\s*"otp";\s*\n\s*sentMaskedEmail\s*=\s*body\.maskedEmail[\s\S]{0,400}?if\s*\(rb\)\s*rb\.onclick\s*=\s*async\s*\(\)\s*=>\s*\{\s*try\s*\{\s*await\s*onSendOtp\(\);\s*\}\s*catch\s*\(\s*_\)\s*\{\}\s*\};\s*\n\s*\}\s*catch\s*\(\s*_\)\s*\{\}\s*\n?\s*\}\s*,?\s*\n?\s*\}\s*,?\s*50\);/m,
      (_m) => {
        changes++;
        return `phase = "confirm";
            confirmedOtp = "000000";
            sentMaskedEmail = null;
            Swal.hideLoading();
            openConfirmOrPinOtp();`;
      }
    );
  }

  // Replacement 7: onAuthorize function -> make it a no-op jump to phase confirm. Since we now go pin->confirm directly, onAuthorize is dead, but keep it safe for fallback paths:
  // Actually, if any code still calls onAuthorize, it would currently require otp regex /^\d{6}$/.test(otpVal) fail since user never enters OTP. Fix: make onAuthorize pass through.
  const oldOnAuthRegex = `if (!/^\d{6}$/.test(otpVal)) {
// #region debug-point C:onAuth-regexfail
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__onAuthorize__regexFail",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
            openConfirmOrPinOtp({ otpValue: otpVal, sendError: "Please enter the 6 numeric digits of the email verification code." });
            return;
          }`;
  const newOnAuthRegex = `confirmedOtp = "000000";
          phase = "confirm";
          openConfirmOrPinOtp();
          return;`;
  if (result.includes(oldOnAuthRegex)) {
    result = result.split(oldOnAuthRegex).join(newOnAuthRegex);
    changes++;
  } else {
    // Looser replacement: force onAuthorize to skip OTP
    result = result.replace(
      /\/\/\s*#region debug-point C:onAuth-entry[\s\S]{0,1200}?openConfirmOrPinOtp\(\);\s*\n?\s*\}\s*catch\s*\(outerErr\)\s*\{/m,
      (m) => {
        changes++;
        return `phase = "confirm";
          confirmedOtp = "000000";
          openConfirmOrPinOtp();
          } catch (outerErr) {`;
      }
    );
  }

  // Replacement 8: onConfirmFinal() - check: "if (!/^\d{6}$/.test(confirmedOtp)) {" -> since we now set confirmedOtp="000000" in new flow this passes; no need to remove, leave for safety.
  // Actually safer: replace check with just confirmedOtp must be string to prevent future edge failures:
  const oldFinalOtpCheck = `if (!/^\d{6}$/.test(confirmedOtp)) {
            phase = "otp";
            openConfirmOrPinOtp({ sendError: "OTP must be re-entered. Please restart the authorization flow." });
            return;
          }`;
  const newFinalOtpCheck = `if (typeof confirmedOtp !== "string" || confirmedOtp.length < 1) {
            phase = "pin";
            openConfirmOrPinOtp({ sendError: "Transfer PIN must be verified first. Please restart the authorization flow." });
            return;
          }`;
  if (result.includes(oldFinalOtpCheck)) {
    result = result.split(oldFinalOtpCheck).join(newFinalOtpCheck);
    changes++;
  }

  // Replacement 9: safeResolve return (still returns { transferPin, otp }) and processTransfer caller checks.
  // Fix safeResolve return to also support otp being empty? -> Keep returning { otp: confirmedOtp } because server now ignores otp field.

  // Replacement 10: Non-Swal fallback (window.prompt) path at lines ~2160-2210. Currently does OTP request + prompt for OTP.
  const oldFallbackStart = `// Non-SweetAlert fallback: prompt twice (same order — PIN then OTP) since browsers
    // cannot show combined PIN+OTP form with window.prompt alone.
    const pv1 = window.prompt(
      "Enter your Transfer PIN (Transaction Code).\\n\\nAfter you tap OK, a 6-digit OTP will be emailed to your admin-registered email address.\\n\\nTransfer PIN:",
      ""
    );
    if (pv1 === null) return null;
    const pinVal = String(pv1 || "").trim();
    if (!pinVal || pinVal.length < 6) {
      window.alert("Transfer PIN must be at least 6 characters. Transfer cancelled.");
      return null;
    }

    // Dispatch OTP request with PIN
    let resp, body;
    try {
      resp = await fetch("/api/customer/transfer/request-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          toAccountNumber: toAccountNumber,
          toEmail: toEmail,
          amount: amount,
          currency: currency,
          memo: memo,
          transferPin: pinVal,
          transferCode: pinVal
        })
      });
      try { body = await resp.json(); } catch (_) { body = {}; }
      if (!resp.ok || !body.ok) {
        window.alert((body && body.error) || "Failed to send verification code.");
        return null;
      }
    } catch (err) {
      window.alert((err && err.message) || "Network error.");
      return null;
    }
    const maskedEmail = body.maskedEmail || "your admin-registered email";
    const pv2 = window.prompt(
      \`A 6-digit verification code has been sent to \${maskedEmail}.\\n\\nValid for 15 minutes.\\n\\nEnter the 6-digit OTP:\`,
      ""
    );
    if (pv2 === null) return null;
    const otpVal = String(pv2 || "").trim();
    if (!/^\d{6}$/.test(otpVal)) {
      window.alert("OTP must be exactly 6 digits. Transfer cancelled.");
      return null;
    }
    return { transferPin: pinVal, otp: otpVal };`;
  const newFallback = `// Non-SweetAlert fallback: prompt for Transfer PIN only (OTP removed, PIN-only auth).
    const pv1 = window.prompt(
      "Enter your Transfer PIN (Transaction Code) to authorize this transfer.\\n\\nTransfer PIN:",
      ""
    );
    if (pv1 === null) return null;
    const pinVal = String(pv1 || "").trim();
    if (!pinVal || pinVal.length < 6) {
      window.alert("Transfer PIN must be at least 6 characters. Transfer cancelled.");
      return null;
    }
    let resp, body;
    try {
      resp = await fetch("/api/customer/transfer/request-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          toAccountNumber: toAccountNumber,
          toEmail: toEmail,
          amount: amount,
          currency: currency,
          memo: memo,
          transferPin: pinVal,
          transferCode: pinVal
        })
      });
      try { body = await resp.json(); } catch (_) { body = {}; }
      if (!resp.ok || !body.ok) {
        window.alert((body && body.error) || "Transfer PIN verification failed.");
        return null;
      }
    } catch (err) {
      window.alert((err && err.message) || "Network error.");
      return null;
    }
    return { transferPin: pinVal, otp: "000000" };`;
  if (result.includes(oldFallbackStart)) {
    result = result.split(oldFallbackStart).join(newFallback);
    changes++;
  } else {
    console.log("WARNING: fallback prompt block not matched (whitespace-sensitive). Attempting line-anchor fallback removal.");
    // Looser: remove the whole second prompt + otp validation
    result = result.replace(
      /\/\/ Non-SweetAlert fallback: prompt twice \(same order — PIN then OTP\)[\s\S]{0,2200}?return\s*\{\s*transferPin:\s*pinVal,\s*otp:\s*otpVal\s*\};/m,
      (_m) => {
        changes++;
        return newFallback;
      }
    );
  }

  // Replacement 11: processTransfer at caller - line checks "if (!transferPin || !/^\d{6}$/.test(otp))" must pass now.
  const oldProcCheck = `        transferPin = String(combined.transferPin || "").trim();
        otp = String(combined.otp || "").trim();
        if (!transferPin || !/^\d{6}$/.test(otp)) {
          throw new Error("Transfer PIN and 6-digit OTP are both required. Please restart the transfer process.");
        }`;
  const newProcCheck = `        transferPin = String(combined.transferPin || "").trim();
        otp = String(combined.otp || "").trim();
        if (!transferPin) {
          throw new Error("Transfer PIN is required. Please restart the transfer process.");
        }`;
  if (result.includes(oldProcCheck)) {
    result = result.split(oldProcCheck).join(newProcCheck);
    changes++;
  } else {
    result = result.replace(
      /transferPin\s*=\s*String\(combined\.transferPin\s*\|\|\s*""\)\.trim\(\);\s*\n\s*otp\s*=\s*String\(combined\.otp\s*\|\|\s*""\)\.trim\(\);\s*\n\s*if\s*\(\s*!transferPin\s*\|\|\s*!\/\^\\d\{6\}\$\/\.test\(otp\)\)\s*\{[\s\S]*?\n\s*\}/m,
      (_m) => {
        changes++;
        return newProcCheck;
      }
    );
  }

  // Replacement 12: Cancel button at phase === "confirm" currently goes back to phase otp (Back to OTP). Change back button on confirm to go back to PIN:
  const oldCancelBack = `                if (phase === "confirm") {
                  phase = "otp";
                  openConfirmOrPinOtp({ focus: "vt-otp-input" });
                  return;
                }
                safeResolve(null);`;
  const newCancelBack = `                if (phase === "confirm") {
                  phase = "pin";
                  confirmedOtp = "";
                  otpSent = false;
                  openConfirmOrPinOtp({ focus: "vt-pin-input" });
                  return;
                }
                safeResolve(null);`;
  if (result.includes(oldCancelBack)) {
    result = result.split(oldCancelBack).join(newCancelBack);
    changes++;
  }
  // Also cancel button text: "← Back to OTP" -> "← Back to PIN"
  const oldCancelBtn = `cancelButtonText: "← Back to OTP",`;
  const newCancelBtn = `cancelButtonText: "← Back to PIN",`;
  if (result.includes(oldCancelBtn)) {
    result = result.split(oldCancelBtn).join(newCancelBtn);
    changes++;
  }
  // Also change keydown handler Enter-branches on phase "otp" -> currently calls onAuthorize. Change phase "otp" to jump to onConfirmFinal:
  // Instead of: if (phase === "otp") await onAuthorize(); ... phase === confirm
  const oldKeydown = `                if (phase === "pin") {
                  if (!otpSent) await onSendOtp();
                } else if (phase === "otp") {
                  await onAuthorize();
                } else if (phase === "confirm") {
                  await onConfirmFinal();
                }`;
  const newKeydown = `                if (phase === "pin") {
                  if (!otpSent) await onSendOtp();
                } else if (phase === "otp") {
                  phase = "confirm";
                  confirmedOtp = "000000";
                  await onConfirmFinal();
                } else if (phase === "confirm") {
                  await onConfirmFinal();
                }`;
  if (result.includes(oldKeydown)) {
    result = result.split(oldKeydown).join(newKeydown);
    changes++;
  }
  // Also fix handleConfirmClick dispatch (exact same branches as keydown)
  const oldConfirmDispatch = `                if (phase === "pin") {
                  if (!otpSent) await onSendOtp();
                } else if (phase === "otp") {
                  await onAuthorize();
                } else if (phase === "confirm") {
                  await onConfirmFinal();
                }`;
  // (oldConfirmDispatch is identical text. Need second match.)
  if (result.includes(oldKeydown) && result.split(oldKeydown).length - 1 >= 2) {
    // Two identical occurrences. Replace first one with keydown version, second one via index.
    // Since we've already done first replacement (keydown), now look for the second one in handleConfirmClick.
    // Find by search AFTER first occurrence index.
    const i1 = result.indexOf(newKeydown);
    if (i1 >= 0) {
      const before = result.slice(0, i1 + newKeydown.length);
      const after = result.slice(i1 + newKeydown.length);
      if (after.includes(oldConfirmDispatch)) {
        result = before + after.split(oldConfirmDispatch).join(newKeydown);
        changes++;
      }
    }
  }

  // Replacement 13: confirm body intro text currently says "OTP verified successfully. ... integrity-sealed" -> change to "Transfer PIN verified successfully..."
  const oldConfirmIntro = `<div style="margin-left:28px;">OTP verified successfully. Please carefully review the transfer details below and click <strong>Confirm Transfer</strong> to finalize the disbursement. All displayed values are integrity-sealed against tampering.</div>`;
  const newConfirmIntro = `<div style="margin-left:28px;">Transfer PIN verified successfully. Please carefully review the transfer details below and click <strong>Confirm Transfer</strong> to finalize the disbursement. All displayed values are integrity-sealed against tampering.</div>`;
  if (result.includes(oldConfirmIntro)) {
    result = result.split(oldConfirmIntro).join(newConfirmIntro);
    changes++;
  }
  const oldSealedText = `Transfer parameters have been cryptographically sealed at OTP-validation time and cannot be altered on this page.`;
  const newSealedText = `Transfer parameters have been cryptographically sealed at PIN-verification time and cannot be altered on this page.`;
  if (result.includes(oldSealedText)) {
    result = result.split(oldSealedText).join(newSealedText);
    changes++;
  }

  // Replacement 14: Resend buttons in attachDirectButtonHandlers + delegated click handlers are fine to leave dead; since OTP div never gets rendered, resendBtn querySelector returns null.

  // Replacement 15: "Processing transfer..." Swal text says "Verifying Transfer PIN + OTP" -> fix
  const oldProcText = `text: "Verifying Transfer PIN + OTP and processing transfer...",`;
  const newProcText = `text: "Verifying Transfer PIN and processing transfer...",`;
  if (result.includes(oldProcText)) {
    result = result.split(oldProcText).join(newProcText);
    changes++;
  }
  // Also the comment above it: "verifies BOTH Transfer PIN (independent hash match — combined auth) and 6-digit encrypted OTP..." -> simplify
  const oldProcComment = `/*
       * The server verifies BOTH Transfer PIN (independent hash match — combined
       * auth) and 6-digit encrypted OTP (15-minute TTL + context-bound) and
       * atomically adjusts balances.
       */`;
  const newProcComment = `/*
       * The server verifies the Transfer PIN (independent hash match) and
       * atomically adjusts balances.
       */`;
  if (result.includes(oldProcComment)) {
    result = result.split(oldProcComment).join(newProcComment);
    changes++;
  }

  // --- also, the first dialog title at SweetAlert fallback branch (processTransfer opening comment):
  const oldShowCombinedComment = `/*
       * Show COMBINED Transfer PIN + OTP authorization dialog (single unified prompt
       * with two auth phases inside one dialog: Send OTP (with PIN) -> Enter OTP (same
       * dialog) -> Authorize. If processTransfer already has both (retries from caller)
       * use the provided values.
       */`;
  const newShowCombinedComment = `/*
       * Show Transfer PIN authorization dialog (PIN verify -> confirm review).
       * (OTP removed in PIN-only flow.)
       */`;
  if (result.includes(oldShowCombinedComment)) {
    result = result.split(oldShowCombinedComment).join(newShowCombinedComment);
    changes++;
  }

  if (changes > 0) {
    fs.writeFileSync(AUTH, result, "utf8");
    console.log(`auth-session.js patched (${changes} change blocks).`);
  } else {
    console.log("auth-session.js: NO CHANGES APPLIED (anchors not matched). Aborting.");
    process.exitCode = 1;
  }
}

process.exit(process.exitCode || 0);
