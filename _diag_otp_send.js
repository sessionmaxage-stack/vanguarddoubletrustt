// Diagnose: request-otp send + inbox delivery
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const crypto = require("crypto");
const { getAuth, getFirestore } = require("./server/firebase");
const { loginUserForTest, cookiesToHeader, sha256Hex } = require("./scratch/_test_helper");

const http = require("http");

function httpReq(method, pathname, opts) {
  return new Promise((resolve, reject) => {
    const body = opts && opts.body ? JSON.stringify(opts.body) : null;
    const req = http.request(
      { hostname: "localhost", port: 3002, method, path: pathname,
        headers: Object.assign(
          { "Content-Type": "application/json", Accept: "application/json" },
          opts && opts.cookies ? { Cookie: opts.cookies } : {},
          body ? { "Content-Length": Buffer.byteLength(body) } : {}
        ),
        timeout: 240000 },
      (res) => {
        let d = "";
        const ck = res.headers["set-cookie"] || [];
        res.on("data", c => d += c);
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: d ? JSON.parse(d) : {}, cookies: ck }); }
          catch (_) { resolve({ status: res.statusCode, body: { _raw: d }, cookies: ck }); }
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  const db = getFirestore();
  const uid = "fBQSVl0qGRdtWWTtn2B1EWGAwWS2";
  const sess = await loginUserForTest(uid, httpReq);
  const jar = cookiesToHeader(sess.jar);
  console.log("Sender logged in via=", sess.via, "uid=", uid);
  // Check adminEmbeddedEmail
  const snap = await db.collection("users").doc(uid).get();
  const doc = snap.data() || {};
  console.log("adminEmbeddedEmail userDoc.email=", doc.email, " profile.email=", doc.profile?.email);
  // lookup recipient account
  const r2 = await httpReq("GET", `/api/admin/users`, { cookies: "" });
  // actually we need admin login, so call admin login directly in same request
  let adminCookie = "";
  const alogin = await httpReq("POST", "/api/admin/login", { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }});
  (alogin.cookies || []).forEach(c => { const [k,v] = c.split(";")[0].split("="); if (k) adminCookie += adminCookie ? "; "+k+"="+v : k+"="+v; });
  console.log("Admin login=", alogin.status);
  const recipients = await httpReq("GET", "/api/admin/users", { cookies: adminCookie });
  const users = Array.isArray(recipients.body) ? recipients.body : (recipients.body?.users || recipients.body?.data || []);
  const recipient = users.find(u => u.email === "ffclimmigration@gmail.com");
  console.log("Recipient acct num=", recipient?.accountNumber || recipient?.account?.accountNumber);
  const toAccountNumber = recipient?.accountNumber || recipient?.account?.accountNumber || "VTD-5588-9109-61";
  const amount = 50;

  console.log("\n=== Calling /api/customer/transfer/request-otp ===");
  console.log("  toAccountNumber=", toAccountNumber, " amount=USD", amount, " transferPin=963852 (sha256 expected on userDoc.security.transferPinHash)",
    sha256Hex("963852").slice(0,12)+"...");
  console.log("  actual stored hash = ", (doc.security?.transferPinHash || "").slice(0, 16)+"...");

  const t0 = Date.now();
  const r = await httpReq("POST", "/api/customer/transfer/request-otp", {
    cookies: jar,
    body: { toAccountNumber, amount, currency: "USD", transferPin: "963852", transferCode: "963852", memo: "Diagnostic send OTP test" }
  });
  const elapsed = Date.now() - t0;
  console.log(`\n  ${elapsed}ms — status=${r.status}`);
  console.log(`  body=${JSON.stringify(r.body, null, 2)}`);
  console.log(`\n   If status==200: emailDeliveredTo=${r.body.emailDeliveredTo} emailSent=${r.body.emailSent} emailDelivered=${r.body.emailDelivered} maskedEmail=${r.body.maskedEmail} remaining=${r.body.remainingDailyRequests}`);
  console.log("\nNow check passertech@gmail.com inbox and spam folder for OTP arrival.");
})().catch(e => { console.error("FATAL:", e.stack || e); process.exit(99); });
