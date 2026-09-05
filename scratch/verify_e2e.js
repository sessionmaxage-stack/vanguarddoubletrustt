const http = require("http");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { getAuth } = require("../server/firebase");
const {
  loginUserForTest,
  mergeCookiesInto,
  cookiesToHeader
} = require("./_test_helper");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const BASE = "http://localhost:3002";

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
  mergeCookiesInto(cookieObj, cookieArr);
}

(async () => {
  console.log("=================================================");
  console.log("      E2E VERIFICATION SUITE FOR KYC & PIC       ");
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
  // SECTION 1: STATIC SOURCE FILE AUDIT (DISK INSPECTION)
  // ----------------------------------------------------
  console.log("\n--- SECTION 1: STATIC SOURCE FILE AUDIT ---");
  const rootDir = path.resolve(__dirname, "..");
  
  const dashPhp = fs.readFileSync(path.join(rootDir, "customer", "dashboard.php"), "utf8");
  assert(!dashPhp.includes('id="inlineKycGate"'), "customer/dashboard.php: inlineKycGate removed");
  assert(!dashPhp.includes('id="inlinePicGate"'), "customer/dashboard.php: inlinePicGate removed");
  assert(!dashPhp.includes('id="ikFirstname"'), "customer/dashboard.php: ikFirstname removed");
  assert(!dashPhp.includes("Continue to Step 2"), "customer/dashboard.php: 'Continue to Step 2' removed");
  assert(!dashPhp.includes("Save Profile Picture"), "customer/dashboard.php: 'Save Profile Picture' removed");
  assert(dashPhp.includes('id="dashboardRoot"'), "customer/dashboard.php: dashboardRoot intact");

  const profPhp = fs.readFileSync(path.join(rootDir, "customer", "myprofile.php"), "utf8");
  assert(!profPhp.includes("pic_section_title"), "customer/myprofile.php: pic_section_title removed");
  assert(!profPhp.includes("pic_upload_action"), "customer/myprofile.php: pic_upload_action removed");
  assert(!profPhp.includes("profilePicRemoveBtn"), "customer/myprofile.php: profilePicRemoveBtn removed");
  assert(!profPhp.includes("openPicGateFromProfile"), "customer/myprofile.php: openPicGateFromProfile removed");
  assert(profPhp.includes("Personal Details"), "customer/myprofile.php: Personal Details section intact");

  const adminHtml = fs.readFileSync(path.join(rootDir, "admin", "dashboard.html"), "utf8");
  const adminKycFields = [
    "createPhone", "createCountry", "createPreferredLanguage", "createGender",
    "createDateOfBirth", "createNationality", "createOccupation", "createAddress",
    "createCity", "createState", "createZipCode", "createProfilePic"
  ];
  adminKycFields.forEach((field) => {
    assert(adminHtml.includes(`id="${field}"`), `admin/dashboard.html: Field ${field} present in user creation modal`);
  });

  const adminJs = fs.readFileSync(path.join(rootDir, "admin", "assets", "js", "admin-session.js"), "utf8");
  assert(adminJs.includes("createPhone") && adminJs.includes("createProfilePic"), "admin-session.js: Collects & fills admin KYC fields");

  const authJs = fs.readFileSync(path.join(rootDir, "customer", "assets", "js", "auth-session.js"), "utf8");
  const i18nJs = fs.readFileSync(path.join(rootDir, "customer", "assets", "js", "customer-i18n.js"), "utf8");
  assert(
    (authJs.includes("if (kycGate) kycGate.remove();") && authJs.includes("if (picGate) picGate.remove();")) ||
    i18nJs.includes("kycGateSkipped: true") || i18nJs.includes("picGateSkipped: true"),
    "auth-session.js / customer-i18n.js: Neutralizes KYC/pic gates in bootstrapCustomerPage"
  );
  assert(
    authJs.includes("onboardingRequired = false;") ||
    (i18nJs.includes("onboarding") && i18nJs.includes("required: false")),
    "auth-session.js / customer-i18n.js: Forces onboarding required = false"
  );

  // ----------------------------------------------------
  // SECTION 2: ADMIN USER CREATION & PERSISTENCE
  // ----------------------------------------------------
  console.log("\n--- SECTION 2: ADMIN CREATION & PERSISTENCE ---");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminCookies = {};

  console.log(`Logging in admin (${adminEmail})...`);
  const adminLoginRes = await httpReq("POST", "/api/admin/login", {
    body: { email: adminEmail, password: adminPassword }
  });
  mergeCookies(adminCookies, adminLoginRes.cookies);
  assert(adminLoginRes.status === 200 && adminLoginRes.body?.ok, "Admin login successful");

  // Admin creates user with complete KYC & Profile Picture data
  const testId = Math.floor(Math.random() * 100000);
  const newUserPayload = {
    firstname: "John",
    lastname: `Doe${testId}`,
    email: `johndoe${testId}@example.com`,
    password: "CustomerPassword123!",
    accountPin: "654321",
    transferCode: "123456",
    startingBalance: "1500.00",
    phone: "+1 555 123 4567",
    country: "US",
    preferredLanguage: "en",
    gender: "male",
    dateOfBirth: "1990-05-15",
    nationality: "American",
    occupation: "Financial Analyst",
    address: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    zipCode: "62704",
    profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
  };

  console.log("Creating new user account via Admin API...");
  const createRes = await httpReq("POST", "/api/admin/users", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: newUserPayload
  });
  assert(createRes.status === 200 && createRes.body?.ok, `Admin user creation API returned 200 OK (${createRes.body?.error || ""})`);
  const createdUid = createRes.body?.user?.uid;
  assert(!!createdUid, `User created with UID: ${createdUid}`);

  if (!createdUid) {
    console.error("User creation failed, response body:", createRes.body);
    process.exit(1);
  }

  // Verify User Persistence in DB via Admin GET /api/admin/users/:uid
  console.log(`Fetching created user details (/api/admin/users/${createdUid})...`);
  const getUserRes = await httpReq("GET", `/api/admin/users/${createdUid}`, {
    headers: { "Cookie": cookiesToHeader(adminCookies) }
  });
  assert(getUserRes.status === 200 && getUserRes.body?.ok, "Admin fetch user details returned 200 OK");

  const fetchedProfile = getUserRes.body?.user?.profile || {};
  assert(fetchedProfile.phone === newUserPayload.phone, "Persisted KYC Phone matches admin input");
  assert(fetchedProfile.country === newUserPayload.country, "Persisted KYC Country matches admin input");
  assert(fetchedProfile.gender === newUserPayload.gender, "Persisted KYC Gender matches admin input");
  assert(fetchedProfile.dateOfBirth === newUserPayload.dateOfBirth, "Persisted KYC Date of Birth matches admin input");
  assert(fetchedProfile.nationality === newUserPayload.nationality, "Persisted KYC Nationality matches admin input");
  assert(fetchedProfile.occupation === newUserPayload.occupation, "Persisted KYC Occupation matches admin input");
  assert(fetchedProfile.address === newUserPayload.address, "Persisted KYC Address matches admin input");
  assert(fetchedProfile.city === newUserPayload.city, "Persisted KYC City matches admin input");
  assert(fetchedProfile.state === newUserPayload.state, "Persisted KYC State matches admin input");
  assert(fetchedProfile.zipCode === newUserPayload.zipCode, "Persisted KYC ZIP Code matches admin input");
  assert(fetchedProfile.profilePic === newUserPayload.profilePic, "Persisted Profile Picture URL matches admin input");
  assert(fetchedProfile.kycCompleted === true, "User marked as kycCompleted = true in DB");

  // ----------------------------------------------------
  // SECTION 3: USER LOGIN & UNOBSTRUCTED ACCESS
  // ----------------------------------------------------
  console.log("\n--- SECTION 3: USER LOGIN & UNOBSTRUCTED ACCESS ---");

  const customerCookies = {};
  console.log(`Bootstrapping customer session for UID ${createdUid} (sandbox-safe)...`);
  const loginRes = await loginUserForTest(createdUid, httpReq);
  Object.assign(customerCookies, loginRes.jar);
  console.log(`  Login via=${loginRes.via} cookies=${Object.keys(customerCookies).join(",")}`);
  assert(Boolean(customerCookies[process.env.SESSION_COOKIE_NAME || "vt_session"]), "Customer session cookie obtained via sandbox-safe login");

  // Verify PIN
  console.log("Verifying customer PIN...");
  const pinRes = await httpReq("POST", "/api/pin/verify", {
    cookies: cookiesToHeader(customerCookies),
    body: { accountPin: newUserPayload.accountPin }
  });
  mergeCookies(customerCookies, pinRes.cookies);
  assert(pinRes.status === 200 && pinRes.body?.ok, "Customer PIN verification successful");

  // GET /api/me
  console.log("Fetching customer profile (/api/me)...");
  const meRes = await httpReq("GET", "/api/me", {
    cookies: cookiesToHeader(customerCookies)
  });
  assert(meRes.status === 200, "/api/me returned 200 OK");
  assert(meRes.body?.onboarding?.required === false, "onboarding.required is FALSE upon login");
  assert(meRes.body?.onboarding?.kycCompleted === true, "onboarding.kycCompleted is TRUE upon login");
  assert(meRes.body?.onboarding?.profilePicUploaded === true, "onboarding.profilePicUploaded is TRUE upon login");
  assert(meRes.body?.profilePic === newUserPayload.profilePic, "/api/me reflects admin-configured profile picture");

  // ----------------------------------------------------
  // SECTION 4: DISABLED USER-FACING ENDPOINTS
  // ----------------------------------------------------
  console.log("\n--- SECTION 4: DISABLED USER-FACING ENDPOINTS ---");

  const userKycAttempt = await httpReq("POST", "/api/customer/kyc", {
    cookies: cookiesToHeader(customerCookies),
    body: { phone: "+1 555 999 8888" }
  });
  assert(userKycAttempt.status === 410, "POST /api/customer/kyc returns 410 Gone");

  const userPicAttempt = await httpReq("POST", "/api/customer/profile-pic", {
    cookies: cookiesToHeader(customerCookies),
    body: { secure_url: "https://example.com/hacker.jpg" }
  });
  assert(userPicAttempt.status === 410, "POST /api/customer/profile-pic returns 410 Gone");

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
