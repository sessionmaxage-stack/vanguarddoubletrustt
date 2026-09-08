# DEBUG SESSION: otp-confirm-render
Status: [OPEN]
Created: 2026-09-07
Bug: After successful OTP confirmation, the "Confirm Transfer" section fails to display.

---

## 1. HYPOTHESES (Falsifiable)

### H1 — Swal.fire() promise resolve/reject ordering with delegated handlers
The `openConfirmOrPinOtp` function calls `Swal.fire()` during the confirm-phase transition
while the previous OTP-phase Swal.fire() promise still has a pending resolve. When delegated
event handlers (`bindDelegatedHandlers`) fire for the new Swal instance, the `delegated=true`
guard may prevent re-binding, and the new popup's confirm/cancel buttons never receive handlers.

**Falsification checkpoint**: Log `delegated` flag, popup element reference, and
confirm button `data-field` attributes every time `bindDelegatedHandlers` and
`openConfirmOrPinOtp` are called.

### H2 — Phase variable not propagated correctly between onAuthorize → openConfirmOrPinOtp
`onAuthorize()` sets `phase = "confirm"` then calls `openConfirmOrPinOtp()`, but the
Swal.fire call inside `openConfirmOrPinOtp` relies on the outer `phase` closure variable.
A stale lexical closure, race condition, or early return in `openConfirmOrPinOtp` can cause
the wrong branch (pin/otp rendering) to execute.

**Falsification checkpoint**: Log `phase` value at start of `onAuthorize()`,
end of `onAuthorize()` (right before `openConfirmOrPinOtp` call), and as the FIRST statement
inside `openConfirmOrPinOtp` (before any conditional). Also log which `Swal.fire()` branch
is taken.

### H3 — OTP regex validation silently fails or short-circuits
`if (!/^\d{6}$/.test(otpVal))` returns and calls `openDialog(...)` with a sendError message,
but because `openConfirmOrPinOtp` now replaces `openDialog`, there may be a path where
the `onAuthorize` flow returns silently without transitioning. Also `String(otpInput.value || "")`
may produce unexpected whitespace.

**Falsification checkpoint**: Log `otpVal`, `otpVal.length`, regex test result,
and which branch (error-return vs confirm-phase) is taken in `onAuthorize`.

### H4 — willClose lifecycle + delegated=false reset causes handler detachment
`Swal.fire({ ... willClose: () => { delegated = false; } })` — when `openConfirmOrPinOtp`
is called from `onAuthorize`, the previous OTP-phase Swal is replaced. SweetAlert2 may fire
`willClose` of the old dialog AFTER the new dialog's `didOpen` fires, resetting
`delegated = false` after handlers were bound, but no re-bind occurs in the new Swal because
`bindDelegatedHandlers` has a `if (delegated || !popupEl) return;` early exit.

Net effect: confirm-phase popup renders but has ZERO click/keyboard handlers attached
(bindDelegatedHandlers bailed due to delegated still being true from old popup OR
willClose reset it to false after binding and bind is never re-invoked).

**Falsification checkpoint**: Log willClose invocations with timestamp, delegated value
before/after, plus bindDelegatedHandlers entry/exit + reason for early return.

### H5 — CSS/JS conflict: hidden overflow or z-index masks the confirm panel
SweetAlert2 computes its own content dimensions. The `.vt-confirm-transfer-wrap` (max-width 460px)
vs the original `.vt-pin-otp-wrap` (max-width 420px) may cause a layout shift where the panel
renders but `swal2-container` / `swal2-html-container` cuts off the content with overflow:hidden,
OR SweetAlert's confirm button element, though present, ends up outside the clickable viewport
area.

**Falsification checkpoint**: After confirm-phase Swal.fire(), log computed dimensions
of the container, confirm button visibility, and scroll positions.

---

## 2. INSTRUMENTATION
(Instrumentation log calls to Debug Server will be added here.)

---

## 3. EVIDENCE
(Runtime log evidence will be recorded here.)

---

## 4. ROOT CAUSE
(TBD after evidence collection)

---

## 5. FIX
(TBD after root cause confirmed)

---

## 6. POST-FIX VERIFICATION
(TBD after fix is deployed)
