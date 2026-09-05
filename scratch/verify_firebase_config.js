const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const { validateFirebaseConfig, getAuth, getFirestore, getAdminApp } = require("../server/firebase");

(async () => {
  console.log("=================================================");
  console.log("   FIREBASE SERVICE ACCOUNT PRE-CHECK TEST       ");
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
  // TEST 1: PRE-CHECK WITH LIVE .ENV CONFIGURATION
  // ----------------------------------------------------
  console.log("\n--- TEST 1: LIVE .ENV VALIDATION ---");
  try {
    const report = validateFirebaseConfig();
    assert(report.ok === true, "Live Firebase configuration validated successfully");
    assert(report.projectId === "vanguardtrust-2026", `Project ID is correct (${report.projectId})`);
    assert(report.clientEmail.includes("vanguardtrust-2026.iam.gserviceaccount.com"), `Client Email is valid (${report.clientEmail})`);
    console.log(`[INFO] Configuration Source: ${report.source}`);
  } catch (err) {
    assert(false, `Live Firebase configuration failed validation: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST 2: PATH-BASED CONFIGURATION (ABSOLUTE PATH)
  // ----------------------------------------------------
  console.log("\n--- TEST 2: ABSOLUTE PATH VALIDATION ---");
  const originalEnv = Object.assign({}, process.env);
  try {
    const validPath = path.resolve(__dirname, "..", "server", "serviceAccount.json");
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = validPath;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

    const pathReport = validateFirebaseConfig();
    assert(pathReport.ok === true, "Absolute path validation passed");
    assert(pathReport.source.includes(validPath), "Source accurately points to absolute path");
  } catch (err) {
    assert(false, `Absolute path validation failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST 3: RAW JSON STRING CONFIGURATION
  // ----------------------------------------------------
  console.log("\n--- TEST 3: RAW JSON STRING VALIDATION ---");
  try {
    const keyContent = fs.readFileSync(path.resolve(__dirname, "..", "server", "serviceAccount.json"), "utf8");
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = keyContent;

    const jsonReport = validateFirebaseConfig();
    assert(jsonReport.ok === true, "Raw JSON string configuration validated successfully");
    assert(jsonReport.source === "FIREBASE_SERVICE_ACCOUNT_JSON", "Source accurately identified as JSON string");
  } catch (err) {
    assert(false, `Raw JSON string validation failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST 4: ERROR HANDLING & PRE-CHECK DIAGNOSTICS
  // ----------------------------------------------------
  console.log("\n--- TEST 4: ERROR HANDLING & PRE-CHECK DIAGNOSTICS ---");

  // 4a: Non-existent file path
  try {
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = "C:\\invalid\\nonexistent\\path\\key.json";
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    validateFirebaseConfig();
    assert(false, "Should have thrown for non-existent file path");
  } catch (err) {
    assert(err.message.includes("does not exist"), `Correctly caught non-existent file path: "${err.message}"`);
  }

  // 4b: Invalid JSON syntax in file or string
  try {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = "{ corrupt json ... ";
    validateFirebaseConfig();
    assert(false, "Should have thrown for corrupt JSON syntax");
  } catch (err) {
    assert(err.message.includes("invalid JSON syntax"), `Correctly caught corrupt JSON syntax: "${err.message}"`);
  }

  // 4c: Missing required project_id field
  try {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      type: "service_account",
      client_email: "test@example.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----"
    });
    validateFirebaseConfig();
    assert(false, "Should have thrown for missing project_id");
  } catch (err) {
    assert(err.message.includes("project_id"), `Correctly caught missing project_id: "${err.message}"`);
  }

  // 4d: Invalid private_key PEM format
  try {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      type: "service_account",
      project_id: "test-proj",
      client_email: "test@example.com",
      private_key: "not-a-valid-pem-key"
    });
    validateFirebaseConfig();
    assert(false, "Should have thrown for invalid private_key format");
  } catch (err) {
    assert(err.message.includes("private_key"), `Correctly caught invalid PEM private_key: "${err.message}"`);
  }

  // Restore original environment
  process.env = Object.assign({}, originalEnv);

  // ----------------------------------------------------
  // TEST 5: FIREBASE SERVICES INITIALIZATION & CONNECTIVITY
  // ----------------------------------------------------
  console.log("\n--- TEST 5: FIREBASE SERVICES INITIALIZATION ---");
  try {
    const auth = getAuth();
    assert(typeof auth.createUser === "function", "Firebase Admin Auth successfully initialized");

    const firestore = getFirestore();
    assert(typeof firestore.collection === "function", "Firebase Firestore successfully initialized");

    // Test a read operation against Firestore users collection
    const testDoc = await firestore.collection("users").limit(1).get();
    assert(testDoc !== null, "Firestore read operation executed without authentication error");
  } catch (err) {
    assert(false, `Firebase services initialization failed: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
})();
