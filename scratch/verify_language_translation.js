const http = require("http");
const https = require("https");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const { getAuth, getFirestore } = require("../server/firebase");
const VT = require("../customer/assets/js/customer-i18n.js");

const BASE = "http://localhost:3002";

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

(async () => {
  console.log("=================================================");
  console.log("   ADMIN MANDATORY LANGUAGE & AUTO-TRANSLATION   ");
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
  // SECTION 1: TRANSLATION DICTIONARY & DOM ENGINE TEST
  // ----------------------------------------------------
  console.log("\n--- SECTION 1: I18N ENGINE & MULTI-LANGUAGE DICTIONARIES ---");

  const i18n = VT.I18N;
  assert(!!i18n && typeof i18n.apply === "function", "VT.I18N module and apply function loaded");

  const languages = ["es", "fr", "de", "pt", "ru", "zh", "ar", "it", "nl", "tr", "ja", "ko", "vi", "hi"];
  languages.forEach((lang) => {
    const dict = i18n.dictForCode(lang);
    assert(!!dict, `Dictionary for language '${lang}' is available`);
  });

  // Mock DOM Node test for translation
  function createMockElement(tag, attrs = {}, text = "") {
    const element = {
      tagName: tag.toUpperCase(),
      attributes: Object.assign({}, attrs),
      textContent: text,
      getAttribute(name) { return this.attributes[name] || null; },
      setAttribute(name, val) { this.attributes[name] = String(val); }
    };
    return element;
  }

  function createMockDocument(elements) {
    return {
      documentElement: createMockElement("html"),
      querySelectorAll(selector) {
        if (selector === "[data-i18n]") {
          return elements.filter((el) => el.getAttribute("data-i18n"));
        }
        if (selector === "[data-i18n-placeholder]") {
          return elements.filter((el) => el.getAttribute("data-i18n-placeholder"));
        }
        return [];
      }
    };
  }

  // Test Spanish translation
  const mockElementsEs = [
    createMockElement("span", { "data-i18n": "nav_dashboard" }, "Dashboard"),
    createMockElement("span", { "data-i18n": "actions_transfer" }, "Bank Transfer"),
    createMockElement("span", { "data-i18n": "hero_balance" }, "Available Balance"),
    createMockElement("input", { "data-i18n-placeholder": "search" }, "")
  ];
  const docEs = createMockDocument(mockElementsEs);
  i18n.apply("es", docEs);

  assert(docEs.documentElement.getAttribute("lang") === "es", "Root lang set to 'es'");
  assert(mockElementsEs[0].textContent === "Panel", "Dashboard translated to 'Panel' in Spanish");
  assert(mockElementsEs[1].textContent === "Transferencia Bancaria", "Bank Transfer translated to 'Transferencia Bancaria' in Spanish");
  assert(mockElementsEs[2].textContent === "Saldo Disponible", "Available Balance translated to 'Saldo Disponible' in Spanish");
  assert(mockElementsEs[3].getAttribute("placeholder") === "Buscar…", "Search placeholder translated to 'Buscar…' in Spanish");

  // Test Arabic RTL translation
  const mockElementsAr = [
    createMockElement("span", { "data-i18n": "nav_dashboard" }, "Dashboard")
  ];
  const docAr = createMockDocument(mockElementsAr);
  i18n.apply("ar", docAr);
  assert(docAr.documentElement.getAttribute("dir") === "rtl", "RTL direction set for Arabic");
  assert(mockElementsAr[0].textContent === "الصفحة الرئيسية", "Dashboard translated to Arabic ('الصفحة الرئيسية')");

  // ----------------------------------------------------
  // SECTION 2: ADMIN MANDATORY LANGUAGE VALIDATION
  // ----------------------------------------------------
  console.log("\n--- SECTION 2: ADMIN MANDATORY LANGUAGE VALIDATION ---");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminCookies = {};
  const adminLoginRes = await httpReq("POST", "/api/admin/login", {
    body: { email: adminEmail, password: adminPassword }
  });
  mergeCookies(adminCookies, adminLoginRes.cookies);
  assert(adminLoginRes.status === 200, "Admin logged in");

  const randId = Math.floor(Math.random() * 100000);

  // Test missing preferredLanguage -> 400 Bad Request
  const missingLangPayload = {
    firstname: "NoLang",
    lastname: `User${randId}`,
    email: `nolang${randId}@example.com`,
    password: "Password123!",
    accountPin: "112233",
    transferCode: "123456",
    startingBalance: "1000.00",
    phone: "+1 555 999 0000",
    country: "US",
    preferredLanguage: "" // Missing mandatory field
  };
  const missingLangRes = await httpReq("POST", "/api/admin/users", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: missingLangPayload
  });
  assert(missingLangRes.status === 400, "Creation without mandatory preferredLanguage rejected (400 Bad Request)");
  assert(missingLangRes.body?.error.includes("Preferred language is mandatory"), `Clear validation error returned: "${missingLangRes.body?.error}"`);

  // ----------------------------------------------------
  // SECTION 3: END-TO-END CREATION WITH EMBEDDED LANGUAGE
  // ----------------------------------------------------
  console.log("\n--- SECTION 3: EMBEDDED LANGUAGE CREATION & AUTO-TRANSLATION ---");

  // Create User with French language
  const frenchUserPayload = {
    firstname: "Jean",
    lastname: `Dupont${randId}`,
    email: `french${randId}@example.com`,
    password: "Password123!",
    accountPin: "998877",
    transferCode: "654321",
    startingBalance: "2500.00",
    phone: "+33 6 12 34 56 78",
    country: "FR",
    preferredLanguage: "fr",
    gender: "male",
    dateOfBirth: "1988-03-15",
    nationality: "French",
    occupation: "Architect",
    address: "10 Rue de la Paix",
    city: "Paris",
    state: "Île-de-France",
    zipCode: "75001"
  };

  const createFrRes = await httpReq("POST", "/api/admin/users", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: frenchUserPayload
  });
  const frUid = createFrRes.body?.user?.uid;
  assert(createFrRes.status === 200 && !!frUid, `French account created (UID: ${frUid})`);

  // Verify Admin review API returns embedded language
  const adminGetFrRes = await httpReq("GET", `/api/admin/users/${frUid}`, {
    headers: { "Cookie": cookiesToHeader(adminCookies) }
  });
  assert(adminGetFrRes.status === 200, "Admin fetched user details");
  assert(adminGetFrRes.body?.user?.profile?.preferredLanguage === "fr", "Persisted profile.preferredLanguage is 'fr'");
  assert(adminGetFrRes.body?.user?.preferredLanguage === "fr", "Persisted user.preferredLanguage is 'fr'");

  // Customer logs in and checks /api/me
  const frIdToken = await userIdTokenFor(frUid);
  const frCookies = {};
  const frLoginRes = await httpReq("POST", "/api/sessionLogin", {
    body: { idToken: frIdToken, remember: true }
  });
  mergeCookies(frCookies, frLoginRes.cookies);

  const frPinRes = await httpReq("POST", "/api/pin/verify", {
    cookies: cookiesToHeader(frCookies),
    body: { accountPin: frenchUserPayload.accountPin }
  });
  mergeCookies(frCookies, frPinRes.cookies);
  assert(frPinRes.status === 200, "French customer authenticated and verified PIN");

  const frMeRes = await httpReq("GET", "/api/me", {
    cookies: cookiesToHeader(frCookies)
  });
  assert(frMeRes.status === 200, "Customer /api/me succeeded");
  assert(frMeRes.body?.profile?.preferredLanguage === "fr" || frMeRes.body?.preferredLanguage === "fr", "Customer /api/me delivers embedded French language");

  // Create User with Spanish language
  const spanishUserPayload = {
    firstname: "Carlos",
    lastname: `Garcia${randId}`,
    email: `spanish${randId}@example.com`,
    password: "Password123!",
    accountPin: "334455",
    transferCode: "123456",
    startingBalance: "3000.00",
    phone: "+34 600 123 456",
    country: "ES",
    preferredLanguage: "es"
  };

  const createEsRes = await httpReq("POST", "/api/admin/users", {
    headers: { "Cookie": cookiesToHeader(adminCookies) },
    body: spanishUserPayload
  });
  const esUid = createEsRes.body?.user?.uid;
  assert(createEsRes.status === 200 && !!esUid, `Spanish account created (UID: ${esUid})`);

  const esIdToken = await userIdTokenFor(esUid);
  const esCookies = {};
  const esLoginRes = await httpReq("POST", "/api/sessionLogin", {
    body: { idToken: esIdToken, remember: true }
  });
  mergeCookies(esCookies, esLoginRes.cookies);
  await httpReq("POST", "/api/pin/verify", {
    cookies: cookiesToHeader(esCookies),
    body: { accountPin: spanishUserPayload.accountPin }
  });

  const esMeRes = await httpReq("GET", "/api/me", {
    cookies: cookiesToHeader(esCookies)
  });
  assert(esMeRes.body?.profile?.preferredLanguage === "es" || esMeRes.body?.preferredLanguage === "es", "Customer /api/me delivers embedded Spanish language");

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
})();
