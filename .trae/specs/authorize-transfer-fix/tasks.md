# Authorize Transfer Bug Fix - Implementation Plan

## Task 1: Strengthen OTP Dialog Event Handler Binding & Add Fallback Promise Resolver
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - In the `showCombinedPinAndOtpDialog` closure in `auth-session.js`, fix the `delegated` flag race condition by resetting it **before** calling `Swal.fire()` for a phase transition, not inside `willClose` (which fires at an unpredictable time relative to the new popup's `didOpen`).
  - Add a Swal popup lifecycle watcher: after any `Swal.fire()` call, set a polling guard or use `swal-will-close` / global event to ensure that if the popup DOM is removed without resolving via Cancel or Confirm Final, the outer Promise is resolved with `null` (cancellation) after a short timeout. Implement this as a `popupEl` MutationObserver or a periodic check on `Swal.isVisible()`.
  - Wrap the body of every async phase handler (`onSendOtp`, `onAuthorize`, `onConfirmFinal`) in try/catch blocks so that ANY thrown exception is caught and surfaced as an inline error banner via `openConfirmOrPinOtp({ sendError/integrityError })` instead of crashing the handler silently.
  - Modify the `handleConfirmClick` dispatcher so that `stopImmediatePropagation()` and `preventDefault()` are called FIRST, before any other work.
  - Ensure the delegated click listener on the popup element is registered on EVERY `didOpen` by introducing a `__vtHandlersBound` sentinel property on the popup DOM element itself (instead of the shared closure variable) to track whether this specific popup instance's handlers were already bound.
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-7
- **Test Requirements**:
  - `rule` TR-1.1: With a freshly opened OTP-phase popup, click the "Authorize Transfer" button. Result: confirm-phase popup is visible (`.swal2-title` contains "Confirm Transfer"), popup was NOT dismissed, previous popup DOM is gone.
  - `rule` TR-1.2: Programmatically call `Swal.close()` while dialog Promise is pending (before Cancel or Confirm Final). Result: outer Promise resolves with `null` within 100ms (instrument via setTimeout assertion).
  - `rule` TR-1.3: In Phase 2 (OTP), set `otpVal` to a non-6-digit string and click Authorize Transfer. Result: same popup instance remains open and displays a red inline error banner div (`.vt-pin-otp-wrap > div[style*="background:#fef2f2"]` is present).
  - `rubric` TR-1.4: Handler rebound reliability; scale 1-5; anchors 1 = handlers frequently lost after transition; 3 = occasionally require a second click; 5 = every button click after every phase transition fires correct handler on first click; threshold >= 4; evidence: manual test clicking buttons across 10 full phase cycles with no misfires.

## Task 2: Add Top-Level Try/Catch & Batch Commit Safety to `/api/customer/transfer` Endpoint
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - In `server/index.js`, wrap the entire body of `POST /api/customer/transfer` (line 1705) in a `try/catch` block matching the pattern used by `POST /api/customer/transfer/request-otp` (line 1473). Use `normalizeFirebaseAdminError(e, "Unable to complete the transfer.")` for catch.
  - Add explicit error handling around the `await batch.commit()` call. If batch.commit() throws, return a specific 500 error message: `"Transfer was not processed — no funds deducted. Please try again or contact support if the issue persists."` Do NOT proceed to write transaction records if batch commit fails.
  - After batch.commit() succeeds, do NOT wrap writeTransaction calls in `.catch(() => null)` that silently swallows. Instead, let writeTransaction errors propagate (they will be caught by the new top-level try/catch AND we've already mutated balances, so the error message should read `"Transfer completed but transaction history could not be recorded. Please check your balance to confirm funds were sent."`).
  - Apply identical fixes to the legacy alias endpoint `POST /api/customer/transfer/execute` (line 1931) which has the same structural defects.
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `rule` TR-2.1: Send a deliberately malformed transfer request (missing recipient). Result: HTTP 400 response with JSON body containing `error` field.
  - `rule` TR-2.2: Simulate a Firestore batch.commit() failure (by disconnecting DB or mocking in test). Result: HTTP 500 with JSON error string explicitly containing "no funds deducted"; Firestore reads verify no balance changes occurred.
  - `rule` TR-2.3: Send a valid transfer request with correct credentials. Result: HTTP 200 with `{ ok: true, reference, newBalance, newAvailableBalance }`; Firestore queries verify sender balance decreased by amount, recipient increased by amount, both `balance` and `availableBalance` fields adjusted, OTP zeroed.
  - `rubric` TR-2.4: Server-side error handling completeness; scale 1-5; anchors 1 = multiple unguarded throw sites; 3 = top-level guard present but some paths leak unhandled; 5 = every async await site inside endpoint either has own guard or is covered by top-level; threshold >= 4; evidence: line-by-line code review of both transfer endpoints.

## Task 3: End-to-End Workflow Validation (Manual + Automated)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - Run existing E2E test script `_e2e_transfer_otp_flow.js` if available; adapt or create a validation script that:
    1. Logs in a test sender account (via session cookie or mintDevCookie helper).
    2. Calls `/api/customer/transfer/request-otp` with a valid transfer PIN and transfer context, confirms 200 OK with masked email.
    3. Reads the generated OTP from the sender's Firestore `security.transferOtp` by decrypting it using `transferOtp.decryptAndVerifyOtp` with the actual raw OTP (or from audit logs for test).
    4. Calls `/api/customer/transfer` with the OTP + PIN, confirms `{ ok: true }` response.
    5. Queries Firestore to verify sender balance decreased by exactly `amount`, recipient increased by exactly `amount`, matching transaction records exist.
  - Perform a browser-level manual QA on `/customer/international.php`:
    1. Load the page, fill in valid recipient fields with a test account.
    2. Click "Proceed" to trigger initial confirm.
    3. In the PIN phase, enter correct PIN, click "Send Verification Code", wait for green success banner.
    4. In OTP phase, enter the 6-digit code from the email audit log.
    5. Click "Authorize Transfer" — verify popup DOES NOT dismiss, transitions to "Confirm Transfer" phase with all values displayed.
    6. Click "Confirm Transfer" — verify processing overlay then success screen with updated balance and reference.
  - Fix any runtime issues that surface during validation (these are almost certainly related to the two core bugs being fixed).
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `rule` TR-3.1: E2E API script completes without errors: sender `balanceBefore - balanceAfter == amount` (within 0.001 tolerance); recipient `balanceAfter - balanceBefore == amount`; both transaction records have same reference; TRANSFER_OUT amount is -A; TRANSFER_IN amount is +A; response `ok === true`.
  - `rule` TR-3.2: Browser QA step 5 — after clicking Authorize Transfer, DOM has exactly one Swal popup and its title element's textContent includes the substring "Confirm Transfer" (not "Authorize Transfer", not empty); `body` does NOT contain the prior-phase OTP input element (`#vt-otp-input`) unless in an error state.
  - `rule` TR-3.3: After full workflow completes, customer dashboard (reload `/customer/dashboard.php`) shows sender balance reduced by amount, and Recent Transactions section contains a debit row for the transfer with the matching reference number.
  - `rubric` TR-3.4: Overall workflow smoothness; scale 1-5; anchors 1 = multiple manual retries or workarounds needed; 3 = works but small UI glitches (non-blocking); 5 = single continuous flow from form submit to success screen with zero restart needed; threshold >= 4; evidence: screen recording or detailed step-by-step QA log.
