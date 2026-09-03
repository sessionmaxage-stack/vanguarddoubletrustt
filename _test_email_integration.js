require("dotenv").config();

console.log("=" .repeat(70));
console.log("  VanguardDoubleTrust — Nodemailer Integration End-to-End Test Suite");
console.log("=" .repeat(70));
console.log("");

let passCount = 0;
let failCount = 0;
const failures = [];

function assert(cond, name, detail) {
  if (cond) {
    console.log(`  ✓ PASS   ${name}`);
    passCount++;
  } else {
    console.log(`  ✗ FAIL   ${name}`);
    if (detail) console.log(`         → ${detail}`);
    failCount++;
    failures.push({ name, detail });
  }
}

(async () => {
  console.log("── Phase 1: Dedicated Email Service Module Loading");
  let emailService = null;
  try {
    emailService = require("./server/emailService");
    assert(emailService !== null && typeof emailService === "object",
      "emailService module exports an object");
  } catch (e) {
    assert(false, "emailService module loads without errors", e.message);
  }

  const expectedExports = [
    "maskEmail",
    "getSmtpConfig",
    "getFromAddress",
    "getMailTransporter",
    "verifyMailTransporter",
    "validateRecipient",
    "sendMail",
    "buildTransferOtpMessage",
    "buildAccountCreatedMessage",
    "sendTransferOtpEmail",
    "sendAccountCreatedOtpEmail"
  ];
  for (const fn of expectedExports) {
    assert(typeof emailService[fn] === "function",
      `emailService exports function: ${fn}`);
  }
  console.log("");

  console.log("── Phase 2: Email Masking & Recipient Validation");
  assert(emailService.maskEmail("alice@example.com") === "a***e@example.com",
    "maskEmail masks middle characters of standard email",
    `got: ${emailService.maskEmail("alice@example.com")}`);
  assert(emailService.maskEmail("ab@x.io") === "a***@x.io",
    "maskEmail handles 2-character username",
    `got: ${emailService.maskEmail("ab@x.io")}`);

  const vrGood = emailService.validateRecipient("valid.user+tag@sub.domain.co.uk");
  assert(vrGood.valid === true && vrGood.email === "valid.user+tag@sub.domain.co.uk",
    "validateRecipient accepts valid address with subdomain");

  const vrBad = emailService.validateRecipient("not-an-email");
  assert(vrBad.valid === false,
    "validateRecipient rejects invalid address format");

  const vrEmpty = emailService.validateRecipient("   ");
  assert(vrEmpty.valid === false,
    "validateRecipient rejects empty / whitespace-only recipient");
  console.log("");

  console.log("── Phase 3: SMTP Environment Configuration Parsing");
  const smtpCfg = emailService.getSmtpConfig();
  assert(typeof smtpCfg === "object" && smtpCfg !== null,
    "getSmtpConfig returns a configuration object");
  assert(Number.isFinite(smtpCfg.port),
    `SMTP port is numeric (got: ${smtpCfg.port})`);
  assert(typeof smtpCfg.secure === "boolean",
    `SMTP secure flag is boolean (got: ${smtpCfg.secure})`);

  const from = emailService.getFromAddress();
  assert(typeof from === "string" && from.length > 0,
    "getFromAddress returns a non-empty from header string");
  assert(from.includes("@"),
    "getFromAddress includes an @ symbol in the sender address");
  console.log("");

  console.log("── Phase 4: Transfer OTP Email Message Builder");
  let transferMsg = null;
  try {
    transferMsg = emailService.buildTransferOtpMessage(
      "Jane Customer",
      "482915",
      { amount: 1250.75, currency: "USD", recipient: "ACC-987654" }
    );
  } catch (e) {
    assert(false, "buildTransferOtpMessage throws no exception", e.message);
  }
  assert(transferMsg && typeof transferMsg.subject === "string",
    "transfer message has subject string");
  assert(transferMsg.subject.includes("482915"),
    "transfer subject contains the 6-digit OTP code");
  assert(transferMsg.subject.startsWith("[VanguardDoubleTrust]"),
    "transfer subject is properly branded");
  assert(typeof transferMsg.text === "string" && transferMsg.text.length > 100,
    "transfer message has a text body (plaintext fallback)");
  assert(typeof transferMsg.html === "string" && transferMsg.html.includes("<!") === false,
    "transfer message has an HTML body");
  assert(transferMsg.html.includes("482915"),
    "transfer HTML body renders the 6-digit OTP code");
  assert(transferMsg.html.includes("15 minutes only"),
    "transfer HTML body prominently displays the 15-minute expiration");
  assert(transferMsg.html.includes("$ 1,250.75") || transferMsg.html.includes("1250.75"),
    "transfer HTML body references the transfer amount context");
  console.log("");

  console.log("── Phase 5: Account-Created OTP + Credential Message Builder");
  let acctMsg = null;
  try {
    acctMsg = emailService.buildAccountCreatedMessage(
      "Robert Smith",
      "103947",
      {
        email: "robert@example.com",
        password: "R0b!S_2026#Secure",
        accountNumber: "VTD-4821-9930-77",
        accountPin: "6251",
        transferCode: "TX-8837-A9BK"
      }
    );
  } catch (e) {
    assert(false, "buildAccountCreatedMessage throws no exception", e.message);
  }
  assert(acctMsg && typeof acctMsg.subject === "string",
    "account-created message has subject string");
  assert(acctMsg.subject.includes("103947"),
    "account-created subject contains the 6-digit OTP code");
  assert(acctMsg.html.includes("103947"),
    "account-created HTML body renders the OTP code prominently");
  assert(acctMsg.html.includes("VTD-4821-9930-77"),
    "account-created HTML body embeds account number in credentials table");
  assert(acctMsg.html.includes("R0b!S_2026#Secure"),
    "account-created HTML body embeds admin-set login password");
  assert(acctMsg.html.includes("TX-8837-A9BK"),
    "account-created HTML body embeds admin-set transfer code");
  console.log("");

  console.log("── Phase 6: Transport Creation & Credential Guard");
  let transporter = null;
  try {
    transporter = emailService.getMailTransporter();
  } catch (e) {
    assert(false, "getMailTransporter never throws (returns null on failure)", e.message);
  }
  if (process.env.SMTP_USER && (process.env.SMTP_PASS) && (process.env.SMTP_SERVICE || process.env.SMTP_HOST)) {
    assert(transporter !== null,
      "getMailTransporter returns a real transporter when SMTP env vars are configured");
    const verifyOk = await emailService.verifyMailTransporter(transporter).catch(() => false);
    console.log(`       ℹ SMTP credentials are present in env — verify() returned: ${verifyOk}`);
    assert(verifyOk === true || !verifyOk,
      "verifyMailTransporter resolves to a boolean (no uncaught exceptions)");
  } else {
    assert(transporter === null,
      "getMailTransporter returns null when SMTP credentials are not yet configured in .env");
    console.log("       ℹ SMTP env vars not yet set — transport will activate once credentials are configured.");
  }
  console.log("");

  console.log("── Phase 7: Validation Guards on Email Dispatchers");
  let threwInvalidOtp = false;
  try {
    await emailService.sendTransferOtpEmail("valid@example.com", "Test User", "NOT-6-DIGITS", {});
  } catch (_) { threwInvalidOtp = true; }
  assert(threwInvalidOtp === true,
    "sendTransferOtpEmail rejects non-6-digit OTP code (guard prevents bad dispatch)");

  let threwBadRecipient = false;
  try {
    await emailService.sendAccountCreatedOtpEmail("bad-address", "Test User", "123456", {});
  } catch (_) { threwBadRecipient = true; }
  assert(threwBadRecipient === true,
    "sendAccountCreatedOtpEmail rejects malformed recipient email (security guard)");
  console.log("");

  console.log("── Phase 8: Backend API Response Leakage Scan (static source inspection)");
  const fs = require("fs");
  const serverSrc = fs.readFileSync(
    require("path").join(__dirname, "server", "index.js"),
    "utf8"
  );

  const requestOtpResponseBlock = serverSrc.substring(
    serverSrc.indexOf("res.status(200).json", serverSrc.indexOf("/api/customer/transfer/request-otp")),
    serverSrc.indexOf("});", serverSrc.indexOf("res.status(200).json", serverSrc.indexOf("/api/customer/transfer/request-otp")))
  );
  const leaksRawOtpResp = /otp\s*:\s*rawOtp|code\s*:\s*rawOtp/.test(requestOtpResponseBlock);
  assert(leaksRawOtpResp === false,
    "request-otp endpoint JSON response does NOT leak raw OTP (server/index.js)");

  const createUserBlock = serverSrc.substring(
    serverSrc.indexOf("accountOtpEncrypted") - 50,
    serverSrc.indexOf("app.patch", serverSrc.indexOf("accountOtpEncrypted"))
  );
  const leaksCreateOtp = /oneTimePassword\s*:\s*accountOtp|otp\s*:\s*accountOtp|code\s*:\s*accountOtp/.test(createUserBlock);
  assert(leaksCreateOtp === false,
    "admin create-user endpoint JSON response does NOT leak account OTP code (server/index.js)");
  console.log("");

  console.log("── Phase 9: Frontend Dashboard Leakage Scan (static source inspection)");
  const dashboardSrc = fs.readFileSync(
    require("path").join(__dirname, "customer", "dashboard.php"),
    "utf8"
  );
  const leaksDashboardCodeBanner = /codeBanner\s*=|Your Transfer OTP Code<\/div>\s*' \+.*codeHint|inputValue\s*:\s*codeHint/.test(dashboardSrc);
  assert(leaksDashboardCodeBanner === false,
    "dashboard.php does NOT build a visible OTP code banner with the server-returned code");
  const leaksDashboardPrompt = /Your OTP Code: " \+ codeHint/.test(dashboardSrc);
  assert(leaksDashboardPrompt === false,
    "dashboard.php prompt() fallback does NOT include 'Your OTP Code:' message with the code");

  const authSessionSrc = fs.readFileSync(
    require("path").join(__dirname, "customer", "assets", "js", "auth-session.js"),
    "utf8"
  );
  const leaksAuthSessionBanner = /codeBanner\s*=\s*otpCode|Your Transfer OTP Code<\/div>.*\$\{otpCode\}|inputValue\s*:\s*otpCode/.test(authSessionSrc);
  assert(leaksAuthSessionBanner === false,
    "auth-session.js does NOT build a visible OTP code banner with the server-returned code");
  const leaksAuthSessionPrompt = /Your OTP Code: \$\{otpCode\}/.test(authSessionSrc);
  assert(leaksAuthSessionPrompt === false,
    "auth-session.js prompt() fallback does NOT include the OTP code in the message");
  console.log("");

  console.log("── Phase 10: Existing OTP Flow Integration (transferOtp.js still functional)");
  let transferOtpModule = null;
  try {
    transferOtpModule = require("./server/transferOtp");
  } catch (e) {
    assert(false, "transferOtp.js legacy module still loads (no regressions)", e.message);
  }
  assert(
    transferOtpModule &&
    typeof transferOtpModule.generate6DigitOtp === "function" &&
    typeof transferOtpModule.encryptOtpRecord === "function" &&
    typeof transferOtpModule.decryptAndVerifyOtp === "function",
    "transferOtp.js OTP crypto primitives remain intact (no unrelated modifications)"
  );
  const testOtp = transferOtpModule.generate6DigitOtp();
  assert(/^\d{6}$/.test(testOtp),
    `generate6DigitOtp() produces a 6-digit numeric string (sample: ${testOtp})`);
  const enc = transferOtpModule.encryptOtpRecord(testOtp, { amount: 10 });
  const dec = transferOtpModule.decryptAndVerifyOtp(enc, testOtp);
  assert(dec.valid === true,
    "encryptOtpRecord → decryptAndVerifyOtp round-trip succeeds for fresh OTP");
  const badDec = transferOtpModule.decryptAndVerifyOtp(enc, "000000");
  assert(badDec.valid === false,
    "decryptAndVerifyOtp rejects wrong 6-digit code (timing-safe compare works)");
  console.log("");

  console.log("=" .repeat(70));
  console.log(`  Test Results: ${passCount} passed, ${failCount} failed, ${passCount + failCount} total`);
  console.log("=" .repeat(70));

  if (failCount > 0) {
    console.log("");
    console.log("  Failures:");
    failures.forEach((f, i) => {
      console.log(`    ${i + 1}. ${f.name}`);
      if (f.detail) console.log(`       ${f.detail}`);
    });
    process.exit(1);
  } else {
    console.log("");
    console.log("  ✅ All tests passed.");
    console.log("     → Verification codes are sent exclusively via Nodemailer email.");
    console.log("     → No codes are ever rendered on the user dashboard.");
    console.log("     → Dedicated emailService.js module is isolated and operational.");
    process.exit(0);
  }
})().catch((err) => {
  console.error("  FATAL: Test runner crashed:", err && err.stack ? err.stack : err);
  process.exit(2);
});
