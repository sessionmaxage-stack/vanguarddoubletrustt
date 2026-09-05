const http = require("http");
const https = require("https");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const { getAuth, getFirestore } = require("../server/firebase");
const { decryptAndVerifyOtp } = require("../server/transferOtp");

const BASE = "http://localhost:3002";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ffclimmigration@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "VtAdmin@2026";

const FIREBASE_WEB_CONFIG = (() => {
  try {
    const raw = process.env.FIREBASE_WEB_CONFIG_JSON || "";
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
})();

function httpsRequest(method, host, pathname, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        port: 443,
        path: pathname,
        method,
        headers: Object.assign({ "Content-Type": "application/json" }, opts.headers || {})
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: d ? JSON.parse(d) : {} }); }
          catch (_) { resolve({ status: res.statusCode, body: { _raw: d } }); }
        });
      }
    );
    req.on("error", reject);
    if (opts.body) req.write(typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

async function userIdTokenFor(uid) {
  if (!FIREBASE_WEB_CONFIG?.apiKey) {
    throw new Error("Missing FIREBASE_WEB_CONFIG_JSON apiKey");
  }
  const auth = getAuth();
  const customToken = await auth.createCustomToken(uid);
  const resp = await httpsRequest(
    "POST",
    "identitytoolkit.googleapis.com",
    `/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(FIREBASE_WEB_CONFIG.apiKey)}`,
    { body: { token: customToken, returnSecureToken: true } }
  );
  if (resp.status !== 200 || !resp.body?.idToken) {
    throw new Error("signInWithCustomToken failed: " + JSON.stringify(resp.body).slice(0, 500));
  }
  return String(resp.body.idToken);
}

function httpReq(method, urlPath, opts = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + urlPath);
    const headers = Object.assign(
      {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      opts.headers || {}
    );
    if (opts.cookies) {
      headers["Cookie"] = opts.cookies;
    }
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers
      },
      (res) => {
        const setCookies = (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]);
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let body;
          try {
            body = data ? JSON.parse(data) : {};
          } catch (_) {
            body = { _raw: data };
          }
          resolve({ status: res.statusCode, headers: res.headers, cookies: setCookies, body, rawText: data });
        });
      }
    );
    req.on("error", reject);
    if (opts.body) {
      req.write(typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body));
    }
    req.end();
  });
}

function mergeCookies(targetObj, cookieArray) {
  if (!Array.isArray(cookieArray)) return;
  for (const c of cookieArray) {
    const [k, v] = c.split("=");
    if (k && v !== undefined) targetObj[k.trim()] = v.trim();
  }
}

function cookiesToHeader(cookieObj) {
  return Object.entries(cookieObj)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function run() {
  console.log("=================================================");
  console.log("   ADMIN EMBEDDED USER EMAIL OTP DELIVERY TEST   ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function pass(msg) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  function fail(msg, err) {
    failed++;
    console.error(`[FAIL] ${msg}`);
    if (err) console.error(err);
  }

  try {
    console.log("--- SECTION 1: ADMIN LOGIN ---");
    const adminCookies = {};
    const adminLoginRes = await httpReq("POST", "/api/admin/login", {
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    assert.strictEqual(adminLoginRes.status, 200, "Admin login must succeed");
    mergeCookies(adminCookies, adminLoginRes.cookies);
    pass("Admin authenticated successfully");

    console.log("\n--- SECTION 2: CREATE USER WITH ADMIN-EMBEDDED EMAIL ---");
    const initialEmail = `admin_embed_${Date.now()}@vanguardtest.com`;
    const createUserRes = await httpReq("POST", "/api/admin/users", {
      cookies: cookiesToHeader(adminCookies),
      body: {
        firstname: "Marcus",
        lastname: "Vance",
        email: initialEmail,
        password: "EmbeddedPassword@2026",
        accountPin: "778899",
        transferCode: "654321",
        preferredLanguage: "en",
        startingBalance: 15000
      }
    });
    assert.strictEqual(createUserRes.status, 200, "Admin user creation must succeed");
    const createdUid = createUserRes.body?.user?.uid;
    const senderAccountNo = createUserRes.body?.account?.accountNumber;
    assert.ok(createdUid, "User created with UID");
    pass(`User created with embedded email: ${initialEmail} (UID: ${createdUid})`);

    // Verify storage in Firestore & Local
    const db = getFirestore();
    const userDocSnap = await db.collection("users").doc(createdUid).get();
    assert.ok(userDocSnap.exists, "Firestore user document exists");
    const userDocData = userDocSnap.data();
    assert.strictEqual(userDocData.email, initialEmail, "Firestore root email matches embedded email");
    assert.strictEqual(userDocData.profile?.email, initialEmail, "Firestore profile.email matches embedded email");
    pass("Firestore document contains embedded email at root and profile levels");

    const localUsers = JSON.parse(fs.readFileSync(path.join(__dirname, "../server/data/admin_users.json"), "utf8"));
    assert.strictEqual(localUsers[createdUid]?.email, initialEmail, "Local store matches embedded email");
    pass("Local backup store synchronized with embedded email");

    console.log("\n--- SECTION 3: ADMIN UPDATES EMBEDDED EMAIL & GUARDS ---");
    // Verify that attempting to modify immutable user metadata (email) is strictly rejected with 400
    const attemptEmailUpdate = await httpReq("PATCH", `/api/admin/users/${createdUid}`, {
      cookies: cookiesToHeader(adminCookies),
      body: {
        email: `illegal_patch_${Date.now()}@vanguardtest.com`
      }
    });
    assert.strictEqual(attemptEmailUpdate.status, 400, "Admin PATCH email must be rejected with 400 (immutable post-creation)");
    assert.ok(attemptEmailUpdate.body?.error?.includes("immutable"), "Clear immutability error message returned");
    pass("Server strictly enforces immutability of user metadata");

    // Perform supported admin PATCH update: balance and account status
    const patchRes = await httpReq("PATCH", `/api/admin/users/${createdUid}`, {
      cookies: cookiesToHeader(adminCookies),
      body: {
        balance: 15000,
        status: "ACTIVE"
      }
    });
    assert.strictEqual(patchRes.status, 200, "Admin PATCH user balance & status must succeed");
    pass("Admin updated user balance and status successfully");

    const updatedDocSnap = await db.collection("users").doc(createdUid).get();
    const updatedDocData = updatedDocSnap.data();
    assert.strictEqual(updatedDocData.email, initialEmail, "Firestore root email preserved and immutable");
    assert.strictEqual(updatedDocData.profile?.email, initialEmail, "Firestore profile.email preserved and immutable");
    assert.strictEqual(updatedDocData.account?.balance, 15000, "Firestore balance updated to 15000");
    pass("Firestore document preserved immutable email and updated balance");

    const updatedLocalUsers = JSON.parse(fs.readFileSync(path.join(__dirname, "../server/data/admin_users.json"), "utf8"));
    assert.strictEqual(updatedLocalUsers[createdUid]?.email, initialEmail, "Local store preserved immutable email");
    assert.strictEqual(updatedLocalUsers[createdUid]?.account?.balance, 15000, "Local store updated balance");
    pass("Local backup store synchronized with updated balance");

    console.log("\n--- SECTION 4: USER AUTHENTICATION & PIN VERIFICATION ---");
    const idToken = await userIdTokenFor(createdUid);
    const userCookies = {};
    const sessionRes = await httpReq("POST", "/api/sessionLogin", {
      body: { idToken, remember: true }
    });
    assert.strictEqual(sessionRes.status, 200, "User session login must succeed");
    mergeCookies(userCookies, sessionRes.cookies);
    pass("User authenticated via sessionLogin");

    const pinRes = await httpReq("POST", "/api/pin/verify", {
      cookies: cookiesToHeader(userCookies),
      body: { accountPin: "778899" }
    });
    assert.strictEqual(pinRes.status, 200, "PIN verified successfully");
    mergeCookies(userCookies, pinRes.cookies);
    pass("User verified PIN");

    console.log("\n--- SECTION 5: CREATE RECIPIENT FOR TRANSFER ---");
    const recipientEmail = `recipient_${Date.now()}@vanguardtest.com`;
    const createRecipRes = await httpReq("POST", "/api/admin/users", {
      cookies: cookiesToHeader(adminCookies),
      body: {
        firstname: "Diana",
        lastname: "Prince",
        email: recipientEmail,
        password: "RecipientPassword@2026",
        accountPin: "112233",
        transferCode: "654321",
        preferredLanguage: "en",
        startingBalance: 500
      }
    });
    assert.strictEqual(createRecipRes.status, 200, "Recipient user created");
    const recipientAccountNo = createRecipRes.body?.account?.accountNumber;
    pass(`Recipient created with Account No: ${recipientAccountNo}`);

    console.log("\n--- SECTION 6: REQUEST TRANSFER OTP & VERIFY DELIVERY TARGET ---");
    const requestOtpRes = await httpReq("POST", "/api/customer/transfer/request-otp", {
      cookies: cookiesToHeader(userCookies),
      body: {
        toAccountNumber: recipientAccountNo,
        amount: 2500,
        currency: "USD",
        transferPin: "654321",
        memo: "Verified admin email OTP test"
      }
    });
    assert.strictEqual(requestOtpRes.status, 200, "OTP generation request must return 200 OK");
    assert.strictEqual(requestOtpRes.body?.ok, true, "OTP response ok is true");
    assert.ok(requestOtpRes.body?.maskedEmail, "Response contains masked email");
    assert.ok(requestOtpRes.body?.expiresAt, "Response contains expiration timestamp");
    pass(`OTP dispatched targeting admin-embedded email. Masked: ${requestOtpRes.body.maskedEmail}`);

    // Verify OTP record in Firestore
    const senderDocAfterOtp = (await db.collection("users").doc(createdUid).get()).data();
    const storedOtpRecord = senderDocAfterOtp?.security?.transferOtp;
    assert.ok(storedOtpRecord, "Firestore security.transferOtp record exists");
    assert.ok(storedOtpRecord.encryptedData, "OTP is encrypted at rest");
    assert.ok(storedOtpRecord.iv, "OTP record has AES IV");
    assert.ok(storedOtpRecord.authTag, "OTP record has AES AuthTag");
    pass("OTP record is securely encrypted with AES-256-GCM in Firestore");

    // Decrypt the legitimate OTP
    const decipherKey = crypto.createHash("sha256").update(String(process.env.OTP_ENCRYPTION_SECRET || process.env.PIN_COOKIE_SECRET || process.env.ADMIN_COOKIE_SECRET || "vanguard_default_otp_secure_key_2026")).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", decipherKey, Buffer.from(storedOtpRecord.iv, "hex"));
    decipher.setAuthTag(Buffer.from(storedOtpRecord.authTag, "hex"));
    let receivedOtp = decipher.update(storedOtpRecord.encryptedData, "hex", "utf8");
    receivedOtp += decipher.final("utf8");
    assert.ok(/^\d{6}$/.test(receivedOtp), "Extracted 6-digit OTP code");
    pass(`Decrypted 6-digit OTP code: ${receivedOtp}`);

    console.log("\n--- SECTION 7: EXECUTE TRANSFER USING VERIFIED OTP ---");
    const transferRes = await httpReq("POST", "/api/customer/transfer", {
      cookies: cookiesToHeader(userCookies),
      body: {
        toAccountNumber: recipientAccountNo,
        amount: 2500,
        currency: "USD",
        transferPin: "654321",
        memo: "Verified admin email OTP test",
        otp: receivedOtp
      }
    });
    assert.strictEqual(transferRes.status, 200, "Transfer with verified OTP must return 200 OK");
    assert.strictEqual(transferRes.body?.ok, true, "Transfer completed successfully");
    assert.strictEqual(transferRes.body?.newBalance, 12500, "Sender balance accurately debited ($15000 - $2500 = $12500)");
    assert.ok(transferRes.body?.reference, `Transaction reference generated: ${transferRes.body?.reference}`);
    pass("Money transfer successfully executed and authorized using 6-digit email OTP");

    console.log("\n--- SECTION 8: REPLAY ATTACK PREVENTION ---");
    const replayRes = await httpReq("POST", "/api/customer/transfer", {
      cookies: cookiesToHeader(userCookies),
      body: {
        toAccountNumber: recipientAccountNo,
        amount: 500,
        currency: "USD",
        transferPin: "654321",
        otp: receivedOtp
      }
    });
    assert.strictEqual(replayRes.status, 401, "Replay attack with consumed OTP must be rejected (401)");
    pass("Consumed OTP is strictly invalidated and blocked from replay");

  } catch (err) {
    fail("Admin email OTP test suite encountered error", err);
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run();
