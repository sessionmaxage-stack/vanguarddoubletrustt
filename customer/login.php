
<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="utf-8">
      <title>Login - VanguardDoubleTrust</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta content="Login to your account" name="description">
      
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
        --primary-purple: #e8c367;
        --dark-purple: #0a0f1a;
        --white: #ffffff;
        --gray-1: #121a2d;
        --gray-2: #10172a;
        --gray-3: #162038;
        --gray-4: #1c2744;
        --gray-5: #0a0f1a;
        --gray-6: #ffffff;
        --gray-7: #cdd5e3;
        --text-dark: #ffffff;
        --text-light: #0a0f1a;
        --accent: #e8c367;
        --border-color: rgba(255,255,255,0.10);
        --bg: #0a0f1a;
        --bg-body: #0a0f1a;
        --text-main: #ffffff;
        --text-secondary: #cdd5e3;
        --soft-purple-bg: rgba(232,195,103,0.10);
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
        --vt-border: rgba(255,255,255,0.10);
        --vt-line: rgba(255,255,255,0.08);
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
        --vt-shadow: 0 18px 42px -18px rgba(0,0,0,0.55);
        --primary-color: #e8c367;
        --dark-bg-color: #0a0f1a;
    }
    button, .btn, [class*="button"], [role="button"],
    input[type="submit"], input[type="button"],
    a.btn, a[class*="-btn"] {
        background: var(--vt-primary) !important;
        background-color: var(--vt-primary) !important;
        color: #0a0f1a !important;
        border-color: var(--vt-primary) !important;
    }
    button.btn-secondary, .btn-secondary, .btn-outline, .btn-outline-primary,
    button.outline, .button.secondary, [class*="outline"] {
        background: transparent !important;
        background-color: transparent !important;
        color: var(--vt-primary) !important;
        border-color: var(--vt-primary) !important;
    }
    * { border-color: rgba(255,255,255,0.10) !important; }
    html, body { background: var(--vt-bg); color: var(--vt-text); }
    :root {
        /* --- UPDATED TO BLUE THEME --- */
        --primary-purple: #0B0F14; 
        --dark-purple: #0F172A;
        --soft-purple-bg: rgba(15, 23, 42, 0.14);
        --bg-body: #f8fafc;
        --text-main: #0f172a;
        --text-secondary: #64748b;
    }
    
    body {
        background: var(--bg-body);
        font-family: 'Plus Jakarta Sans', sans-serif;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .login-container {
        width: 100%;
        max-width: 1100px;
        padding: 20px;
    }
    
    .login-card {
        border: none;
        border-radius: 24px;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        overflow: hidden;
        background: white;
        display: flex;
        flex-direction: column;
    }
    
    @media (min-width: 992px) {
        .login-card { flex-direction: row; min-height: 600px; }
    }
    
    .login-left {
        /* Updated Gradient to Blue */
        background: linear-gradient(135deg, var(--primary-purple) 0%, var(--dark-purple) 100%);
        color: white;
        padding: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        overflow: hidden;
        width: 100%;
    }
    
    @media (min-width: 992px) { .login-left { width: 45%; } }

    /* Hide Informational content on mobile devices */
    @media (max-width: 991px) {
        .login-left {
            display: none !important;
        }
    }

    .login-left::before {
        content: '';
        position: absolute;
        top: -50px; left: -50px; width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        border-radius: 50%;
    }
    
    .login-right {
        padding: 50px;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    @media (min-width: 992px) { .login-right { width: 55%; } }
    
    .welcome-text h1 { font-size: 2rem; font-weight: 800; margin-bottom: 10px; color:white; }
    .welcome-text p { font-size: 1rem; opacity: 0.9; margin-bottom: 30px; }
    
    .security-item { display: flex; align-items: center; margin-bottom: 20px; }
    .security-icon {
        width: 40px; height: 40px; border-radius: 12px;
        background: rgba(255, 255, 255, 0.2);
        display: flex; align-items: center; justify-content: center;
        margin-right: 15px; font-size: 18px; color: white;
    }
    .security-text h4 { font-size: 0.95rem; margin-bottom: 2px; color:white; font-weight: 600; }
    .security-text p { font-size: 0.8rem; opacity: 0.8; margin: 0; }
    
    .form-header h2 { font-size: 1.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 5px; }
    .form-header p { color: var(--text-secondary); margin-bottom: 30px; }
    
    .form-label { font-weight: 600; color: var(--text-main); font-size: 0.9rem; }
    .form-control {
        border-radius: 12px;
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
        height: 50px;
        font-size: 0.95rem;
        color: var(--text-main);
    }
    .form-control:focus {
        border-color: var(--primary-purple);
        box-shadow: 0 0 0 4px var(--soft-purple-bg);
    }
    
    .btn-login {
        background: var(--primary-purple);
        border: none;
        font-weight: 700;
        border-radius: 12px;
        padding: 14px;
        width: 100%;
        font-size: 1rem;
        color: white;
        transition: all 0.3s ease;
        margin-top: 20px;
        /* Updated Shadow to Blue */
        box-shadow: 0 4px 12px rgba(0, 51, 153, 0.3);
    }
    .btn-login:hover {
        background: var(--dark-purple);
        transform: translateY(-2px);
    }
    
    .password-field { position: relative; }
    .password-toggle {
        position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: #94a3b8; cursor: pointer;
    }
    .password-toggle:hover { color: var(--primary-purple); }
    
    .login-link { color: var(--primary-purple); font-weight: 600; text-decoration: none; font-size: 0.9rem; }
    .login-link:hover { color: var(--dark-purple); text-decoration: underline; }
    
    /* Step Indicator */
    .step-indicator { display: flex; justify-content: center; margin-bottom: 30px; gap: 10px; align-items: center; }
    .step { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
    .step.active { background: var(--primary-purple); color: white; }
    .step.inactive { background: #e2e8f0; color: #94a3b8; }
    .step-line { width: 50px; height: 3px; background: #e2e8f0; border-radius: 2px; }
    .step-line.active { background: var(--primary-purple); }
    
    /* Alert Section */
    .alert-section { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 25px; }
    .alert-section i { color: #0F172A; font-size: 1.2rem; margin-top: 2px; }
    .alert-text { font-size: 0.85rem; color: #0F172A; line-height: 1.5; }
    /* ===== BRIGHT READABLE BUTTONS (LOGOUT / PROCEED / DANGER / ACTION) ===== */
    .tf-btn, #submitTransfer, [id*="proceed"], [class*="proceed"], [class*="confirmBtn"],
    button.confirm, .swal2-confirm, .btn-primary,
    button[onclick*="proceed"], button[onclick*="submit"] {
        background: #2563eb !important;
        background-color: #2563eb !important;
        background-image: none !important;
        color: #ffffff !important;
        border-color: #2563eb !important;
        font-weight: 800 !important;
    }
    .tf-btn:hover, #submitTransfer:hover, [id*="proceed"]:hover, [class*="confirmBtn"]:hover,
    .swal2-confirm:hover, .btn-primary:hover {
        background-color: #1d4ed8 !important;
        border-color: #1d4ed8 !important;
        color: #ffffff !important;
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35) !important;
    }
    .btn-logout, #logoutBtn, #logoutBtn2, #quickLogoutBtn, #adminLogoutBtn,
    #pinVerifyLogout, [id*="Logout"], [class*="logout"], [class*="Logout"],
    .btn-danger, .btn.btn-dark, button.btn-dark, [class*="cancelBtn"],
    .swal2-cancel, button.cancel, [class*="cancel"] {
        background: #dc2626 !important;
        background-color: #dc2626 !important;
        background-image: none !important;
        color: #ffffff !important;
        border-color: #dc2626 !important;
        font-weight: 800 !important;
    }
    .btn-logout:hover, #logoutBtn:hover, #logoutBtn2:hover,
    #quickLogoutBtn:hover, #adminLogoutBtn:hover, #pinVerifyLogout:hover,
    .btn-danger:hover, .btn.btn-dark:hover, .swal2-cancel:hover {
        background-color: #b91c1c !important;
        border-color: #b91c1c !important;
        color: #ffffff !important;
        box-shadow: 0 6px 20px rgba(220, 38, 38, 0.35) !important;
    }
    .vt-action {
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #0a0f1a !important;
        border-color: rgba(255,255,255,0.30) !important;
        font-weight: 800 !important;
    }
    .vt-action i {
        color: #2563eb !important;
    }
    .vt-action:hover {
        background: #f8fafc !important;
        color: #0a0f1a !important;
        box-shadow: 0 14px 32px -20px rgba(0,0,0,0.5) !important;
    }
</style>
   </head>
   <body>
      <div class="login-container">
         <div class="login-card">
            
            <div class="login-left">
               <div style="margin-bottom: 40px;">
                   <img src="../assets/images/brand/logo_VanguardDoubleTrust_white.svg" alt="" height="50">
               </div>
               
               <div class="welcome-text">
                  <h1>Welcome Back</h1>
                  <p>Securely manage your finances with ease.</p>
               </div>
               
               <div class="security-features">
                  <div class="security-item">
                     <div class="security-icon"><i class="fas fa-shield-alt"></i></div>
                     <div class="security-text">
                        <h4>Bank-Level Security</h4>
                        <p>256-bit encryption active</p>
                     </div>
                  </div>
                  <div class="security-item">
                     <div class="security-icon"><i class="fas fa-lock"></i></div>
                     <div class="security-text">
                        <h4>Secure Login</h4>
                        <p>Protected authentication</p>
                     </div>
                  </div>
                  <div class="security-item">
                     <div class="security-icon"><i class="fas fa-clock"></i></div>
                     <div class="security-text">
                        <h4>24/7 Access</h4>
                        <p>Banking anytime, anywhere</p>
                     </div>
                  </div>
               </div>
            </div>

            <div class="login-right">
               <div class="form-header">
                  <h2>Sign In</h2>
                  <p>Enter your details to access your account.</p>
               </div>
               
                              
               <div class="step-indicator">
                  <div class="step active" id="step1-indicator">1</div>
                  <div class="step-line" id="step1-line"></div>
                  <div class="step inactive" id="step2-indicator">2</div>
               </div>
               
               <div class="alert-section">
                  <i class="fas fa-info-circle"></i>
                  <div class="alert-text">
                     Please enter your email address to begin. If you've forgotten your login details, please contact support.
                  </div>
               </div>
               
               <form id="multiStepForm" method="POST">
                  <div id="step1">
                     <div class="mb-3">
                        <label for="email-1" class="form-label">Email Address</label>
                        <input type="text" class="form-control" id="email-1" name="login" placeholder="name@example.com" required="">
                        <div class="invalid-feedback">Please enter a valid email address.</div>
                     </div>
                     <div class="form-check mb-4">
                        <input type="checkbox" class="form-check-input" id="rememberMe">
                        <label class="form-check-label text-secondary small" for="rememberMe">Remember my device</label>
                     </div>
                     <button type="button" class="btn-login" onclick="validateEmail()">Continue <i class="fas fa-arrow-right ms-2"></i></button>
                  </div>
                  
                  <div id="step2" style="display: none;">
                     <div class="mb-3">
                        <label for="password-1" class="form-label">Password</label>
                        <div class="password-field">
                           <input type="password" class="form-control" name="password" id="password-1" placeholder="Enter your password" required="">
                           <button type="button" class="password-toggle" id="password-toggle">
                              <i class="far fa-eye"></i>
                           </button>
                        </div>
                     </div>
                     <button name="go" id="go" class="btn-login" type="submit">Access Account</button>
                     <button type="button" class="btn btn-link text-secondary w-100 mt-2 text-decoration-none small" onclick="goBack()">Back to Email</button>
                  </div>
               </form>
               
               <div class="mt-4 text-center">
                  <p class="small text-secondary mb-2">
                     <a href="#" class="login-link contactLink">Forgot Password?</a>
                  </p>
                  <p class="small text-secondary">
                     New here? <a href="register.php.html" class="login-link">Create an Account</a>
                  </p>
               </div>
               
            </div>
         </div>
         
         <div class="text-center mt-4">
             <a href="../index.php.html" class="text-decoration-none text-secondary small fw-bold"><i class="fas fa-arrow-left me-1"></i> Back to Home</a>
             <div class="mt-2 small text-muted">&copy; 2026 VanguardDoubleTrust. All rights reserved.</div>
         </div>
      </div>
      
      <script src="assets/libs/jquery/jquery.min.js"></script>
      <script src="../assets/js/bootstrap.bundle.min.js"></script>
      <script src="assets/libs/simplebar/simplebar.min.js"></script>
      <script src="assets/libs/node-waves/waves.min.js"></script>
      <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js"></script>
      <script src="assets/js/runtime-config.js"></script>
      <script src="firebase-config.js"></script>
      <script src="assets/js/auth-session.js"></script>
      
      <script>
         function validateEmail() {
             var emailField = document.getElementById('email-1');
             var emailVal = emailField.value.trim();
             var emailRegex = /\S+@\S+\.\S+/;
             
             if (emailVal !== '' && emailRegex.test(emailVal)) {
                 document.getElementById('step1').style.display = 'none';
                 document.getElementById('step2').style.display = 'block';
                 
                 // Update indicators
                 document.getElementById('step1-indicator').classList.remove('active');
                 document.getElementById('step1-indicator').classList.add('inactive');
                 document.getElementById('step1-line').classList.add('active');
                 document.getElementById('step2-indicator').classList.remove('inactive');
                 document.getElementById('step2-indicator').classList.add('active');
                 
                 emailField.classList.remove('is-invalid');
             } else {
                 emailField.classList.add('is-invalid');
                 // Optional: Show quick toast/alert
                 Swal.fire({
                    toast: true, position: 'top-end', icon: 'warning', 
                    title: 'Please enter a valid email', showConfirmButton: false, timer: 3000
                 });
             }
         }
         
         function goBack() {
             document.getElementById('step2').style.display = 'none';
             document.getElementById('step1').style.display = 'block';
             
             document.getElementById('step2-indicator').classList.remove('active');
             document.getElementById('step2-indicator').classList.add('inactive');
             document.getElementById('step1-line').classList.remove('active');
             document.getElementById('step1-indicator').classList.add('active');
         }
         
         document.addEventListener('DOMContentLoaded', function() {
             // Contact Alert
             document.querySelectorAll('.contactLink').forEach(function(link) {
                 link.addEventListener('click', function(event) {
                     event.preventDefault();
                     Swal.fire({
                         title: 'Support',
                         text: 'Please contact us via email for account recovery.',
                         icon: 'info',
                         confirmButtonColor: '#0B0F14'
                     });
                 });
             });
             
             // Password Toggle
             const passwordToggle = document.getElementById('password-toggle');
             const passwordField = document.getElementById('password-1');
             
             if (passwordToggle) {
                 passwordToggle.addEventListener('click', function() {
                     const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                     passwordField.setAttribute('type', type);
                     this.querySelector('i').classList.toggle('fa-eye');
                     this.querySelector('i').classList.toggle('fa-eye-slash');
                 });
             }
         });
      </script>
   </body>
</html>
