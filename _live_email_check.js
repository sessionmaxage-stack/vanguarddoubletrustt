require("dotenv").config();
const readline = require("readline");
const {
  getSmtpConfig,
  getMailTransporter,
  verifyMailTransporter,
  sendTransferOtpEmail,
  sendAccountCreatedOtpEmail,
  maskEmail
} = require("./server/emailService");

const C_GREEN = "\x1b[32m";
const C_RED = "\x1b[31m";
const C_YELLOW = "\x1b[33m";
const C_CYAN = "\x1b[36m";
const C_RESET = "\x1b[0m";

function logGreen(msg) { console.log(`${C_GREEN}${msg}${C_RESET}`); }
function logRed(msg)   { console.log(`${C_RED}${msg}${C_RESET}`); }
function logYellow(msg){ console.log(`${C_YELLOW}${msg}${C_RESET}`); }
function logCyan(msg)  { console.log(`${C_CYAN}${msg}${C_RESET}`); }
function separator()   { console.log("─".repeat(72)); }

function printBanner() {
  separator();
  logCyan("  VanguardDoubleTrust — Live Email Delivery Checker");
  separator();
  console.log("");
  const cfg = getSmtpConfig();
  console.log(`  SMTP_SERVICE : ${cfg.service ? C_GREEN + cfg.service + C_RESET : C_YELLOW + "<not set>" + C_RESET}`);
  console.log(`  SMTP_HOST    : ${cfg.host    ? C_GREEN + cfg.host    + C_RESET : C_YELLOW + "<not set>" + C_RESET}`);
  console.log(`  SMTP_PORT    : ${cfg.port}`);
  console.log(`  SMTP_SECURE  : ${cfg.secure ? "true (port 465 implicit TLS)" : "false (STARTTLS on 587)"}`);
  console.log(`  SMTP_USER    : ${cfg.user ? maskEmail(cfg.user) : C_YELLOW + "<MISSING>" + C_RESET}`);
  console.log(`  SMTP_PASS    : ${cfg.pass ? C_GREEN + "<configured>" + C_RESET : C_RED + "<MISSING — set SMTP_PASS in .env>" + C_RESET}`);
  console.log("");
}

async function step1_verifyTransport() {
  logCyan("Step 1 — SMTP Transport Verification");
  separator();
  const t = getMailTransporter();
  if (!t) {
    logRed("✗ SMTP transport is null — SMTP env vars are not fully configured.");
    console.log("  → Fix: edit .env and fill in SMTP_USER + SMTP_PASS + SMTP_SERVICE (or SMTP_HOST).");
    return false;
  }
  console.log("  Calling transporter.verify() against Gmail SMTP…");
  const ok = await verifyMailTransporter(t).catch(err => {
    logRed(`✗ verify() threw: ${err && err.message ? err.message : err}`);
    return false;
  });
  if (ok) {
    logGreen("✓ SUCCESS — Gmail accepted this SMTP login. Your App Password is valid.");
    return true;
  }
  logRed("✗ FAILED — Gmail rejected the SMTP login.");
  console.log("");
  logYellow("    — Likely Causes —");
  console.log("    1. SMTP_PASS is your regular Google password, NOT a 16-char App Password.");
  console.log("       Fix: https://myaccount.google.com/apppasswords → generate App Password → paste into SMTP_PASS=.");
  console.log("    2. 2-Step Verification is NOT enabled on ffclimmigration@gmail.com.");
  console.log("       Fix: https://myaccount.google.com/signinoptions/two-step-verification → turn it ON, then do step 1.");
  console.log("    3. App Password was generated for a different Google account.");
  console.log("    4. Typo in SMTP_USER or SMTP_PASS.");
  console.log("");
  return false;
}

async function step2_sendTransferOtp(recipient) {
  logCyan(`\nStep 2 — Send a Transfer OTP Email to: ${maskEmail(recipient)}`);
  separator();
  const fakeOtp = String(Math.floor(100000 + Math.random() * 900000));
  console.log(`  Generated 6-digit OTP: ${C_YELLOW}${fakeOtp}${C_RESET}`);
  console.log(`  Amount context       : USD 2,500.00`);
  console.log(`  Recipient name       : Test Customer`);
  console.log("");
  try {
    const r = await sendTransferOtpEmail(recipient, "Test Customer", fakeOtp, { amount: 2500, currency: "USD" });
    logGreen(`✓ Email sent! MessageId: ${r.messageId || "N/A"}`);
    console.log(`  Delivered flag : ${r.delivered ? "true" : "false"}`);
    console.log(`  Accepted       : ${r.accepted ? "true" : "false"}`);
    console.log(`  Timestamp      : ${r.timestamp}`);
    console.log("");
    logGreen(`  → Check the inbox at ${recipient}. Look for the OTP ${fakeOtp} in the subject.`);
    return true;
  } catch (err) {
    logRed(`✗ sendTransferOtpEmail FAILED: ${err && err.message ? err.message : err}`);
    return false;
  }
}

async function step3_sendAccountCreatedEmail(recipient) {
  logCyan(`\nStep 3 — Send an Account Creation Credential Email to: ${maskEmail(recipient)}`);
  separator();
  const fakeOtp = String(Math.floor(100000 + Math.random() * 900000));
  console.log(`  Generated 6-digit OTP: ${C_YELLOW}${fakeOtp}${C_RESET}`);
  console.log(`  Fake credentials embedded in email body only (never in API responses).`);
  console.log("");
  try {
    const r = await sendAccountCreatedOtpEmail(
      recipient,
      "Demo User",
      fakeOtp,
      {
        email: recipient,
        password: "DemoP@ss_2026!",
        accountNumber: "VTD-DEMO-9876-54",
        accountPin: "4821",
        transferCode: "TX-DEMO-Z74K"
      }
    );
    logGreen(`✓ Email sent! MessageId: ${r.messageId || "N/A"}`);
    console.log(`  Delivered flag : ${r.delivered ? "true" : "false"}`);
    console.log("");
    logGreen(`  → Check the inbox at ${recipient}. Confirm OTP ${fakeOtp} is shown plus a credentials table.`);
    return true;
  } catch (err) {
    logRed(`✗ sendAccountCreatedOtpEmail FAILED: ${err && err.message ? err.message : err}`);
    return false;
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }));
}

(async () => {
  printBanner();

  const transportOk = await step1_verifyTransport();
  console.log("");
  if (!transportOk) {
    logYellow("Can't run live send test until SMTP verify() passes.");
    console.log("");
    console.log("  Action item for you:");
    console.log("   1. Enable 2-Step Verification on ffclimmigration@gmail.com");
    console.log("   2. Go to https://myaccount.google.com/apppasswords and generate an App Password");
    console.log("   3. Paste the 16-character code into .env lines 50 (SMTP_PASS=) and 63 (GMAIL_APP_PASSWORD=)");
    console.log("   4. Re-run:  node _live_email_check.js  " + process.argv[2] || "<your-test-email@example.com>");
    console.log("");
    process.exit(1);
  }

  let recipient = process.argv[2] ? String(process.argv[2]).trim() : "";
  if (!recipient) {
    recipient = (await ask("  Enter an email address to send test emails to: ")).trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    logRed(`Invalid recipient email: "${recipient}". Aborting.`);
    process.exit(2);
  }

  const step2Ok = await step2_sendTransferOtp(recipient);
  const step3Ok = await step3_sendAccountCreatedEmail(recipient);

  console.log("");
  separator();
  if (step2Ok && step3Ok) {
    logGreen("  ✓ Both test emails delivered successfully.");
    console.log("  → Next: start the server with  npm start  (or  node server/index.js)");
    console.log("    then log in to the customer dashboard and attempt a transfer —");
    console.log("    the OTP will arrive by email and will never be shown on the dashboard.");
  } else {
    logRed("  ✗ Some emails failed. See error output above.");
  }
  separator();
  process.exit((step2Ok && step3Ok) ? 0 : 3);
})().catch(err => {
  console.error("FATAL runner crash:", err && err.stack ? err.stack : err);
  process.exit(99);
});
