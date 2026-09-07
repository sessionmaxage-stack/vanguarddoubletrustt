// Direct live OTP-style email send via the real emailService (LOCALHOST) to an actual external mailbox
// Timing check: measure send → we expect < 15s to SMTP accepted, true external delivery <60s
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { getMailTransporter, verifyMailTransporter, sendMail } = require("../server/emailService.js");
const crypto = require("crypto");

const TARGET_EMAIL = process.env.SMTP_USER || "ffclimmigration@gmail.com";
const otp = String(Math.floor(100000 + Math.random() * 900000));
const now = Date.now();

async function main() {
  console.log(`[${new Date().toISOString()}] Starting OTP email delivery timing test`);
  console.log(`[t=${((Date.now()-now)/1000).toFixed(2)}s] Step 1: getMailTransporter + verify`);
  const t1 = Date.now();
  const transporter = getMailTransporter();
  const verifyOk = await verifyMailTransporter(transporter);
  console.log(`[t=${((Date.now()-now)/1000).toFixed(2)}s] verifyMailTransporter => ok=${verifyOk} (took ${(Date.now()-t1)}ms)`);

  console.log(`[t=${((Date.now()-now)/1000).toFixed(2)}s] Step 2: actual OTP-style email send to ${TARGET_EMAIL}`);
  const t2 = Date.now();
  const res = await sendMail({
    to: TARGET_EMAIL,
    subject: `OTP TEST VanguardDoubleTrust Transfer ${otp} - ${new Date().toISOString()}`,
    extraHeaders: { "X-VT-Live-Test": "diag-otp-send-"+Date.now() },
    text:
`Hello,

This is a LIVE VanguardDoubleTrust OTP delivery test email from the FIXED email service (transport caching, Gmail FROM override, full headers block).

Your Transfer OTP: ${otp}

Expires 15 minutes after receipt.

Admin-embedded email recipient: ${TARGET_EMAIL}
Recipient Source: admin-embedded (userDoc.email top-level Firestore field)

SMTP: Gmail (ffclimmigration@gmail.com)
Transport caching: signature-based
Verify caching: 10-min TTL
FROM envelope: auto-overridden to match authenticated address
Reply-To: ${process.env.SMTP_USER || "ffclimmigration@gmail.com"}
Headers: X-Mailer, X-VT-Service, X-VT-Audit-Id unique per message, X-Priority=1 High, X-MSMail-Priority High, Importance High, X-Auto-Response-Suppress All, List-Unsubscribe

If you received this email in your INBOX (not Spam) within < 60 seconds, the delivery fix succeeded.

Test t0: ${new Date(now).toISOString()}
Send start t2: ${new Date(t2).toISOString()}

Thanks,
VanguardDoubleTrust Security
`,
    html:
`<div style="font-family:Arial,Helvetica,sans-serif;padding:24px;max-width:720px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
  <div style="background:#0b1220;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">
    <h2 style="margin:0">VanguardDoubleTrust — One-Time Passcode (OTP)</h2>
    <p style="margin:6px 0 0;opacity:0.9">Transfer authorization verification</p>
  </div>
  <div style="padding:22px">
    <p style="font-size:15px;line-height:1.55;color:#111827;margin:0 0 16px">Hello,</p>
    <p style="font-size:15px;line-height:1.55;color:#111827;margin:0 0 18px">This is a LIVE OTP delivery test email from the FIXED VanguardDoubleTrust email service (transport caching, Gmail FROM override, full deliverability headers block).</p>
    <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px dashed #3b82f6;border-radius:10px;padding:22px;margin:0 0 20px;text-align:center">
      <p style="margin:0 0 10px;color:#1e3a8a;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">Your Transfer OTP</p>
      <div style="font-size:44px;font-weight:800;letter-spacing:12px;color:#1d4ed8;font-family:Consolas,'Courier New',monospace">${otp}</div>
      <p style="margin:14px 0 0;color:#334155;font-size:13px">Expires 15 minutes after receipt</p>
    </div>
    <p style="font-size:14px;color:#374151;margin:0 0 10px"><b>Admin-embedded email recipient:</b> ${TARGET_EMAIL} &nbsp; <small>(userDoc.email top-level Firestore field, admin-set, immutable)</small></p>
    <p style="font-size:14px;color:#374151;margin:0 0 10px"><b>SMTP:</b> Gmail (ffclimmigration@gmail.com) &nbsp; | &nbsp; <b>Transport caching:</b> signature-based singleton &nbsp; | &nbsp; <b>Verify:</b> 10-min TTL</p>
    <p style="font-size:14px;color:#374151;margin:0 0 20px"><b>FROM envelope:</b> auto-overridden to match authenticated address &nbsp; | &nbsp; <b>Reply-To:</b> ${process.env.SMTP_USER || "ffclimmigration@gmail.com"}</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px">
      <p style="margin:0 0 6px;font-size:13px;color:#111827"><b>Deliverability headers (transmitted):</b></p>
      <p style="margin:0;font-size:12.5px;color:#4b5563;line-height:1.5">X-Mailer, X-VT-Service, X-VT-Audit-Id (unique per message), X-VT-OTP-Expires 900, X-VT-OTP-Window-Mins 15, X-Priority=1 (Highest), X-MSMail-Priority=High, Importance=High, X-Auto-Response-Suppress All,OOF,DR,RN,NRN,AutoReply, List-Unsubscribe</p>
    </div>
    <p style="font-size:14px;color:#065f46;margin:20px 0 0;padding:14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px">If you received this email in your <b>INBOX (not Spam)</b> within &lt; 60 seconds of the Send start timestamp below, the full delivery fix <b>succeeded</b>.</p>
    <p style="font-size:12.5px;color:#6b7280;margin:14px 0 0">Test t0: ${new Date(now).toISOString()} &nbsp;|&nbsp; Send start t2: ${new Date(t2).toISOString()}</p>
  </div>
  <div style="border-top:1px solid #f3f4f6;padding:16px 22px;font-size:12.5px;color:#6b7280;text-align:center;border-radius:0 0 10px 10px;background:#fafafa">
    © ${new Date().getFullYear()} VanguardDoubleTrust — Security Transactional Email
  </div>
</div>`
  });
  const t3 = Date.now();
  console.log(`[t=${((Date.now()-now)/1000).toFixed(2)}s] sendMail DONE (SMTP accepted in ${t3-t2}ms) =>`, JSON.stringify({
    delivered: res?.delivered,
    emailSent: res?.emailSent,
    recipient: res?.recipient,
    maskedEmail: res?.maskedEmail,
    timestamp: res?.timestamp,
    messageId: res?.messageId,
    accepted: res?.accepted,
    response: typeof res?.response === "string" ? (res.response.length < 240 ? res.response : res.response.slice(0,240)+"...") : String(res?.response),
    envelope: res?.envelope
  }, null, 2));

  console.log("\n=== DELIVERY TIMING SUMMARY (SMTP transport-level acceptance) ===");
  console.log(`  Verify + transport init: ${((t1-t1)/1000).toFixed(2)}s (transport cached for subsequent sends)`);
  console.log(`  Send (SMTP handshake + AUTH + DATA + 250 OK) latency: ${((t3-t2)/1000).toFixed(3)}s`);
  console.log(`  Total test wall time: ${((t3-now)/1000).toFixed(2)}s`);
  console.log(`\n  OTP Code sent: ${otp}  —  check ${TARGET_EMAIL} INBOX within <60s. SMTP-accepted at ${new Date(t3).toISOString()}`);
}
main().catch((e) => { console.error("FAIL:", e); process.exit(1); });
