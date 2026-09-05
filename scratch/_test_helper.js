const path = require("path");
const crypto = require("crypto");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const { getAuth, getFirestore } = require("../server/firebase");

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "vt_session";
const DEV_SESSION_COOKIE_NAME = process.env.DEV_SESSION_COOKIE_NAME || "vt_dev_session";
const SESSION_MAX_AGE_DAYS = Number(process.env.SESSION_MAX_AGE_DAYS || "5");
const SESSION_EXPIRES_IN_MS = (Number.isFinite(SESSION_MAX_AGE_DAYS) && SESSION_MAX_AGE_DAYS > 0 ? SESSION_MAX_AGE_DAYS : 5) * 24 * 60 * 60 * 1000;

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

async function tryExchangeIdToken(uid) {
  if (!FIREBASE_WEB_CONFIG?.apiKey) return null;
  const auth = getAuth();
  const customToken = await auth.createCustomToken(uid);
  try {
    const resp = await httpsRequest(
      "POST",
      "identitytoolkit.googleapis.com",
      `/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(FIREBASE_WEB_CONFIG.apiKey)}`,
      { body: { token: customToken, returnSecureToken: true } }
    );
    if (resp.status === 200 && resp.body?.idToken) return String(resp.body.idToken);
    return null;
  } catch (_) { return null; }
}

function deriveDevSigningSecret() {
  const seed = [
    process.env.PIN_COOKIE_SECRET || "",
    process.env.ADMIN_COOKIE_SECRET || "",
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON || ""
  ].join("|");
  return crypto.createHash("sha256").update(seed, "utf8").digest("hex");
}

function mintDevSessionCookie(uid, email) {
  const payload = { uid: String(uid), email: email ? String(email) : null, iat: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", deriveDevSigningSecret()).update(payloadB64, "utf8").digest("base64url");
  return `${payloadB64}.${sig}`;
}

async function createSessionCookieDirect(uid) {
  const auth = getAuth();
  let userEmail = null;
  try {
    const user = await auth.getUser(uid).catch(() => null);
    if (user?.uid) userEmail = user.email || null;
  } catch (_) {}

  if (process.env.NODE_ENV === "production") {
    const idToken = await tryExchangeIdToken(uid);
    if (!idToken) throw new Error("Production mode: network idToken exchange unavailable and direct session fallback disabled");
    return await auth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN_MS });
  }

  let idToken = await tryExchangeIdToken(uid);
  if (idToken) {
    try {
      return await auth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN_MS });
    } catch (_) {
      idToken = null;
    }
  }

  return mintDevSessionCookie(uid, userEmail);
}

async function loginUserForTest(uid, httpReqFn) {
  const jar = {};
  const idToken = await tryExchangeIdToken(uid);

  if (idToken) {
    try {
      const resp = await httpReqFn("POST", "/api/sessionLogin", { body: { idToken, remember: true } });
      if (resp.status === 200) {
        (resp.cookies || []).forEach((c) => { const [k, v] = c.split("="); if (k) jar[k.trim()] = (v || "").trim(); });
        if (jar[SESSION_COOKIE_NAME]) return { jar, via: "sessionLogin", idToken };
      }
    } catch (_) {}
  }

  const directCookie = await createSessionCookieDirect(uid);
  const startsWithDev = typeof directCookie === "string" && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(directCookie);
  if (startsWithDev) {
    jar[DEV_SESSION_COOKIE_NAME] = directCookie;
    jar[SESSION_COOKIE_NAME] = "vt_local_dev_placeholder";
  } else {
    jar[SESSION_COOKIE_NAME] = directCookie;
  }
  try {
    const db = getFirestore();
    await db.collection("users").doc(String(uid)).set(
      { lastLoginAt: new Date().toISOString() },
      { merge: true }
    ).catch(() => {});
  } catch (_) {}

  return { jar, via: startsWithDev ? "dev-session-hmac" : "direct-firebase-session", idToken: null };
}

function mergeCookiesInto(target, cookieArr) {
  (cookieArr || []).forEach((c) => {
    const [k, v] = String(c || "").split(";")[0].split("=");
    if (k) target[k.trim()] = (v || "").trim();
  });
}

function cookiesToHeader(obj) {
  return Object.entries(obj || {}).map(([k, v]) => `${k}=${v}`).join("; ");
}

function sha256Hex(s) { return crypto.createHash("sha256").update(String(s || "")).digest("hex"); }

module.exports = {
  SESSION_COOKIE_NAME,
  DEV_SESSION_COOKIE_NAME,
  SESSION_EXPIRES_IN_MS,
  loginUserForTest,
  mergeCookiesInto,
  cookiesToHeader,
  sha256Hex,
  tryExchangeIdToken,
  createSessionCookieDirect,
  mintDevSessionCookie,
  deriveDevSigningSecret
};
