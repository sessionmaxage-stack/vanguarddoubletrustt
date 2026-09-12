# OTP Removal + Translator Audit - Implementation Plan

## Task 1: Backend OTP Eradication from server/index.js (imports + audit helpers + request-otp route + admin OTP email)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Files to Modify**: `server/index.js` only
- **Description**:
  1. Delete the entire `require("./transferOtp")` destructured import block (around lines 18-28). After this, `generate6DigitOtp`, `encryptOtpRecord`, `decryptAndVerifyOtp`, `writeOtpAuditRecord`, `sendTransferOtpEmail`, `sendAccountCreatedOtpEmail` identifiers are NOT defined — any residual reference will be a ReferenceError caught by Task 2's residual-grep step → must remove them too.
  2. Remove `OTP_AUDIT_DIR` const + its mkdir side-effect, the `otpAuditPathForToday()` helper function, and the `writeOtpAuditRecord()` function body (around lines 468-510 area). Remove all lines that define or reference these names. Do NOT remove other audit log helpers if any exist for non-OTP purposes.
  3. **DELETE** (not stub) the full Express route: `app.post("/api/customer/transfer/request-otp", requireAuth, requireKycAndProfilePic, async (req, res) => { ... })`. Find its closing `});` — if the route spans lines 1479 through 1564, remove every line from the app.post declaration through its final `});`. Do NOT leave a commented-out route; that still registers the endpoint if a single uncommented line is left. Ensure line 1565 (POST /api/customer/transfer) becomes the next immediate `app.post` after `app.get("/api/customer/lookup-account")` around line 1427.
  4. In `POST /api/admin/users` handler (around line 2364): delete lines that reference `accountOtp`, `accountOtpEncrypted`, `encryptOtpRecord`, `generate6DigitOtp`, `sendAccountCreatedOtpEmail`, `otpEmailResult`. This block spans ~lines 2555-2600. If after deletion the `otpEmailResult?.accepted` / `?.rejected` block references remain, delete those too. The response JSON still returns the user info shape; only drop the `otpEmailSent` / `otpAccepted` / `otpRejected` response fields if they were added. Leave the `security.twoFactorEnabled: true` field AS-IS — it means Transfer PIN is required, not email OTP.
  5. Run `node --check server/index.js` immediately after editing. Fix any syntax errors (dangling commas, unbalanced braces from removal). Do NOT continue until syntax check passes.
- **Acceptance Criteria Addressed**: AC-A1, AC-A2, AC-A5, AC-A7
- **Test Requirements**:
  - `rule` TR-1.1: `grep -n "require.*transferOtp\|generate6DigitOtp\|encryptOtpRecord\|decryptAndVerifyOtp\|writeOtpAuditRecord\|sendTransferOtpEmail\|sendAccountCreatedOtpEmail\|OTP_AUDIT_DIR\|otpAuditPathForToday" server/index.js` returns ZERO lines. If matches are in comment blocks they are allowed only if they are clearly comments (starting with `//` or inside `/* */`) and not executable. Non-comment executable lines = fail.
  - `rule` TR-1.2: Start the server, then `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3002/api/customer/transfer/request-otp` returns status `404` (not 401, not 500, not 200). If `requireAuth` middleware runs and returns 401 that counts as endpoint still registered → FAIL. Must be 404 before any Express middleware.
  - `rule` TR-1.3: `node --check server/index.js` exits with code 0 (no syntax errors).
  - `rule` TR-1.4: POST to `/api/admin/users` with valid admin cookie + valid body → returns HTTP 200/201 without calling sendAccountCreatedOtpEmail. Evidence: watch `logs/email-audit/` directory mtime before/after request — no new file lines written, no `otp-` prefixed file created with today's date (file date must match request timestamp within 60s to count).

## Task 2: Transfer Endpoint OTP Rejection Guard + OTP Metadata Cleanup + PIN-Exclusive Enforcement
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (OTP import removed first, otherwise ReferenceError on `decryptAndVerifyOtp` inside handler)
- **Files to Modify**: `server/index.js` only (Task 1 already touched this; continue surgical edits in same file)
- **Description**:
  1. Add the OTP-field EARLY REJECTION guard as the FIRST code block inside the `async (req, res) => {` handler for BOTH `POST /api/customer/transfer` AND `POST /api/customer/transfer/execute`. Order within each handler must be: (a) validate `b = typeof req.body === "object" && req.body ? req.body : {}`; (b) OTP rejection guard (next step); (c) rest of validation. The guard scans the top-level request body fields `['otp','transferOtp','verificationCode','otpCode','code','twoFactorCode','confirmCode','secureCode','authCode']`. For each field name, if `String(b[fieldName] || "").trim() !== ""` the handler must immediately return `res.status(400).json({ ok: false, error: "OTP authentication is permanently disabled. Use your Transfer PIN exclusively." })`. Exception: The field named `code` was also used for some internal test/nonce purposes? Check existing usage: if `code` is already used for a non-OTP field elsewhere, EXCLUDE it from the guard. Based on existing code: `code` appears as a TransferPin alias in auth-session (dashboard.php calls it `code`). It is mapped to `transferCode` in request-otp. So: include `code` in guard ONLY if it's a 6-digit all-numeric string. Otherwise skip it. Safe rule: for field `code`, only trigger reject if it matches `/^\d{6}$/` AND another transferPin/transferCode field is already present with a DIFFERENT value (indicating it's a legacy OTP `code` field). Simpler is safer: keep the guard for all 10 fields as written in spec and rely on frontend not sending `code` for PIN in the updated versions. (Dashboard.php Task 4 will stop sending `code` as OTP; auth-session.js Task 5 will stop sending `code` for OTP.) So `code` can safely remain in the 10-field guard.
  2. After the guard, on the line where `candidateOtp = String(b.otp || b.transferOtp || b.code || "").trim()` is destructured (around line 1575 in original), DELETE THIS LINE ENTIRELY. Also remove any subsequent lines that reference `candidateOtp` — e.g. "If `!candidateOtp` return error" blocks, `decryptAndVerifyOtp(candidateOtp, storedOtpRecord)` calls, error strings containing "Two-step OTP" or "Invalid Transfer PIN and/or OTP". If any condition is `(!validPin && !candidateOtpOk)`, collapse it to `(!validPin)` only. Goal: after edit, NO code branch cares about OTP validity. ALL transfer authentication rests SOLELY on Transfer PIN hash match.
  3. Firestore transaction metadata cleanup: In the `transferOutDoc` object (sent TRANSFER_OUT record ~line 1686) and the `transferInDoc` object (received TRANSFER_IN record ~line 1878), look for the nested key `transferOtp: { verified: true, encryptedData: null }` or similar. DELETE the entire `transferOtp:` line from both documents. Do NOT replace with anything. Ensure any commas before/after are correct so JSON/Firestore object shape is still valid (no trailing commas).
  4. Apply the exact same OTP-rejection guard + candidateOtp-var-removal + metadata-transferOtp-key-deletion to the `POST /api/customer/transfer/execute` alias endpoint around line 1763. Copy-paste guard body exactly.
  5. Verify Transfer PIN enforcement is still intact: find the `const validPin = sha256Hex(transferPinCandidate) === (userDoc?.security?.transferPinHash || "")` line (or equivalent). Confirm it runs BEFORE any balance/recipient checks. Confirm the error message for wrong PIN still reads `"Invalid Transfer PIN."` (changed from "…PIN and/or OTP"). If it says "PIN and/or OTP", remove the "and/or OTP" suffix.
  6. Run `node --check server/index.js`.
- **Acceptance Criteria Addressed**: AC-A3, AC-A4
- **Test Requirements**:
  - `rule` TR-2.1: Send POST `/api/customer/transfer` with valid session, KYC, valid Transfer PIN, valid amount/recipient, AND an extra `otp: "123456"` field. Result: HTTP 400 with JSON.error === "OTP authentication is permanently disabled. Use your Transfer PIN exclusively." No balance changes in Firestore.
  - `rule` TR-2.2: Same request but inject `transferOtp: "x"`, `verificationCode: "123456"`, `otpCode: "000000"`, `code: "123456"` (each in separate test runs). Each run MUST produce same exact 400 rejection as TR-2.1, no other behavior.
  - `rule` TR-2.3: Valid PIN-only request (no OTP fields) → HTTP 200 with `{ ok: true, reference, newBalance }`. Firestore query of the new transaction documents: `Object.keys(transferOutDoc).includes("transferOtp") === false` and `Object.keys(transferInDoc).includes("transferOtp") === false`.
  - `rule` TR-2.4: Send request with wrong PIN (and no OTP fields) → HTTP 400 with error containing "Invalid Transfer PIN" (exact substring match; response must NOT contain the substring "OTP" or "One-Time" anywhere in its error message in this case).
  - `rubric` TR-2.5: Guard execution order correctness; 1-5; anchors 1 = guard runs after DB reads; 3 = guard in middle of validation stack; 5 = guard is first executable statement after body parsing; threshold >= 5; evidence = code review showing guard position.

## Task 3: Translator DICT Key Addition (25 new keys × 15 core languages) + t() Security Hardening + RTL Variant Fix
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None (Task 3 is independent of backend OTP work; can run in parallel with Task 1/2)
- **Files to Modify**: `customer/assets/js/customer-i18n.js` only
- **Description**:
  1. **Add 25 new translation keys** to DICT.en first (copy-paste at the end of DICT.en, before closing `}` of en block, alphabetical after `pic_*` keys):
     ```
     // Transfer dialog strings (post-OTP removal)
     xfer_dialogTitle: "Transfer Authorization",
     xfer_confirmTitle: "Confirm Transfer",
     xfer_proceedToConfirm: "Proceed to Confirmation",
     xfer_backToPin: "← Back to PIN",
     xfer_confirmButton: "Confirm Transfer",
     xfer_cancelButton: "Cancel",
     xfer_pinLabel: "Transfer PIN",
     xfer_pinPlaceholder: "Enter your 6-digit Transfer PIN",
     xfer_pinRequired: "Transfer PIN is required",
     xfer_pinRequired6d: "Transfer PIN must be exactly 6 numeric digits",
     xfer_pinInvalid: "Invalid Transfer PIN",
     xfer_pinVerified: "Transfer PIN verified successfully",
     xfer_sealedNotice: "Transfer parameters have been cryptographically sealed",
     xfer_processing: "Verifying Transfer PIN and processing transfer...",
     xfer_success: "Transfer completed successfully",
     xfer_failed: "Transfer failed",
     xfer_amountLabel: "Amount",
     xfer_recipientLabel: "Recipient",
     xfer_referenceLabel: "Reference",
     xfer_newBalanceLabel: "New Balance",
     xfer_errorOtpBlocked: "OTP authentication is permanently disabled. Use your Transfer PIN exclusively.",
     xfer_reviewHeading: "Review and Confirm",
     xfer_feeLabel: "Fee",
     xfer_totalLabel: "Total Debit",
     xfer_sendingLabel: "Sending to your Transfer PIN-protected transfer"
     ```
  2. Add these SAME 25 keys with properly translated banking-domain values to each of the 14 other fully-supported dicts: `es`, `fr`, `de`, `pt`, `ru`, `zh`, `ar`, `it`, `nl`, `tr`, `ja`, `ko`, `vi`, `hi`. Use the existing style/vocabulary for each language:
     - Reuse `pin_title` / `pin_saved` root word for "PIN" in each language (e.g., Spanish uses "PIN" already; check existing DICT).
     - Reuse `actions_transfer` / `intl_title` root word for "Transfer".
     - Reuse `intl_fee` / `intl_submit` existing terms where applicable.
     - RTL languages `ar`, `fa`, `ur`, `ps`, `ku`: ensure punctuation placement does not break visual flow; trailing colon ":" is fine as-is in most RTL renderers because it's direction-neutral.
     - CJK languages `zh`, `ja`, `ko`: no spaces around punctuation after translation; match existing style (e.g. DICT.zh's `pin_title: "账户 PIN"` uses space appropriately).
  3. **t() Security Fix**: Around line 3521, modify the `t(code, key, vars)` function:
     - Add a `function escapeRegex(str)` helper inside scope of the factory (or inline) that escapes regex special characters: `return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');` — use existing `escapeHtml` at line 3534 for HTML.
     - In the `vars` loop (lines 3525-3529), before creating the RegExp, pass `k` through `escapeRegex`.
     - Before substitution, pass `vars[k]` through `escapeHtml` (already defined in same module around line 3534).
     - After substitutions, wrap the final returned `str` in `escapeHtml(str)` ONLY IF this function is the default `t()`. Wait — if we escape the dict template string that contains `{{amount}}`, we'd also escape the dict's own `<i>` tags (but dict strings today do not contain HTML). Confirm no dict string contains raw HTML: `grep DICT blocks for "<" chars in string values — none found that aren't text-content "<" in Chinese/Japanese. Safest: escape ONLY the interpolated var values (NOT the dict template), because dict is trusted. Return the dict template with escaped vars substituted. This is the default; we do NOT add tRaw variant because no dict contains HTML today and no call site needs it. So modify: after `let str = ...dict string template...`, for each var in vars loop, substitute `{{k}}` with `escapeHtml(String(vars[k]))` using a key-regex that was built with `escapeRegex(k)`. Return `str` as-is (already HTML-safe template + HTML-safe vars). Do NOT call escapeHtml on the whole str, because that would double-escape if future HTML-aware variants were added.
  4. **applyLanguageToDocument Security Fix**: Around line 3566 inside the `varsObj` loop (for `data-i18n-vars`), apply same `escapeRegex(k)` to key + `escapeHtml(varsObj[k])` to value before doing `str.replace(...)`. Use the same `escapeRegex` helper created in step 3.
  5. **RTL regional-variant fix**: Around line 3548, the current `RTL_BASES` check uses `base = String(code || "en").split("-")[0].toLowerCase()` then checks `RTL_BASES.has(base)`. This is correct for `ar-SA` → `ar` in set. BUT: confirm the set contains every code that needs RTL: `["ar","he","fa","ur","ps","ku","sd","ug","yi","syc","dv"]` — per spec, already set. Add an explicit sanity-check: after applying `root.setAttribute("dir", rtl ? "rtl" : "ltr")` return value nothing extra. No code changes needed here if logic is already correct; instead, add an assertion in the TRs. Actually, make ONE change: refactor to `const base = normalizeLangBase(code); helper function normalizeLangBase(str) { return String(str||"en").split("-")[0].toLowerCase(); }` — use it in both the dir check AND the RTL set, then re-use it in `dictForCode` if possible (reduces code duplication). Small change, optional unless the duplicate split logic is broken today. If `dictForCode` already uses the same logic, skip re-factoring and just verify both functions have equivalent split.
  6. After editing, run a JavaScript syntax check: since customer-i18n.js is browser-only UMD, check with `node --check customer/assets/js/customer-i18n.js`. Node.js may choke on `document` and `self` references but with `--check` it only parses AST — no execution. Passes if no `SyntaxError`.
- **Acceptance Criteria Addressed**: AC-B1, AC-B3, AC-B4, AC-B5
- **Test Requirements**:
  - `rule` TR-3.1: Node.js check script `node -e "const f=require('./customer/assets/js/customer-i18n.js'); const codes=['en','es','fr','de','pt','ru','zh','ar','it','nl','tr','ja','ko','vi','hi']; const keys=['xfer_dialogTitle','xfer_confirmTitle','xfer_proceedToConfirm','xfer_backToPin','xfer_confirmButton','xfer_cancelButton','xfer_pinLabel','xfer_pinPlaceholder','xfer_pinRequired','xfer_pinRequired6d','xfer_pinInvalid','xfer_pinVerified','xfer_sealedNotice','xfer_processing','xfer_success','xfer_failed','xfer_amountLabel','xfer_recipientLabel','xfer_referenceLabel','xfer_newBalanceLabel','xfer_errorOtpBlocked','xfer_reviewHeading','xfer_feeLabel','xfer_totalLabel','xfer_sendingLabel']; codes.forEach(c=>keys.forEach(k=>{const v=f.I18N.t(c,k); if(!v || v===k) throw new Error(c+'/'+k+' missing: '+v);})); console.log('OK');"` → prints "OK".
  - `rule` TR-3.2: Node.js test of HTML escaping: `node -e "const f=require('./customer/assets/js/customer-i18n.js'); const out=f.I18N.t('en','xfer_sendingLabel',{amount:'<script>alert(1)</script>USD 100',weird:'a.{2}b'}); console.log(out); if(out.includes('<script>')) throw new Error('unescaped!');"` → script tags are escaped to `&lt;script&gt;` in output (no literal `<script>` substring present).
  - `rule` TR-3.3: For each of the 6 RTL/regional codes (ar-SA, he-IL, fa-IR, ur-PK, ps-AF, ku-IQ), after calling `applyLanguageToDocument`, verify `document.documentElement.dir === 'rtl'` (can test with jsdom if available, else simulate in Node: extract the `base = code.split("-")[0].toLowerCase()` branch logic directly). Result: ALL six regional codes map to an RTL base, so dir would be 'rtl'.
  - `rubric` TR-3.4: Translation banking-domain correctness; scale 1-5; anchors 1 = obvious machine translation gibberish mismatches; 3 = understandable but some incorrect financial terms; 5 = correct reuse of existing DICT financial terms in each language (pin_title root, intl_title root, etc.); threshold >= 4; evidence = spot-check translations for 25 keys across 5 non-English languages (es, fr, ar, zh, ja) against known correct existing strings (pin_title, actions_transfer, intl_fee, etc.).

## Task 4: Frontend dashboard.php Standalone Transfer Modal (OTP removal + no request-otp + only Transfer PIN payload)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (since endpoint /request-otp is deleted; dashboard.php would 404 if it still calls it)
- **Files to Modify**: `customer/dashboard.php` only (standalone modal block ~lines 2920-3040 area)
- **Description**:
  1. Locate the standalone `submitBtn.addEventListener("click", ...)` handler in dashboard.php that opens the Transfer PIN modal/prompt (it was previously patched in the earlier session to skip Swal OTP prompt but still calls `/api/customer/transfer/request-otp`). Read the code carefully to find:
     - `fetchJson("/api/customer/transfer/request-otp", ...)` — REMOVE this fetch call ENTIRELY.
     - Replace the old flow with a DIRECT flow: after `requestBody.transferPin = code; requestBody.transferCode = code;` → immediately call `doExecuteTransfer("")` (no OTP parameter).
     - Adjust the error messages: where old code says "Unable to generate verification code", "Failed to send verification code", or any message containing "code" / "OTP" / "verification" / "email" / "sent" in the transfer PIN entry context → replace with Transfer PIN appropriate messages:
       - Old error: *"Unable to generate verification code."* → New: *"Unable to verify Transfer PIN."*
       - Old error: *"Failed to send verification code."* → New: *"Failed to verify Transfer PIN. Please try again."*
     - Change the success toast from the prior patch *"Transfer PIN verified. Processing transfer..."* to use the i18n-translated `xfer_pinVerified` or `xfer_processing` string via `VT.I18N.t(ctx.language || 'en', 'xfer_processing')` — but if `VT.I18N` is not available in dashboard.php script context (check if customer-i18n.js is actually included in dashboard.php HEAD before this block runs), then use hardcoded English for now and add comment noting i18n dependency — but confirm inclusion first: grep dashboard.php `<script src="...customer-i18n.js...">` — if loaded, use VT.I18N.t call. Otherwise fall back to hardcoded English text (NOT a failure reason; AC-B2 covers integration on pages where i18n loads).
  2. In `function doExecuteTransfer(otpCode)` signature: rename `otpCode` parameter to `_ignored` or remove the parameter entirely. Inside doExecuteTransfer, where it builds `bodyObj = Object.assign({}, requestBody, { otp: otpCode, transferCode: otpCode })` → REMOVE the `otp` key and any `transferOtp` key. The `transferCode` value should be the Transfer PIN (which already lives in `requestBody.transferCode = code` from outside). So change bodyObj assignment to: `var bodyObj = Object.assign({}, requestBody);` → otp/transferOtp/candidateOtp fields are NOT included. They would otherwise trigger the OTP guard in Task 2 and cause 400 rejections with our xfer_errorOtpBlocked message. CRITICAL: ensure body has NO `otp` field, no `verificationCode`, no `code` (unless that field was for PIN elsewhere). Rename any lingering `code` usages → map to `transferPin` / `transferCode` only.
  3. Remove Swal OTP prompt + window.prompt OTP prompt ENTIRE blocks if they still exist (earlier patch removed most but double check). If hasSwal branch calls `window.Swal.fire({ title: "Email Verification Code" ...})` — DELETE that entire hasSwal branch block and the else window.prompt branch. After DELETE, the `request-otp` success handler directly calls doExecuteTransfer and only has a toast, no prompts. Leave error handling branches.
  4. Verify dashboard.php remains a valid PHP file after edits: `php -l customer/dashboard.php` if PHP CLI is available on this Windows box; else run lint via syntax visual inspection (balanced `<?php` tags, no stray JavaScript `}` unclosed).
- **Acceptance Criteria Addressed**: AC-A6 (dashboard-specific part), AC-B6 (dashboard-specific part if VT.I18N available)
- **Test Requirements**:
  - `rule` TR-4.1: `grep -n "request-otp\|otpCode\|candidateOtp\|transferOtp" customer/dashboard.php` in executable JS blocks (not inside comments) → ZERO lines. All matches are comments/strings only OR are in dead code branches (if any dead code remains, delete it anyway). `otpCode` parameter rename must have occurred.
  - `rule` TR-4.2: Browse to dashboard.php with a transfer, open DevTools Network tab. Click "Send" and follow the request flow. Network tab shows EXACTLY ONE fetch during the modal's execution: POST `/api/customer/transfer` (plus pre-existing /api/me if ctx not cached). There must be ZERO requests to `/request-otp` (HTTP 404 would appear as a failed row if still called — no such row allowed).
  - `rule` TR-4.3: In DevTools Network inspector, inspect the POST /api/customer/transfer request's JSON payload. The top-level keys MUST NOT include `otp`, `transferOtp`, `verificationCode`, `otpCode`, `code`, `twoFactorCode`, `confirmCode`, `secureCode`, `authCode`. If `transferCode` OR `transferPin` is present (valid), allow both. Any other forbidden key in the request → TR-4.3 fail.

## Task 5: Frontend auth-session.js Dialog (Collapse PIN+OTP → PIN-Only 2-Phase + Translate Strings + Collapse request-otp)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (since /request-otp deleted) + Task 3 (new translation keys available in DICT)
- **Files to Modify**: `customer/assets/js/auth-session.js` only
- **Description**:
  1. **Phase Collapse**: In the main `showCombinedPinAndOtpDialog()` closure, find all references to `phase === "otp"` (or phase `"otp"`) in conditionals, enums, and dispatch tables.
     - Rename available phases to ONLY: `"pin"` and `"confirm"`.
     - Remove phase variable assignments that set `phase = "otp"`.
     - In `openConfirmOrPinOtp()` function (or whatever the phase switcher is named), remove the entire `case "otp"` render branch that creates OTP `<input>`, resend button, "Send Verification Code" labels, and `otpSent`-conditional messages.
     - Remove `phase = "confirm"` branches that were gated on prior OTP success; now they run directly after PIN phase.
  2. **Variables Cleanup**: Remove from closure: `otpSent`, `otpPhaseRetryKey`, `confirmedOtp`. Keep ONLY: `pinVal`, `phase`, dialog element references. If `confirmedOtp` was referenced in the final Promise resolution (old return `{ transferPin, otp }`), change the resolved shape to `{ transferPin }` ONLY. Update ALL callers of the Promise (usually `processTransfer()` function in same file) to not expect `otp` field in the returned object.
  3. **Remove `/api/customer/transfer/request-otp` fetch**: Locate `onSendOtp()` handler (or `fetchJson("/api/customer/transfer/request-otp",...)` call). DELETE the entire fetch and its `.then` / `.catch` handlers. In its place: write the new `onPinVerified()` flow:
     - Validate `pinVal` is a non-empty string. If 6-digit numeric validation was required, run `if (!/^\d{6}$/.test(pinVal)) { show inline PIN error with translated xfer_pinRequired6d string; STOP }`. Otherwise proceed.
     - For the UI transition instead of awaiting `/request-otp` response: immediately change `phase = "confirm"`.
     - Build the integrity-sealed confirm body from the closure's original transfer context (amount, recipient, currency, reference, fee if any). Use the EXACT same 7-layer integrity seal that was previously applied after OTP success; do not weaken it. Set the sealed payload body's auth fields to `{ transferPin: pinVal }` only (no otp).
     - Render confirm review screen. Update the "success toast" that the old onSendOtp promise resolved with (toast said "Verification code dispatched...") → replace with translated `xfer_pinVerified`.
  4. **String Translation via VT.I18N.t**: Read the current user's preferred language: `const currentLang = (typeof window !== 'undefined' && window.__vtLang) || (ctx && ctx.language) || 'en';`. Use `const T = (k) => (typeof VT !== 'undefined' && VT.I18N ? VT.I18N.t(currentLang, k) : k);` helper. Then for EVERY dialog string, replace hardcoded English with `T('key')` lookups:
     - Swal title for pin phase → `T('xfer_dialogTitle')`
     - Swal title for confirm phase → `T('xfer_confirmTitle')`
     - "Proceed to Confirmation" button → `T('xfer_proceedToConfirm')`
     - "← Back to PIN" button → `T('xfer_backToPin')`
     - "Confirm Transfer" button → `T('xfer_confirmButton')`
     - "Cancel" button → already covered by existing key `cancel` (DICT.cancel exists in all langs)
     - PIN input `inputPlaceholder` → `T('xfer_pinPlaceholder')`
     - PIN input validator failure messages → `T('xfer_pinRequired')` or `T('xfer_pinRequired6d')` or `T('xfer_pinInvalid')`
     - The inline "Transfer PIN verified successfully" banner → `T('xfer_pinVerified')`
     - Sealed parameters notice → `T('xfer_sealedNotice')`
     - `Swal.showLoading()` processing message overlay → `T('xfer_processing')`
     - Success toast after transfer → `T('xfer_success')` (used in processTransfer catch/then blocks)
     - Final POST response error: if server returns our OTP-blocked error (string comparison), swap in the translated variant `T('xfer_errorOtpBlocked')` so it matches server message in user's language.
     - Review heading, amount label, recipient label, reference label, new balance label, fee label, total debit label → all use `T('xfer_*Label'|Heading)`.
  5. **Remove Resend injection**: The footer OTP resend `<button>` injection code in a `setTimeout` or Swal `didOpen` callback — DELETE lines that appendChild / innerHTML `"<a href=\"#\">Resend Code</a>"` / etc. Remove any `didOpen` hook that was doing OTP input focus (`input.focus()` on OTP input). Replace with PIN input focus on pin phase, confirm button focus on confirm phase.
  6. **processTransfer() Payload Fix**: At the call site where `processTransfer()` calls `/api/customer/transfer`, the fetch POST body was previously `{ transferPin, otp, transferOtp, amount, recipient, ... }`. Change to `{ transferPin, transferCode: transferPin, amount, recipient, reference, ... }` — NO otp, NO transferOtp. Also, if an integrity seal covered `otp`, update the seal hash to exclude OTP (while still covering at least 6 layers of transfer context per the original pattern).
  7. **Syntax check**: `node --check customer/assets/js/auth-session.js`
- **Acceptance Criteria Addressed**: AC-A6 (dialog portion), AC-B2 (international.php integration), AC-B6 (auth-session translation calls)
- **Test Requirements**:
  - `rule` TR-5.1: Grep auth-session.js executable code for `phase.*"otp"\|otpSent\|confirmedOtp\|otpPhaseRetryKey\|request-otp\|Send Verification Code\|resend code\|Resend Code\|sendOtp\|onSendOtp` → ZERO lines. Matches in comments only are allowed.
  - `rule` TR-5.2: Open international.php with preferredLanguage = "es" (set via ctx injection or cookie). Open transfer dialog. Count the number of text strings visibly rendered in the Swal popup (titles, buttons, banners, validation errors). ALL strings must be Spanish (spot-check 10 strings against DICT.es.xfer_* values). No English-only strings visible except for: amount numeric values, currency codes, dates.
  - `rule` TR-5.3: Network trace during dialog. Trigger a transfer flow from start to finish (success). Network panel MUST contain exactly ONE POST to `/api/customer/transfer`. It MUST NOT contain `/request-otp` OR any other call except `/api/me` if lazy ctx load. The payload of /api/customer/transfer: `Object.keys(reqBody).includes('otp') === false` AND no OTP guard triggers (server returns 200 on valid PIN).
  - `rule` TR-5.4: Manually trigger invalid Transfer PIN inside dialog. Click Proceed → dialog shows INLINE error (same popup stays open) with translated "Invalid Transfer PIN" (or `xfer_pinInvalid` lookup). No popup close → invalidates TR-5.4 if popup closes prematurely.
  - `rubric` TR-5.5: Handler capture/rebind fidelity after collapse; scale 1-5; anchors 1 = buttons lost after phase collapse; 3 = works but double-click needed after transition sometimes; 5 = pin→confirm→cancel/back all buttons respond correctly on first click; threshold >= 4; evidence = manual QA click-through across 5 phase transitions.

## Task 6: Cross-Cutting Scope Audit & Final Integration Verification
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5 (implementation done; now verify scope + run integration checks)
- **Files to Modify**: None — read-only verification. If verification reveals gaps, open a new task in Plan phase to remediate (not allowed to slip scope here; any remediation must still be within 6-file allowlist).
- **Description**:
  1. **Pre-implementation review**: Re-read each of the 5 task descriptions above, confirm each only touches files in the allowlist { server/index.js, customer/assets/js/auth-session.js, customer/assets/js/customer-i18n.js, customer/dashboard.php, .trae/specs artifacts }. Transfer task files that inadvertently touch other files → revert, split into new tasks only if user approves AskUserQuestion escalation.
  2. **Post-implementation audit**: Generate a list of modified files via git diff or file-mtime scan. Cross-check against allowlist.
     - If any other file was modified (e.g. dashboard.php edits inadvertently saved international.php, or package.json touched), revert the unintended file.
     - If customer-i18n.js had new DICT entries only (no layout changes), verify no `<script>` tags or HTML were changed outside DICT object.
  3. **Full integration script**: Run a Node.js test script if a helper script `_e2e_transfer_otp_flow.js` exists (pre-existing in root). Adapt it for the PIN-only flow:
     - Step 1: Mint session cookie for test sender.
     - Step 2: POST valid PIN-only transfer request to `/api/customer/transfer`. Assert HTTP 200 + no `otp` in payload + Firestore transaction doc has no `transferOtp`.
     - Step 3: POST same request but inject `otp: "000000"`. Assert HTTP 400 + exact error string.
     - Step 4: POST same request but call `/api/customer/transfer/request-otp`. Assert HTTP 404.
     - Step 5: Test `/api/customer/transfer/execute` alias with steps 2-3 same assertions.
     - Step 6: Create an admin user via `/api/admin/users`; assert no OTP email audit record written in `logs/email-audit/`.
     - Step 7: Translation test: load i18n module, verify 25 new keys x 15 languages have non-empty values. Verify var-escape t() works with malicious script injection test.
  4. Confirm server/index.js `node --check` passes and auth-session.js + customer-i18n.js + dashboard.php all produce valid syntax per their linters.
  5. Compile completion evidence for each task: record curl outputs, grep outputs, Firestore query screenshots or script logs, browser screenshots, etc. and paste into task completion evidence blocks.
- **Acceptance Criteria Addressed**: AC-Scope (via #2 above), and cross-cuts every prior AC (via #3 integration script).
- **Test Requirements**:
  - `rule` TR-6.1: Modified files list is a strict subset of allowlist. Any extra file in diff is a fail.
  - `rule` TR-6.2: Integration script step 2-7 ALL pass (100% pass rate). Single failing step = audit does not pass; loop back to appropriate task with a specific finding.
  - `rule` TR-6.3: After all edits, no running process references OTP functions. Confirm with a full grep of the full repo code folder excluding `.git/` and `logs/` for the 6 identifiers in AC-A1. Pass only if grep returns 0 executable-line matches.
