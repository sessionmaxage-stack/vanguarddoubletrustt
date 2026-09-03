<!DOCTYPE html>
<html lang="zxx">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="stylesheet" href="assets/css/swiper-bundle.min.css">
    <link rel="stylesheet" href="assets/css/scrollCue.css">
    <link rel="stylesheet" href="assets/css/tabler-icons.min.css">
    <link rel="stylesheet" href="assets/css/britti-sans-trial.css">
    <link rel="stylesheet" href="assets/css/style.css?v=20260801">

           <link rel="icon" href="assets/images/brand/favicon_VanguardDoubleTrust.svg" type="image/svg+xml">
        <title>VanguardDoubleTrust - Our Services</title>

    <style>
      :root {
        color-scheme: dark;
        --bg: #0a0f1a;
        --bg-2: #10172a;
        --bg-3: #121a2d;
        --panel: #10172a;
        --panel-2: #121a2d;
        --panel-3: #162038;
        --fg: #ffffff;
        --fg-2: #cdd5e3;
        --muted: #8a95ac;
        --line: rgba(255,255,255,0.08);
        --accent: #e8c367;
        --accent-2: #ffffff;
        --accent-3: #0a0f1a;
        --warn: #e8c367;
        --error: #ffffff;
        --ok: #6ee7a7;
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
        --border-color: rgba(255,255,255,0.10);
        --vt-primary: #e8c367;
        --vt-primary-2: #ffffff;
        --vt-bg: #0a0f1a;
        --vt-card-bg: #10172a;
        --vt-card-2: #121a2d;
        --vt-text: #ffffff;
        --vt-text-2: #cdd5e3;
        --vt-muted: #8a95ac;
        --vt-border: rgba(255,255,255,0.10);
        --vt-success: #6ee7a7;
        --vt-danger: #ffffff;
        --vt-warn: #e8c367;
        --vt-info: #ffffff;
        --vt-accent: #e8c367;
        --vt-avatar-bg: #121a2d;
      }
      button, .btn, [class*="button"], [role="button"],
      input[type="submit"], input[type="button"],
      a.btn, a[class*="-btn"] {
        --bg-btn: var(--primary-color) !important;
        background: var(--primary-color) !important;
        background-color: var(--primary-color) !important;
        color: #0a0f1a !important;
        border-color: var(--primary-color) !important;
      }
      button.btn-secondary, .btn-secondary, .btn-outline, .btn-outline-primary,
      button.outline, .button.secondary, [class*="outline"] {
        background: transparent !important;
        background-color: transparent !important;
        color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
      }
      * { border-color: rgba(255,255,255,0.10) !important; }
      html, body { background: var(--bg); color: var(--fg); }
      :root {
            --primary-color: #165DFF !important;
            --secondary-color: #0E42D2 !important;
            --dark-bg-color: #165DFF !important;
            --accent-color: #ffffff !important;
            --form-bg-color: #EFF4FF !important;
            --light-bg: #f5f7fa !important;
        }

        /* ===== GLOBAL OVERRIDES WITH !important ===== */

        .bg-dark-div, .navbar, .footer-area, .pay-support-area, .countries-area, .page-banner-area, .services-area {
            background-color: #165DFF !important;
        }

        .default-btn {
            background-color: #165DFF !important;
            border-color: #165DFF !important;
            color: #ffffff !important;
            border-radius: 50px !important;
            padding: 14px 32px !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
        }

        .default-btn:hover {
            background-color: #0E42D2 !important;
            border-color: #0E42D2 !important;
            color: #ffffff !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(0, 77, 155, 0.4) !important;
        }

        .default-btn.active {
            background-color: #ffffff !important;
            border-color: #ffffff !important;
            color: #165DFF !important;
            font-weight: 700 !important;
        }

        .default-btn.active:hover {
            background-color: #e8f0fe !important;
            border-color: #e8f0fe !important;
            color: #0E42D2 !important;
        }

        /* Service Card Styling */
        .services-single-item {
            background-color: #ffffff !important;
            border: 1px solid #e8edf3 !important;
            transition: all 0.3s ease !important;
        }

        .services-single-item:hover {
            transform: translateY(-8px) !important;
            border-color: #165DFF !important;
            box-shadow: 0 15px 40px rgba(0, 77, 155, 0.12) !important;
        }

        .services-single-item h3 {
            color: #1a1a2e !important;
            font-weight: 700 !important;
        }

        .services-single-item p {
            color: #5a6a7e !important;
        }

        .services-single-item .icon {
            background: linear-gradient(135deg, #165DFF, #0E42D2) !important;
            color: #ffffff !important;
        }

        .services-single-item .icon i {
            color: #ffffff !important;
        }

        .services-single-item .read-more-btn {
            color: #165DFF !important;
            font-weight: 600 !important;
        }

        .services-single-item .read-more-btn:hover {
            color: #0E42D2 !important;
        }

        /* Services area override to light */
        .services-area {
            background-color: #f5f7fa !important;
        }

        /* Page Banner */
        .page-banner-area {
            background: linear-gradient(135deg, #165DFF 0%, #0E42D2 100%) !important;
        }

        .page-banner-content h2 {
            color: #ffffff !important;
            font-size: 2.8rem !important;
            font-weight: 800 !important;
        }

        .page-banner-content ul li {
            color: rgba(255, 255, 255, 0.8) !important;
        }

        .page-banner-content ul li.active {
            color: #ffffff !important;
            font-weight: 600 !important;
        }

        .page-banner-content ul li a {
            color: rgba(255, 255, 255, 0.8) !important;
        }

        .page-banner-content ul li a:hover {
            color: #ffffff !important;
        }

        /* Navbar */
        .navbar .nav-link {
            color: rgba(255, 255, 255, 0.85) !important;
        }

        .nav-link.active, .nav-link:hover {
            color: #ffffff !important;
        }

        /* Mobile Menu */
        .mobile-navbar .offcanvas-body {
            background-color: #ffffff !important;
        }

        .mobile-menu-list.active a {
            color: #165DFF !important;
        }

        /* Top titles */
        .top-title {
            color: #165DFF !important;
        }

        /* Titles Underlines */
        .main-title .under-line {
            background-image: linear-gradient(to top, #165DFF 25%, rgba(255, 255, 255, 0) 40%) !important;
        }

        /* Features area */
        .features-area-two {
            background-color: #ffffff !important;
            background-image: none !important;
        }

        .features-single-item2 {
            background: #ffffff !important;
            border-radius: 16px !important;
            border: 1px solid #e8edf3 !important;
            transition: all 0.3s ease !important;
        }

        .features-single-item2:hover {
            box-shadow: 0 10px 30px rgba(0, 77, 155, 0.1) !important;
            border-color: #165DFF !important;
        }

        .features-single-item2 h3 {
            color: #165DFF !important;
        }

        /* CTA Section */
        .contact-us-area {
            background-color: #f5f7fa !important;
        }

        .contact-us-area .bg-img {
            background-image: none !important;
            background: linear-gradient(135deg, #165DFF, #0E42D2) !important;
        }

        .contact-us-area .top-title {
            color: rgba(255, 255, 255, 0.8) !important;
        }

        .contact-us-area .main-title {
            color: #ffffff !important;
        }

        .contact-us-area .main-title .under-line {
            background-image: linear-gradient(to top, rgba(255, 255, 255, 0.4) 25%, rgba(255, 255, 255, 0) 40%) !important;
        }

        /* Footer */
        .footer-area {
            background-color: #165DFF !important;
        }

        .footer-single-widget h3 {
            color: #ffffff !important;
        }

        .footer-single-widget p,
        .footer-single-widget a {
            color: rgba(255, 255, 255, 0.75) !important;
        }

        .footer-single-widget a:hover {
            color: #ffffff !important;
        }

        /* Back to top */
        #backtotop {
            background-color: #165DFF !important;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 991px) {
            .page-banner-content h2 {
                font-size: 2.2rem !important;
            }
            .features-content {
                margin-left: 0 !important;
                margin-top: 20px !important;
            }
        }

        @media (max-width: 767px) {
            .page-banner-content h2 {
                font-size: 1.8rem !important;
            }
            .services-single-item {
                padding: 24px 20px !important;
            }
        }

        @media (max-width: 575px) {
            .page-banner-content h2 {
                font-size: 1.5rem !important;
            }
        }

    /* ===== FINAL PALETTE CORRECTION - WINS OVER ALL EARLIER RULES ===== */
    :root {
        --primary-color: #e8c367 !important;
        --secondary-color: #10172a !important;
        --dark-bg-color: #0a0f1a !important;
        --accent-color: #e8c367 !important;
        --form-bg-color: #000000 !important;
        --light-bg: #10172a !important;
        --gray-bg: #121a2d !important;
        --text-dark: #ffffff !important;
        --text-light: #0a0f1a !important;
        --border-color: rgba(255,255,255,0.10) !important;
    }
    button, .btn, [class*="button"], [role="button"],
    input[type="submit"], input[type="button"],
    a.btn, a[class*="-btn"],
    .default-btn, .hero-cta-btn, .read-more-btn,
    .default-btn.border-btn {
        --bg-btn: #e8c367 !important;
        background: #e8c367 !important;
        background-color: #e8c367 !important;
        color: #0a0f1a !important;
        border-color: #e8c367 !important;
    }
    button.btn-secondary, .btn-secondary, .btn-outline, .btn-outline-primary,
    button.outline, .button.secondary, [class*="outline"] {
        background: transparent !important;
        background-color: transparent !important;
        color: #e8c367 !important;
        border-color: #e8c367 !important;
    }
    .default-btn.active {
        background-color: #ffffff !important;
        border-color: #ffffff !important;
        color: #0a0f1a !important;
    }
    .default-btn.active:hover {
        background-color: #f5f5f5 !important;
        border-color: #f5f5f5 !important;
        color: #0a0f1a !important;
    }
    .default-btn.border-btn {
        background-color: transparent !important;
        border: 2px solid #ffffff !important;
        color: #ffffff !important;
    }
    .default-btn.border-btn:hover {
        background-color: #e8c367 !important;
        border-color: #e8c367 !important;
        color: #0a0f1a !important;
    }
    .default-btn:hover {
        background-color: #d4b258 !important;
        border-color: #d4b258 !important;
        color: #0a0f1a !important;
        box-shadow: 0 6px 20px rgba(232, 195, 103, 0.25) !important;
    }
    .bg-dark-div, .navbar, .footer-area, .pay-support-area, .countries-area,
    .page-banner-area, .services-area, #backtotop,
    .contact-us-area .bg-img {
        background-color: #0a0f1a !important;
        background: #0a0f1a !important;
    }
    .page-banner-area {
        background: linear-gradient(135deg, #0a0f1a 0%, #10172a 100%) !important;
    }
    .contact-us-area .bg-img {
        background: linear-gradient(135deg, #0a0f1a, #10172a) !important;
    }
    .top-title,
    .mobile-menu-list.active a,
    .services-single-item .read-more-btn,
    .features-single-item2 h3,
    .contact-info-item a {
        color: #e8c367 !important;
    }
    .services-single-item .read-more-btn:hover,
    .contact-info-item a:hover {
        color: #d4b258 !important;
    }
    .main-title .under-line {
        background-image: linear-gradient(to top, #e8c367 25%, rgba(255, 255, 255, 0) 40%) !important;
    }
    .contact-info-item, .contact-form-wrap, .services-single-item,
    .features-single-item2, .features-area-two, .contact-area,
    .services-area, .contact-us-area,
    .mobile-navbar .offcanvas-body, .dropdown-menu {
        background-color: #10172a !important;
        background: #10172a !important;
        border-color: rgba(255,255,255,0.10) !important;
    }
    .services-single-item:hover, .features-single-item2:hover,
    .contact-info-item:hover {
        border-color: #e8c367 !important;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.35) !important;
    }
    .services-single-item h3, .contact-info-item h3,
    .contact-form-wrap h3, .form-group label {
        color: #ffffff !important;
    }
    .services-single-item p, .contact-info-item p,
    .contact-form-wrap p {
        color: #cdd5e3 !important;
    }
    .form-group .form-control, .form-group .form-select {
        background-color: #000000 !important;
        border-color: rgba(255,255,255,0.10) !important;
        color: #ffffff !important;
    }
    .form-group .form-control::placeholder {
        color: #8a95ac !important;
    }
    .form-group .form-control:focus {
        border-color: #e8c367 !important;
        box-shadow: 0 0 0 3px rgba(232, 195, 103, 0.2) !important;
    }
    .services-single-item .icon,
    .contact-info-item .icon, .icon {
        background: linear-gradient(135deg, #10172a, #162038) !important;
        background-color: rgba(232, 195, 103, 0.12) !important;
    }
    .services-single-item .icon i, .contact-info-item .icon i {
        color: #e8c367 !important;
    }
    /* ===== BRIGHT READABLE BUTTONS (LOGOUT / PROCEED / DANGER / ACTION) ===== */
    .tf-btn, #submitTransfer, [id*="proceed"], [class*="proceed"], [class*="confirmBtn"],
    button.confirm, swal2-confirm, .swal2-confirm, .btn-primary,
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
    * { border-color: rgba(255,255,255,0.10) !important; }
    html, body { background: #0a0f1a; color: #ffffff; }
    </style>
</head>

<body>
    <div id="preloader">
        <div class="preloader">
            <img src="assets/images/brand/logo_VanguardDoubleTrust_white.svg" alt="preloader">
        </div>
    </div>

    <!-- ===== NAVBAR ===== -->
    <nav class="navbar navbar-expand-lg bg-dark-div style-two position-sticky top-0" id="navbar">
        <div class="container mw-1690">
            <div class="d-flex align-items-center">
                <a class="navbar-brand me-100" href="index.php.html">
                    <img src="assets/images/brand/logo_VanguardDoubleTrust.svg" width="100" height="100" class="main-logo d-none" alt="logo">
                    <img src="assets/images/brand/logo_VanguardDoubleTrust_white.svg" width="100" height="100" class="white-logo" alt="white-logo">
                </a>
            </div>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="index.php.html">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="about-us.php.html">About Us</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="services.php.html">Services</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="contact-us.php.html">Contact Us</a>
                    </li>
                </ul>
            </div>

            <div class="others-options style-two d-flex align-items-center">
                <div class="gap-40 d-flex">
                    <a href="customer/login.php.html" class="text-decoration-none text-white">Login</a>
                </div>
                <a href="customer/register.php.html" class="default-btn active d-none d-sm-inline-block shadow-none border-0">
                    <div class="d-flex align-items-center gap-10">Register</div>
                </a>
                <a class="navbar-toggler" data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample">
                    <span class="burger-menu">
                        <span class="top-bar"></span>
                        <span class="middle-bar"></span>
                        <span class="bottom-bar"></span>
                    </span>
                </a>
            </div>
        </div>
    </nav>

    <!-- ===== MOBILE MENU ===== -->
    <div class="mobile-navbar offcanvas offcanvas-end border-0" tabindex="-1" id="offcanvasExample">
        <div class="offcanvas-header">
            <div>
                <a href="index.php.html" class="logo d-inline-block">
                    <img src="assets/images/brand/logo_VanguardDoubleTrust.svg" alt="logo">
                </a>
            </div>
            <button type="button" class="btn-close opacity-1" data-bs-dismiss="offcanvas" aria-label="Close">
                <i class="ti ti-x"></i>
            </button>
        </div>
        <div class="offcanvas-body">
            <ul class="mobile-menu">
                <li class="mobile-menu-list"><a href="index.php.html">Home</a></li>
                <li class="mobile-menu-list border-bottom"><a href="about-us.php.html" class="nav-link">About Us</a></li>
                <li class="mobile-menu-list active border-bottom"><a href="services.php.html">Services</a></li>
                <li class="mobile-menu-list without-icon border-bottom"><a href="contact-us.php.html" class="nav-link">Contact Us</a></li>
                <li class="mobile-menu-list without-icon border-bottom"><a href="customer/login.php.html" class="nav-link">Login</a></li>
                <li class="mobile-menu-list without-icon border-bottom"><a href="customer/register.php.html" class="nav-link">Register</a></li>
            </ul>
        </div>
    </div>

    <!-- ===== PAGE BANNER ===== -->
    <div class="page-banner-area ptb-100 bg-dark-div position-relative z-1">
        <div class="container mw-1690">
            <div class="page-banner-content text-center">
                <h2 class="text-white">Our Services</h2>
                <ul class="d-flex justify-content-center align-items-center list-unstyled gap-2 mb-0">
                    <li><a href="index.php.html" class="text-decoration-none text-white">Home</a></li>
                    <li><i class="ti ti-chevron-right text-white"></i></li>
                    <li class="active">Services</li>
                </ul>
            </div>
        </div>
        <img src="assets/images/shape5.png" class="position-absolute top-0 start-0 d-none d-xl-inline-block transform-unset" alt="shape">
        <img src="assets/images/shape6.png" class="position-absolute bottom-0 start-0 end-0 mx-auto d-none d-xl-inline-block shape6 transform-unset" alt="shape">
    </div>

    <!-- ===== SERVICES ===== -->
    <div class="services-area ptb-120">
        <div class="container mw-1690">
            <div class="text-center mb-5" data-cues="slideInUp" data-duration="900">
                <span class="top-title">What We Offer</span>
                <h2 class="main-title mx-auto">Banking Services Designed <span class="under-line">Around</span> You</h2>
                <p class="mx-auto" style="max-width: 650px; color: #5a6a7e;">From everyday banking to long-term financial planning, we provide comprehensive services to help you manage and grow your money.</p>
            </div>
            <div class="row justify-content-center g-4" data-cues="slideInUp" data-duration="900">

                <div class="col-xl-4 col-md-6">
                    <div class="services-single-item rounded-4 p-4 p-xl-5 h-100">
                        <div class="icon rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px !important; height: 70px !important;">
                            <i class="ti ti-wallet fs-32"></i>
                        </div>
                        <h3 class="mb-3">Current Accounts</h3>
                        <p class="mb-4">Everyday banking made simple. Enjoy fee-free transactions, instant notifications, contactless payments, and seamless online and mobile banking access.</p>
                        <a href="customer/register.php.html" class="read-more-btn text-decoration-none d-flex align-items-center gap-2 fw-semibold">
                            Open Account <i class="ti ti-arrow-right"></i>
                        </a>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="services-single-item rounded-4 p-4 p-xl-5 h-100">
                        <div class="icon rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px !important; height: 70px !important;">
                            <i class="ti ti-piggy-bank fs-32"></i>
                        </div>
                        <h3 class="mb-3">Savings Accounts</h3>
                        <p class="mb-4">Grow your money with competitive interest rates. Choose from instant access savings, fixed-term deposits, or regular saver accounts tailored to your goals.</p>
                        <a href="customer/register.php.html" class="read-more-btn text-decoration-none d-flex align-items-center gap-2 fw-semibold">
                            Start Saving <i class="ti ti-arrow-right"></i>
                        </a>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="services-single-item rounded-4 p-4 p-xl-5 h-100">
                        <div class="icon rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px !important; height: 70px !important;">
                            <i class="ti ti-home-dollar fs-32"></i>
                        </div>
                        <h3 class="mb-3">Mortgages</h3>
                        <p class="mb-4">Find the right mortgage for your dream home. We offer competitive rates for first-time buyers, home movers, and those looking to remortgage with flexible terms.</p>
                        <a href="customer/register.php.html" class="read-more-btn text-decoration-none d-flex align-items-center gap-2 fw-semibold">
                            Explore Mortgages <i class="ti ti-arrow-right"></i>
                        </a>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="services-single-item rounded-4 p-4 p-xl-5 h-100">
                        <div class="icon rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px !important; height: 70px !important;">
                            <i class="ti ti-credit-card fs-32"></i>
                        </div>
                        <h3 class="mb-3">Personal Loans</h3>
                        <p class="mb-4">Borrow what you need with transparent rates and flexible repayment terms. Whether it's a car, home improvement, or consolidating debt — we've got you covered.</p>
                        <a href="customer/register.php.html" class="read-more-btn text-decoration-none d-flex align-items-center gap-2 fw-semibold">
                            Get a Quote <i class="ti ti-arrow-right"></i>
                        </a>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="services-single-item rounded-4 p-4 p-xl-5 h-100">
                        <div class="icon rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px !important; height: 70px !important;">
                            <i class="ti ti-arrows-exchange fs-32"></i>
                        </div>
                        <h3 class="mb-3">Bank Transfers</h3>
                        <p class="mb-4">Send and receive money worldwide with competitive exchange rates and low fees. Fast, secure, and trackable bank transfers from your account.</p>
                        <a href="customer/register.php.html" class="read-more-btn text-decoration-none d-flex align-items-center gap-2 fw-semibold">
                            Send Money <i class="ti ti-arrow-right"></i>
                        </a>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="services-single-item rounded-4 p-4 p-xl-5 h-100">
                        <div class="icon rounded-circle d-flex align-items-center justify-content-center mb-4" style="width: 70px !important; height: 70px !important;">
                            <i class="ti ti-building-bank fs-32"></i>
                        </div>
                        <h3 class="mb-3">Business Banking</h3>
                        <p class="mb-4">Dedicated business accounts with invoicing tools, payroll management, business loans, and merchant services to help your company thrive and grow.</p>
                        <a href="customer/register.php.html" class="read-more-btn text-decoration-none d-flex align-items-center gap-2 fw-semibold">
                            Learn More <i class="ti ti-arrow-right"></i>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- ===== WHY CHOOSE US ===== -->
    <div class="features-area-two ptb-120">
        <div class="container mw-1690">
            <div class="row align-items-center g-4">
                <div class="col-lg-6">
                    <div class="about-img h-100 reveal">
                        <img src="assets/images/choose-us.jpg" class="h-100 object-fit-cover rounded-4" alt="features">
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="features-content ms-lg-4" data-cues="slideInUp" data-duration="900">
                        <span class="top-title">Why Choose VanguardDoubleTrust</span>
                        <h2 class="main-title">We Provide The <span class="under-line">Tools</span> For Your Financial Success</h2>
                        <p style="color: #5a6a7e !important;">We combine trusted banking experience with modern digital convenience to deliver a service that is reliable, secure, and easy to use.</p>

                        <div class="row g-4 mt-2">
                            <div class="col-md-6">
                                <div class="features-single-item2 shadow-sm h-100">
                                    <h3>Secure Banking</h3>
                                    <p style="color: #5a6a7e !important;">Multi-layer encryption and fraud protection on every transaction you make.</p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="features-single-item2 shadow-sm h-100">
                                    <h3>Instant Access</h3>
                                    <p style="color: #5a6a7e !important;">Manage your accounts 24/7 via our mobile app and online banking platform.</p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="features-single-item2 shadow-sm h-100">
                                    <h3>No Hidden Fees</h3>
                                    <p style="color: #5a6a7e !important;">Clear, transparent pricing with no surprises. You always know what you're paying.</p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="features-single-item2 shadow-sm h-100">
                                    <h3>Dedicated Support</h3>
                                    <p style="color: #5a6a7e !important;">Our friendly team is available around the clock to help with any questions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ===== CTA ===== -->
    <div class="contact-us-area ptb-120">
        <div class="container mw-1690">
            <div class="bg-img ptb-120 rounded-5 position-relative z-1 px-4">
                <div class="text-center" data-cues="slideInUp" data-duration="900">
                    <span class="top-title">Get Started</span>
                    <h2 class="main-title mw-1055 mx-auto">One Account. <span class="under-line">Unlimited</span> Banking Possibilities.</h2>
                    <div class="d-flex gap-30 flex-wrap justify-content-center mt-4">
                        <a href="customer/register.php.html" class="default-btn shadow-none border-0 active" style="background-color: #e8c367 !important; color: #0a0f1a !important;">Open Account</a>
                        <a href="customer/login.php.html" class="default-btn shadow-none border-0" style="background-color: transparent !important; border: 2px solid #ffffff !important; color: #ffffff !important;">Login</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ===== FOOTER ===== -->
    <div class="footer-area bg-dark-div pb-120">
        <div class="container mw-1690">
            <div class="row g-4" data-cues="slideInUp" data-duration="900">
                <div class="col-lg-4 col-sm-6">
                    <div class="footer-single-widget">
                        <a href="index.php.html" class="d-inline-block mb-4">
                            <img src="assets/images/brand/logo_VanguardDoubleTrust_white.svg" width="100" height="100" alt="white-logo">
                        </a>
                        <p class="text-white">Trusted banking services with transparent rates, secure accounts, and dedicated customer support — helping you manage your money with confidence.</p>
                        <ul class="p-0 mb-0 mt-4 list-unstyled social-link d-flex gap-10 align-items-center">
                            <li class="mb-0"><span class="text-white">Follow Us:</span></li>
                            <li class="mb-0"><a href="#" target="_blank"><i class="ti ti-brand-facebook"></i></a></li>
                            <li class="mb-0"><a href="#" target="_blank"><i class="ti ti-brand-instagram"></i></a></li>
                            <li class="mb-0"><a href="#" target="_blank"><i class="ti ti-brand-x"></i></a></li>
                            <li class="mb-0"><a href="#" target="_blank"><i class="ti ti-brand-linkedin"></i></a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-4 col-sm-6">
                    <div class="footer-single-widget">
                        <h3>Quick Links</h3>
                        <ul class="import-link p-0 m-0 list-unstyled">
                            <li><a href="about-us.php.html">About Us</a></li>
                            <li><a href="services.php.html">Current Accounts</a></li>
                            <li><a href="services.php.html">Savings</a></li>
                            <li><a href="services.php.html">Mortgages</a></li>
                            <li><a href="services.php.html">Loans & Credit</a></li>
                            <li><a href="contact-us.php.html">Support</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-4 col-sm-6">
                    <div class="footer-single-widget">
                        <h3>Get In Touch</h3>
                        <ul class="p-0 m-0 list-unstyled info-list">
                            <li class="d-flex">
                                <div class="flex-shrink-0"><i class="ti ti-map-pin-filled"></i></div>
                                <div class="flex-grow-1">
                                    <h6>Location</h6>
                                    <p></p>
                                </div>
                            </li>
                            <li class="d-flex">
                                <div class="flex-shrink-0"><i class="ti ti-mail-filled"></i></div>
                                <div class="flex-grow-1">
                                    <h6>Email</h6>
                                    <a href="mailto:contact@VanguardDoubleTrust.com"><span>contact@VanguardDoubleTrust.com</span></a>
                                </div>
                            </li>
                            <li class="d-flex">
                                <div class="flex-shrink-0"><i class="ti ti-phone-filled"></i></div>
                                <div class="flex-grow-1">
                                    <h6>Phone</h6>
                                    <a href="tel:+17472802980">+1 747 280 2980</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <button type="button" id="backtotop" style="background-color: #0a0f1a !important; color: #e8c367 !important;">
        <i class="ti ti-arrow-narrow-up"></i>
    </button>

    <script src="assets/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/swiper-bundle.min.js"></script>
    <script src="assets/js/scrollCue.min.js"></script>
    <script src="assets/js/fslightbox.js"></script>
    <script src="assets/js/ukiyo.min.js"></script>
    <script src="assets/js/lenis.js"></script>
    <script src="assets/js/gsap.min.js"></script>
    <script src="assets/js/ScrollTrigger.min.js"></script>
    <script src="assets/js/custom.js"></script>
    </body>

</html>
