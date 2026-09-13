# DEBUG: swal-dark-square-mixed-i18n — Session [OPEN]

## User Bugs Reported
1. **BUG-A (Critical UI):** Transfer PIN dialog top-right still shows black opaque square (~150x150) after FR-2.2 PIN dark-circle removal was supposed to eliminate it. Screenshot 1 (PIN dialog "Autorización de Transferencia" - Spanish locale).
2. **BUG-B (i18n):** 120s Admin Hold Countdown banner within processing Swal has MIXED locale: top spinner line = Spanish (correct ✅), but the hold notice + countdown sub-banner below = hardcoded English (incorrect ❌). Screenshot 2.

## Hypotheses
### Bug-A
- A1: `.swal2-image` CSS child hidden OK, but `.swal2-image-wrapper` / `.swal2-image-container` PARENT has dark min-height.
- A2: `dashboard.php` code path fires Swal WITHOUT calling `injectResponsiveTransferStyles()` (which is defined in auth-session.js only), so CSS rule never injected.
- A3: Black block is actually `.swal2-close` dark theme OR an overlay element, not swal2-image.
### Bug-B
- B1: Admin-hold banner html inserted as raw EN literal (added in prior admin-delay-delete spec) with no T('xfer_*') call + no corresponding DICT keys.
- B2: setInterval countdown tick callback `innerHTML = "Admin account security hold..."` re-renders EN every second.
- B3: User changed language via dropdown AFTER Swal opened; `setLang()` rescans document but swal2-popup dynamically created nodes are re-rendered internally by Swal wiping data-i18n.

## Evidence Plan (Step 2: Instrument)
- Grep locate ALL sites of (a) `swal2-image` / `swal2-image-wrapper` CSS selectors; (b) hardcoded EN strings "Admin account security hold", "This hold is applied"; (c) Swal.fire/html locations (dashboard.php vs auth-session.js dual sites per prior delay spec).
- Render test: locate Swal.fire calls in dashboard.php processing spinner; check if `injectResponsiveTransferStyles()` exists there.
- Locate setInterval callbacks that output hold countdown every 1s.

## Status
- [x] A1 Evidence collected — SweetAlert2 `.swal2-image-wrapper/.swal2-image-container` parent carries opaque dark default bg & min-height; child hidden doesn't collapse parent.
- [x] A2 Evidence collected — dashboard.php transfer submitter never loaded `injectResponsiveTransferStyles`; CSS never applied. Confirmed grep 0 matches.
- [x] A3 Evidence collected — close button bg transparent after fix, not the culprit.
- [x] B1 Evidence collected — EN-only banner html template in dashboard.php:3056 + auth-session.js:2120; no DICT keys existed for the hold text.
- [x] B2 Rejected — tick interval only updates span.textContent not whole banner.
- [x] B3 Rejected — issue existed even at initial Swal render before any lang switch.
- [x] Root cause confirmed A/B — A1+A2 combined. B1 — missing i18n keys + no T() wrapping.
- [x] Fix implemented (3 files):
  - customer-i18n.js: 2 keys `xfer_adminHoldTitle` + `xfer_adminHoldSub` added to all 15 DICT langs.
  - auth-session.js L1258: Extended hide selector to `.swal2-image-container` + `.swal2-image-wrapper`; added `--swal2-image-size:0`; opacity/clip-path defense.
  - auth-session.js L2120: holdBanner rewritten to `${T('xfer_adminHoldTitle')}` + `${T('xfer_adminHoldSub')}` i18n.
  - dashboard.php L3058: IIFE injects `vt-dash-swal-image-hide` CSS BEFORE `Swal.fire` (fixes missing CSS path A2 + parent wrapper A1).
  - dashboard.php L3056: holdBanner rewritten with runtime `VT.I18N.t(getAppliedLang(), xfer_adminHold*)` lookups.
- [ ] Post-fix verification logs compared
- [ ] User confirms → [CLOSED]
