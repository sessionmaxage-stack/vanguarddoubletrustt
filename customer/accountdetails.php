<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Account Details - VanguardDoubleTrust</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta content="Account details" name="description">

  <link rel="icon" type="image/svg+xml" href="/assets/images/brand/favicon_VanguardDoubleTrust.svg">
  <link rel="icon" type="image/png" href="/assets/images/brand/favicon_1776155007.png">
  <link href="../css2-1?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="../ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css">
  <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css">
  <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css">
  <script src="../npm/sweetalert2%4011"></script>

  <style>
    :root {
      color-scheme: dark;
      --vt-primary: #e8c367;
      --vt-primary-2: #ffffff;
      --vt-bg: #0a0f1a;
      --vt-bg-2: #10172a;
      --vt-bg-3: #121a2d;
      --vt-card-bg: #10172a;
      --vt-card: #10172a;
      --vt-card-2: #121a2d;
      --vt-text: #ffffff;
      --vt-text-2: #cdd5e3;
      --vt-muted: #8a95ac;
      --vt-border: rgba(255, 255, 255, 0.10);
      --vt-line: rgba(255, 255, 255, 0.08);
      --vt-success: #6ee7a7;
      --vt-ok: #6ee7a7;
      --vt-danger: #ffffff;
      --vt-warn: #e8c367;
      --vt-info: #ffffff;
      --vt-accent: #e8c367;
      --vt-accent-2: #ffffff;
      --vt-avatar-bg: #121a2d;
      --vt-input-bg: #000000;
      --vt-input-fg: #ffffff;
      --vt-shadow: 0 18px 42px -18px rgba(0, 0, 0, 0.55);
      --primary-color: #e8c367;
      --secondary-color: #10172a;
      --dark-bg-color: #0a0f1a;
      --light-color: #ffffff;
      --white-color: #ffffff;
      --dark-color: #0a0f1a;
      --light-bg: #10172a;
      --gray-bg: #121a2d;
      --text-dark: #ffffff;
      --text-light: #0a0f1a;
      --border-color: rgba(255, 255, 255, 0.10);
    }

    button,
    .btn,
    [class*="button"],
    [role="button"],
    input[type="submit"],
    input[type="button"],
    a.btn,
    a[class*="-btn"] {
      background: var(--vt-primary) !important;
      background-color: var(--vt-primary) !important;
      color: #0a0f1a !important;
      border-color: var(--vt-primary) !important;
    }

    button.btn-secondary,
    .btn-secondary,
    .btn-outline,
    .btn-outline-primary,
    button.outline,
    .button.secondary,
    [class*="outline"] {
      background: transparent !important;
      background-color: transparent !important;
      color: var(--vt-primary) !important;
      border-color: var(--vt-primary) !important;
    }

    * {
      border-color: rgba(255, 255, 255, 0.10) !important;
    }

    html,
    body {
      background: var(--vt-bg);
      color: var(--vt-text);
    }

    body {
      background: #f8fafc;
      font-family: "Plus Jakarta Sans", sans-serif;
    }

    .wrap {
      max-width: 1100px;
      margin: 0 auto;
      padding: 28px 16px;
    }

    .cardx {
      background: #ffffff;
      border-radius: 22px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .hero {
      background: linear-gradient(135deg, #0B0F14 0%, #0F172A 100%);
      color: #fff;
      padding: 26px 26px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .hero h1 {
      font-size: 22px;
      margin: 0;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .bodyx {
      padding: 22px 26px 26px;
    }

    pre {
      background: #0b1220;
      color: #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      overflow: auto;
      margin: 0;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #fff;
      padding: 10px 14px;
      border-radius: 14px;
      font-weight: 700;
    }

    .btn-logout:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.2);
    }

    .btn-back {
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #fff;
      padding: 10px 14px;
      border-radius: 14px;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-back:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.2);
    }

    .vt-page-scroll {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .vt-page-scroll table {
      min-width: 600px;
    }

    @media (max-width: 1100px) {

      body .wrap,
      body .container-fluid,
      body .cardx,
      body main,
      body section {
        max-width: 100% !important;
        width: 100% !important;
        padding-left: 12px !important;
        padding-right: 12px !important;
      }
    }

    @media (max-width: 992px) {

      .hero,
      .topbar,
      .vt-topbar,
      header.page-header {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 10px !important;
      }

      .hero h1,
      .topbar h1,
      header.page-header h1 {
        font-size: 18px !important;
      }
    }

    @media (max-width: 720px) {

      .card-grid,
      .grid-2col,
      .grid-3col,
      .grid-4col,
      [class*="grid-"][style*="grid-template-columns"] {
        grid-template-columns: 1fr !important;
      }

      body,
      body .wrap,
      .hero,
      .cardx,
      .bodyx,
      main,
      section {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }

      table.card-table,
      .statement-table,
      .tx-table,
      .transfer-table {
        font-size: 12px;
      }

      .btn,
      button,
      .btn-logout,
      input[type=submit],
      select {
        min-height: 44px !important;
        touch-action: manipulation;
      }

      input,
      select,
      textarea {
        min-height: 44px;
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .hero {
        padding: 16px 14px !important;
      }

      .bodyx {
        padding: 16px 14px 20px !important;
      }

      h1 {
        font-size: 17px !important;
      }

      h2 {
        font-size: 15px !important;
      }

      .swal2-popup {
        max-width: 96vw !important;
      }

      #langDropdownContainer select {
        max-width: 100%;
        width: 100%;
      }
    }

    /* ===== BRIGHT READABLE BUTTONS (LOGOUT / PROCEED / DANGER / ACTION) ===== */
    #vtDashNewTxBtn,
    #vtCustomNewTxBtn {
      background: #3b82f6 !important;
      background-color: #3b82f6 !important;
      background-image: none !important;
      color: #ffffff !important;
      border: 2px solid #1d4ed8 !important;
      border-color: #1d4ed8 !important;
      font-weight: 900 !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 28px -10px rgba(59, 130, 246, 0.9) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4) !important;
    }

    #vtDashNewTxBtn:hover,
    #vtCustomNewTxBtn:hover {
      background-color: #2563eb !important;
      border-color: #1e40af !important;
      color: #ffffff !important;
      box-shadow: 0 14px 32px -10px rgba(59, 130, 246, 1) !important;
    }

    #vtDashHomeBtn,
    #vtCustomBackHomeBtn {
      background: #ef4444 !important;
      background-color: #ef4444 !important;
      background-image: none !important;
      color: #ffffff !important;
      border: 2px solid #b91c1c !important;
      border-color: #b91c1c !important;
      font-weight: 900 !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 28px -10px rgba(239, 68, 68, 0.9) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4) !important;
    }

    #vtDashHomeBtn:hover,
    #vtCustomBackHomeBtn:hover {
      background-color: #dc2626 !important;
      border-color: #991b1b !important;
      color: #ffffff !important;
      box-shadow: 0 14px 32px -10px rgba(239, 68, 68, 1) !important;
    }

    .vt-burger,
    #sidebarToggle,
    [class*="vt-burger"] {
      background: #ffffff !important;
      background-color: #ffffff !important;
      color: #0a0f1a !important;
      border: 2px solid rgba(232, 195, 103, 0.45) !important;
      border-color: rgba(232, 195, 103, 0.45) !important;
      width: 42px !important;
      height: 42px !important;
      border-radius: 12px !important;
      cursor: pointer !important;
      box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.55) !important;
    }

    .vt-burger i,
    #sidebarToggle i,
    [class*="vt-burger"] i,
    .vt-burger .fas,
    .vt-burger .fa-bars {
      color: #0a0f1a !important;
      font-size: 18px !important;
      font-weight: 900 !important;
    }

    .vt-burger:hover,
    #sidebarToggle:hover {
      background: #e8c367 !important;
      background-color: #e8c367 !important;
      border-color: #d4af37 !important;
      color: #0a0f1a !important;
      box-shadow: 0 10px 24px -10px rgba(232, 195, 103, 0.85) !important;
    }

    .vt-burger:hover i,
    #sidebarToggle:hover i {
      color: #0a0f1a !important;
    }

    .tf-btn,
    #submitTransfer,
    [id*="proceed"],
    [class*="proceed"],
    [class*="confirmBtn"],
    button.confirm,
    .swal2-confirm,
    .btn-primary,
    button[onclick*="proceed"],
    button[onclick*="submit"] {
      background: #2563eb !important;
      background-color: #2563eb !important;
      background-image: none !important;
      color: #ffffff !important;
      border-color: #2563eb !important;
      font-weight: 800 !important;
    }

    .tf-btn:hover,
    #submitTransfer:hover,
    [id*="proceed"]:hover,
    [class*="confirmBtn"]:hover,
    .swal2-confirm:hover,
    .btn-primary:hover {
      background-color: #1d4ed8 !important;
      border-color: #1d4ed8 !important;
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35) !important;
    }

    .btn-logout,
    #logoutBtn,
    #logoutBtn2,
    #quickLogoutBtn,
    #adminLogoutBtn,
    #pinVerifyLogout,
    [id*="Logout"],
    [class*="logout"],
    [class*="Logout"],
    .btn-danger,
    .btn.btn-dark,
    button.btn-dark,
    [class*="cancelBtn"],
    .swal2-cancel,
    button.cancel,
    [class*="cancel"] {
      background: #dc2626 !important;
      background-color: #dc2626 !important;
      background-image: none !important;
      color: #ffffff !important;
      border-color: #dc2626 !important;
      font-weight: 800 !important;
    }

    .btn-logout:hover,
    #logoutBtn:hover,
    #logoutBtn2:hover,
    #quickLogoutBtn:hover,
    #adminLogoutBtn:hover,
    #pinVerifyLogout:hover,
    .btn-danger:hover,
    .btn.btn-dark:hover,
    .swal2-cancel:hover {
      background-color: #b91c1c !important;
      border-color: #b91c1c !important;
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.35) !important;
    }

    .vt-action {
      background: #ffffff !important;
      background-color: #ffffff !important;
      color: #0a0f1a !important;
      border-color: rgba(255, 255, 255, 0.30) !important;
      font-weight: 800 !important;
    }

    .vt-action i {
      color: #2563eb !important;
    }

    .vt-action:hover {
      background: #f8fafc !important;
      color: #0a0f1a !important;
      box-shadow: 0 14px 32px -20px rgba(0, 0, 0, 0.5) !important;
    }
  </style>
</head>

<body>
  <div class="wrap" id="accountRoot">
    <div class="cardx">
      <div class="hero">
        <div>
          <h1 id="accountTitle">Account Details</h1>
          <div class="small" style="opacity: 0.85">Session-protected account area</div>
        </div>
        <div id="langDropdownContainer" style="flex: 0 0 auto; margin: 0 8px;"></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn-back" href="/customer/dashboard.php"><i class="fas fa-arrow-left"></i> Dashboard</a>
          <button class="btn-logout" id="logoutBtn" type="button"><span data-i18n="nav_logout">Logout</span> <i class="fas fa-arrow-right ms-2"></i></button>
        </div>
      </div>
      <div class="bodyx">
        <div class="mb-3 text-secondary fw-bold">Current session</div>
        <pre id="meJson">{}</pre>
      </div>
    </div>
  </div>

  <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="assets/js/customer-i18n.js"></script>
  <script src="assets/js/runtime-config.js"></script>
  <script src="assets/js/auth-session.js"></script>
  <script>
    (function() {
      function bootstrap() {
        try {
          if (typeof VT !== "undefined" && VT.I18N && typeof VT.I18N.setLang === "function") {
            var saved = "en";
            try {
              saved = localStorage.getItem("vt.lang") || saved;
            } catch (e) {}
            try {
              if (window.__ctx && __ctx.preferredLanguage) saved = __ctx.preferredLanguage;
            } catch (e) {}
            VT.I18N.setLang(saved);
          }
        } catch (e) {}
        try {
          if (typeof VT !== "undefined" && VT.I18N && typeof VT.I18N.bootstrapLangElements === "function") {
            VT.I18N.bootstrapLangElements(document);
          }
        } catch (e) {}
        try {
          var cont = document.getElementById("langDropdownContainer");
          if (cont && typeof VT !== "undefined" && VT.UI && typeof VT.UI.initLangDropdown === "function") {
            VT.UI.initLangDropdown(cont, {
              saveEndpoint: "/api/customer/profile"
            });
          }
        } catch (e) {}
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap);
      else bootstrap();
    })();
  </script>
</body>

</html>