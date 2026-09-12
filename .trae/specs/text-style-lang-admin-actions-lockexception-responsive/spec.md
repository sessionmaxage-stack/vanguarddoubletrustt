# Spec: UI Text Audit, PIN Styling Fix, Language Dropdown, Admin 3-Actions + Opening-Balance Delete, Admin-Gen Lock Exception, Responsive Overhaul
- Phase: SPECIFY
- Natural language: English (matches user message language)
- Commit message (for user's VCS tracking, drafted ahead for approve-phase): `feat: UI text audit fixes; PIN dialog dark-circle bg removal; customer language dropdown; admin suspend/close/delete actions + opening-balance delete; admin-gen lock exception; global responsive updates`

---

## 1. Problem, Users, Goals
### Problem
Five co-occurring issues in VanguardDoubleTrust customer-facing account UI + admin dashboard + global responsiveness:
1. User account section UI text has spelling/grammar/terminology mistakes (visible even in current Swal dialog screenshots where raw i18n keys `xfer_confirmTitle`, `XFER_RECIPIENTLABEL`, etc. appear as user-facing text instead of translated values).
2. Transfer PIN dialog uses a dark circular/square background (visible as solid black rectangle at the top-right of PIN and Confirm Swals — screenshot evidence confirms circled element = dark black 150x150 placeholder square styled with 50% radius fallback or imageUrl area that is opaque/black. It breaks visual consistency with the app light color system).
3. The user account page (`customer/account.html` + sibling customer PHP pages like dashboard.php) has no language selector. Existing customer-i18n.js exists, but users cannot choose or persist their preferred language from the top of the account page.
4. Admin interface lacks three critical account management actions: SUSPEND, PERMANENTLY CLOSE, DELETE (only the DELETE button was enabled for old accounts in prior spec but SUSPEND/CLOSE are missing entirely). Also, admin user detail pages do not expose a delete for opening-balance history entries (type=OPENING_BALANCE transactions created when admins generate an account; these records are visible in account detail Recent Transactions but admins have no delete hook for them).
5. Admin-created customer accounts can still be locked/inaccessible via standard lock triggers (if any code path sets `account.status = SUSPENDED/BLOCKED/CLOSED/EXPIRED` or calls `auth.updateUser disabled:true` via failed login/inactivity paths). Spec requirement: admin-generated accounts must NEVER be locked, restricted, or marked inaccessible under ANY standard user lock triggers. Additionally: project needs global responsive fixes to render flawlessly across mobile (≤360px), tablet (≤992px), and desktop (>992px) breakpoints.

### Users
- **Customer end-users**: authenticated users visiting `customer/account.html`, `customer/dashboard.php`, `customer/pin.php`, `customer/statement.php` and any authenticated customer PHP pages (login/register excluded from text-correction scope unless on a customer account route). Need accurate UI text, correct PIN dialog look, and language choice.
- **Admin users**: authenticated admins accessing `/admin/dashboard.html`. Need three action buttons (Suspend/Close/Delete) per row and in detail panels; need opening-balance transaction delete in user detail; need audit trail for all actions.

### Goals
1. Every user-facing string in the authenticated-customer account pages: (a) corrected for spelling/grammar/terminology, (b) all untranslated i18n keys (e.g. `xfer_*` in screenshot) resolved by ensuring VT.I18N translation coverage across all customer pages, not just dashboard.php.
2. Remove dark circular background applied to PIN/confirm dialog imageUrl / avatar area in `customer/assets/js/auth-session.js` and `customer/dashboard.php` (SweetAlert2 dark image placeholder square); replace with no image or a transparent/inline icon if required, matching the app light design system (no black block).
3. Implement top-of-page language dropdown on `customer/account.html` (sibling customer page where user lands after login) and make it available cross-page via VT.I18N; selection persisted server-side to `profile.preferredLanguage` via existing POST `customer/profile` route.
4. Admin UI adds three action functions (SUSPEND / PERMANENTLY CLOSE / FULL DELETE) that:
   - Are permission-gated (requireAdminAuth on new POST /api/admin/users/:uid/suspend, /close, /delete endpoints — the last one already exists; reuse DELETE endpoint already built in prior spec).
   - Include confirmation prompts.
   - Log ALL operations to admin activity audit trail (writable collection or local mirror; append-only).
   - Work EXCLUSIVELY on accounts whose `createdBy` === logged-in admin email (or adminGenerated === true AND createdBy matches the current admin session email) — EXCEPTION: global super-admin (owner / ADMIN_EMAIL env) can operate on ALL admin-generated accounts regardless of specific creator.
   - Buttons appear in list view (rowMarkup L834 area) AND in customer review panel.
5. Add a DELETE endpoint for opening-balance entries (type = "OPENING_BALANCE"): POST/DELETE `/api/admin/users/:uid/opening-balances/:txid` — only admins, confirm required, audit-log appended, removed BOTH from users/{uid}/transactions/{txid} AND global transactions/{txid} — because writeTransaction already writes to both, delete must do symmetrically; after delete, immediate reload of review transactions.
6. Admin-generated account PERMANENT EXCEPTION:
   - Before ANY code path mutates `account.status` to {SUSPENDED|BLOCKED|CLOSED|EXPIRED} → check `isAdminGeneratedAccount(user)` first, if true SKIP the lock and log to audit (never actually apply the status change).
   - Before ANY code path calls `auth.updateUser(uid, {disabled:true})` → same guard: if admin-generated account, silently refuse to disable, append to audit.
   - Applies regardless of failed-login-attempts or inactivity-period trigger (inactivity-based locking: any automatic code path to set status = blocked must honor the exception).
   - Must keep admin-generated rows VISIBLE and MANAGEABLE always in admin interface (no CSS filter, no WHERE filter that hides admin-gen from admin list).
7. Global responsiveness. Apply a comprehensive responsive stylesheet overlay to ALL customer-facing authenticated pages (account.html, dashboard.php, myprofile.php, pin.php, password.php, statement.php, transferhistory.php, accountdetails.php, card.php, international.php, stocks.php) AND admin dashboard.html. Focus on: sidebar collapsing/menu toggle on ≤992px, grids wrapping at ≤768px, typography via clamp() not fixed px, swal popup 92vw max-width, all inputs/buttons readable on 320px width without horizontal scroll.

## 2. Non-Goals (explicit exclusions from strict scope per user)
- Do NOT modify the public marketing website (index.html, contact-us.php, assets/css/style.css) except as necessary for responsive global bootstrap where same files are already loaded by customer pages — DO NOT add new classes or IDs to marketing buttons/heroes.
- Do NOT touch Firebase rules in firestore.rules unless strictly required by new endpoints (no new rules introduced if existing admin-auth works).
- Do NOT delete or modify existing transfer/register/login KYC server code paths unrelated to the specific exceptions and actions.
- Do NOT introduce new npm packages. Use sweetalert2 (already present in /npm folder), built-in fetch, localStorage, and CSS clamp()/media queries.
- Do NOT change the semantics of `isAdminGeneratedAccount()` helper at server/index.js L431-459 (MUST NOT edit). All lock-exception logic uses the helper as-is.
- Do NOT remove the existing DELETE endpoint /api/admin/users/:uid (already implemented with cascade); use it as-is for the "FULL DELETE" admin action.
- Do NOT add i18n files for new languages other than extending the existing customer-i18n.js DICT object with additional languages using a configurable list (the list is governed by an open question answered via ask-user or a sensible default curated by implementer if user answers with option A).

---

## 3. Functional Requirements (FR)
Every FR maps to an AC below.

### FR-1 — Customer Account Section UI Text Audit & Correction
1.1 Walk every customer authenticated page. Correct:
  - Spelling errors (e.g. screenshot has `transfered` misspelled on L213 in dashboard.php `showCustomTxSuccessOverlay` HTML; fix to `transferred`).
  - Grammar errors.
  - Inaccurate terminology (e.g. "Transfer Code" / "Account PIN" where only one is required now that OTP is removed — ensure consistent industry-standard naming: "Account PIN" = login? No — per prior spec: "Transfer PIN" = transfer auth credential; label consistently as "Transfer PIN (6 digits)"; remove "Transaction Code" misnomer where inconsistent).
  - Untranslated raw i18n keys displayed to end-user: ensure every `T('x')` call made in auth-session.js returns a value AND for pages that load customer-i18n.js but do not bootstrap it (account.html, myprofile.php, pin.php, password.php, statement.php, transferhistory.php, accountdetails.php, card.php, international.php, stocks.php) — add a small bootstrap script that calls `window.__vtLang = preferredLanguage; VT.I18N.bootstrapLangElements(document);` if available. This is the screenshot root cause: Swal titles show `xfer_confirmTitle` because VT.I18N.t() is falling back to the key since lang bootstrap was not applied globally for non-dashboard pages.

### FR-2 — PIN Dialog Styling Fix: Remove Dark Circular/Square Background
2.1 In `customer/assets/js/auth-session.js` inside `showCombinedPinAndOtpDialog` (currently around L1235-1868), remove every imageUrl / imageHeight / imageWidth / background-black / background:000000 styling applied to the Swal that produces a dark circle or square. If imageUrl is undefined, a SweetAlert2 swal2-image placeholder with default black/dark bg can appear (this matches the circled screenshots). Solution: explicitly do NOT set imageUrl anywhere in showCombinedPinAndOtpDialog; also add style injection that sets `.swal2-image { background-color: transparent !important; min-height: 0 !important; max-height: 0 !important; display: none !important; }` for this dialog class when no image is in use (or more globally for PIN dialog wrapper).
2.2 In `customer/dashboard.php` inside any Swal.fire() calls for PIN prompt or confirm (existing code around L2967's doExecuteTransfer) and customTxSuccess overlay — apply the same transparent/no-image rules.
2.3 If dashboard.php custom-tx-success overlay has a large green circular background with checkmark (L200-207 region currently at width:96px, height:96px, border-radius:50%, background:#10b981) this is NOT the dark square being removed (user complaint is specifically the PIN input area dark circle). Keep the green success check circle untouched.

### FR-3 — Language Translator Dropdown on User Account Page
3.1 On the account page `customer/account.html`, in the top-right area of the hero (next to or above the Logout button in L199-202 region), inject a functional `<select>` dropdown for language preference.
  - Label: "Preferred Language" or icon (globe icon from font-awesome is loaded in account.html via L12).
  - Options: read from configurable `VT.I18N.SUPPORTED_LANGS` array populated from the DICT keys of customer-i18n.js (at minimum en, es — extended by open-question answer).
  - Responsive layout: ≤480px stack label+select as full-width row; ≥480px inline next to Logout button using flexbox wrap (hero already has display:flex; flex-wrap:wrap at L100).
3.2 Language persistence: On change → (a) call `VT.I18N.setLang(selected)` locally; (b) POST to existing profile save endpoint to persist `preferredLanguage` in user profile.preferredLanguage server field (existing route L851 region handles preferredLanguage writes — no new DB schema required).
3.3 Bootstrap translation: When the page loads, fetch `/api/me` for authenticated user, extract `preferredLanguage`, and call `VT.I18N.bootstrapLangElements(document)` so all `data-i18n="key"` attributes are replaced with the translated value. This is the DIRECT FIX for the screenshot untranslated `xfer_*` keys in non-dashboard pages that currently do not run the bootstrap.
3.4 Full coverage: Dropdown script loaded for ALL customer authenticated pages listed above (account.html + PHP siblings), not just account.html. Create a reusable `<script>` snippet in customer/ folder OR inject inline into each page's `<head>` with a `<script src="assets/js/runtime-config.js">` already loaded — extend runtime-config.js with `VT.UI.initLangDropdown(container, opts)` function.

### FR-4 — Admin: Suspend / Close / Delete Three Actions + Opening-Balance Entry Delete
4.1 POST /api/admin/users/:uid/suspend — server endpoint (requireAdminAuth):
  - Only allowed when logged-in admin email matches the user's `createdBy` field OR `ADMIN_EMAIL === req.admin.email` (super-owner); otherwise HTTP 403 + "You can only suspend accounts created by your administrator account."
  - Confirm on client: yes/no Swal or confirm().
  - Sets account.status = "SUSPENDED" for the target; also auth.updateUser disabled:false (we do NOT disable Firebase auth for suspend, just internal account status so the customer login flow will show "Account Suspended" via existing middleware checks).
  - Append to adminAudit log: {timestamp, adminEmail, action:"SUSPEND", targetUid, note:"status set to SUSPENDED"}.
4.2 POST /api/admin/users/:uid/close — PERMANENTLY CLOSE:
  - Same permission scope (admin-created-by OR global-owner).
  - Sets account.status = "CLOSED"; write a transaction note "Account permanently closed by admin {email}".
  - Append to adminAudit log: {ts, adminEmail, action:"CLOSE", targetUid}.
4.3 FULL DELETE: Reuse the existing DELETE /api/admin/users/:uid (from prior spec with cascade) as the "FULL DELETE" action. Add permission scope at the SERVER: DELETE endpoint already has admin-auth but MUST add the same createdBy === req.admin.email === ADMIN_EMAIL gating as suspend/close (override the current generic allow-any-admin to delete old accounts with: creator OR owner). This is a tighter guard consistent with user's instruction that the 3 actions "work exclusively on user accounts that the logged-in admin has created" — applies to delete as well.
4.4 Both admin row (rowMarkup in admin-session.js L834) AND review panel (renderCustomerReview L138) add 3 buttons: Suspend (amber), Close (maroon), Delete (red). Row buttons: small inline below existing save/delete block or replace existing mono Delete with a 3-button group. Confirm dialogs text match FR-1 wording style.
4.5 NEW: DELETE /api/admin/users/:uid/opening-balances/:txid endpoint. Conditions:
  - requireAdminAuth.
  - CreatedBy === req.admin.email OR admin super-owner.
  - Target transaction must have type === "OPENING_BALANCE", uid === users/:uid, AND exist in BOTH users/{uid}/transactions/{txid} AND global transactions/{txid}.
  - Hard delete both docs atomically via Firestore batch.delete().
  - Append adminAudit log entry with txid, amount, uid, adminEmail, action:"DELETE_OPENING_BALANCE".
  - Return 200 {deleted:true, txid}. On any condition failure 403/404 with exact error messages.
4.6 Client side: in renderCustomerReview function, inside the txRowsHtml map, add a small DELETE button only on rows where t.type === "OPENING_BALANCE". Confirm typed "DELETE" prompt (same pattern as user delete). On success, reload the review panel (loadCustomerReview(uid) → re-renders transactions without the deleted row). On failure, flash error.

### FR-5 — Admin-Generated Customer Account Permanent Lock Exception (NO LOCK EVER)
5.1 Server-side sweeping guard applied at EVERY mutation point where account.status can be set to one of {SUSPENDED, BLOCKED, CLOSED, EXPIRED}:
  - Current mutation sites: (a) existing PATCH /api/admin/users/:uid at L2486-2695 region (admin edits status) — we should ALLOW this because the admin is MANUALLY changing status (not an automated trigger); the permanent exception is for STANDARD USER LOCK TRIGGERS (failed logins / inactivity automations / failed-penalty-code paths), NOT manual admin status changes. Exclude manual admin-initiated POST /api/admin/users/:uid/suspend/close (those ARE admin-initiated and intentional admin actions, NOT standard lock triggers — we want to continue allowing admin to suspend/close his OWN created accounts per FR-4.1/4.2). So the exception's coverage: ONLY automated standard user triggers (login failures, inactivity periods — which currently may not exist as implemented paths, but the exception is a safeguard). If ANY current or future automated code path (outside of POST /api/admin/users/:uid/suspend, POST /api/admin/users/:uid/close, manual admin PATCH status) writes account.status ∈ {SUSPENDED, BLOCKED, CLOSED, EXPIRED} OR calls auth.updateUser disabled:true, we must guard it with: if (isAdminGeneratedAccount(uid)) { log to audit "Prevented auto-lock of admin-generated account {uid}"; do NOT perform the mutation; return (not an error, silent skip + log) }.
  - Locations to add a write-time guard: introduce a new helper `function applyAccountStatusMutation(targetUid, requestedStatus, isAdminInitiated)` that returns true if written, false if exception skipped.
5.2 Also, on customer-visible side: when requireAuth middleware loads the customer doc (if any path attempts to show "account locked" for admin-created customers that somehow had a CLOSED status set via an admin who intentionally closed it, ALLOW that to show — because admin-initiated CLOSE is intentional (it's FR-4.2). So: don't blanket un-do admin-set status. The exception ONLY AUTOMATED LOCKS; manual admin CLOSE/SUSPEND still take effect (because admin created the account). Admin's own DELETE/SUSPEND/CLOSE are exempted from the exception — they are not "standard user lock triggers". This nuance is critical to avoid breaking FR-4.
5.3 Admin list/interface visibility: NO filter hiding admin-generated rows. Admin list currently shows all users (L1879 region). Keep it. Ensure UI can still click to open review even if status is SUSPENDED/CLOSED (no CSS pointer-events:none on admin-gen rows with non-ACTIVE status).

### FR-6 — Global Responsive Overhaul Across Customer + Admin Authenticated Pages
6.1 Customer pages sidebar/grid: dashboard.php currently has @media breakpoints 1100/992/900/720/560/480 (see grep L343/636/668/732/860/981). Audit each sibling PHP/HTML page (account.html, myprofile.php, pin.php, password.php, statement.php, transferhistory.php, accountdetails.php, card.php, international.php, stocks.php) and ADD equivalent responsive inline style blocks with @media rules if missing:
  - Sidebar at ≤992px: overlay/hidden by default, with a hamburger toggle button (use Font Awesome `bars` icon from font-awesome already loaded on those pages). Add a top-bar hamburger if missing.
  - Hero card padding: clamp(16px, 3vw, 28px) instead of fixed 26px.
  - Typography headings: `font-size: clamp(18px, 4vw, 28px)`.
  - Inputs/buttons min-height 44px (WCAG touch target minimum) on ≤560px.
  - Tables (statement/transferhistory): on ≤560px overflow-x: auto wrapper; or convert rows to cards.
6.2 Admin dashboard.html responsive: Add media breakpoint styles for dashboard list (currently the admin list has 6 columns). On ≤768px: balance column width narrows, status select shrinks, row buttons stack vertically. On ≤560px: wrap email cell, use grid layout for table cells (stacked blocks instead of inline rows). Admin review panel on mobile: review-grid uses CSS grid with `grid-template-columns: 1fr` on ≤900px vs 2 columns desktop.
6.3 SweetAlert2 popups responsive: showCombinedPinAndOtpDialog already has style injection L1252-1407 (clamp() + 92vw + flex-wrap for actions). Ensure dashboard.php Swal.fire calls (new language dropdown success flash; confirm flashes; PIN entry; delete prompts) inherit this by placing the responsive injection globally via customer-i18n.js bootstrap OR by loading a single shared customer responsive stylesheet.
6.4 No horizontal scrollbar at ≥320px width (Chrome DevTools 320x568 device simulated) — this is the rubric-pass evidence.

---

## 4. Non-Functional Requirements (NFRs)
1. **SCOPE-ISOLATION (CRITICAL NFR)**. Only the following files are PERMITTED to change. Any other file change = FAIL.
   - **Source files allowlist** (10 files):
     1. `server/index.js` (new endpoints POST suspend/close, DELETE opening-balance, applyAccountStatusMutation guard, adminAudit append helper, tiny /api/me projection addition of `adminCreatedByEmail: String(profile.createdBy||userData.createdBy||"")` so client-side knows if logged-in admin created this account — this is the ONLY additive key to /api/me; no other keys touched).
     2. `customer/assets/js/auth-session.js` (i18n bootstrap improvements; remove PIN dialog dark bg; T('xfer_*') coverage audit; responsive Swal style extension).
     3. `customer/assets/js/customer-i18n.js` (extend DICT with additional supported languages per configurable list; add `VT.I18N.SUPPORTED_LANGS` export; add `bootstrapLangElements(root)` helper).
     4. `customer/assets/js/runtime-config.js` (add `VT.UI.initLangDropdown(container, {saveEndpoint, allowedLangs})` helper for language dropdown).
     5. `customer/account.html` (top-right language dropdown next to Logout; wire up VT.UI.initLangDropdown; add data-i18n attrs).
     6. `customer/dashboard.php` (typo fixes: `transfered` → `transferred`; bootstrap customer-i18n; data-i18n attrs on hero nav items; responsive overlay clamp improvements; PIN prompt Swal no dark image background).
     7. Customer sibling PHP/HTML pages (8 pages total scope-listed): `myprofile.php`, `pin.php`, `password.php`, `statement.php`, `transferhistory.php`, `accountdetails.php`, `card.php`, `international.php`, `stocks.php`. Max changes per page: (a) add responsive inline style block if missing; (b) add data-i18n bootstrap script tag that calls VT.I18N after DOM ready; (c) add language dropdown if hero exists with logout button.
     8. `admin/dashboard.html` (list view 3-action group; review panel 3-action group; opening-balance delete button injector; admin responsive styles + mobile grid).
     9. `admin/assets/js/admin-session.js` (rowMarkup 3-button group; review 3-action; opening-balance delete client wiring with typed confirm; permission check via admin-createdBy session; flash messages; reload on success).
   - **Spec artifacts**: always allowed.
   - **Forbidden files**: ALL others. This specifically includes `firebase.rules`, `package.json`, `server/transferOtp.js` (legacy), `index.html` (public marketing), `assets/css/style.css`, `css2-*`, `ajax/libs/**`, any new files in `/data/` except appending to an admin audit local mirror JSON file if needed.

2. **No new npm dependencies**. Zero. Every new feature uses only sweetalert2 (already vendored), Font Awesome (already loaded), CSS clamp() + @media queries, native Fetch API, and native localStorage/matchMedia.

3. **Accessibility WCAG 2.1 AA minimum touch targets 44×44 px for all new buttons/inputs on customer/admin dashboards at ≤560px breakpoint**. Language dropdown, PIN inputs, admin 3-action buttons — each has explicit min-height/min-width 44px on mobile.

4. **Zero existing functionality regression**. Specifically:
   - Prior spec artifacts otp-removal-translation-audit: POST /api/customer/transfer/request-otp MUST still return 404. (Regressed = spec fail.)
   - Prior spec admin-delay-delete: DELETE /api/admin/users/:uid with isOldAccount logic MUST still function exactly as before EXCEPT for the new createdBy === req.admin.email permission guard. (Regressed = spec fail.)
   - `isAdminGeneratedAccount()` server helper NOT modified.
   - /api/me ALL existing keys preserved in order (only ONE NEW key allowed: `adminCreatedByEmail` as nullable string for the new frontend permission-visible scope).

5. **All new JS edited files must pass `node --check` syntax validation**; for PHP pages edited: `php -l` no syntax errors OR balanced brace/paren visual scan if php CLI unavailable.

6. **Audit log privacy + append-only**: Admin audit entries NEVER contain plaintext PINs/passwords. Audit is append-only. Stored in Firestore `adminAudit` collection (new) with documents like {ts, adminEmail, action, targetUid, note, ip? optional}. No schema migration — create collection lazily on first write. Also mirror local append to `server/data/adminAudit.jsonl` if server/data folder exists (use read/write local mirror pattern identical to `readLocalUsers`/`writeLocalUsers` already used for localUsers mirror).

7. **Idempotency of lock-exception guard**: If `applyAccountStatusMutation()` is called N times with same admin-gen uid + same requestedStatus (non-admin-initiated), guard skips write every time and appends at most one log per hour per (uid, action) pair to avoid log flooding.

---

## 5. Constraints, Dependencies, Assumptions
### Constraints
- The user explicitly said "strictly refrain from altering any other functionality or code elements beyond what is explicitly outlined". So:
  - No route changes to existing auth middleware.
  - No new KYC required fields.
  - No changes to transfer validation order except where lock-exception guard might protect admin-gen accounts from an auto-suspend during transfer (no changes needed — transfer validation checks ACTIVE status, and admin-gen exception never writes ACTIVE → SUSPENDED via automation; transfer validation is safe).
- Account PIN dialog dark circle removal must NOT break flow of showCombinedPinAndOtpDialog Promise resolve semantics.
- Language dropdown MUST use existing POST profile route (not introduce new persist endpoint).

### Dependencies
- Pages `customer/account.html` currently loads: firebase-compat, firebase-config.js, auth-session.js. It DOES NOT currently load customer-i18n.js or runtime-config.js. Feature FR-3 REQUIRES loading customer-i18n.js (for DICT and VT.I18N object) plus runtime-config.js on ALL customer pages that receive the lang dropdown. So adding <script src="assets/js/customer-i18n.js"></script> to account.html + 9 sibling pages is PERMITTED under NFR scope (since it's loading an existing JS file, not creating files).

### Assumptions
- `ADMIN_EMAIL` env variable (declared in .env L56 region) identifies the global owner-admin who can act on ANY admin-created account, not just their own creations. For all other admin accounts (if multiple admins supported in the future), createdBy === req.admin.email exact match requirement.
- Admin session req.admin.email already populated by requireAdminAuth in server/index.js L609 region (verify via existing code).
- Customer pages /api/me call returns existing preferredLanguage via L700-779 — already verified true at prior spec grep result 700 preferredLanguage, 733, 779.
- Mobile ≤ 320px widths are supported by clamp() values. For 240px widths: allow horizontal scroll, rubric is ≥320px.

---

## 6. Open Questions (require user answer before APPROVE phase)
Q1. **New language support list (FR-3 configurable + FR-1 translation audit coverage).** Customer-i18n.js DICT currently has `en` and `es` entries only. Recommended default extension = add `fr (Français), de (Deutsch), ar (العربية, RTL basic supported via dir="auto"), zh-CN (简体中文), pt-BR (Português BR)` for a total of 7 languages. All new language entries are shallow translations using Google-translate equivalents of the existing en strings (acceptable because this is a configurable list with best-effort translation, with English always as fallback; each new lang entry must have ALL keys defined to avoid untranslated keys). User, choose one option:
  A. [Recommended, covers most global users] Use the 7-language default: en, es, fr, de, ar, zh-CN, pt-BR. Shallow translations.
  B. Keep only existing en + es (no new languages added to DICT; language dropdown only has 2 entries).
  C. Custom — I will provide a list of language codes + translations.

Q2. **Admin activity audit trail storage (FR-4, FR-5, FR-6).** Recommended: Dual write Firestore adminAudit collection + local JSONL mirror at `server/data/adminAudit.jsonl`. This gives durability (Firestore) + quick local inspection/debug (JSONL). This matches the existing pattern for localUsers. User:
  A. [Recommended] Dual write (Firestore + local JSONL mirror).
  B. Firestore only.
  C. Local JSONL only.

Q3. **Admin action permission scope: super-owner override for DELETE/SUSPEND/CLOSE.** Recommended: ADMIN_EMAIL env super-owner can act on ALL admin-created accounts; other admins only on their own createdBy matches. User:
  A. [Recommended] Owner override as described.
  B. NO owner override — every admin only acts on accounts with createdBy === their own email (even ADMIN_EMAIL owner is blocked from others' created accounts). This is stricter.

Q4. **Lock exception: automated inactivity/failed-login paths.** I found NO active code paths that automatically set account.status to BLOCKED on failed login attempts or for inactivity. The project may add these in the future. Scope of FR-5 permanent exception:
  A. [Recommended] Defensive-only implementation: introduce `applyAccountStatusMutation(targetUid, requestedStatus, isAdminInitiated)` helper. For any NEW future code path that wants to mutate status, it must use this helper (the helper is exported). The helper does the admin-gen exception check (skip if automated + admin-gen). Existing POST admin suspend/close call it with isAdminInitiated=true (so they still write, as FR-4 intends). This is a "future-proof" guard. (No currently-executing broken paths are being "fixed" because none exist today; it's a defensive hook per spec requirement.)
  B. Find and explicitly patch ALL CURRENT existing mutation sites that set status (only PATCH /api/admin/users/:uid is manual admin-initiated; already exempt). Do NOT add a generic helper; leave it at documentation note in code. (Narrower.)

Q5. **Global responsive scope for customer sibling pages.** User wrote: "also add responsiveness to this project all over". Interpreting "all over" = authenticated customer pages (account.html + 9 PHP) + admin dashboard.html (as per constraint NFR-1 allowlist). Public marketing index.html excluded unless already loaded by those customer pages (it's not — customer pages load app.min.css, not public style.css). Confirm interpretation correct:
  A. [Recommended] Responsive = authenticated customer pages (10 files) + admin dashboard.html ONLY (marketing excluded).
  B. Include marketing index.html + contact-us.php in responsive overhaul too (broader, outside strict allowlist — requires modifying NFR-1).

Q6. **PIN dialog dark circle: what it is (from screenshots + code path grep).** I concluded it's the SweetAlert2 `imageUrl` placeholder rendered with default opaque/dark swal2-image container (width 100% / 150px default block colored by background:#000 or similar dark-theme CSS). Root fix: do NOT pass imageUrl in PIN/confirm Swal.fire() calls (none are passed currently in L1782-1868 — good) AND add an explicit injected style in PIN dialog's style block to hide .swal2-image completely (display:none !important; min-height:0; background:transparent). User:
  A. [Recommended] Do the injected style to hide .swal2-image in showCombinedPinAndOtpDialog + add global rule for dashboard.php Swal.
  B. Investigate actual imageUrl parameter usage further — I'll give more context.

---

## 7. Acceptance Criteria (typed rule|rubric)
### FR-1 — UI Text Audit ACs
- **FR-AC-1.1 (rule)**: grep "transfered" in all customer-edited source files returns 0 matches (typo fixed to transferred everywhere). Evidence source: grep -R "transfered" customer/ server/ admin/ after implementation.
- **FR-AC-1.2 (rule)**: No user-facing untranslated raw i18n keys (strings beginning with `xfer_`, `XFER_`, `nav_`, `status_`, `th_`, `st_`, `intl_`, `pin_`, `pw_`, `card_`, `mk_`) visible in Swal titles or on account.html/dashboard.php DOM. Evidence: load account.html, dashboard.php, initiate transfer PIN flow — DevTools textContent of Swal popup title/html contains no literal "xfer_" prefix strings after translation bootstrap applied.
- **FR-AC-1.3 (rubric — Terminology consistency, scale 0-2, threshold ≥1)**: Transfer PIN labeled consistently as "Transfer PIN" (no "Transaction Code", no "Transfer Code" inconsistencies). 2 = every instance uses exact "Transfer PIN (6 digits)" label. 1 = ≥90% uses correct label; at most 1 old label kept in a code comment. 0 = mixed labels.
- **FR-AC-1.4 (rubric — Spelling/grammar coverage, scale 0-2, threshold ≥1)**: 2 = all obvious misspellings + grammar caught per NFR-1 scope files. 1 = ≥95% resolved with ≤2 minor typos remaining. 0 = 3+ visible typos in a full walkthrough.

### FR-2 — PIN dialog dark circle removal
- **FR-AC-2.1 (rule)**: showCombinedPinAndOtpDialog (auth-session.js) injected style block includes rule `.swal2-image { display: none !important; background-color: transparent !important; min-height: 0 !important; max-height: 0 !important; }` (or equivalent that prevents rendering of ANY swal2-image dark placeholder). Evidence: grep of showCombinedPinAndOtpDialog for the rule.
- **FR-AC-2.2 (rule)**: DOM of PIN/confirm Swals during transfer flow (DevTools inspect after opening dialog) does NOT contain a rendered <img> or .swal2-image block with computed width > 40px AND background-color rgb(0,0,0) / rgba(0,0,0,≥0.9). Evidence: screenshot or computed style dump of .swal2-image.
- **FR-AC-2.3 (rubric — Visual consistency with app light theme 0-2 threshold ≥1)**: 2 = Swal uses same white/blue/light slate palette as dashboard hero. 1 = minor off-white background discrepancy but no dark block. 0 = still a visible dark square block after fix.

### FR-3 — Language dropdown
- **FR-AC-3.1 (rule)**: account.html hero top-right renders a functional select (or combobox) with options labeled for each supported language. Clicking an option changes the page's data-i18n translations in < 500ms. Evidence: DOM inspection shows `<select id="vtLangDropdown">` with N options matching SUPPORTED_LANGS; onChange handler wired.
- **FR-AC-3.2 (rule)**: Selection persists server-side. POST to profile.preferredLanguage; next /api/me response's preferredLanguage matches the selection. Evidence: curl with cookie compares before/after preferredLanguage field.
- **FR-AC-3.3 (rule)**: Language dropdown bootstrap is present on ALL 10 customer authenticated pages (sibling PHP/HTML) after edits. Evidence: grep 'initLangDropdown' or equivalent anchor in 10/10 pages.
- **FR-AC-3.4 (rubric — Responsive dropdown layout 0-2 threshold ≥1)**: 2 = ≤480px width dropdown stacks full-width, no wrap overflow. 1 = stacks but minor 1-2px overflow. 0 = horizontal scroll required to see the selector at width=320px.
- **FR-AC-3.5 (rule)**: When selected language = `es`, the nav_dashboard translation returns the DICT.es value "Panel", not the default "Dashboard" fallback. Proof: DevTools console `VT.I18N.t('es','nav_dashboard') === 'Panel'` true.

### FR-4 — Admin 3 actions + opening balance delete
- **FR-AC-4.1 (rule — PERMISSION GATE)**: Non-owner admin session with email NOT === target.createdBy and NOT === ADMIN_EMAIL → POST suspend/close/delete opening-balance returns HTTP 403 with exact error string "You can only modify accounts created by your administrator account." (matches wording spec). Evidence: curl with mismatched admin cookie → 403.
- **FR-AC-4.2 (rule)**: Owner admin session (ADMIN_EMAIL) operates successfully on ANY admin-generated target regardless of createdBy. Evidence: curl with owner cookie → 200/OK.
- **FR-AC-4.3 (rule)**: Admin user list rowMarkup renders 3 action buttons: Suspend/Close/Delete in a grouped layout (inline or stacked, but distinct colors: amber/maroon/red). Existing mono-Delete button replaced. Evidence: HTML inspection of a rendered <tr> → contains all three labels or icon equivalents.
- **FR-AC-4.4 (rule)**: Customer review panel L138 region includes the three action buttons + review-txs rows with type=OPENING_BALANCE each have a small red delete inline button. Evidence: renderCustomerReview snapshot contains both group items.
- **FR-AC-4.5 (rule — DELETE OPENING_BALANCE endpoint)**: DELETE /api/admin/users/:uid/opening-balances/:txid with admin cookie and valid txid that is type OPENING_BALANCE → (a) Firestore GET users/{uid}/transactions/{txid} = 404/not-exists after; (b) GET global transactions/{txid} = not-exists after; (c) adminAudit collection contains a new document with action DELETE_OPENING_BALANCE. Evidence: batch.get queries + adminAudit query.
- **FR-AC-4.6 (rule — Confirmation prompts mandatory)**:
  - Delete opening balance: user must type literal "DELETE" case-sensitive trim match before api call dispatched (same pattern as customer account delete).
  - Suspend/Close: Swal confirm or native confirm, user clicks "Yes" / OK explicitly; cancel click aborts.
  Evidence: client click handler shows String comparison for DELETE; other handlers have confirm branches with return on cancel.
- **FR-AC-4.7 (rubric — Audit completeness 0-2 threshold ≥1)**: Every action (SUSPEND/CLOSE/DELETE user / DELETE_OPENING_BALANCE / PREVENTED_AUTO_LOCK) appends to audit with {ts, adminEmail, action, targetUid, note} all present. 2 = all fields present. 1 = note missing on 1-2 action types. 0 = ≥3 fields missing or no writes.

### FR-5 — Admin-Generated Account Permanent Lock Exception
- **FR-AC-5.1 (rule — Guard semantics correct)**: `applyAccountStatusMutation(uid, "BLOCKED", false)` (automated, not admin-initiated) called for uid where isAdminGeneratedAccount(uid) === true → return value === false; NO mutation of users doc account.status performed; Firebase auth disabled NOT set; adminAudit entry with action="PREVENTED_AUTO_LOCK" appended. Evidence: unit-ish test call of helper in server context + post-call Firestore GET = status unchanged.
- **FR-AC-5.2 (rule — Admin initiated actions still allowed)**: `applyAccountStatusMutation(uid, "SUSPENDED", true)` called for admin-gen uid with admin permission → return true; status updated to SUSPENDED; audit appended. This ensures FR-4.1 (Suspend endpoint) still works as intended (admin manual actions are NOT blocked). Evidence: POST suspend then GET account.status = "SUSPENDED".
- **FR-AC-5.3 (rule — Admin list visibility)**: admin user list GET /api/admin/users returns admin-generated rows with any status (ACTIVE / SUSPENDED / CLOSED / BLOCKED / EXPIRED) all included. No WHERE filter excludes any status. Evidence: sortedUsers map/projection code has NO .filter(skipAdminGen…) line.
- **FR-AC-5.4 (rubric — Lock exception future-proof coverage 0-2 threshold ≥1)**: 2 = helper is exported and all status mutation sites through code that could be automated today or tomorrow call the helper (or at minimum: comment at mutation sites says developers MUST use helper). 1 = helper exists but integration is only partial. 0 = no helper; guard ad-hoc only at 1 location.

### FR-6 — Global Responsive Overhaul
- **FR-AC-6.1 (rule — 320px no horizontal scroll)**: Every authenticated customer page + admin dashboard.html opened in 320×568 device mode (Chrome DevTools) → document.body.scrollWidth ≤ 320 (no horizontal scrollbar; overflow-x:hidden fallback if grid exceeds). Evidence: screenshot or DevTools computed body.scrollWidth dump per page.
- **FR-AC-6.2 (rule — Sidebar hamburger toggle)**: All customer pages with sidebar (dashboard.php being the flagship, also applied to other PHP pages that have a sidebar) include a clickable hamburger toggle button on ≤992px widths that toggles sidebar visibility. Evidence: window resize w=800 → toggle shows, click toggles display:none/flex of .vt-sidebar.
- **FR-AC-6.3 (rule — Touch targets ≥44×44 px)**: All language dropdown selects, PIN input #vt-pin-input, transfer submit buttons, admin 3-action group buttons → computed min-height ≥44px at width=320px. Evidence: DevTools computed style for each element.
- **FR-AC-6.4 (rubric — Breakpoint coverage 0-2 threshold ≥1)**: 2 = all 6 breakpoints (≤340, ≤400, ≤480, ≤560, ≤768, ≤992) have @media rules defined for customer dashboard and ≥4 of those breakpoints covered for each sibling customer page; admin dashboard has ≥4 breakpoints handled. 1 = only 3-4 breakpoints covered; some pages missing ≥1. 0 = only 1-2 breakpoints; some pages have zero responsive rules added.

### NFR ACs
- **NFR-AC-1 (rule — Strict scope)**: git diff --name-only OR mtime diff returns changed files subset of ALLOWLIST (10 source files + spec artifacts 3). No other files modified. Evidence: diff command output.
- **NFR-AC-2 (rule — No new npm deps)**: package.json diff = 0 lines; no node_modules changes; package-lock diff = 0. Evidence: git diff package*.json.
- **NFR-AC-3 (rule — OTP removal not regressed)**: POST /api/customer/transfer/request-otp → HTTP 404. Evidence: curl.
- **NFR-AC-4 (rule — /api/me key additive only)**: JSON output of /api/me still includes all prior 20 keys (uid,email,profile,account,security,…,onboarding,isAdminCreatedAccount [from prior spec]); NEW key added at most once: adminCreatedByEmail: string|null. Evidence: response schema check.
- **NFR-AC-5 (rule — Syntax)**: All edited JS files node --check exit 0. PHP files edited pass php -l or balanced brace scan.
- **NFR-AC-6 (rule — Audit privacy)**: adminAudit entries never contain strings matching PIN pattern /^\d{6}$/ or password-like values. Evidence: grep for 6-digit strings against audit entries.
