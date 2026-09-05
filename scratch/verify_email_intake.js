const assert = require("assert");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const BASE_URL = "http://localhost:3002";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ffclimmigration@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "VtAdmin@2026";

function request(method, pathUrl, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const reqHeaders = Object.assign({}, headers);
    let payload = null;
    if (body) {
      payload = typeof body === "string" ? body : JSON.stringify(body);
      reqHeaders["Content-Type"] = reqHeaders["Content-Type"] || "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: reqHeaders
    };

    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json !== null ? json : data
        });
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function extractCookie(cookieHeader, cookieName) {
  if (!cookieHeader) return null;
  const list = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
  for (const c of list) {
    const parts = c.split(";")[0].split("=");
    if (parts[0].trim() === cookieName) {
      return parts.slice(1).join("=");
    }
  }
  return null;
}

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`[PASS] ${msg}`);
  passed++;
}

function fail(msg, err) {
  console.error(`[FAIL] ${msg}`);
  if (err) console.error(err);
  failed++;
}

async function run() {
  console.log("=================================================");
  console.log("    USER EMAIL INTAKE & SYSTEM RECOVERY SUITE    ");
  console.log("=================================================\n");

  // ----------------------------------------------------
  // SECTION 1: PROCESS AUDIT & PORT STATUS
  // ----------------------------------------------------
  console.log("--- SECTION 1: PROCESS AUDIT & ACTIVE SERVER STATUS ---");
  try {
    const health = await request("GET", "/");
    assert.strictEqual(health.status, 200, "Server is responding with HTTP 200");
    pass("Authoritative server is active and responding on port 3002");
  } catch (e) {
    fail("Server health check failed", e);
  }

  // ----------------------------------------------------
  // SECTION 2: PUBLIC CONTACT US FORM VALIDATION
  // ----------------------------------------------------
  console.log("\n--- SECTION 2: CONTACT US FORM HTML & SCRIPT AUDIT ---");
  try {
    const contactHtmlPath = path.resolve(__dirname, "..", "contact-us.php");
    assert(fs.existsSync(contactHtmlPath), "contact-us.php exists");
    const htmlContent = fs.readFileSync(contactHtmlPath, "utf8");

    assert(htmlContent.includes('id="contactForm"'), "Form has id='contactForm'");
    assert(htmlContent.includes('id="contactEmail"'), "Email input has id='contactEmail'");
    assert(htmlContent.includes('name="email"'), "Email input has name='email'");
    assert(htmlContent.includes('id="contactName"'), "Name input has id='contactName'");
    assert(htmlContent.includes('id="contactMessage"'), "Message textarea has id='contactMessage'");
    assert(htmlContent.includes('id="contactAlert"'), "Alert feedback container exists");
    assert(htmlContent.includes('fetch("/api/contact"'), "Submission script makes AJAX call to /api/contact");
    pass("contact-us.php contains full form markup and AJAX submission script");
  } catch (e) {
    fail("Contact HTML audit failed", e);
  }

  // ----------------------------------------------------
  // SECTION 3: CONTACT EMAIL INTAKE API VALIDATION
  // ----------------------------------------------------
  console.log("\n--- SECTION 3: CONTACT EMAIL INTAKE ENDPOINT VALIDATION ---");

  // 3.1 Invalid email rejection
  try {
    const res = await request("POST", "/api/contact", {
      name: "Alice Smith",
      email: "invalid-email-address",
      subject: "Account Support",
      message: "Need help with account access."
    });
    assert.strictEqual(res.status, 400, "Invalid email rejected with 400");
    pass("Invalid email format rejected with 400 Bad Request");
  } catch (e) {
    fail("Invalid email rejection failed", e);
  }

  // 3.2 Missing name rejection
  try {
    const res = await request("POST", "/api/contact", {
      name: "",
      email: "alice@example.com",
      subject: "General",
      message: "Hello there"
    });
    assert.strictEqual(res.status, 400, "Missing name rejected with 400");
    pass("Missing name rejected with 400 Bad Request");
  } catch (e) {
    fail("Missing name rejection failed", e);
  }

  // 3.3 Missing message rejection
  try {
    const res = await request("POST", "/api/contact", {
      name: "Alice Smith",
      email: "alice@example.com",
      subject: "General",
      message: ""
    });
    assert.strictEqual(res.status, 400, "Missing message rejected with 400");
    pass("Missing message rejected with 400 Bad Request");
  } catch (e) {
    fail("Missing message rejection failed", e);
  }

  // 3.4 Valid message intake & email capture
  const testEmail1 = `client_${Date.now()}@usermail.com`;
  let testMsgId1 = null;
  try {
    const res = await request("POST", "/api/contact", {
      name: "Elizabeth Bennet",
      email: testEmail1,
      phone: "+1 555-234-5678",
      subject: "Mortgage Enquiry",
      message: "I would like to enquire about premium fixed mortgage rates for a residential property."
    });
    assert.strictEqual(res.status, 200, "Contact message accepted with 200 OK");
    assert.strictEqual(res.body.ok, true, "Response ok: true");
    assert(Boolean(res.body.messageId), "Response returned a unique messageId");
    testMsgId1 = res.body.messageId;
    pass(`Valid user email (${testEmail1}) captured successfully with ID: ${testMsgId1}`);
  } catch (e) {
    fail("Valid contact intake failed", e);
  }

  // ----------------------------------------------------
  // SECTION 4: ADMIN CONTACT MESSAGES RETRIEVAL & AUDIT
  // ----------------------------------------------------
  console.log("\n--- SECTION 4: ADMIN ACCESS TO CAPTURED USER EMAILS ---");
  let adminCookie = null;
  try {
    const loginRes = await request("POST", "/api/admin/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    assert.strictEqual(loginRes.status, 200, "Admin login returned 200");
    const rawCookie = loginRes.headers["set-cookie"];
    const cookieVal = extractCookie(rawCookie, "vt_admin_session");
    adminCookie = `vt_admin_session=${cookieVal}`;
    pass("Admin authenticated for contact message review");

    const msgListRes = await request("GET", "/api/admin/contact-messages", null, {
      Cookie: adminCookie
    });
    assert.strictEqual(msgListRes.status, 200, "GET /api/admin/contact-messages returned 200");
    assert(Array.isArray(msgListRes.body.messages), "Messages is an array");
    const found = msgListRes.body.messages.find(m => m.messageId === testMsgId1 || m.email === testEmail1);
    assert(Boolean(found), "Submitted user email message exists in admin inbox");
    assert.strictEqual(found.email, testEmail1, "Persisted email matches submitted email exactly");
    assert.strictEqual(found.name, "Elizabeth Bennet", "Persisted name matches exactly");
    assert.strictEqual(found.subject, "Mortgage Enquiry", "Persisted subject matches exactly");
    pass(`Admin inbox verified: user email (${testEmail1}) is fully captured, stored, and accessible`);
  } catch (e) {
    fail("Admin contact messages retrieval failed", e);
  }

  // ----------------------------------------------------
  // SECTION 5: CUSTOMER ACCOUNT EMAIL INTAKE & PERSISTENCE
  // ----------------------------------------------------
  console.log("\n--- SECTION 5: CUSTOMER ACCOUNT EMAIL INTAKE & PERSISTENCE ---");
  try {
    const regEmail = `registered_customer_${Date.now()}@vanguardtest.com`;
    const createRes = await request("POST", "/api/admin/users", {
      firstname: "Alexander",
      lastname: "Hamilton",
      email: regEmail,
      password: "UserSecret@2026",
      accountPin: "654321",
      transferCode: "123456",
      preferredLanguage: "en",
      startingBalance: 15000,
      phone: "+1 212-555-0199",
      country: "United States"
    }, {
      Cookie: adminCookie
    });
    assert.strictEqual(createRes.status, 200, "Admin created user with email");
    const userUid = createRes.body?.uid || createRes.body?.user?.uid;
    assert(Boolean(userUid), "User UID returned");
    pass(`Customer account created with email (${regEmail})`);

    // Verify user details via Admin API
    const userDetailsRes = await request("GET", `/api/admin/users/${userUid}`, null, {
      Cookie: adminCookie
    });
    assert.strictEqual(userDetailsRes.status, 200, "Fetched user details");
    assert.strictEqual(userDetailsRes.body.user.email, regEmail, "User root email is persisted");
    assert.strictEqual(userDetailsRes.body.user.profile.email, regEmail, "User profile.email is persisted");
    pass("User email is stored in both root document and profile object");

    pass("Customer email intake and database persistence verified end-to-end");
  } catch (e) {
    fail("Customer profile email intake failed", e);
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
