const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function validateServiceAccountObject(obj, sourceDescription) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error(`Invalid Firebase service account from ${sourceDescription}: expected a JSON object.`);
  }

  const projectId = String(obj.project_id || "").trim();
  const clientEmail = String(obj.client_email || "").trim();
  const privateKey = String(obj.private_key || "").trim();
  const type = String(obj.type || "").trim();

  if (!projectId) {
    throw new Error(`Firebase service account from ${sourceDescription} is missing required 'project_id' field.`);
  }
  if (!clientEmail || !clientEmail.includes("@")) {
    throw new Error(`Firebase service account from ${sourceDescription} is missing or has an invalid 'client_email' field.`);
  }
  if (!privateKey) {
    throw new Error(`Firebase service account from ${sourceDescription} is missing required 'private_key' field.`);
  }
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
    throw new Error(`Firebase service account from ${sourceDescription} contains an invalid 'private_key' format (missing PEM headers).`);
  }

  return {
    ok: true,
    source: sourceDescription,
    projectId,
    clientEmail,
    type: type || "service_account",
    serviceAccount: obj
  };
}

function validateFirebaseConfig() {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const envBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  const defaultPath = path.join(__dirname, "serviceAccount.json");

  // 1. Check FIREBASE_SERVICE_ACCOUNT_PATH if provided
  if (envPath) {
    const resolvedPath = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH specified but file does not exist at: "${resolvedPath}". Ensure the absolute path is correct.`);
    }
    try {
      fs.accessSync(resolvedPath, fs.constants.R_OK);
    } catch (e) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH file at "${resolvedPath}" does not have read permissions: ${e.message}`);
    }

    let rawContent = "";
    try {
      rawContent = fs.readFileSync(resolvedPath, "utf8");
    } catch (e) {
      throw new Error(`Failed to read Firebase service account file at "${resolvedPath}": ${e.message}`);
    }

    let parsed = null;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH file at "${resolvedPath}" contains invalid JSON syntax: ${e.message}`);
    }

    return validateServiceAccountObject(parsed, `FIREBASE_SERVICE_ACCOUNT_PATH ("${resolvedPath}")`);
  }

  // 2. Check FIREBASE_SERVICE_ACCOUNT_JSON if provided
  if (envJson && typeof envJson === "string" && envJson.trim().length > 0) {
    let parsed = null;
    try {
      parsed = JSON.parse(envJson.trim());
    } catch (e) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON contains invalid JSON syntax: ${e.message}`);
    }
    return validateServiceAccountObject(parsed, "FIREBASE_SERVICE_ACCOUNT_JSON");
  }

  // 3. Check FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 if provided
  if (envBase64 && typeof envBase64 === "string" && envBase64.trim().length > 0) {
    let parsed = null;
    try {
      const decoded = Buffer.from(envBase64.trim(), "base64").toString("utf8");
      parsed = JSON.parse(decoded);
    } catch (e) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 contains invalid base64 or JSON syntax: ${e.message}`);
    }
    return validateServiceAccountObject(parsed, "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64");
  }

  // 4. Check default local file at server/serviceAccount.json
  if (fs.existsSync(defaultPath)) {
    try {
      fs.accessSync(defaultPath, fs.constants.R_OK);
      const rawContent = fs.readFileSync(defaultPath, "utf8");
      const parsed = JSON.parse(rawContent);
      return validateServiceAccountObject(parsed, `default local file ("${defaultPath}")`);
    } catch (e) {
      throw new Error(`Default serviceAccount.json at "${defaultPath}" is invalid: ${e.message}`);
    }
  }

  throw new Error(
    "Missing Firebase service account configuration. Set FIREBASE_SERVICE_ACCOUNT_PATH (absolute path to key file) or FIREBASE_SERVICE_ACCOUNT_JSON (complete JSON key content)."
  );
}

function getServiceAccount() {
  const result = validateFirebaseConfig();
  return result.serviceAccount;
}

function getAdminApp() {
  if (admin.apps.length > 0) return admin.app();

  const validation = validateFirebaseConfig();

  admin.initializeApp({
    credential: admin.credential.cert(validation.serviceAccount)
  });

  return admin.app();
}

function getAuth() {
  getAdminApp();
  return admin.auth();
}

function getFirestore() {
  getAdminApp();
  return admin.firestore();
}

module.exports = {
  getAuth,
  getFirestore,
  getAdminApp,
  getServiceAccount,
  validateFirebaseConfig
};

