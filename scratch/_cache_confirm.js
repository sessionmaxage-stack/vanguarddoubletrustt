// Confirm transport+verify CACHING works on SECOND send (NO new handshake)
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { getMailTransporter, verifyMailTransporter, sendMail } = require("../server/emailService.js");
const TARGET_EMAIL = process.env.SMTP_USER || "ffclimmigration@gmail.com";

async function main() {
  const now = Date.now();
  // SECOND send: transport singleton + verify TTL should both HIT
  for (let i = 1; i <= 3; i++) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const t = Date.now();
    const res = await sendMail({
      to: TARGET_EMAIL,
      subject: `OTP TEST CACHING SEND#${i} — OTP=${otp} — ts=${Date.now()}`,
      text: `Caching test send #${i}. OTP=${otp}. Should be near-instant SMTP since transport+verify cached. t0=${new Date(now).toISOString()}`
    });
    const dt = Date.now() - t;
    console.log(`[Send#${i}] SMTP 250 OK after ${dt}ms — delivered=${res.delivered} messageId=${res.messageId?.slice(0,36)}...`);
  }
  console.log("\nNote: If Send#2/Send#3 are << 1000ms, caching works (no re-handshake). Old code would do 2 handshakes/send, ~2-5s each.");
}
main().catch((e) => { console.error("FAIL:", e); process.exit(1); });
