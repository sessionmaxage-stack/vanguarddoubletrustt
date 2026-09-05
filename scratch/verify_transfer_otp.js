const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const { getFirestore, getAuth } = require("../server/firebase");
const {
  generate6DigitOtp,
  encryptOtpRecord,
  decryptAndVerifyOtp,
  checkRateLimit,
  maskEmail
} = require("../server/transferOtp");

const BASE = "http://localhost:3002";

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

function mergeCookies(cookieObj, cookieArr) {
  (cookieArr || []).forEach((c) => {
    const [k, v] = c.split("=");
    if (k && v) cookieObj[k.trim()] = v.trim();
  });
}

function cookiesToHeader(cookieObj) {
  return Object.entries(cookieObj)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

(async () => {
  console.log("=================================================");
  console.log("   MONEY TRANSFER 6-DIGIT EMAIL OTP TEST SUITE   ");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // SECTION 1: UNIT / SECURITY CRYPTO & LIFECYCLE TESTS
  // ----------------------------------------------------
  console.log("\n--- SECTION 1: CRYPTO, RATE LIMITING & LIFECYCLE ---");

  // 1a: Cryptographic 6-digit generation
  const testOtp = generate6DigitOtp();
  assert(/^\d{6}$/.test(testOtp), `Generated OTP is exactly 6 numeric digits: ${testOtp}`);

  // 1b: Encryption at rest (AES-256-GCM)
  const encRecord = encryptOtpRecord(testOtp, { amount: 150, currency: "USD" });
  assert(!!encRecord.encryptedData && !!encRecord.iv && !!encRecord.authTag, "OTP is encrypted with ciphertext, IV, and authTag");
  assert(!JSON.stringify(encRecord).includes(testOtp), "Plaintext OTP is never present in stored record structure");
  assert(encRecord.expiresAt - encRecord.createdAt === 15 * 60 * 1000, "Expiration is set to exactly 15 minutes");

  // 1c: Valid OTP match
  const validCheck = decryptAndVerifyOtp(encRecord, testOtp);
  assert(validCheck.valid === true, "Valid 6-digit OTP validates successfully");

  // 1d: Incorrect code rejection
  const invalidCheck = decryptAndVerifyOtp(encRecord, "999999");
  assert(invalidCheck.valid === false && invalidCheck.error.includes("Invalid verification code"), "Incorrect OTP is rejected with user-friendly error");

  // 1e: Expired code rejection (> 15 mins)
  const expiredRecord = Object.assign({}, encRecord, { expiresAt: Date.now() - 1000 });
  const expiredCheck = decryptAndVerifyOtp(expiredRecord, testOtp);
  assert(expiredCheck.valid === false && expiredCheck.error.includes("expired"), "Expired OTP (>15 mins) is strictly rejected");

  // 1f: Consumed / Replay rejection
  const usedRecord = Object.assign({}, encRecord, { verified: true });
  const usedCheck = decryptAndVerifyOtp(usedRecord, testOtp);
  assert(usedCheck.valid === false && usedCheck.error.includes("already been used"), "Replayed / already used OTP is strictly rejected");

  // 1g: 24-Hour Rate Limiting
  let rateState = { requests: [] };
  for (let i = 0; i < 5; i++) {
    const r = checkRateLimit(rateState);
    assert(r.allowed === true, `OTP request #${i + 1} within daily limit is allowed`);
    rateState.requests = r.requests;
  }
  const blockedRate = checkRateLimit(rateState);
  assert(blockedRate.allowed === false && blockedRate.error.includes("limit exceeded"), "6th OTP request in 24h is blocked with 429 rate limit error");

  // 1h: Mask email utility
  assert(maskEmail("john.doe@example.com") === "j***e@example.com", "Email masking works correctly");

  // ----------------------------------------------------
  // SECTION 2: END-TO-END MONEY TRANSFER WORKFLOW
  // ----------------------------------------------------
  console.log("\n--- SECTION 2: END-TO-END TRANSFER WORKFLOW ---");

  // Step 2a: Admin login to create 2 test users (Sender and Recipient)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminCookies = {};
  const adminLoginRes = await httpReq("POST", "/api/admin/login", {
    body: { email: adminEmail, password: adminPassword }
  });
  mergeCookies(adminCookies, adminLoginRes.cookies);
  assert(adminLoginRes.status === 200, "Admin logged in");

  const randId = Math.floor(Math.random() * 100000);
  const senderPayload = {
    firstname: "Sender",
    lastname: `User${randId}`,
    email: `sender${randId}@example.com`,
    password: "Password123!",
    accountPin: "112233",
    transferCode: "123456",
    startingBalance: "5000.00",
    phone: "+1 555 111 2222",
    country: "US",
    preferredLanguage: "en",
    gender: "male",
    dateOfBirth: "1990-01-01",
    nationality: "American",
    occupation: "Engineer",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001"
  };

  const recipientPayload = {
    firstname: "Recipient",
    lastname: `User${randId}`,
    email: `recipient${randId}@example.com`,
    password: "Password123!",
    accountPin: "445566",
    transferCode: "654321",
    startingBalance: "100.00",
    phone: "+1 555 333 4444",
    country: "US",
    preferredLanguage: "en",
    gender: "female",
    dateOfBirth: "1995-05-05",
    nationality: "American",
    occupation: "Designer",
    address: "456 Oak St",
    city: "Boston",
    state: "MA",
    zipCode: "02101"
  };

  const createSenderRes = await httpReq("POST", "/api/admin/users", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: senderPayload
  });
  const senderUid = createSenderRes.body?.user?.uid;
  const senderAcctNo = createSenderRes.body?.account?.accountNumber;
  assert(createSenderRes.status === 200 && !!senderUid, `Sender user created (UID: ${senderUid}, Acct: ${senderAcctNo})`);

  const createRecipientRes = await httpReq("POST", "/api/admin/users", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: recipientPayload
  });
  const recipientUid = createRecipientRes.body?.user?.uid;
  const recipientAcctNo = createRecipientRes.body?.account?.accountNumber;
  assert(createRecipientRes.status === 200 && !!recipientUid, `Recipient user created (UID: ${recipientUid}, Acct: ${recipientAcctNo})`);

  // Step 2b: Sender customer logs in
  const senderIdToken = await userIdTokenFor(senderUid);
  const senderCookies = {};
  const senderLoginRes = await httpReq("POST", "/api/sessionLogin", {
    body: { idToken: senderIdToken, remember: true }
  });
  mergeCookies(senderCookies, senderLoginRes.cookies);

  const senderPinRes = await httpReq("POST", "/api/pin/verify", {
    cookies: cookiesToHeader(senderCookies),
    body: { accountPin: senderPayload.accountPin }
  });
  mergeCookies(senderCookies, senderPinRes.cookies);
  assert(senderPinRes.status === 200, "Sender authenticated and verified PIN");

  // Step 2c: Trigger condition test - unauthenticated OTP request rejected
  const unauthOtpRes = await httpReq("POST", "/api/customer/transfer/request-otp", {
    body: { toAccountNumber: recipientAcctNo, amount: 250, transferPin: senderPayload.transferCode }
  });
  assert(unauthOtpRes.status === 401 || unauthOtpRes.status === 302, "Unauthenticated OTP request rejected (401/302)");

  // Step 2d: Sender requests OTP for a valid transfer with mandatory transferPin
  const transferAmount = 350.00;
  const requestOtpRes = await httpReq("POST", "/api/customer/transfer/request-otp", {
    cookies: cookiesToHeader(senderCookies),
    body: {
      toAccountNumber: recipientAcctNo,
      amount: transferAmount,
      currency: "USD",
      memo: "Monthly consultation fee",
      transferPin: senderPayload.transferCode
    }
  });
  assert(requestOtpRes.status === 200 && requestOtpRes.body?.ok, "Transfer OTP request succeeded");
  assert(!!requestOtpRes.body?.maskedEmail, `OTP sent to masked email: ${requestOtpRes.body?.maskedEmail}`);
  assert(typeof requestOtpRes.body?.expiresAt === "number", "Response includes expiresAt timestamp");

  // Step 2e: Verify stored encrypted record in Firestore
  const db = getFirestore();
  const senderDocSnap = await db.collection("users").doc(senderUid).get();
  const storedOtp = senderDocSnap.data()?.security?.transferOtp;
  assert(!!storedOtp && !!storedOtp.encryptedData && !!storedOtp.iv && !!storedOtp.authTag, "Firestore security doc contains AES-256 encrypted OTP record");

  // Step 2f: Attempt transfer with wrong OTP -> Rejected
  const wrongTransferRes = await httpReq("POST", "/api/customer/transfer", {
    cookies: cookiesToHeader(senderCookies),
    body: {
      toAccountNumber: recipientAcctNo,
      amount: transferAmount,
      currency: "USD",
      otp: "000000",
      transferPin: senderPayload.transferCode,
      memo: "Monthly consultation fee"
    }
  });
  assert(wrongTransferRes.status === 401, "Transfer with invalid OTP rejected with 401");
  assert(wrongTransferRes.body?.error.includes("Invalid verification code"), `Clear error message returned: "${wrongTransferRes.body?.error}"`);

  // Step 2g: Decrypt the legitimate OTP from stored record to simulate user receiving email
  const secretKey = process.env.OTP_ENCRYPTION_SECRET || process.env.PIN_COOKIE_SECRET || process.env.ADMIN_COOKIE_SECRET || "vanguard_default_otp_secure_key_2026";
  const decipherKey = require("crypto").createHash("sha256").update(String(secretKey)).digest();
  const decipher = require("crypto").createDecipheriv("aes-256-gcm", decipherKey, Buffer.from(storedOtp.iv, "hex"));
  decipher.setAuthTag(Buffer.from(storedOtp.authTag, "hex"));
  let receivedOtp = decipher.update(storedOtp.encryptedData, "hex", "utf8");
  receivedOtp += decipher.final("utf8");
  assert(/^\d{6}$/.test(receivedOtp), `User received 6-digit email OTP: ${receivedOtp}`);

  // Step 2h: Submit valid OTP to complete transfer
  const validTransferRes = await httpReq("POST", "/api/customer/transfer", {
    cookies: cookiesToHeader(senderCookies),
    body: {
      toAccountNumber: recipientAcctNo,
      amount: transferAmount,
      currency: "USD",
      otp: receivedOtp,
      transferPin: senderPayload.transferCode,
      memo: "Monthly consultation fee"
    }
  });
  assert(validTransferRes.status === 200 && validTransferRes.body?.ok, "Transfer completed successfully with verified 6-digit OTP");
  assert(validTransferRes.body?.newBalance === 4650.00, `Sender balance accurately debited ($${validTransferRes.body?.newBalance})`);
  assert(!!validTransferRes.body?.reference, `Transaction reference created: ${validTransferRes.body?.reference}`);

  // Step 2i: Invalidation check - Attempt to reuse the consumed OTP -> Must be rejected
  const replayTransferRes = await httpReq("POST", "/api/customer/transfer", {
    cookies: cookiesToHeader(senderCookies),
    body: {
      toAccountNumber: recipientAcctNo,
      amount: transferAmount,
      currency: "USD",
      otp: receivedOtp,
      transferPin: senderPayload.transferCode,
      memo: "Replay attack attempt"
    }
  });
  assert(replayTransferRes.status === 401, "Replay attack with consumed OTP rejected with 401");

  // Step 2j: Check recipient balance updated
  const recipientDocSnap = await db.collection("users").doc(recipientUid).get();
  const recipientBalance = Number(recipientDocSnap.data()?.account?.balance || 0);
  assert(recipientBalance === 450.00, `Recipient balance accurately credited to $${recipientBalance}`);

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
})();
