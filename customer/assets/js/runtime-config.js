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
  VT.UI.initLangDropdown = function(containerEl, opts){
    opts = opts || {};
    var saveEndpoint = opts.saveEndpoint || "/api/customer/profile";
    var allowedLangs = opts.allowedLangs || (VT.I18N && VT.I18N.SUPPORTED_LANGS) || ["en"];
    if (!containerEl) return;
    var selectId = "vtLangDropdown_" + Math.floor(Math.random()*1e9);
    var currentAppLang = (VT.I18N && VT.I18N.getAppliedLang) ? VT.I18N.getAppliedLang() : "en";
    var initialVal = currentAppLang;
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
    try {
      fetch("/api/me", {credentials:"include"})
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(me){
          if (!me) return;
          var saved = me.preferredLanguage || me.language || initialVal;
          if (allowedLangs.indexOf(saved) !== -1) {
            sel.value = saved;
            if (typeof VT !== "undefined" && VT.I18N && typeof VT.I18N.setLang === "function") VT.I18N.setLang(saved);
          }
        })
        .catch(function(){});
    } catch(e){}
    sel.addEventListener("change", function(){
      var newVal = sel.value;
      if (typeof VT !== "undefined" && VT.I18N && typeof VT.I18N.setLang === "function") VT.I18N.setLang(newVal);
      var body = JSON.stringify({preferredLanguage: newVal});
      try {
        fetch(saveEndpoint, {method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body: body}).catch(function(){});
      } catch(e){}
    });
    return sel;
  };
})();
