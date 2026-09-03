
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Register - VanguardDoubleTrust</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="Create an account with us to explore the possibilities of online banking." name="description">
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
    
    .register-container {
        width: 100%;
        max-width: 1200px;
        padding: 20px;
    }
    
    .register-card {
        border: none;
        border-radius: 24px;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        overflow: hidden;
        background: white;
        display: flex;
        flex-direction: column;
    }
    
    @media (min-width: 992px) {
        .register-card { flex-direction: row; min-height: 800px; }
    }
    
    .register-left {
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
    
    @media (min-width: 992px) { .register-left { width: 40%; } }

    /* HIDE LEFT PANEL ON MOBILE */
    @media (max-width: 991px) {
        .register-left {
            display: none !important;
        }
    }

    .register-left::before {
        content: '';
        position: absolute;
        top: -50px; left: -50px; width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        border-radius: 50%;
    }
    
    .register-right {
        padding: 50px;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    @media (min-width: 992px) { .register-right { width: 60%; } }
    
    .logo-container { margin-bottom: 40px; }
    
    .welcome-text h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; color:white; }
    .welcome-text p { font-size: 1rem; opacity: 0.9; margin-bottom: 30px; }
    
    .feature-list { margin-top: 40px; }
    .feature-item { display: flex; align-items: center; margin-bottom: 25px; }
    .feature-icon {
        width: 45px; height: 45px; border-radius: 12px;
        background: rgba(255, 255, 255, 0.2);
        display: flex; align-items: center; justify-content: center;
        margin-right: 15px; font-size: 20px; color: white;
    }
    .feature-text h4 { font-size: 1rem; margin-bottom: 2px; color:white; font-weight: 600; }
    .feature-text p { font-size: 0.85rem; opacity: 0.8; margin: 0; }
    
    .form-header { margin-bottom: 30px; }
    .form-header h2 { font-size: 1.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px; }
    .form-header p { color: var(--text-secondary); margin-bottom: 0; }
    
    .form-label { font-weight: 600; color: var(--text-main); font-size: 0.9rem; margin-bottom: 8px; }
    .form-control, .form-select {
        border-radius: 12px;
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
        height: 50px;
        font-size: 0.95rem;
    }
    .form-control:focus, .form-select:focus {
        border-color: var(--primary-purple);
        box-shadow: 0 0 0 4px var(--soft-purple-bg);
    }
    
    .btn-register {
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
        box-shadow: 0 4px 12px rgba(0, 51, 153, 0.3);
    }
    .btn-register:hover {
        background: var(--dark-purple);
        transform: translateY(-2px);
    }
    
    .password-field { position: relative; }
    .password-toggle {
        position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: #94a3b8; cursor: pointer;
    }
    .password-toggle:hover { color: var(--primary-purple); }
    
    .terms-text a { color: var(--primary-purple); font-weight: 600; text-decoration: none; }
    
    .login-link a { color: var(--primary-purple); font-weight: 600; text-decoration: none; transition: all 0.3s ease; }
    .login-link a:hover { color: var(--dark-purple); text-decoration: underline; }
    
    .back-to-home:hover { color: var(--primary-purple); transform: translateX(-5px); }
    
    .modal-header { background: var(--soft-purple-bg); border-bottom: 1px solid #e2e8f0; padding: 20px; }
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
    <div class="register-container">
        <div class="container-fluid">
            <a href="../index.php.html" class="back-to-home">
                <i class="fas fa-arrow-left me-2"></i> Back to Home
            </a>
            
            <div class="row justify-content-center">
                <div class="col-xxl-10">
                    <div class="register-card">
                        
                        <div class="register-left">
                            <div class="logo-container">
                                <a href="../index.php.html">
                                    <img src="../assets/images/brand/logo_VanguardDoubleTrust_white.svg" alt="" height="60">
                                </a>
                            </div>
                            
                            <div class="welcome-text">
                                <h1>Join VanguardDoubleTrust</h1>
                                <p>Create your secure online banking profile and unlock a world of financial possibilities.</p>
                            </div>
                            
                            <div class="feature-list">
                                <div class="feature-item">
                                    <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                                    <div class="feature-text">
                                        <h4>Secure Banking</h4>
                                        <p>Your financial data is protected with bank-level security</p>
                                    </div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon"><i class="fas fa-bolt"></i></div>
                                    <div class="feature-text">
                                        <h4>Instant Access</h4>
                                        <p>Get immediate access to your account after registration</p>
                                    </div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon"><i class="fas fa-mobile-alt"></i></div>
                                    <div class="feature-text">
                                        <h4>Mobile Banking</h4>
                                        <p>Manage your finances anytime, anywhere with our app</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="register-right">
                            <div class="form-header">
                                <h2>Create Your Account</h2>
                                <p>Fill in your details to get started.</p>
                            </div>
                            
                                                        
                            <form id="registerForm" method="POST">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="firstname" class="form-label">First Name</label>
                                            <input type="text" class="form-control" name="firstname" id="firstname" placeholder="Enter first name" required="">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="lastname" class="form-label">Last Name</label>
                                            <input type="text" class="form-control" name="lastname" id="lastname" placeholder="Enter last name" required="">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="phone" class="form-label">Phone Number</label>
                                    <input type="tel" class="form-control" name="phone" id="phone" placeholder="e.g. +1 123-456-7890" required="">
                                </div>
                                
                                <div class="form-group">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input name="email" type="email" class="form-control" id="email" placeholder="name@example.com" required="">
                                    <div class="form-text">This will be your username for login.</div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Country</label>
                                            <select id="country" name="country" class="form-select" required="">
                                                <option value="">Loading...</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">State</label>
                                            <select id="state" name="state" class="form-select" required="">
                                                <option value="">Select country first</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">City</label>
                                    <select id="city" name="city" class="form-select" required="">
                                        <option value="">Select state first</option>
                                    </select>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="dob" class="form-label">Date of Birth</label>
                                            <input name="dob" type="date" id="dob" class="form-control" required="">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="gender" class="form-label">Gender</label>
                                            <select class="form-select" name="gender" id="gender" required="">
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="acctype" class="form-label">Account Type</label>
                                            <select name="acctype" id="acctype" class="form-select" required="">
                                                <option value="">Select Type</option>
                                                <option value='Checking'>Checking</option><option value='Current'>Current</option><option value='Savings'>Savings</option><option value='Domiciliary Account'>Domiciliary Account</option>                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="brname" class="form-label">Preferred Branch</label>
                                            <select name="brname" id="brname" class="form-select" required="">
                                                <option value="">Select Branch</option>
                                                <option value='RBSUS001'>New York Main Branch</option><option value='RBSUS002'>Los Angeles Branch</option><option value='RBSUS003'>Chicago Branch</option><option value='RBSUS004'>Houston Branch</option>                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="accountpassword" class="form-label">Create Login Password</label>
                                    <div class="password-field">
                                        <input type="password" value="" name="accountpassword" id="accountpassword" class="form-control" required="">
                                        <button type="button" class="password-toggle" id="togglePassword">
                                            <i class="far fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                               <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="otp" class="form-label">Account Pin (6-Digit)</label>
                                            <input type="password" value="" id="otp" class="form-control" name="otp" maxlength="6" pattern="\d{6}" inputmode="numeric" required="">
                                            <small class="text-muted">
                                                Note: This PIN is used for account login and security verification.
                                            </small>
                                        </div>
                                    </div>
                                
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="transactionpassword" class="form-label">Transfer Pin (4-Digit)</label>
                                            <input required="" type="password" value="" name="transactionpassword" id="transactionpassword" class="form-control" maxlength="4" pattern="\d{4}" inputmode="numeric" required="">
                                            <small class="text-muted">
                                                Note: This PIN is required when making transfers or financial transactions.
                                            </small>
                                        </div>
                                    </div>
                                </div>


                                <button name="button" class="btn btn-register" type="submit">Create Account <i class="fas fa-arrow-right ms-2"></i></button>
                                
                                <div class="terms-text">
                                    <p>By registering you agree to our <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal">Terms of Use</a></p>
                                </div>
                            </form>
                            
                            <div class="login-link">
                                <p>Already have an account? <a href="login.php.html">Sign In</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <p class="footer-text text-center mt-3">
                &copy; 2026 VanguardDoubleTrust. All rights reserved.
            </p>
        </div>
    </div>

    <div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="termsModalLabel">Terms of Use</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Last Updated: July 25, 2026</strong></p>
                    <h4>1. Acceptance of Terms</h4>
                    <p>By accessing or using our banking services, you agree to be bound by these Terms of Use.</p>
                    <h4>2. Service Description</h4>
                    <p>We provide online banking services, including account management and transfers.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
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
        document.addEventListener("DOMContentLoaded", function () {
            let countrySelect = document.getElementById("country");
            let stateSelect   = document.getElementById("state");
            let citySelect    = document.getElementById("city");

            fetch("https://countriesnow.space/api/v0.1/countries/positions")
                .then(res => res.json())
                .then(data => {
                    countrySelect.innerHTML = "<option value=''>Select Country</option>";
                    data.data.forEach(c => {
                        countrySelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
                    });
                });

            countrySelect.addEventListener("change", function () {
                let country = this.value;
                stateSelect.innerHTML = "<option value=''>Loading...</option>";
                fetch("https://countriesnow.space/api/v0.1/countries/states", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ country: country })
                })
                .then(res => res.json())
                .then(data => {
                    stateSelect.innerHTML = "<option value=''>Select State</option>";
                    if (data.data && data.data.states) {
                        data.data.states.forEach(s => {
                            stateSelect.innerHTML += `<option value="${s.name}">${s.name}</option>`;
                        });
                    }
                });
            });

            stateSelect.addEventListener("change", function () {
                let state = this.value;
                let country = countrySelect.value;
                citySelect.innerHTML = "<option value=''>Loading...</option>";
                fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ country: country, state: state })
                })
                .then(res => res.json())
                .then(data => {
                    citySelect.innerHTML = "<option value=''>Select City</option>";
                    if (data.data) {
                        data.data.forEach(city => {
                            citySelect.innerHTML += `<option value="${city}">${city}</option>`;
                        });
                    }
                });
            });
            
            const togglePassword = document.querySelector('#togglePassword');
            const password = document.querySelector('#accountpassword');
            if (togglePassword) {
                togglePassword.addEventListener('click', function () {
                    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                    password.setAttribute('type', type);
                    this.querySelector('i').classList.toggle('fa-eye');
                    this.querySelector('i').classList.toggle('fa-eye-slash');
                });
            }
        });
    </script>
</body>
</html>
