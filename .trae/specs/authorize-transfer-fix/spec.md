# Authorize Transfer Bug Fix - Product Requirements Document

## Overview
- **Summary**: Fix two critical bugs in the VanguardDoubleTrust customer transfer flow: (1) OTP popup immediately disappears when clicking "Authorize Transfer" button, preventing completion of the authorization workflow; (2) funds are not correctly debited from the sender's account and credited to the recipient's account when a transfer is initiated.
- **Purpose**: Restore end-to-end functionality of the internal account transfer system so customers can securely send funds between accounts using PIN + OTP combined authentication.
- **Target Users**: Authenticated customers with ACTIVE accounts who initiate internal transfers via `/customer/international.php`.

## Goals
- OTP authorization dialog (SweetAlert2 popup) remains stable and functional across all three phases: PIN entry → OTP entry → Confirm transfer.
- Clicking "Authorize Transfer" button (Phase 2 confirm button) reliably transitions the dialog to the confirm phase and never closes the popup unexpectedly.
- Upon successful PIN + OTP validation, server-side balance mutation atomically debits the sender and credits the recipient with full audit trail.
- All error conditions produce meaningful, actionable error messages; no silent failures.

## Non-Goals
- Do NOT modify the customer registration, login, 2FA, KYC, profile picture, or admin account management flows.
- Do NOT modify any PHP template rendering except as strictly necessary to surface transfer error feedback (none expected).
- Do NOT change the OTP generation, encryption, rate-limiting, or email delivery subsystems.
- Do NOT alter the PIN validation algorithm or hash format.
- Do NOT modify unrelated pages (dashboard, statement, stocks, card, profile, settings).

## Background & Context
The transfer authorization uses a three-phase SweetAlert2 (Swal) dialog managed in `customer/assets/js/auth-session.js`. Each phase transition calls a fresh `Swal.fire()` per project conventions. The "Authorize Transfer" button is the Phase 2 (otp phase) confirm button that should transition the dialog to Phase 3 (confirm phase) via a new Swal.fire call. The dialog Promise is resolved only after Phase 3 confirm ("Confirm Transfer" button) with the combined `{ transferPin, otp }` bundle.

On the server, the `POST /api/customer/transfer` handler performs ten pre-validation checks, then executes a Firestore batch write to adjust both `balance` and `availableBalance` fields on sender and recipient documents, followed by two transaction history records.

Root-cause hypotheses from initial code inspection:
1. **Dialog disappearance**: The delegated event handler gating flag (`delegated` closure variable) combined with race conditions between the old popup's `willClose` and the new popup's `didOpen` can cause handlers not to be rebound after phase transitions. Additionally, async phase handlers (`onAuthorize`, `onConfirmFinal`) lack try/catch wrappers, so any thrown exception silently aborts the transition — if SweetAlert2's default close behavior fires before our handlers, the popup closes. The Swal Promise also has no fallback resolver if the dialog is closed by an unhandled path.
2. **Funds not sent**: `POST /api/customer/transfer` (line 1705 in `server/index.js`) has NO top-level try/catch wrapper. Any Firestore batch error, runtime exception, or DB connectivity failure is thrown as an unhandled promise rejection, leaving the client without a response and the transaction in an undefined state. Additionally, `writeTransaction()` calls are wrapped in `.catch(() => null)` which silently swallows transaction-history errors, but the critical atomic debit/credit happens before that and is also unguarded.

## Functional Requirements
- **FR-1 OTP Popup Stability**: When a user clicks the "Authorize Transfer" confirm button in Phase 2 (OTP entry), the Swal dialog MUST NOT close. It MUST transition to Phase 3 (Confirm Transfer) screen via a fresh Swal.fire call.
- **FR-2 Popup Resilience**: If SweetAlert2's dialog is closed by any path other than explicit user Cancel or Phase 3 Confirm, the outer Promise MUST be resolved with `null` (cancellation) within 100ms instead of hanging indefinitely.
- **FR-3 Handler Binding Guarantee**: After every phase transition (Swal.fire), ALL button click capture handlers, delegated listeners, and keydown interceptors MUST be bound exactly once, regardless of `willClose`/`didOpen` firing order.
- **FR-4 Error Surfacability in Phase Handlers**: Every async phase handler (`onSendOtp`, `onAuthorize`, `onConfirmFinal`) MUST wrap its body in a try/catch and display an inline Swal error banner on failure instead of silently crashing.
- **FR-5 Transfer Endpoint Exception Safety**: `POST /api/customer/transfer` MUST be wrapped in a top-level try/catch that normalizes all errors (Firestore, runtime, validation) via the existing `normalizeFirebaseAdminError` helper and returns a JSON `{ error }` response with appropriate HTTP status.
- **FR-6 Transfer Atomicity Visibility**: The Firestore batch commit (debit + credit + OTP invalidation) MUST be explicitly awaited and its result verified. If batch commit fails, the endpoint MUST return a 500 error with a "Transfer was not processed — no funds deducted" message.
- **FR-7 Consistent Error Messaging**: If the transfer endpoint returns an error, the client-side catch block in `processTransfer()` MUST surface that exact error string via Swal.error — no generic fallback that contradicts the actual outcome.

## Non-Functional Requirements
- **NFR-1 Strict Scope**: Changes are limited to the following files: `customer/assets/js/auth-session.js` (only the `showCombinedPinAndOtpDialog` closure and `processTransfer` function) and `server/index.js` (only the `POST /api/customer/transfer` route handler, plus the legacy alias at `/api/customer/transfer/execute` if it has the same gap). No other files are modified.
- **NFR-2 Backward Compatibility**: The fixed transfer flow must accept the same request payloads, return the same success response shape, and preserve all existing security checks (PIN hash match, OTP decrypt+TTL, transfer-context binding, balance sufficiency, currency match, account status checks, self-transfer prevention).
- **NFR-3 No Performance Regression**: Phase transitions must remain <50ms client-side; server endpoint P99 latency must not increase by more than 5ms.
- **NFR-4 Security Invariants**: Captured PIN and OTP values must never be written to localStorage, console.log, or error messages. Existing tamper-protection (7-layer integrity check on confirm body) remains fully intact.

## Constraints
- **Technical**: Must use SweetAlert2 v11 fresh `Swal.fire` calls for phase transitions (not `Swal.update`). Must use capture-phase event listeners with `stopImmediatePropagation()` for button handler override (per project_memory conventions). Must use existing `normalizeFirebaseAdminError` helper for server errors. Must use Firestore batch writes for balance changes.
- **Business**: Transfers require combined PIN + transaction-bound Email OTP in a single dialog flow (per project_memory). Admin-generated accounts are permanently immutable (no changes to this guard). OTPs must remain CSPRNG-based, single-use, context-bound, and 15-minute TTL.
- **Dependencies**: Existing dependencies only (SweetAlert2 11, Express, firebase-admin, nodemailer, crypto module). No new packages.

## Assumptions
- Customer is already authenticated (valid session cookie + `requireAuth` middleware passes).
- Sender and recipient accounts both exist in Firestore `users` collection with valid `account.accountNumber` and `account.status === "ACTIVE"`.
- Sender has sufficient balance to cover the transfer amount.
- Environment variables for Firestore and SMTP are correctly configured (per existing project startup SMTP health check).
- The legacy `/api/customer/transfer/execute` alias has the same missing-try/catch bug and should receive the same fix.

## Acceptance Criteria

### AC-1: Authorize Transfer button does not close the OTP popup
- **Type**: `rule`
- **Given**: User is on Phase 2 of the authorization dialog (OTP entry — dialog title "Authorize Transfer", confirm button text "Authorize Transfer"). User has entered a valid 6-digit OTP.
- **When**: User clicks the "Authorize Transfer" confirm button.
- **Then**: (a) The dialog does NOT dismiss or disappear; (b) The dialog transitions smoothly to Phase 3 ("Confirm Transfer" title, confirm button text "Confirm Transfer", integrity-sealed review panel); (c) The user-entered OTP value is preserved in closure as `confirmedOtp` and is not re-requested.
- **Pass Condition**: After clicking "Authorize Transfer", the confirm-phase Swal popup is visible (`.swal2-popup` in DOM with title containing "Confirm Transfer") and no prior-phase popup element remains. If OTP is malformed, an inline error banner is shown in the SAME popup (no dismissal).
- **Evidence**: Browser automation or manual screenshot evidence showing Phase 2 → Phase 3 transition. localStorage debug trace `dbg_otp_confirm__*` entries showing `onAuthorize__entry` → `onAuthorize__phaseSetBeforeOpen` → `openConfirmOrPinOtp__confirmBranch` in correct causal order with no `willClose` reset occurring after confirm-phase `didOpen`.

### AC-2: Dialog Promise is resolved on all close paths
- **Type**: `rule`
- **Given**: `showCombinedPinAndOtpDialog()` Promise is pending.
- **When**: The Swal popup is closed by ANY mechanism (cancel button, close [X] button, external `Swal.close()` call, SweetAlert2 internal fallback).
- **Then**: The Promise resolves within 100ms with either `null` (cancellation) or a valid `{ transferPin, otp }` object. Promise never hangs.
- **Pass Condition**: After any close action, `await showCombinedPinAndOtpDialog()` returns a value (non-pending) within the timeout.
- **Evidence**: Instrumented test that triggers various close paths and logs Promise resolution timing.

### AC-3: All handlers rebound after phase transition (no early-return due to stale delegated flag)
- **Type**: `rule`
- **Given**: Phase N Swal popup is open with handlers bound (`delegated = true`).
- **When**: A phase transition calls Swal.fire for Phase N+1.
- **Then**: The new popup's `.swal2-confirm` element has exactly one capture-phase click listener with `stopImmediatePropagation` override behavior. Clicking it triggers the appropriate phase handler.
- **Pass Condition**: After phase transition, clicking confirm button in a freshly opened phase executes the correct phase dispatch and does NOT trigger SweetAlert2 default dismiss.
- **Evidence**: DOM inspection after each transition shows confirm button click produces the expected phase action (onSendOtp / onAuthorize / onConfirmFinal), never a raw close.

### AC-4: Transfer endpoint catches all exceptions and returns valid JSON error
- **Type**: `rule`
- **Given**: `POST /api/customer/transfer` receives a request.
- **When**: Any exception occurs during processing (e.g., Firestore unavailable, batch write fails, document not found, runtime TypeError).
- **Then**: (a) The endpoint returns a proper HTTP response (status 4xx or 5xx) with JSON body `{ error: "..." }` within 30s; (b) No unhandled promise rejection is logged; (c) If the exception occurred before `batch.commit()`, NO balance changes are applied. If after, balance changes may have occurred but response still documents final state.
- **Pass Condition**: Injecting a simulated batch commit failure (mock) returns HTTP 500 with JSON `{ error }` containing "Transfer was not processed — no funds deducted".
- **Evidence**: Server logs showing caught exception + normalized response. curl/Postman response showing valid JSON error on a deliberately broken request.

### AC-5: Transfer atomically debits sender and credits recipient on success
- **Type**: `rule`
- **Given**: Valid request with correct PIN+OTP, sender balance Bs, recipient balance Br, transfer amount A.
- **When**: `POST /api/customer/transfer` responds with `{ ok: true }`.
- **Then**: (a) Sender's `account.balance` is Bs - A (to 2 decimal places); (b) Sender's `account.availableBalance` is also reduced by A; (c) Recipient's `account.balance` is Br + A; (d) Recipient's `account.availableBalance` is increased by A; (e) OTP record is zeroed (verified:true, encryptedData:null); (f) Two transaction records (TRANSFER_OUT for sender, TRANSFER_IN for recipient) written with matching reference id.
- **Pass Condition**: Firestore document reads after success show all four balance fields updated correctly AND both transaction records exist with matching `reference` field.
- **Evidence**: Firestore console screenshot or admin SDK query output verifying before/after deltas on both user documents plus transaction collection entries.

### AC-6: End-to-end transfer completes without errors
- **Type**: `rule`
- **Given**: Two test accounts (sender, recipient) with known credentials, sufficient balance.
- **When**: Full workflow is executed: submit transfer form → initial Swal confirm → enter PIN → Send OTP → receive email OTP → enter OTP → Authorize Transfer → Confirm Transfer.
- **Then**: (a) All dialog phases display correctly; (b) Success overlay shown with reference number and updated balance; (c) Sender balance reduced in UI; (d) Recipient can log in and see increased balance + TRANSFER_IN transaction.
- **Pass Condition**: The entire workflow completes from form submit to success overlay with no dialog dismissals, no JavaScript errors (console), no 5xx HTTP responses.
- **Evidence**: HAR file, browser console log screenshot, and Firestore query results showing complete transfer trail.

### AC-7: Handler Robustness (no silent crashes on edge cases)
- **Type**: `rubric`
- **Dimension**: Dialog robustness under DOM/input edge cases
- **Scale**: 1-5
- **Anchors**: 1 = Phase handler crashes frequently, popup disappears on >50% of clicks; 3 = Occasional edge-case crashes, popup recovers but user must restart; 5 = All async phase handlers wrapped in try/catch, every edge case (null popup, missing input, network error) shows an inline error banner, popup NEVER disappears unless user explicitly Cancels or successfully confirms.
- **Pass Threshold**: >= 4
- **Evidence**: Code review of `onSendOtp`, `onAuthorize`, `onConfirmFinal` showing complete try/catch wrappers, with explicit catch paths that call `openConfirmOrPinOtp({ sendError/integrityError })`. Manual QA test: rapidly click buttons, modify DOM via devtools during flow, simulate network offline — popup never unexpectedly closes.

## Open Questions
None. All ambiguities resolved by code inspection and project_memory constraints.
