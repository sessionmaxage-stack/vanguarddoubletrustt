# SPEC.md — Admin Payment Delay + Admin Delete Old Accounts Button
## Problem (2 Features, Strict Scope)
The VanguardDoubleTrust webapp needs two isolated feature additions:
### Feature 1: 2-Minute Delay + Leading Spinner for Admin-Created Accounts During Transfers
Admin-generated accounts (accounts created via the admin dashboard) require a precisely 2-minute hold on every outbound payment transaction, preceded by a user-facing loading spinner that must remain visible for the entire 120 seconds. Self-registered (non-admin-created) accounts must never see this delay or spinner. The delay must:
- Activate **exclusively** for accounts where the "admin-created" origin is verified from the canonical source-of-truth flags in Firestore/localUsers.
- Apply to **ALL** transfer processes (both POST /api/customer/transfer and POST /api/customer/transfer/execute).
- Display a leading loading spinner/modal overlay **before** the 2-minute timer begins (spinner must show for the full duration, no premature dismissal).
- Not disrupt or abort the transaction flow — after exactly 120,000 ms, the existing transfer logic must proceed unchanged.
### Feature 2: Admin Interface "Delete Old Accounts" Permission-Gated Button
The admin dashboard (admin/dashboard.html rendered via admin-session.js) must expose a dedicated, permission-gated delete action that:
- Is only visible/clickable to **authenticated admin users** who pass requireAdminAuth (same guard as /api/admin/users).
- Uses a server-side confirm step (client confirmation dialog) to prevent accidental invocations.
- When triggered for selected OLD user accounts (self-registered OR admin-created that are explicitly marked old), executes a **PERMANENT hard delete workflow** that fully clears:
  1. Firebase Auth login record (auth.deleteUser)
  2. Firestore `users/{uid}` main document
  3. Sub-collection `users/{uid}/transactions` (all docs)
  4. Top-level `transactions` collection documents where uid matches
  5. Local JSON mirrors (`localUsers` + `localTransactions` files)
- Complies with existing data retention policies (already present — per prior DELETE /api/admin/users/:uid behavior, 403 is returned only for a subset of protected account types — these MUST be preserved and respected).
### Feature 3: Strict Scope (Requirement 3 from user spec)
No code changes permitted outside Feature 1 + Feature 2 areas. Non-goals:
- NOT adding any new auth/login middleware.
- NOT touching any customer KYC/onboarding/PIN-change flows.
- NOT modifying register.php, login.php, myprofile.php.
- NOT adding new npm dependencies.
- NOT deleting admin accounts (only customer accounts).
- NOT adding new Firestore collection schemas / new top-level collections.
## Users & Goals
| Role | Goals |
|---|---|
| Authenticated Admin | Create accounts → accounts get admin-created flag → those accounts experience 2-min payment delays (visible to admin testing/QA too, as admin accounts that submit transfers are admin-generated on creation too if created via admin panel). Actually: admin users are NOT customers, only customer accounts experience transfers. So: admin creates a customer account (customer A) → customer A's transfers are held 2 min. |
| Admin User (Feature 2) | Click Delete button on OLD selected customer accounts → confirm → account + txs are purged from Firestore/Auth/Local JSON. |
| Self-registered Customer | Must NEVER see the 2-minute delay. Transfer proceeds immediately without spinner (as it did before this feature). |
## Functional Requirements (FR)
### Feature 1 — Admin-Account Payment Delay
- **FR-1.1**: Server introduces a Promise-based delay of EXACTLY 120,000 ms (± 50 ms tolerance) inside both transfer route handlers AFTER OTP guard + transfer PIN validation but BEFORE any Firestore balance mutation (batch.commit()).
- **FR-1.2**: Delay conditional: ONLY trigger when `isAdminGeneratedAccount(userData)` returns `true` for the authenticated sender's fresh Firestore document (not cached). Self-registered accounts skip the delay entirely — zero ms wait.
- **FR-1.3**: A new top-level key `isAdminCreatedAccount: true/false` is exposed in the GET /api/me response so the frontend can decide to show/hide the delay spinner WITHOUT relying on DOM heuristics. For self-registered customers, value MUST be `false`.
- **FR-1.4**: In the SweetAlert2 processing modal (shown during fetch("/api/customer/transfer")) when sender is admin-created account: the frontend displays a prominent countdown banner "Admin account security hold — processing in X:XX…" alongside the spinner and continuously updates remaining seconds. The spinner must not dismiss until: 120,000 ms have elapsed on the frontend timer AND the HTTP response has arrived (whichever is later — ensures spinner displays for the ENTIRE delay window even if backend finishes but network still pending).
- **FR-1.5**: Delay cancellation (e.g., request abort) must be handled gracefully: if user closes tab during delay, no side effects occur.
- **FR-1.6**: The dashboard.php standalone transfer flow also honors this rule — uses the same /api/me flag to show countdown spinner during the 2-minute window.
### Feature 2 — Admin Delete Old Accounts Button
- **FR-2.1**: For every customer row in the admin dashboard users table, the "Delete" button (currently disabled for all accounts with data-action="delete") is:
  - ENABLED + styled normally (grayed out no longer) ONLY when the account meets the OLD criterion: account `createdAt` timestamp is ≥ 30 days in the past OR account.status ∈ {CLOSED, EXPIRED, SUSPENDED, BLOCKED}. This definition of "old" is scope-locked by this spec.
  - PERMANENTLY DISABLED for accounts that don't meet old criterion.
- **FR-2.2**: Clicking an enabled Delete button opens a native confirm() dialog with verbatim text:
  ```
  PERMANENTLY DELETE THIS OLD CUSTOMER ACCOUNT?

  This will permanently erase:
  • Customer profile, KYC data, credentials, and contact information
  • Firebase login record (prevents future sign-ins)
  • ALL transactions (local + Firestore sub-collection + top-level global transactions)
  • Local JSON mirror data

  Account UID: <uid>
  Account name: <full name>
  Created: <date string>
  Status: <status>

  This action CANNOT be undone.

  Type the exact word "DELETE" into the prompt field below to confirm.
  ```
  The confirm uses window.prompt() to capture a typed confirmation string matching the literal string `DELETE` (case-sensitive). If user cancels or types the wrong string → abort delete silently (soft error toast).
- **FR-2.3**: After typed confirmation, the client calls `DELETE /api/admin/users/:uid` with admin-signed cookie. Response 2xx → reload users table + success toast. 4xx → show exact error from server as toast.
- **FR-2.4**: DELETE /api/admin/users/:uid existing endpoint (L2696 server/index.js) currently returns **403 Forbidden** `Admin-generated accounts are permanently locked` if `isAdminGeneratedAccount(targetUser)` is true. This lock MUST be **PRESERVED and NOT WEAKENED**. Therefore the delete button's "ENABLED + old" criterion also requires that `isAdminGeneratedAccount` is FALSE for the row — admin-generated accounts are never deletable via this button regardless of age. Server guards are authoritative; client gating is UX-only.
- **FR-2.5**: Compliance with existing data retention policies: the existing hard-delete cascade (auth user → users/{uid}/transactions subcollection → transactions.where(uid==) → user doc → localUsers → localTxs) already satisfies GDPR-style data erasure requirements. No changes required to the cascade logic, only the button availability.
## Non-Functional Requirements (NFR)
- **NFR-1**: Zero npm / package.json edits.
- **NFR-2**: Strict Scope Allowlist — only 5 source files may be modified:
  1. `server/index.js` — add delay logic + isAdminCreatedAccount to /api/me response.
  2. `customer/assets/js/auth-session.js` — add countdown spinner only for admin-created accounts during transfers.
  3. `customer/dashboard.php` — standalone transfer flow: same countdown spinner rule.
  4. `admin/assets/js/admin-session.js` — Delete button: enable only for old, non-admin-generated accounts; add typed-confirm prompt; wiring to DELETE endpoint.
  5. `.trae/specs/admin-delay-delete/*` (spec/tasks/review artifacts).
  NO other files may be touched.
- **NFR-3**: Delay precision — backend must use `await new Promise(res => setTimeout(res, 120000))` — no setInterval drift.
- **NFR-4**: No new Firestore writes / schema changes — isAdminGeneratedAccount is DERIVED from existing flags (not stored).
- **NFR-5**: Idempotent button wiring — event delegation already present (tableBody.addEventListener('click')); reuse it — NO duplicate listeners.
- **NFR-6**: All 5 modified files pass `node --check` (JS) / PHP lint check unavailable — only balanced-brace visual verification for dashboard.php.
- **NFR-7**: Backward compatibility: existing flows for self-registered accounts (transfer speed / spinner behavior) must be IDENTICAL to prior state when isAdminCreatedAccount === false (only difference: a new boolean key isAdminCreatedAccount:false added to /api/me JSON, ignored by non-patched callers).
## Constraints, Dependencies, Assumptions
- **CONSTRAINT-1**: Backend delay is placed INSIDE the Express route handlers after auth middleware AND after OTP guard but BEFORE any batch.commit() or balance mutation. This preserves atomicity — if the server crashes mid-delay, no money was moved.
- **CONSTRAINT-2**: 30-day "old" threshold calculated client-side from the row's `createdAt` ISO string already present in the GET /api/admin/users response (L1867-1910 server/index.js — createdAt already included). If createdAt missing (edge case) → treat as NOT old → delete button disabled.
- **CONSTRAINT-3**: "old" account status set: CLOSED/EXPIRED/SUSPENDED/BLOCKED are the 4 statuses that automatically qualify even if < 30 days. (See FR-2.1 spec text for the two-part OR).
- **DEPENDENCY-1**: `isAdminGeneratedAccount` helper already exists at server/index.js:431 — REUSED as-is; no modification to the helper allowed.
- **DEPENDENCY-2**: `DELETE /api/admin/users/:uid` hard-delete cascade already fully implemented at server/index.js:L2696-L2906 — REUSED without modification; only FR-2.4 403 guard preserved.
- **DEPENDENCY-3**: SweetAlert2 v11 available (confirmed in customer npm deps); used for existing transfer modals.
- **ASSUMPTION-1**: The "leading loading spinner" (user FR-1.4 phrase) means the spinner must open/start BEFORE the 2-minute delay begins. Current auth-session.js calls Swal.fire({title: T('xfer_processing'), didOpen: () => Swal.showLoading()}) right before the fetch call. For admin-created accounts, we need: (a) a pre-delay countdown timer running client-side IN PARALLEL with the HTTP request that has the 120s server-side delay, so spinner is guaranteed visible at least 120s even if server delay plus network is slower (actually server delay is 120s then processing, so total is >120s; client timer ensures minimum 120s spinner display regardless of server response timing if server somehow returned faster (can't happen but robustness)).
- **ASSUMPTION-2**: When the admin creates an account via the dashboard form, the adminGenerated/createdBy/_adminCreated flags are already set correctly (confirmed L2335-L2337 in server/index.js) → existing logic correct.
## Open Questions (to be resolved by user at APPROVAL stage)
1. **FUTURE-SCOPE QUESTION — REQUIRES EXPLICIT USER ANSWER**: Admin-generated accounts currently return 403 on DELETE /api/admin/users/:uid (L2718-L2723). The Delete button client-side will therefore be DISABLED for admin-generated accounts per FR-2.4. However, Feature 2 scope states "fully clears associated data for selected OLD user accounts." Is there any case where an OLD admin-generated account (created > 30 days ago) should be deletable? Current plan keeps the 403 server lock and disables the button.
2. **DELAY VISIBILITY QUESTION**: Feature 1 currently plans both backend 120s sleep AND frontend client-side 120s countdown timer, whichever is later → spinner shows for max(server latency, 120s). Is this dual-timer minimum 120s visibility acceptable?
## Acceptance Criteria (AC)
All ACs typed as `rule` or `rubric` per TRAE-spec-mode vocabulary.
### Feature 1 ACs
- **FR-AC-1.1 [rule]**: POST /api/customer/transfer for an admin-created sender (isAdminGeneratedAccount returns true) responds NO EARLIER than 120,000 ms after the request enters the handler; self-registered sender responds within normal (< 10 s) timing. Measure with request timestamp vs response timestamp diff (Node `process.hrtime` or curl time).
- **FR-AC-1.2 [rule]**: In /api/me JSON, the key `isAdminCreatedAccount` is a boolean and matches isAdminGeneratedAccount exactly for 5 test users: 3 admin-created (true), 2 self-registered (false).
- **FR-AC-1.3 [rule]**: `isAdminCreatedAccount` is the ONLY new key added to /api/me (diff against prior schema; no other existing keys changed or removed).
- **FR-AC-1.4 [rubric, 0-2]**: Frontend spinner/processing modal visual behavior during admin-account transfer:
  - **Score 2**: Spinner opens immediately after user clicks Confirm Transfer (before any network delay processing on server begins), shows a countdown from 2:00 downward to 0:00, and remains open for the full 120+ seconds even if HTTP responds unexpectedly early. No double-spinner, no flicker.
  - **Score 1**: Spinner opens and stays for 120s but no countdown text displayed (just "Processing…").
  - **Score 0**: Spinner closes early or never appears.
  - **Pass threshold**: ≥ 2.
- **FR-AC-1.5 [rule]**: For a self-registered sender, no countdown text is rendered in the processing Swal (no text "Admin account security hold…" at all) and the flow behaves identically to the pre-Feature-1 code path (only new JSON key is present, unused). Time from click → HTTP request sent < 1 second.
- **FR-AC-1.6 [rule]**: dashboard.php standalone doExecuteTransfer() shows identical spinner/countdown behavior based on /api/me isAdminCreatedAccount flag.
### Feature 2 ACs
- **FR-AC-2.1 [rule]**: In admin dashboard users list, 4 row types render Delete button state correctly:
  - Row A (self-registered, created 31 days ago, status ACTIVE): Delete button **ENABLED**.
  - Row B (self-registered, created 1 day ago, status CLOSED): Delete button **ENABLED** (status qualifies).
  - Row C (admin-generated, created 60 days ago, status EXPIRED): Delete button **DISABLED** (isAdminGeneratedAccount override).
  - Row D (self-registered, created 1 day ago, status ACTIVE): Delete button **DISABLED**.
  Tested by setting row fixtures via temporary DOM override + reading disabled attribute + inline style opacity.
- **FR-AC-2.2 [rule]**: Clicking an enabled Delete button → window.prompt() with exact typed confirmation string. If user cancels → no fetch fired, no state changed, soft flash error. If user types "DELETE" correctly → fetch DELETE /api/admin/users/:uid fires with admin cookie credentials (include: same).
- **FR-AC-2.3 [rule]**: DELETE /api/admin/users/:uid server response for a target that passes guards (non-admin-gen, any age) → full cascade: auth.deleteUser called (or auth/user-not-found skip allowed), Firestore users doc no longer exists, users/{uid}/transactions sub empty, transactions.where(uid) no matches, localUsers[uid] deleted, localTxs[uid] deleted.
- **FR-AC-2.4 [rule]**: Server 403 guard for admin-generated accounts still returns the exact string "Admin-generated accounts are permanently locked and cannot be deleted." from L2719. No code change removed or weakened guard (grep for the exact string confirms presence).
- **FR-AC-2.5 [rubric, 0-2]**: Delete confirm text accuracy (user must type DELETE):
  - **Score 2**: Confirmation dialog shows ALL listed bullet items, includes uid/name/status/created fields, requires typed "DELETE" (case-sensitive, whitespace-insensitive trim), and silently aborts on mismatch with clear error toast.
  - **Score 1**: Confirmation shows subset of required fields + typed DELETE requirement.
  - **Score 0**: Simple window.confirm() only (no typed prompt).
  - **Pass threshold**: ≥ 2.
### Scope + Regression ACs
- **NFR-AC-SCOPE [rule]**: The set of modified source files (git diff name-only) is a strict subset of: {server/index.js, customer/assets/js/auth-session.js, customer/dashboard.php, admin/assets/js/admin-session.js, .trae/specs/admin-delay-delete/spec.md, .trae/specs/admin-delay-delete/tasks.md, .trae/specs/admin-delay-delete/review.md}. Any other file modified → FAIL.
- **NFR-AC-REGRESSION [rule]**: All 5 edited files pass node --check / visual brace-scan. Node server startup (require all modules) succeeds with no error. Smoke curl endpoints prior to feature set: POST /api/admin/login → 401 or 200, GET /api/me → 401 without cookie (same as before).
