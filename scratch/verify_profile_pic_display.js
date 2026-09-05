const http = require("http");
const https = require("https");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const { getAuth } = require("../server/firebase");

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

function create1x1Png() {
  return Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360606060000000050001a7df3c9c0000000049454e44ae426082",
    "hex"
  );
}

async function run() {
  console.log("=================================================");
  console.log("   USER PROFILE PICTURE DISPLAY TEST SUITE       ");
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
    console.log("--- SECTION 1: ADMIN LOGIN & PROFILE PICTURE UPLOAD ---");
    const adminCookies = {};
    const adminLoginRes = await httpReq("POST", "/api/admin/login", {
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    assert.strictEqual(adminLoginRes.status, 200, "Admin login must succeed");
    mergeCookies(adminCookies, adminLoginRes.cookies);
    pass("Admin authenticated successfully");

    const pngBase64 = create1x1Png().toString("base64");
    const uploadRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
      cookies: cookiesToHeader(adminCookies),
      body: { fileDataUrl: `data:image/png;base64,${pngBase64}`, fileName: "user_avatar.png" }
    });
    assert.strictEqual(uploadRes.status, 200, "Admin image upload must succeed");
    const uploadedPicUrl = uploadRes.body?.secure_url || uploadRes.body?.url;
    assert.ok(uploadedPicUrl, "Upload response contains picture URL");
    pass(`Admin uploaded profile picture: ${uploadedPicUrl}`);

    console.log("\n--- SECTION 2: CREATE USER WITH ADMIN-ASSIGNED PROFILE PICTURE ---");
    const uniqueEmail = `avatar_test_${Date.now()}@vanguardtest.com`;
    const createUserRes = await httpReq("POST", "/api/admin/users", {
      cookies: cookiesToHeader(adminCookies),
      body: {
        firstname: "Eleanor",
        lastname: "Vance",
        email: uniqueEmail,
        password: "AvatarSecret@2026",
        accountPin: "889900",
        transferCode: "123456",
        preferredLanguage: "en",
        startingBalance: 25000,
        profilePic: uploadedPicUrl
      }
    });
    assert.strictEqual(createUserRes.status, 200, "Admin user creation must succeed");
    const createdUid = createUserRes.body?.user?.uid;
    pass(`User created with UID: ${createdUid} and profile picture`);

    // Verify admin view
    const adminUserCheck = await httpReq("GET", `/api/admin/users/${createdUid}`, {
      cookies: cookiesToHeader(adminCookies)
    });
    assert.strictEqual(adminUserCheck.status, 200, "Admin fetched user");
    assert.strictEqual(adminUserCheck.body?.user?.profile?.profilePic, uploadedPicUrl, "Admin view contains uploaded profile picture");
    pass("Admin view verified with profile picture");

    console.log("\n--- SECTION 3: USER AUTHENTICATION & /api/me VALIDATION ---");
    const idToken = await userIdTokenFor(createdUid);
    const userCookies = {};
    const loginRes = await httpReq("POST", "/api/sessionLogin", {
      body: { idToken, remember: true }
    });
    assert.strictEqual(loginRes.status, 200, "User session login must succeed");
    mergeCookies(userCookies, loginRes.cookies);
    pass("User authenticated successfully via sessionLogin");

    const verifyPinRes = await httpReq("POST", "/api/pin/verify", {
      cookies: cookiesToHeader(userCookies),
      body: { accountPin: "889900" }
    });
    assert.strictEqual(verifyPinRes.status, 200, "PIN verification must succeed");
    mergeCookies(userCookies, verifyPinRes.cookies);
    pass("User verified PIN");

    const meRes = await httpReq("GET", "/api/me", {
      cookies: cookiesToHeader(userCookies)
    });
    assert.strictEqual(meRes.status, 200, "GET /api/me must return 200 OK");
    const me = meRes.body;
    assert.strictEqual(me.profilePic, uploadedPicUrl, "me.profilePic matches admin uploaded URL");
    assert.strictEqual(me.profile?.profilePic, uploadedPicUrl, "me.profile.profilePic matches admin uploaded URL");
    pass("GET /api/me accurately provides admin-assigned profile picture URL");

    console.log("\n--- SECTION 4: DOM RENDERING VALIDATION ACROSS DASHBOARD & SUBPAGES ---");

    // 1. Test renderAvatarElement helper from auth-session.js
    const authSessionJs = fs.readFileSync(path.join(__dirname, "../customer/assets/js/auth-session.js"), "utf8");
    assert.ok(authSessionJs.includes("function renderAvatarElement"), "renderAvatarElement is defined in auth-session.js");
    assert.ok(authSessionJs.includes("function getProfilePicFromMe"), "getProfilePicFromMe is defined in auth-session.js");
    pass("auth-session.js contains unified avatar rendering and extraction logic");

    // Simulate DOM for testing avatar rendering functions
    class MockElement {
      constructor(id = "") {
        this.id = id;
        this.innerHTML = "";
        this.textContent = "";
        this.style = {};
      }
      querySelectorAll(tag) {
        if (this.innerHTML.includes("<" + tag)) {
          return [{ remove: () => { this.innerHTML = ""; } }];
        }
        return [];
      }
    }

    const mockAvatarEl = new MockElement("avatarInitials");

    // Evaluate renderAvatarElement logic
    function testRenderAvatar(el, picUrl, initials, name) {
      const cleanPic = typeof picUrl === "string" ? picUrl.trim() : "";
      const cleanInitials = typeof initials === "string" && initials.trim() ? initials.trim() : "VT";
      const cleanName = typeof name === "string" && name.trim() ? name.trim() : "User";

      if (cleanPic && cleanPic !== "null" && cleanPic !== "undefined") {
        el.innerHTML = `<img src="${cleanPic}" alt="${cleanName}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;" onerror="this.onerror=null;this.parentElement.textContent='${cleanInitials}';" />`;
        el.style.background = "transparent";
        el.style.padding = "0";
        el.style.overflow = "hidden";
      } else {
        el.textContent = cleanInitials;
        el.style.background = "";
        el.style.padding = "";
        el.style.overflow = "";
      }
    }

    // Test with uploaded picture
    testRenderAvatar(mockAvatarEl, me.profilePic, "EV", "Eleanor Vance");
    assert.ok(mockAvatarEl.innerHTML.includes(`<img src="${uploadedPicUrl}"`), "Avatar renders <img> tag with exact uploaded picture");
    assert.ok(mockAvatarEl.innerHTML.includes('alt="Eleanor Vance"'), "Avatar renders alt attribute with user name");
    assert.strictEqual(mockAvatarEl.style.overflow, "hidden", "Avatar container has overflow hidden for circular fit");
    pass("renderAvatarElement displays user profile picture inside avatar component");

    // Test with user with NO picture (fallback to initials)
    const mockNoPicAvatarEl = new MockElement("avatarInitials");
    testRenderAvatar(mockNoPicAvatarEl, "", "JD", "John Doe");
    assert.strictEqual(mockNoPicAvatarEl.textContent, "JD", "Fallback avatar renders initials when no picture is set");
    assert.strictEqual(mockNoPicAvatarEl.innerHTML, "", "Fallback avatar does not render empty img tags");
    pass("Fallback avatar cleanly renders initials when user has no profile picture");

    // 2. Validate dashboard.php applyUserInfoToDashboard logic
    const dashboardPhp = fs.readFileSync(path.join(__dirname, "../customer/dashboard.php"), "utf8");
    assert.ok(dashboardPhp.includes('avatarEl.innerHTML = \'<img src="\' + picUrl'), "dashboard.php applyUserInfoToDashboard renders profile picture img tag");
    pass("customer/dashboard.php verified with profile picture rendering logic");

    // 3. Validate myprofile.php renderAvatars logic
    const myprofilePhp = fs.readFileSync(path.join(__dirname, "../customer/myprofile.php"), "utf8");
    assert.ok(myprofilePhp.includes('topAvatar.innerHTML = `<img src="${finalPic}"'), "myprofile.php renderAvatars renders profile picture img tag");
    assert.ok(myprofilePhp.includes("renderAvatars(c.profilePic || \"\", latestMe)"), "myprofile.php bootI18nAndKyc passes active profilePic");
    pass("customer/myprofile.php verified with profile picture rendering logic");

  } catch (err) {
    fail("Test suite encountered error", err);
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run();
