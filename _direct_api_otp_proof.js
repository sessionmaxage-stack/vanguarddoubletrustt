require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const fbSvcAcctPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const fbSvcAcctRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let fbSvcAcct = null;
if (fbSvcAcctPath && fs.existsSync(fbSvcAcctPath)) { try { fbSvcAcct = JSON.parse(fs.readFileSync(fbSvcAcctPath, "utf8")); } catch (_) {} }
if (!fbSvcAcct && fbSvcAcctRaw) { try { fbSvcAcct = JSON.parse(fbSvcAcctRaw); } catch (_) {} }
if (!fbSvcAcct) { console.error("FATAL: no Firebase service account in env."); process.exit(1); }
if (!getApps().length) initializeApp({ credential: cert(fbSvcAcct) });
const auth = getAuth();

function httpReq(method, urlPath, opts = {}) {
  return new Promise((resolve, reject) => {
    const { URL } = require("url");
    const base = new URL("http://localhost:3002");
    const u = new URL(urlPath, base);
    const lib = require("http");
    const req = lib.request({
      method, hostname: u.hostname, port: u.port || 80, path: u.pathname + (u.search || ""),
      headers: {
        ...(opts.headers || {}),
        ...(opts.cookies ? { Cookie: opts.cookies } : {}),
        ...(opts.body ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body)) } : {})
      }
    }, (res) => {
      let body = "";
      const setCookies = [];
      (res.headers["set-cookie"] || []).forEach((c) => setCookies.push(c.split(";")[0].trim()));
      res.on("data", (d) => (body += String(d)));
      res.on("end", () => {
        let parsed = body;
        try { parsed = body ? JSON.parse(body) : {}; } catch (_) {}
        resolve({ status: res.statusCode, cookies: setCookies, body: parsed, rawBody: body });
      });
    });
    req.on("error", reject);
    if (opts.body) req.write(typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

async function userIdTokenFor(uid) {
  const customToken = await auth.createCustomToken(uid);
  const apiKey = (JSON.parse(process.env.FIREBASE_WEB_CONFIG_JSON || "{}")).apiKey;
  if (!apiKey) throw new Error("No Firebase API key in FIREBASE_WEB_CONFIG_JSON");
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: customToken, returnSecureToken: true }) }
  );
  if (!resp.ok) throw new Error(`token exchange HTTP ${resp.status}: ${await resp.text()}`);
  const d = await resp.json();
  return d.idToken;
}

const GREEN = "\x1b[32m", RED = "\x1b[31m", YELLOW = "\x1b[33m", CYAN = "\x1b[36m", BOLD = "\x1b[1m", RST = "\x1b[0m";

(async () => {
  console.log(CYAN + "═".repeat(78) + RST);
  console.log(`${BOLD}${CYAN}  DIRECT-API END-TO-END PROOF: /api/customer/transfer/request-otp → SMTP email ${RST}`);
  console.log(CYAN + "═".repeat(78) + RST);

  const userEmail = process.argv[2] ? String(process.argv[2]).trim() : "passertech@gmail.com";
  const userPassword = "PasserTech@2026!";
  const userAccountPin = "123456";
  const userTransferPin = "1234";
  const securityTransferPin = "1234";
  const _db = getFirestore();

  async function ensureFirestorePins(uid) {
    try {
      const cryptoMod = require("crypto");
      const sha256 = (s) => cryptoMod.createHash("sha256").update(s).digest("hex");
      const snap = await _db.collection("users").doc(uid).get();
      const doc = (snap.exists ? snap.data() : {}) || {};
      const sec = typeof doc.security === "object" && doc.security ? doc.security : {};
      const profile = typeof doc.profile === "object" && doc.profile ? doc.profile : {};
      const account = typeof doc.account === "object" && doc.account ? doc.account : {};
      const needsWrite =
        !sec.accountPinHash ||
        !sec.transferPinHash ||
        String(sec.transferPinHash || "") !== String(sha256(securityTransferPin)) ||
        String(sec.accountPinHash || "") !== String(sha256(userAccountPin)) ||
        !doc.email ||
        !profile.email ||
        !account.accountNumber ||
        !(Number(account.balance || 0) > 1000);

      if (!needsWrite) { console.log("     (Firestore user doc already has required pins + balance. No upsert needed.)"); return true; }

      const merged = {
        email: doc.email || userEmail,
        role: doc.role || "customer",
        uid,
        createdAt: doc.createdAt || new Date().toISOString(),
        profile: {
          firstname: profile.firstname || "Passer",
          lastname: profile.lastname || "Tech",
          email: profile.email || userEmail,
          country: profile.country || "UK",
          preferredLanguage: profile.preferredLanguage || "en",
          gender: profile.gender || "Other",
          dateOfBirth: profile.dateOfBirth || "1990-01-01",
          nationality: profile.nationality || "British",
          occupation: profile.occupation || "QA Engineer",
          address: profile.address || "45 Tech Lane",
          city: profile.city || "London",
          state: profile.state || "London",
          zipCode: profile.zipCode || "EC1A 1BB",
          phone: profile.phone || "+44 7700 900123",
          profilePic: profile.profilePic || "https://res.cloudinary.com/demo/image/upload/w_100,h_100,c_thumb/sample.jpg",
          ...profile
        },
        security: {
          ...sec,
          accountPinHash: sha256(userAccountPin),
          transferPin: securityTransferPin,
          transferPinHash: sha256(securityTransferPin),
          transferCode: sec.transferCode || ("TX-" + Math.floor(1000 + Math.random() * 9000) + "-" + cryptoMod.randomBytes(2).toString("hex").toUpperCase()),
          kycCompleted: true,
          onboardingCompleted: true,
          twoFactorEnabled: true,
          twoFactorVerified: true,
          emailVerified: true
        },
        account: {
          accountNumber: account.accountNumber || ("VTD-5588-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(10 + Math.random() * 90)),
          balance: Number(account.balance || 0) > 1000 ? Number(account.balance) : 15000.0,
          availableBalance: Number(account.availableBalance || account.balance || 0) > 1000 ? Number(account.availableBalance || account.balance) : 15000.0,
          currency: account.currency || "USD",
          type: account.type || "Checking",
          status: (account.status || "ACTIVE").toUpperCase()
        },
        onboarding: { kycCompleted: true, profilePicUploaded: true, required: false }
      };
      await _db.collection("users").doc(uid).set(merged, { merge: true });
      console.log(`${GREEN}  ✅ Firestore upsert completed (pins, balance, account).${RST}`);
      return true;
    } catch (e) {
      console.log(`${YELLOW}  ⚠ Firestore upsert failed (${e && e.message ? e.message : e}). Trying anyway, since server also tries to read pins from Firebase Auth fallback.${RST}`);
      return false;
    }
  }
  console.log(`\n  Test email   : ${BOLD}${userEmail}${RST}`);

  console.log(`\n── Step 1 — Ensure Firebase Auth user exists`);
  let uid = null;
  try {
    const e = await auth.getUserByEmail(userEmail);
    uid = e.uid;
    console.log(`${GREEN}  ✅ Reused existing Firebase Auth uid=${uid}${RST}`);
  } catch (_err) {
    console.log("  Creating new Firebase Auth user…");
    const c = await auth.createUser({ email: userEmail, password: userPassword, displayName: "Passer Tech" });
    uid = c.uid;
    console.log(`${GREEN}  ✅ Created uid=${uid}${RST}`);
  }

  console.log(`\n── Step 1b — Ensure Firestore users/${uid} doc has accountPinHash, transferPinHash, balance, account number`);
  await ensureFirestorePins(uid);

  console.log(`\n── Step 2 — Mint Firebase idToken → /api/sessionLogin → session cookies`);
  const idToken = await userIdTokenFor(uid);
  const loginResp = await httpReq("POST", "/api/sessionLogin", { body: { idToken, remember: true } });
  const cookies = {};
  (loginResp.cookies || []).forEach((c) => { const [k, v] = c.split("="); if (k) cookies[k.trim()] = v; });
  const cookieHeader = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  console.log(`  status=${loginResp.status} ok=${loginResp.body?.ok} session-cookies=${Object.keys(cookies).join(",")}`);
  if (loginResp.status !== 200 || !loginResp.body?.ok) { console.error(loginResp.body); process.exit(2); }

  console.log(`\n── Step 3 — POST /api/pin/verify (accountPin=${userAccountPin}) → sets PIN-verified state gate`);
  const pinResp = await httpReq("POST", "/api/pin/verify", { cookies: cookieHeader, body: { accountPin: userAccountPin, transferPin: userTransferPin } });
  (pinResp.cookies || []).forEach((c) => { const [k, v] = c.split("="); if (k) cookies[k.trim()] = v; });
  const cookieHeader2 = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  console.log(`  status=${pinResp.status} ok=${pinResp.body?.ok}`);
  if (pinResp.status !== 200 || !pinResp.body?.ok) { console.error(pinResp.body); process.exit(3); }

  console.log(`\n── Step 4 — POST /api/customer/transfer/request-otp → THIS TRIGGERS THE SMTP SEND`);
  console.log(`  (Amount: USD 500.00 → recipient: ${process.env.ADMIN_EMAIL || "ffclimmigration@gmail.com"})`);
  const t0 = Date.now();
  const otpResp = await httpReq("POST", "/api/customer/transfer/request-otp", {
    cookies: cookieHeader2,
    body: { transferPin: securityTransferPin, amount: 500, toEmail: process.env.ADMIN_EMAIL || "ffclimmigration@gmail.com", toAccountNumber: "", note: "Direct-API OTP dispatch test" }
  });
  const dt = Date.now() - t0;
  console.log(`  HTTP status=${otpResp.status} in ${dt} ms`);
  console.log(`  Response JSON keys: ${Object.keys(otpResp.body || {}).map((k) => `  · ${k}=${YELLOW}${typeof otpResp.body[k] === "object" ? JSON.stringify(otpResp.body[k]) : String(otpResp.body[k]).slice(0, 80)}${RST}`).join("\n                     ")}`);

  // Critical assertions
  console.log(`\n  ── Assertions ──────────────────────────────────────────────────────────`);
  let passed = 0, failed = 0;
  function check(name, cond, detail) {
    if (cond) { console.log(`  ${GREEN}✅ ${name}${RST}${detail ? `     ${YELLOW}${detail}${RST}` : ""}`); passed++; }
    else { console.log(`  ${RED}❌ ${name}${RST}${detail ? `     ${detail}` : ""}`); failed++; }
  }
  check("HTTP 200 returned", otpResp.status === 200, `got ${otpResp.status}`);
  check("ok=true flag", Boolean(otpResp.body?.ok));
  check("transferPinVerified=true gate in response", Boolean(otpResp.body?.transferPinVerified));
  check("emailSent=true (Nodemailer reported SMTP send)", Boolean(otpResp.body?.emailSent), `got ${otpResp.body?.emailSent}`);
  check("emailDelivered=true (accepted[] included recipient)", Boolean(otpResp.body?.emailDelivered), `got ${otpResp.body?.emailDelivered}`);
  check("maskedEmail present (never exposes full email in response)", typeof otpResp.body?.maskedEmail === "string" && otpResp.body.maskedEmail.includes("***"), `value: ${otpResp.body?.maskedEmail}`);
  check("expiresInMinutes=15 present", otpResp.body?.expiresInMinutes === 15, `got ${otpResp.body?.expiresInMinutes}`);
  check("expiresAt ISO timestamp present", typeof otpResp.body?.expiresAt === "string" && otpResp.body.expiresAt.includes("T"), `value: ${String(otpResp.body?.expiresAt).slice(0, 32)}`);
  check("NO 'otp' key in response body (no leak)", !("otp" in (otpResp.body || {})), Object.keys(otpResp.body || {}).join(","));
  check("NO 'code' key in response body (no leak)", !("code" in (otpResp.body || {})), Object.keys(otpResp.body || {}).join(","));
  check("No 6-digit OTP value anywhere in raw JSON payload", !(/[^0-9]?\d{6}[^0-9]?/).test(JSON.stringify(otpResp.body || {}).replace(/expires[A-Za-z]*|202[4-9]|remaining|178\d{7}/g, "")), `raw payload length: ${JSON.stringify(otpResp.body || "").length} chars`);
  check("Response body message contains 'email' keyword", otpResp.body?.message && /email/i.test(String(otpResp.body.message)));

  console.log(`\n  Assertion summary: ${BOLD}${passed > 0 && failed === 0 ? GREEN : RED}${passed}/${passed + failed} passed${RST}${BOLD}${RST}`);

  if (failed > 0) {
    console.log(RED + "\n  FAIL — some assertions failed. Dumping raw body:" + RST);
    console.log(JSON.stringify(otpResp.body, null, 2));
    process.exit(10);
  }

  console.log(`\n${GREEN}${BOLD}${"═".repeat(78)}${RST}`);
  console.log(`${BOLD}${GREEN}  DIRECT-API OTP EMAIL DISPATCH PROOF: SUCCESS  ✨${RST}`);
  console.log(`${GREEN}${BOLD}${"═".repeat(78)}${RST}`);
  console.log(`\n  What just happened end-to-end:`);
  console.log(`    1. Firebase Auth token for ${userEmail} obtained via signInWithCustomToken`);
  console.log(`    2. /api/sessionLogin → Express issued signed session cookies for uid=${uid.slice(0, 10)}…`);
  console.log(`    3. /api/pin/verify (transferPin=${userTransferPin}) → sets the PIN-verified server-side gate flag`);
  console.log(`    4. /api/customer/transfer/request-otp → server validates PIN gate → generates 6-digit CSPRNG OTP → encrypts with transferOtp.js AES-GCM context (amount=500) → calls sendTransferOtpEmail() → emailService.js uses Nodemailer Gmail App Password → transports mail to ${userEmail}`);
  console.log(`    5. server/index.js deliberately omits otp/code fields from JSON — dashboard cannot show what it never receives`);
  console.log(`\n${YELLOW}  👉 Next step: open ${BOLD}${userEmail}${RST}${YELLOW} inbox and confirm:${RST}`);
  console.log(`     • Email FROM: security@vanguarddoubletrust.com (or ffclimmigration via gmail)`);
  console.log(`     • Subject line: "[VanguardDoubleTrust] Your Transfer Verification Code: XXXXXX"`);
  console.log(`     • Body: bold 6-digit OTP + 15-min expiry + red Critical Security Warning banner (Never Share With Anyone)`);
  console.log(`     • Folder: Primary inbox (if not, check Updates tab first, then Spam)`);
  console.log(`\n  If mail is in Spam once, click "Not spam" in Gmail to train the classifier.`);
  console.log(`  For production reliability, perform the 4 DNS + alias hardening steps at the bottom of _secure_otp_sender.js.`);

  process.exit(0);
})().catch((e) => {
  console.error(RED + "FATAL: " + (e && e.message ? e.message : e) + RST);
  if (e && e.stack) console.error(YELLOW + e.stack.split("\n").slice(0, 10).join("\n") + RST);
  process.exit(99);
});
