// Verify our new Render parity checks contain delegation root fix
const https = require("https");

function h(method, pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: "vanguarddoubletrustt.onrender.com", port: 443, method, path: pathname, headers: { "Accept": "text/html,application/javascript" } },
      (res) => { let d=""; res.on("data", c=>d+=c); res.on("end", ()=>resolve({status:res.statusCode, body:d})); }
    );
    req.on("error", reject);
    req.end();
  });
}

(async () => {
  const r = await h("GET", "/customer/assets/js/auth-session.js");
  const code = String(r.body || "");
  console.log(`status=${r.status} bytes=${code.length}`);
  console.log("has showCombinedPinAndOtpDialog:", code.includes("showCombinedPinAndOtpDialog"));
  console.log("has bindDelegatedHandlers (delegation root fix NEW):", code.includes("bindDelegatedHandlers"));
  console.log("has delegated flag guard:", code.includes("if (delegated || !popupEl) return;"));
  console.log("has Enter keydown handler (NEW):", code.includes("ev.key === \"Enter\""));
  console.log("has resend-btn via closest delegation (NEW):", code.includes("#vt-resend-btn"));
  console.log("has showCancelButton=true:", /showCancelButton\s*:\s*true/gi.test(code));
  console.log("has confirm btn delegation .closest('.swal2-confirm'):", code.includes("closest('.swal2-confirm')"));
  console.log("has execute payload transferPin+transferCode+otp send:",
    /transferPin\s*:\s*transferPin,\s*\n?\s*transferCode\s*:\s*transferPin,\s*\n?\s*otp\s*:\s*otp/.test(code));
  console.log("");
  // also verify emailService on Render via simple call — we can see via GET /api/health (service runs, and SMTP status is in Render logs)
  console.log("Render static validation for event delegation fix — ALL should be true: delegation is what fixes the OTP-section-doesn't-render issue after Swal.update");
})();
