const { getAuth, getFirestore } = require("./firebase");
const crypto = require("crypto");

function getCookieName() {
  return process.env.SESSION_COOKIE_NAME || "vt_session";
}

function getDevCookieName() {
  return process.env.DEV_SESSION_COOKIE_NAME || "vt_dev_session";
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const crossSite =
    String(process.env.CROSS_SITE_COOKIES || "").toLowerCase() === "true" || String(process.env.CROSS_SITE_COOKIES || "") === "1";
  const sameSite = crossSite ? "none" : "lax";
  const domain = process.env.COOKIE_DOMAIN ? String(process.env.COOKIE_DOMAIN) : undefined;
  return {
    httpOnly: true,
    secure: crossSite ? true : isProd,
    sameSite,
    path: "/",
    ...(domain ? { domain } : {})
  };
}

function getSessionExpiresInMs() {
  const rawDays = process.env.SESSION_MAX_AGE_DAYS || "5";
  const days = Number(rawDays);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 5;
  return safeDays * 24 * 60 * 60 * 1000;
}

function deriveDevSigningSecret() {
  const seed = [
    process.env.PIN_COOKIE_SECRET || "",
    process.env.ADMIN_COOKIE_SECRET || "",
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON || ""
  ].join("|");
  return crypto.createHash("sha256").update(seed, "utf8").digest("hex");
}

function parseDevSessionCookie(rawCookie) {
  if (!rawCookie || typeof rawCookie !== "string") return null;
  const idx = rawCookie.lastIndexOf(".");
  if (idx <= 0) return null;
  const payloadB64 = rawCookie.slice(0, idx);
  const sig = rawCookie.slice(idx + 1);
  const expectedSig = crypto.createHmac("sha256", deriveDevSigningSecret()).update(payloadB64, "utf8").digest("base64url");
  if (sig !== expectedSig) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch (_) { return null; }
  if (!payload || !payload.uid || !payload.iat || typeof payload.uid !== "string" || typeof payload.iat !== "number") return null;
  const maxAge = getSessionExpiresInMs();
  if (Date.now() - payload.iat > maxAge) return null;
  return { uid: String(payload.uid), email: payload.email || null, iat: payload.iat };
}

async function requireAuth(req, res, next) {
  try {
    const cookieName = getCookieName();
    const devCookieName = getDevCookieName();
    const sessionCookie = req.cookies?.[cookieName];
    const devCookie = process.env.NODE_ENV !== "production" ? (req.cookies?.[devCookieName]) : null;
    if (!sessionCookie && !devCookie) {
      if (String(req.path || "").startsWith("/api/")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      res.status(401).redirect("/customer/login.php");
      return;
    }

    let uid = null;
    let email = null;
    const auth = getAuth();

    if (sessionCookie) {
      try {
        const decoded = await auth.verifySessionCookie(sessionCookie, true);
        if (decoded?.uid) {
          uid = String(decoded.uid);
          email = decoded.email || null;
        }
      } catch (_sessionErr) {
        if (process.env.NODE_ENV !== "production" && devCookie) {
          const parsed = parseDevSessionCookie(devCookie);
          if (parsed) { uid = parsed.uid; email = parsed.email || null; }
        }
        if (!uid) throw _sessionErr;
      }
    } else if (devCookie) {
      const parsed = parseDevSessionCookie(devCookie);
      if (!parsed) {
        res.clearCookie(cookieName, getCookieOptions());
        res.clearCookie(devCookieName, getCookieOptions());
        if (String(req.path || "").startsWith("/api/")) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        res.status(401).redirect("/customer/login.php");
        return;
      }
      uid = parsed.uid;
      email = parsed.email || null;
    }

    if (!uid) {
      res.clearCookie(cookieName, getCookieOptions());
      res.clearCookie(devCookieName, getCookieOptions());
      if (String(req.path || "").startsWith("/api/")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      res.status(401).redirect("/customer/login.php");
      return;
    }

    const db = getFirestore();
    let doc = null;
    try {
      const snap = await db.collection("users").doc(uid).get();
      doc = snap.exists ? snap.data() : null;
    } catch {}

    req.user = {
      uid,
      email,
      profile: doc?.profile || null,
      security: doc?.security || null,
      account: doc?.account || null,
      createdAt: doc?.createdAt || null,
      updatedAt: doc?.updatedAt || null
    };
    next();
  } catch (e) {
    res.clearCookie(getCookieName(), getCookieOptions());
    res.clearCookie(getDevCookieName(), getCookieOptions());
    if (String(req.path || "").startsWith("/api/")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.status(401).redirect("/customer/login.php");
  }
}

module.exports = {
  getCookieName,
  getDevCookieName,
  getCookieOptions,
  getSessionExpiresInMs,
  deriveDevSigningSecret,
  parseDevSessionCookie,
  requireAuth
};
