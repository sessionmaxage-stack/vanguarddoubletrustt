const http = require("http");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { getAuth } = require("../server/firebase");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const BASE = "http://localhost:3002";

const FIREBASE_WEB_CONFIG = (() => {
  try {
    const raw = process.env.FIREBASE_WEB_CONFIG_JSON || "";
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
})();

function httpsRequest(method, host, pathname, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = require("https").request(
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

// Helper to generate minimal valid 1x1 image buffers
function create1x1Png() {
  return Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
}

function create1x1Jpeg() {
  return Buffer.from("/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=", "base64");
}

function create1x1Gif() {
  return Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
}

function create1x1Webp() {
  return Buffer.from("UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AA/v2AAAAD+/v//9f////7///9////////9///+/f8A", "base64");
}

(async () => {
  console.log("=================================================");
  console.log("   ADMIN DIRECT PROFILE PICTURE UPLOAD SUITE     ");
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
  // TEST 1: UNAUTHENTICATED ACCESS REJECTION
  // ----------------------------------------------------
  console.log("\n--- TEST 1: UNAUTHENTICATED ACCESS REJECTION ---");
  const unauthUpload = await httpReq("POST", "/api/admin/upload-profile-pic", {
    body: { fileDataUrl: "data:image/png;base64," + create1x1Png().toString("base64") }
  });
  assert(unauthUpload.status === 401 || unauthUpload.status === 302, `Unauthenticated upload rejected (Status: ${unauthUpload.status})`);

  // ----------------------------------------------------
  // TEST 2: ADMIN AUTHENTICATION
  // ----------------------------------------------------
  console.log("\n--- TEST 2: ADMIN AUTHENTICATION ---");
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminCookies = {};

  const adminLoginRes = await httpReq("POST", "/api/admin/login", {
    body: { email: adminEmail, password: adminPassword }
  });
  mergeCookies(adminCookies, adminLoginRes.cookies);
  assert(adminLoginRes.status === 200 && adminLoginRes.body?.ok, "Admin login succeeded");

  // ----------------------------------------------------
  // TEST 3: VALID IMAGE FORMATS UPLOAD
  // ----------------------------------------------------
  console.log("\n--- TEST 3: VALID IMAGE FORMATS UPLOAD ---");

  // PNG Upload
  const pngRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: { fileDataUrl: "data:image/png;base64," + create1x1Png().toString("base64"), fileName: "avatar.png" }
  });
  assert(pngRes.status === 200 && pngRes.body?.ok, `PNG upload succeeded with URL: ${pngRes.body?.secure_url}`);
  assert(pngRes.body?.format === "png", "Detected format is PNG");

  // JPEG Upload
  const jpgRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: { fileDataUrl: "data:image/jpeg;base64," + create1x1Jpeg().toString("base64"), fileName: "avatar.jpg" }
  });
  assert(jpgRes.status === 200 && jpgRes.body?.ok, `JPEG upload succeeded with URL: ${jpgRes.body?.secure_url}`);
  assert(jpgRes.body?.format === "jpeg", "Detected format is JPEG");

  // WebP Upload
  const webpRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: { fileDataUrl: "data:image/webp;base64," + create1x1Webp().toString("base64"), fileName: "avatar.webp" }
  });
  assert(webpRes.status === 200 && webpRes.body?.ok, `WebP upload succeeded with URL: ${webpRes.body?.secure_url}`);
  assert(webpRes.body?.format === "webp", "Detected format is WebP");

  // GIF Upload
  const gifRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: { fileDataUrl: "data:image/gif;base64," + create1x1Gif().toString("base64"), fileName: "avatar.gif" }
  });
  assert(gifRes.status === 200 && gifRes.body?.ok, `GIF upload succeeded with URL: ${gifRes.body?.secure_url}`);
  assert(gifRes.body?.format === "gif", "Detected format is GIF");

  // ----------------------------------------------------
  // TEST 4: INVALID FILE & SECURITY REJECTION
  // ----------------------------------------------------
  console.log("\n--- TEST 4: INVALID FILE & SECURITY REJECTION ---");

  // 4a: Non-image file renamed with .jpg extension (Fake header)
  const fakeJpg = Buffer.from("THIS IS A TEXT FILE NOT AN IMAGE", "utf8");
  const fakeJpgRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: { fileDataUrl: "data:image/jpeg;base64," + fakeJpg.toString("base64"), fileName: "malicious.jpg" }
  });
  assert(fakeJpgRes.status === 400, "Fake JPG with invalid magic bytes rejected with 400 Bad Request");

  // 4b: Malicious executable buffer
  const fakeExe = Buffer.from("MZ900003000000040000ffff0000b8000000000000004000000000000000", "hex");
  const fakeExeRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: { fileDataUrl: "data:image/png;base64," + fakeExe.toString("base64"), fileName: "virus.exe" }
  });
  assert(fakeExeRes.status === 400, "Executable PE header rejected with 400 Bad Request");

  // 4c: Embedded PHP script tag
  const phpScriptBuffer = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]),
    Buffer.from("<?php system($_GET['cmd']); ?>")
  ]);
  const phpScriptRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: { fileDataUrl: "data:image/jpeg;base64," + phpScriptBuffer.toString("base64"), fileName: "exploit.jpg" }
  });
  assert(phpScriptRes.status === 400, "Embedded PHP script payload rejected with 400 Bad Request");

  // 4d: Oversized file (> 5MB)
  const oversizedBuf = Buffer.alloc(5.5 * 1024 * 1024, 0xff);
  oversizedBuf[0] = 0xff; oversizedBuf[1] = 0xd8; oversizedBuf[2] = 0xff;
  const oversizedRes = await httpReq("POST", "/api/admin/upload-profile-pic", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: { fileDataUrl: "data:image/jpeg;base64," + oversizedBuf.toString("base64"), fileName: "large.jpg" }
  });
  assert(oversizedRes.status === 400 || oversizedRes.status === 413, "Oversized file (>5MB) rejected");

  // ----------------------------------------------------
  // TEST 5: END-TO-END USER CREATION WITH UPLOADED PICTURE
  // ----------------------------------------------------
  console.log("\n--- TEST 5: END-TO-END USER CREATION WITH UPLOADED PICTURE ---");

  const uploadedPicUrl = pngRes.body?.secure_url;
  const testId = Math.floor(Math.random() * 100000);
  const newUser = {
    firstname: "Alice",
    lastname: `Uploaded${testId}`,
    email: `alice${testId}@example.com`,
    password: "Password123!",
    accountPin: "987654",
    transferCode: "654321",
    startingBalance: "2500.00",
    phone: "+1 555 987 6543",
    country: "CA",
    preferredLanguage: "en",
    gender: "female",
    dateOfBirth: "1992-08-20",
    nationality: "Canadian",
    occupation: "UX Designer",
    address: "100 Queen St W",
    city: "Toronto",
    state: "ON",
    zipCode: "M5H 2N2",
    profilePic: uploadedPicUrl
  };

  const createRes = await httpReq("POST", "/api/admin/users", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: newUser
  });
  assert(createRes.status === 200 && createRes.body?.ok, "Account created with direct-uploaded profile picture");
  const createdUid = createRes.body?.user?.uid;
  assert(!!createdUid, `Created User UID: ${createdUid}`);

  // Fetch admin view
  const userCheckRes = await httpReq("GET", `/api/admin/users/${createdUid}`, {
    headers: { "Cookie": cookiesToHeader(adminCookies) }
  });
  assert(userCheckRes.status === 200, "Admin fetched user successfully");
  assert(userCheckRes.body?.user?.profile?.profilePic === uploadedPicUrl, "Persisted profilePic matches uploaded URL in admin view");

  // Customer Login & /api/me check
  const idToken = await userIdTokenFor(createdUid);
  const userCookies = {};
  const loginRes = await httpReq("POST", "/api/sessionLogin", {
    body: { idToken, remember: true }
  });
  mergeCookies(userCookies, loginRes.cookies);
  assert(loginRes.status === 200, "Customer logged in successfully");

  const pinRes = await httpReq("POST", "/api/pin/verify", {
    cookies: cookiesToHeader(userCookies),
    body: { accountPin: newUser.accountPin }
  });
  mergeCookies(userCookies, pinRes.cookies);
  assert(pinRes.status === 200, "Customer PIN verified");

  const meRes = await httpReq("GET", "/api/me", {
    cookies: cookiesToHeader(userCookies)
  });
  assert(meRes.status === 200, "Customer /api/me succeeded");
  assert(meRes.body?.profilePic === uploadedPicUrl, "Customer profilePic contains uploaded image URL");
  assert(meRes.body?.onboarding?.required === false, "Customer has immediate unobstructed access");

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
})();
