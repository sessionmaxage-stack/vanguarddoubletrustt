const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

const { getAuth, getFirestore, validateFirebaseConfig } = require("./firebase");
const { getCookieName, getCookieOptions, getSessionExpiresInMs, requireAuth } = require("./auth");
const {
  generate6DigitOtp,
  maskEmail,
  encryptOtpRecord,
  decryptAndVerifyOtp,
  checkRateLimit,
  sendTransferOtpEmail,
  sendAccountCreatedOtpEmail
} = require("./transferOtp");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

(function initFirebasePreCheck() {
  try {
    const configReport = validateFirebaseConfig();
    console.log(`[Firebase] Service account pre-initialization check PASSED (Source: ${configReport.source}, Project: ${configReport.projectId}, Client: ${configReport.clientEmail})`);
  } catch (err) {
    console.error(`[Firebase] FATAL: Service account pre-initialization check FAILED:`, err.message);
  }
})();

(function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
  try {
    if (cloudinaryUrl) {
      cloudinary.config(cloudinaryUrl);
    } else if (cloudName) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Cloudinary] Init skipped:", e && e.message ? String(e.message) : e);
    }
  }
})();

const CLOUDINARY_CLOUD_NAME = String(cloudinary.config().cloud_name || process.env.CLOUDINARY_CLOUD_NAME || "");
const CLOUDINARY_UPLOAD_PRESET = String(process.env.CLOUDINARY_UPLOAD_PRESET || "vanguarddoubletrust_profile_unsigned");
const CLOUDINARY_PROFILE_FOLDER = String(process.env.CLOUDINARY_PROFILE_FOLDER || "vanguarddoubletrust/profiles");
const CLOUDINARY_URL_PATTERN = CLOUDINARY_CLOUD_NAME
  ? new RegExp(`^https://res\\.cloudinary\\.com/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/`, "i")
  : /^https:\/\/res\.cloudinary\.com\//i;

const app = express();

function deriveFallbackSecret(purpose) {
  const seed = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) : "";
  if (seed) {
    return crypto.createHash("sha256").update(`${purpose}:${seed}`, "utf8").digest("hex");
  }
  return crypto.randomBytes(32).toString("hex");
}

const pinCookieName = process.env.PIN_COOKIE_NAME || "vt_pin_verified";
const pinCookieSecret = process.env.PIN_COOKIE_SECRET || deriveFallbackSecret("vt_pin_cookie_secret");
const adminCookieName = process.env.ADMIN_COOKIE_NAME || "vt_admin_session";
const adminCookieSecret = process.env.ADMIN_COOKIE_SECRET || deriveFallbackSecret("vt_admin_cookie_secret");

app.set("trust proxy", 1);
app.disable("x-powered-by");

const corsOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    next();
    return;
  }

  const allowed = corsOrigins.length === 0 ? false : corsOrigins.includes(origin);
  if (!allowed) {
    next();
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const siteRoot = path.resolve(__dirname, "..");

const localAdminDataDir = path.join(__dirname, "data");
const localAdminUsersFile = path.join(localAdminDataDir, "admin_users.json");
const localAdminTransactionsFile = path.join(localAdminDataDir, "admin_transactions.json");
const localContactMessagesFile = path.join(localAdminDataDir, "contact_messages.json");
const localUploadsDir = path.join(siteRoot, "uploads", "profiles");

(function ensureLocalDataDir() {
  try {
    if (!fs.existsSync(localAdminDataDir)) fs.mkdirSync(localAdminDataDir, { recursive: true });
    if (!fs.existsSync(localAdminUsersFile)) fs.writeFileSync(localAdminUsersFile, JSON.stringify({}, null, 2), "utf8");
    if (!fs.existsSync(localAdminTransactionsFile)) fs.writeFileSync(localAdminTransactionsFile, JSON.stringify({}, null, 2), "utf8");
    if (!fs.existsSync(localContactMessagesFile)) fs.writeFileSync(localContactMessagesFile, JSON.stringify([], null, 2), "utf8");
    if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[VT] Local admin data init skipped:", e && e.message ? String(e.message) : e);
    }
  }
})();

function readLocalContactMessages() {
  try {
    if (!fs.existsSync(localContactMessagesFile)) return [];
    const raw = fs.readFileSync(localContactMessagesFile, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function writeLocalContactMessage(msg) {
  try {
    if (!fs.existsSync(localAdminDataDir)) fs.mkdirSync(localAdminDataDir, { recursive: true });
    const list = readLocalContactMessages();
    list.unshift(msg);
    fs.writeFileSync(localContactMessagesFile, JSON.stringify(list, null, 2), "utf8");
    return true;
  } catch (e) {
    return false;
  }
}

function readLocalUsers() {
  try {
    if (!fs.existsSync(localAdminUsersFile)) return {};
    const raw = fs.readFileSync(localAdminUsersFile, "utf8");
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch (e) {
    return {};
  }
}

function writeLocalUsers(users) {
  try {
    if (!fs.existsSync(localAdminDataDir)) fs.mkdirSync(localAdminDataDir, { recursive: true });
    fs.writeFileSync(localAdminUsersFile, JSON.stringify(users || {}, null, 2), "utf8");
    return true;
  } catch (e) {
    return false;
  }
}

function readLocalTransactions() {
  try {
    if (!fs.existsSync(localAdminTransactionsFile)) return {};
    const raw = fs.readFileSync(localAdminTransactionsFile, "utf8");
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch (e) {
    return {};
  }
}

function writeLocalTransactions(txs) {
  try {
    if (!fs.existsSync(localAdminDataDir)) fs.mkdirSync(localAdminDataDir, { recursive: true });
    fs.writeFileSync(localAdminTransactionsFile, JSON.stringify(txs || {}, null, 2), "utf8");
    return true;
  } catch (e) {
    return false;
  }
}

function localUsersToList() {
  const map = readLocalUsers();
  const now = new Date().toISOString();
  return Object.keys(map).map((uid) => {
    const data = map[uid] || {};
    const profile = data.profile || {};
    const account = data.account || {};
    return {
      uid: uid,
      email: data.email || null,
      firstname: profile.firstname || "",
      lastname: profile.lastname || "",
      phone: profile.phone || "",
      accountNumber: account.accountNumber || "",
      balance: Number(account.balance || 0),
      status: account.status || "ACTIVE",
      currency: account.currency || "USD",
      updatedAt: data.updatedAt || data.createdAt || now,
      createdAt: data.createdAt || now
    };
  }).sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

function mergeFirestoreUsersWithLocal(firestoreUsers) {
  const fsList = Array.isArray(firestoreUsers) ? firestoreUsers : [];
  const localList = localUsersToList();
  const seen = new Set();
  const merged = [];
  fsList.forEach((u) => {
    if (u && u.uid) {
      seen.add(u.uid);
      merged.push(u);
    }
  });
  localList.forEach((u) => {
    if (u && u.uid && !seen.has(u.uid)) {
      merged.push(u);
    }
  });
  return merged.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

app.use((req, res, next) => {
  const blocked =
    req.path === "/package.json" ||
    req.path.startsWith("/server") ||
    req.path.startsWith("/node_modules") ||
    req.path.startsWith("/.env") ||
    req.path.startsWith("/.git");
  if (blocked) {
    res.status(404).end();
    return;
  }
  next();
});

app.use((req, res, next) => {
  const p = String(req.path || "");
  if (p.startsWith("/customer/") && (p.endsWith(".php") || p.endsWith(".php.html"))) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", "inline");
  }
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(siteRoot, "index.php.html"));
});

app.get(/^\/css2(-\d+)?$/, (req, res) => {
  const filePath = path.join(siteRoot, req.path.slice(1));
  fs.readFile(filePath, "utf8", (err, content) => {
    if (err) {
      res.status(404).end();
      return;
    }
    res.type("text/css; charset=utf-8").send(content);
  });
});

function sendFirebaseConfigJs(req, res) {
  try {
    const raw = process.env.FIREBASE_WEB_CONFIG_JSON;
    if (!raw) {
      res.status(200).type("application/javascript").send("window.__FIREBASE_CONFIG__ = null;");
      return;
    }

    res.status(200).type("application/javascript").send(`window.__FIREBASE_CONFIG__ = ${raw};`);
  } catch {
    res.status(200).type("application/javascript").send("window.__FIREBASE_CONFIG__ = null;");
  }
}

app.get("/firebase-config.js", sendFirebaseConfigJs);
app.get("/customer/firebase-config.js", sendFirebaseConfigJs);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "vanguarddoubletrust", ts: new Date().toISOString() });
});

app.post("/api/sessionLogin", async (req, res) => {
  try {
    const idToken = String(req.body?.idToken || "");
    if (!idToken) {
      res.status(400).json({ error: "Missing idToken" });
      return;
    }

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const uid = String(decoded.uid);
    const email = decoded.email || null;

    const expiresIn = getSessionExpiresInMs();
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    res.cookie(getCookieName(), sessionCookie, { ...getCookieOptions(), maxAge: expiresIn });
    res.clearCookie(pinCookieName, getCookieOptions());

    try {
      await ensureUserDoc(uid, email);
      await touchLastLogin(uid);
    } catch (e) {
      process.stderr.write(`[firebase] Firestore bootstrap failed: ${e?.message || e}\n`);
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    process.stderr.write(`[firebase] Session login failed: ${e?.message || e}\n`);
    res.status(401).json({
      error: "Session login failed",
      detail: process.env.NODE_ENV === "production" ? undefined : String(e?.message || e)
    });
  }
});

app.post("/api/sessionLogout", async (req, res) => {
  const cookieName = getCookieName();
  const sessionCookie = req.cookies?.[cookieName];
  res.clearCookie(cookieName, getCookieOptions());
  res.clearCookie(pinCookieName, getCookieOptions());

  try {
    if (sessionCookie) {
      const auth = getAuth();
      const decoded = await auth.verifySessionCookie(sessionCookie).catch(() => null);
      if (decoded?.sub) {
        await auth.revokeRefreshTokens(decoded.sub).catch(() => {});
      }
    }
  } catch {}

  res.status(200).json({ ok: true });
});

function generateAccountNumber() {
  const n = Math.floor(1000000000 + Math.random() * 9000000000);
  return String(n);
}

app.post("/api/auth/register", async (req, res) => {
  res.status(410).json({ error: "Deprecated. Use Firebase client auth + /api/sessionLogin." });
});

app.post("/api/auth/login", async (req, res) => {
  res.status(410).json({ error: "Deprecated. Use Firebase client auth + /api/sessionLogin." });
});

app.post("/api/auth/logout", async (req, res) => {
  res.status(410).json({ error: "Deprecated. Use /api/sessionLogout." });
});

function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function makeTxId() {
  try {
    return crypto.randomUUID();
  } catch {
    return crypto.randomBytes(16).toString("hex");
  }
}

function nowIso() {
  return new Date().toISOString();
}

async function writeTransaction({ uid, type, amount, currency, status, note, from, to, reference, createdBy }) {
  const txId = makeTxId();
  const payload = {
    uid: String(uid),
    type: String(type || "").trim(),
    amount: Number(amount),
    currency: String(currency || "USD"),
    status: String(status || "PENDING"),
    createdAt: nowIso(),
    ...(note != null ? { note: String(note) } : {}),
    ...(from != null ? { from } : {}),
    ...(to != null ? { to } : {}),
    ...(reference != null ? { reference: String(reference) } : {}),
    ...(createdBy != null ? { createdBy: String(createdBy) } : {})
  };

  const db = getFirestore();
  const batch = db.batch();
  const userTxRef = db.collection("users").doc(String(uid)).collection("transactions").doc(txId);
  const globalRef = db.collection("transactions").doc(txId);
  batch.set(userTxRef, payload);
  batch.set(globalRef, payload);
  await batch.commit();
  return { id: txId, ...payload };
}

function isStrongSecret(value) {
  const s = String(value || "");
  return s.length >= 8 && /[A-Z]/.test(s) && /\d/.test(s) && /[^A-Za-z0-9]/.test(s);
}

function isSixDigitPin(value) {
  return /^\d{6}$/.test(String(value || "").trim());
}

function isTransferCodeValid(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  return isSixDigitPin(v) || isStrongSecret(v);
}

function signPinCookie(uid, expMs) {
  const payload = `${uid}.${expMs}`;
  const sig = crypto.createHmac("sha256", pinCookieSecret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function base64UrlEncode(value) {
  return Buffer.from(String(value || ""), "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const raw = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - (raw.length % 4));
  return Buffer.from(raw + pad, "base64").toString("utf8");
}

function signAdminCookie(email, expMs) {
  const payload = base64UrlEncode(JSON.stringify({ e: String(email || ""), x: Number(expMs) }));
  const sig = crypto.createHmac("sha256", adminCookieSecret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyPinCookie(token, uid) {
  const raw = String(token || "");
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [tUid, tExp, tSig] = parts;
  if (!tUid || !tExp || !tSig) return false;
  if (String(tUid) !== String(uid)) return false;
  const expMs = Number(tExp);
  if (!Number.isFinite(expMs) || expMs <= Date.now()) return false;
  const expected = crypto.createHmac("sha256", pinCookieSecret).update(`${tUid}.${tExp}`).digest("hex");
  try {
    const a = Buffer.from(String(tSig), "hex");
    const b = Buffer.from(String(expected), "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function verifyAdminCookie(token, email) {
  const raw = String(token || "");
  const parts = raw.split(".");
  if (parts.length !== 2) return false;
  const [payload, tSig] = parts;
  if (!payload || !tSig) return false;
  const expected = crypto.createHmac("sha256", adminCookieSecret).update(payload).digest("hex");
  try {
    const a = Buffer.from(String(tSig), "hex");
    const b = Buffer.from(String(expected), "hex");
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;

    const decoded = JSON.parse(base64UrlDecode(payload));
    const tEmail = decoded?.e;
    const expMs = Number(decoded?.x);
    if (!tEmail || !Number.isFinite(expMs) || expMs <= Date.now()) return false;
    return String(tEmail) === String(email);
  } catch {
    return false;
  }
}

function isPinVerified(req) {
  const token = req.cookies?.[pinCookieName];
  const uid = req.user?.uid;
  if (!token || !uid) return false;
  return verifyPinCookie(token, uid);
}

function requirePinVerified(req, res, next) {
  if (isPinVerified(req)) {
    next();
    return;
  }
  res.redirect("/customer/verify-pin.php");
}

function getUserFromReqOrUser(reqOrUser) {
  if (!reqOrUser) return {};
  if (reqOrUser.user && typeof reqOrUser.user === "object") return reqOrUser.user;
  return reqOrUser;
}

function hasKycCompleted(reqOrUser) {
  const u = getUserFromReqOrUser(reqOrUser);
  const p = (u && typeof u.profile === "object" && u.profile) ? u.profile : {};
  const s = (u && typeof u.security === "object" && u.security) ? u.security : {};
  const directFlag = Boolean(
    s?.kycCompleted === true || s?.KYCDone === true || s?.kycDone === true ||
    p?.kycCompleted === true || p?.KYCDone === true || p?.kycDone === true ||
    u?.kycCompleted === true || u?.KYCDone === true || u?.kycDone === true
  );
  return Boolean(directFlag);
}

function hasProfilePic(reqOrUser) {
  const u = getUserFromReqOrUser(reqOrUser);
  const p = (u && typeof u.profile === "object" && u.profile) ? u.profile : {};
  const s = (u && typeof u.security === "object" && u.security) ? u.security : {};
  const pic = String(
    p?.profilePic || p?.photoURL || p?.photo || p?.avatar ||
    s?.profilePic || s?.photoURL || s?.photo || s?.avatar ||
    u?.profilePic || u?.photoURL || u?.photo || u?.avatar || ""
  ).trim();
  return Boolean(pic && pic !== "");
}

function onboardingIsRequired(reqOrUser) {
  return false;
}

function requireKycAndProfilePic(req, res, next) {
  next();
}

function adminCredentials() {
  return {
    email: String(process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
    password: String(process.env.ADMIN_PASSWORD || "")
  };
}

function isAdminConfigured() {
  const creds = adminCredentials();
  return Boolean(creds.email && creds.password);
}

function isAdminAuthenticated(req) {
  const creds = adminCredentials();
  if (!creds.email) return false;
  const token = req.cookies?.[adminCookieName];
  if (!token) return false;
  return verifyAdminCookie(token, creds.email);
}

function requireAdminAuth(req, res, next) {
  if (!isAdminConfigured()) {
    res.status(503).json({ error: "Admin credentials are not configured on the server." });
    return;
  }
  if (!isAdminAuthenticated(req)) {
    if (String(req.path || "").startsWith("/api/")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.redirect("/admin/login.html");
    return;
  }
  req.admin = { email: adminCredentials().email };
  next();
}

function normalizeFirebaseAdminError(error, fallbackMessage) {
  // TEMPORARY – show real error
  console.error("REAL FIREBASE ERROR:", error);
  return {
    status: 500,
    error: String(error?.message || error || fallbackMessage || "Unknown error")
  };
}

async function ensureUserDoc(uid, email) {
  const db = getFirestore();
  const ref = db.collection("users").doc(String(uid));
  const snap = await ref.get().catch(() => null);
  const cleanEmail = email ? String(email).trim().toLowerCase() : null;
  if (snap?.exists) {
    const existing = snap.data() || {};
    if (cleanEmail && (!existing.email || !existing.profile?.email)) {
      await ref.set({
        email: cleanEmail,
        profile: Object.assign({}, existing.profile || {}, { email: cleanEmail })
      }, { merge: true }).catch(() => {});
    }
    return;
  }

  const nowIso = new Date().toISOString();
  await ref.set(
    {
      email: cleanEmail,
      createdAt: nowIso,
      updatedAt: nowIso,
      profile: { preferredLanguage: "en", email: cleanEmail },
      security: { twoFactorEnabled: true },
      account: {
        accountNumber: generateAccountNumber(),
        status: "ACTIVE",
        branchCode: "RBSUS001",
        openingDate: nowIso,
        lastLogin: nowIso,
        currency: "USD",
        balance: 4365423
      },
      onboarding: { required: false }
    },
    { merge: true }
  );
}

async function touchLastLogin(uid) {
  const db = getFirestore();
  const ref = db.collection("users").doc(String(uid));
  await ref.set({ account: { lastLogin: new Date().toISOString() }, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
}

app.get("/api/me", requireAuth, async (req, res) => {
  const uid = String(req.user?.uid || "");
  let freshUser = req.user || {};
  if (uid) {
    try {
      const db = getFirestore();
      const snap = await db.collection("users").doc(uid).get();
      if (snap && snap.exists) {
        const dbData = snap.data() || {};
        const accountObj = typeof dbData.account === "object" && dbData.account ? dbData.account : {};
        const profileObj = typeof dbData.profile === "object" && dbData.profile ? dbData.profile : {};
        const securityObj = typeof dbData.security === "object" && dbData.security ? dbData.security : {};
        freshUser = Object.assign({}, req.user || {}, {
          uid: uid,
          email: (req.user && req.user.email) || (profileObj && profileObj.email) || dbData.email || null,
          account: accountObj,
          profile: profileObj,
          security: securityObj,
          onboarding: typeof dbData.onboarding === "object" && dbData.onboarding ? dbData.onboarding : (req.user && req.user.onboarding) || null,
          country: profileObj.country || dbData.country || null,
          preferredLanguage: profileObj.preferredLanguage || dbData.preferredLanguage || "en",
          firstname: profileObj.firstname || dbData.firstname || "",
          lastname: profileObj.lastname || dbData.lastname || "",
          profilePic: profileObj.profilePic || profileObj.photoURL || dbData.profilePic || dbData.photoURL || "",
          createdAt: dbData.createdAt || (req.user && req.user.createdAt) || null,
          updatedAt: dbData.updatedAt || (req.user && req.user.updatedAt) || null
        });
        req.user = freshUser;
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[VT] /api/me firestore refresh failed:", e && e.message ? String(e.message) : e);
      }
    }
  }

  const sec = freshUser?.security || {};
  const prof = freshUser?.profile || {};
  const ob = freshUser?.onboarding || {};
  const kycCompleted = hasKycCompleted(freshUser);
  const picDone = hasProfilePic(freshUser);

  const finalLang = String(prof?.preferredLanguage || prof?.language || sec?.preferredLanguage || freshUser?.preferredLanguage || "en");
  const finalPicUrl = String(
    prof?.profilePic || prof?.photoURL || prof?.photo || prof?.avatar ||
    sec?.profilePic || sec?.photoURL || sec?.photo || sec?.avatar ||
    freshUser?.profilePic || freshUser?.photoURL || ""
  );

  const finalProfile = Object.assign({}, prof || {}, {
    firstname: prof?.firstname || freshUser?.firstname || "",
    lastname: prof?.lastname || freshUser?.lastname || "",
    country: prof?.country || freshUser?.country || "",
    preferredLanguage: finalLang,
    phone: prof?.phone || freshUser?.phone || "",
    dateOfBirth: prof?.dateOfBirth || prof?.dob || freshUser?.dateOfBirth || "",
    gender: prof?.gender || freshUser?.gender || "",
    address: prof?.address || freshUser?.address || "",
    city: prof?.city || freshUser?.city || "",
    state: prof?.state || freshUser?.state || "",
    zipCode: prof?.zipCode || prof?.zip || prof?.postal || freshUser?.zipCode || "",
    nationality: prof?.nationality || freshUser?.nationality || "",
    occupation: prof?.occupation || freshUser?.occupation || "",
    profilePic: finalPicUrl,
    photoURL: finalPicUrl,
    photo: finalPicUrl,
    avatar: finalPicUrl,
    profilePicPublicId: prof?.profilePicPublicId || sec?.profilePicPublicId || null,
    kycCompleted: kycCompleted,
    kycDone: kycCompleted,
    KYCDone: kycCompleted,
    kycCompletedAt: prof?.kycCompletedAt || prof?.KYCDoneAt || prof?.kycDoneAt || sec?.kycCompletedAt || null
  });

  const finalSecurity = Object.assign({}, sec || {}, {
    twoFactorEnabled: Boolean(sec?.twoFactorEnabled !== false),
    kycCompleted: kycCompleted,
    kycDone: kycCompleted,
    KYCDone: kycCompleted,
    kycCompletedAt: sec?.kycCompletedAt || prof?.kycCompletedAt || null,
    profilePic: finalPicUrl,
    photoURL: finalPicUrl,
    photo: finalPicUrl,
    avatar: finalPicUrl,
    accountPinHashSet: Boolean(sec?.accountPinHash)
  });

  const onboardingInfo = {
    required: false,
    kycCompleted: true,
    profilePicUploaded: true
  };

  res.json({
    uid: freshUser.uid,
    email: freshUser.email || null,
    profile: finalProfile,
    account: freshUser.account || null,
    security: finalSecurity,
    preferredLanguage: finalLang,
    profilePic: finalPicUrl,
    photoURL: finalPicUrl,
    photo: finalPicUrl,
    avatar: finalPicUrl,
    createdAt: freshUser.createdAt || null,
    updatedAt: freshUser.updatedAt || null,
    pinVerified: isPinVerified(req),
    onboarding: onboardingInfo
  });
});

app.get("/api/upload/config", (req, res) => {
  res.json({
    ok: true,
    provider: "cloudinary",
    cloudName: CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: CLOUDINARY_UPLOAD_PRESET || "",
    folder: CLOUDINARY_PROFILE_FOLDER || "",
    enabled: Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET),
    maxBytes: 8 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp", "gif", "avif"]
  });
});

function isSafeCloudinaryUrl(secureUrl) {
  if (typeof secureUrl !== "string" || !secureUrl) return false;
  const trimmed = secureUrl.trim();
  if (!trimmed) return false;
  if (trimmed.length > 2000000) return false;
  if (/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(trimmed)) return true;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch (e) {
      return false;
    }
  }
  return false;
}

app.post("/api/customer/profile-pic", requireAuth, async (req, res) => {
  res.status(410).json({ error: "User-facing profile picture updates are disabled. Please contact an administrator for profile picture changes." });
  return;
});

function cleanString(v, maxLen) {
  if (typeof v !== "string") return "";
  const s = v.trim();
  if (!s) return "";
  if (maxLen && s.length > maxLen) return s.slice(0, maxLen);
  return s;
}

function buildAllowedLanguageSet() {
  return new Set([
    "aa","ab","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bh","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","io","is","it","iu","ja","jv","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","sh","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu",
    "en-US","en-GB","en-CA","en-AU","en-NZ","en-IN","en-ZA","en-NG","en-PH","es-ES","es-MX","es-AR","es-CL","es-CO","es-PE","pt-BR","pt-PT","fr-FR","fr-CA","fr-BE","fr-CH","de-DE","de-AT","de-CH","it-IT","it-CH","nl-NL","nl-BE","sv-SE","nb-NO","da-DK","fi-FI","pl-PL","ru-RU","uk-UA","zh-CN","zh-TW","zh-HK","ja-JP","ko-KR","ar-SA","ar-AE","ar-EG","ar-MA","hi-IN","bn-BD","bn-IN","ur-PK","ur-IN","ta-IN","ta-LK","te-IN","ml-IN","mr-IN","gu-IN","pa-IN","th-TH","vi-VN","id-ID","ms-MY","ms-SG","tr-TR","he-IL","fa-IR","ps-AF","ku-IQ","ha-NG","yo-NG","ig-NG","sw-KE","sw-TZ","am-ET","so-SO","tl-PH","hu-HU","cs-CZ","sk-SK","ro-RO","bg-BG","sr-RS","hr-HR","sl-SI","el-GR","lt-LT","lv-LV","et-EE","az-AZ","kk-KZ","uz-UZ","ky-KG","tg-TJ","ka-GE","hy-AM","be-BY","mk-MK","sq-AL","af-ZA","zu-ZA","xh-ZA","st-ZA","tn-ZA","ss-ZA","ve-ZA","nr-ZA"
  ]);
}

app.post("/api/customer/kyc", requireAuth, async (req, res) => {
  res.status(410).json({ error: "User-facing KYC submission is disabled. Please contact an administrator for KYC updates." });
  return;

  const b = req.body || {};
  const phone = cleanString(b.phone, 40);
  const country = cleanString(b.country, 80);
  const preferredLanguage = cleanString(b.preferredLanguage, 16) || "en";
  const dateOfBirth = cleanString(b.dateOfBirth || b.dob, 32);
  const gender = cleanString(b.gender, 32);
  const address = cleanString(b.address, 240);
  const city = cleanString(b.city, 100);
  const state = cleanString(b.state, 100);
  const zipCode = cleanString(b.zipCode || b.zip || b.postal, 32);
  const nationality = cleanString(b.nationality, 100);
  const occupation = cleanString(b.occupation, 120);

  if (!country) {
    res.status(400).json({ error: "Country is required." });
    return;
  }

  const allowedLangs = buildAllowedLanguageSet();
  const langCode = allowedLangs.has(preferredLanguage)
    ? preferredLanguage
    : allowedLangs.has(preferredLanguage.split("-")[0])
      ? preferredLanguage.split("-")[0]
      : "en";

  const uid = req.user.uid;
  await ensureUserDoc(uid, req.user.email);
  const nowIso = new Date().toISOString();

  const existingSnapshot = await (async () => {
    try {
      const db = getFirestore();
      const existingSnap = await db.collection("users").doc(String(uid)).get().catch(() => null);
      if (existingSnap && existingSnap.exists) return existingSnap.data() || {};
    } catch (_) {}
    return {};
  })();
  const existingProfile = typeof existingSnapshot?.profile === "object" && existingSnapshot.profile ? existingSnapshot.profile : {};
  const existingSecurity = typeof existingSnapshot?.security === "object" && existingSnapshot.security ? existingSnapshot.security : {};

  const finalFirstName = cleanString(b.firstname || b.firstName || existingProfile.firstname || existingProfile.firstName, 80) || cleanString(existingProfile.firstname, 80);
  const finalLastName = cleanString(b.lastname || b.lastName || existingProfile.lastname || existingProfile.lastName, 80) || cleanString(existingProfile.lastname, 80);
  const finalPhone = phone || existingProfile.phone || "";
  const finalDob = dateOfBirth || existingProfile.dateOfBirth || existingProfile.dob || "";
  const finalGender = gender || existingProfile.gender || "";
  const finalAddress = address || existingProfile.address || "";
  const finalCity = city || existingProfile.city || "";
  const finalState = state || existingProfile.state || "";
  const finalZip = zipCode || existingProfile.zipCode || existingProfile.zip || "";
  const finalNationality = nationality || existingProfile.nationality || "";
  const finalOccupation = occupation || existingProfile.occupation || "";

  const userProfileUpdate = Object.assign({}, existingProfile, {
    firstname: finalFirstName,
    lastname: finalLastName,
    country: country,
    preferredLanguage: langCode,
    phone: finalPhone,
    dateOfBirth: finalDob,
    gender: finalGender,
    address: finalAddress,
    city: finalCity,
    state: finalState,
    zipCode: finalZip,
    nationality: finalNationality,
    occupation: finalOccupation,
    kycCompleted: true,
    kycDone: true,
    KYCDone: true,
    kycCompletedAt: nowIso,
    kycDoneAt: nowIso,
    KYCDoneAt: nowIso
  });

  const userSecurityUpdate = Object.assign({}, existingSecurity, {
    kycCompleted: true,
    kycDone: true,
    KYCDone: true,
    kycCompletedAt: nowIso,
    kycDoneAt: nowIso,
    KYCDoneAt: nowIso
  });

  const onboardingRequired = !(hasKycCompleted({ profile: userProfileUpdate, security: userSecurityUpdate, ...existingSnapshot }) && hasProfilePic({ profile: userProfileUpdate, security: userSecurityUpdate, ...existingSnapshot }));

  const existingOnboarding = (existingSnapshot && typeof existingSnapshot.onboarding === "object" && existingSnapshot.onboarding) ? existingSnapshot.onboarding : {};
  const existingObRequired = typeof existingOnboarding.required === "boolean" ? existingOnboarding.required : null;
  let finalOnboardingRequiredForSave;
  if (!onboardingRequired) {
    finalOnboardingRequiredForSave = false;
  } else if (existingObRequired === false) {
    finalOnboardingRequiredForSave = false;
  } else if (existingObRequired != null) {
    finalOnboardingRequiredForSave = existingObRequired;
  } else {
    finalOnboardingRequiredForSave = onboardingRequired;
  }

  const updates = {
    updatedAt: nowIso,
    profile: userProfileUpdate,
    security: userSecurityUpdate,
    country: country,
    preferredLanguage: langCode,
    firstname: finalFirstName,
    lastname: finalLastName,
    kycCompleted: true,
    onboarding: { required: finalOnboardingRequiredForSave }
  };

  let dbSnapshot = null;
  try {
    const db = getFirestore();
    await db.collection("users").doc(String(uid)).set(updates, { merge: true });
    const refreshedSnap = await db.collection("users").doc(String(uid)).get().catch(() => null);
    dbSnapshot = refreshedSnap && refreshedSnap.exists ? (refreshedSnap.data() || {}) : null;
  } catch (e) {
    const normalized = normalizeFirebaseAdminError(e, "Unable to save KYC profile.");
    res.status(normalized.status).json({ error: normalized.error });
    return;
  }

  const profSnapshot = ((dbSnapshot && dbSnapshot.profile) || userProfileUpdate) ;
  const secSnapshot = ((dbSnapshot && dbSnapshot.security) || userSecurityUpdate) ;
  const fullRefreshedUser = { uid, profile: profSnapshot, security: secSnapshot, ...dbSnapshot };

  const picUrl = String(
    profSnapshot.profilePic || profSnapshot.photoURL || profSnapshot.photo || profSnapshot.avatar ||
    secSnapshot.profilePic || secSnapshot.photoURL || secSnapshot.photo || secSnapshot.avatar ||
    existingProfile.profilePic || existingProfile.photoURL || ""
  );
  const kycDoneFinal = hasKycCompleted(fullRefreshedUser);
  const picDoneFinal = hasProfilePic(fullRefreshedUser);
  const persistedObFinal = (dbSnapshot?.onboarding && typeof dbSnapshot.onboarding.required === "boolean")
    ? dbSnapshot.onboarding.required
    : null;
  const heuristicObFinalKyc = !(kycDoneFinal && picDoneFinal);
  let finalOnboardingRequired;
  if (!heuristicObFinalKyc) {
    finalOnboardingRequired = false;
  } else if (persistedObFinal === false) {
    finalOnboardingRequired = false;
  } else if (persistedObFinal != null) {
    finalOnboardingRequired = persistedObFinal;
  } else {
    finalOnboardingRequired = heuristicObFinalKyc;
  }

  res.status(200).json({
    ok: true,
    preferredLanguage: langCode,
    profilePic: picUrl,
    onboarding: {
      required: finalOnboardingRequired,
      kycCompleted: kycDoneFinal,
      profilePicUploaded: picDoneFinal
    },
    profile: Object.assign({}, profSnapshot, {
      firstname: finalFirstName,
      lastname: finalLastName,
      country: country,
      preferredLanguage: langCode,
      dateOfBirth: finalDob,
      gender: finalGender,
      address: finalAddress,
      city: finalCity,
      state: finalState,
      zipCode: finalZip,
      nationality: finalNationality,
      occupation: finalOccupation,
      phone: finalPhone,
      profilePic: picUrl,
      photoURL: picUrl,
      photo: picUrl,
      avatar: picUrl,
      profilePicPublicId: profSnapshot.profilePicPublicId || null,
      kycCompleted: true,
      kycDone: true,
      KYCDone: true,
      kycCompletedAt: nowIso,
      kycDoneAt: nowIso,
      KYCDoneAt: nowIso
    }),
    security: Object.assign({}, secSnapshot, {
      kycCompleted: true,
      kycDone: true,
      KYCDone: true,
      kycCompletedAt: nowIso,
      kycDoneAt: nowIso,
      KYCDoneAt: nowIso,
      twoFactorEnabled: Boolean(secSnapshot.twoFactorEnabled || false)
    })
  });
});

app.post("/api/pin/verify", requireAuth, async (req, res) => {
  const pin = String(req.body?.accountPin || "").trim();
  if (!isSixDigitPin(pin)) {
    res.status(400).json({ error: "Account PIN must be exactly 6 digits." });
    return;
  }

  const uid = req.user.uid;
  const db = getFirestore();
  const snap = await db.collection("users").doc(String(uid)).get().catch(() => null);
  const data = snap?.exists ? snap.data() : null;
  const storedHash = data?.security?.accountPinHash || null;
  if (!storedHash) {
    res.status(400).json({ error: "Account PIN is not set for this account." });
    return;
  }

  const hash = sha256Hex(pin);
  if (String(hash) !== String(storedHash)) {
    res.status(401).json({ error: "Invalid Account PIN." });
    return;
  }

  const expMs = Date.now() + getSessionExpiresInMs();
  res.cookie(pinCookieName, signPinCookie(uid, expMs), getCookieOptions());
  res.status(200).json({ ok: true });
});

app.put("/api/profile", requireAuth, async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    country,
    state,
    city,
    dob,
    dateOfBirth,
    gender,
    acctype,
    brname,
    address,
    zipCode,
    zip,
    postal,
    nationality,
    occupation,
    profilePic,
    profile_pic,
    photoUrl,
    photoURL,
    avatar,
    accountPin,
    transferPin,
    preferredLanguage
  } = req.body || {};

  const uid = req.user.uid;
  const userEmail = String(email || req.user?.email || "").trim().toLowerCase();
  await ensureUserDoc(uid, userEmail || req.user?.email);

  const db = getFirestore();
  const existingSnapshot = await (async () => {
    try {
      const snap = await db.collection("users").doc(String(uid)).get().catch(() => null);
      if (snap && snap.exists) return snap.data() || {};
    } catch (_) {}
    return {};
  })();

  const prof = typeof existingSnapshot?.profile === "object" && existingSnapshot.profile ? existingSnapshot.profile : ((req.user?.profile) || {});
  const sec = typeof existingSnapshot?.security === "object" && existingSnapshot.security ? existingSnapshot.security : ((req.user?.security) || {});

  const newProfile = Object.assign({}, prof);
  const newSecurity = Object.assign({}, sec);

  if (userEmail) newProfile.email = userEmail;
  if (typeof firstname === "string") newProfile.firstname = firstname.trim();
  if (typeof lastname === "string") newProfile.lastname = lastname.trim();
  if (typeof phone === "string") newProfile.phone = phone.trim();
  if (typeof country === "string") newProfile.country = country.trim();
  if (typeof state === "string") newProfile.state = state.trim();
  if (typeof city === "string") newProfile.city = city.trim();
  if (typeof dob === "string" && dob.trim()) newProfile.dateOfBirth = dob.trim();
  if (typeof dateOfBirth === "string" && dateOfBirth.trim()) newProfile.dateOfBirth = dateOfBirth.trim();
  if (typeof gender === "string") newProfile.gender = gender.trim();
  if (typeof acctype === "string") newProfile.acctype = acctype.trim();
  if (typeof brname === "string") newProfile.brname = brname.trim();
  if (typeof address === "string") newProfile.address = address.trim();
  if (typeof zipCode === "string" && zipCode.trim()) newProfile.zipCode = zipCode.trim();
  else if (typeof zip === "string" && zip.trim()) newProfile.zipCode = zip.trim();
  else if (typeof postal === "string" && postal.trim()) newProfile.zipCode = postal.trim();
  if (typeof nationality === "string" && nationality.trim()) newProfile.nationality = nationality.trim();
  if (typeof occupation === "string" && occupation.trim()) newProfile.occupation = occupation.trim();

  const rawPic =
    (typeof profilePic === "string" ? profilePic : "") ||
    (typeof profile_pic === "string" ? profile_pic : "") ||
    (typeof photoUrl === "string" ? photoUrl : "") ||
    (typeof photoURL === "string" ? photoURL : "") ||
    (typeof avatar === "string" ? avatar : "");
  if (rawPic !== "" ||
      typeof profilePic !== "undefined" ||
      typeof profile_pic !== "undefined" ||
      typeof photoUrl !== "undefined" ||
      typeof photoURL !== "undefined" ||
      typeof avatar !== "undefined") {
    const safe = rawPic.trim();
    if (safe === "") {
      newProfile.profilePic = "";
      newProfile.photoURL = "";
      newProfile.photo = "";
      newProfile.avatar = "";
      newSecurity.profilePic = "";
      newSecurity.photoURL = "";
      newSecurity.photo = "";
      newSecurity.avatar = "";
    } else if (isSafeCloudinaryUrl(safe)) {
      newProfile.profilePic = safe;
      newProfile.photoURL = safe;
      newProfile.photo = safe;
      newProfile.avatar = safe;
      newSecurity.profilePic = safe;
      newSecurity.photoURL = safe;
      newSecurity.photo = safe;
      newSecurity.avatar = safe;
    } else {
      res.status(400).json({ error: "Invalid profile picture URL. Please upload via Cloudinary first." });
      return;
    }
  }

  if (typeof preferredLanguage === "string" && preferredLanguage.trim()) {
    const allowedLangs = buildAllowedLanguageSet();
    let langCode = preferredLanguage.trim();
    if (!allowedLangs.has(langCode)) {
      const base = langCode.split("-")[0];
      langCode = allowedLangs.has(base) ? base : (prof?.preferredLanguage || "en");
    }
    newProfile.preferredLanguage = langCode;
  }

  if (typeof accountPin === "string" && accountPin.trim()) {
    const v = accountPin.trim();
    if (!isSixDigitPin(v)) {
      res.status(400).json({ error: "accountPin must be exactly 6 digits." });
      return;
    }
    newSecurity.accountPinHash = sha256Hex(v);
  }

  if (typeof transferPin === "string" && transferPin.trim()) {
    const v = transferPin.trim();
    if (!isTransferCodeValid(v)) {
      res.status(400).json({ error: "transferPin must be 6 digits or 8+ chars with uppercase, number, and special character." });
      return;
    }
    newSecurity.transferPinHash = sha256Hex(v);
  }

  const nowIso = new Date().toISOString();
  if (newProfile.country && newProfile.preferredLanguage && newProfile.firstname && newProfile.lastname) {
    newSecurity.kycCompleted = true;
    newSecurity.KYCDone = true;
    newSecurity.kycDone = true;
    newProfile.kycCompleted = true;
    newProfile.KYCDone = true;
    newProfile.kycDone = true;
  }

  const kycForOnboarding = hasKycCompleted({ profile: newProfile, security: newSecurity, ...existingSnapshot });
  const picForOnboarding = hasProfilePic({ profile: newProfile, security: newSecurity, ...existingSnapshot });
  const heuristicOb = !(kycForOnboarding && picForOnboarding);
  const existingObForSave = (existingSnapshot && typeof existingSnapshot.onboarding === "object" && existingSnapshot.onboarding) ? existingSnapshot.onboarding : {};
  const existingObReq = typeof existingObForSave.required === "boolean" ? existingObForSave.required : null;
  let obRequiredForSave;
  if (!heuristicOb) {
    obRequiredForSave = false;
  } else if (existingObReq === false) {
    obRequiredForSave = false;
  } else if (existingObReq != null) {
    obRequiredForSave = existingObReq;
  } else {
    obRequiredForSave = heuristicOb;
  }

  const updates = {
    updatedAt: nowIso,
    ...(userEmail ? { email: userEmail } : {}),
    profile: newProfile,
    security: newSecurity,
    country: newProfile.country || "",
    preferredLanguage: newProfile.preferredLanguage || "en",
    firstname: newProfile.firstname || "",
    lastname: newProfile.lastname || "",
    profilePic: newProfile.profilePic || "",
    photoURL: newProfile.photoURL || "",
    kycCompleted: Boolean(newSecurity.kycCompleted || newProfile.kycCompleted),
    onboarding: { required: obRequiredForSave }
  };

  let refreshedSnap = null;
  try {
    await db.collection("users").doc(String(uid)).set(updates, { merge: true });
    const r = await db.collection("users").doc(String(uid)).get().catch(() => null);
    refreshedSnap = r && r.exists ? (r.data() || {}) : null;
  } catch (e) {
    const normalized = normalizeFirebaseAdminError(e, "Unable to save profile.");
    res.status(normalized.status).json({ error: normalized.error });
    return;
  }

  const fsProf = (refreshedSnap && refreshedSnap.profile) || newProfile || {};
  const fsSec = (refreshedSnap && refreshedSnap.security) || newSecurity || {};
  const fsOb = (refreshedSnap && refreshedSnap.onboarding) || {};
  const fullRefUser = { uid, profile: fsProf, security: fsSec, ...refreshedSnap };
  const picUrl = String(
    fsProf.profilePic || fsProf.photoURL || fsProf.photo || fsProf.avatar ||
    fsSec.profilePic || fsSec.photoURL || fsSec.photo || fsSec.avatar || ""
  );
  const kycCompleted = hasKycCompleted(fullRefUser);
  const picCompleted = hasProfilePic(fullRefUser);
  const persistedOb = typeof fsOb.required === "boolean" ? fsOb.required : null;
  const heuristicObFinalProfile = !(kycCompleted && picCompleted);
  let obRequiredFinal;
  if (!heuristicObFinalProfile) {
    obRequiredFinal = false;
  } else if (persistedOb === false) {
    obRequiredFinal = false;
  } else if (persistedOb != null) {
    obRequiredFinal = persistedOb;
  } else {
    obRequiredFinal = heuristicObFinalProfile;
  }

  res.json({
    ok: true,
    profilePic: picUrl,
    photoURL: picUrl,
    photo: picUrl,
    avatar: picUrl,
    kycCompleted,
    kycDone: kycCompleted,
    KYCDone: kycCompleted,
    onboarding: {
      required: obRequiredFinal,
      kycCompleted: kycCompleted,
      profilePicUploaded: picCompleted
    },
    profile: Object.assign({}, fsProf || {}, {
      kycCompleted,
      kycDone: kycCompleted,
      KYCDone: kycCompleted,
      profilePic: picUrl,
      photoURL: picUrl,
      photo: picUrl,
      avatar: picUrl
    }),
    security: Object.assign({}, fsSec || {}, {
      kycCompleted,
      kycDone: kycCompleted,
      KYCDone: kycCompleted,
      profilePic: picUrl,
      photoURL: picUrl,
      photo: picUrl,
      avatar: picUrl
    })
  });
});

app.get("/api/customer/transactions", requireAuth, requireKycAndProfilePic, async (req, res) => {
  try {
    const uid = req.user.uid;
    const rawLimit = Number(req.query?.limit || 20);
    const limit = Number.isFinite(rawLimit) ? Math.min(200, Math.max(1, rawLimit)) : 20;
    const db = getFirestore();
    const snap = await db.collection("users").doc(String(uid)).collection("transactions")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()
      .catch(() => null);
    const transactions = (snap && snap.docs ? snap.docs : []).map((doc) => ({ id: doc.id, ...(doc.data() || {}) }));
    let runningBalance = null;
    try {
      const userSnap = await db.collection("users").doc(String(uid)).get().catch(() => null);
      if (userSnap && userSnap.exists) {
        const userData = userSnap.data() || {};
        runningBalance = Number(userData?.account?.balance || 0);
      }
    } catch (_) {}
    res.json({ ok: true, transactions, balance: runningBalance });
  } catch (e) {
    const normalized = normalizeFirebaseAdminError(e, "Unable to load transactions.");
    res.status(normalized.status).json({ error: normalized.error });
  }
});

app.get("/api/customer/lookup-account", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const accountNumber = String(req.query?.accountNumber || "").trim();
    const email = String(req.query?.email || "").trim().toLowerCase();
    if (!accountNumber && !email) {
      res.status(400).json({ error: "accountNumber or email query parameter is required." });
      return;
    }
    const db = getFirestore();
    let targetDoc = null;
    if (accountNumber) {
      const byAccount = await db.collection("users").where("account.accountNumber", "==", accountNumber).limit(1).get().catch(() => null);
      if (byAccount && byAccount.docs && byAccount.docs.length) targetDoc = byAccount.docs[0];
    }
    if (!targetDoc && email) {
      const byEmail = await db.collection("users").doc(email).get().catch(() => null);
      if (byEmail && byEmail.exists) targetDoc = byEmail;
    }
    if (!targetDoc || !targetDoc.exists) {
      res.status(404).json({ error: "Recipient account not found." });
      return;
    }
    const td = targetDoc.data() || {};
    if (String(targetDoc.id) === String(uid)) {
      res.status(400).json({ error: "You cannot transfer to your own account." });
      return;
    }
    const p = td.profile || {};
    const a = td.account || {};
    const fullName = `${String(p.firstname || "").trim()} ${String(p.lastname || "").trim()}`.trim() || String(td.email || "").trim();
    res.json({
      ok: true,
      recipient: {
        uid: targetDoc.id,
        email: td.email || "",
        fullName,
        accountNumber: a.accountNumber || "",
        currency: a.currency || "USD",
        status: a.status || ""
      }
    });
  } catch (e) {
    const normalized = normalizeFirebaseAdminError(e, "Unable to look up account.");
    res.status(normalized.status).json({ error: normalized.error });
  }
});

app.post("/api/customer/transfer/request-otp", requireAuth, requireKycAndProfilePic, async (req, res) => {
  try {
    const uid = req.user.uid;
    const b = req.body || {};
    const toAccountNumber = String(b.toAccountNumber || b.to || "").trim();
    const toEmail = String(b.toEmail || "").trim().toLowerCase();
    const amountRaw = b.amount;
    const amount = Number(amountRaw);
    const currency = String(b.currency || "USD").trim().toUpperCase() || "USD";
    const memo = String(b.memo || b.note || b.reference || "").trim();
    const transferPinCandidate = String(b.transferPin || b.transferCode || b.transactionPin || b.txPin || "").trim();

    // 0. Validate Transfer PIN before proceeding (MANDATORY per PIN-OTP sequence)
    if (!transferPinCandidate) {
      res.status(400).json({ error: "Transfer PIN (Transaction Code) is required. Please enter your 6-digit Transfer PIN to initiate the transfer authorization." });
      return;
    }
    if (!isTransferCodeValid(transferPinCandidate)) {
      res.status(400).json({ error: "Invalid Transfer PIN format. Transfer PIN must be exactly 6 digits or a strong 8+ character code." });
      return;
    }

    // 1. Trigger condition validation: must be an explicit money transfer initiation
    if (!toAccountNumber && !toEmail) {
      res.status(400).json({ error: "Recipient accountNumber or email is required to initiate a transfer." });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: "Transfer amount must be a positive number." });
      return;
    }

    const db = getFirestore();
    const senderRef = db.collection("users").doc(String(uid));
    const senderSnap = await senderRef.get();
    if (!senderSnap.exists) {
      res.status(404).json({ error: "Your account was not found." });
      return;
    }
    const senderDoc = senderSnap.data() || {};
    const senderAccount = senderDoc?.account || {};
    const senderStatus = String(senderAccount?.status || "").toUpperCase();
    if (senderStatus && senderStatus !== "ACTIVE") {
      res.status(400).json({ error: `Your account status is ${senderStatus}. Transfers are not available.` });
      return;
    }

    const security = senderDoc.security || {};
    const storedTransferPinHash = security.transferPinHash || null;
    if (!storedTransferPinHash) {
      res.status(400).json({ error: "Transfer PIN is not configured for this account. Please contact an administrator." });
      return;
    }

    const candidateHash = sha256Hex(transferPinCandidate);
    if (String(candidateHash) !== String(storedTransferPinHash)) {
      res.status(401).json({ error: "Invalid Transfer PIN. Please check your Transaction Code and try again." });
      return;
    }

    const currentBalance = Number(senderAccount?.balance || 0);
    if (currentBalance < amount) {
      res.status(400).json({
        error: `Insufficient balance. Available: ${senderAccount?.currency || "USD"} ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
      });
      return;
    }

    // 2. Enforce 24-hour rate limiting
    const rateLimitData = security.transferOtpRateLimit || {};
    const rateCheck = checkRateLimit(rateLimitData);
    if (!rateCheck.allowed) {
      res.status(429).json({ error: rateCheck.error });
      return;
    }

    // 3. Generate 6-digit cryptographically secure OTP and encrypt at rest (AES-256-GCM, 15-minute expiration)
    const rawOtp = generate6DigitOtp();
    const encryptedRecord = encryptOtpRecord(rawOtp, {
      amount,
      currency,
      toAccountNumber,
      toEmail,
      memo
    });

    encryptedRecord.transferPinVerified = true;
    encryptedRecord.transferPinVerifiedAt = Date.now();
    encryptedRecord.transferContext = {
      amount,
      currency,
      toAccountNumber,
      toEmail,
      memo
    };

    // 4. Temporarily store encrypted OTP and update 24-hour rate limit history
    await senderRef.set(
      {
        security: {
          ...security,
          transferOtp: encryptedRecord,
          transferOtpRateLimit: {
            requests: rateCheck.requests
          }
        }
      },
      { merge: true }
    );

    // 5. Send OTP to user's registered email (confirm email delivery)
    let senderEmail = String(
      senderDoc?.email ||
      senderDoc?.profile?.email ||
      req.user?.email ||
      ""
    ).trim().toLowerCase();

    if (!senderEmail) {
      try {
        const localUsers = readLocalUsers();
        if (localUsers[uid]?.email || localUsers[uid]?.profile?.email) {
          senderEmail = String(localUsers[uid].email || localUsers[uid].profile.email).trim().toLowerCase();
        }
      } catch (_) {}
    }
    if (!senderEmail) {
      try {
        const auth = getAuth();
        const authUser = await auth.getUser(uid);
        if (authUser?.email) {
          senderEmail = String(authUser.email).trim().toLowerCase();
        }
      } catch (_) {}
    }

    if (!senderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      res.status(400).json({ error: "No valid registered email address is configured for this account. Please contact an administrator to verify your email." });
      return;
    }

    // Auto-heal / sync missing email in Firestore if needed
    if (senderEmail && (!senderDoc.email || !senderDoc.profile?.email)) {
      await senderRef.set({
        email: senderEmail,
        profile: { ...(senderDoc.profile || {}), email: senderEmail }
      }, { merge: true }).catch(() => {});
    }

    const senderName = `${String(senderDoc?.profile?.firstname || "").trim()} ${String(senderDoc?.profile?.lastname || "").trim()}`.trim() || senderEmail;
    const sendResult = await sendTransferOtpEmail(senderEmail, senderName, rawOtp, {
      amount,
      currency,
      recipient: toAccountNumber || toEmail
    });

    if (!sendResult.delivered) {
      res.status(500).json({ error: "Verification code email delivery failed. Please check your email configuration or contact support." });
      return;
    }

    res.status(200).json({
      ok: true,
      message: sendResult.emailSent
        ? "Transfer PIN verified. A 6-digit verification code has been sent to your registered email address."
        : "Transfer PIN verified. A 6-digit verification code has been dispatched.",
      maskedEmail: maskEmail(senderEmail),
      otp: rawOtp,
      code: rawOtp,
      emailSent: Boolean(sendResult.emailSent),
      emailDelivered: Boolean(sendResult.delivered),
      expiresAt: encryptedRecord.expiresAt,
      expiresInMinutes: 15,
      transferPinVerified: true,
      remainingDailyRequests: rateCheck.remaining
    });
  } catch (e) {
    const normalized = normalizeFirebaseAdminError(e, "Unable to send verification code.");
    res.status(normalized.status).json({ error: normalized.error });
  }
});

app.post("/api/customer/transfer", requireAuth, requireKycAndProfilePic, async (req, res) => {
  const b = req.body || {};
  const uid = req.user.uid;
  const toAccountNumber = String(b.toAccountNumber || b.to || "").trim();
  const toEmail = String(b.toEmail || "").trim().toLowerCase();
  const amountRaw = b.amount;
  const amount = Number(amountRaw);
  const currency = String(b.currency || "USD").trim().toUpperCase() || "USD";
  const memo = String(b.memo || b.note || b.reference || "").trim();
  const candidateOtp = String(b.otp || b.transferOtp || b.transferCode || b.code || "").trim();

  if (!toAccountNumber && !toEmail) {
    res.status(400).json({ error: "Recipient accountNumber or email is required." });
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: "Amount must be a positive number." });
    return;
  }
  if (!candidateOtp) {
    res.status(400).json({ error: "6-digit email verification code (OTP) is required." });
    return;
  }

  const db = getFirestore();
  const senderRef = db.collection("users").doc(String(uid));
  const senderSnap = await senderRef.get();
  if (!senderSnap.exists) {
    res.status(404).json({ error: "Your account was not found." });
    return;
  }
  const senderDoc = senderSnap.data() || {};

  // Two-step OTP verification: Exact decrypted match check + 15-minute expiration check
  const storedOtpRecord = senderDoc?.security?.transferOtp;
  const otpValidation = decryptAndVerifyOtp(storedOtpRecord, candidateOtp);
  if (!otpValidation.valid) {
    res.status(401).json({ error: otpValidation.error });
    return;
  }

  // PIN-OTP SEQUENCE ENFORCEMENT: Ensure Transfer PIN was verified before this OTP was issued
  if (!storedOtpRecord || storedOtpRecord.transferPinVerified !== true) {
    res.status(401).json({ error: "Transfer authorization is incomplete. You must first verify your Transfer PIN to generate a valid verification code. Please restart the transfer process and enter your Transfer PIN." });
    return;
  }

  // TRANSFER CONTEXT BINDING: Ensure OTP is only used for THIS specific active transfer transaction
  const storedContext = storedOtpRecord.transferContext || {};
  const boundAmount = Number(storedContext.amount);
  const boundCurrency = String(storedContext.currency || "USD").toUpperCase();
  const boundToAccount = String(storedContext.toAccountNumber || "").trim();
  const boundToEmail = String(storedContext.toEmail || "").trim().toLowerCase();

  if (Number.isFinite(boundAmount) && boundAmount > 0) {
    const amountDiff = Math.abs(Number(amount) - boundAmount);
    if (amountDiff > 0.009) {
      res.status(400).json({ error: "This verification code is bound to a different transfer amount. The OTP can only be used for the exact transaction it was generated for. Please restart the transfer process with your intended amount." });
      return;
    }
  }
  if (boundCurrency && currency !== boundCurrency) {
    res.status(400).json({ error: "This verification code is bound to a different currency. Please restart the transfer process." });
    return;
  }
  if (boundToAccount && toAccountNumber && toAccountNumber !== boundToAccount) {
    res.status(400).json({ error: "This verification code is bound to a different recipient account. The OTP can only authorize the specific transfer it was generated for. Please restart the transfer." });
    return;
  }
  if (boundToEmail && toEmail && toEmail !== boundToEmail) {
    res.status(400).json({ error: "This verification code is bound to a different recipient. Please restart the transfer process." });
    return;
  }

  const senderAccount = senderDoc?.account || {};
  const senderStatus = String(senderAccount?.status || "").toUpperCase();
  if (senderStatus && senderStatus !== "ACTIVE") {
    res.status(400).json({ error: `Your account status is ${senderStatus}. Transfers are not available.` });
    return;
  }
  const currentBalance = Number(senderAccount?.balance || 0);
  if (currentBalance < amount) {
    res.status(400).json({ error: `Insufficient balance. Available: ${senderAccount?.currency || "USD"} ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.` });
    return;
  }
  let recipientRef = null;
  if (toAccountNumber) {
    const byAccount = await db.collection("users").where("account.accountNumber", "==", toAccountNumber).limit(1).get().catch(() => null);
    if (byAccount && byAccount.docs && byAccount.docs.length) recipientRef = byAccount.docs[0];
  }
  if (!recipientRef && toEmail) {
    const byEmail = await db.collection("users").where("email", "==", toEmail).limit(1).get().catch(() => null);
    if (byEmail && byEmail.docs && byEmail.docs.length) recipientRef = byEmail.docs[0];
  }
  if (!recipientRef || !recipientRef.exists) {
    res.status(404).json({ error: "Recipient account not found." });
    return;
  }
  const recipientUid = recipientRef.id;
  if (recipientUid === String(uid)) {
    res.status(400).json({ error: "You cannot transfer to your own account." });
    return;
  }
  const recipientDoc = recipientRef.data() || {};
  const recipientAccount = recipientDoc?.account || {};
  const recipientStatus = String(recipientAccount?.status || "").toUpperCase();
  if (recipientStatus && recipientStatus !== "ACTIVE") {
    res.status(400).json({ error: "Recipient account is not active." });
    return;
  }
  const recipientCurrency = String(recipientAccount?.currency || senderAccount?.currency || "USD").toUpperCase() || "USD";
  if (recipientCurrency !== currency) {
    res.status(400).json({ error: `Recipient uses a different currency (${recipientCurrency}). Please use Bank Transfer for cross-currency payments.` });
    return;
  }
  const reference = `TX-${makeTxId()}`;
  const nowIsoStamp = nowIso();
  const senderName = `${String(senderDoc?.profile?.firstname || "").trim()} ${String(senderDoc?.profile?.lastname || "").trim()}`.trim() || String(senderDoc?.email || "");
  const recipientName = `${String(recipientDoc?.profile?.firstname || "").trim()} ${String(recipientDoc?.profile?.lastname || "").trim()}`.trim() || String(recipientDoc?.email || "");
  const senderAccountNumber = senderAccount?.accountNumber || "";
  const recipientAccountNumber = recipientAccount?.accountNumber || "";
  const batch = db.batch();
  const recRef = db.collection("users").doc(String(recipientUid));

  // Deduct balance and immediately invalidate/wipe OTP to prevent replay
  batch.set(senderRef, {
    updatedAt: nowIsoStamp,
    account: { balance: Number((currentBalance - amount).toFixed(2)) },
    security: {
      transferOtp: {
        verified: true,
        verifiedAt: Date.now(),
        encryptedData: null,
        iv: null,
        authTag: null,
        expiresAt: 0
      }
    }
  }, { merge: true });

  const recBalance = Number(recipientAccount?.balance || 0);
  batch.set(recRef, {
    updatedAt: nowIsoStamp,
    account: { balance: Number((recBalance + amount).toFixed(2)) }
  }, { merge: true });
  await batch.commit();

  const debitTx = await writeTransaction({
    uid: String(uid),
    type: "TRANSFER_OUT",
    amount: Number(Number(amount).toFixed(2)),
    currency,
    status: "COMPLETED",
    note: memo || `Transfer to ${recipientName || recipientAccountNumber}`,
    from: { uid: String(uid), accountNumber: senderAccountNumber, name: senderName, email: senderDoc?.email || "" },
    to: { uid: recipientUid, accountNumber: recipientAccountNumber, name: recipientName, email: recipientDoc?.email || "" },
    reference
  }).catch(() => null);
  const creditTx = await writeTransaction({
    uid: recipientUid,
    type: "TRANSFER_IN",
    amount: Number(Number(amount).toFixed(2)),
    currency,
    status: "COMPLETED",
    note: memo || `Transfer from ${senderName || senderAccountNumber}`,
    from: { uid: String(uid), accountNumber: senderAccountNumber, name: senderName, email: senderDoc?.email || "" },
    to: { uid: recipientUid, accountNumber: recipientAccountNumber, name: recipientName, email: recipientDoc?.email || "" },
    reference
  }).catch(() => null);
  res.status(200).json({
    ok: true,
    reference,
    amount: Number(Number(amount).toFixed(2)),
    currency,
    newBalance: Number((currentBalance - amount).toFixed(2)),
    debitTransaction: debitTx || null,
    creditTransactionId: creditTx && creditTx.id ? creditTx.id : null,
    recipient: {
      uid: recipientUid,
      accountNumber: recipientAccountNumber,
      name: recipientName,
      email: recipientDoc?.email || ""
    }
  });
});

app.post("/api/admin/login", async (req, res) => {
  if (!isAdminConfigured()) {
    res.status(503).json({ error: "Admin credentials are not configured on the server." });
    return;
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const creds = adminCredentials();

  if (email !== creds.email || password !== creds.password) {
    res.status(401).json({ error: "Invalid admin credentials." });
    return;
  }

  const expiresIn = getSessionExpiresInMs();
  res.cookie(adminCookieName, signAdminCookie(creds.email, Date.now() + expiresIn), {
    ...getCookieOptions(),
    maxAge: expiresIn
  });
  res.status(200).json({ ok: true, email: creds.email });
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie(adminCookieName, getCookieOptions());
  res.status(200).json({ ok: true });
});

app.get("/api/admin/session", requireAdminAuth, (req, res) => {
  res.json({ ok: true, admin: req.admin });
});

app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
  let firestoreUsers = [];
  let firestoreFailed = false;
  try {
    const db = getFirestore();
    const snap = await db.collection("users").get();
    firestoreUsers = snap.docs
      .map((doc) => {
        const data = doc.data() || {};
        const profile = data.profile || {};
        const account = data.account || {};
        return {
          uid: doc.id,
          email: data.email || null,
          firstname: profile.firstname || "",
          lastname: profile.lastname || "",
          phone: profile.phone || "",
          accountNumber: account.accountNumber || "",
          balance: Number(account.balance || 0),
          status: account.status || "ACTIVE",
          currency: account.currency || "USD",
          updatedAt: data.updatedAt || null,
          createdAt: data.createdAt || null
        };
      });
  } catch (fsErr) {
    firestoreFailed = true;
    if (process.env.NODE_ENV !== "production") {
      console.warn("[VT] Admin users: Firestore unavailable, using local fallback.", fsErr && fsErr.message ? String(fsErr.message) : fsErr);
    }
  }

  const users = mergeFirestoreUsersWithLocal(firestoreUsers);
  const sortedUsers = users.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));

  res.json({
    ok: true,
    users: sortedUsers,
    firestoreFallback: firestoreFailed,
    summary: {
      totalUsers: sortedUsers.length,
      totalBalance: sortedUsers.reduce((sum, user) => sum + Number(user.balance || 0), 0)
    }
  });
});

app.get("/api/admin/users/:uid", requireAdminAuth, async (req, res) => {
  const uid = String(req.params?.uid || "").trim();
  if (!uid) {
    res.status(400).json({ error: "Missing user id." });
    return;
  }
  try {
    const db = getFirestore();
    const auth = getAuth();
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "Customer not found." });
      return;
    }
    const data = userDoc.data() || {};
    const profile = data.profile || {};
    const account = data.account || {};
    const security = data.security || {};

    let authRecord = null;
    try {
      const r = await auth.getUser(uid);
      authRecord = {
        uid: r.uid,
        email: r.email || null,
        emailVerified: !!r.emailVerified,
        disabled: !!r.disabled,
        displayName: r.displayName || null,
        lastSignInTime: r.metadata?.lastSignInTime || null,
        creationTime: r.metadata?.creationTime || null,
        customClaims: r.customClaims || null
      };
    } catch {}

    let transactions = [];
    try {
      const txSnap = await db
        .collection("users")
        .doc(uid)
        .collection("transactions")
        .orderBy("createdAt", "desc")
        .limit(25)
        .get();
      transactions = txSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
    } catch {}

    const pinHashSet = Boolean(security?.accountPinHash);
    const transferPinHashSet = Boolean(security?.transferPinHash);

    const finalPicUrl = String(
      profile.profilePic || profile.photoURL || profile.photo || profile.avatar ||
      security.profilePic || security.photoURL || security.photo || security.avatar ||
      data.profilePic || data.photoURL || data.photo || data.avatar || ""
    ).trim();

    const ob = typeof data.onboarding === "object" && data.onboarding ? data.onboarding : {};
    const kycCompleted = hasKycCompleted({ profile, security, ...data });
    const picDone = hasProfilePic({ profile, security, ...data });
    const persistedObRequired = typeof ob.required === "boolean" ? ob.required : null;
    const obRequired = (persistedObRequired != null) ? persistedObRequired : !(kycCompleted && picDone);

    res.json({
      ok: true,
      user: {
        uid,
        email: data.email || null,
        preferredLanguage: profile.preferredLanguage || profile.language || data.preferredLanguage || "en",
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        profile: {
          email: profile.email || data.email || null,
          firstname: profile.firstname || profile.firstName || data.firstname || data.firstName || "",
          lastname: profile.lastname || profile.lastName || data.lastname || data.lastName || "",
          phone: profile.phone || profile.phoneNumber || data.phone || data.phoneNumber || "",
          address: profile.address || data.address || "",
          gender: profile.gender || data.gender || "",
          dateOfBirth: profile.dateOfBirth || profile.dob || data.dateOfBirth || data.dob || "",
          occupation: profile.occupation || data.occupation || "",
          nationality: profile.nationality || data.nationality || "",
          city: profile.city || data.city || "",
          state: profile.state || data.state || "",
          zipCode: profile.zipCode || profile.zip || profile.postal || data.zipCode || data.zip || data.postal || "",
          country: profile.country || data.country || "",
          profilePic: finalPicUrl,
          photoURL: finalPicUrl,
          photo: finalPicUrl,
          avatar: finalPicUrl,
          profilePicPublicId: profile.profilePicPublicId || security.profilePicPublicId || data.profilePicPublicId || null,
          preferredLanguage: profile.preferredLanguage || profile.language || data.preferredLanguage || "en",
          kycCompleted: kycCompleted,
          kycDone: kycCompleted,
          KYCDone: kycCompleted,
          kycCompletedAt: profile.kycCompletedAt || profile.KYCDoneAt || profile.kycDoneAt || security.kycCompletedAt || data.kycCompletedAt || null
        },
        account: {
          accountNumber: account.accountNumber || "",
          branchCode: account.branchCode || "",
          openingDate: account.openingDate || null,
          lastLogin: account.lastLogin || null,
          currency: account.currency || "USD",
          balance: Number(account.balance || 0),
          status: account.status || "ACTIVE",
          accountType: account.accountType || "SAVINGS",
          routingNumber: account.routingNumber || "",
          iban: account.iban || "",
          swiftBic: account.swiftBic || ""
        },
        security: {
          accountPinHashSet: pinHashSet,
          transferPinHashSet: transferPinHashSet,
          twoFactorEnabled: Boolean(security?.twoFactorEnabled !== false),
          lastPinChangeAt: security?.lastPinChangeAt || null,
          lastPasswordChangeAt: security?.lastPasswordChangeAt || null,
          kycCompleted: kycCompleted,
          kycDone: kycCompleted,
          KYCDone: kycCompleted,
          profilePic: finalPicUrl,
          photoURL: finalPicUrl,
          photo: finalPicUrl,
          avatar: finalPicUrl
        },
        onboarding: {
          required: obRequired,
          kycCompleted: kycCompleted,
          profilePicUploaded: picDone
        },
        auth: authRecord,
        transactions
      }
    });
  } catch (e) {
    const normalized = normalizeFirebaseAdminError(e, "Unable to load customer details.");
    res.status(normalized.status).json({ error: normalized.error });
  }
});

function generateStrongPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const specials = "!@#$%&*_-+";
  const pick = (s) => s.charAt(Math.floor(Math.random() * s.length));
  let out = "";
  out += pick("ABCDEFGHJKLMNPQRSTUVWXYZ");
  out += pick(numbers);
  out += pick(specials);
  for (let i = 0; i < 9; i++) out += pick(letters + numbers);
  out += pick(specials);
  return out;
}

function generateSixDigits() {
  const n = Math.floor(Math.random() * 1000000);
  return String(n).padStart(6, "0");
}

app.post("/api/admin/users/:uid/regenerate-credentials", requireAdminAuth, async (req, res) => {
  res.status(410).json({ error: "Credential regeneration is disabled. User login password, account PIN, and transfer code embedded by the admin during account creation are permanently immutable post-creation. Create a new account if credentials must be changed, or suspend/delete the existing account." });
  return;
});

app.get("/api/admin/transactions", requireAdminAuth, async (req, res) => {
  try {
    const rawLimit = Number(req.query?.limit || 100);
    const limit = Number.isFinite(rawLimit) ? Math.min(500, Math.max(1, rawLimit)) : 100;
    const db = getFirestore();
    const snap = await db.collection("transactions").orderBy("createdAt", "desc").limit(limit).get();
    const transactions = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }));
    res.json({ ok: true, transactions });
  } catch (e) {
    const normalized = normalizeFirebaseAdminError(e, "Unable to load transactions.");
    res.status(normalized.status).json({ error: normalized.error });
  }
});

function detectImageFormatFromBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { format: "jpeg", ext: "jpg", mime: "image/jpeg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { format: "png", ext: "png", mime: "image/png" };
  }
  // GIF: GIF87a or GIF89a
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return { format: "gif", ext: "gif", mime: "image/gif" };
  }
  // WebP: RIFF .... WEBP
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return { format: "webp", ext: "webp", mime: "image/webp" };
  }
  return null;
}

function scanBufferForMalware(buf) {
  if (buf.length >= 2 && buf[0] === 0x4d && buf[1] === 0x5a) {
    return { safe: false, reason: "Executable PE/DOS binary detected" };
  }
  if (buf.length >= 4 && buf[0] === 0x7f && buf[1] === 0x45 && buf[2] === 0x4c && buf[3] === 0x46) {
    return { safe: false, reason: "Executable ELF binary detected" };
  }
  const sample = buf.subarray(0, Math.min(buf.length, 4096)).toString("latin1") +
                 buf.subarray(Math.max(0, buf.length - 4096)).toString("latin1");
  if (/<\?php|<\?=|<\?|<%|\b(system|exec|passthru|shell_exec)\s*\(/i.test(sample)) {
    return { safe: false, reason: "Embedded script tags detected in file payload" };
  }
  return { safe: true };
}

app.post("/api/admin/upload-profile-pic", requireAdminAuth, async (req, res) => {
  try {
    const rawDataUrl = String(req.body?.fileDataUrl || req.body?.fileBase64 || "").trim();
    const originalFileName = String(req.body?.fileName || "profile.jpg").trim();

    if (!rawDataUrl) {
      res.status(400).json({ error: "No image file provided." });
      return;
    }

    let base64Data = rawDataUrl;
    if (rawDataUrl.includes(",")) {
      base64Data = rawDataUrl.split(",")[1];
    }

    const fileBuffer = Buffer.from(base64Data, "base64");
    if (!fileBuffer || fileBuffer.length === 0) {
      res.status(400).json({ error: "Invalid or empty image file data." });
      return;
    }

    // 5MB maximum file size limit
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (fileBuffer.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: "Image file size exceeds the strict 5MB limit. Please choose a smaller image." });
      return;
    }

    // Magic bytes validation
    const detected = detectImageFormatFromBuffer(fileBuffer);
    if (!detected) {
      res.status(400).json({ error: "Invalid file type. File header verification failed. Only valid JPG, PNG, GIF, and WebP images are allowed." });
      return;
    }

    // Malware / safety check
    const scan = scanBufferForMalware(fileBuffer);
    if (!scan.safe) {
      res.status(400).json({ error: "Security check failed: " + scan.reason });
      return;
    }

    const uniqueId = "p_" + Date.now() + "_" + crypto.randomBytes(8).toString("hex");
    let secureUrl = "";
    let publicId = uniqueId;

    // Check Cloudinary
    if (CLOUDINARY_CLOUD_NAME && (process.env.CLOUDINARY_API_SECRET || CLOUDINARY_UPLOAD_PRESET)) {
      try {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${detected.mime};base64,${base64Data}`,
          {
            folder: CLOUDINARY_PROFILE_FOLDER,
            public_id: uniqueId,
            resource_type: "image",
            format: detected.format
          }
        );
        if (uploadResult && uploadResult.secure_url) {
          secureUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id || uniqueId;
        }
      } catch (cErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[VT] Cloudinary admin upload error, using local secure storage:", cErr && cErr.message ? cErr.message : cErr);
        }
      }
    }

    // Fallback to local secure storage if Cloudinary not used or unavailable
    if (!secureUrl) {
      const localUploadsDir = path.join(siteRoot, "uploads", "profiles");
      if (!fs.existsSync(localUploadsDir)) {
        fs.mkdirSync(localUploadsDir, { recursive: true });
      }
      const localFileName = `${uniqueId}.${detected.ext}`;
      const localFilePath = path.join(localUploadsDir, localFileName);
      fs.writeFileSync(localFilePath, fileBuffer);
      secureUrl = `/uploads/profiles/${localFileName}`;
    }

    res.status(200).json({
      ok: true,
      secure_url: secureUrl,
      public_id: publicId,
      format: detected.format,
      bytes: fileBuffer.length
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[VT] Profile picture upload failed:", err);
    }
    res.status(500).json({ error: "Server error while processing profile picture upload." });
  }
});

app.post("/api/admin/users", requireAdminAuth, async (req, res) => {
  try {
    const firstname = String(req.body?.firstname || "").trim();
    const lastname = String(req.body?.lastname || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const accountPin = String(req.body?.accountPin || "").trim();
    const transferCode = String(req.body?.transferCode || req.body?.transferPin || "").trim();
    const startingBalanceRaw = req.body?.startingBalance;
    const startingBalance =
      startingBalanceRaw == null || startingBalanceRaw === "" ? 0 : Number(startingBalanceRaw);

    const phone = String(req.body?.phone || "").trim();
    const country = String(req.body?.country || "").trim();
    const preferredLanguage = String(req.body?.preferredLanguage || "").trim();
    const dateOfBirth = String(req.body?.dateOfBirth || req.body?.dob || "").trim();
    const gender = String(req.body?.gender || "").trim();
    const nationality = String(req.body?.nationality || "").trim();
    const occupation = String(req.body?.occupation || "").trim();
    const address = String(req.body?.address || "").trim();
    const city = String(req.body?.city || "").trim();
    const state = String(req.body?.state || "").trim();
    const zipCode = String(req.body?.zipCode || req.body?.zip || req.body?.postal || "").trim();
    const profilePic = String(req.body?.profilePic || "").trim();

    if (!preferredLanguage) {
      res.status(400).json({ error: "Preferred language is mandatory for user account creation." });
      return;
    }
    const allowedLangs = new Set(["en", "es", "fr", "de", "pt", "ru", "zh", "ar", "it", "nl", "tr", "ja", "ko", "vi", "hi"]);
    const cleanLang = cleanString(preferredLanguage, 16).toLowerCase();
    const langCode = allowedLangs.has(cleanLang)
      ? cleanLang
      : allowedLangs.has(cleanLang.split("-")[0])
        ? cleanLang.split("-")[0]
        : "en";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Login email is required and must be valid." });
      return;
    }
    if (!password || String(password).length < 6) {
      res.status(400).json({ error: "Login password is required (min 6 characters)." });
      return;
    }
    if (!firstname && !lastname) {
      res.status(400).json({ error: "Customer name is required." });
      return;
    }
    if (!isSixDigitPin(accountPin)) {
      res.status(400).json({ error: "Account PIN must be exactly 6 digits." });
      return;
    }
    if (!isTransferCodeValid(transferCode)) {
      res.status(400).json({ error: "Transfer code must be 6 digits or 8+ chars with uppercase, number, and special character." });
      return;
    }
    if (!Number.isFinite(startingBalance) || startingBalance < 0) {
      res.status(400).json({ error: "Starting balance must be a valid non-negative number." });
      return;
    }

    let uid;
    try {
      const auth = getAuth();
      const created = await auth.createUser({
        email,
        password,
        displayName: `${firstname} ${lastname}`.trim()
      });
      uid = String(created.uid);
    } catch (authErr) {
      if (authErr?.code === "auth/email-already-exists") {
        res.status(409).json({ error: "A user with this email already exists." });
        return;
      }
      uid = "u_" + crypto.randomBytes(12).toString("base64url");
    }

    const nowIso = new Date().toISOString();
    const accountNumber = generateAccountNumber();

    const hasKycData = Boolean(country || phone || dateOfBirth || gender || nationality || occupation || address || city || state || zipCode);
    const hasProfilePic = Boolean(profilePic);
    const kycCompleted = hasKycData;

    const userDoc = {
      email,
      createdAt: nowIso,
      updatedAt: nowIso,
      profile: {
        email,
        firstname,
        lastname
      },
      security: {
        accountPinHash: sha256Hex(accountPin),
        transferPinHash: sha256Hex(transferCode),
        twoFactorEnabled: true
      },
      account: {
        accountNumber,
        status: "ACTIVE",
        branchCode: "RBSUS001",
        openingDate: nowIso,
        lastLogin: nowIso,
        currency: "USD",
        balance: startingBalance
      },
      onboarding: { required: false }
    };

    if (phone) userDoc.profile.phone = phone;
    if (country) userDoc.profile.country = country;
    userDoc.profile.preferredLanguage = langCode;
    userDoc.preferredLanguage = langCode;
    if (dateOfBirth) userDoc.profile.dateOfBirth = dateOfBirth;
    if (gender) userDoc.profile.gender = gender;
    if (nationality) userDoc.profile.nationality = nationality;
    if (occupation) userDoc.profile.occupation = occupation;
    if (address) userDoc.profile.address = address;
    if (city) userDoc.profile.city = city;
    if (state) userDoc.profile.state = state;
    if (zipCode) userDoc.profile.zipCode = zipCode;

    if (kycCompleted) {
      userDoc.profile.kycCompleted = true;
      userDoc.profile.kycDone = true;
      userDoc.profile.KYCDone = true;
      userDoc.profile.kycCompletedAt = nowIso;
      userDoc.profile.kycDoneAt = nowIso;
      userDoc.profile.KYCDoneAt = nowIso;
      userDoc.security.kycCompleted = true;
      userDoc.security.kycDone = true;
      userDoc.security.KYCDone = true;
      userDoc.security.kycCompletedAt = nowIso;
      userDoc.security.kycDoneAt = nowIso;
      userDoc.security.KYCDoneAt = nowIso;
      userDoc.kycCompleted = true;
      if (country) userDoc.country = country;
      if (firstname) userDoc.firstname = firstname;
      if (lastname) userDoc.lastname = lastname;
    }

    if (hasProfilePic) {
      userDoc.profile.profilePic = profilePic;
      userDoc.profile.photoURL = profilePic;
      userDoc.profile.photo = profilePic;
      userDoc.profile.avatar = profilePic;
      userDoc.security.profilePic = profilePic;
      userDoc.security.photoURL = profilePic;
      userDoc.security.photo = profilePic;
      userDoc.security.avatar = profilePic;
      userDoc.profilePic = profilePic;
      userDoc.photoURL = profilePic;
      userDoc.photo = profilePic;
      userDoc.avatar = profilePic;
    }

    try {
      const db = getFirestore();
      await db
        .collection("users")
        .doc(uid)
        .set(userDoc, { merge: true });

      if (startingBalance > 0) {
        await writeTransaction({
          uid,
          type: "OPENING_BALANCE",
          amount: startingBalance,
          currency: "USD",
          status: "COMPLETED",
          note: "Opening balance",
          reference: `OPEN-${uid}-${Date.now()}`,
          createdBy: req.admin?.email || null
        }).catch(() => {});
      }
    } catch (firestoreError) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[VT] Firestore create user fallback to local store:", firestoreError?.message || firestoreError);
      }
    }

    // Always mirror to local users store for guaranteed reliability
    try {
      const localUsers = readLocalUsers();
      localUsers[uid] = userDoc;
      writeLocalUsers(localUsers);
    } catch (_) {}

    // Generate 6-digit account-creation OTP and email it to the user's admin-embedded email
    const accountOtp = generate6DigitOtp();
    const accountOtpEncrypted = encryptOtpRecord(accountOtp, {
      purpose: "account_created",
      email,
      uid,
      accountNumber
    });

    try {
      const db = getFirestore();
      await db.collection("users").doc(uid).set({
        security: {
          accountCreatedOtp: accountOtpEncrypted,
          accountCreatedOtpSentAt: new Date().toISOString()
        }
      }, { merge: true }).catch(() => {});
    } catch (_) {}
    try {
      const localUsers = readLocalUsers();
      if (localUsers[uid]) {
        if (!localUsers[uid].security) localUsers[uid].security = {};
        localUsers[uid].security.accountCreatedOtp = accountOtpEncrypted;
        localUsers[uid].security.accountCreatedOtpSentAt = new Date().toISOString();
        writeLocalUsers(localUsers);
      }
    } catch (_) {}

    let otpEmailResult = null;
    try {
      const fullName = `${firstname || ""} ${lastname || ""}`.trim() || email;
      otpEmailResult = await sendAccountCreatedOtpEmail(email, fullName, accountOtp, {
        email,
        password,
        accountNumber,
        accountPin,
        transferCode
      });
    } catch (otpErr) {
      console.warn(`[Account OTP Delivery] Failed to dispatch account creation OTP to ${email}: ${otpErr?.message || otpErr}`);
    }

    res.status(200).json({
      ok: true,
      user: {
        uid,
        email,
        firstname,
        lastname,
        accountNumber
      },
      credentials: {
        email,
        password,
        accountPin,
        transferCode,
        oneTimePassword: accountOtp,
        otp: accountOtp
      },
      account: {
        accountNumber,
        balance: startingBalance,
        currency: "USD"
      },
      accountOtp: {
        code: accountOtp,
        sentTo: email,
        maskedEmail: maskEmail(email),
        emailSent: Boolean(otpEmailResult?.emailSent),
        expiresAt: accountOtpEncrypted.expiresAt
      }
    });
  } catch (e) {
    const code = String(e?.code || "");
    if (code === "auth/email-already-exists") {
      res.status(409).json({ error: "A user with this email already exists." });
      return;
    }
    const normalized = normalizeFirebaseAdminError(e, "Unable to create user.");
    res.status(normalized.status).json({ error: normalized.error });
  }
});


app.patch("/api/admin/users/:uid", requireAdminAuth, async (req, res) => {
  const uid = String(req.params?.uid || "").trim();

  if (!uid) {
    res.status(400).json({ error: "Missing user id." });
    return;
  }

  const updates = {
    updatedAt: new Date().toISOString()
  };

  const balance = req.body?.balance;
  const status = req.body?.status;

  let deltaInfo = null;

  if (typeof req.body?.firstname !== "undefined" || typeof req.body?.lastname !== "undefined" ||
      typeof req.body?.email !== "undefined" || typeof req.body?.accountNumber !== "undefined" ||
      typeof req.body?.password !== "undefined" || typeof req.body?.accountPin !== "undefined" ||
      typeof req.body?.transferCode !== "undefined") {
    res.status(400).json({ error: "User metadata (name, email, credentials, account number) is immutable post-creation. Only account status and balance may be modified by admins." });
    return;
  }

  /*
   * BALANCE
   */
  if (balance != null && balance !== "") {
    const nextBalance = Number(balance);

    if (!Number.isFinite(nextBalance) || nextBalance < 0) {
      res.status(400).json({
        error: "Balance must be a valid non-negative number."
      });
      return;
    }

    updates["account.balance"] = nextBalance;
    deltaInfo = { nextBalance };
  }

  /*
   * STATUS
   */
  if (typeof status === "string" && status.trim()) {
    const normalizedStatus = status.trim().toUpperCase();

    const allowedStatuses = [
      "ACTIVE",
      "PENDING",
      "EXPIRED",
      "SUSPENDED",
      "BLOCKED",
      "CLOSED"
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      res.status(400).json({
        error: "Invalid account status."
      });
      return;
    }

    updates["account.status"] = normalizedStatus;
  }

  try {
    const db = getFirestore();
    const userRef = db.collection("users").doc(uid);

    const existingSnap = await userRef.get();
    let existingData = null;
    let currentBalance = 0;
    let currency = "USD";

    if (existingSnap && existingSnap.exists) {
      existingData = existingSnap.data() || {};
      currentBalance = Number(existingData?.account?.balance || 0);
      currency = String(existingData?.account?.currency || "USD");
    } else {
      // User not in Firestore - check if they exist only in local store
      const localUsers = readLocalUsers();
      if (localUsers[uid]) {
        // Apply update locally only
        const cur = localUsers[uid] || {};
        const curAccount = cur.account || {};
        if (typeof updates["account.balance"] !== "undefined") curAccount.balance = updates["account.balance"];
        if (typeof updates["account.status"] !== "undefined") curAccount.status = updates["account.status"];
        cur.updatedAt = new Date().toISOString();
        cur.account = curAccount;
        localUsers[uid] = cur;
        writeLocalUsers(localUsers);
        res.json({ ok: true, message: "Customer account updated (local-only record)." });
        return;
      }
      res.status(404).json({
        error: "Customer account not found."
      });
      return;
    }

    if (deltaInfo) {
      deltaInfo.prevBalance = Number.isFinite(currentBalance)
        ? currentBalance
        : 0;

      deltaInfo.currency = currency;
    }

    const firestoreUpdates = {
      updatedAt: updates.updatedAt
    };
    if (typeof updates["account.balance"] !== "undefined") {
      firestoreUpdates["account.balance"] = updates["account.balance"];
      if (!firestoreUpdates.account) firestoreUpdates.account = {};
      firestoreUpdates.account.balance = updates["account.balance"];
    }
    if (typeof updates["account.status"] !== "undefined") {
      firestoreUpdates["account.status"] = updates["account.status"];
      if (!firestoreUpdates.account) firestoreUpdates.account = {};
      firestoreUpdates.account.status = updates["account.status"];
    }

    await userRef.set(firestoreUpdates, {
      merge: true
    });

    /*
     * Keep the existing admin balance transaction behavior.
     */
    if (
      deltaInfo &&
      Number.isFinite(deltaInfo.prevBalance) &&
      Number.isFinite(deltaInfo.nextBalance)
    ) {
      const delta =
        Number(deltaInfo.nextBalance) -
        Number(deltaInfo.prevBalance);

      if (delta !== 0) {
        await writeTransaction({
          uid,
          type: delta > 0
            ? "ADMIN_CREDIT"
            : "ADMIN_DEBIT",
          amount: Math.abs(delta),
          currency: deltaInfo.currency || "USD",
          status: "COMPLETED",
          note: "Admin balance update",
          reference: `ADMIN-${uid}-${Date.now()}`,
          createdBy: req.admin?.email || null
        }).catch(() => {});
      }
    }

    res.json({
      ok: true,
      message: "Customer account repaired successfully."
    });

    // Also sync to local storage as backup
    try {
      const localUsers = readLocalUsers();
      if (localUsers[uid]) {
        const cur = localUsers[uid] || {};
        const curAccount = cur.account || {};
        if (typeof updates["account.balance"] !== "undefined") curAccount.balance = updates["account.balance"];
        if (typeof updates["account.status"] !== "undefined") curAccount.status = updates["account.status"];
        cur.updatedAt = updates.updatedAt;
        cur.account = curAccount;
        localUsers[uid] = cur;
        writeLocalUsers(localUsers);
      }
    } catch (_) {}

  } catch (e) {
    console.error("[ADMIN] User update failed (Firestore):", e);

    // Try local storage fallback
    try {
      const localUsers = readLocalUsers();
      if (localUsers[uid]) {
        const cur = localUsers[uid] || {};
        const curAccount = cur.account || {};
        if (typeof updates["account.balance"] !== "undefined") curAccount.balance = updates["account.balance"];
        if (typeof updates["account.status"] !== "undefined") curAccount.status = updates["account.status"];
        cur.updatedAt = new Date().toISOString();
        cur.account = curAccount;
        localUsers[uid] = cur;
        writeLocalUsers(localUsers);
        res.json({ ok: true, message: "Customer account updated locally (Firestore unavailable)." });
        return;
      }
    } catch (localErr) {
        console.error("[ADMIN] Local fallback update also failed:", localErr);
    }

    res.status(500).json({
      error: "Unable to update customer account."
    });
  }
});

app.delete("/api/admin/users/:uid", requireAdminAuth, async (req, res) => {
  const uid = String(req.params?.uid || "").trim();

  if (!uid) {
    res.status(400).json({
      error: "Missing user id."
    });
    return;
  }

  try {
    const db = getFirestore();
    const auth = getAuth();

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      // Check if user exists only in local store
      const localUsers = readLocalUsers();
      if (localUsers[uid]) {
        delete localUsers[uid];
        writeLocalUsers(localUsers);
        // Also clear local transactions
        const localTxs = readLocalTransactions();
        if (localTxs[uid]) {
          delete localTxs[uid];
          writeLocalTransactions(localTxs);
        }
        res.json({
          ok: true,
          message: "Customer account deleted (local-only record)."
        });
        return;
      }
      res.status(404).json({
        error: "Customer account not found."
      });
      return;
    }

    /*
     * Delete Firebase Authentication account first.
     *
     * This prevents the customer from logging in again
     * even if Firestore cleanup encounters a problem.
     */
    try {
      await auth.deleteUser(uid);
    } catch (authError) {
      const authCode = String(authError?.code || "");

      /*
       * If the Auth account is already gone, continue
       * cleaning the Firestore data.
       */
      if (authCode !== "auth/user-not-found") {
        console.error(
          "[ADMIN] Firebase Auth deletion failed:",
          authError
        );

        res.status(500).json({
          error: "Unable to delete the customer's login account."
        });

        return;
      }
    }

    /*
     * Delete all customer transactions stored beneath
     * users/{uid}/transactions.
     */
    const transactionSnap = await userRef
      .collection("transactions")
      .get();

    let batch = db.batch();
    let batchCount = 0;

    for (const doc of transactionSnap.docs) {
      batch.delete(doc.ref);
      batchCount++;

      if (batchCount >= 400) {
        await batch.commit();

        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    /*
     * Delete global transaction records belonging to
     * this customer.
     */
    const globalTransactions = await db
      .collection("transactions")
      .where("uid", "==", uid)
      .get();

    batch = db.batch();
    batchCount = 0;

    for (const doc of globalTransactions.docs) {
      batch.delete(doc.ref);
      batchCount++;

      if (batchCount >= 400) {
        await batch.commit();

        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    /*
     * Finally remove the main customer document.
     */
    await userRef.delete();

    console.log(
      `[ADMIN] Permanently deleted customer ${uid} by ${req.admin?.email || "admin"}`
    );

    // Also remove from local storage as sync
    try {
      const localUsers = readLocalUsers();
      if (localUsers[uid]) {
        delete localUsers[uid];
        writeLocalUsers(localUsers);
      }
      const localTxs = readLocalTransactions();
      if (localTxs[uid]) {
        delete localTxs[uid];
        writeLocalTransactions(localTxs);
      }
    } catch (_) {}

    res.json({
      ok: true,
      message: "Customer account permanently deleted."
    });

  } catch (error) {
    console.error(
      "[ADMIN] Permanent user deletion failed (Firestore):",
      error
    );

    // Try local fallback
    try {
      const localUsers = readLocalUsers();
      if (localUsers[uid]) {
        delete localUsers[uid];
        writeLocalUsers(localUsers);
        const localTxs = readLocalTransactions();
        if (localTxs[uid]) {
          delete localTxs[uid];
          writeLocalTransactions(localTxs);
        }
        res.json({
          ok: true,
          message: "Customer account deleted locally (Firestore unavailable)."
        });
        return;
      }
    } catch (localErr) {
      console.error("[ADMIN] Local fallback delete also failed:", localErr);
    }

    res.status(500).json({
      error: "Unable to permanently delete customer account."
    });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const name = cleanString(req.body?.name || req.body?.fullname || req.body?.userName || "", 120);
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = cleanString(req.body?.phone || req.body?.phoneNumber || "", 40);
    const subject = cleanString(req.body?.subject || "General Enquiry", 150);
    const message = cleanString(req.body?.message || req.body?.comments || "", 3000);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "A valid email address is required." });
      return;
    }
    if (!name) {
      res.status(400).json({ error: "Your name is required." });
      return;
    }
    if (!message) {
      res.status(400).json({ error: "Message content is required." });
      return;
    }

    const messageId = "MSG-" + crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const clientIp = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();

    const contactDoc = {
      messageId,
      name,
      email,
      phone,
      subject,
      message,
      status: "NEW",
      createdAt: nowIso,
      ip: clientIp,
      userAgent: String(req.headers["user-agent"] || "").slice(0, 300)
    };

    // Store in Firestore
    try {
      const db = getFirestore();
      await db.collection("contact_messages").doc(messageId).set(contactDoc);
    } catch (fsErr) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[VT] Firestore save for contact message fallback to local:", fsErr?.message || fsErr);
      }
    }

    // Always store in local JSON storage as well for guaranteed persistence
    writeLocalContactMessage(contactDoc);

    console.log(`[CONTACT] Received user email intake: ${name} <${email}> [${messageId}]`);

    res.status(200).json({
      ok: true,
      messageId,
      message: "Thank you. Your message has been received and our team will get back to you shortly."
    });
  } catch (err) {
    console.error("[CONTACT] Error processing message:", err);
    res.status(500).json({ error: "Unable to process message at this time. Please try again later." });
  }
});

app.get("/api/admin/contact-messages", requireAdminAuth, async (req, res) => {
  try {
    let messages = [];
    try {
      const db = getFirestore();
      const snap = await db.collection("contact_messages").orderBy("createdAt", "desc").limit(100).get();
      messages = snap.docs.map(doc => doc.data());
    } catch (_) {}

    const localList = readLocalContactMessages();
    const seen = new Set(messages.map(m => m.messageId));
    localList.forEach(m => {
      if (m && m.messageId && !seen.has(m.messageId)) {
        messages.push(m);
      }
    });

    messages.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    res.json({ ok: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ error: "Unable to load contact messages." });
  }
});

app.post("/api/admin/clear-users", requireAdminAuth, async (req, res) => {
  let deletedCount = 0;
  let firestoreFailed = false;

  try {
    const db = getFirestore();
    const auth = getAuth();

    const usersSnap = await db.collection("users").get();

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      try {
        await auth.deleteUser(uid);
      } catch (_) {}

      try {
        const txSnap = await userDoc.ref.collection("transactions").get();
        let batch = db.batch();
        let count = 0;
        for (const doc of txSnap.docs) {
          batch.delete(doc.ref);
          count++;
          if (count >= 400) {
            await batch.commit();
            batch = db.batch();
            count = 0;
          }
        }
        if (count > 0) await batch.commit();
      } catch (_) {}

      try {
        const globalTx = await db.collection("transactions").where("uid", "==", uid).get();
        let batch = db.batch();
        let count = 0;
        for (const doc of globalTx.docs) {
          batch.delete(doc.ref);
          count++;
          if (count >= 400) {
            await batch.commit();
            batch = db.batch();
            count = 0;
          }
        }
        if (count > 0) await batch.commit();
      } catch (_) {}

      await userDoc.ref.delete().catch(() => {});
      deletedCount++;
    }
  } catch (fsErr) {
    firestoreFailed = true;
    if (process.env.NODE_ENV !== "production") {
      console.warn("[VT] Clear users: Firestore unavailable, using local fallback.", fsErr && fsErr.message ? String(fsErr.message) : fsErr);
    }
  }

  // Also clear local storage (always - sync with Firestore or use local-only)
  try {
    const localUsers = readLocalUsers();
    const localCount = Object.keys(localUsers).length;
    if (localCount > 0) {
      writeLocalUsers({});
      deletedCount += localCount;
    }
    writeLocalTransactions({});
  } catch (_) {}

  console.log(`[ADMIN] Bulk cleared ${deletedCount} user accounts by ${req.admin?.email || "admin"}${firestoreFailed ? " (local only)" : ""}`);
  res.json({ ok: true, message: `Successfully cleared ${deletedCount} old customer account(s).`, deletedCount, firestoreFallback: firestoreFailed });
});

function sendHtmlFile(res, absPath) {
  try {
    const html = fs.readFileSync(absPath, "utf8");
    res.setHeader("Content-Disposition", "inline");
    res.status(200).type("html").send(html);
  } catch {
    res.status(404).end();
  }
}

function resolvePageFile(relFromSiteRoot) {
  const candidate = path.join(siteRoot, relFromSiteRoot);
  if (relFromSiteRoot.endsWith(".php.html")) {
    const phpSibling = candidate.slice(0, -".html".length);
    if (fs.existsSync(phpSibling)) return phpSibling;
  }
  if (fs.existsSync(candidate)) return candidate;
  if (relFromSiteRoot.endsWith(".php")) {
    const htmlSibling = candidate + ".html";
    if (fs.existsSync(htmlSibling)) return htmlSibling;
  }
  return candidate;
}

function sendPage(res, relFromSiteRoot) {
  const resolved = resolvePageFile(relFromSiteRoot);
  sendHtmlFile(res, resolved);
}

app.get("/admin", (req, res) => {
  res.redirect(isAdminAuthenticated(req) ? "/admin/dashboard.html" : "/admin/login.html");
});

app.get("/admin/login", (req, res) => {
  res.redirect("/admin/login.html");
});

app.get("/admin/login.html", (req, res) => {
  sendHtmlFile(res, path.join(siteRoot, "admin", "login.html"));
});

app.get("/admin/dashboard", requireAdminAuth, (req, res) => {
  res.redirect("/admin/dashboard.html");
});

app.get("/admin/dashboard.html", requireAdminAuth, (req, res) => {
  sendHtmlFile(res, path.join(siteRoot, "admin", "dashboard.html"));
});

app.get("/customer/login", (req, res) => {
  res.redirect("/customer/login.php");
});

app.get("/customer/login.php", (req, res) => {
  sendPage(res, "customer/login.php");
});

app.get("/customer/register.php", (req, res) => {
  sendPage(res, "customer/register.php");
});

app.get("/customer/verify-pin", requireAuth, (req, res) => {
  res.redirect("/customer/verify-pin.php");
});

app.get("/customer/verify-pin.php", requireAuth, (req, res) => {
  sendPage(res, "customer/verify-pin.php");
});

app.get("/customer/account.html", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/account.html");
});

app.get("/customer/accountdetails.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/accountdetails.php");
});

app.get("/customer/dashboard.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/dashboard.php");
});

app.get("/customer/dashboard", requireAuth, (req, res) => {
  if (!isPinVerified(req)) {
    res.redirect("/customer/verify-pin.php");
    return;
  }
  if (onboardingIsRequired(req)) {
    res.redirect("/customer/dashboard.php");
    return;
  }
  res.redirect("/customer/dashboard.php");
});

app.get("/customer/myprofile.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/myprofile.php");
});

app.get("/customer/statement.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/statement.php");
});

app.get("/customer/stocks.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/stocks.php");
});

app.get("/customer/international.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/international.php");
});

app.get("/customer/transferhistory.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/transferhistory.php");
});

app.get("/customer/card.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/card.php");
});

app.get("/customer/pin.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  sendPage(res, "customer/pin.php");
});

app.get("/customer/password.php", requireAuth, requirePinVerified, requireKycAndProfilePic, (req, res) => {
  res.status(410).send("Password change functionality is unavailable. Your login password was permanently set by an administrator during account creation and cannot be modified. Contact support for assistance.");
  return;
});

app.get(/^\/customer\/([A-Za-z0-9_-]+\.php\.html)$/, (req, res, next) => {
  const rel = req.params?.[0];
  if (!rel) { next(); return; }
  const canonical = rel.slice(0, -".html".length);
  const phpExists = fs.existsSync(path.join(siteRoot, "customer", canonical));
  if (phpExists) {
    res.redirect(301, "/customer/" + canonical);
    return;
  }
  sendPage(res, "customer/" + rel);
});

app.get(/^\/customer\/([A-Za-z0-9_-]+\.php)$/, requireAuth, (req, res, next) => {
  const rel = req.params?.[0];
  if (!rel) {
    next();
    return;
  }
  if (rel === "login.php" || rel === "register.php") {
    next();
    return;
  }
  const absPath = resolvePageFile("customer/" + rel);
  const isOrphanPhpHtml = !fs.existsSync(path.join(siteRoot, "customer/" + rel)) && fs.existsSync(absPath);
  if (isOrphanPhpHtml) {
    sendPage(res, "customer/" + rel);
    return;
  }
  if (rel === "verify-pin.php") {
    sendPage(res, "customer/" + rel);
    return;
  }
  if (rel === "dashboard.php") {
    if (isPinVerified(req)) {
      sendPage(res, "customer/" + rel);
    } else {
      res.redirect("/customer/verify-pin.php");
    }
    return;
  }
  if (!isPinVerified(req)) {
    res.redirect("/customer/verify-pin.php");
    return;
  }
  if (onboardingIsRequired(req)) {
    res.redirect("/customer/dashboard.php");
    return;
  }
  sendPage(res, "customer/" + rel);
});

app.use("/_dev", express.static(siteRoot, {
  index: false,
  dotfiles: "deny",
  setHeaders(res, filePath) {
    const lower = String(filePath || "").toLowerCase();
    if (lower.endsWith(".php") || lower.endsWith(".php.html")) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", "inline");
      return;
    }
    if (lower.endsWith(".css") || lower.endsWith(".js")) {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
  }
}));

app.use(
  express.static(siteRoot, {
    index: false,
    dotfiles: "deny",
    fallthrough: true,
    setHeaders(res, filePath) {
      const lower = String(filePath || "").toLowerCase();
      if (lower.endsWith(".php")) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Disposition", "inline");
        return;
      }
      if (lower.endsWith(".css") || lower.endsWith(".js")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    }
  })
);

app.use((req, res) => {
  if (String(req.path || "").startsWith("/api/")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  sendPage(res, "index.php.html");
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    process.stdout.write(`Server running on http://localhost:${port}\n`);
  });
}

module.exports = app;
