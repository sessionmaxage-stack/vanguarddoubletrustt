(() => {
  const meta = document.querySelector('meta[name="vt-api-base"]');
  const metaBase = meta ? meta.getAttribute("content") : "";
  const rawBase = String(window.__VT_API_BASE__ || metaBase || "").trim();
  const normalize = (s) => String(s || "").trim().replace(/\/+$/, "");

  const saved = (() => {
    try {
      return window.localStorage.getItem("vt_api_base") || "";
    } catch {
      return "";
    }
  })();

  const host = window.location.hostname;
  const allowSaved = host === "localhost" || host === "127.0.0.1" || window.location.protocol === "file:";
  const base = normalize(rawBase || (allowSaved ? saved : ""));
  if (base) {
    window.__VT_API_BASE__ = base;
    try {
      window.localStorage.setItem("vt_api_base", base);
    } catch {}
  } else if (!allowSaved) {
    try {
      window.localStorage.removeItem("vt_api_base");
    } catch {}
  }

  window.__FIREBASE_CONFIG__ =
    window.__FIREBASE_CONFIG__ ||
    {
      apiKey: "AIzaSyBtZ2Ik0S0MNISFvRQa0sZdIQiEubNG1U0",
      authDomain: "vanguardtrust-fdc63.firebaseapp.com",
      projectId: "vanguardtrust-fdc63",
      storageBucket: "vanguardtrust-fdc63.firebasestorage.app",
      messagingSenderId: "893262930775",
      appId: "1:893262930775:web:b4dc98cea83ab8fbb05412",
      measurementId: "G-RWTDFTQYR9"
    };
})();

(function(){
  if (typeof window.VT === "undefined") window.VT = {};
  if (typeof VT.UI === "undefined") VT.UI = {};
  if (typeof VT.UI.initLangDropdown === "function") return;

  /* ---- Google Translate cookie helpers (bidirectional sync: i18n ↔ GT widget) ---- */
  function __vtReadGoogtransCookie() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : "";  /* /en/es  format  */
    } catch(e) { return ""; }
  }
  function __vtWriteGoogtransCookie(i18nCode) {
    try {
      if (!i18nCode) return;
      var target = i18nCode;
      /* Google uses base 2-char primary for dialect fallbacks (pt-BR/zh-CN stay full) */
      var parts = __vtReadGoogtransCookie().split("/").filter(Boolean);
      var src = parts[0] || "en";
      var dest = (target === "zh") ? "zh-CN" : (target === "pt") ? "pt-BR" : target;
      if (dest === "en") src = "en"; /* always en->en base */
      var newVal = "/"+src+"/"+dest;
      var exp = new Date(Date.now() + 365*24*60*60*1000).toUTCString();
      document.cookie = "googtrans=" + encodeURIComponent(newVal) + "; path=/; SameSite=Lax; expires=" + exp + (location.protocol === "https:" ? "; Secure" : "");
      /* session-scoped googtrans fallback cookie (Google lib uses both scopes sometimes) */
      document.cookie = "googtrans=" + encodeURIComponent(newVal) + "; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
      /* Force immediate page re-translate if Google widget is on-page: simulate combo change to same value (no reload) */
      try {
        if (window.google && window.google.translate && typeof window.google.translate.TranslateElement === "function") {
          var gsel = document.querySelector("select.goog-te-combo");
          if (gsel) { gsel.value = dest; gsel.dispatchEvent(new Event("change", {bubbles:true})); }
        }
      } catch(_) {}
    } catch(e) {}
  }
  function __vtMirrorGoogtransToI18n(allowedLangs) {
    try {
      var val = __vtReadGoogtransCookie();
      if (!val) return null;
      var parts = val.split("/").filter(Boolean);
      if (parts.length < 2) return null;
      var dest = parts[1] || parts[0];
      var normalized = dest;
      if (dest === "zh-CN") normalized = "zh";
      else if (dest === "pt-BR") normalized = "pt";
      else if (dest.length >= 3 && dest.charAt(2) === "-") normalized = dest.substring(0,2);
      if (allowedLangs.indexOf(normalized) !== -1) {
        if (window.VT && window.VT.I18N && typeof VT.I18N.setLang === "function") VT.I18N.setLang(normalized);
        return normalized;
      } else if (allowedLangs.indexOf(dest) !== -1) {
        if (window.VT && window.VT.I18N && typeof VT.I18N.setLang === "function") VT.I18N.setLang(dest);
        return dest;
      }
      return null;
    } catch(e) { return null; }
  }
  function __vtObserveGoogleComboForMirroring(allowedLangs, vtSelect) {
    try {
      /* Observe mount point for injected goog-te-combo; watch change events forever */
      var attach = function() {
        var gCombo = document.querySelector("select.goog-te-combo");
        if (!gCombo) return false;
        if (gCombo.dataset.__vtMirrored === "1") return true;
        gCombo.dataset.__vtMirrored = "1";
        gCombo.addEventListener("change", function() {
          try {
            var sel = (gCombo.value || "").trim();
            if (!sel) return;
            var norm = sel === "zh-CN" ? "zh" : (sel === "pt-BR" ? "pt" : (sel.length>=3 && sel.charAt(2)==="-" ? sel.substring(0,2) : sel));
            if (allowedLangs.indexOf(norm) !== -1 && vtSelect && String(vtSelect.value) !== String(norm)) {
              vtSelect.value = norm;
              /* fire change once to update backend/display */
              vtSelect.dispatchEvent(new Event("change", {bubbles:true}));
            }
          } catch(_){}
        });
        return true;
      };
      if (attach()) return;
      var gObs = new MutationObserver(function(){ try { if (attach()) { gObs.disconnect(); } } catch(_){} });
      gObs.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function(){ try { attach(); gObs.disconnect(); } catch(_){} }, 5000);
    } catch(_) {}
  }

  VT.UI.initLangDropdown = function(containerEl, opts){
    opts = opts || {};
    var saveEndpoint = opts.saveEndpoint || "/api/profile";
    var allowedLangs = opts.allowedLangs || (VT.I18N && VT.I18N.SUPPORTED_LANGS) || ["en"];
    if (!containerEl) return;
    var selectId = "vtLangDropdown_" + Math.floor(Math.random()*1e9);
    var currentAppLang = (VT.I18N && VT.I18N.getAppliedLang) ? VT.I18N.getAppliedLang() : "en";
    /* Prefer googtrans cookie over default (persist across nav) */
    var mirrored = __vtMirrorGoogtransToI18n(allowedLangs);
    var initialVal = mirrored || currentAppLang;
    var optionsHtml = "";
    for (var i=0;i<allowedLangs.length;i++){
      var code = allowedLangs[i];
      var label = code;
      try { label = (VT.I18N && VT.I18N.DICT && VT.I18N.DICT[code] && VT.I18N.DICT[code]._name) ? VT.I18N.DICT[code]._name : code; } catch(e){}
      optionsHtml += '<option value="'+code+'">'+label+'</option>';
    }
    containerEl.innerHTML = '<select id="'+selectId+'" class="vt-lang-dropdown" style="min-height:44px; padding:0 12px; border-radius:12px; border:1px solid rgba(148,163,184,0.35); background:rgba(255,255,255,0.95); font-weight:700; font-size:13px; cursor:pointer; max-width:180px; touch-action:manipulation;">'+optionsHtml+'</select>';
    var sel = document.getElementById(selectId);
    if (!sel) return;
    sel.value = initialVal;
    /* Google → i18n mirror for pages where GT widget is also present (landing + dashboard) */
    __vtObserveGoogleComboForMirroring(allowedLangs, sel);
    try {
      fetch("/api/me", {credentials:"include"})
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(me){
          if (!me) return;
          var saved = me.preferredLanguage || me.language || initialVal;
          if (allowedLangs.indexOf(saved) !== -1) {
            sel.value = saved;
            if (typeof VT !== "undefined" && VT.I18N && typeof VT.I18N.setLang === "function") VT.I18N.setLang(saved);
            __vtWriteGoogtransCookie(saved);
          }
        })
        .catch(function(){});
    } catch(e){}
    sel.addEventListener("change", function(){
      var newVal = sel.value;
      if (typeof VT !== "undefined" && VT.I18N && typeof VT.I18N.setLang === "function") VT.I18N.setLang(newVal);
      __vtWriteGoogtransCookie(newVal);
      var body = JSON.stringify({preferredLanguage: newVal});
      try {
        fetch(saveEndpoint, {method:"PUT", credentials:"include", headers:{"Content-Type":"application/json"}, body: body}).catch(function(){});
      } catch(e){}
    });
    return sel;
  };
})();
