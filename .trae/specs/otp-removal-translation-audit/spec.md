# OTP Permanent Removal + Translator Service Audit - Product Requirements Document

## Overview
- **Summary**: Execute two tightly-scoped changes: (1) Permanently remove ALL OTP (One-Time Password) generation, transmission, storage, verification, and audit functionality across the entire application, replacing it exclusively with Transfer PIN authentication for ALL transfer processes; (2) Conduct a full operational audit of the translation service (customer-i18n.js), verify integration across all user account types and permission levels during transfer workflows, resolve any gaps, and confirm formatting, security, and compliance standards across all supported languages.
- **Purpose**: Eliminate the deprecated SMS/Email OTP attack surface permanently (no fallbacks, no residual code paths) and ensure the i18n/translator system is fully operational, consistent, and secure for all transfer flows.
- **Target Users**: Authenticated customers (all account types/statuses) initiating internal or international transfers; admin users creating accounts; all users browsing translated UI content.

## Goals
1. Zero OTP code paths remain executable. No API endpoint, server-side function, UI dialog, email trigger, or audit logger can generate, send, request, accept, verify, record, or reference an OTP for any purpose (transfer or admin account-creation).
2. Transfer PIN is the SOLE authentication mechanism required for every transfer type (internal /api/customer/transfer, /api/customer/transfer/execute, dashboard standalone modal).
3. Explicit error handling blocks any attempt to pass an OTP field, call an OTP endpoint, or use OTP-related functions — these return deterministic, non-sensitive 4xx errors and never silently fall through.
4. Translation service is fully functional across ALL 15 supported language dictionaries (en, es, fr, de, pt, ru, zh, ar, it, nl, tr, ja, ko, vi, hi) and gracefully degrades for skeleton-only language codes.
5. Translation integration works during transfer initiation, PIN dialog, confirm review, and success/receipt stages for every supported account type and permission level.
6. Translated content preserves HTML safety (no XSS via dict lookup), currency/amount formatting, and RTL direction for Arabic, Hebrew, Farsi, Urdu, etc.
7. Strict scope isolation: ZERO changes outside of OTP/transfer-PIN flow files and translator files.

## Non-Goals
- Do NOT modify customer registration, login, 2FA, KYC, profile-picture, password-change, account-PIN-change flows unless they directly call OTP functions.
- Do NOT modify database schemas, Firestore collection names, document field names, or security rules. Existing `security.transferOtp` fields in old documents are simply no longer written or read; leave them in place (read-ignored).
- Do NOT modify any PHP template rendering (register.php, dashboard.php, international.php, etc.) except to remove OTP dialog code already partially done in prior patch — only the OTP blocks.
- Do NOT modify admin user creation/dashboard except to strip the account-creation OTP email.
- Do NOT change the Transfer PIN validation algorithm, hash format (sha256Hex), or PIN-change endpoints.
- Do NOT alter balance logic, fee calculations, currency conversion, or Firestore batch write ordering.
- Do NOT add new npm dependencies.
- Do NOT add new translation languages; only ensure existing ones are consistent and safe.
- Do NOT modify files under /admin except to remove OTP email send from the /api/admin/users handler if it generates one.
- Do NOT touch /assets folder, CSS files, landing-page HTML/PHP, contact-us endpoint, or firebase-config endpoints.

## Background & Context
The VanguardDoubleTrust application currently has THREE layers of OTP integration, partially patched in a prior session via `_patch_no_otp.js`:

**Layer 1 — Backend OTP Subsystem (`server/transferOtp.js`)**: Exports `generate6DigitOtp`, `encryptOtpRecord`, `decryptAndVerifyOtp`, `writeOtpAuditRecord`, `sendTransferOtpEmail`, `sendAccountCreatedOtpEmail`. All of these are imported by `server/index.js` lines 20-27.

**Layer 2 — Backend API Endpoints in `server/index.js`**:
- `POST /api/customer/transfer/request-otp` (line 1479): Currently stubbed to return `transferPinVerified:true` and no OTP email. The endpoint still exists. It still contains variable names, PIN checks, and references the imported OTP module helpers. Should be removed entirely — transfer PIN validation should be moved INTO the main transfer handlers.
- `POST /api/customer/transfer` (line 1565): Still destructures `candidateOtp` from body (line 1575), still writes `transferOtp: { verified, encryptedData: null }` into Firestore transaction metadata (lines 1686, 1878) — these writes must be removed.
- `POST /api/customer/transfer/execute` (line 1763): Alias endpoint — needs same treatment.
- `POST /api/admin/users` (line 2364): Calls `generate6DigitOtp`, `encryptOtpRecord`, `sendAccountCreatedOtpEmail` at lines 2559-2589 during admin account creation. This OTP email feature must be permanently disabled.
- `OTP_AUDIT_DIR` constant (line 470) + `writeOtpAuditRecord` function (line 485): still defined, never called after removal — should be deleted.

**Layer 3 — Frontend (`customer/assets/js/auth-session.js` and `customer/dashboard.php`)**: Prior patch removed the OTP input from the SweetAlert2 dialog, but the closure still has the `onSendOtp` handler, still has `phase="pin" | "otp" | "confirm"` branching, still has `confirmedOtp` / `otpSent` / `otpPhaseRetryKey` variables, still has resend-button injection code paths, and still references the request-otp endpoint with OTP-specific error messages. The `dashboard.php` standalone modal was manually patched in the prior session to call request-otp then immediately call transfer with `"000000"`, but still passes `otp`, `transferOtp`, and `transferCode` in the payload body and references the request-otp endpoint by name.

**Translator Service (`customer/assets/js/customer-i18n.js`)**: ~4200 lines, exports `VT.I18N` with:
- DICT: ~150 language entries (30 fully-populated with ~90 keys, 120 skeleton-only with just `_name`)
- `t(code, key, vars)` function: performs dict lookup + `{{var}}` substitution via regex — NO HTML escaping on interpolated vars, NO regex escaping on var keys (security gap).
- `dictForCode(code)`: base-language fallback logic — appears correct.
- `applyLanguageToDocument(code, rootEl)`: walks `[data-i18n]`, `[data-i18n-placeholder]`, `[data-i18n-title]`, `[data-i18n-value]`, `[data-i18n-status]`. Uses `textContent` (safe for dict strings), BUT interpolated vars in `[data-i18n-vars]` JSON are substituted then set as `textContent` — safe, but:
  - The `subtitleRequired` string in `buildPicGate` (line 4170-4171) concatenates RAW untranslated HTML `<strong style="color:#ef4444">This step is required</strong>` into the innerHTML when `mustRequire===true`.
  - The `applyLanguageToDocument` setAttribute (placeholder/title/value) does NOT escape quotes in translation strings — if a malicious dict entry had `"foo \"bar"` it could produce malformed attributes but setAttribute is safe in modern browsers.
  - The RTL base set is `["ar","he","fa","ur","ps","ku","sd","ug","yi","syc","dv"]` — correct, but `ko-KR`, `zh-CN`, `ar-SA` regional codes may not be handled if `dictForCode` splits on `-` but the RTL check also splits; check if dir gets applied to `ar-SA`.
- `COUNTRY_LANGS`: 250+ country code mappings — no obvious gaps for our 15 target languages.
- `getAllDictionaryLanguages`: filters by `length === 2 || /^[a-z]{2}-[A-Z]{2}$/` — correct shape.
- `availableDictionaryLanguages`: skips regional variants when base lang exists — correct but has a potential off-by-one skip for `nav_profile` comparisons.
- Gap 1: Skeleton languages (e.g. `sw`, `ta`, `te`, `ml`, `mr`, `gu`, `pa`, `bn`, `ur`, `th`, `id`, `ms`, `uk`, `pl`, `sv`, `no`, `fi`, `da`, `cs`, `he`, `fa` listed in `COUNTRY_LANGS` for many nations but DICT has ~30 fully filled) — when `dictForCode` returns them, the fallback to `DICT.en` via line 3524 means English text is shown, not an error. Acceptable behavior but should be confirmed during audit.
- Gap 2: The transfer workflow specifically — `auth-session.js` dialog shows hardcoded strings like `"Transfer Authorization"`, `"Transfer PIN verified successfully"`, `"Proceed to Confirmation"` after the prior patch, but these are NOT in the `DICT` for any language, so they will appear in English even for a non-English user. This is a compliance/consistency gap: we need to add these strings to DICT for all 15 fully-supported languages, OR use VT.I18N.t() from auth-session.js to look up equivalent existing keys that are translated.
- Gap 3: `dashboard.php` standalone transfer modal's messages ("Transfer PIN verified. Processing transfer...") are also hardcoded English, not translated.
- Gap 4: `_name` meta in `ar`, `he`, etc. has English description `(_name: "العربية")` which is correct — but the RTL text is shown in a language-picker dropdown via `languageName()`, which returns the raw `_name` string, and that string is set as `textContent` in the KYC language selector — safe, but when applied as `option.textContent` we should confirm no double-writing.

## Functional Requirements

### Bucket A — OTP Permanent Removal (P0)
- **FR-A1**: Remove all OTP module imports from server/index.js. The line 20-27 block `const { generate6DigitOtp, encryptOtpRecord, decryptAndVerifyOtp, writeOtpAuditRecord, sendTransferOtpEmail, sendAccountCreatedOtpEmail } = require("./transferOtp");` is deleted entirely.
- **FR-A2**: Permanently delete the `POST /api/customer/transfer/request-otp` Express route handler (NOT stub, NOT no-op — the `app.post("/api/customer/transfer/request-otp", ...)` line and its entire function body (lines 1479 to before the next `app.post`) are removed. Any call to this endpoint (from old JS) MUST fall into Express 404 handling.
- **FR-A3**: Add an explicit OTP-field rejection guard at the TOP of `POST /api/customer/transfer` and `/api/customer/transfer/execute`. If the incoming request body contains ANY non-empty value for `otp`, `transferOtp`, `verificationCode`, `otpCode`, `code`, `twoFactorCode`, `confirmCode`, `secureCode`, or `authCode` fields (excluding the Transfer PIN which is `transferPin` or `transferCode` — those are ALLOWED), the endpoint MUST immediately return HTTP 400 with JSON `{ ok:false, error: "OTP authentication is permanently disabled. Use your Transfer PIN exclusively." }` WITHOUT executing ANY further logic (no DB reads, no balance checks, no email). This is the OTP fallback-blocking error handler.
- **FR-A4**: In `POST /api/customer/transfer`, remove the line that destructures `candidateOtp` from body (line 1575), remove ANY reference to `storedOtpRecord`, `decryptAndVerifyOtp`, `writeOtpAuditRecord`, `sendTransferOtpEmail`, `encryptedOtp`. Confirm no OTP decrypt/verify happens or is referenced.
- **FR-A5**: In the Firestore transaction metadata write inside `/api/customer/transfer` (the `transferOutDoc` at approx. line 1686 and `transferInDoc` at approx. line 1878), REMOVE the entire `transferOtp: { verified: true, encryptedData: null }` nested object. OTP is no longer part of the transaction record schema. Do not rename it — simply omit the key.
- **FR-A6**: Apply identical OTP removal to `/api/customer/transfer/execute` alias endpoint (copy rejection guard + remove OTP destructures + remove metadata writes).
- **FR-A7**: In `POST /api/admin/users` admin account-creation handler, REMOVE lines 2559-2589 which generate `accountOtp`, encrypt it, and call `sendAccountCreatedOtpEmail`. The admin user creation flow must NOT send any OTP email. Account credentials (email + password + account number + PIN) are communicated via out-of-band admin workflow, NOT via OTP email. The `twoFactorEnabled: true` line in the security object is preserved (unchanged) — that refers to Transfer PIN being required, not to email OTP.
- **FR-A8**: Remove `OTP_AUDIT_DIR` constant (line 470), its mkdir side-effect (line 473), the `otpAuditPathForToday()` helper (lines 480-483), and the `writeOtpAuditRecord()` function (lines 485-510 approx.) from server/index.js. No residual audit logging code for OTP.
- **FR-A9**: Frontend `auth-session.js`: Remove the `onSendOtp` handler entirely (it's a no-op after prior patch, but name + handler still dispatchable). Collapse dialog phases from `pin|otp|confirm` to `pin|confirm` ONLY. Remove:
  - `phase === "otp"` branch from all conditionals (openConfirmOrPinOtp, render functions, cancel-back buttons).
  - `otpSent`, `otpPhaseRetryKey`, `confirmedOtp` closure variables.
  - The OTP-phase title/text/button/input rendering branch inside the Swal html template.
  - The resend OTP button injection code (which set `innerHTML` of the footer).
  - Change references to `"Send Verification Code"` button text to the translated/correct `"Proceed to Confirmation"` (it was already patched partially, but make the collapsed flow not even reference the request-otp endpoint — auth-session.js should no longer call `/api/customer/transfer/request-otp` at all.
  - Instead of calling request-otp then moving to next phase: after user enters Transfer PIN and clicks `"Proceed to Confirmation"`, the dialog should IMMEDIATELY do a local-only 6-digit regex check on the PIN, then set phase to confirm, build the integrity-sealed confirm body, and show the confirm review screen.
  - The confirm phase body then includes a direct `fetchJson("/api/customer/transfer", ...)` call with `{ transferPin, transferCode, ...transferContext }` — NO `otp`, NO `transferOtp` fields in the payload.
  - Error messages inside dialog: replace any mention of "verification code", "OTP", "email sent", "resend", "otp", "masked email" with Transfer PIN equivalents (or remove them).
- **FR-A10**: Frontend `dashboard.php` standalone transfer modal (around line 2967):
  - Do NOT call `/api/customer/transfer/request-otp` — it no longer exists (FR-A2).
  - After collecting the Transfer PIN from the user, immediately proceed to `doExecuteTransfer()` with ONLY Transfer PIN in the request body (no `otp`, no `transferOtp`, no `transferCode` alias for OTP — `transferCode` is used as Transfer PIN alias which is acceptable per backend isTransferCodeValid).
  - Remove the entire OTP Swal.fire prompt branch from `hasSwal` fallback and the window.prompt fallback branch.
  - Rename error messages referencing "verification code" to "Transfer PIN".
- **FR-A11**: Cross-cutting: Grep the entire repository for `request-otp`, `candidateOtp`, `generate6DigitOtp`, `encryptOtpRecord`, `decryptAndVerifyOtp`, `sendTransferOtpEmail`, `sendAccountCreatedOtpEmail`, `writeOtpAuditRecord`, `transferOtp`, `otpSent`, `confirmedOtp`, `OTP_AUDIT_DIR`, `otp-audit-` — ZERO hits remain in executable code (comments can remain if they don't mislead, but code-references must be zero). OTP module in `package.json` dependencies and import statements can remain for unused-require but the require line MUST be deleted.
- **FR-A12**: The transfer flow for all account types (ACTIVE, admin-created, self-registered, KYC-completed, KYC+profile-pic-completed) requires ONLY the Transfer PIN to proceed. No other authentication factor. Transfer PIN validation via `sha256Hex(pin) === userDoc.security.transferPinHash` MUST still be enforced exactly as before for all transaction types.

### Bucket B — Translator Service Audit & Fix (P1)
- **FR-B1**: Operational status check: Confirm `t(code, key, vars)` returns the correct dict entry for every key in DICT.en when called with code="en", and falls back to DICT.en when called with code for a skeleton language. Confirm `dictForCode` handles regional variants `ar-SA` → `ar`, `zh-CN` → `zh`, `pt-BR` → `pt`, `es-MX` → `es` correctly.
- **FR-B2**: Integration across account types: Confirm the translation service is correctly loaded on every customer-facing page that hosts a transfer flow:
  - `/customer/dashboard.php` (standalone modal)
  - `/customer/international.php` (SweetAlert2 flow via auth-session.js)
  - `/customer/verify-pin.php` → `/customer/account.html` flow (uses `customer-i18n.js` for nav bar translation; confirm that after pin verification translation still applied)
  - Admin pages `/admin/dashboard.html` — confirm admin session does NOT crash if i18n is absent (customer-i18n.js is customer-only, so admin page must not reference it; verify no broken `<script>` include).
- **FR-B3**: Transfer workflow consistency: Confirm every hardcoded English string in the transfer dialogs has an entry in DICT and is translated. Specifically:
  - Dialog titles: "Transfer Authorization", "Confirm Transfer"
  - Buttons: "Proceed to Confirmation", "← Back to PIN", "Confirm Transfer", "Cancel" (Cancel is already translated).
  - Status messages: "Transfer PIN verified successfully", "Transfer parameters have been cryptographically sealed", "Verifying Transfer PIN and processing transfer...", "Transfer completed successfully", "Transfer failed"
  - Error messages: "Invalid Transfer PIN", "Transfer PIN is required (6 digits)", "OTP authentication is permanently disabled. Use your Transfer PIN exclusively." (add this rejection message as a DICT key).
  - Add ~25 new DICT keys covering these strings. Add the translations for ALL 15 fully-supported languages (en, es, fr, de, pt, ru, zh, ar, it, nl, tr, ja, ko, vi, hi). Use correct Google-Translate-quality professional-appearing banking terminology consistent with the existing DICT style for each language.
  - For skeleton languages, rely on the existing English fallback (no new entries needed).
- **FR-B4**: Confirm auth-session.js and dashboard.php call `VT.I18N.t(currentLanguage, key)` for the new strings, where currentLanguage is read from the customer's `/api/me` response `preferredLanguage` field (this is already how the nav bar works; confirm the dialog code reads the same context).
- **FR-B5**: Formatting and security:
  - `t()` function: Escape interpolated variable values using `escapeHtml` already defined in customer-i18n.js before regex substitution, so that a malicious `{{amount}}` value cannot inject HTML when the result is set in a context that might later be treated as markup (even if currently textContent is used).
  - `t()` function: Escape the variable KEY in the regex constructor, so a key with regex special chars (e.g. `a.b`) does not produce an invalid regex or unintended match. Currently `${k}` is raw into `new RegExp(\`\\{\\{${k}\\}\\}\`, "g")` — escape `$`, `.`, `*`, `+`, `?`, `(`, `)`, `[`, `]`, `{`, `}`, `|`, `^`, `\`.
  - Apply the same var-value + var-key escaping to the `applyLanguageToDocument` data-i18n-vars JSON interpolation branch at line ~3565-3568.
  - Confirm RTL works for regional variants: `dictForCode("ar-SA")` returns `DICT.ar`, then the `applyLanguageToDocument` dir check correctly splits "ar-SA" → base "ar" and finds it in RTL_BASES. Add a test assertion: after calling `applyLanguageToDocument("ar-SA", document)`, `document.documentElement.getAttribute("dir") === "rtl"` and `getAttribute("lang") === "ar-SA"`.
  - Confirm currency/amount numbers are formatted with correct separators and currency symbol per account.currency (this is done via fmtCurrency helper in pages — confirm no DICT key used in amount display overrides the numeric format in a way that breaks parsing).
  - Confirm all `_name` entries in DICT are properly UTF-8 and display correctly in the KYC language dropdown. No mojibake in RTL or CJK languages.
- **FR-B6**: COUNTRY_LANGS consistency: For every fully-supported language L in {en,es,fr,de,pt,ru,zh,ar,it,nl,tr,ja,ko,vi,hi}, confirm that at least one country in COUNTRY_LANGS lists L as its `primary`. If any language in this 15-set has NO country primary, add it to the obvious country (e.g., check nl → NL, tr → TR, ja → JP, ko → KR, vi → VN, hi → IN). Already present but verify.
- **FR-B7**: Error handling for missing keys: When `t()` is called with a nonexistent key, it currently returns the raw key string (line 3524). This is acceptable but: confirm NO call site will ever interpret the returned string as HTML (currently all usages set textContent or setAttribute — verify this is true for auth-session.js's new translation calls, which are inserted into Swal html strings). If a translated value is EVER inserted into a `Swal.fire({ html: "..." })` template, the return value of `t()` MUST be HTML-escaped unless the value is guaranteed dict-sourced and safe. Fix: add an `escapeHtml` wrapper to `t()` output that activates by default; for the rare case where dict entries intentionally include HTML (none today), add a separate `tRaw(code, key, vars)` that skips escaping and is only used for explicitly safe dict content.

## Non-Functional Requirements
- **NFR-1 Strict Scope**: ONLY the following files may be modified. Any other file change requires explicit user approval via AskUserQuestion and documented cancellation in tasks.
  - `server/index.js` (OTP removal + OTP-rejection guard + metadata OTP removal + admin OTP email removal + OTP audit function removal)
  - `server/transferOtp.js` (can be left alone with dead exports, OR the entire file can be removed if the import line is removed from index.js. Given "permanently disable", we will leave transferOtp.js in place but make ZERO references to it from index.js — this way no code path can reach the functions. This avoids deleting source files in case future audit needs arise.)
  - `customer/assets/js/auth-session.js` (OTP UI removal + dialog phase collapse + translation lookups added via VT.I18N.t)
  - `customer/dashboard.php` (standalone OTP prompt removal + no request-otp)
  - `customer/assets/js/customer-i18n.js` (new DICT keys for 15 languages + `t()` security hardening + RTL regional check + any integration fixes)
  - 6 files MAX. No other files.
- **NFR-2 Backward Compatibility on Transfer PIN**: The existing request body fields `transferPin` and `transferCode` (Transfer PIN alias) continue to work exactly as before. Clients that send only `transferPin` OR `transferCode` pass validation. No new required fields on the transfer endpoints.
- **NFR-3 No Endpoint Behavior Change except OTP removal**: Success-response shape of `/api/customer/transfer` remains exactly `{ ok: true, reference, newBalance, newAvailableBalance, ...existing fields }`. HTTP status codes for success (200), invalid PIN (400), insufficient funds (400), same error strings for non-OTP errors are preserved.
- **NFR-4 Syntax Validator**: Every modified `.js` file MUST pass `node --check <file>` before being considered complete.
- **NFR-5 Security Invariants**:
  - Transfer PIN hash validation (`sha256Hex(req.body.transferPin) === userDoc.security.transferPinHash`) MUST still execute for every transfer request BEFORE any balance mutation. If the PIN is wrong, the existing `{ error: "Invalid Transfer PIN." }` response is returned.
  - The `requireAuth`, `requireKycAndProfilePic`, `requirePinVerified` middleware stack on transfer endpoints remains fully intact and unmodified.
  - No plaintext Transfer PIN is logged to console or written to disk. PIN hash comparison only.
  - Self-transfer prevention, status ACTIVE checks, balance sufficiency (including availableBalance), currency matching — ALL of these existing checks execute exactly once per request, same as before, BEFORE the new OTP-rejection guard (which only checks for the presence of OTP fields and rejects early if found). Order: auth middleware → OTP-field rejection → body shape validation → PIN validation → balance/status checks → atomic transfer.
- **NFR-6 Performance**: Adding 25 new DICT keys and 15 languages = ~375 new dictionary entries. This adds < 30KB to the ~400KB customer-i18n.js file (already cached). Translation lookup overhead is O(1) object property access per call; no measurable impact. Transfer endpoint adds ONE synchronous object-key check before validation; P99 latency increase < 1ms.
- **NFR-7 Audit trail for OTP files removed**: The existing `logs/email-audit/otp-audit-*.jsonl` log files on disk are NOT deleted by any code change. Leave them intact for compliance record-keeping. Only the code that writes new entries is removed.

## Constraints
- **Technical**: Must use Express route removal (not 404 middleware override) for `/api/customer/transfer/request-otp`. Must use existing `sha256Hex`, `isSixDigitPin`, `isTransferCodeValid`, `requireAuth`, `requireKycAndProfilePic` helpers; no new auth helpers. Must use existing `escapeHtml` in customer-i18n.js (already present ~line 3534) for the t() wrapper. Must preserve the existing SweetAlert2 capture-phase `stopImmediatePropagation` handler pattern for auth-session.js dialog buttons. Must continue using Firestore batch writes for balance changes.
- **Business**: Admin-generated accounts continue to have `twoFactorEnabled: true` in the security object (this flags Transfer PIN required). Transfer PIN must be 6 digits OR 8+ chars with uppercase+number+special (existing `isTransferCodeValid` policy unchanged).
- **Dependencies**: No new npm packages. No changes to package.json or package-lock.json.
- **Compliance**: Existing `logs/email-audit/*.jsonl` OTP audit entries from prior dates remain on disk (read-ignored, not deleted).

## Assumptions
- Node.js server restart is acceptable after applying changes (file edits on disk take effect on next start).
- The customer session's `preferredLanguage` is accessible inside auth-session.js via `/api/me` response which is cached in the existing `ctx` / `window.VT_CTX` or similar mechanism. If the preferred language is not in memory at the time the transfer dialog opens, auth-session.js should call `await VT.I18N.api("/api/me")` to fetch it, or default to `"en"` and re-translate after fetch.
- Transfer module `server/transferOtp.js` is safe to leave as dead code (unreferenced from index.js) because the require line in index.js is removed — Node.js will not load the file. If transferOtp.js had any side effects on require (none observed; it only exports pure functions), those would no longer run.
- The existing 15 fully-supported languages have enough banking vocabulary from the previous DICT entries that manually authored new translation strings for 25 keys can be consistently written without a paid API. Professional-appearing banking terminology matching each language's existing style suffices.
- No OTP-related tests exist in `package.json scripts` to update; grep confirms no test runner.

## Acceptance Criteria

### AC-A1: No OTP module is reachable from server/index.js
- **Type**: `rule`
- **Given**: Fresh server startup with changes applied.
- **When**: The set of `require()` calls in server/index.js is enumerated.
- **Then**: `require("./transferOtp")` is NOT present anywhere in the file. No destructured references to `generate6DigitOtp`, `encryptOtpRecord`, `decryptAndVerifyOtp`, `writeOtpAuditRecord`, `sendTransferOtpEmail`, `sendAccountCreatedOtpEmail` exist as executable statements (they may appear in comments that are never run, but grep for these identifiers in non-comment lines must produce zero matches).
- **Pass Condition**: `grep -n "require.*transferOtp\|generate6DigitOtp\|encryptOtpRecord\|decryptAndVerifyOtp\|writeOtpAuditRecord\|sendTransferOtpEmail\|sendAccountCreatedOtpEmail" server/index.js` returns zero lines in non-comment code.
- **Evidence**: Grep output showing zero matches, or showing matches are all inside comment delimiters.

### AC-A2: /api/customer/transfer/request-otp endpoint is GONE (not stubbed)
- **Type**: `rule`
- **Given**: Running server.
- **When**: `curl -X POST -c cookies.txt -b cookies.txt http://localhost:3002/api/customer/transfer/request-otp` is executed.
- **Then**: Response HTTP status is 404 (NOT 400, NOT 200, NOT 401). Response body is Express's default 404 or the app's catch-all 404; MUST NOT be JSON response containing `transferPinVerified:true` or any prior stub.
- **Pass Condition**: HTTP 404 + no `transferPinVerified` key anywhere in response body.
- **Evidence**: curl command output showing status 404 and body content.

### AC-A3: OTP-field rejection guard blocks transfer requests with any OTP-like field
- **Type**: `rule`
- **Given**: Authenticated session cookie, valid KYC+profile picture, valid transfer body (amount, recipient) + valid Transfer PIN.
- **When**: Request body ALSO contains a non-empty value for ANY of the 10 forbidden OTP field names: `otp`, `transferOtp`, `verificationCode`, `otpCode`, `code`, `twoFactorCode`, `confirmCode`, `secureCode`, `authCode`.
- **Then**: (a) HTTP status 400; (b) JSON body `{ ok:false, error: "OTP authentication is permanently disabled. Use your Transfer PIN exclusively." }`; (c) NO Firestore document reads occur (or at minimum, NO balance document writes — verified via Firestore snapshot diff).
- **Pass Condition**: Send a request with `otp:"123456"` along with all other valid fields, verify the exact 400 error string and zero balance delta.
- **Evidence**: curl request/response pair + Firestore before/after queries showing unchanged balances.

### AC-A4: Valid PIN-only transfer request succeeds end-to-end (no OTP fields)
- **Type**: `rule`
- **Given**: Sender S with balance Bs and Transfer PIN P, recipient R with balance Br, amount A.
- **When**: `POST /api/customer/transfer` with body `{ amount:A, recipient:R_accountNumber, transferPin:P }` (no otp, no code, no transferOtp fields).
- **Then**: (a) HTTP 200, (b) JSON `{ ok: true, reference, newBalance, newAvailableBalance, ... }`, (c) sender balance = Bs - A (both balance and availableBalance), (d) recipient balance = Br + A, (e) transaction metadata documents in Firestore do NOT contain a `transferOtp` top-level key, (f) `candidateOtp` is not referenced anywhere in the handler.
- **Pass Condition**: All 6 subconditions verified via Firestore query + curl output + code inspection.
- **Evidence**: API test script output showing 200 response + Firestore query showing `transferOtp` key absent in both TRANSFER_OUT and TRANSFER_IN metadata documents.

### AC-A5: Admin user creation no longer sends OTP email
- **Type**: `rule`
- **Given**: Admin auth cookie, valid admin user POST body with all required fields (name, email, password, accountPin, transferCode, startingBalance, preferredLanguage).
- **When**: `POST /api/admin/users` is executed.
- **Then**: (a) User document created in Firestore (accountNumber assigned, `security.accountPinHash` and `security.transferPinHash` present), (b) NO `sendAccountCreatedOtpEmail` call happens (grep server/index.js: no identifier match), (c) NO OTP-related record is written to `logs/email-audit/` directory during the request, (d) response still returns the success shape as before (omitting only fields previously derived from OTP email result).
- **Pass Condition**: After creating test user, listing logs/email-audit shows no new otp-audit lines written for that timestamp.
- **Evidence**: File listing of logs/email-audit before/after + response JSON from admin /api/admin/users showing success.

### AC-A6: Frontend transfer dialog has NO OTP phase
- **Type**: `rule`
- **Given**: User on `/customer/international.php`, dialog triggered via "Proceed".
- **When**: Dialog opens.
- **Then**: (a) Phase enumeration has exactly 2 phases: PIN entry → Confirm Transfer. There is no OTP entry phase. (b) Phase `"otp"` string is not present anywhere in auth-session.js source executable lines. (c) `request-otp` string is absent from auth-session.js and dashboard.php executable lines. (d) After entering valid Transfer PIN and clicking "Proceed to Confirmation", the dialog goes directly to confirm review screen — no network call to `/request-otp`, no email mentioned, no "resend" button present anywhere.
- **Pass Condition**: Browser DevTools network tab shows zero requests to `/request-otp` during complete dialog flow from open to transfer POST. DOM inspection shows no OTP input, no resend links.
- **Evidence**: Network HAR trace + dialog screenshots showing 2 phases only.

### AC-A7: All OTP audit helpers are removed from server/index.js
- **Type**: `rule`
- **Given**: server/index.js source after changes.
- **When**: Grep for `OTP_AUDIT_DIR`, `otpAuditPathForToday`, `writeOtpAuditRecord`, `otp-audit-` variable definitions.
- **Then**: Zero matches for their definitions (function definitions, const declarations). Any residual string references in dead-comment code only; NO executable lines contain these identifiers.
- **Pass Condition**: Grep shows these identifiers are not defined in the file.
- **Evidence**: Grep output.

### AC-B1: Translator t() and dictForCode are correct for 15 core languages + regional variants
- **Type**: `rule`
- **Given**: customer-i18n.js loaded, VT.I18N exposed.
- **When**: Calling `t("en","nav_dashboard")`, `t("es","nav_dashboard")`, ... for all 15 languages on key `nav_dashboard` and `intl_submit`. Then calling dictForCode for regional variants.
- **Then**: (a) Each core language returns its correct translated string, not English fallback. (b) `dictForCode("ar-SA") === DICT.ar`, `dictForCode("zh-CN") === DICT.zh`, `dictForCode("pt-BR") === DICT.pt`, `dictForCode("es-MX") === DICT.es`, `dictForCode("en-US") === DICT.en`. (c) Skeleton languages (e.g. `tl`, `sw`, `ta` — any language code that only has `_name`) fall back correctly to `DICT.en[key]` for missing keys.
- **Pass Condition**: Manual test assertions or Node.js script comparing t() outputs vs. hardcoded expected strings for each of the 15 languages + 5 regional variants.
- **Evidence**: Test script output showing all assertions passed.

### AC-B2: Translation integration works on every transfer page (dashboard, international, account)
- **Type**: `rule`
- **Given**: Customer logged in, preferredLanguage set to "es" (Spanish).
- **When**: Browse `/customer/dashboard.php`, `/customer/international.php`, `/customer/account.html`, `/customer/transferhistory.php`.
- **Then**: (a) Nav bar nav items are Spanish (use existing translated keys). (b) `data-i18n-status` badges show "Activo" / "Pendiente" etc. (c) KYC-gate and profile-pic-gate built-in strings also render in Spanish via applyLanguageToDocument. (d) `/customer/verify-pin.php` after successful PIN redirect applies Spanish translation on the destination page. (e) Admin `/admin/dashboard.html` page loads without script errors (even though it does NOT use customer-i18n.js — verify no failed `<script src>` fetch for customer-i18n.js on admin pages).
- **Pass Condition**: Every page listed loads without console errors, and a spot-check of 5 translated nav keys shows non-English Spanish text. Network tab shows customer-i18n.js is loaded on customer pages, NOT loaded on admin pages.
- **Evidence**: Browser screenshots of nav bars in Spanish + console/network tab showing no errors.

### AC-B3: New dialog translation keys are present and consistent across 15 languages
- **Type**: `rubric`
- **Dimension**: Translation coverage consistency for the 25 new transfer dialog keys.
- **Numeric Scale**: 0-5
- **Anchors**: 0 = no new keys added. 1 = keys added for English only. 2 = English + 5 other languages. 3 = 10+ languages but some mismatches/typos in banking terms. 4 = all 15 languages have entries, minor style variations OK. 5 = all 15 languages have entries + each translation uses banking-domain terminology consistent with the existing DICT translations for that language (e.g. the same word for "PIN" is reused in `pin_title` family of keys; same word for "Transfer" as in `intl_title`; no machine-translation gibberish).
- **Pass Threshold**: >= 4
- **Evidence**: Code inspection of the DICT.en...DICT.hi blocks for the 25 new keys, plus cross-language consistency check (search for the new key identifiers appearing exactly 15 times each).

### AC-B4: t() security — var substitution is escaped
- **Type**: `rule`
- **Given**: customer-i18n.js loaded.
- **When**: `t("en", "some_key_with_vars", { amount: '<script>alert(1)</script>USD 1,000', weirdKey: 'a.{2}b' })` is called with a dict key containing `{{amount}}` and `{{weirdKey}}` placeholders.
- **Then**: (a) The `amount` placeholder is substituted with HTML-escaped output `&lt;script&gt;alert(1)&lt;&#x2F;script&gt;USD 1,000`. (b) The `weirdKey` placeholder regex is correctly escaped so `a.{2}b` in the var key name does NOT match unrelated dict text. (c) No `RegExp` constructor errors thrown for valid dict content.
- **Pass Condition**: Node.js test script performing the above call on a test dict key and confirming escaped output.
- **Evidence**: Test script passing assertions.

### AC-B5: RTL direction applied for regional variants
- **Type**: `rule`
- **Given**: Browser page with customer-i18n.js loaded.
- **When**: `VT.I18N.applyLanguageToDocument("ar-SA", document)` called.
- **Then**: (a) `document.documentElement.getAttribute("lang") === "ar-SA"`. (b) `document.documentElement.getAttribute("dir") === "rtl"`. (c) Same for `he-IL` → rtl, `fa-IR` → rtl, `ur-PK` → rtl, `ps-AF` → rtl, `ku-IQ` → rtl. (d) `en-US` → dir `ltr`.
- **Pass Condition**: All 6 assertions verified via Node.js DOM simulation (jsdom-style) or browser DevTools console run.
- **Evidence**: Script log or console-screenshot of assertions.

### AC-B6: Auth-session and dashboard use VT.I18N.t() for all new dialog strings
- **Type**: `rule`
- **Given**: User with preferredLanguage = "fr" (French). Transfer dialog opened on international.php and dashboard.php.
- **When**: Dialog renders in all phases and all error messages are triggered.
- **Then**: Every dialog title, button text, status message, and error message in the dialog is French (NOT English hardcoded). Specifically: dialog title shows the French translation of "Transfer Authorization", confirm button shows French "Confirm Transfer", PIN-mismatch shows French "Invalid Transfer PIN", OTP-rejection shows French "OTP authentication is permanently disabled..." (the newly-added DICT key for that error message).
- **Pass Condition**: Spot-check 10 strings in the dialog with browser DevTools innerText grab — ALL are non-English French and match DICT.fr entries.
- **Evidence**: Screenshot of French dialog + DOM inspection outputs.

### AC-Scope: No files outside the 6-file allowlist were modified
- **Type**: `rule`
- **Given**: Git working tree or before/after file list diff.
- **When**: Enumerate all files with modified mtime after implementation started.
- **Then**: The set of modified files is exactly a SUBSET of { server/index.js, server/transferOtp.js (maybe unchanged), customer/assets/js/auth-session.js, customer/assets/js/customer-i18n.js, customer/dashboard.php, .trae/specs/otp-removal-translation-audit/*.md, logs/email-audit/*.jsonl (logs untouched count as OK) }. No PHP templates other than dashboard.php, no CSS, no other JS files, no package.json, no firestore.rules, no admin pages, no landing pages, no .env file.
- **Pass Condition**: File diff list contains ONLY these 6 files (+ spec artifacts).
- **Evidence**: `git diff --name-only` output (or equivalent file listing comparison against allowlist).
