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
- [ ] A1 Evidence collected
- [ ] A2 Evidence collected
- [ ] A3 Evidence collected
- [ ] B1 Evidence collected
- [ ] B2 Evidence collected
- [ ] B3 Evidence collected
- [ ] Root cause confirmed for A/B
- [ ] Fix implemented
- [ ] Post-fix verification logs compared
- [ ] User confirms → [CLOSED]
