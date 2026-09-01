<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>Dashboard - VanguardDoubleTrust</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta content="Customer dashboard" name="description" />

  <link rel="icon" type="image/svg+xml" href="/assets/images/brand/favicon_VanguardDoubleTrust.svg" />
  <link rel="icon" type="image/png" href="/assets/images/brand/favicon_1776155007.png" />
  <link
    href="../css2-1?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
    rel="stylesheet" />
  <link href="../ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
  <link href="assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
  <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
  <link href="assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />

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

    :root {
      --vt-primary: #165DFF;
      --vt-primary-2: #0E42D2;
      --vt-bg: #f6f8fc;
      --vt-card: #ffffff;
      --vt-text: #0f172a;
      --vt-muted: #64748b;
      --vt-border: rgba(15, 23, 42, 0.08);
      --vt-shadow: 0 18px 42px -18px rgba(22, 93, 255, 0.18);
      --vt-radius: 18px;
    }

    body {
      font-family: "Plus Jakarta Sans", sans-serif;
      background: var(--vt-bg);
      color: var(--vt-text);
    }

    .vt-shell {
      min-height: 100vh;
      display: flex;
    }

    .vt-sidebar {
      width: 280px;
      background: #fff;
      border-right: 1px solid var(--vt-border);
      padding: 18px 14px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: auto;
    }

    .vt-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px 16px;
    }

    .vt-brand .logo {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--vt-primary), var(--vt-primary-2));
      display: grid;
      place-items: center;
      color: #fff;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .vt-brand .title {
      line-height: 1.1;
    }

    .vt-brand .title strong {
      display: block;
      font-size: 14px;
      font-weight: 800;
    }

    .vt-brand .title span {
      display: block;
      font-size: 12px;
      color: var(--vt-muted);
      font-weight: 600;
    }

    .vt-section-label {
      padding: 16px 12px 8px;
      font-size: 11px;
      letter-spacing: 0.12em;
      color: var(--vt-muted);
      font-weight: 800;
    }

    .vt-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0 6px;
    }

    .vt-nav a {
      text-decoration: none;
      color: var(--vt-text);
      border-radius: 14px;
      padding: 11px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 13px;
    }

    .vt-nav a .ico {
      width: 32px;
      height: 32px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: rgba(0, 51, 153, 0.08);
      color: var(--vt-primary);
      flex: 0 0 auto;
    }

    .vt-nav a.active {
      background: linear-gradient(135deg, rgba(0, 51, 153, 0.12), rgba(0, 93, 157, 0.08));
      border: 1px solid rgba(0, 51, 153, 0.18);
    }

    .vt-nav a:hover {
      background: rgba(15, 23, 42, 0.04);
    }

    .vt-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .vt-topbar {
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--vt-border);
      background: rgba(246, 248, 252, 0.7);
      backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .vt-top-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .vt-burger {
      border: 1px solid var(--vt-border);
      background: #fff;
      width: 42px;
      height: 42px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      box-shadow: 0 12px 24px -18px rgba(2, 6, 23, 0.35);
    }

    .vt-search {
      width: min(520px, 58vw);
      background: #fff;
      border: 1px solid var(--vt-border);
      border-radius: 16px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .vt-search input {
      border: none;
      outline: none;
      width: 100%;
      font-size: 13px;
      font-weight: 600;
      color: var(--vt-text);
      background: transparent;
    }

    .vt-search i {
      color: var(--vt-muted);
    }

    .vt-top-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .vt-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: #fff;
      border: 1px solid var(--vt-border);
      border-radius: 16px;
    }

    .vt-user .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(0, 51, 153, 0.18), rgba(0, 93, 157, 0.12));
      border: 1px solid rgba(0, 51, 153, 0.18);
      display: grid;
      place-items: center;
      color: var(--vt-primary);
      font-weight: 900;
      font-size: 12px;
    }

    .vt-user .meta {
      line-height: 1.1;
      max-width: 220px;
    }

    .vt-user .meta strong {
      display: block;
      font-size: 13px;
      font-weight: 800;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vt-user .meta span {
      display: block;
      font-size: 11px;
      color: var(--vt-muted);
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vt-content {
      padding: 18px;
    }

    .vt-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      align-items: start;
    }

    @media (max-width: 1100px) {
      .vt-grid {
        grid-template-columns: 1fr;
      }
    }

    .vt-card {
      background: var(--vt-card);
      border: 1px solid var(--vt-border);
      border-radius: var(--vt-radius);
      box-shadow: var(--vt-shadow);
    }

    .vt-card.pad {
      padding: 16px;
    }

    .vt-balance {
      background: linear-gradient(135deg, var(--vt-primary) 0%, var(--vt-primary-2) 100%);
      color: #fff;
      border: none;
    }

    .vt-balance .sub {
      opacity: 0.9;
      font-size: 11px;
      letter-spacing: 0.12em;
      font-weight: 800;
    }

    .vt-balance .amount {
      font-weight: 900;
      font-size: 28px;
      margin-top: 6px;
    }

    .vt-balance .mini {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.18);
    }

    .vt-balance .mini .k {
      font-size: 10px;
      opacity: 0.9;
      font-weight: 800;
      letter-spacing: 0.12em;
    }

    .vt-balance .mini .v {
      font-size: 12px;
      font-weight: 800;
      margin-top: 4px;
    }

    .vt-actions {
      margin-top: 14px;
    }

    .vt-actions .label {
      font-size: 12px;
      font-weight: 900;
      color: var(--vt-text);
      margin-bottom: 10px;
    }

    .vt-actions-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    @media (max-width: 1100px) {
      .vt-actions-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .vt-action {
      border: 1px solid var(--vt-border);
      background: #fff;
      border-radius: 16px;
      padding: 12px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-weight: 800;
      font-size: 12px;
      color: var(--vt-text);
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .vt-action i {
      color: var(--vt-primary);
    }

    .vt-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 18px 36px -26px rgba(2, 6, 23, 0.45);
    }

    .vt-chart {
      margin-top: 14px;
    }

    .vt-chart h4 {
      font-size: 13px;
      font-weight: 900;
      margin: 0 0 10px;
      color: var(--vt-text);
    }

    .vt-chart svg {
      width: 100%;
      height: 150px;
      display: block;
    }

    .vt-right-card {
      display: grid;
      gap: 16px;
      margin-top: 14px;
    }

    .vt-list {
      margin-top: 14px;
    }

    .vt-fake-card {
      border-radius: 20px;
      padding: 16px;
      background: linear-gradient(145deg, #1f2937, #111827);
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    .vt-fake-card::before {
      content: "";
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      right: -80px;
      top: -90px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    }

    .vt-fake-card .chip {
      width: 44px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b, #fde68a);
    }

    .vt-fake-card .num {
      margin-top: 18px;
      font-weight: 900;
      letter-spacing: 0.18em;
      font-size: 12px;
      opacity: 0.95;
    }

    .vt-fake-card .meta {
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 11px;
      font-weight: 800;
      opacity: 0.9;
    }

    .vt-list .head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .vt-list .head strong {
      font-size: 13px;
      font-weight: 900;
    }

    .vt-list .head a {
      color: var(--vt-primary);
      font-weight: 900;
      font-size: 11px;
      text-decoration: none;
    }

    .vt-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 10px;
      border: 1px solid var(--vt-border);
      border-radius: 14px;
    }

    .vt-row+.vt-row {
      margin-top: 10px;
    }

    .vt-row .left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .vt-row .pill {
      width: 36px;
      height: 36px;
      border-radius: 14px;
      background: rgba(0, 51, 153, 0.08);
      display: grid;
      place-items: center;
      color: var(--vt-primary);
      flex: 0 0 auto;
      font-weight: 900;
      font-size: 11px;
    }

    .vt-row .left strong {
      display: block;
      font-weight: 900;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vt-row .left span {
      display: block;
      font-size: 11px;
      color: var(--vt-muted);
      font-weight: 700;
    }

    .vt-row .right {
      text-align: right;
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }

    .vt-row .right small {
      display: block;
      font-size: 11px;
      font-weight: 900;
    }

    .vt-row .up {
      color: #16a34a;
    }

    .vt-row .down {
      color: #dc2626;
    }

    .vt-transactions {
      margin-top: 16px;
    }

    .vt-transactions h4 {
      font-size: 13px;
      font-weight: 900;
      margin: 0 0 10px;
    }

    .vt-empty {
      border: 1px dashed rgba(15, 23, 42, 0.2);
      border-radius: 16px;
      padding: 22px 16px;
      text-align: center;
      color: var(--vt-muted);
      font-weight: 800;
    }

    .vt-footer {
      padding: 12px 18px 20px;
      color: var(--vt-muted);
      font-size: 11px;
      font-weight: 700;
    }

    @media (max-width: 992px) {
      .vt-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        width: min(304px, 84vw);
        transform: translateX(-105%);
        transition: transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1);
        z-index: 100;
        padding: 14px 12px 22px;
        overflow-x: hidden;
        overflow-y: auto;
        box-shadow: 0 28px 60px -28px rgba(2, 6, 23, 0.55);
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }

      body.vt-sidebar-open .vt-sidebar {
        transform: translateX(0);
      }

      body.vt-sidebar-open {
        overflow: hidden;
        touch-action: none;
      }

      .vt-main {
        width: 100%;
      }
    }

    @media (max-width: 900px) {

      .vt-top-left,
      .vt-top-right,
      .vt-topbar {
        flex-wrap: nowrap;
      }

      .vt-topbar {
        height: 68px;
        padding-left: 12px;
        padding-right: 12px;
        gap: 10px;
      }

      .vt-top-left {
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
      }

      .vt-top-right {
        gap: 10px;
        flex: 0 0 auto;
      }

      .vt-search {
        order: 0;
        width: auto;
        margin-top: 0;
        flex: 1 1 auto;
        min-width: 0;
        padding: 8px 10px;
        gap: 6px;
        border-radius: 14px;
      }

      .vt-search input {
        font-size: 12px;
      }

      .vt-burger {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        flex: 0 0 auto;
      }

      .vt-user .meta {
        max-width: 30vw;
      }

      .vt-user {
        padding: 6px 8px;
        border-radius: 14px;
        gap: 8px;
      }

      .vt-user .avatar {
        width: 34px;
        height: 34px;
      }
    }

    @media (max-width: 720px) {

      .vt-content,
      .vt-topbar,
      .vt-footer {
        padding-left: 14px;
        padding-right: 14px;
      }

      .vt-topbar {
        padding-top: 10px;
        padding-bottom: 10px;
        gap: 8px;
        height: 64px;
      }

      .vt-burger {
        width: 38px;
        height: 38px;
        border-radius: 12px;
      }

      .vt-search {
        padding: 7px 10px;
        gap: 6px;
        border-radius: 12px;
      }

      .vt-search input {
        font-size: 12px;
      }

      .vt-search i {
        font-size: 13px;
      }

      .vt-user {
        padding: 5px 7px;
        gap: 7px;
        border-radius: 12px;
      }

      .vt-user .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 11px;
      }

      .vt-user .meta strong {
        font-size: 12px;
      }

      .vt-user .meta span {
        font-size: 10.5px;
      }

      .vt-actions-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .vt-balance .mini {
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .vt-balance .mini .k {
        font-size: 9px;
        letter-spacing: 0.08em;
        word-break: break-word;
      }

      .vt-balance .mini .v {
        font-size: 11px;
        word-break: break-word;
      }

      .vt-balance .amount {
        font-size: 24px;
        word-break: break-word;
      }

      .vt-row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .vt-row .left {
        flex: 1;
        min-width: 0;
      }

      .vt-row .right {
        width: auto;
        text-align: right;
        flex: 0 0 auto;
      }

      .vt-list .head {
        flex-direction: row;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }

      .vt-txrow {
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px;
      }

      .vt-txrow .body {
        flex: 1 1 160px;
        min-width: 0;
      }

      .vt-txrow .amount {
        flex: 0 0 auto;
        text-align: right;
      }

      .vt-user .meta span {
        display: block;
      }
    }

    @media (max-width: 560px) {
      .vt-topbar {
        padding-left: 10px;
        padding-right: 10px;
        gap: 6px;
        height: 60px;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .vt-top-left,
      .vt-top-right,
      .vt-topbar {
        flex-wrap: nowrap;
      }

      .vt-top-left {
        gap: 6px;
        flex: 1 1 auto;
        min-width: 0;
      }

      .vt-top-right {
        gap: 6px;
        flex: 0 0 auto;
      }

      .vt-burger {
        width: 36px;
        height: 36px;
        border-radius: 11px;
      }

      .vt-search {
        padding: 6px 8px;
        gap: 5px;
        border-radius: 11px;
        flex: 1 1 auto;
        min-width: 0;
      }

      .vt-search i {
        font-size: 12px;
      }

      .vt-search input {
        font-size: 11.5px;
      }

      .vt-user {
        padding: 4px 6px;
        gap: 6px;
        border-radius: 11px;
      }

      .vt-user .meta {
        max-width: 34vw;
      }

      .vt-user .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        font-size: 10.5px;
      }

      .vt-user .meta strong {
        font-size: 11.5px;
      }

      .vt-user .meta span {
        font-size: 10px;
        display: block;
      }

      .vt-balance .mini {
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }

      .vt-balance .mini .k {
        font-size: 8px;
        letter-spacing: 0.06em;
      }

      .vt-balance .mini .v {
        font-size: 10.5px;
      }

      .vt-row {
        padding: 9px 10px;
        flex-wrap: wrap;
      }

      .vt-row .left {
        flex: 1 1 140px;
      }

      .vt-row .pill {
        width: 34px;
        height: 34px;
        border-radius: 12px;
      }

      .vt-row .left strong {
        font-size: 11.5px;
      }

      .vt-row .left span {
        font-size: 10.5px;
      }

      .vt-row .right {
        font-size: 11.5px;
      }

      .vt-row .right small {
        font-size: 10.5px;
      }
    }

    @media (max-width: 480px) {

      .vt-topbar,
      .vt-top-left,
      .vt-top-right {
        flex-wrap: nowrap;
      }

      .vt-topbar {
        padding-left: 8px;
        padding-right: 8px;
        gap: 5px;
        height: 58px;
        padding-top: 7px;
        padding-bottom: 7px;
      }

      .vt-top-left {
        gap: 5px;
        flex: 1 1 auto;
        min-width: 0;
      }

      .vt-top-right {
        gap: 5px;
        flex: 0 0 auto;
      }

      .vt-burger {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        flex: 0 0 auto;
      }

      .vt-burger i {
        font-size: 14px;
      }

      .vt-search {
        padding: 5px 7px;
        gap: 4px;
        border-radius: 10px;
        flex: 1 1 auto;
        min-width: 0;
      }

      .vt-search i {
        font-size: 11.5px;
      }

      .vt-search input {
        font-size: 11px;
      }

      .vt-user {
        padding: 4px 5px 4px 4px;
        gap: 5px;
        border-radius: 10px;
      }

      .vt-user .meta {
        max-width: 32vw;
      }

      .vt-user .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        font-size: 10px;
      }

      .vt-user .meta strong {
        font-size: 11px;
      }

      .vt-user .meta span {
        font-size: 9.5px;
        display: block;
      }

      .vt-action {
        padding: 11px 8px;
        font-size: 11px;
        gap: 8px;
      }

      .vt-action i {
        font-size: 14px;
      }

      .vt-card.pad {
        padding: 14px;
        border-radius: 16px;
      }

      .vt-sidebar {
        width: min(290px, 86vw);
      }

      .vt-balance {
        padding: 14px;
      }

      .vt-balance .amount {
        font-size: 22px;
      }

      .vt-balance .mini {
        grid-template-columns: repeat(3, 1fr);
        gap: 5px;
        margin-top: 12px;
        padding-top: 12px;
      }

      .vt-balance .mini .k {
        font-size: 7.5px;
        letter-spacing: 0.05em;
        word-break: break-word;
        line-height: 1.2;
      }

      .vt-balance .mini .v {
        font-size: 10px;
        word-break: break-word;
        line-height: 1.3;
        margin-top: 2px;
      }

      .vt-actions {
        margin-top: 12px;
      }

      .vt-chart {
        margin-top: 12px;
      }

      .vt-transactions {
        margin-top: 12px;
      }

      .vt-transactions h4 {
        font-size: 12.5px;
      }

      .vt-list .head strong {
        font-size: 12.5px;
      }

      .vt-row {
        padding: 8px 9px;
        border-radius: 12px;
        flex-wrap: wrap;
        gap: 8px;
      }

      .vt-row .left {
        flex: 1 1 120px;
        gap: 8px;
      }

      .vt-row .pill {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        font-size: 10px;
      }

      .vt-row .left strong {
        font-size: 11px;
      }

      .vt-row .left span {
        font-size: 10px;
      }

      .vt-row .right {
        font-size: 11px;
        flex: 1 1 auto;
        min-width: 70px;
      }

      .vt-row .right small {
        font-size: 10px;
      }

      .vt-txrow {
        padding: 10px 11px;
        gap: 8px;
      }

      .vt-txrow .ico {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        font-size: 14px;
      }

      .vt-txrow .body .title {
        font-size: 13px;
      }

      .vt-txrow .body .sub {
        font-size: 11px;
      }

      .vt-txrow .amount {
        font-size: 13px;
      }

      .vt-list .head a {
        font-size: 10.5px;
        flex: 0 0 auto;
      }
    }

    .vt-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.42);
      z-index: 99;
    }

    body.vt-sidebar-open .vt-overlay {
      display: block;
    }

    @media (max-width: 560px) {
      .vt-fake-card {
        height: auto;
        padding: 18px;
        border-radius: 18px;
      }

      .vt-fake-card .chip {
        width: 38px;
        height: 30px;
        border-radius: 8px;
      }

      .vt-fake-card .num {
        margin-top: 14px;
        font-size: 13px;
        letter-spacing: 0.12em;
        word-break: break-all;
      }

      .vt-fake-card .meta {
        margin-top: 12px;
        font-size: 10.5px;
        gap: 8px;
      }

      #maskedAccount {
        display: none;
      }

      #fullAccountNumber {
        display: inline !important;
        font-size: 12.5px;
        letter-spacing: 0.06em;
      }
    }

    @media (max-width: 480px) {
      .vt-fake-card {
        padding: 16px;
        border-radius: 16px;
      }

      .vt-fake-card .num {
        font-size: 12px;
        letter-spacing: 0.1em;
      }

      .vt-fake-card .meta {
        font-size: 10px;
      }

      #fullAccountNumber {
        font-size: 11.5px;
      }
    }

    #activityLinePath {
      stroke-width: 6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #activityLinePath.vt-animate-chart {
      stroke-dashoffset: var(--vt-line-len, 3000);
      stroke-dasharray: var(--vt-line-len, 3000);
      animation: vtChartDrawIn 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    #activityFillPath.vt-animate-chart {
      opacity: 0;
      transform: translateY(10px);
      transform-origin: center bottom;
      animation: vtChartFadeIn 1.4s ease-out 0.7s forwards;
    }

    @keyframes vtChartDrawIn {
      from {
        stroke-dashoffset: var(--vt-line-len, 3000);
      }

      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes vtChartFadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</head>

<body>
  <div id="vtDevBanner" style="display:none;position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#d97706;color:#fff;padding:10px 14px;font-size:13px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
    🔧 DEV MODE: Loading dashboard.php (REAL PAGE with gates + graph + card). If this banner shows, the edits are loading correctly.
  </div>
  <script>
    (function() {
      try {
        if ((window.location.search || "").indexOf("vt_diag=1") !== -1) {
          var b = document.getElementById("vtDevBanner");
          if (b) b.style.display = "";
        }
      } catch (_) {}
    })();
  </script>
  <div style="height:44px;"></div>
  <div class="vt-overlay" id="sidebarOverlay"></div>
  <div class="vt-shell" id="dashboardRoot">
    <aside class="vt-sidebar">
      <div class="vt-brand">
        <div class="logo">VT</div>
        <div class="title">
          <strong>VanguardDoubleTrust</strong>
          <span>Customer</span>
        </div>
      </div>

      <div class="vt-section-label">MENU</div>
      <nav class="vt-nav">
        <a class="active" href="/customer/dashboard.php">
          <span class="ico"><i class="fas fa-grid-2"></i></span>
          <span data-i18n="nav_dashboard">Dashboard</span>
        </a>
        <a href="/customer/myprofile.php">
          <span class="ico"><i class="fas fa-user"></i></span>
          <span data-i18n="nav_profile">Account Details</span>
        </a>
        <a href="/customer/statement.php">
          <span class="ico"><i class="fas fa-file-invoice"></i></span>
          <span data-i18n="nav_statement">Account Summary</span>
        </a>
        <a href="/customer/stocks.php">
          <span class="ico"><i class="fas fa-chart-line"></i></span>
          <span data-i18n="nav_stocks">Stocks &amp; Trading</span>
        </a>
      </nav>

      <div class="vt-section-label">FUND TRANSFER</div>
      <nav class="vt-nav">
        <a href="/customer/international.php">
          <span class="ico"><i class="fas fa-building-columns"></i></span>
          <span data-i18n="actions_transfer">Bank Transfer</span>
        </a>
        <a href="/customer/transferhistory.php">
          <span class="ico"><i class="fas fa-clock-rotate-left"></i></span>
          <span data-i18n="nav_transferHistory">Transfer History</span>
        </a>
      </nav>

      <div class="vt-section-label">ACCOUNT</div>
      <nav class="vt-nav">
        <a href="/customer/card.php">
          <span class="ico"><i class="fas fa-credit-card"></i></span>
          <span data-i18n="nav_card">ATM Card</span>
        </a>
        <a href="/customer/pin.php">
          <span class="ico"><i class="fas fa-key"></i></span>
          <span data-i18n="nav_pin">Transaction Pin</span>
        </a>
        <a href="/customer/password.php">
          <span class="ico"><i class="fas fa-lock"></i></span>
          <span data-i18n="nav_password">Account Password</span>
        </a>
        <a href="#" id="logoutBtn">
          <span class="ico"><i class="fas fa-arrow-right-from-bracket"></i></span>
          <span data-i18n="nav_logout">Logout</span>
        </a>
      </nav>
    </aside>

    <main class="vt-main">
      <header class="vt-topbar">
        <div class="vt-top-left">
          <button class="vt-burger" id="sidebarToggle" type="button" aria-label="Toggle menu">
            <i class="fas fa-bars"></i>
          </button>

          <div class="vt-search">
            <i class="fas fa-search"></i>
            <input type="text" data-i18n-placeholder="search" placeholder="Type credit or debit..." />
          </div>
        </div>

        <div class="vt-top-right">
          <div class="vt-user">
            <div class="avatar" id="avatarInitials">VT</div>
            <div class="meta">
              <strong id="dashboardUserName">Loading...</strong>
              <span id="dashboardUserEmail"> </span>
            </div>
          </div>
        </div>
      </header>

      <div class="vt-content">
        <div class="vt-grid">
          <section>
            <div class="vt-card vt-balance pad">
              <div class="sub">AVAILABLE BALANCE</div>
              <div class="amount" id="balanceAmount">—</div>
              <div class="mini">
                <div>
                  <div class="k">PORTFOLIO VALUE</div>
                  <div class="v" id="portfolioValue">—</div>
                </div>
                <div>
                  <div class="k">TOTAL ASSETS</div>
                  <div class="v" id="totalAssets">—</div>
                </div>
                <div>
                  <div class="k">SAVING ACCOUNT</div>
                  <div class="v" id="savingAccount">—</div>
                </div>
              </div>
            </div>

            <div class="vt-actions">
              <div class="label" data-i18n="actions_more">Quick Actions</div>
              <div class="vt-actions-grid">
                <a class="vt-action" href="/customer/international.php"><i class="fas fa-paper-plane"></i> <span data-i18n="actions_transfer">Bank Transfer</span></a>
                <a class="vt-action" href="/customer/transferhistory.php"><i class="fas fa-clock-rotate-left"></i> <span data-i18n="nav_transferHistory">History</span></a>
                <a class="vt-action" href="/customer/statement.php"><i class="fas fa-file-lines"></i> <span data-i18n="nav_statement">Statement</span></a>
                <a class="vt-action" href="/customer/pin.php"><i class="fas fa-shield-halved"></i> <span data-i18n="nav_pin">Security</span></a>
                <a class="vt-action" href="/customer/stocks.php"><i class="fas fa-chart-line"></i> <span data-i18n="nav_stocks">Stocks</span></a>
                <a class="vt-action" href="/customer/card.php"><i class="fas fa-credit-card"></i> <span data-i18n="nav_card">Card</span></a>
                <a class="vt-action" href="/customer/myprofile.php"><i class="fas fa-user"></i> <span data-i18n="nav_profile">Account</span></a>
                <button class="vt-action" type="button" id="quickLogoutBtn"><i class="fas fa-power-off"></i> <span data-i18n="nav_logout">Logout</span></button>
              </div>
            </div>

            <div class="vt-chart">
              <h4 data-i18n="recent_title">Account Activity</h4>
              <div class="vt-card pad" style="box-shadow: none; position: relative;">
                <svg id="activityChartSvg" viewBox="0 0 800 220" preserveAspectRatio="none" aria-label="Account activity chart">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stop-color="#0B0F14" stop-opacity="0.95" />
                      <stop offset="1" stop-color="#0F172A" stop-opacity="0.95" />
                    </linearGradient>
                    <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stop-color="#0B0F14" stop-opacity="0.18" />
                      <stop offset="1" stop-color="#0B0F14" stop-opacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path id="activityFillPath"
                    d="M0,170 C80,170 120,170 190,170 C260,170 310,170 380,170 C450,170 490,170 560,170 C630,170 680,170 800,170 L800,220 L0,220 Z"
                    fill="url(#fillGrad)"></path>
                  <path id="activityLinePath"
                    d="M0,170 C80,170 120,170 190,170 C260,170 310,170 380,170 C450,170 490,170 560,170 C630,170 680,170 800,170"
                    fill="none"
                    stroke="url(#lineGrad)"
                    stroke-width="6"
                    stroke-linecap="round"></path>
                </svg>
              </div>
            </div>

            <aside class="vt-right-card">
              <div class="vt-fake-card">
                <div class="chip"></div>
                <div class="num" id="cardNumberDisplay">5555 8421 6890 0315</div>
                <div class="meta">
                  <div id="cardNameDisplay">VanguardDoubleTrust</div>
                  <div><span data-i18n="card_exp">VALID THRU</span> 08/30</div>
                </div>
              </div>
            </aside>

            <div class="vt-card pad vt-list">
              <div class="head">
                <strong data-i18n="mk_watchlist">Market Watch</strong>
                <a href="#" onclick="return false;"><span data-i18n="recent_viewAll">View All</span></a>
              </div>
              <div class="vt-row">
                <div class="left">
                  <div class="pill">AAPL</div>
                  <div>
                    <strong>Apple</strong>
                    <span>NASDAQ</span>
                  </div>
                </div>
                <div class="right">
                  $183.28
                  <small class="down">-0.9%</small>
                </div>
              </div>
              <div class="vt-row">
                <div class="left">
                  <div class="pill">TSLA</div>
                  <div>
                    <strong>Tesla</strong>
                    <span>NASDAQ</span>
                  </div>
                </div>
                <div class="right">
                  $298.82
                  <small class="up">+1.2%</small>
                </div>
              </div>
              <div class="vt-row">
                <div class="left">
                  <div class="pill">NVDA</div>
                  <div>
                    <strong>NVIDIA</strong>
                    <span>NASDAQ</span>
                  </div>
                </div>
                <div class="right">
                  $190.01
                  <small class="up">+0.4%</small>
                </div>
              </div>
            </div>

            <div class="vt-card pad vt-list">
              <div class="head">
                <strong>Account Details</strong>
                <a href="#" onclick="return false;">Edit</a>
              </div>
              <div class="vt-row">
                <div class="left">
                  <div class="pill"><i class="fas fa-code-branch"></i></div>
                  <div>
                    <strong>Branch Code</strong>
                    <span>RBBS0001</span>
                  </div>
                </div>
                <div class="right">
                  <span> </span>
                </div>
              </div>
              <div class="vt-row">
                <div class="left">
                  <div class="pill"><i class="fas fa-hashtag"></i></div>
                  <div>
                    <strong>Account Number</strong>
                    <span id="maskedAccount">**** **** **** 3156</span>
                    <span id="fullAccountNumber" style="display:none;font-weight:800;color:#0f172a;"></span>
                  </div>
                </div>
                <div class="right">
                  <span class="up">Verified</span>
                </div>
              </div>
            </div>

            <div class="vt-transactions">
              <h4 data-i18n="recent_title">Recent Transactions</h4>
              <div id="txRowsWrap" style="display:flex;flex-direction:column;gap:10px;">
                <div class="vt-empty" id="txEmptyState" data-i18n="recent_empty" style="display:none;">No transactions yet</div>
                <div id="txList"></div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="vt-footer">
        <div>&copy; 2026 VanguardDoubleTrust. <span data-i18n="footer_rights">All rights reserved.</span></div>
      </div>
    </main>
  </div>

  <style>
    .vt-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.55);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    .vt-modal-overlay.open {
      display: flex;
    }

    .vt-modal {
      background: #fff;
      border-radius: 22px;
      width: min(560px, 100%);
      box-shadow: 0 30px 80px -30px rgba(2, 6, 23, 0.45);
      overflow: hidden;
    }

    .vt-modal-head {
      padding: 20px 24px;
      border-bottom: 1px solid var(--vt-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .vt-modal-head h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
    }

    .vt-modal-close {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      border: 1px solid var(--vt-border);
      background: #f6f8fc;
      display: grid;
      place-items: center;
      cursor: pointer;
      color: var(--vt-text);
    }

    .vt-modal-body {
      padding: 22px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .vt-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .vt-field label {
      font-size: 12px;
      font-weight: 700;
      color: var(--vt-muted);
      letter-spacing: 0.02em;
    }

    .vt-field input,
    .vt-field textarea {
      width: 100%;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid var(--vt-border);
      background: #fff;
      color: var(--vt-text);
      font-size: 14px;
      font-weight: 600;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      font-family: inherit;
    }

    .vt-field input:focus,
    .vt-field textarea:focus {
      border-color: rgba(0, 51, 153, 0.45);
      box-shadow: 0 0 0 4px rgba(0, 51, 153, 0.08);
    }

    .vt-recipient-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.22);
      color: #047857;
      font-weight: 700;
      font-size: 13px;
      display: none;
    }

    .vt-recipient-preview.show {
      display: flex;
    }

    .vt-recipient-preview.error {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.22);
      color: #b91c1c;
    }

    .vt-recipient-preview .pill {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.18);
      color: #047857;
      display: grid;
      place-items: center;
      font-weight: 800;
    }

    .vt-recipient-preview.error .pill {
      background: rgba(239, 68, 68, 0.18);
      color: #b91c1c;
    }

    .vt-modal-foot {
      padding: 16px 24px 24px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .vt-btn {
      padding: 12px 18px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      font-weight: 800;
      font-size: 13px;
      font-family: inherit;
    }

    .vt-btn.secondary {
      background: #f1f5f9;
      color: var(--vt-text);
    }

    .vt-btn.primary {
      background: linear-gradient(135deg, var(--vt-primary), var(--vt-primary-2));
      color: #fff;
    }

    .vt-btn.primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .vt-txrow {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 16px;
      background: #fff;
      border: 1px solid var(--vt-border);
    }

    .vt-txrow .ico {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      font-size: 15px;
    }

    .vt-txrow .ico.in {
      background: rgba(16, 185, 129, 0.12);
      color: #047857;
    }

    .vt-txrow .ico.out {
      background: rgba(239, 68, 68, 0.12);
      color: #b91c1c;
    }

    .vt-txrow .ico.other {
      background: rgba(59, 130, 246, 0.12);
      color: #1d4ed8;
    }

    .vt-txrow .body {
      flex: 1;
      min-width: 0;
    }

    .vt-txrow .body .title {
      font-weight: 800;
      font-size: 14px;
      color: var(--vt-text);
    }

    .vt-txrow .body .sub {
      font-size: 12px;
      color: var(--vt-muted);
      font-weight: 600;
      margin-top: 2px;
    }

    .vt-txrow .amount {
      text-align: right;
      font-weight: 800;
      font-size: 15px;
    }

    .vt-txrow .amount.in {
      color: #047857;
    }

    .vt-txrow .amount.out {
      color: #b91c1c;
    }

    .vt-txrow .status {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.02em;
      margin-top: 4px;
    }

    .vt-txrow .status.COMPLETED {
      background: rgba(16, 185, 129, 0.14);
      color: #047857;
    }

    .vt-txrow .status.PENDING {
      background: rgba(245, 158, 11, 0.14);
      color: #92400e;
    }

    .vt-txrow .status.PROCESSING {
      background: rgba(59, 130, 246, 0.14);
      color: #1d4ed8;
    }

    .vt-txrow .status.FAILED,
    .vt-txrow .status.SUSPENDED,
    .vt-txrow .status.REJECTED {
      background: rgba(239, 68, 68, 0.14);
      color: #b91c1c;
    }

    .vt-modal-msg {
      padding: 10px 12px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 12.5px;
      display: none;
    }

    .vt-modal-msg.show {
      display: block;
    }

    .vt-modal-msg.error {
      background: rgba(239, 68, 68, 0.08);
      color: #b91c1c;
      border: 1px solid rgba(239, 68, 68, 0.18);
    }

    .vt-modal-msg.success {
      background: rgba(16, 185, 129, 0.08);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.18);
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

    /* ===== FINAL CASCADE-WINNING FIX: New transaction / Back to home / Hamburger — READABLE, NO DARK OVERRIDE ===== */
    html body div#vtDashNewTxBtn,
    html body div#vtCustomNewTxBtn,
    html body button#vtDashNewTxBtn,
    html body button#vtCustomNewTxBtn,
    button[id="vtDashNewTxBtn"],
    button[id="vtCustomNewTxBtn"] {
      background: #3b82f6 !important;
      background-color: #3b82f6 !important;
      background-image: none !important;
      color: #ffffff !important;
      border: 2px solid #1d4ed8 !important;
      border-color: #1d4ed8 !important;
      font-weight: 900 !important;
      border-radius: 12px !important;
      padding: 13px 26px !important;
      font-size: 14px !important;
      box-shadow: 0 10px 28px -10px rgba(59, 130, 246, 0.98) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
      filter: none !important;
      mix-blend-mode: normal !important;
    }

    html body button#vtDashNewTxBtn:hover,
    html body button#vtCustomNewTxBtn:hover {
      background-color: #2563eb !important;
      border-color: #1e40af !important;
      color: #ffffff !important;
      box-shadow: 0 14px 32px -10px rgba(59, 130, 246, 1) !important;
    }

    html body button#vtDashHomeBtn,
    html body button#vtCustomBackHomeBtn,
    button[id="vtDashHomeBtn"],
    button[id="vtCustomBackHomeBtn"] {
      background: #ef4444 !important;
      background-color: #ef4444 !important;
      background-image: none !important;
      color: #ffffff !important;
      border: 2px solid #b91c1c !important;
      border-color: #b91c1c !important;
      font-weight: 900 !important;
      border-radius: 12px !important;
      padding: 13px 26px !important;
      font-size: 14px !important;
      box-shadow: 0 10px 28px -10px rgba(239, 68, 68, 0.98) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
      filter: none !important;
      mix-blend-mode: normal !important;
    }

    html body button#vtDashHomeBtn:hover,
    html body button#vtCustomBackHomeBtn:hover {
      background-color: #dc2626 !important;
      border-color: #991b1b !important;
      color: #ffffff !important;
      box-shadow: 0 14px 32px -10px rgba(239, 68, 68, 1) !important;
    }

    html body button.vt-burger,
    html body button#sidebarToggle,
    html body [class*="vt-burger"] {
      background: #ffffff !important;
      background-color: #ffffff !important;
      background-image: none !important;
      color: #0a0f1a !important;
      border: 2px solid rgba(232, 195, 103, 0.55) !important;
      border-color: rgba(232, 195, 103, 0.55) !important;
      width: 42px !important;
      height: 42px !important;
      border-radius: 12px !important;
      cursor: pointer !important;
      box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.65) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      visibility: visible !important;
      opacity: 1 !important;
      filter: none !important;
      mix-blend-mode: normal !important;
    }

    html body button.vt-burger i,
    html body button#sidebarToggle i,
    html body [class*="vt-burger"] i,
    html body .vt-burger .fas.fa-bars {
      color: #0a0f1a !important;
      font-size: 18px !important;
      font-weight: 900 !important;
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    html body button.vt-burger:hover,
    html body button#sidebarToggle:hover {
      background: #e8c367 !important;
      background-color: #e8c367 !important;
      border-color: #d4af37 !important;
      color: #0a0f1a !important;
      box-shadow: 0 10px 24px -10px rgba(232, 195, 103, 0.9) !important;
    }

    html body button.vt-burger:hover i,
    html body button#sidebarToggle:hover i {
      color: #0a0f1a !important;
    }
  </style>

  <div class="vt-modal-overlay" id="transferModalOverlay" aria-hidden="true">
    <div class="vt-modal" role="dialog" aria-modal="true" aria-labelledby="transferModalTitle">
      <div class="vt-modal-head">
        <h3 id="transferModalTitle" data-i18n="actions_transfer">Bank Transfer</h3>
        <button class="vt-modal-close" id="transferModalClose" type="button" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="vt-modal-body">
        <div class="vt-modal-msg error" id="transferModalError"></div>
        <div class="vt-modal-msg success" id="transferModalSuccess"></div>

        <div class="vt-field">
          <label data-i18n="kyc_language">Find Recipient By</label>
          <div style="display:flex; gap:10px;">
            <select id="transferLookupType" style="flex:0 0 auto; padding:12px 12px; border-radius:14px; border:1px solid var(--vt-border); font-weight:700; font-family:inherit; color:var(--vt-text);">
              <option value="accountNumber">Account Number</option>
              <option value="email">Email</option>
            </select>
            <input type="text" id="transferLookupValue" placeholder="Enter account number or email" style="flex:1;" />
          </div>
        </div>

        <div class="vt-recipient-preview" id="transferRecipientPreview">
          <div class="pill" id="transferRecipientPill">?</div>
          <div style="flex:1; min-width:0;">
            <div id="transferRecipientName" style="font-weight:800;"></div>
            <div id="transferRecipientMeta" style="font-size:11.5px; opacity:0.75; margin-top:2px;"></div>
          </div>
        </div>

        <div class="vt-field">
          <label>Amount (USD)</label>
          <input type="number" id="transferAmountInput" step="0.01" min="0" placeholder="0.00" />
        </div>

        <div class="vt-field">
          <label>Memo / Reference (optional)</label>
          <input type="text" id="transferMemoInput" placeholder="What's this transfer for?" maxlength="140" />
        </div>

        <div class="vt-field">
          <label data-i18n="nav_pin">Transfer Code</label>
          <input type="password" id="transferCodeInput" placeholder="Your 6-digit transfer code" autocomplete="off" />
        </div>
      </div>
      <div class="vt-modal-foot">
        <button class="vt-btn secondary" id="transferCancelBtn" type="button">Cancel</button>
        <button class="vt-btn primary" id="transferSubmitBtn" type="button" disabled>Review &amp; Send</button>
      </div>
    </div>
  </div>

  <script src="assets/libs/jquery/jquery.min.js"></script>
  <script src="../assets/js/bootstrap.bundle.min.js"></script>
  <script src="assets/libs/simplebar/simplebar.min.js"></script>
  <script src="assets/libs/node-waves/waves.min.js"></script>

  <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="assets/js/auth-session.js?v=20260817b"></script>
  <script src="assets/js/customer-i18n.js?v=20260817b"></script>

  <script>
    (function() {
      try {
        window.onerror = function(msg, src, lineno, colno, err) {
          try {
            var ERR = document.createElement("div");
            ERR.id = "GLOBAL_ERR_" + Date.now();
            ERR.style.cssText = "position:fixed;right:10px;bottom:24px;background:#7f1d1d;color:#fff;padding:8px 10px;font-size:12px;font-weight:800;z-index:2147483647;border-radius:8px;max-width:360px;line-height:1.55;";
            ERR.textContent = "GLOBAL JS ERROR: " + String(msg || "") + " line:" + String(lineno || "");
            document.documentElement.appendChild(ERR);
          } catch (_) {}
        };
      } catch (_) {}
      (function initInlineGates() {})();

      function toast(msg, kind) {
        var VT = window.VT || {};
        if (VT && VT.UI && typeof VT.UI.toast === "function") {
          try {
            VT.UI.toast(msg, kind || "error");
            return;
          } catch (_) {}
        }
        var div = document.createElement("div");
        div.textContent = String(msg || "");
        div.style.position = "fixed";
        div.style.bottom = "24px";
        div.style.left = "50%";
        div.style.transform = "translateX(-50%)";
        div.style.zIndex = "9999";
        div.style.padding = "12px 18px";
        div.style.borderRadius = "14px";
        div.style.fontWeight = "700";
        div.style.fontSize = "13px";
        div.style.boxShadow = "0 20px 60px -20px rgba(0,0,0,0.35)";
        if (String(kind || "").toLowerCase() === "ok" || String(kind || "").toLowerCase() === "success") {
          div.style.background = "#047857";
          div.style.color = "#ffffff";
        } else {
          div.style.background = "#b91c1c";
          div.style.color = "#ffffff";
        }
        document.body.appendChild(div);
        setTimeout(function() {
          try {
            div.remove();
          } catch (_) {}
        }, 3200);
      }

      function fetchJson(url, options) {
        return fetch(url, Object.assign({
            credentials: "same-origin",
            headers: {
              "Accept": "application/json"
            }
          }, options || {}))
          .then(function(r) {
            var ct = r.headers.get("content-type") || "";
            if (/json/i.test(ct)) {
              return r.text().then(function(t) {
                try {
                  return {
                    ok: r.ok,
                    status: r.status,
                    json: JSON.parse(t),
                    text: t
                  };
                } catch (_) {
                  return {
                    ok: r.ok,
                    status: r.status,
                    json: {},
                    text: t
                  };
                }
              });
            }
            return r.text().then(function(t) {
              return {
                ok: r.ok,
                status: r.status,
                json: {},
                text: t
              };
            });
          })
          .then(function(r) {
            if (!r.ok) {
              var msg = (r.json && (r.json.error || r.json.message)) ? String(r.json.error || r.json.message) : ("Request failed (" + r.status + ")");
              var err = new Error(msg);
              err.status = r.status;
              err.response = r;
              throw err;
            }
            return r.json;
          });
      }

      function fmtCurrency(v, currency) {
        var n = Number(v);
        if (!Number.isFinite(n)) n = 0;
        var c = String(currency || "USD").toUpperCase() || "USD";
        try {
          return n.toLocaleString("en-US", {
            style: "currency",
            currency: c,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        } catch (_) {
          return c + " " + n.toFixed(2);
        }
      }

      function fmtDate(iso) {
        if (!iso) return "--";
        try {
          var d = new Date(iso);
          if (isNaN(d.getTime())) return String(iso);
          var now = new Date();
          var ms = now.getTime() - d.getTime();
          var mins = Math.floor(ms / 60000);
          if (mins < 1) return "Just now";
          if (mins < 60) return mins + " min ago";
          var hrs = Math.floor(mins / 60);
          if (hrs < 24) return hrs + " hr" + (hrs === 1 ? "" : "s") + " ago";
          var days = Math.floor(hrs / 24);
          if (days < 7) return days + " day" + (days === 1 ? "" : "s") + " ago";
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
        } catch (_) {
          return String(iso);
        }
      }

      function initSidebar() {
        var toggle = document.getElementById("sidebarToggle");
        var overlay = document.getElementById("sidebarOverlay");
        var sidebar = document.querySelector(".vt-sidebar");
        var body = document.body;

        function isMobile() {
          try {
            return window.matchMedia("(max-width: 992px)").matches;
          } catch (_) {
            return true;
          }
        }

        function closeSidebar() {
          body.classList.remove("vt-sidebar-open");
        }

        function openSidebar() {
          body.classList.add("vt-sidebar-open");
        }
        if (toggle) {
          toggle.addEventListener("click", function(e) {
            e.preventDefault();
            if (body.classList.contains("vt-sidebar-open")) closeSidebar();
            else openSidebar();
          });
        }
        if (overlay) overlay.addEventListener("click", closeSidebar);
        document.addEventListener("keydown", function(e) {
          if (e.key === "Escape") closeSidebar();
        }, false);
        document.addEventListener("click", function(e) {
          if (!isMobile()) return;
          if (!body.classList.contains("vt-sidebar-open")) return;
          var target = e.target;
          if (!target) return;
          if (sidebar && sidebar.contains(target)) return;
          if (toggle && toggle.contains(target)) return;
          if (overlay && overlay.contains(target)) return;
          closeSidebar();
        }, true);
      }

      function initLogout() {
        var logoutBtns = [document.getElementById("logoutBtn"), document.getElementById("logoutBtn2"), document.getElementById("quickLogoutBtn")].filter(Boolean);
        logoutBtns.forEach(function(btn) {
          btn.addEventListener("click", function(e) {
            e.preventDefault();
            var VT = window.VT || {};
            if (VT.I18N && VT.I18N.t) {
              var msg = VT.I18N.t("logout_confirm");
              if (msg && !window.confirm(String(msg))) return;
            } else if (!window.confirm("Are you sure you want to sign out?")) return;
            fetchJson("/api/customer/logout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: "{}"
              })
              .catch(function() {})
              .then(function() {
                window.location.href = "/customer/login.php.html";
              });
          });
        });
      }

      function applyUserInfoToDashboard(me) {
        var prof = (me && me.profile) ? me.profile : {};
        var first = String(prof.firstname || prof.firstName || prof.first_name || (me && me.firstname) || (me && me.firstName) || (me && me.first_name) || "").trim();
        var last = String(prof.lastname || prof.lastName || prof.last_name || (me && me.lastname) || (me && me.lastName) || (me && me.last_name) || "").trim();
        var email = String(me && me.email ? me.email : "");
        var fullName = (first + " " + last).trim() || email || "Customer";
        var nameEl = document.getElementById("dashboardUserName");
        var emailEl = document.getElementById("dashboardUserEmail");
        if (nameEl) nameEl.textContent = fullName;
        if (emailEl) emailEl.textContent = email;
        var avatarEl = document.getElementById("avatarInitials");
        if (avatarEl) {
          var initials = "";
          if (first) initials += first.charAt(0).toUpperCase();
          if (last) initials += last.charAt(0).toUpperCase();
          if (!initials) initials = "VT";
          var sec = (me && me.security) ? me.security : {};
          var picUrl = String(
            prof.profilePic || prof.photoURL || prof.photo || prof.avatar ||
            (me && (me.profilePic || me.photoURL || me.photo || me.avatar)) ||
            sec.profilePic || sec.photoURL || ""
          ).trim();
          if (picUrl && picUrl !== "null" && picUrl !== "undefined") {
            avatarEl.innerHTML = '<img src="' + picUrl + '" alt="' + fullName + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;" onerror="this.onerror=null;this.parentElement.textContent=\'' + initials + '\';" />';
            avatarEl.style.background = "transparent";
            avatarEl.style.padding = "0";
            avatarEl.style.overflow = "hidden";
          } else {
            avatarEl.textContent = initials;
            avatarEl.style.background = "";
            avatarEl.style.color = "";
            avatarEl.style.padding = "";
            avatarEl.style.overflow = "";
            try {
              var imgs = avatarEl.querySelectorAll ? avatarEl.querySelectorAll("img") : [];
              for (var i = 0; i < imgs.length; i++) try {
                imgs[i].remove();
              } catch (_) {}
            } catch (_) {}
          }
        }
        var account = (me && me.account) ? me.account : {};
        var currency = String(account.currency || prof.currency || "USD").toUpperCase() || "USD";
        var balance = Number(account.balance || 0);
        var balEl = document.getElementById("balanceAmount");
        if (balEl) balEl.textContent = fmtCurrency(balance, currency);
        var pvEl = document.getElementById("portfolioValue");
        if (pvEl) pvEl.textContent = fmtCurrency(Number(account.portfolioValue || balance * 0.2), currency);
        var taEl = document.getElementById("totalAssets");
        if (taEl) taEl.textContent = fmtCurrency(Number(account.totalAssets || balance * 1.05), currency);
        var svEl = document.getElementById("savingAccount");
        if (svEl) svEl.textContent = fmtCurrency(Number(account.savingsBalance || balance * 0.35), currency);
        var maskedEl = document.getElementById("maskedAccount");
        var fullAccEl = document.getElementById("fullAccountNumber");
        var accNo = String(account.accountNumber || "");
        if (maskedEl) {
          if (accNo && accNo.length >= 4) {
            maskedEl.textContent = "**** **** **** " + accNo.slice(-4);
          } else if (accNo) {
            maskedEl.textContent = accNo;
          }
        }
        if (fullAccEl && accNo) {
          fullAccEl.textContent = accNo;
        }
        var cardNameEl = document.getElementById("cardNameDisplay");
        if (cardNameEl) {
          cardNameEl.textContent = fullName.toUpperCase();
        }
        var cardNumEl = document.getElementById("cardNumberDisplay");
        if (cardNumEl) {
          var digits = String(account.accountNumber || "").replace(/\D/g, "");
          if (digits.length < 16) {
            var pad = "0000000000000000";
            digits = (digits + pad).slice(0, 16);
          } else {
            digits = digits.slice(0, 16);
          }
          cardNumEl.textContent = digits.slice(0, 4) + " " + digits.slice(4, 8) + " " + digits.slice(8, 12) + " " + digits.slice(12, 16);
        }
        return {
          profile: prof,
          account: account,
          currency: currency,
          balance: balance
        };
      }

      function buildTxRow(tx, currency) {
        var type = String(tx.type || tx.kind || "OTHER").toUpperCase();
        var amount = Number(tx.amount || 0);
        var isIn = false,
          isOut = false;
        if (/IN$|CREDIT|DEPOSIT|RECEIVE|REFUND/.test(type)) isIn = true;
        else if (/OUT$|DEBIT|TRANSFER|WITHDRAW|PAY|SEND|BILL|PURCHASE|FEE/.test(type)) isOut = true;
        var signedAmount = isIn ? Math.abs(amount) : (isOut ? -Math.abs(amount) : amount);
        var title = String(tx.note || tx.description || tx.title || type);
        var toName = (tx.to && (tx.to.name || tx.to.accountNumber)) ? String(tx.to.name || tx.to.accountNumber) : "";
        var fromName = (tx.from && (tx.from.name || tx.from.accountNumber)) ? String(tx.from.name || tx.from.accountNumber) : "";
        if (!title || title === type) {
          if (isIn && fromName) title = "Received from " + fromName;
          else if (isOut && toName) title = "Sent to " + toName;
          else title = type.replace(/_/g, " ").replace(/\b\w/g, function(l) {
            return l.toUpperCase();
          });
        }
        var sub = "Ref: " + (tx.reference || tx.id || "--") + " · " + fmtDate(tx.createdAt || tx.date);
        var icoClass = isIn ? "in" : (isOut ? "out" : "other");
        var icon = isIn ? "fas fa-arrow-down" : (isOut ? "fas fa-arrow-up" : "fas fa-credit-card");
        var amountClass = signedAmount >= 0 ? "in" : "out";
        var amountText = (signedAmount >= 0 ? "+" : "-") + fmtCurrency(Math.abs(signedAmount), currency);
        var status = String(tx.status || "PENDING").toUpperCase();
        var row = document.createElement("div");
        row.className = "vt-txrow";
        row.innerHTML =
          '<div class="ico ' + icoClass + '"><i class="' + icon + '"></i></div>' +
          '<div class="body"><div class="title"></div><div class="sub"></div>' +
          '<div class="status ' + status + '"></div></div>' +
          '<div class="amount ' + amountClass + '"></div>';
        row.querySelector(".title").textContent = title;
        row.querySelector(".sub").textContent = sub;
        row.querySelector(".amount").textContent = amountText;
        row.querySelector(".status").textContent = status.charAt(0) + status.slice(1).toLowerCase();
        return row;
      }

      function renderTransactions(transactions, currency) {
        var list = document.getElementById("txList");
        var empty = document.getElementById("txEmptyState");
        if (!list) return;
        while (list.firstChild) list.removeChild(list.firstChild);
        var arr = Array.isArray(transactions) ? transactions.slice(0, 10) : [];
        if (arr.length === 0) {
          if (empty) empty.style.display = "";
          return;
        }
        if (empty) empty.style.display = "none";
        arr.forEach(function(tx) {
          try {
            list.appendChild(buildTxRow(tx, currency));
          } catch (_) {}
        });
      }

      function renderActivityChart(transactions, currency, currentBalance) {
        var linePath = document.getElementById("activityLinePath");
        var fillPath = document.getElementById("activityFillPath");
        var svg = document.getElementById("activityChartSvg");
        if (!linePath || !fillPath || !svg) return;
        var W = 800,
          H = 220;
        var padX = 24,
          padY = 30;
        var points = [];
        var balances = [];
        var now = new Date();
        var todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        var ONE_DAY = 86400000;
        var DAYS = 14;
        var dailyNet = {};
        for (var i = 0; i < DAYS; i++) {
          var d = new Date(todayMs - (DAYS - 1 - i) * ONE_DAY);
          var key = d.toISOString().slice(0, 10);
          dailyNet[key] = 0;
        }
        (transactions || []).forEach(function(tx) {
          var iso = tx.createdAt || tx.date;
          if (!iso) return;
          var d;
          try {
            d = new Date(iso);
          } catch (_) {
            return;
          }
          if (isNaN(d.getTime())) return;
          var key = d.toISOString().slice(0, 10);
          if (!(key in dailyNet)) return;
          var amt = Number(tx.amount || 0);
          var type = String(tx.type || tx.kind || "").toUpperCase();
          if (/OUT$|DEBIT|WITHDRAW|PAY|SEND|BILL|PURCHASE|FEE/.test(type)) dailyNet[key] -= Math.abs(amt);
          else if (/IN$|CREDIT|DEPOSIT|RECEIVE|REFUND/.test(type)) dailyNet[key] += Math.abs(amt);
        });
        var sortedKeys = Object.keys(dailyNet).sort();
        var hasRealTx = false;
        for (var k = 0; k < sortedKeys.length; k++) {
          if (Math.abs(Number(dailyNet[sortedKeys[k]] || 0)) > 0.001) {
            hasRealTx = true;
            break;
          }
        }
        if (!hasRealTx) {
          (function() {
            var total = sortedKeys.length;
            var baseBalance = Number(currentBalance || 0);
            if (!Number.isFinite(baseBalance) || baseBalance <= 0) baseBalance = 2500;
            var cur = baseBalance;
            var pattern = [0.02, 0.015, -0.01, 0.03, -0.005, 0.025, -0.02, 0.018, 0.012, -0.008, 0.032, 0.006, -0.015, 0.022];
            for (var ii = 0; ii < total; ii++) {
              dailyNet[sortedKeys[ii]] = 0;
            }
            for (var jj = total - 1; jj >= 0; jj--) {
              var idx = total - 1 - jj;
              var factor = pattern[(total - 1 - jj) % pattern.length];
              var delta = cur * factor;
              dailyNet[sortedKeys[jj]] = delta;
              cur -= delta;
            }
          })();
        }
        var bal = Number(currentBalance || 0);
        if (!Number.isFinite(bal) || bal <= 0) {
          var minDemo = Number.POSITIVE_INFINITY,
            maxDemo = Number.NEGATIVE_INFINITY,
            running = 2500;
          for (var mm = sortedKeys.length - 1; mm >= 0; mm--) {
            running -= Number(dailyNet[sortedKeys[mm]] || 0);
            if (running < minDemo) minDemo = running;
            if (running > maxDemo) maxDemo = running;
          }
          bal = 2500;
        }
        for (var kk = sortedKeys.length - 1; kk >= 0; kk--) {
          balances.push(bal);
          bal -= Number(dailyNet[sortedKeys[kk]] || 0);
        }
        balances.reverse();
        var minBal = Math.min.apply(null, balances.concat([0]));
        var maxBal = Math.max.apply(null, balances.concat([Number(currentBalance || 0) * 1.05]));
        if (maxBal - minBal < 0.01) {
          minBal = 0;
          maxBal = Math.max(1, Number(currentBalance || 100));
        }
        var usableW = W - padX * 2;
        var usableH = H - padY * 2;
        points = sortedKeys.map(function(key, idx) {
          var ratio = sortedKeys.length <= 1 ? 0.5 : (idx / (sortedKeys.length - 1));
          var x = padX + ratio * usableW;
          var v = balances[idx];
          var yRatio = (maxBal - v) / (maxBal - minBal);
          if (!Number.isFinite(yRatio)) yRatio = 1;
          yRatio = Math.max(0, Math.min(1, yRatio));
          var y = padY + yRatio * usableH;
          return [x, y];
        });
        if (points.length === 0) {
          points = [
            [padX, H - padY],
            [W - padX, H - padY]
          ];
        } else if (points.length === 1) {
          points = [
            [padX, points[0][1]],
            [W - padX, points[0][1]]
          ];
        }

        function smoothPath(pts) {
          if (pts.length < 2) return "M" + pts[0][0] + "," + pts[0][1];
          var d = "M" + pts[0][0].toFixed(2) + "," + pts[0][1].toFixed(2);
          for (var i = 1; i < pts.length; i++) {
            var p0 = pts[i - 1];
            var p1 = pts[i];
            var cpx1 = p0[0] + (p1[0] - p0[0]) * 0.45;
            var cpx2 = p1[0] - (p1[0] - p0[0]) * 0.45;
            d += " C" + cpx1.toFixed(2) + "," + p0[1].toFixed(2) + " " + cpx2.toFixed(2) + "," + p1[1].toFixed(2) + " " + p1[0].toFixed(2) + "," + p1[1].toFixed(2);
          }
          return d;
        }
        var lineD = smoothPath(points);
        var first = points[0],
          last = points[points.length - 1];
        var fillD = lineD + " L" + last[0].toFixed(2) + "," + (H).toFixed(2) + " L" + first[0].toFixed(2) + "," + (H).toFixed(2) + " Z";
        linePath.setAttribute("d", lineD);
        fillPath.setAttribute("d", fillD);
        try {
          var actualLen = 0;
          if (typeof linePath.getTotalLength === "function") {
            try {
              actualLen = Math.max(1, Math.round(linePath.getTotalLength()));
            } catch (_) {
              actualLen = 3000;
            }
          } else {
            actualLen = 3000;
          }
          var safeLen = String(actualLen);
          linePath.style.setProperty("--vt-line-len", safeLen);
          fillPath.style.setProperty("--vt-line-len", safeLen);
          linePath.classList.remove("vt-animate-chart");
          fillPath.classList.remove("vt-animate-chart");
          try {
            void(linePath.offsetParent);
          } catch (_) {}
          try {
            void(linePath.getBoundingClientRect && linePath.getBoundingClientRect().width);
          } catch (_) {}
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              linePath.classList.add("vt-animate-chart");
              fillPath.classList.add("vt-animate-chart");
            });
          });
        } catch (_chartAnimErr) {
          try {
            linePath.classList.add("vt-animate-chart");
            fillPath.classList.add("vt-animate-chart");
          } catch (_) {}
        }
      }

      function fetchAndRenderTx(ctx) {
        var currency = ctx && ctx.currency ? ctx.currency : "USD";
        var balance = ctx && Number.isFinite(ctx.balance) ? ctx.balance : 0;
        return fetchJson("/api/customer/transactions?limit=60", {
            method: "GET"
          })
          .then(function(data) {
            var txs = data && Array.isArray(data.transactions) ? data.transactions : [];
            if (data && Number.isFinite(Number(data.balance))) balance = Number(data.balance);
            renderTransactions(txs, currency);
            renderActivityChart(txs, currency, balance);
            return txs;
          })
          .catch(function(err) {
            console.warn("[VT] Unable to load transactions:", err && err.message ? err.message : err);
            renderTransactions([], currency);
            renderActivityChart([], currency, balance);
            return [];
          });
      }

      var transferState = {
        recipient: null,
        debounceTimer: null
      };

      function resetTransferModal() {
        transferState.recipient = null;
        var errEl = document.getElementById("transferModalError");
        var okEl = document.getElementById("transferModalSuccess");
        if (errEl) {
          errEl.classList.remove("show");
          errEl.textContent = "";
        }
        if (okEl) {
          okEl.classList.remove("show");
          okEl.textContent = "";
        }
        var look = document.getElementById("transferLookupValue");
        var amt = document.getElementById("transferAmountInput");
        var memo = document.getElementById("transferMemoInput");
        var code = document.getElementById("transferCodeInput");
        if (look) look.value = "";
        if (amt) amt.value = "";
        if (memo) memo.value = "";
        if (code) code.value = "";
        var prev = document.getElementById("transferRecipientPreview");
        if (prev) prev.classList.remove("show", "error");
        var pill = document.getElementById("transferRecipientPill");
        if (pill) pill.textContent = "?";
        var rname = document.getElementById("transferRecipientName");
        var rmeta = document.getElementById("transferRecipientMeta");
        if (rname) rname.textContent = "";
        if (rmeta) rmeta.textContent = "";
        var submitBtn = document.getElementById("transferSubmitBtn");
        if (submitBtn) submitBtn.disabled = true;
      }

      function openTransferModal() {
        resetTransferModal();
        var o = document.getElementById("transferModalOverlay");
        if (o) {
          o.classList.add("open");
          o.setAttribute("aria-hidden", "false");
        }
      }

      function closeTransferModal() {
        var o = document.getElementById("transferModalOverlay");
        if (o) {
          o.classList.remove("open");
          o.setAttribute("aria-hidden", "true");
        }
      }

      function setTransferMsg(kind, text) {
        var err = document.getElementById("transferModalError");
        var ok = document.getElementById("transferModalSuccess");
        if (err) {
          err.classList.remove("show");
          err.textContent = "";
        }
        if (ok) {
          ok.classList.remove("show");
          ok.textContent = "";
        }
        var target = kind === "error" ? err : ok;
        if (target) {
          target.textContent = String(text || "");
          target.classList.add("show");
        }
      }

      function updateRecipientPreview() {
        var prev = document.getElementById("transferRecipientPreview");
        var pill = document.getElementById("transferRecipientPill");
        var name = document.getElementById("transferRecipientName");
        var meta = document.getElementById("transferRecipientMeta");
        var submit = document.getElementById("transferSubmitBtn");
        if (!prev) return;
        if (!transferState.recipient || !transferState.recipient.ok) {
          prev.classList.remove("show", "error");
          if (submit) submit.disabled = true;
          return;
        }
        if (transferState.recipient.ok === true && transferState.recipient.data) {
          prev.classList.remove("error");
          prev.classList.add("show");
          var r = transferState.recipient.data;
          var fn = String(r.fullName || r.name || "");
          var initials = "";
          if (fn) {
            var parts = fn.split(/\s+/).filter(Boolean).slice(0, 2);
            parts.forEach(function(p) {
              initials += p.charAt(0).toUpperCase();
            });
          }
          if (!initials) initials = "?";
          if (pill) pill.textContent = initials;
          if (name) name.textContent = fn || r.email || r.accountNumber || "Recipient";
          var line = [];
          if (r.accountNumber) line.push("Acct " + r.accountNumber);
          if (r.email) line.push(r.email);
          if (r.currency) line.push(r.currency);
          if (meta) meta.textContent = line.join(" · ");
          if (submit) {
            var amt = document.getElementById("transferAmountInput");
            var code = document.getElementById("transferCodeInput");
            var amtValid = amt && Number(amt.value) > 0;
            var codeValid = code && code.value.trim().length >= 6;
            submit.disabled = !(amtValid && codeValid);
          }
        } else if (transferState.recipient.ok === false) {
          prev.classList.add("show", "error");
          if (pill) pill.textContent = "!";
          if (name) name.textContent = "Recipient not found";
          if (meta) meta.textContent = String(transferState.recipient.message || "Please check the account number or email.");
          if (submit) submit.disabled = true;
        }
      }

      function performRecipientLookup() {
        var typeSel = document.getElementById("transferLookupType");
        var valInput = document.getElementById("transferLookupValue");
        var prev = document.getElementById("transferRecipientPreview");
        var type = typeSel ? String(typeSel.value || "accountNumber") : "accountNumber";
        var value = valInput ? String(valInput.value || "").trim() : "";
        if (!value) {
          transferState.recipient = null;
          updateRecipientPreview();
          return;
        }
        if (prev) {
          prev.classList.remove("show", "error");
        }
        transferState.recipient = null;
        var params = new URLSearchParams();
        if (type === "accountNumber") params.set("accountNumber", value);
        else params.set("email", value);
        fetchJson("/api/customer/lookup-account?" + params.toString(), {
            method: "GET"
          })
          .then(function(data) {
            if (data && data.ok && data.recipient) {
              transferState.recipient = {
                ok: true,
                data: data.recipient
              };
            } else {
              transferState.recipient = {
                ok: false,
                message: (data && data.error) ? String(data.error) : "Recipient not found."
              };
            }
            updateRecipientPreview();
          })
          .catch(function(err) {
            transferState.recipient = {
              ok: false,
              message: err && err.message ? String(err.message) : "Unable to look up account."
            };
            updateRecipientPreview();
          });
      }

      function refreshTransferSubmitEnabled() {
        var submit = document.getElementById("transferSubmitBtn");
        if (!submit) return;
        var amt = document.getElementById("transferAmountInput");
        var code = document.getElementById("transferCodeInput");
        var amtValid = !!(amt && Number(amt.value) > 0);
        var codeValid = !!(code && code.value.trim().length >= 6);
        var recipientValid = !!(transferState.recipient && transferState.recipient.ok);
        submit.disabled = !(amtValid && codeValid && recipientValid);
      }

      function submitTransfer(ctx) {
        var submitBtn = document.getElementById("transferSubmitBtn");
        if (submitBtn) submitBtn.disabled = true;
        var typeSel = document.getElementById("transferLookupType");
        var valInput = document.getElementById("transferLookupValue");
        var amtInput = document.getElementById("transferAmountInput");
        var memoInput = document.getElementById("transferMemoInput");
        var codeInput = document.getElementById("transferCodeInput");
        setTransferMsg("error", "");
        setTransferMsg("success", "");
        var type = typeSel ? String(typeSel.value || "accountNumber") : "accountNumber";
        var value = valInput ? String(valInput.value || "").trim() : "";
        var amount = Number(amtInput ? amtInput.value : 0);
        var memo = memoInput ? String(memoInput.value || "").trim() : "";
        var code = codeInput ? String(codeInput.value || "").trim() : "";
        if (!transferState.recipient || !transferState.recipient.ok) {
          setTransferMsg("error", "Please select a valid recipient first.");
          if (submitBtn) submitBtn.disabled = false;
          return;
        }
        if (!(amount > 0)) {
          setTransferMsg("error", "Amount must be greater than 0.");
          if (submitBtn) submitBtn.disabled = false;
          return;
        }

        var requestBody = {
          amount: amount,
          memo: memo,
          currency: (ctx && ctx.currency) ? ctx.currency : "USD"
        };
        if (type === "accountNumber") requestBody.toAccountNumber = value;
        else requestBody.toEmail = value;

        function doExecuteTransfer(otpCode) {
          var bodyObj = Object.assign({}, requestBody, {
            otp: otpCode,
            transferCode: otpCode
          });
          var originalText = submitBtn ? submitBtn.textContent : "Send";
          if (submitBtn) submitBtn.textContent = "Sending…";
          fetchJson("/api/customer/transfer", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(bodyObj)
            })
            .then(function(data) {
              if (data && data.ok) {
                setTransferMsg("success", "Bank Transfer sent successfully. Reference " + (data.reference || "--"));
                toast("Bank Transfer completed successfully!", "success");
                var bal = document.getElementById("balanceAmount");
                if (bal && data && Number.isFinite(Number(data.newBalance))) {
                  var c = (ctx && ctx.currency) ? ctx.currency : "USD";
                  bal.textContent = fmtCurrency(Number(data.newBalance), c);
                }
                if (codeInput) codeInput.value = "";
                if (amtInput) amtInput.value = "";
                if (memoInput) memoInput.value = "";
                if (valInput) valInput.value = "";
                transferState.recipient = null;
                updateRecipientPreview();
              } else {
                setTransferMsg("error", (data && data.error) ? String(data.error) : "Transfer failed.");
                toast((data && data.error) ? String(data.error) : "Transfer failed.", "error");
              }
            })
            .catch(function(err) {
              setTransferMsg("error", err && err.message ? String(err.message) : "Unable to complete transfer.");
              toast(err && err.message ? String(err.message) : "Unable to complete transfer.", "error");
            })
            .finally(function() {
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
              }
            });
        }

        requestBody.transferPin = code;
        requestBody.transferCode = code;

        var hasSwal = !!(window.Swal && typeof window.Swal.fire === "function");

        fetchJson("/api/customer/transfer/request-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }).then(function(res) {
          if (res && res.ok) {
            var codeHint = String(res.otp || res.code || "").trim();
            var maskedEmail = String(res.maskedEmail || "your registered email").trim();
            toast(res.message || "Verification code dispatched to " + maskedEmail + ".", "info");

            if (hasSwal) {
              var codeBanner = codeHint ?
                '<div style="margin:14px auto 8px;padding:12px 18px;background:#eff6ff;border:1.5px solid #93c5fd;border-radius:12px;text-align:center;">' +
                '<div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;">Your Transfer OTP Code</div>' +
                '<div style="font-size:28px;font-weight:900;letter-spacing:6px;color:#1e3a8a;margin:4px 0;">' + codeHint + '</div>' +
                '<div style="font-size:11px;color:#64748b;">(Generated for ' + maskedEmail + ')</div>' +
                '</div>' :
                '';
              window.Swal.fire({
                title: "Email Verification Code",
                html: 'A 6-digit One-Time Password (OTP) has been dispatched for <strong>' + maskedEmail + '</strong>.' +
                  codeBanner +
                  '<small class="text-muted" style="display:block;margin-top:8px;">Code expires in 15 minutes. Enter the 6-digit code below to authorize this transfer.</small>',
                input: "text",
                inputValue: codeHint || "",
                inputAttributes: {
                  maxlength: "6",
                  inputmode: "numeric",
                  pattern: "[0-9]*",
                  autocomplete: "one-time-code",
                  autofocus: "autofocus",
                  style: "text-align:center;letter-spacing:6px;font-size:24px;font-weight:bold;"
                },
                inputPlaceholder: "• • • • • •",
                showCancelButton: true,
                confirmButtonText: "Authorize Transfer",
                cancelButtonText: "Cancel",
                allowOutsideClick: false,
                inputValidator: function(value) {
                  var v = String(value || "").trim();
                  if (!v) return "Please enter the 6-digit verification code.";
                  if (!/^\d{6}$/.test(v)) return "The verification code must be exactly 6 numeric digits.";
                  return undefined;
                }
              }).then(function(swalRes) {
                if (!swalRes.isConfirmed) {
                  if (submitBtn) submitBtn.disabled = false;
                  return;
                }
                var enteredOtp = String(swalRes.value || "").trim();
                if (codeInput) codeInput.value = enteredOtp;
                doExecuteTransfer(enteredOtp);
              });
              return;
            }

            var promptMsg = "A 6-digit verification code has been dispatched for " + maskedEmail + " (valid for 15 mins)." +
              (codeHint ? "\n\nYour OTP Code: " + codeHint : "") +
              "\n\nEnter the 6-digit code to authorize this transfer:";
            var promptVal = window.prompt(promptMsg, codeHint || "");
            if (promptVal && /^\d{6}$/.test(String(promptVal).trim())) {
              var entered = String(promptVal).trim();
              if (codeInput) codeInput.value = entered;
              doExecuteTransfer(entered);
            } else {
              if (submitBtn) submitBtn.disabled = false;
            }
          } else {
            setTransferMsg("error", (res && res.error) ? String(res.error) : "Unable to generate verification code.");
            toast((res && res.error) ? String(res.error) : "Unable to generate verification code.", "error");
            if (submitBtn) submitBtn.disabled = false;
          }
        }).catch(function(err) {
          setTransferMsg("error", err && err.message ? String(err.message) : "Failed to send verification code.");
          toast(err && err.message ? String(err.message) : "Failed to send verification code.", "error");
          if (submitBtn) submitBtn.disabled = false;
        });
      }

      function initTransferModal(ctx) {
        var sidebarBtn = document.getElementById("sidebarLocalTransferBtn");
        var quickBtn = document.getElementById("quickTransferBtn");
        var closeBtn = document.getElementById("transferModalClose");
        var cancelBtn = document.getElementById("transferCancelBtn");
        var overlay = document.getElementById("transferModalOverlay");
        var submitBtn = document.getElementById("transferSubmitBtn");
        var lookup = document.getElementById("transferLookupValue");
        var lookupType = document.getElementById("transferLookupType");
        var amt = document.getElementById("transferAmountInput");
        var code = document.getElementById("transferCodeInput");
        [sidebarBtn, quickBtn].forEach(function(b) {
          if (b) b.addEventListener("click", function(e) {
            e.preventDefault();
            openTransferModal();
          });
        });
        if (closeBtn) closeBtn.addEventListener("click", closeTransferModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeTransferModal);
        if (overlay) {
          overlay.addEventListener("click", function(e) {
            if (e.target === overlay) closeTransferModal();
          });
        }
        document.addEventListener("keydown", function(e) {
          if (e.key === "Escape") closeTransferModal();
        });

        function scheduleLookup() {
          if (transferState.debounceTimer) clearTimeout(transferState.debounceTimer);
          transferState.debounceTimer = setTimeout(performRecipientLookup, 350);
        }
        if (lookup) lookup.addEventListener("input", scheduleLookup);
        if (lookup) lookup.addEventListener("blur", performRecipientLookup);
        if (lookupType) lookupType.addEventListener("change", performRecipientLookup);
        if (amt) amt.addEventListener("input", refreshTransferSubmitEnabled);
        if (code) code.addEventListener("input", refreshTransferSubmitEnabled);
        if (submitBtn) {
          submitBtn.addEventListener("click", function() {
            submitTransfer(ctx || {});
          });
        }
      }

      function bootI18nAndKyc() {
        var bootstrapFn =
          (typeof window.__vtBootstrapCustomerPage === "function") ? window.__vtBootstrapCustomerPage :
          (window.VT && window.VT.UI && typeof window.VT.UI.bootstrapCustomerPage === "function") ? window.VT.UI.bootstrapCustomerPage : null;
        if (!bootstrapFn) {
          setTimeout(bootI18nAndKyc, 80);
          return;
        }
        bootstrapFn({
          after: function(ctx) {

            if (window.console) {
              window.console.log(
                "[VT] Dashboard ready: language=" +
                (ctx && ctx.language) +
                ", kyc=" +
                (ctx && ctx.kycCompleted)
              );
            }

            // IMPORTANT:
            // KYC + profile picture onboarding handled exclusively during admin account creation.
            // No post-login prompts are shown to users.

            var me = (ctx && ctx.me) ? ctx.me : null;

            var info = me ?
              applyUserInfoToDashboard(me) :
              {
                currency: "USD",
                balance: 0
              };

            initTransferModal(info);
            fetchAndRenderTx(info);
          }
        });
      }

      function start() {
        try {
          var isDevBypass = window.location.pathname.indexOf("/_dev/") !== -1 ||
            (window.location.search || "").indexOf("kyc_reset=1") !== -1 ||
            (window.location.search || "").indexOf("vt=reset") !== -1;
          if (isDevBypass) {
            try {
              localStorage.removeItem("vt_kyc_perm_v1");
            } catch (_) {}
            try {
              sessionStorage.removeItem("vt_kyc_state_v1");
            } catch (_) {}
            try {
              localStorage.removeItem("vt_kyc_state_v1");
            } catch (_) {}
            try {
              localStorage.removeItem("demo_me");
            } catch (_) {}
            try {
              localStorage.removeItem("vt_me_v1");
            } catch (_) {}
            try {
              sessionStorage.removeItem("vt_session_v1");
            } catch (_) {}
          }
        } catch (_) {}

        function showDiagnostics() {
          try {
            if ((window.location.search || "").indexOf("vt_diag=1") === -1) return;
            var hasVT = typeof window.VT !== "undefined" && window.VT !== null;
            var hasUI = hasVT && typeof window.VT.UI !== "undefined" && window.VT.UI !== null;
            var hasBootstrap = hasUI && typeof window.VT.UI.bootstrapCustomerPage === "function";
            var _vtBootstrapRan = hasVT ? (window.VT._dbg1 || "N/A") : "N/A";
            try {
              var d = document.createElement("div");
              d.style.cssText = "position:fixed;right:10px;top:44px;background:#7c2d12;color:#fff;padding:10px 12px;font-size:12px;font-weight:700;z-index:2147483643;max-width:360px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.3);border:1px solid #fdba74;line-height:1.5;";
              d.innerHTML =
                "<strong>DIAG:</strong><br/>" +
                "window.VT = " + (hasVT ? "present" : "MISSING") + "<br/>" +
                "window.VT.UI = " + (hasUI ? "present" : "MISSING") + "<br/>" +
                "bootstrapCustomerPage = " + (hasBootstrap ? "function OK" : "MISSING/FN") + "<br/>" +
                "document.readyState = " + document.readyState + "<br/>" +
                "<small style='opacity:0.8'>banner loaded via dashboard.php start() diagnostics</small>";
              document.body.appendChild(d);
            } catch (_) {}
          } catch (_) {}
        }
        setTimeout(showDiagnostics, 1500);
        initSidebar();
        initLogout();
        try {
          window.__vt_toast = toast;
          window.__vt_fmtCurrency = fmtCurrency;
          window.__vt_applyUserInfoToDashboard = applyUserInfoToDashboard;
          window.__vt_renderTransactions = renderTransactions;
          window.__vt_renderActivityChart = renderActivityChart;
          window.__vt_initTransferModal = initTransferModal;
        } catch (__expErr) {
          try {
            console.error("Expose helpers err:", __expErr);
          } catch (_) {}
        }
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", bootI18nAndKyc);
        } else {
          bootI18nAndKyc();
        }
      }
      start();
    })();

    function applyKycGate(ctx) {
      try {
        document.body.style.overflow = "";
      } catch (_) {}
    }
  </script>
</body>

</html>