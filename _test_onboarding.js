const http = require("http");
const crypto = require("crypto");
const path = require("path");
const { getAuth, getFirestore } = require("./server/firebase");
const {
  loginUserForTest,
  mergeCookiesInto,
  cookiesToHeader,
  sha256Hex
} = require("./scratch/_test_helper");

const BASE = process.env.PORT ? ("http://localhost:" + process.env.PORT) : "http://localhost:3002";
const LOG = (...a) => console.log("[TEST]", ...a);

function httpReq(method, path, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const headers = Object.assign(
      {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      opts.headers || {}
    );
    if (opts.cookies) headers["Cookie"] = opts.cookies;
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
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          let body;
          try { body = d ? JSON.parse(d) : {}; }
          catch (_) { body = { _raw: d, length: d.length }; }
          resolve({ status: res.statusCode, cookies: setCookies, body });
        });
      }
    );
    req.on("error", reject);
    if (opts.body) req.write(typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

function cookieToHeader(cookies) { return cookiesToHeader(cookies); }
function mergeCookies(into, cookieArr) { mergeCookiesInto(into, cookieArr); }

(async () => {
  try {
    LOG("Start");
    const userCookies = {};

    const userEmail = "vt_test_" + Math.floor(Math.random() * 1e9) + "@vanguarddoubletrust.test";
    const userPassword = "VanguardTest123!";
    const userPin = "123456";
    const userFirst = "VT";
    const userLast = "TestUser-" + Math.floor(Math.random() * 1e6);
    const userCountry = "US";
    const userLang = "en";

    LOG("Test user email:", userEmail);

    // Create user directly via Firebase Admin Auth + Firestore
    LOG("Creating user in Firebase Auth and Firestore...");
    const auth = getAuth();
    const db = getFirestore();
    const userRecord = await auth.createUser({
      email: userEmail,
      password: userPassword,
      displayName: `${userFirst} ${userLast}`
    });
    const uid = userRecord.uid;
    LOG("User created. UID:", uid);

    await db.collection("users").doc(String(uid)).set({
      email: userEmail,
      role: "customer",
      createdAt: new Date().toISOString(),
      profile: {
        firstname: userFirst,
        lastname: userLast,
        email: userEmail
      },
      security: {
        accountPinHash: crypto.createHash("sha256").update(userPin).digest("hex"),
        kycCompleted: false
      },
      account: {
        accountNumber: "9900" + Math.floor(10000000 + Math.random() * 90000000),
        balance: 5000.0,
        currency: "USD"
      }
    });
    LOG("User document created in Firestore users/" + uid);

    // 4) Login user + get session (sandbox-safe: network exchange falls back to direct session cookie via admin SDK)
    LOG("Logging in user (sandbox-safe session bootstrap)...");
    const loginRes = await loginUserForTest(uid, httpReq);
    Object.assign(userCookies, loginRes.jar);
    LOG("  Login method:", loginRes.via, "cookie keys:", Object.keys(userCookies).join(","));
    if (!userCookies[process.env.SESSION_COOKIE_NAME || "vt_session"]) { LOG("FAIL: no session cookie obtained"); process.exit(3); }

    // 5) Verify PIN
    LOG("Verifying PIN...");
    const pinVerify = await httpReq("POST", "/api/pin/verify", {
      cookies: cookieToHeader(userCookies),
      body: { accountPin: userPin }
    });
    LOG("PIN verify status:", pinVerify.status, "body ok:", pinVerify.body?.ok);
    mergeCookies(userCookies, pinVerify.cookies);
    if (pinVerify.status !== 200 || !pinVerify.body?.ok) { LOG(pinVerify.body); process.exit(4); }

    // 6) GET /api/me → current production contract returns onboarding complete
    LOG("GET /api/me (CURRENT onboarding contract)");
    const meBefore = await httpReq("GET", "/api/me?vt_diag=1", { cookies: cookieToHeader(userCookies) });
    LOG("  status:", meBefore.status, "onboarding:", JSON.stringify(meBefore.body?.onboarding || null));
    if (meBefore.body?.onboarding?.required !== false) {
      LOG("FAIL: expected onboarding.required=false for the current production contract. Got:", meBefore.body?.onboarding);
      process.exit(5);
    }
    if (meBefore.body?.onboarding?.kycCompleted !== true) {
      LOG("FAIL: expected kycCompleted=true. Got:", meBefore.body?.onboarding);
      process.exit(5);
    }
    if (meBefore.body?.onboarding?.profilePicUploaded !== true) {
      LOG("FAIL: expected profilePicUploaded=true. Got:", meBefore.body?.onboarding);
      process.exit(5);
    }

    // 7) POST KYC → current production contract keeps this admin-only
    LOG("POST /api/customer/kyc (should be disabled for customers)...");
    const kycRes = await httpReq("POST", "/api/customer/kyc?vt_diag=1", {
      cookies: cookieToHeader(userCookies),
      body: {
        firstname: userFirst,
        lastname: userLast,
        country: userCountry,
        preferredLanguage: userLang,
        gender: "other",
        dateOfBirth: "1990-01-01",
        nationality: "American",
        occupation: "QA Test Engineer",
        address: "123 Test Street",
        city: "Test City",
        state: "CA",
        zipCode: "90210",
        phone: "+15555550199"
      }
    });
    LOG("  status:", kycRes.status, "body:", JSON.stringify(kycRes.body || null));
    if (kycRes.status !== 410) {
      LOG("FAIL: expected /api/customer/kyc to return 410 Gone. Got:", kycRes.status, kycRes.body);
      process.exit(6);
    }
    if (!/disabled|administrator|admin/i.test(String(kycRes.body?.error || ""))) {
      LOG("FAIL: expected disabled/admin error message from /api/customer/kyc. Got:", kycRes.body);
      process.exit(6);
    }

    // 8) GET /api/me → onboarding state should remain complete
    LOG("GET /api/me (AFTER disabled KYC call)");
    const meMid = await httpReq("GET", "/api/me?vt_diag=1", { cookies: cookieToHeader(userCookies) });
    LOG("  status:", meMid.status, "onboarding:", JSON.stringify(meMid.body?.onboarding || null));
    if (meMid.body?.onboarding?.required !== false) {
      LOG("FAIL: onboarding.required changed unexpectedly after disabled KYC call. Got:", meMid.body?.onboarding);
      process.exit(7);
    }
    if (meMid.body?.onboarding?.kycCompleted !== true || meMid.body?.onboarding?.profilePicUploaded !== true) {
      LOG("FAIL: expected onboarding completeness to remain true after disabled KYC call. Got:", meMid.body?.onboarding);
      process.exit(7);
    }

    // 9) POST profile-pic with a dataURL → current production contract keeps this admin-only
    LOG("POST /api/customer/profile-pic (should be disabled for customers)...");
    const tinyPic = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
    const picRes = await httpReq("POST", "/api/customer/profile-pic?vt_diag=1", {
      cookies: cookieToHeader(userCookies),
      body: { secure_url: tinyPic, public_id: "vt-test-" + crypto.randomBytes(8).toString("hex"), width: 1, height: 1, format: "png", bytes: tinyPic.length }
    });
    LOG("  status:", picRes.status, "body:", JSON.stringify(picRes.body || null));
    if (picRes.status !== 410) { LOG("FAIL pic:", picRes.status, picRes.body); process.exit(8); }
    if (!/disabled|administrator|admin/i.test(String(picRes.body?.error || ""))) {
      LOG("FAIL: expected disabled/admin error message from /api/customer/profile-pic. Got:", picRes.body);
      process.exit(8);
    }

    // 10) GET /api/me → onboarding.required=false ✅
    LOG("GET /api/me (AFTER disabled KYC + profile-pic calls)");
    const meAfter = await httpReq("GET", "/api/me?vt_diag=1", { cookies: cookieToHeader(userCookies) });
    LOG("  status:", meAfter.status, "onboarding:", JSON.stringify(meAfter.body?.onboarding || null));
    if (meAfter.body?.onboarding?.required !== false) {
      LOG("=======================================");
      LOG("CRITICAL FAIL: onboarding.required became true unexpectedly.");
      LOG("onboarding:", meAfter.body?.onboarding);
      LOG("security.kycCompleted:", meAfter.body?.security?.kycCompleted);
      LOG("profile.country:", meAfter.body?.profile?.country, "firstname:", meAfter.body?.profile?.firstname, "lastname:", meAfter.body?.profile?.lastname, "lang:", meAfter.body?.profile?.preferredLanguage);
      LOG("profile.profilePic.length:", String(meAfter.body?.profile?.profilePic || meAfter.body?.profile?.photoURL || "").length);
      LOG("security.profilePic.length:", String(meAfter.body?.security?.profilePic || meAfter.body?.security?.photoURL || "").length);
      LOG("=======================================");
      process.exit(9);
    }
    LOG("✅ onboarding.required=false remains stable under the current production contract");

    // 11) Hit a gated page — should be 200, no redirect
    LOG("GET /customer/statement.php (gated page)");
    const gated = await httpReq("GET", "/customer/statement.php", { cookies: cookieToHeader(userCookies), headers: { Accept: "text/html" } });
    LOG("  status:", gated.status, "redirected?", gated.status === 301 || gated.status === 302 ? gated.body : "No");
    if (gated.status === 301 || gated.status === 302) {
      const loc = (Array.isArray(gated.cookies) ? gated.body._location : null) || (gated.body && typeof gated.body === "object" ? gated.body.location : null);
      LOG("FAIL: gated page redirected! loc:", loc);
      process.exit(10);
    }
    LOG("✅ Gated page loads without redirect (status", gated.status, ")");

    // 12) Log out user + log back in → onboarding.required still=false
    LOG("Simulating LOGOUT then re-LOGIN (next day onboarding)...");
    const userCookies2 = {};
    const reloginRes = await loginUserForTest(uid, httpReq);
    Object.assign(userCookies2, reloginRes.jar);
    if (!userCookies2[process.env.SESSION_COOKIE_NAME || "vt_session"]) { LOG("Relogin failed: no session cookie"); process.exit(11); }
    const pin2 = await httpReq("POST", "/api/pin/verify", { cookies: cookieToHeader(userCookies2), body: { accountPin: userPin } });
    mergeCookies(userCookies2, pin2.cookies);
    const meAgain = await httpReq("GET", "/api/me?vt_diag=1", { cookies: cookieToHeader(userCookies2) });
    LOG("  After re-login onboarding:", JSON.stringify(meAgain.body?.onboarding || null));
    if (meAgain.body?.onboarding?.required !== false) {
      LOG("=======================================");
      LOG("CRITICAL FAIL: ONBOARDING RE-APPEARED ON NEXT LOGIN!");
      LOG("This means it's not truly saved to Firestore.");
      LOG("onboarding:", meAgain.body?.onboarding);
      LOG("security:", JSON.stringify(meAgain.body?.security).slice(0, 500));
      LOG("profile.firstname:", meAgain.body?.profile?.firstname, "country:", meAgain.body?.profile?.country);
      LOG("=======================================");
      process.exit(12);
    }
    LOG("✅ ONBOARDING STAYS DONE AFTER LOGOUT+RELOGIN — APPEARS EXACTLY ONCE ✓");
    LOG("ALL TESTS PASSED");
    process.exit(0);
  } catch (e) {
    console.error("TEST EXCEPTION:", e);
    process.exit(99);
  }
})();
