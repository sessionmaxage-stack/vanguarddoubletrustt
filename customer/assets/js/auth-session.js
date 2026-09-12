(() => {
  function apiBase() {
    const raw = String(window.__VT_API_BASE__ || "").trim();
    if (raw) return raw.replace(/\/+$/, "");
    try {
      const saved = String(window.localStorage.getItem("vt_api_base") || "").trim();
      if (saved) return saved.replace(/\/+$/, "");
    } catch {}
    return "";
  }

  function apiUrl(pathname) {
    const p = String(pathname || "");
    const base = apiBase();
    if (!base) return p;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    const rel = p.startsWith("/") ? p : `/${p}`;
    return `${base}${rel}`;
  }

  function hasSwal() {
    return typeof window !== "undefined" && window.Swal && typeof window.Swal.fire === "function";
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toast(type, title) {
    if (hasSwal()) {
      window.Swal.fire({
        toast: true,
        position: "top-end",
        icon: type,
        title,
        showConfirmButton: false,
        timer: 3500
      });
      return;
    }
    window.alert(title);
  }

  function modalError(title, text) {
    if (hasSwal()) {
      window.Swal.fire({ icon: "error", title, text });
      return;
    }
    window.alert(`${title}\n${text}`);
  }

  function integrityHash(fields) {
    const str = Array.isArray(fields)
      ? fields.map(function (v) { return String(v == null ? "" : v); }).join("|||")
      : String(fields == null ? "" : fields);
    let h1 = 0x811c9dc5;
    let h2 = 0xdeadbeef;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i) & 0xff;
      h1 = Math.imul(h1 ^ c, 0x01000193);
      h2 = Math.imul(h2 ^ c, 0x85ebca77);
    }
    h1 = (h1 ^ (h1 >>> 16)) >>> 0;
    h2 = (h2 ^ (h2 >>> 13)) >>> 0;
    return ("00000000" + h1.toString(16)).slice(-8) + ("00000000" + h2.toString(16)).slice(-8);
  }

  function sealTransferContext(ctx) {
    if (!ctx || typeof ctx !== "object") return ctx;
    try {
      const snapshot = JSON.parse(JSON.stringify(ctx));
      Object.defineProperty(ctx, "__sealedSnapshot", {
        value: Object.freeze(snapshot),
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.defineProperty(ctx, "__sealedIntegrity", {
        value: integrityHash([
          snapshot.toFullName,
          snapshot.toAccountNumber,
          snapshot.toEmail,
          snapshot.amount,
          snapshot.currency,
          snapshot.feeAmount
        ]),
        writable: false,
        enumerable: false,
        configurable: false
      });
      Object.freeze(ctx);
    } catch (_) {}
    return ctx;
  }

  function verifyTransferContextIntegrity(ctx, displayedValues) {
    if (!ctx || typeof ctx !== "object") return false;
    try {
      const sealed = ctx.__sealedSnapshot;
      const sealedHash = ctx.__sealedIntegrity;
      if (!sealed || !sealedHash) return false;
      const rehash = integrityHash([
        sealed.toFullName,
        sealed.toAccountNumber,
        sealed.toEmail,
        sealed.amount,
        sealed.currency,
        sealed.feeAmount
      ]);
      if (rehash !== sealedHash) return false;
      if (displayedValues && typeof displayedValues === "object") {
        const keys = ["toFullName", "toAccountNumber", "toEmail", "amount", "currency", "feeAmount"];
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          const seal = String(sealed[k] == null ? "" : sealed[k]);
          const disp = String(displayedValues[k] == null ? "" : displayedValues[k]);
          if (seal !== disp) return false;
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function showTransferSuccessCustom(opts) {
    opts = opts || {};
    var amountText = String(opts.amountText || "");
    var accountHolder = String(opts.accountHolder || "");
    var detailRows = Array.isArray(opts.detailRows) ? opts.detailRows : [];
    var onNewTx = typeof opts.onNewTx === "function" ? opts.onNewTx : null;
    var onBackHome = typeof opts.onBackHome === "function" ? opts.onBackHome : function () {
      window.location.href = "/customer/dashboard.php";
    };

    var existing = document.getElementById("vtTransferSuccessOverlay");
    if (existing) existing.parentNode.removeChild(existing);

    var overlay = document.createElement("div");
    overlay.id = "vtTransferSuccessOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText = [
      "position:fixed",
      "top:0;left:0;right:0;bottom:0",
      "z-index:99999",
      "background:rgba(2,6,23,0.75)",
      "backdrop-filter:blur(4px)",
      "-webkit-backdrop-filter:blur(4px)",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "padding:20px",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
    ].join(";");

    var rowsHtml = detailRows.map(function (row) {
      var label = String(row.label || "");
      var value = String(row.value || "");
      return (
        '<div style="' +
        "display:flex;align-items:center;justify-content:space-between;" +
        "padding:18px 14px;border-bottom:1px solid rgba(148,163,184,0.15);" +
        '">' +
        '<div style="display:flex;align-items:center;gap:14px;">' +
        '<div style="' +
        "width:28px;height:28px;border-radius:50%;" +
        "background:rgba(56,189,248,0.15);" +
        "display:flex;align-items:center;justify-content:center;flex:0 0 auto;" +
        '">' +
        '<i class="fas fa-check" style="font-size:13px;color:#38bdf8;"></i>' +
        "</div>" +
        '<span style="font-size:14px;font-weight:600;color:#cbd5e1;">' +
        escapeHtml(label) + "</span>" +
        "</div>" +
        '<span style="font-size:14px;font-weight:700;color:#e2e8f0;text-align:right;max-width:60%;word-break:break-word;">' +
        value +
        "</span>" +
        "</div>"
      );
    }).join("");

    overlay.innerHTML =
      '<div style="' +
      "background:#0b1220;" +
      "border-radius:16px;" +
      "box-shadow:0 30px 80px -20px rgba(0,0,0,0.65);" +
      "width:100%;" +
      "max-width:520px;" +
      "padding:40px 40px 30px;" +
      "text-align:center;" +
      "max-height:92vh;" +
      "overflow-y:auto;" +
      '">' +
      '<div style="' +
      "width:96px;height:96px;margin:0 auto 22px;" +
      "border-radius:50%;background:#10b981;" +
      "display:flex;align-items:center;justify-content:center;" +
      "box-shadow:0 14px 40px -12px rgba(16,185,129,0.55);" +
      '">' +
      '<i class="fas fa-check" style="font-size:48px;color:#ffffff;font-weight:900;"></i>' +
      "</div>" +
      '<h2 style="' +
      "margin:0 0 16px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.3px;" +
      '">Transaction successful!</h2>' +
      '<p style="' +
      "margin:0 0 12px;font-size:16px;font-weight:500;color:#cbd5e1;line-height:1.6;" +
      '">You have successfully transferred <strong style="color:#f1f5f9;">' + amountText +
      '</strong> to <strong style="color:#f1f5f9;">' + escapeHtml(accountHolder) + "</strong>.</p>" +
      '<p style="' +
      "margin:0 0 28px;font-size:15px;font-weight:600;color:#94a3b8;" +
      '">Details of your transaction are shown below;</p>' +
      '<div style="' +
      "border:1px solid rgba(148,163,184,0.18);" +
      "border-radius:10px;overflow:hidden;background:rgba(15,23,42,0.6);margin-bottom:28px;" +
      '">' + rowsHtml + "</div>" +
      '<div style="' +
      "display:flex;gap:14px;justify-content:center;flex-wrap:wrap;" +
      '">' +
      '<button id="vtCustomNewTxBtn" type="button" style="' +
      "padding:13px 26px !important;font-size:14px !important;font-weight:900 !important;border-radius:12px !important;border:2px solid #1d4ed8 !important;cursor:pointer !important;" +
      "background:#3b82f6 !important;background-color:#3b82f6 !important;color:#ffffff !important;box-shadow:0 10px 28px -10px rgba(59,130,246,0.95) !important;text-shadow:0 1px 2px rgba(0,0,0,0.45) !important;display:inline-block !important;visibility:visible !important;opacity:1 !important;" +
      '">New transaction</button>' +
      '<button id="vtCustomBackHomeBtn" type="button" style="' +
      "padding:13px 26px !important;font-size:14px !important;font-weight:900 !important;border-radius:12px !important;border:2px solid #b91c1c !important;cursor:pointer !important;" +
      "background:#ef4444 !important;background-color:#ef4444 !important;color:#ffffff !important;box-shadow:0 10px 28px -10px rgba(239,68,68,0.95) !important;text-shadow:0 1px 2px rgba(0,0,0,0.45) !important;display:inline-block !important;visibility:visible !important;opacity:1 !important;" +
      '">Back to home</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    function closeIt() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.style.overflow = "";
    }

    var newBtn = document.getElementById("vtCustomNewTxBtn");
    var homeBtn = document.getElementById("vtCustomBackHomeBtn");
    if (newBtn) {
      newBtn.addEventListener("click", function () {
        closeIt();
        if (onNewTx) onNewTx();
      });
    }
    if (homeBtn) {
      homeBtn.addEventListener("click", function () {
        closeIt();
        if (onBackHome) onBackHome();
      });
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        e.stopPropagation();
        e.preventDefault();
      }
    });

    document.addEventListener("keydown", function vtEscapeHandler(ev) {
      if (ev.key === "Escape") return;
    });

    return {
      close: closeIt
    };
  }

  function getFirebaseConfig() {
    const cfg = window.__FIREBASE_CONFIG__;
    if (!cfg) {
      throw new Error("Missing Firebase web config. Set FIREBASE_WEB_CONFIG_JSON on the server.");
    }
    return cfg;
  }

  function initFirebaseOnce() {
    if (!window.firebase) throw new Error("Firebase SDK not loaded");
    if (window.firebase.apps && window.firebase.apps.length) return;
    window.firebase.initializeApp(getFirebaseConfig());
  }

  async function sessionLoginWithIdToken(idToken) {
    const res = await fetch(apiUrl("/api/sessionLogin"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken })
    });
    if (!res.ok) {
      let msg = "Session login failed";
      try {
        const data = await res.json();
        msg = String(data?.detail || data?.error || msg);
      } catch {}
      throw new Error(msg);
    }
  }

  async function sessionLogin(email, password) {
    initFirebaseOnce();
    const auth = window.firebase.auth();
    await auth.signInWithEmailAndPassword(String(email || "").trim(), String(password || ""));
    const idToken = await auth.currentUser.getIdToken(true);
    await sessionLoginWithIdToken(idToken);
  }

  async function sessionLogout() {
    await fetch(apiUrl("/api/sessionLogout"), { method: "POST", credentials: "include" });
  }

  async function upsertProfile(profile) {
    const res = await fetch(apiUrl("/api/profile"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(profile)
    });
    if (!res.ok) {
      throw new Error("Profile save failed");
    }
  }

  var VT_KYC_CACHE_KEY_AUTH = "vt_kyc_state_v1";
  var VT_KYC_PERM_KEY_AUTH = "vt_kyc_perm_v1";
  var VT_KYC_CACHE_TTL_MS_AUTH = 24 * 60 * 60 * 1000;

  function readVtKycCacheAuth() {
    try {
      if (typeof window === "undefined") return null;
      var ss = null;
      try {
        if (window.sessionStorage) {
          var raw = window.sessionStorage.getItem(VT_KYC_CACHE_KEY_AUTH);
          if (raw) ss = JSON.parse(raw);
        }
      } catch (_) { ss = null; }
      var ls = null;
      try {
        if (window.localStorage) {
          var raw2 = window.localStorage.getItem(VT_KYC_PERM_KEY_AUTH);
          if (raw2) ls = JSON.parse(raw2);
        }
      } catch (_) { ls = null; }
      var merged = Object.assign({}, ls || {}, ss || {});
      if (ls && ls.kycCompleted === true && merged.kycCompleted !== true) merged.kycCompleted = true;
      if (ss && ss.kycCompleted === true && merged.kycCompleted !== true) merged.kycCompleted = true;
      var lsPic = String(ls?.profilePic || ls?.photoURL || ls?.photo || ls?.avatar || "");
      var ssPic = String(ss?.profilePic || ss?.photoURL || ss?.photo || ss?.avatar || "");
      var finalPic = ssPic || lsPic || "";
      if (finalPic) {
        merged.profilePic = merged.profilePic || finalPic;
        merged.photoURL = merged.photoURL || finalPic;
        merged.photo = merged.photo || finalPic;
        merged.avatar = merged.avatar || finalPic;
      }
      var lsPub = String(ls?.profilePicPublicId || ls?.photoURLPublicId || ls?.photoPublicId || ls?.avatarPublicId || "");
      var ssPub = String(ss?.profilePicPublicId || ss?.photoURLPublicId || ss?.photoPublicId || ss?.avatarPublicId || "");
      var finalPub = ssPub || lsPub || "";
      if (finalPub) {
        merged.profilePicPublicId = merged.profilePicPublicId || finalPub;
        merged.photoURLPublicId = merged.photoURLPublicId || finalPub;
        merged.photoPublicId = merged.photoPublicId || finalPub;
        merged.avatarPublicId = merged.avatarPublicId || finalPub;
      }
      if (ss && typeof ss === "object" && ss !== null) {
        var savedAt = Number(ss.savedAt || 0);
        if (!savedAt || Date.now() - savedAt > VT_KYC_CACHE_TTL_MS_AUTH) {
          if (ls && ls.kycCompleted === true) return Object.assign({}, merged, { kycCompleted: true });
          if (finalPic) return merged;
          return null;
        }
      } else if (!ls && !ss) {
        return null;
      }
      return merged;
    } catch (_) { return null; }
  }

  function applyVtKycCacheToMeAuth(me) {
    return me;
  }

  async function getMe() {
    const res = await fetch(apiUrl("/api/me"), { credentials: "include" }).catch(() => ({
      ok: false,
      status: 0,
      headers: { get: () => "" }
    }));
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "" ||
      window.location.protocol === "file:";
    if (!res.ok) {
      if (isLocal) {
        const fallback = loadJson(safeStorageKey("demo_me"), null) || {
          uid: "demo",
          email: "pj03165@gmail.com",
          profile: {
            firstname: "Frank",
            lastname: "James",
            phone: "+4478789166724",
            gender: "Male",
            createdAt: new Date().toISOString()
          }
        };
        return applyVtKycCacheToMeAuth(fallback);
      }
      return null;
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      if (!isLocal) return null;
      return (
        loadJson(safeStorageKey("demo_me"), null) || {
          uid: "demo",
          email: "pj03165@gmail.com",
          profile: {
            firstname: "Frank",
            lastname: "James",
            phone: "+4478789166724",
            gender: "Male",
            createdAt: new Date().toISOString()
          }
        }
      );
    }
    try {
      const raw = await res.json();
      return applyVtKycCacheToMeAuth(raw || null);
    } catch {
      return null;
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value == null ? "" : String(value);
  }

  function initialsFromName(name) {
    if (!name) return "VT";
    const parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    if (!parts.length) return "VT";
    return parts.map((p) => p.slice(0, 1).toUpperCase()).join("");
  }

  function getProfilePicFromMe(me) {
    if (!me) return "";
    const prof = me.profile || {};
    const sec = me.security || {};
    return String(
      prof.profilePic || prof.photoURL || prof.photo || prof.avatar ||
      me.profilePic || me.photoURL || me.photo || me.avatar ||
      sec.profilePic || sec.photoURL || sec.photo || sec.avatar || ""
    ).trim();
  }

  function renderAvatarElement(elOrId, picUrl, initials, name) {
    const el = typeof elOrId === "string" ? document.getElementById(elOrId) : elOrId;
    if (!el) return;
    const cleanPic = typeof picUrl === "string" ? picUrl.trim() : "";
    const cleanInitials = typeof initials === "string" && initials.trim() ? initials.trim() : "VT";
    const cleanName = typeof name === "string" && name.trim() ? escapeHtml(name.trim()) : "User";

    if (cleanPic && cleanPic !== "null" && cleanPic !== "undefined") {
      const safePic = escapeHtml(cleanPic);
      el.innerHTML = `<img src="${safePic}" alt="${cleanName}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;" onerror="this.onerror=null;this.parentElement.textContent='${cleanInitials}';" />`;
      el.style.background = "transparent";
      el.style.padding = "0";
      el.style.overflow = "hidden";
    } else {
      el.textContent = cleanInitials;
      el.style.background = "";
      el.style.padding = "";
      el.style.overflow = "";
      try {
        const imgs = el.querySelectorAll ? el.querySelectorAll("img") : [];
        for (let i = 0; i < imgs.length; i++) try { imgs[i].remove(); } catch (_) {}
      } catch (_) {}
    }
  }

  function formatDate(d) {
    if (!d) return "";
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatDateTime(d) {
    if (!d) return "";
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const day = date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
    const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${day} ${time}`;
  }

  function accountNumberFromUid(uid) {
    if (!uid) return "";
    let h = 2166136261;
    for (let i = 0; i < uid.length; i++) {
      h ^= uid.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    const n = Math.abs(h) % 10000000000;
    return String(n).padStart(10, "0");
  }

  function wireLoginForm() {
    const form = document.getElementById("multiStepForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email-1")?.value?.trim();
      const password = document.getElementById("password-1")?.value || "";
      if (!email || !password) {
        toast("warning", "Please enter email and password");
        return;
      }

      try {
        await sessionLogin(email, password);
        window.location.href = "/customer/verify-pin.php";
      } catch (err) {
        modalError("Login failed", err?.message || "Unable to sign in");
      }
    });
  }

  async function verifyAccountPin(accountPin) {
    const res = await fetch(apiUrl("/api/pin/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ accountPin })
    });
    if (!res.ok) {
      let msg = "Invalid Account PIN";
      try {
        const data = await res.json();
        msg = String(data?.error || data?.detail || msg);
      } catch {}
      throw new Error(msg);
    }
  }

  function wirePinVerifyPage() {
    const root = document.getElementById("pinVerifyRoot");
    if (!root) return;

    const form = document.getElementById("pinVerifyForm");
    const pinInput = document.getElementById("accountPin");
    const nameEl = document.getElementById("pinVerifyName");
    const initialsEl = document.getElementById("avatarInitials");
    const logoutBtn = document.getElementById("pinVerifyLogout");
    const submitBtn = document.getElementById("verifyPinBtn");

    if (form) {
      form.noValidate = true;
    }
    if (pinInput) {
      pinInput.setAttribute("novalidate", "novalidate");
    }

    function syncPinState() {
      if (!pinInput) return;
      const raw = String(pinInput.value || "");
      const digits = raw.replace(/[^\d]/g, "").slice(0, 6);
      if (raw !== digits) {
        pinInput.value = digits;
      }
      if (submitBtn) submitBtn.disabled = !/^\d{6}$/.test(digits);
      try {
        pinInput.setCustomValidity("");
      } catch {}
    }

    logoutBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await sessionLogout();
      } finally {
        try {
          if (window.firebase?.auth) {
            initFirebaseOnce();
            await window.firebase.auth().signOut();
          }
        } catch (_) {}
        window.location.href = "/customer/login.php";
      }
    });

    pinInput?.addEventListener("input", syncPinState);
    pinInput?.addEventListener("change", syncPinState);
    pinInput?.addEventListener("paste", syncPinState);
    pinInput?.addEventListener("invalid", (e) => {
      e.preventDefault();
      try {
        pinInput?.setCustomValidity("");
      } catch {}
    });
    pinInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        try {
          pinInput?.setCustomValidity("");
        } catch {}
        form?.requestSubmit();
      }
    });
    syncPinState();

    submitBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        pinInput?.setCustomValidity("");
      } catch {}
      form?.requestSubmit();
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        pinInput?.setCustomValidity("");
      } catch {}
      const pin = String(pinInput?.value || "").trim();
      if (!/^\d{6}$/.test(pin)) {
        toast("warning", "Account PIN must be exactly 6 digits");
        syncPinState();
        return;
      }
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalLabel = submitBtn.innerHTML;
          submitBtn.innerHTML = 'Verifying <i class="fas fa-circle-notch fa-spin ms-2"></i>';
          try {
            await verifyAccountPin(pin);
          } finally {
            submitBtn.innerHTML = originalLabel;
          }
        } else {
          await verifyAccountPin(pin);
        }
        const url = new URL(window.location.href);
        const next = String(url.searchParams.get("next") || "").trim();
        if (next && /^\/[^/].*/.test(next)) {
          window.location.href = next;
        } else {
          window.location.href = "/customer/dashboard.php";
        }
      } catch (err) {
        syncPinState();
        modalError("Verification failed", err?.message || "Invalid Account PIN");
      }
    });

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }
      if (me?.pinVerified) {
        window.location.href = "/customer/dashboard.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "VanguardDoubleTrust";
      if (nameEl) nameEl.textContent = name;
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);
      if (initialsEl) renderAvatarElement(initialsEl, picUrl, initials, name);
      syncPinState();
    })();
  }

  function wireRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstname = document.getElementById("firstname")?.value?.trim() || "";
      const lastname = document.getElementById("lastname")?.value?.trim() || "";
      const phone = document.getElementById("phone")?.value?.trim() || "";
      const email = document.getElementById("email")?.value?.trim() || "";
      const country = document.getElementById("country")?.value?.trim() || "";
      const state = document.getElementById("state")?.value?.trim() || "";
      const city = document.getElementById("city")?.value?.trim() || "";
      const dob = document.getElementById("dob")?.value || "";
      const gender = document.getElementById("gender")?.value || "";
      const acctype = document.getElementById("acctype")?.value || "";
      const brname = document.getElementById("brname")?.value || "";
      const password = document.getElementById("accountpassword")?.value || "";
      const accountPin = document.getElementById("otp")?.value || "";
      const transferPin = document.getElementById("transactionpassword")?.value || "";

      if (!email || !password) {
        toast("warning", "Email and password are required");
        return;
      }

      try {
        initFirebaseOnce();
        const auth = window.firebase.auth();
        await auth.createUserWithEmailAndPassword(String(email || "").trim(), String(password || ""));
        const idToken = await auth.currentUser.getIdToken(true);
        await sessionLoginWithIdToken(idToken);
        await upsertProfile({
          firstname,
          lastname,
          phone,
          email,
          country,
          state,
          city,
          dob,
          gender,
          acctype,
          brname,
          accountPin,
          transferPin
        });
        window.location.href = "/customer/verify-pin.php";
      } catch (err) {
        modalError("Registration failed", err?.message || "Unable to create account");
      }
    });
  }

  function wireDashboardPage() {
    const root = document.getElementById("dashboardRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const name = me?.profile?.firstname
        ? `${me.profile.firstname} ${me?.profile?.lastname || ""}`.trim()
        : me?.email || me?.uid || "VanguardDoubleTrust";
      const liveBalance = balanceFromMe(me);
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("dashboardUserName", name);
      setText("dashboardUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);
      setText("balanceAmount", formatMoney(liveBalance));
      setText("savingAccountValue", formatMoney(liveBalance));
      setText("portfolioValue", "$0.00");
      setText("totalAssets", formatMoney(liveBalance));
    })();
  }

  function wireProfilePage() {
    const root = document.getElementById("profileRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "VanguardDoubleTrust";
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("profileUserName", name);
      setText("profileUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);

      setText("accountHolder", name);
      setText("emailAddress", me?.email || "--");

      const opening = me?.account?.openingDate || me?.createdAt || me?.profile?.createdAt || me?.profile?.created_at || me?.profile?.created || null;
      setText("accountOpening", formatDate(opening) || formatDate(new Date()));
      setText("lastLogin", formatDateTime(me?.account?.lastLogin || new Date()));

      const acct = accountNumberFromMe(me);
      setText("accountNumber", acct || "--");
    })();
  }

  function maskAccountNumber(num) {
    if (!num) return "";
    const s = String(num);
    const last4 = s.slice(-4);
    return `**** ${last4}`;
  }

  function formatMoney(amount) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "$0.00";
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
  }

  function accountNumberFromMe(me) {
    return me?.account?.accountNumber || me?.profile?.accountNumber || accountNumberFromUid(me?.uid);
  }

  function balanceFromMe(me) {
    const avail = Number(me?.account?.availableBalance);
    if (Number.isFinite(avail) && avail >= 0) return avail;
    const n = Number(me?.account?.balance);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function safeStorageKey(name) {
    return `vt_${name}`;
  }

  function balanceKey() {
    return safeStorageKey("balance_usd");
  }

  

  function setBalanceUSD(value) {
    const v = Number(value);
    if (!Number.isFinite(v) || v < 0) return;
    try {
      window.localStorage.setItem(balanceKey(), String(v));
    } catch {}
  }

  function loadJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function transactionsKey() {
    return safeStorageKey("transactions");
  }

  function transfersKey() {
    return safeStorageKey("transfers");
  }

  function getTransfers() {
    const key = transfersKey();
    const t = loadJson(key, null);
    if (Array.isArray(t)) return t;
    const seed = [];
    saveJson(key, seed);
    return seed;
  }

  function addTransferHistory(tr) {
    if (!tr || typeof tr !== "object") return;
    const key = transfersKey();
    const list = Array.isArray(loadJson(key, null)) ? loadJson(key, []) : [];
    list.push(tr);
    saveJson(key, list);
  }

  function seedTransactionsIfMissing() {
    const key = transactionsKey();
    const existing = loadJson(key, null);
    if (Array.isArray(existing) && existing.length) return existing;
    const seed = [
      {
        at: new Date(Date.now() - 24 * 60 * 60 * 1000 * 170).toISOString(),
        id: "#TRX003900122",
        type: "DEPOSIT",
        desc: "Deposit to Account",
        amount: 4365423,
        status: "Completed"
      }
    ];
    saveJson(key, seed);
    return seed;
  }

  function getTransactions() {
    const key = transactionsKey();
    const t = loadJson(key, null);
    if (Array.isArray(t) && t.length) return t;
    return seedTransactionsIfMissing();
  }

  function addTransaction(tx) {
    if (!tx || typeof tx !== "object") return;
    const key = transactionsKey();
    const list = Array.isArray(loadJson(key, null)) ? loadJson(key, []) : [];
    list.push(tx);
    saveJson(key, list);
  }

  function newTxId() {
    const n = Math.floor(100000000 + Math.random() * 900000000);
    return `#TRX${n}`;
  }

  function wireStatementPage() {
    const root = document.getElementById("statementRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    const pageSizeEl = document.getElementById("stPageSize");
    const searchEl = document.getElementById("stSearch");
    const tbody = document.getElementById("stTbody");
    const info = document.getElementById("stInfo");

    const state = {
      all: getTransactions(),
      pageSize: Number(pageSizeEl?.value || 25),
      q: "",
      page: 1
    };

    function normalize(s) {
      return String(s || "").toLowerCase();
    }

    function filteredRows() {
      if (!state.q) return state.all;
      const q = normalize(state.q);
      return state.all.filter((t) => {
        return (
          normalize(t.at).includes(q) ||
          normalize(t.id).includes(q) ||
          normalize(t.type).includes(q) ||
          normalize(t.desc).includes(q) ||
          normalize(t.status).includes(q) ||
          normalize(t.amount).includes(q)
        );
      });
    }

    function render() {
      if (!tbody || !info) return;
      const rows = filteredRows();
      const total = rows.length;
      const pageSize = state.pageSize;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      state.page = Math.min(state.page, pages);

      const start = (state.page - 1) * pageSize;
      const end = Math.min(start + pageSize, total);

      tbody.innerHTML = "";
      for (let i = start; i < end; i++) {
        const t = rows[i];
        const date = formatDateTime(t.at) || "--";
        const amount = formatMoney(t.amount);
        const signClass = Number(t.amount) >= 0 ? "pos" : "neg";
        const amountText = `${Number(t.amount) >= 0 ? "+" : "-"}${amount.replace("-", "")}`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${date}</td>
          <td>${t.id}</td>
          <td>${t.type}</td>
          <td>${t.desc}</td>
          <td class="st-amount ${signClass}">${amountText}</td>
          <td><span class="st-pill">${t.status}</span></td>
        `;
        tbody.appendChild(tr);
      }

      info.textContent = `Showing ${total ? start + 1 : 0} to ${end} of ${total} entries`;

      const pager = document.getElementById("stPager");
      if (pager) {
        pager.innerHTML = "";
        const prev = document.createElement("a");
        prev.href = "#";
        prev.textContent = "Previous";
        prev.style.fontWeight = "900";
        prev.style.color = state.page > 1 ? "#0B0F14" : "#94a3b8";
        prev.style.textDecoration = "none";
        prev.onclick = (e) => {
          e.preventDefault();
          if (state.page > 1) {
            state.page -= 1;
            render();
          }
        };

        const next = document.createElement("a");
        next.href = "#";
        next.textContent = "Next";
        next.style.fontWeight = "900";
        next.style.color = state.page < pages ? "#0B0F14" : "#94a3b8";
        next.style.textDecoration = "none";
        next.onclick = (e) => {
          e.preventDefault();
          if (state.page < pages) {
            state.page += 1;
            render();
          }
        };

        const mid = document.createElement("span");
        mid.textContent = ` Page ${state.page} of ${pages} `;
        mid.style.fontWeight = "900";
        mid.style.color = "#64748b";

        pager.appendChild(prev);
        pager.appendChild(mid);
        pager.appendChild(next);
      }
    }

    pageSizeEl?.addEventListener("change", () => {
      state.pageSize = Number(pageSizeEl.value || 25);
      state.page = 1;
      render();
    });

    searchEl?.addEventListener("input", () => {
      state.q = searchEl.value || "";
      state.page = 1;
      render();
    });

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "VanguardDoubleTrust";
      const acct = accountNumberFromMe(me);
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("statementUserName", name);
      setText("statementUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);

      setText("stAccountHolder", name);
      setText("stAccountNumber", maskAccountNumber(acct) || "--");

      setText("stCurrentBalance", formatMoney(balanceFromMe(me)));

      render();
    })();
  }

  function wireInternationalTransferPage() {
    const root = document.getElementById("internationalRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    const form = document.getElementById("internationalForm");
    const btn = document.getElementById("submitTransfer");
    const debitFrom = document.getElementById("debitFrom");
    const balEl = document.getElementById("internationalBalance");
    const helloLine = document.getElementById("helloLine");

    function setReady(ready) {
      if (!btn) return;
      if (ready) {
        btn.classList.add("ready");
        btn.disabled = false;
        btn.style.cursor = "pointer";
        return;
      }
      btn.classList.remove("ready");
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
    }

    function getField(id) {
      return (document.getElementById(id)?.value || "").trim();
    }

    function validate() {
      const bankName = getField("bankName");
      const bankAddress = getField("bankAddress");
      const receiverName = getField("receiverName");
      const accountNumber = getField("accountNumber");
      const swift = getField("swift");
      const amount = Number(getField("amount"));
      const debit = (debitFrom?.value || "").trim();
      const ok =
        bankName &&
        bankAddress &&
        receiverName &&
        accountNumber &&
        swift &&
        Number.isFinite(amount) &&
        amount > 0 &&
        debit;
      setReady(Boolean(ok));
      return Boolean(ok);
    }

    form?.addEventListener("input", validate);
    debitFrom?.addEventListener("change", validate);


    form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {

  if (!validate()) {
    toast("warning", "Please complete all fields");
    return;
  }

  const receiverName = getField("receiverName");
  const bankName = getField("bankName");
  const bankAddress = getField("bankAddress");
  const swift = getField("swift");
  const accountNumber = getField("accountNumber");
  const amount = Number(getField("amount"));

  if (!Number.isFinite(amount) || amount <= 0) {
    toast("warning", "Please enter a valid transfer amount.");
    return;
  }

  const me = await getMe();

  if (!me) {
    window.location.href = "/customer/login.php";
    return;
  }

  const showCombinedPinAndOtpDialog = async (transferContext) => {
    const context = transferContext || {};
    const toAccountNumber = String(context.toAccountNumber || "").trim();
    const toEmail = String(context.toEmail || "").trim().toLowerCase();
    const amount = Number(context.amount);
    const currency = String(context.currency || "USD").trim().toUpperCase() || "USD";
    const memo = String(context.memo || "").trim();
    const toFullName = String(context.toFullName || "").trim() ||
                      (typeof receiverName !== "undefined" ? String(receiverName || "").trim() : "") ||
                      "";
    const feeAmount = typeof context.feeAmount === "number" ? context.feeAmount : 0;
    const displayCurrency = currency || "USD";
    const formattedAmount = Number.isFinite(amount) ? amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
    const formattedFee = Number.isFinite(feeAmount) ? feeAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
    const totalAmount = Number.isFinite(amount) && Number.isFinite(feeAmount) ? amount + feeAmount : amount;
    const formattedTotal = Number.isFinite(totalAmount) ? totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : formattedAmount;

    (function injectResponsiveTransferStyles() {
      const styleId = "vt-transfer-responsive-styles";
      if (document.getElementById(styleId)) return;
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = `
        .swal2-image { display: none !important; background-color: transparent !important; min-height: 0 !important; max-height: 0 !important; padding: 0 !important; margin: 0 !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }
        .swal2-container { padding: 10px !important; box-sizing: border-box !important; }
        .swal2-popup {
          width: 100% !important;
          max-width: 92vw !important;
          padding: 1.2em 1em 1.4em !important;
          box-sizing: border-box !important;
          border-radius: 16px !important;
        }
        .swal2-title {
          font-size: clamp(18px, 5vw, 26px) !important;
          line-height: 1.25 !important;
          padding: 0.2em 0.4em 0.6em !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        .swal2-html-container {
          margin: 0 !important;
          padding: 0 0.2em 1em !important;
          overflow-x: hidden !important;
          box-sizing: border-box !important;
        }
        .swal2-actions {
          flex-wrap: wrap !important;
          gap: 10px !important;
          margin: 0.6em auto 0 !important;
          padding: 0 0.4em !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .swal2-confirm, .swal2-cancel {
          flex: 1 1 auto !important;
          min-width: calc(50% - 10px) !important;
          max-width: 100% !important;
          padding: 0.75em 1em !important;
          font-size: clamp(13px, 3.6vw, 15px) !important;
          margin: 0 !important;
          white-space: normal !important;
          line-height: 1.35 !important;
          border-radius: 12px !important;
        }
        .swal2-close {
          width: 2.2em !important;
          height: 2.2em !important;
        }
        .vt-pin-otp-wrap, .vt-confirm-transfer-wrap {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 0 auto !important;
        }
        #vt-pin-input {
          height: clamp(42px, 12vw, 54px) !important;
          font-size: clamp(15px, 4.2vw, 20px) !important;
          letter-spacing: clamp(1px, 0.6vw, 3px) !important;
          padding: clamp(6px, 1.8vw, 10px) clamp(8px, 2.2vw, 14px) !important;
        }
        #vt-otp-input {
          height: clamp(48px, 14vw, 64px) !important;
          font-size: clamp(20px, 6.5vw, 32px) !important;
          letter-spacing: clamp(4px, 1.6vw, 12px) !important;
          padding: clamp(6px, 1.5vw, 10px) clamp(6px, 1.5vw, 10px) !important;
          text-indent: clamp(2px, 1vw, 10px) !important;
        }
        .vt-pin-otp-wrap > div:first-child {
          font-size: clamp(12px, 3.4vw, 14px) !important;
          line-height: 1.55 !important;
          padding: 0 0.2em !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        .vt-pin-otp-wrap label, .vt-confirm-transfer-wrap label {
          font-size: clamp(10px, 2.8vw, 12px) !important;
          letter-spacing: 0.04em !important;
        }
        .vt-confirm-transfer-wrap input.swal2-input {
          font-size: clamp(12px, 3.4vw, 15px) !important;
          height: clamp(38px, 10.5vw, 46px) !important;
          padding: clamp(5px, 1.4vw, 8px) clamp(8px, 2vw, 12px) !important;
        }
        .vt-confirm-transfer-wrap input[id="vt-confirm-currency"],
        .vt-confirm-transfer-wrap input[id="vt-confirm-fee-currency"] {
          width: clamp(72px, 20vw, 90px) !important;
          flex: 0 0 clamp(72px, 20vw, 90px) !important;
          font-size: clamp(11px, 3vw, 13px) !important;
        }
        .vt-confirm-transfer-wrap input[id="vt-confirm-amount"],
        .vt-confirm-transfer-wrap input[id="vt-confirm-fee"] {
          font-size: clamp(13px, 3.8vw, 17px) !important;
          text-align: right !important;
        }
        @media (max-width: 400px) {
          .swal2-popup {
            max-width: 96vw !important;
            padding: 1em 0.75em 1.2em !important;
            border-radius: 14px !important;
          }
          .swal2-confirm, .swal2-cancel {
            min-width: 100% !important;
            width: 100% !important;
            padding: 0.7em 0.8em !important;
          }
          #vt-otp-input {
            letter-spacing: clamp(2px, 1vw, 6px) !important;
            font-size: clamp(18px, 6vw, 28px) !important;
            height: clamp(46px, 14vw, 58px) !important;
          }
          .vt-confirm-transfer-wrap > div > div {
            padding: 12px 10px !important;
          }
          .vt-confirm-transfer-wrap input[id="vt-confirm-fullname"],
          .vt-confirm-transfer-wrap input[id="vt-confirm-acctnum"] {
            font-size: clamp(11px, 3.2vw, 14px) !important;
          }
        }
        @media (max-width: 340px) {
          .swal2-popup {
            max-width: 98vw !important;
            padding: 0.8em 0.55em 1em !important;
            border-radius: 12px !important;
          }
          .swal2-title {
            font-size: 17px !important;
            padding: 0.1em 0.2em 0.5em !important;
          }
          #vt-pin-input::placeholder {
            font-size: 11px !important;
            letter-spacing: 0 !important;
          }
          #vt-otp-input {
            letter-spacing: 2px !important;
            font-size: 17px !important;
            height: 44px !important;
          }
          .vt-confirm-transfer-wrap input[id="vt-confirm-currency"],
          .vt-confirm-transfer-wrap input[id="vt-confirm-fee-currency"] {
            width: 58px !important;
            flex: 0 0 58px !important;
            padding: 4px 4px !important;
            font-size: 10px !important;
          }
        }
        @media (min-width: 768px) {
          .swal2-popup { max-width: 560px !important; }
          .swal2-confirm, .swal2-cancel {
            min-width: 160px !important;
            max-width: 220px !important;
          }
        }
      `;
      document.head.appendChild(s);
    })();

    const sealedCtx = sealTransferContext({
      toFullName: toFullName,
      toAccountNumber: toAccountNumber,
      toEmail: toEmail,
      amount: amount,
      currency: displayCurrency,
      feeAmount: feeAmount
    });

    if (hasSwal()) {
      const Swal = window.Swal;
      return await new Promise((resolve) => {
        const L = (typeof window !== 'undefined' && window.__vtLang) || (window.__ctx && window.__ctx.preferredLanguage) || (typeof document !== 'undefined' && document.documentElement.getAttribute('lang')) || 'en';
        const T = (k) => (typeof VT !== 'undefined' && VT.I18N ? VT.I18N.t(L, k) : k);
        let transferPin = "";
        let phase = "pin"; // pin -> confirm
        let resolved = false;
        let popupCloseGuardTimer = null;

        const safeResolve = (value) => {
          if (resolved) return;
          resolved = true;
          if (popupCloseGuardTimer) { try { clearInterval(popupCloseGuardTimer); popupCloseGuardTimer = null; } catch (_) {} }
          try { Swal.close(); } catch (_) {}
          resolve(value);
        };

        const startPopupCloseGuard = () => {
          if (popupCloseGuardTimer) { try { clearInterval(popupCloseGuardTimer); } catch (_) {} }
          popupCloseGuardTimer = setInterval(() => {
            if (resolved) return;
            try {
              const hasVisible = typeof Swal.isVisible === "function" ? Swal.isVisible() : !!Swal.getPopup();
              const popupEl = Swal.getPopup();
              const popupInDom = popupEl && document.body && document.body.contains(popupEl);
              if (!hasVisible && !popupInDom) {
                safeResolve(null);
              }
            } catch (_) {}
          }, 80);
        };

        const renderPinOtpBody = (opts = {}) => {
          const sendError = opts.sendError ? String(opts.sendError) : "";
          return `
            <div class="vt-pin-otp-wrap">
              <div style="text-align:center; margin-bottom:18px; color:#475569; font-size:14px; line-height:1.6;">
                ${T('xfer_proceedToConfirm')}
              </div>

              <div style="margin-bottom: 14px;">
                <label for="vt-pin-input" style="display:block; text-align:left; font-size:12px; font-weight:700; color:#475569; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:6px;">
                  Transfer PIN (6 digits)
                </label>
                <input
                  id="vt-pin-input"
                  type="password"
                  autocomplete="off"
                  placeholder="${T('xfer_pinPlaceholder')}"
                  value="${transferPin ? escapeHtml(transferPin) : ""}"
                  class="swal2-input"
                  style="display:block; width:100%; height:46px; padding:8px 12px; box-sizing:border-box; text-align:center; letter-spacing:2px; font-size:18px; border:1px solid #cbd5e1; border-radius:10px;"
                />
              </div>

              ${sendError ? `
                <div style="margin-top:12px; padding:10px 12px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; color:#991b1b; font-size:13px; line-height:1.5; text-align:left;">
                  ${escapeHtml(sendError)}
                </div>
              ` : ""}
            </div>
          `;
        };

        const renderConfirmBody = (opts = {}) => {
// #region debug-point E:renderconfirm-entry
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__renderConfirmBody__entry",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,integrityError_present:!!opts&&!!opts.integrityError,toFullName_len:String(toFullName).length});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
          const integrityErr = opts.integrityError ? String(opts.integrityError) : "";
          return `
            <div class="vt-confirm-transfer-wrap">
              <div style="margin-bottom:18px; padding:14px 16px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; color:#1e40af; font-size:13px; line-height:1.6;">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                  <i class="fas fa-shield-alt" style="color:#2563eb; font-size:15px;"></i>
                  <span style="font-weight:800; font-size:14px;">${T('xfer_reviewHeading')}</span>
                </div>
                <div style="margin-left:28px;">${T('xfer_pinVerified')}</div>
              </div>

              <div style="border:1px solid rgba(148,163,184,0.18); border-radius:12px; overflow:hidden; background:rgba(15,23,42,0.04); margin-bottom:14px;">
                <div style="padding:14px 16px; border-bottom:1px solid rgba(148,163,184,0.14); background:rgba(15,23,42,0.06);">
                  <div style="font-size:11px; font-weight:800; color:#475569; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px;">${T('xfer_recipientLabel')}</div>
                  <div style="margin-bottom:10px;">
                    <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:3px; letter-spacing:0.03em;">Full Name (Account Holder)</label>
                    <input
                      type="text"
                      id="vt-confirm-fullname"
                      data-field="toFullName"
                      value="${escapeHtml(toFullName)}"
                      readonly="readonly"
                      disabled="disabled"
                      class="swal2-input"
                      style="display:block; width:100%; height:40px; padding:6px 12px; box-sizing:border-box; font-size:14px; font-weight:700; color:#0f172a; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none;"
                    />
                  </div>
                  <div style="margin-bottom:4px;">
                    <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:3px; letter-spacing:0.03em;">Account Number</label>
                    <input
                      type="text"
                      id="vt-confirm-acctnum"
                      data-field="toAccountNumber"
                      value="${escapeHtml(toAccountNumber)}"
                      readonly="readonly"
                      disabled="disabled"
                      class="swal2-input"
                      style="display:block; width:100%; height:40px; padding:6px 12px; box-sizing:border-box; font-size:14px; font-weight:700; color:#0f172a; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none;"
                    />
                  </div>
                </div>

                <div style="padding:14px 16px; border-bottom:1px solid rgba(148,163,184,0.14);">
                  <div style="font-size:11px; font-weight:800; color:#475569; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px;">${T('xfer_amountLabel')}</div>
                  <div style="margin-bottom:10px;">
                    <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:3px; letter-spacing:0.03em;">Transfer Amount</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <input
                        type="text"
                        id="vt-confirm-currency"
                        data-field="currency"
                        value="${escapeHtml(displayCurrency)}"
                        readonly="readonly"
                        disabled="disabled"
                        class="swal2-input"
                        style="display:block; width:90px; height:40px; padding:6px 10px; box-sizing:border-box; font-size:13px; font-weight:800; color:#0f172a; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; text-align:center; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none;"
                      />
                      <input
                        type="text"
                        id="vt-confirm-amount"
                        data-field="amount"
                        value="${escapeHtml(formattedAmount)}"
                        readonly="readonly"
                        disabled="disabled"
                        class="swal2-input"
                        style="display:block; flex:1 1 auto; height:40px; padding:6px 12px; box-sizing:border-box; font-size:16px; font-weight:900; color:#0f172a; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; text-align:right; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none;"
                      />
                    </div>
                  </div>
                  <div style="margin-bottom:10px;">
                    <label style="display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:3px; letter-spacing:0.03em;">${T('xfer_feeLabel')}</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <input
                        type="text"
                        id="vt-confirm-fee-currency"
                        data-field="feeCurrency"
                        value="${escapeHtml(displayCurrency)}"
                        readonly="readonly"
                        disabled="disabled"
                        class="swal2-input"
                        style="display:block; width:90px; height:40px; padding:6px 10px; box-sizing:border-box; font-size:13px; font-weight:800; color:#0f172a; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; text-align:center; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none;"
                      />
                      <input
                        type="text"
                        id="vt-confirm-fee"
                        data-field="feeAmount"
                        value="${escapeHtml(formattedFee)}"
                        readonly="readonly"
                        disabled="disabled"
                        class="swal2-input"
                        style="display:block; flex:1 1 auto; height:40px; padding:6px 12px; box-sizing:border-box; font-size:16px; font-weight:900; color:#0f172a; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; text-align:right; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none;"
                      />
                    </div>
                  </div>
                  <div style="padding:10px 12px; background:#0f172a; border-radius:8px;">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                      <span style="font-size:12px; font-weight:700; color:#cbd5e1; letter-spacing:0.04em; text-transform:uppercase;">${T('xfer_totalLabel')}</span>
                      <span style="font-size:18px; font-weight:900; color:#ffffff;">${escapeHtml(displayCurrency)} ${escapeHtml(formattedTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <input type="hidden" id="vt-confirm-integrity" data-field="integrityHash" value="${escapeHtml(integrityHash([toFullName, toAccountNumber, toEmail, amount, displayCurrency, feeAmount]))}" />

              ${integrityErr ? `
                <div style="margin:0 0 14px; padding:10px 12px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; color:#991b1b; font-size:13px; line-height:1.5; text-align:left;">
                  <strong style="display:block; margin-bottom:4px;">⚠ Integrity validation failed</strong>
                  ${escapeHtml(integrityErr)}
                </div>
              ` : ""}

              <div style="font-size:11px; color:#64748b; text-align:center; line-height:1.5;">
                <i class="fas fa-lock" style="color:#10b981;"></i>
                ${T('xfer_sealedNotice')}
              </div>
            </div>
          `;
        };

        const bindDelegatedHandlers = (popupEl) => {
// #region debug-point A:bind-entry
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__bindDelegatedHandlers__entry",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,popupEl_truthy:!!popupEl,popupEl_class:popupEl&&popupEl.className?String(popupEl.className):null,sentinel_already_set:!!(popupEl&&popupEl.__vtHandlersBound)});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
          if (!popupEl) {
// #region debug-point A:bind-earlyreturn
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__bindDelegatedHandlers__earlyReturn",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,reason_noPopup:!popupEl});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
            return;
          }
          if (popupEl.__vtHandlersBound === true) {
            return;
          }
          popupEl.__vtHandlersBound = true;
// #region debug-point A:bind-postset
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__bindDelegatedHandlers__postSetSentinel",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,sentinel_set_on_popup:true});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion

          const handleConfirmClick = (ev) => {
            if (ev && ev.stopImmediatePropagation) ev.stopImmediatePropagation();
            if (ev && ev.preventDefault) ev.preventDefault();
            if (ev && ev.stopPropagation) ev.stopPropagation();
            (async () => {
              try {
                if (phase === "pin") {
                  await onSendOtp();
                } else if (phase === "confirm") {
                  await onConfirmFinal();
                }
              } catch (dispatchErr) {
                try {
                  const errMsg = (dispatchErr && dispatchErr.message) ? dispatchErr.message : T('xfer_errorOtpBlocked');
                  if (phase === "confirm") {
                    openConfirmOrPinOtp({ integrityError: errMsg });
                  } else {
                    openConfirmOrPinOtp({ sendError: errMsg });
                  }
                } catch (_) {}
              }
            })();
            return false;
          };

          const handleCancelClick = (ev) => {
            if (ev && ev.stopImmediatePropagation) ev.stopImmediatePropagation();
            if (ev && ev.preventDefault) ev.preventDefault();
            if (ev && ev.stopPropagation) ev.stopPropagation();
            (async () => {
              try {
                if (phase === "confirm") {
                  phase = "pin";
                  openConfirmOrPinOtp({ focus: "vt-pin-input" });
                  return;
                }
                safeResolve(null);
              } catch (_) {
                safeResolve(null);
              }
            })();
            return false;
          };

          const attachDirectButtonHandlers = () => {
            const confirmBtn = popupEl.querySelector(".swal2-confirm");
            const cancelBtn = popupEl.querySelector(".swal2-cancel");

            if (confirmBtn) {
              confirmBtn.addEventListener("click", handleConfirmClick, true);
              confirmBtn.onclick = handleConfirmClick;
            }
            if (cancelBtn) {
              cancelBtn.addEventListener("click", handleCancelClick, true);
              cancelBtn.onclick = handleCancelClick;
            }
          };

          attachDirectButtonHandlers();

          popupEl.addEventListener("click", (ev) => {
            const confirmBtn = ev.target.closest && ev.target.closest(".swal2-confirm");
            const cancelBtn = ev.target.closest && ev.target.closest(".swal2-cancel");
            if (confirmBtn) {
              ev.preventDefault();
              ev.stopImmediatePropagation();
              ev.stopPropagation();
              handleConfirmClick(ev);
              return;
            }
            if (cancelBtn) {
              ev.preventDefault();
              ev.stopImmediatePropagation();
              ev.stopPropagation();
              handleCancelClick(ev);
              return;
            }
          }, true);

          popupEl.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
              const tag = (ev.target && ev.target.tagName) ? ev.target.tagName.toLowerCase() : "";
              if (tag === "textarea") return;
              ev.preventDefault();
              ev.stopImmediatePropagation();
              (async () => {
                if (phase === "pin") {
                  await onSendOtp();
                } else if (phase === "confirm") {
                  await onConfirmFinal();
                }
              })();
            }
          });

          const confirmWrap = popupEl.querySelector(".vt-confirm-transfer-wrap");
          if (confirmWrap) {
            const inputs = confirmWrap.querySelectorAll('input[type="text"], input[type="hidden"]');
            inputs.forEach(function (inp) {
              inp.addEventListener("cut", function (e) { e.preventDefault(); });
              inp.addEventListener("copy", function (e) { e.preventDefault(); });
              inp.addEventListener("paste", function (e) { e.preventDefault(); });
              inp.addEventListener("keydown", function (e) { e.preventDefault(); });
              inp.addEventListener("input", function (e) {
                if (e && e.target && e.target.getAttribute) {
                  const f = e.target.getAttribute("data-field");
                  if (f && sealedCtx && sealedCtx.__sealedSnapshot) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const orig = String(sealedCtx.__sealedSnapshot[f] == null ?
                      (f === "amount" ? formattedAmount :
                       f === "feeAmount" ? formattedFee :
                       f === "currency" ? displayCurrency : "")
                      : (f === "amount" ? Number(sealedCtx.__sealedSnapshot[f]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                         f === "feeAmount" ? Number(sealedCtx.__sealedSnapshot[f]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                         String(sealedCtx.__sealedSnapshot[f] || "")));
                    if (inp.value !== orig) {
                      try { inp.value = orig; } catch (_) {}
                    }
                  }
                }
                return false;
              }, true);
              inp.addEventListener("change", function (e) {
                if (e && e.target && e.target.getAttribute) {
                  const f = e.target.getAttribute("data-field");
                  if (f && sealedCtx && sealedCtx.__sealedSnapshot) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const orig = String(sealedCtx.__sealedSnapshot[f] == null ?
                      (f === "amount" ? formattedAmount :
                       f === "feeAmount" ? formattedFee :
                       f === "currency" ? displayCurrency : "")
                      : (f === "amount" ? Number(sealedCtx.__sealedSnapshot[f]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                         f === "feeAmount" ? Number(sealedCtx.__sealedSnapshot[f]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                         String(sealedCtx.__sealedSnapshot[f] || "")));
                    if (inp.value !== orig) {
                      try { inp.value = orig; } catch (_) {}
                    }
                  }
                }
                return false;
              }, true);
            });
          }
        };

        const openConfirmOrPinOtp = (extraOpts = {}) => {
// #region debug-point B:open-entry
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__openConfirmOrPinOtp__entry",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,phase_value:String(phase),integrityErr_present:!!(extraOpts&&extraOpts.integrityError),sendErr_present:!!(extraOpts&&extraOpts.sendError)});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
          if (phase === "confirm") {
// #region debug-point B:open-confirmbranch
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__openConfirmOrPinOtp__confirmBranch",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,about_to_call_Swal_fire:true});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
            const integrityErr = extraOpts.integrityError ? extraOpts.integrityError : "";
            Swal.fire({
              title: T('xfer_confirmTitle'),
              html: renderConfirmBody({ integrityError: integrityErr }),
              showCancelButton: true,
              confirmButtonText: T('xfer_confirmButton'),
              cancelButtonText: T('xfer_backToPin'),
              showConfirmButton: true,
              showCloseButton: true,
              focusConfirm: true,
              allowOutsideClick: false,
              allowEscapeKey: false,
              buttonsStyling: true,
              confirmButtonColor: "#059669",
              cancelButtonColor: "#475569",
              didOpen: (popupEl) => {
// #region debug-point B:confirm-didopen
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__confirmBranch__didOpen",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,popupEl_truthy:!!popupEl,titleEl_text:popupEl?String((popupEl.querySelector(".swal2-title")||{}).textContent||""):null,confirmBtn_text:popupEl?String((popupEl.querySelector(".swal2-confirm")||{}).textContent||""):null});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
                bindDelegatedHandlers(popupEl);
                startPopupCloseGuard();
                try {
                  const cb = popupEl.querySelector(".swal2-confirm");
                  if (cb && typeof cb.focus === "function") setTimeout(() => cb.focus(), 60);
                } catch (_) {}
              },
              willClose: () => {
// #region debug-point B:confirm-willclose
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__confirmBranch__willClose",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,phase_at_willclose:String(phase)});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
                if (!resolved) {
                  setTimeout(() => {
                    if (!resolved) {
                      try {
                        const stillVisible = typeof Swal.isVisible === "function" ? Swal.isVisible() : !!Swal.getPopup();
                        if (!stillVisible) safeResolve(null);
                      } catch (_) { safeResolve(null); }
                    }
                  }, 120);
                }
              },
              preConfirm: () => { return undefined; }
            });
            return;
          }

          const sendError = extraOpts.sendError ? extraOpts.sendError : "";
          const focus = extraOpts.focus || "vt-pin-input";

          Swal.fire({
            title: T('xfer_dialogTitle'),
            html: renderPinOtpBody({ sendError }),
            showCancelButton: true,
            confirmButtonText: T('xfer_proceedToConfirm'),
            cancelButtonText: T('xfer_cancelButton'),
            showConfirmButton: true,
            showCloseButton: true,
            focusConfirm: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            buttonsStyling: true,
            confirmButtonColor: "#0f172a",
            didOpen: (popupEl) => {
              bindDelegatedHandlers(popupEl);
              startPopupCloseGuard();
              try {
                const f = popupEl.querySelector("#" + focus);
                if (f && typeof f.focus === "function") setTimeout(() => f.focus(), 50);
              } catch (_) {}
            },
            willClose: () => {
// #region debug-point B:pinotp-willclose
try { const L=window.localStorage,t=Date.now(),k="dbg_otp_confirm__pinOtpBranch__willClose",prev=JSON.parse(L.getItem(k)||"[]");prev.push({ts:t,phase_value_at_willclose:String(phase)});L.setItem(k,JSON.stringify(prev.slice(-50)))}catch(_DBG__){}
// #endregion
              if (!resolved) {
                setTimeout(() => {
                  if (!resolved) {
                    try {
                      const stillVisible = typeof Swal.isVisible === "function" ? Swal.isVisible() : !!Swal.getPopup();
                      if (!stillVisible) safeResolve(null);
                    } catch (_) { safeResolve(null); }
                  }
                }, 120);
              }
            },
            preConfirm: () => { return undefined; }
          });
        };

        const onSendOtp = async () => {
          try {
            const popupEl = Swal.getPopup();
            if (popupEl) {
              const pinInput = popupEl.querySelector("#vt-pin-input");
              transferPin = pinInput ? String(pinInput.value || "").trim() : "";
            }
            if (!transferPin || transferPin.length < 6) {
              openConfirmOrPinOtp({ sendError: T('xfer_pinRequired6d') });
              return;
            }
            phase = "confirm";
            openConfirmOrPinOtp();
          } catch (outerErr) {
            try {
              phase = "pin";
              const msg = (outerErr && outerErr.message) ? outerErr.message : T('xfer_errorOtpBlocked');
              openConfirmOrPinOtp({ sendError: msg });
            } catch (_) {}
          }
        };

        const onConfirmFinal = async () => {
          try {
          const displayed = {
            toFullName: toFullName,
            toAccountNumber: toAccountNumber,
            toEmail: toEmail,
            amount: amount,
            currency: displayCurrency,
            feeAmount: feeAmount
          };

          const popupEl = Swal.getPopup();
          if (popupEl) {
            try {
              const fNameEl = popupEl.querySelector("#vt-confirm-fullname");
              const acctEl = popupEl.querySelector("#vt-confirm-acctnum");
              const amtEl = popupEl.querySelector("#vt-confirm-amount");
              const curEl = popupEl.querySelector("#vt-confirm-currency");
              const feeEl = popupEl.querySelector("#vt-confirm-fee");
              const intEl = popupEl.querySelector("#vt-confirm-integrity");

              const shownFullName = fNameEl ? String(fNameEl.value || "") : "";
              const shownAcct = acctEl ? String(acctEl.value || "") : "";
              const shownAmtRaw = amtEl ? String(amtEl.value || "").replace(/,/g, "") : "";
              const shownAmt = shownAmtRaw ? Number(shownAmtRaw) : NaN;
              const shownCur = curEl ? String(curEl.value || "") : "";
              const shownFeeRaw = feeEl ? String(feeEl.value || "").replace(/,/g, "") : "";
              const shownFee = shownFeeRaw ? Number(shownFeeRaw) : NaN;
              const shownIntegrity = intEl ? String(intEl.value || "") : "";

              const normalizedDisplayed = {
                toFullName: shownFullName,
                toAccountNumber: shownAcct,
                toEmail: toEmail,
                amount: shownAmt,
                currency: shownCur,
                feeAmount: shownFee
              };

              if (shownFullName !== String(toFullName || "")) {
                openConfirmOrPinOtp({ integrityError: T('xfer_pinInvalid') });
                return;
              }
              if (shownAcct !== String(toAccountNumber || "")) {
                openConfirmOrPinOtp({ integrityError: T('xfer_pinInvalid') });
                return;
              }
              if (String(shownCur).toUpperCase() !== String(displayCurrency || "").toUpperCase()) {
                openConfirmOrPinOtp({ integrityError: T('xfer_pinInvalid') });
                return;
              }
              if (!Number.isFinite(shownAmt) || !Number.isFinite(amount) || Math.abs(Number(shownAmt) - Number(amount)) > 0.001) {
                openConfirmOrPinOtp({ integrityError: T('xfer_pinInvalid') });
                return;
              }
              if (!Number.isFinite(shownFee) || Math.abs(Number(shownFee) - Number(feeAmount)) > 0.001) {
                openConfirmOrPinOtp({ integrityError: T('xfer_pinInvalid') });
                return;
              }

              const expectedIntegrity = integrityHash([
                String(toFullName || ""),
                String(toAccountNumber || ""),
                String(toEmail || ""),
                Number(amount),
                String(displayCurrency || ""),
                Number(feeAmount)
              ]);
              if (shownIntegrity !== expectedIntegrity) {
                openConfirmOrPinOtp({ integrityError: T('xfer_pinInvalid') });
                return;
              }

              if (!verifyTransferContextIntegrity(sealedCtx, normalizedDisplayed)) {
                openConfirmOrPinOtp({ integrityError: T('xfer_pinInvalid') });
                return;
              }
            } catch (integrityErr) {
              openConfirmOrPinOtp({ integrityError: (integrityErr && integrityErr.message) ? integrityErr.message : T('xfer_errorOtpBlocked') });
              return;
            }
          }

          if (!transferPin || typeof transferPin !== "string" || transferPin.length < 1) {
            phase = "pin";
            openConfirmOrPinOtp({ sendError: T('xfer_pinRequired6d') });
            return;
          }

          safeResolve({ transferPin });
          } catch (outerErr) {
            try {
              const msg = (outerErr && outerErr.message) ? outerErr.message : T('xfer_errorOtpBlocked');
              phase = "confirm";
              openConfirmOrPinOtp({ integrityError: msg });
            } catch (_) {}
          }
        };

        phase = "pin";
        openConfirmOrPinOtp();
      });
    }

    // Non-SweetAlert fallback: prompt for Transfer PIN only (PIN-only auth).
    const pv1 = window.prompt(
      "Enter your Transfer PIN (6 digits) to authorize this transfer.\n\nTransfer PIN:",
      ""
    );
    if (pv1 === null) return null;
    const pinVal = String(pv1 || "").trim();
    if (!pinVal || pinVal.length < 6) {
      window.alert("Transfer PIN must be at least 6 characters. Transfer cancelled.");
      return null;
    }
    return { transferPin: pinVal };
  };

  const processTransfer = async (opts) => {
    try {
      const L = (typeof window !== 'undefined' && window.__vtLang) || (window.__ctx && window.__ctx.preferredLanguage) || (typeof document !== 'undefined' && document.documentElement.getAttribute('lang')) || 'en';
      const T = (k) => (typeof VT !== 'undefined' && VT.I18N ? VT.I18N.t(L, k) : k);
      const authBundle = (opts && opts.authBundle) || null;
      let transferPin = "";
      if (authBundle && typeof authBundle === "object") {
        transferPin = String(authBundle.transferPin || "").trim();
      } else {
        transferPin = String(opts && opts.transferPin || "").trim();
      }

      const VT_ADMIN_HOLD_MS = 120000;
      let __vtAdminIsSender = false;
      try {
        const meAbort = new AbortController();
        const meTimer = setTimeout(() => meAbort.abort(), 4500);
        const meRes = await fetch("/api/me", { credentials: "include", signal: meAbort.signal }).catch(() => null);
        clearTimeout(meTimer);
        if (meRes && meRes.ok) {
          const meData = await meRes.json().catch(() => ({}));
          __vtAdminIsSender = Boolean(meData?.isAdminCreatedAccount);
        }
      } catch (_) { __vtAdminIsSender = false; }
      const __vtLocalSleep = (ms) => new Promise((rr) => setTimeout(rr, ms));
      const __vtFmtMmss = (ms) => {
        const total = Math.max(0, Math.ceil(Number(ms) / 1000));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      };

      /*
       * Look up the VanguardDoubleTrust recipient by account number.
       * The backend performs the authoritative lookup.
       */
      const lookupResponse = await fetch(
        `/api/customer/lookup-account?accountNumber=${encodeURIComponent(accountNumber)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json"
          }
        }
      );

      let lookupData = {};

      try {
        lookupData = await lookupResponse.json();
      } catch (_) {
        lookupData = {};
      }

      if (!lookupResponse.ok || !lookupData.ok || !lookupData.recipient) {
        throw new Error(
          lookupData.error || "Recipient account could not be found."
        );
      }

      const recipient = lookupData.recipient;

      /*
       * Make sure the entered receiver name matches the account
       * returned by the server.
       */
      const enteredName = receiverName.trim().toLowerCase();
      const actualName = String(recipient.fullName || "")
        .trim()
        .toLowerCase();

      if (actualName && enteredName !== actualName) {
        throw new Error(
          `The receiver name does not match the account holder. Account holder: ${recipient.fullName}`
        );
      }

      /*
       * Show Transfer PIN authorization dialog (single unified prompt
       * with two phases inside one dialog: PIN entry → Confirm review.
       * If processTransfer already has transferPin (retries from caller)
       * use the provided value.
       */
      if (!transferPin) {
        const combined = await showCombinedPinAndOtpDialog({
          toAccountNumber: recipient.accountNumber || accountNumber,
          toEmail: recipient.email || "",
          amount: amount,
          currency: recipient.currency || "USD",
          memo: `Bank transfer to ${recipient.fullName || receiverName}`,
          toFullName: recipient.fullName || receiverName,
          feeAmount: 0,
          transferPin: transferPin
        });

        if (!combined) {
          return;
        }
        transferPin = String(combined.transferPin || "").trim();
        if (!transferPin) {
          throw new Error("Transfer PIN is required. Please restart the transfer process.");
        }
      }

      let __vtHoldInterval = null;
      try {
        if (hasSwal()) {
          const holdBanner = __vtAdminIsSender
            ? `<div id="vtAdminHoldBanner" style="color:#f59e0b;font-weight:700;font-size:14px;margin-top:10px;line-height:1.5;">⚠️ Admin account security hold — processing in <span id="vtHoldCountdown" style="font-variant-numeric:tabular-nums;">${__vtFmtMmss(VT_ADMIN_HOLD_MS)}</span>…<br/><span style="font-weight:500;color:#94a3b8;font-size:12px;">This hold is applied exclusively to administrator-generated accounts and cannot be skipped.</span></div>`
            : "";
          const didOpenCb = () => {
            window.Swal.showLoading();
            if (__vtAdminIsSender) {
              let remaining = VT_ADMIN_HOLD_MS;
              const el = document.getElementById("vtHoldCountdown");
              const tick = () => {
                if (!el) { clearInterval(__vtHoldInterval); __vtHoldInterval = null; return; }
                el.textContent = __vtFmtMmss(remaining);
                remaining = Math.max(0, remaining - 250);
                if (remaining <= 0 && __vtHoldInterval) { clearInterval(__vtHoldInterval); __vtHoldInterval = null; }
              };
              tick();
              __vtHoldInterval = setInterval(tick, 250);
            }
          };
          window.Swal.fire({
            title: T('xfer_processing'),
            html: holdBanner,
            text: __vtAdminIsSender ? "" : "Verifying Transfer PIN and processing transfer...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: didOpenCb,
            willClose: () => { if (__vtHoldInterval) { clearInterval(__vtHoldInterval); __vtHoldInterval = null; } }
          });
        }
      } catch (_) { if (__vtHoldInterval) { clearInterval(__vtHoldInterval); __vtHoldInterval = null; } }

      /*
       * The server verifies the Transfer PIN (independent hash match) and
       * atomically adjusts balances.
       */
      const transferFetchPromise = (async () => {
        return fetch("/api/customer/transfer", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            toAccountNumber: recipient.accountNumber || accountNumber,
            toEmail: recipient.email || "",
            amount: amount,
            currency: recipient.currency || "USD",
            transferPin: transferPin,
            transferCode: transferPin,
            memo: `Bank transfer to ${recipient.fullName || receiverName}`
          })
        });
      })();
      const [response] = await Promise.all([
        transferFetchPromise,
        __vtAdminIsSender ? __vtLocalSleep(VT_ADMIN_HOLD_MS) : Promise.resolve()
      ]);
      if (hasSwal()) { try { window.Swal.close(); } catch (_) {} }
      try { if (__vtHoldInterval) { clearInterval(__vtHoldInterval); __vtHoldInterval = null; } } catch (_) {}

      let data = {};

      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "The transfer could not be completed."
        );
      }

      /*
       * The backend has successfully deducted the sender's balance
       * and credited the recipient's balance.
       */
      const newBalance = Number(data.newBalance);
      const newAvail = Number(data.newAvailableBalance);
      const reference = String(data.reference || "");
      const displayBalance = Number.isFinite(newAvail) && newAvail >= 0 ? newAvail : newBalance;

      if (Number.isFinite(displayBalance)) {
        if (balEl) {
          balEl.textContent = formatMoney(displayBalance);
        }

        if (!me.account) {
          me.account = {};
        }

        if (Number.isFinite(newBalance)) {
          me.account.balance = newBalance;
        }
        if (Number.isFinite(newAvail)) {
          me.account.availableBalance = newAvail;
        }
      }

      /*
       * Clear the form after a successful server response.
       */
      form.reset();
      setReady(false);

      /*
       * SUCCESS SCREEN
       */
      (function () {
        const currency = String(recipient.currency || (me && me.account && me.account.currency) || "USD").toUpperCase();
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " +
          now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        const accountHolder = recipient.fullName || receiverName;
        const bankNameVal = (typeof bankName !== "undefined") ? bankName : (recipient.bankName || "");
        const swiftVal = (typeof swift !== "undefined") ? swift : "";
        const displayBank = bankNameVal || (swiftVal ? swiftVal : "");

        const detailRows = [
          {
            label: "Amount Debited",
            value: currency + " " + formatMoney(amount).replace(/^[^\d]*/, "")
          },
          {
            label: "Transaction reference:",
            value: reference || "--"
          },
          {
            label: "Account holder:",
            value: escapeHtml(accountHolder)
          }
        ];

        if (displayBank) {
          detailRows.push({
            label: "Bank Name:",
            value: escapeHtml(displayBank)
          });
        }

        detailRows.push({
          label: "Date:",
          value: dateStr
        });

        if (Number.isFinite(displayBalance)) {
          detailRows.push({
            label: "Available Balance:",
            value: currency + " " + formatMoney(displayBalance).replace(/^[^\d]*/, "")
          });
        }

        showTransferSuccessCustom({
          amountText: formatMoney(amount),
          accountHolder: accountHolder,
          detailRows: detailRows,
          onNewTx: function () {
            try {
              const firstField = form.querySelector('input, select, textarea');
              if (firstField) firstField.focus();
            } catch (_) {}
          }
        });
      })();

      /*
       * Reload the current customer data so the dashboard/balance
       * state is refreshed from the server.
       */
      try {
        const refreshedMe = await getMe();

        if (refreshedMe) {
          const refreshedBalance = Number(refreshedMe?.account?.balance);

          if (Number.isFinite(refreshedBalance) && balEl) {
            balEl.textContent = formatMoney(refreshedBalance);
          }
        }
      } catch (refreshError) {
        console.warn(
          "[VT] Could not refresh customer balance:",
          refreshError
        );
      }
    } catch (error) {
      console.error("[VT] Transfer failed:", error);

      if (hasSwal()) {
        await window.Swal.fire({
          icon: "error",
          title: "Transfer Failed",
          text:
            error?.message ||
            "The transfer could not be completed. No balance was deducted.",
          confirmButtonText: "OK",
          confirmButtonColor: "#0f172a"
        });
      } else {
        alert(
          error?.message ||
            "The transfer could not be completed. No balance was deducted."
        );
      }
    }
  };

  /*
   * FIRST confirmation:
   * "Send US$5,000 to Frank James?"
   */
  if (hasSwal()) {
    const confirmation = await window.Swal.fire({
      icon: "question",
      title: "Confirm transfer",
      html: `
        <div style="
          text-align:center;
          font-size:14px;
          color:#475569;
          line-height:1.7;
        ">
          Send
          <strong>${escapeHtml(formatMoney(amount))}</strong>
          to
          <strong>${escapeHtml(receiverName)}</strong>?
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0f172a",
      allowOutsideClick: false
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    await processTransfer({});
    return;
  }

  if (
    !window.confirm(
      `Send ${formatMoney(amount)} to ${receiverName}?`
    )
  ) {
    return;
  }

  await processTransfer({});
} catch (outerErr) {
    console.error("[VT] Submit handler error:", outerErr);
    try {
      toast("error", (outerErr && outerErr.message) ? outerErr.message : "Something went wrong.");
    } catch (_) {}
    try {
      window.alert("Error: " + ((outerErr && outerErr.message) ? outerErr.message : "Something went wrong."));
    } catch (__) {}
  }
});

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "Customer";
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("internationalUserName", name);
      setText("internationalUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);
      setText("helloLine", `Dear ${name}`);

      if (balEl) balEl.textContent = formatMoney(balanceFromMe(me));

      const acct = accountNumberFromMe(me) || "3623953156";
      if (debitFrom) {
        debitFrom.innerHTML = "";
        const opt = document.createElement("option");
        opt.value = acct;
        opt.textContent = acct;
        debitFrom.appendChild(opt);
      }

      const sec = document.getElementById("securityText");
      if (sec) {
        const a = Math.floor(Math.random() * 200) + 10;
        const b = Math.floor(Math.random() * 255);
        const c = Math.floor(Math.random() * 255);
        const d = Math.floor(Math.random() * 255);
        sec.textContent = `Security Alert: Your IP address ${a}.${b}.${c}.${d} has been logged for security monitoring. Please ensure all beneficiary details are correct before proceeding.`;
      }

      setReady(false);
      validate();
    })();
  }

  function wireTransferHistoryPage() {
    const root = document.getElementById("transferHistoryRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    const pageSizeEl = document.getElementById("thPageSize");
    const searchEl = document.getElementById("thSearch");
    const tbody = document.getElementById("thTbody");
    const info = document.getElementById("thInfo");

    const state = {
      all: getTransfers(),
      pageSize: Number(pageSizeEl?.value || 10),
      q: "",
      page: 1
    };

    function normalize(s) {
      return String(s || "").toLowerCase();
    }

    function filteredRows() {
      if (!state.q) return state.all;
      const q = normalize(state.q);
      return state.all.filter((t) => {
        return (
          normalize(t.at).includes(q) ||
          normalize(t.id).includes(q) ||
          normalize(t.beneficiary).includes(q) ||
          normalize(t.bank).includes(q) ||
          normalize(t.amount).includes(q) ||
          normalize(t.status).includes(q)
        );
      });
    }

    function render() {
      if (!tbody || !info) return;
      state.all = getTransfers();
      const rows = filteredRows();
      const total = rows.length;
      const pageSize = state.pageSize;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      state.page = Math.min(state.page, pages);

      const start = (state.page - 1) * pageSize;
      const end = Math.min(start + pageSize, total);

      tbody.innerHTML = "";
      if (!total) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6" style="text-align:center;color:#64748b;font-weight:900">No data available in table</td>`;
        tbody.appendChild(tr);
      } else {
        for (let i = start; i < end; i++) {
          const t = rows[i];
          const date = formatDateTime(t.at) || "--";
          const amount = formatMoney(t.amount);
          const signClass = Number(t.amount) >= 0 ? "pos" : "neg";
          const amountText = `${Number(t.amount) >= 0 ? "+" : "-"}${amount.replace("-", "")}`;
          const status = t.status || "Pending";

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${t.id || ""}</td>
            <td>${date}</td>
            <td>${t.beneficiary || ""}</td>
            <td>${t.bank || ""}</td>
            <td style="text-align:right" class="st-amount ${signClass}">${amountText}</td>
            <td><span class="th-pill">${status}</span></td>
          `;
          tbody.appendChild(tr);
        }
      }

      info.textContent = `Showing ${total ? start + 1 : 0} to ${end} of ${total} entries`;

      const pager = document.getElementById("thPager");
      if (pager) {
        pager.innerHTML = "";
        const prev = document.createElement("a");
        prev.href = "#";
        prev.textContent = "Previous";
        prev.style.fontWeight = "900";
        prev.style.color = state.page > 1 ? "#0B0F14" : "#94a3b8";
        prev.style.textDecoration = "none";
        prev.style.padding = "6px 10px";
        prev.style.border = "1px solid rgba(15,23,42,0.12)";
        prev.style.borderRadius = "8px";
        prev.onclick = (e) => {
          e.preventDefault();
          if (state.page > 1) {
            state.page -= 1;
            render();
          }
        };

        const next = document.createElement("a");
        next.href = "#";
        next.textContent = "Next";
        next.style.fontWeight = "900";
        next.style.color = state.page < pages ? "#0B0F14" : "#94a3b8";
        next.style.textDecoration = "none";
        next.style.padding = "6px 10px";
        next.style.border = "1px solid rgba(15,23,42,0.12)";
        next.style.borderRadius = "8px";
        next.onclick = (e) => {
          e.preventDefault();
          if (state.page < pages) {
            state.page += 1;
            render();
          }
        };

        pager.appendChild(prev);
        pager.appendChild(next);
      }
    }

    pageSizeEl?.addEventListener("change", () => {
      state.pageSize = Number(pageSizeEl.value || 10);
      state.page = 1;
      render();
    });

    searchEl?.addEventListener("input", () => {
      state.q = searchEl.value || "";
      state.page = 1;
      render();
    });

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "VanguardDoubleTrust";
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("transferHistoryUserName", name);
      setText("transferHistoryUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);

      render();
    })();
  }

  function cardKey() {
    return safeStorageKey("card");
  }

  function seedCardIfMissing(name) {
    const existing = loadJson(cardKey(), null);
    if (existing && typeof existing === "object") return existing;
    const base = `5555${String(Math.floor(100000000000 + Math.random() * 900000000000))}`;
    const number = base.slice(0, 16);
    const now = new Date();
    const mm = String(((now.getMonth() + 1 + 8) % 12) || 12).padStart(2, "0");
    const yy = String((now.getFullYear() + 4) % 100).padStart(2, "0");
    const card = {
      number,
      holder: name || "VanguardDoubleTrust",
      expiry: `${mm}/${yy}`,
      type: "Visa Platinum",
      currency: "USD ($)",
      security: "3D Secure Enabled",
      usage: "Global Transactions"
    };
    saveJson(cardKey(), card);
    return card;
  }

  function formatCardNumber(num) {
    if (!num) return "**** **** **** ****";
    const s = String(num).replace(/\D+/g, "").slice(0, 16);
    return s.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function maskCardNumber(num) {
    const s = String(num || "").replace(/\D+/g, "");
    const last4 = s.slice(-4);
    return `**** **** **** ${last4 || "****"}`;
  }

  function wireCardPage() {
    const root = document.getElementById("cardRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    const copyBtn = document.getElementById("copyCardNumberBtn");
    const toggleBtn = document.getElementById("toggleCardBtn");

    const state = { reveal: false, card: null };

    function render() {
      if (!state.card) return;
      setText("cardNumberDisplay", state.reveal ? formatCardNumber(state.card.number) : maskCardNumber(state.card.number));
      setText("cardHolderDisplay", state.card.holder || "--");
      setText("cardExpiryDisplay", state.card.expiry || "--/--");
      setText("cardTypeValue", state.card.type || "Visa Platinum");
      setText("cardCurrencyValue", state.card.currency || "USD ($)");
      setText("cardSecurityValue", state.card.security || "3D Secure Enabled");
      setText("cardUsageValue", state.card.usage || "Global Transactions");
      if (toggleBtn) toggleBtn.textContent = state.reveal ? "Hide" : "Show";
    }

    copyBtn?.addEventListener("click", async () => {
      if (!state.card?.number) return;
      try {
        await navigator.clipboard.writeText(formatCardNumber(state.card.number).replace(/\s+/g, ""));
        toast("success", "Card number copied");
      } catch {
        toast("warning", "Unable to copy");
      }
    });

    toggleBtn?.addEventListener("click", () => {
      state.reveal = !state.reveal;
      render();
    });

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "VanguardDoubleTrust";
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("cardUserName", name);
      setText("cardUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);

      state.card = seedCardIfMissing(name);
      render();
    })();
  }

  function pinHashKey() {
    return safeStorageKey("transaction_pin_hash");
  }

  async function sha256Hex(value) {
    const data = new TextEncoder().encode(String(value || ""));
    const digest = await crypto.subtle.digest("SHA-256", data);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function setRuleState(liId, ok) {
    const el = document.getElementById(liId);
    if (!el) return;
    const iconWrap = el.querySelector("span");
    if (!iconWrap) return;
    if (ok) {
      iconWrap.className = "ok";
      iconWrap.innerHTML = '<i class="fas fa-check"></i>';
      return;
    }
    iconWrap.className = "bad";
    iconWrap.innerHTML = '<i class="fas fa-xmark"></i>';
  }

  function validatePinStrength(pin) {
    const s = String(pin || "");
    const okLen = s.length >= 8;
    const okUpper = /[A-Z]/.test(s);
    const okNum = /\d/.test(s);
    const okSpec = /[^A-Za-z0-9]/.test(s);
    setRuleState("ruleLen", okLen);
    setRuleState("ruleUpper", okUpper);
    setRuleState("ruleNum", okNum);
    setRuleState("ruleSpec", okSpec);
    return okLen && okUpper && okNum && okSpec;
  }

  function setPinButtonReady(ready) {
    const btn = document.getElementById("updatePinBtn");
    if (!btn) return;
    if (ready) {
      btn.classList.add("ready");
      btn.disabled = false;
      btn.style.cursor = "pointer";
      return;
    }
    btn.classList.remove("ready");
    btn.disabled = true;
    btn.style.cursor = "not-allowed";
  }

  function wirePinPage() {
    const root = document.getElementById("pinRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    const form = document.getElementById("pinForm");
    const currentPin = document.getElementById("currentPin");
    const newPin = document.getElementById("newPin");
    const confirmPin = document.getElementById("confirmPin");

    root.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("[data-toggle-eye]");
      if (!btn) return;
      const id = btn.getAttribute("data-toggle-eye");
      const input = document.getElementById(id);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      const icon = btn.querySelector("i");
      if (icon) icon.className = input.type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
    });

    function validate() {
      const cur = (currentPin?.value || "").trim();
      const np = (newPin?.value || "").trim();
      const cp = (confirmPin?.value || "").trim();
      const okStrength = validatePinStrength(np);
      const okMatch = np && cp && np === cp;
      const ok = Boolean(cur && okStrength && okMatch);
      setPinButtonReady(ok);
      return ok;
    }

    newPin?.addEventListener("input", validate);
    confirmPin?.addEventListener("input", validate);
    currentPin?.addEventListener("input", validate);

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) {
        toast("warning", "Please complete all fields correctly");
        return;
      }

      const cur = (currentPin?.value || "").trim();
      const np = (newPin?.value || "").trim();

      try {
        const existingHash = window.localStorage.getItem(pinHashKey());
        if (existingHash) {
          const curHash = await sha256Hex(cur);
          if (curHash !== existingHash) {
            modalError("Invalid PIN", "Current PIN is incorrect.");
            return;
          }
        }
      } catch {}

      if (hasSwal()) {
        const res = await window.Swal.fire({
          icon: "question",
          title: "Update PIN?",
          text: "This will replace your current transaction PIN.",
          showCancelButton: true,
          confirmButtonText: "Update",
          cancelButtonText: "Cancel"
        });
        if (!res.isConfirmed) return;
      } else if (!window.confirm("Update your transaction PIN?")) {
        return;
      }

      try {
        const hash = await sha256Hex(np);
        window.localStorage.setItem(pinHashKey(), hash);
      } catch {}

      try {
        await upsertProfile({ transferPin: np });
      } catch {}

      toast("success", "Transaction PIN updated");
      form.reset();
      validatePinStrength("");
      setPinButtonReady(false);
    });

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "VanguardDoubleTrust";
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("pinUserName", name);
      setText("pinUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);

      if (!window.localStorage.getItem(pinHashKey())) {
        try {
          const seed = "Demo@1234";
          const hash = await sha256Hex(seed);
          window.localStorage.setItem(pinHashKey(), hash);
        } catch {}
      }

      validatePinStrength("");
      setPinButtonReady(false);
    })();
  }

  function passwordHashKey() {
    return safeStorageKey("login_password_hash");
  }

  async function tryFirebasePasswordUpdate(currentPassword, nextPassword) {
    try {
      if (!window.firebase?.auth) return false;
      initFirebaseOnce();
      const auth = window.firebase.auth();
      const user = auth?.currentUser;
      const email = user?.email;
      if (!user || !email) return false;
      const provider = window.firebase?.auth?.EmailAuthProvider;
      if (!provider?.credential) return false;
      const credential = provider.credential(email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(nextPassword);
      return true;
    } catch {
      return false;
    }
  }

  function validatePasswordStrength(pwd) {
    const s = String(pwd || "");
    const okLen = s.length >= 8;
    const okUpper = /[A-Z]/.test(s);
    const okNum = /\d/.test(s);
    const okSpec = /[^A-Za-z0-9]/.test(s);
    setRuleState("rulePwdLen", okLen);
    setRuleState("rulePwdUpper", okUpper);
    setRuleState("rulePwdNum", okNum);
    setRuleState("rulePwdSpec", okSpec);
    return okLen && okUpper && okNum && okSpec;
  }

  function setPasswordButtonReady(ready) {
    const btn = document.getElementById("updatePasswordBtn");
    if (!btn) return;
    if (ready) {
      btn.classList.add("ready");
      btn.disabled = false;
      btn.style.cursor = "pointer";
      return;
    }
    btn.classList.remove("ready");
    btn.disabled = true;
    btn.style.cursor = "not-allowed";
  }

  function wirePasswordPage() {
    const root = document.getElementById("passwordRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    const form = document.getElementById("passwordForm");
    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");

    root.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("[data-toggle-eye]");
      if (!btn) return;
      const id = btn.getAttribute("data-toggle-eye");
      const input = document.getElementById(id);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      const icon = btn.querySelector("i");
      if (icon) icon.className = input.type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
    });

    function validate() {
      const cur = (currentPassword?.value || "").trim();
      const np = (newPassword?.value || "").trim();
      const cp = (confirmPassword?.value || "").trim();
      const okStrength = validatePasswordStrength(np);
      const okMatch = np && cp && np === cp;
      const ok = Boolean(cur && okStrength && okMatch);
      setPasswordButtonReady(ok);
      return ok;
    }

    newPassword?.addEventListener("input", validate);
    confirmPassword?.addEventListener("input", validate);
    currentPassword?.addEventListener("input", validate);

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) {
        toast("warning", "Please complete all fields correctly");
        return;
      }

      const cur = (currentPassword?.value || "").trim();
      const np = (newPassword?.value || "").trim();

      try {
        const existingHash = window.localStorage.getItem(passwordHashKey());
        if (existingHash) {
          const curHash = await sha256Hex(cur);
          if (curHash !== existingHash) {
            modalError("Invalid Password", "Current password is incorrect.");
            return;
          }
        }
      } catch {}

      if (hasSwal()) {
        const res = await window.Swal.fire({
          icon: "question",
          title: "Update Password?",
          text: "This will replace your login password.",
          showCancelButton: true,
          confirmButtonText: "Update",
          cancelButtonText: "Cancel"
        });
        if (!res.isConfirmed) return;
      } else if (!window.confirm("Update your login password?")) {
        return;
      }

      const firebaseOk = await tryFirebasePasswordUpdate(cur, np);

      try {
        const hash = await sha256Hex(np);
        window.localStorage.setItem(passwordHashKey(), hash);
      } catch {}

      toast("success", firebaseOk ? "Password updated" : "Password updated");
      form.reset();
      validatePasswordStrength("");
      setPasswordButtonReady(false);
    });

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "VanguardDoubleTrust";
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("passwordUserName", name);
      setText("passwordUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);

      if (!window.localStorage.getItem(passwordHashKey())) {
        try {
          const seed = "Demo@1234";
          const hash = await sha256Hex(seed);
          window.localStorage.setItem(passwordHashKey(), hash);
        } catch {}
      }

      validatePasswordStrength("");
      setPasswordButtonReady(false);
    })();
  }

  function wireStocksPage() {
    const root = document.getElementById("stocksRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    const mkPath = document.getElementById("mkPath");
    const mkArea = document.getElementById("mkArea");
    const liveMarket = document.getElementById("liveMarket");
    const pfBody = document.getElementById("pfBody");
    const pfEmpty = document.getElementById("pfEmpty");
    const hisBody = document.getElementById("hisBody");
    const hisEmpty = document.getElementById("hisEmpty");

    const prices = {
      AAPL: 338.19,
      TSLA: 298.32,
      NVDA: 190.01,
      AMZN: 226.65,
      GOOGL: 336.71
    };

    const assets = [
      { sym: "AAPL", name: "Apple Inc.", logo: "" },
      { sym: "TSLA", name: "Tesla, Inc.", logo: "T" },
      { sym: "NVDA", name: "NVIDIA Corp", logo: "N" },
      { sym: "AMZN", name: "Amazon.com", logo: "a" },
      { sym: "GOOGL", name: "Alphabet Inc.", logo: "G" }
    ];

    const portfolioKey = safeStorageKey("portfolio");
    const historyKey = safeStorageKey("stock_history");

    // function getBalance() {
    //   return getBalanceUSD();
    // }

    // function setBalance(b) {
    //   setBalanceUSD(b);
    // }

    function loadPortfolio() {
      return loadJson(portfolioKey, {});
    }

    function savePortfolio(p) {
      saveJson(portfolioKey, p);
    }

    function loadHistory() {
      return loadJson(historyKey, []);
    }

    function saveHistory(h) {
      saveJson(historyKey, h);
    }

    function toChartPath(series) {
      const w = 1000;
      const h = 260;
      const padX = 20;
      const padY = 30;
      const min = Math.min.apply(null, series);
      const max = Math.max.apply(null, series);
      const range = max - min || 1;
      const step = (w - padX * 2) / (series.length - 1);

      let d = "";
      for (let i = 0; i < series.length; i++) {
        const x = padX + step * i;
        const y = padY + ((max - series[i]) / range) * (h - padY * 2);
        d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
      }
      return d;
    }

    function toAreaPath(lineD) {
      return `${lineD} L1000,260 L0,260 Z`;
    }

    let chart = [];
    for (let i = 0; i < 60; i++) {
      const base = 4200;
      const t = i / 6;
      chart.push(base + Math.sin(t) * 55 + Math.sin(t / 2) * 30 + i * 3.2);
    }

    function rerenderChart() {
      if (!mkPath || !mkArea) return;
      const d = toChartPath(chart);
      mkPath.setAttribute("d", d);
      mkArea.setAttribute("d", toAreaPath(d));
    }

    function renderMarket() {
      if (!liveMarket) return;
      liveMarket.innerHTML = "";
      assets.forEach((a) => {
        const row = document.createElement("div");
        row.className = "mk-row";
        const price = prices[a.sym] ?? 0;
        row.innerHTML = `
          <div class="l">
            <div class="logo">${a.logo}</div>
            <div class="txt">
              <p class="sym">${a.sym}</p>
              <p class="name">${a.name}</p>
            </div>
          </div>
          <div class="r">
            <div class="mk-price" data-price="${a.sym}">${formatMoney(price)}</div>
            <button class="mk-btn" type="button" data-buy="${a.sym}">Buy</button>
          </div>
        `;
        liveMarket.appendChild(row);
      });
    }

    function renderPortfolio() {
      const pf = loadPortfolio();
      const entries = Object.keys(pf)
        .sort()
        .map((sym) => ({ sym, qty: Number(pf[sym]?.qty || 0) }))
        .filter((x) => x.qty > 0);

      if (pfBody) pfBody.innerHTML = "";
      if (pfEmpty) pfEmpty.style.display = entries.length ? "none" : "block";

      if (!pfBody) return;
      entries.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="text-align:left">${p.sym}</td>
          <td style="text-align:right">${p.qty}</td>
          <td style="text-align:right">
            <button class="mk-btn" type="button" data-sell="${p.sym}" style="background:#0f172a">Sell</button>
          </td>
        `;
        pfBody.appendChild(tr);
      });
    }

    function renderHistory() {
      const h = loadHistory().slice().reverse();
      if (hisBody) hisBody.innerHTML = "";
      if (hisEmpty) hisEmpty.style.display = h.length ? "none" : "block";
      if (!hisBody) return;

      h.slice(0, 12).forEach((x) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="text-align:left">${x.type}</td>
          <td style="text-align:left">${x.sym}</td>
          <td style="text-align:right">${x.qty}</td>
          <td style="text-align:right">${formatMoney(x.total)}</td>
          <td style="text-align:left">${formatDateTime(x.at) || ""}</td>
        `;
        hisBody.appendChild(tr);
      });
    }

    function renderBalance() {
      setText("stocksBalance", formatMoney(getBalance()));
    }

    function commitTrade(type, sym, qty) {
      const q = Number(qty);
      if (!Number.isFinite(q) || q <= 0) return false;
      const price = Number(prices[sym] || 0);
      if (!Number.isFinite(price) || price <= 0) return false;
      const total = price * q;

      const bal = getBalance();
      const pf = loadPortfolio();
      const cur = Number(pf[sym]?.qty || 0);

      if (type === "BUY") {
        if (bal < total) {
          modalError("Insufficient balance", "Your balance is not enough for this trade.");
          return false;
        }
        pf[sym] = { qty: cur + q };
        setBalance(bal - total);
      } else {
        if (cur < q) {
          modalError("Not enough shares", "You do not have enough shares to sell.");
          return false;
        }
        pf[sym] = { qty: cur - q };
        setBalance(bal + total);
      }

      savePortfolio(pf);
      const h = loadHistory();
      h.push({ type, sym, qty: q, total, at: new Date().toISOString() });
      saveHistory(h);
      return true;
    }

    function wireEvents() {
      root.addEventListener("click", (e) => {
        const el = e.target;
        const symBuy = el?.getAttribute?.("data-buy");
        const symSell = el?.getAttribute?.("data-sell");
        if (symBuy) {
          const qty = window.prompt(`Buy ${symBuy} - quantity?`, "1");
          if (!qty) return;
          if (commitTrade("BUY", symBuy, qty)) {
            renderBalance();
            renderPortfolio();
            renderHistory();
          }
          return;
        }
        if (symSell) {
          const qty = window.prompt(`Sell ${symSell} - quantity?`, "1");
          if (!qty) return;
          if (commitTrade("SELL", symSell, qty)) {
            renderBalance();
            renderPortfolio();
            renderHistory();
          }
        }
      });
    }

    function tick() {
      assets.forEach((a) => {
        const p = Number(prices[a.sym] || 0);
        const drift = (Math.random() - 0.5) * 0.012;
        const np = Math.max(1, p * (1 + drift));
        prices[a.sym] = Math.round(np * 100) / 100;
      });

      const last = chart[chart.length - 1];
      const drift = (Math.random() - 0.35) * 8;
      chart.push(last + drift);
      if (chart.length > 60) chart.shift();

      rerenderChart();

      const priceEls = root.querySelectorAll("[data-price]");
      priceEls.forEach((n) => {
        const s = n.getAttribute("data-price");
        if (!s) return;
        n.textContent = formatMoney(prices[s] ?? 0);
      });
    }

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }

      const firstname = me?.profile?.firstname || "";
      const lastname = me?.profile?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : me?.email || me?.uid || "VanguardDoubleTrust";
      const picUrl = getProfilePicFromMe(me);
      const initials = initialsFromName(name);

      setText("stocksUserName", name);
      setText("stocksUserEmail", me?.email || "");
      renderAvatarElement("avatarInitials", picUrl, initials, name);

      rerenderChart();
      renderMarket();
      renderBalance();
      renderPortfolio();
      renderHistory();
      wireEvents();

      window.setInterval(tick, 3000);
      window.setTimeout(tick, 1200);
    })();
  }

  function wireAccountPage() {
    const root = document.getElementById("accountRoot");
    if (!root) return;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await sessionLogout();
        } finally {
          try {
            if (window.firebase?.auth) {
              initFirebaseOnce();
              await window.firebase.auth().signOut();
            }
          } catch (_) {}
          window.location.href = "/customer/login.php";
        }
      });
    }

    (async () => {
      const me = await getMe();
      if (!me) {
        window.location.href = "/customer/login.php";
        return;
      }
      const el = document.getElementById("meJson");
      if (el) el.textContent = JSON.stringify(me, null, 2);
      const name = me?.profile?.firstname || me?.email || me?.uid;
      const title = document.getElementById("accountTitle");
      if (title && name) title.textContent = `Welcome, ${name}`;
    })();
  }

  async function bootstrapCustomerPage(opts) {
    const o = (typeof opts === "object" && opts) ? opts : {};
    const after = typeof o.after === "function" ? o.after : null;
    const me = await getMe();
    if (!me) {
      window.location.href = "/customer/login.php";
      throw new Error("Not authenticated");
    }
    const prof = (me && me.profile) ? me.profile : {};
    const sec = (me && me.security) ? me.security : {};
    const kycDone = Boolean(
      (me.onboarding && me.onboarding.kycCompleted) ||
      sec.kycCompleted || sec.KYCDone || sec.kycDone ||
      prof.kycCompleted || prof.KYCDone || prof.kycDone
    );
    const picUrl = String(
      me.profilePic || me.photoURL || me.photo || me.avatar ||
      prof.profilePic || prof.photoURL || prof.photo || prof.avatar ||
      sec.profilePic || sec.photoURL || ""
    ).trim();
    const picDone = Boolean(picUrl && picUrl !== "");

    let onboardingRequired = false;
    const persistedOb = me?.onboarding;
    if (persistedOb && typeof persistedOb.required === "boolean") {
      onboardingRequired = false;
    } else {
      onboardingRequired = false;
    }
    const onboarding = {
      required: onboardingRequired,
      kycCompleted: kycDone,
      profilePicUploaded: picDone
    };
    me.onboarding = onboarding;
    const lang = String(prof.preferredLanguage || me.preferredLanguage || "en").toLowerCase();
    const ctx = {
      me: me,
      onboarding: onboarding,
      kycCompleted: kycDone,
      profilePic: picUrl,
      photoURL: picUrl,
      picUploaded: picDone,
      profilePicUploaded: picDone,
      language: lang
    };
    const kycGate = document.getElementById("inlineKycGate");
    const picGate = document.getElementById("inlinePicGate");
    const dynamicKycGate = document.getElementById("vtKycGate");
    const dynamicPicGate = document.getElementById("vtPicGate");

    if (kycGate) kycGate.remove();
    if (picGate) picGate.remove();
    if (dynamicKycGate) dynamicKycGate.remove();
    if (dynamicPicGate) dynamicPicGate.remove();
    try { document.body.style.overflow = ""; } catch (_) {}

    try {
      if (window.VT) { window.VT._dbg1 = "bootstrapCustomerPage OK"; window.VT._me = me; }
    } catch (_) {}
    try {
      if (window.VT && window.VT.I18N && typeof window.VT.I18N.apply === "function") {
        window.VT.I18N.apply(lang, document);
      }
      if (typeof window.__vtApplyI18n === "function") {
        window.__vtApplyI18n(lang);
      }
    } catch (_) {}
    try {
      const name = prof.firstname ? `${prof.firstname} ${prof.lastname || ""}`.trim() : me.email || "Customer";
      const initials = initialsFromName(name);
      renderAvatarElement("avatarInitials", picUrl, initials, name);
    } catch (_) {}
    if (after) {
      try { after(ctx); } catch (e) { if (window.console) console.error("[VT] bootstrapCustomerPage after() failed:", e); }
    }
    return ctx;
  }

  function prefillKycForm(ctx) {
    const p = (ctx && ctx.me && ctx.me.profile) || {};
    try {
      const fields = [
        ["ikFirstname", p.firstname || p.firstName || ""],
        ["ikLastname", p.lastname || p.lastName || ""],
        ["ikPhone", p.phone || ""],
        ["ikCountry", p.country || ""],
        ["ikLanguage", p.preferredLanguage || "en"],
        ["ikGender", p.gender || ""],
        ["ikDob", p.dateOfBirth || p.dob || ""],
        ["ikNationality", p.nationality || ""],
        ["ikOccupation", p.occupation || ""],
        ["ikAddress", p.address || ""],
        ["ikCity", p.city || ""],
        ["ikState", p.state || ""],
        ["ikZip", p.zipCode || p.zip || p.postal || ""]
      ];
      fields.forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el || !val) return;
        if (el.tagName === "SELECT") {
          const norm = String(val);
          for (let i = 0; i < el.options.length; i++) {
            if (String(el.options[i].value) === norm) { el.selectedIndex = i; break; }
          }
        } else {
          el.value = String(val);
        }
      });
    } catch (_) {}
  }

  async function submitKycToServer(payload) {
    const res = await fetch(apiUrl("/api/customer/kyc"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(String(data?.error || data?.detail || "Unable to save KYC details."));
    return data;
  }

  async function uploadProfilePicToCloudinaryAndSave(fileDataUrl) {
    const cfgRes = await fetch(apiUrl("/api/upload/config"), { credentials: "include" });
    const cfg = await cfgRes.json().catch(() => ({}));
    let secureUrl = "";
    let publicId = "";
    let width = 0;
    let height = 0;
    let format = "png";
    let bytes = 0;
    if (cfg && cfg.enabled && cfg.cloudName && cfg.uploadPreset) {
      const fd = new FormData();
      fd.append("upload_preset", cfg.uploadPreset);
      if (cfg.folder) fd.append("folder", cfg.folder);
      fd.append("file", fileDataUrl);
      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`, {
        method: "POST",
        body: fd
      });
      const up = await upRes.json().catch(() => ({}));
      if (!upRes.ok || !up.secure_url) {
        throw new Error(String(up?.error?.message || "Unable to upload profile picture."));
      }
      secureUrl = String(up.secure_url || "");
      publicId = String(up.public_id || "");
      width = Number(up.width || 0);
      height = Number(up.height || 0);
      format = String(up.format || format);
      bytes = Number(up.bytes || 0);
    } else {
      secureUrl = String(fileDataUrl || "").slice(0, 5 * 1024 * 1024);
      bytes = secureUrl.length;
      format = (String(fileDataUrl || "").split(";")[0] || "").indexOf("jpeg") !== -1 ? "jpeg" :
               (String(fileDataUrl || "").split(";")[0] || "").indexOf("webp") !== -1 ? "webp" : "png";
    }
    const saveRes = await fetch(apiUrl("/api/customer/profile-pic"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ secure_url: secureUrl, public_id: publicId, width, height, format, bytes })
    });
    const data = await saveRes.json().catch(() => ({}));
    if (!saveRes.ok) throw new Error(String(data?.error || data?.detail || "Unable to save profile picture."));
    return data;
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireLoginForm();
    wireRegisterForm();
    wirePinVerifyPage();
    wireDashboardPage();
    wireProfilePage();
    wireStatementPage();
    wireInternationalTransferPage();
    wireTransferHistoryPage();
    wireCardPage();
    wirePinPage();
    wirePasswordPage();
    wireStocksPage();
    wireAccountPage();
  });

  if (typeof window !== "undefined") {
    window.VT = window.VT || {};
    window.VT.UI = window.VT.UI || {};
    window.VT.UI.bootstrapCustomerPage = bootstrapCustomerPage;
    window.VT.UI.submitKycToServer = submitKycToServer;
    window.VT.UI.uploadProfilePicToCloudinaryAndSave = uploadProfilePicToCloudinaryAndSave;
    window.VT.UI.showTransferSuccessCustom = showTransferSuccessCustom;
    window.__vtBootstrapCustomerPage = bootstrapCustomerPage;
  }
})();
