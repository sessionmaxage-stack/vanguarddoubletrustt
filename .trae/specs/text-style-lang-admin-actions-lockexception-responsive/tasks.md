# Tasks — Text Audit, PIN Style, Lang Dropdown, Admin 3-Actions + Open-Balance Delete, Admin-Gen Lock Exception, Responsive Overhaul
- Spec: [spec.md](file:///c:/Downloaded%20Web%20Sites/vanguarddoubletrust.com/.trae/specs/text-style-lang-admin-actions-lockexception-responsive/spec.md)
- Source allowlist: `server/index.js, customer/assets/js/auth-session.js, customer/assets/js/customer-i18n.js, customer/assets/js/runtime-config.js, customer/account.html, customer/dashboard.php, customer/{myprofile,pin,password,statement,transferhistory,accountdetails,card,international,stocks}.php, admin/dashboard.html, admin/assets/js/admin-session.js` (18 source files + 3 spec artifacts.

---

## Task 1: Server endpoints + helpers (server/index.js)
**Priority: HIGH
**Dependency**: None (first task, server prerequisite for Task 2/4/5 client wiring)
**Scope file(s) edited**: `server/index.js` (only)
### Description:
- T1.1 Add pure helpers (near sleep helper at L834 region) — add:
  - `function readAdminAudit()` — read admin audit dual-write to Firestore `adminAudit` collection doc and/or local JSONL mirror file server/data/adminAudit.jsonl — per open-question storage selection (Q2 pending). Helper signature `async appendAdminAudit({action, adminEmail, targetUid=null, note=null}
  - Export `applyAccountStatusMutation(targetUid, requestedStatus, isAdminInitiated = false, context='unspec` — calls isAdminGeneratedAccount(targetUid) && !isAdminInitiated → return false, append PREVENTED_AUTO_LOCK audit; otherwise → apply firestore write to users/{targetUid}/account.status = requestedStatus, return true. (No helper not modify isAdminGeneratedAccount helper (no edit).
  - Export helper `async assertAdminOwnership(req, targetUserDoc) (reuser target.createdBy === req.admin.email || req.admin.email === process.env.ADMIN_EMAIL → allowed else 403 helper.

- T1.2 POST /api/admin/users/:uid/suspend (requireAdminAuth, 404 if user not found, 403 if not owner, applyAccountStatusMutation(uid, "SUSPENDED", true, "admin-initiated suspension', append audit "SUSPEND".
- T1.3 POST /api/admin/users/:uid/close (same ownership gating), applyAccountStatusMutation set status="CLOSED", writeTransaction with note "Account permanently closed by admin {email}" — append audit CLOSE" — with type:ADMIN_CLOSE, amount:0 status "CLOSED — ACCOUNT — CREDIT? Not a credit (just log only — just writeTransaction type = "ACCOUNT_CLOSED", amount 0, status COMPLETED, note note the same string).
- T1.4 POST /api/admin/users/:uid/delete guard add ownership gate to the existing delete endpoint already exist already has isOldAccount and not admin, but must: add ownership assertion, ADMIN_EMAIL owner, (permitted for owner scope (FR-4.3 ownership (tighter guard, but still allow old admin gen/accountant non-old; add ownership check (canDelete applies only not modify isOld still, but non-owner can't run DELETE regardless of age.old old rule still applies ownership + age both. ownership fails first (owner-only 6 DELETE, 403 first).
- T1.5 DELETE /api/admin/users/:uid/opening-balances/:txid requireAdminAuth. checks: (ownership, transaction exists with type === "OPENING_BALANCE", uid = doc uid matches param. batch.delete() BOTH userTxRef + globalRef, append audit DELETE_OPENING_BALANCE amount=0 t (data.amount), return deleted:true.
- T1.6 GET /api/me JSON: add ONE new penultimate key adminCreatedByEmail: String(userDoc.createdBy || dbData.createdBy || "") or null if absent. Do NOT add any other keys; do NOT reorder; preserve all existing keys kept.
- T1.7 helper for ALL existing status mutation code paths that set account.status, refactor to use applyAccountStatusMutation(...) instead of direct merge: only refactor automated paths (skip admin patch manual admin set via manual status patch by admin → this route L2558 region set status list SUSPENDED BLOCKED — this is admin-manual admin MANUAL INITIATED so, route called manually written —; set — this statuses are already in name manual explicit call applyAccountStatusMutation(status, true with manually with isAdminInitiated=true.

### Test Requirements (TR)
- **TR1.1 rule**: `node --check server/index.js exits 0.
- **TR1.2 rule**: curl POST /api/admin/users/:uid/suspend without with with cookie (no-auth HTTP 401.
- **TR1.3 rule**: ownership test: req.admin.email !== target.createdBy and NOT ADMIN_EMAIL → HTTP 403 "You can only modify accounts created by your administrator account." (exact) string preserved).
- **TR1.4 rule**: admin-initiated SUSPEND on target with → Firestore doc → applyAccountStatusMutation(targetUid, "SUSPENDED", true) returns true; automated applyAccountStatusMutation(targetUid, "BLOCKED", false) for admin-gen uid → returns false, status not changed, append PREVENTED_AUTO_LOCK audit entry appended.
- **TR1.5 rule**: DELETE opening balance → getFirestore() doc (afterwards users/{uid}/transactions/{txid}.get().exists === false; globalRef exists false.
- **TR1.6 rule**: /api/me schema prior key additive only: adminCreatedByEmail new key added before closing brace only (existing keys preserved.
- **TR1.7 rule: applyAccountStatusMutation — automated call: existing keys preserve — isAdminGeneratedAccount — not modified (grep "function isAdminGeneratedAccount — no matches unchanged 1 line count same as before edits).
Status: pending

---

## Task 2: Frontend — Text Correction + PIN dark circle bg removal + translation bootstrap (customer/auth-session.js
**Priority**: HIGH
**Dependency**: None (disjoint from T1, can run concurrently)
**Edited files edited list: customer/assets/js/auth-session.js, customer/assets/js/customer-i18n.js, customer/assets/js/runtime-config.js, customer/account.html, customer/dashboard.php
Description:

2.1 auth-session.js showCombinedPinAndOtpDialog (L1252 injected style sheet — append rule into the style.id=vt-transfer-responsive-styles add new injection of: add into existing): .swal2-image { display: none !important; background: transparent !important; min-height:0 !important; important; max-height: 0 !important; }

### add no image imageURL parameters removed from PIN dialog / confirm dialog imageUrl key or custom success overlay NO imageWidth/Height set (do not explicitly passed (they don't — L1782-L1868 two Swal.fire calls ensure no calls pass imageUrl — grep confirm).
#### 2.2 Text audit fixes in all auth-session.js:
- Fix typo in dashboard.php showCustomTxSuccessOverlay fix typo "transfered" → "transferred" (L213 area in read).
- terminology audit: any labeled labeled "Transfer PIN (6 consistent; no label label "Transaction Code" label everywhere (every xfer_pinLabel; xfer_pinPlaceholder already reads "Enter your 6-digit Transfer PIN" — keep; check label L1461 reads "Transfer PIN (Transaction Code)" mixed in auth-session.js L1461 → rename "Transfer PIN (6 digits)" consistent the mixed mixed terminology consistent.

#### 2.3 customer-i18n.js:
- add additional translations to add SUPPORTED_LANGS getter = Object.keys(DICT) (add language entries per Q1 answer (en+es additional langs add French/German/Arabic/Chinese/Portuguese). entries. Each all keys populated Arabic entries for shallow fallback return English always fallback return always.
- add method: helper VT.I18N.t(lang, k) existing if translation helper existing already exist — new bootstrapLangElements(root): function scan root.querySelectorAll([data-i18n]) — replace textContent.
- helper: add setLang(langCode): call set localStorage 'vt.lang' key, set document.documentElement.lang, bootstrapLangElements(document), dir=auto ar then lang set "rtl if Arabic; returns {lang applied.
#### 2.4 runtime-config.js — add `VT.UI.initLangDropdown(container, {saveEndpoint = '/api/customer/profile', allowedLangs = null})
- API implemented implemented: renderSelect fetch /api/me to get preferredLanguage first; onSelect call VT.I18N.setLang → POST saveEndpoint body = POST call, then VT.UI.toast flash preferredLanguage server with server language

#### 2.5 account.html
- Add <script src="assets/js/customer-i18n.js"></script> + runtime-config.js before auth-session.js.
- inject #langDropdownContainer div in hero (next to logout button, after the <div id="langDropdownContainer"></div>).
- DOMContentLoaded call VT.UI.initLangDropdown(document.getElementById('langDropdownContainer'), {allowedLangs: VT.I18N && VT.I18N.SUPPORTED_LANGS}).
- add data-i18n attributes to existing accountTitle, #meJson header subtitles.

#### 2.6 dashboard.php
- bootstrapLangElements call after DOM ready, add a lang dropdown to hero alongside existing sidebar/header if missing).
- bootstrap VT.I18N.bootstrapLangElements(document)
- fix misspelling fixes "transfered" → "transferred" text area success HTML fix;
### Test Requirements (TR):
- **TR2.1 rule: grep -rn "transfered" in customer/ → returns → zero matches.
- **TR2.2 rule: auth-session.js L1258-1407 styles now contains .swal2-image { display: none; ...
- **TR2.3 rule: node --check auth-session.js, customer-i18n.js, runtime-config.js exit 0.
- **TR2.4 rule: customer-i18n.js — Object.keys(VT.I18N.DICT).length matches Q1 answer count (2 or 7 or custom).
- **TR2.5 rule: account.html lang dropdown select.value === user's preferredLanguage on first load after bootstrap.
- **TR2.6 rubric Terminology consistency 0-2 threshold ≥1. 2 = 100% "Transfer PIN (6 digits)" label used; 1 = ≥90%; 0 = still mixed.
Status: pending

---

## Task 3: Customer sibling pages (9 PHP/HTML pages) text audit + language dropdown + responsive additions
**Priority**: MEDIUM
**Dependency**: T2 complete (depends on VT.I18N + runtime-config.js helpers defined)
**Files edited**: customer/myprofile.php, customer/pin.php, customer/password.php, customer/statement.php, customer/transferhistory.php, customer/accountdetails.php, customer/card.php, customer/international.php, customer/stocks.php (9 files, each has a hero/header + logout pattern; responsive @media blocks missing; add lang dropdown + bootstrap scripts).
Per page edits pattern (per file):
  (customer siblings all:
3.1 Add missing script <script src="assets/js/customer-i18n.js"></script> if not loaded (after css links before body close before existing).
3.2 Add missing script src assets/js/runtime-config.js.
3.3 Add a hero div#langDropdownContainer.
3.4 inline style — responsive media queries if missing.
3.5 Hero wrap body min-height clamp min-height padding; wrap sidebar 768 sidebar collapse hamburger menu if sidebar hamburger toggle.
All per page minimum touch target 44px.
### TRs:
- **TR3.1 rule: 9/9 pages contain VT.I18N.bootstrapLangElements(document present after DOMContentLoaded, all pages contain script runtime-config.js.
- **TR3.2 rule**: php -l each PHP file exits pass
- **TR3.3 rubric: responsive breakpoint coverage 0-2 ≥1: each page ≥4 breakpoints media rules added (≤480 ≤560 ≤768 ≤992).

Status: pending

---

## Task 4: Admin 3-actions row + review, opening balance delete wiring (admin/dashboard.html + admin-session.js)
**Priority**: HIGH
**Dependency**: T1 complete server endpoints /suspend /close /opening-balances/:txid DELETE exist
Files: admin-session.js, admin/dashboard.html
4.1 admin-session.js rowMarkup L834:
- Replace existing Save/Delete group with a 3-button action group (Suspend amber / Close maroon / Delete red).
- Each button data-owner-check for createdBy email against admin session (via new attribute data-created-by on the tr or from user.createdBy existing or user row data-created-by via projection admin users L1902 added admin users: add projected String(user.createdBy || '' → if user.adminGenerated && (row row button disabled if not admin ownership match).
- canRunAction(btn.dataset.action == "suspend"; click → confirm dialog with yes/no with confirmPrompt; → api POST suspend; refresh users on success.
4.2 admin-session renderCustomerReview L138 review-panel append review action header top or bottom 3 action buttons stacked mobile; inside txRowsHtml add for loop: each OPENING_BALANCE rows add small delete button typed DELETE confirm only on type === "OPENING_BALANCE"; click → call DELETE opening endpoint → success reload review.
4.3 admin/dashboard.html CSS: add @media responsive rules for table cells wrapping, stacked rows for 320; review grid 1 col mobile.
### TR:
- TR4.1 rule node --check admin-session.js exit 0.
- TR4.2 rule list rows contain the 3 buttons (Suspend/Close/Delete).
- TR4.3 rule opening balance rows show inline delete button for type === OPENING_BALANCE rows only.
- TR4.4 opening DELETE endpoint call success review transactions refresh.
- TR4.5 ownership: mismatched createdBy → buttons disabled with tooltip "Only the creating admin or owner can act" or exact title.
Status: pending

---

## Task 5: Global responsive sweep + admin dashboard responsive improvements
**Priority**: MEDIUM
**Dependencies**: T2+T3 text/lang loaded)
Edited files: account.html (extend styles), dashboard.php extend @media add more breakpoints, admin/dashboard.html responsive media, admin-session.js list row cell flex wrap mobile stacked cells.
5.1 dashboard add global responsive clamp inputs: grids/tables wrap 320 scroll-x auto statement/transferhistory tables overflow wrapper overflow-x-auto cards layout on 560.
5.2 admin dashboard.css add 992/768/768 rows stacked cells 560 review grid 1 column.
5.3 customer pages sidebars hamburger click toggles.
### TRs:
- TR5.1 rule body.scrollWidth ≤ 320px on 10/10 customer pages + admin dashboard.
- TR5.2 rule sidebar hamburger toggle works (exists and toggles.
- TR5.3 rubric responsive breakpoint coverage 0-2 threshold ≥1.

---

## Task 6: Syntax + scope regression checks
**Priority**: HIGH
**Depends**: T1-T5 all complete
Run final all files node --check, php -l, scope allowlist diff audit, OTP 404 regression, /api/me schema additive key check, adminCreatedByEmail present.
### TRs:
TR6.1 3/3 edited server,auth-session, customer-i18n, runtime-config, admin-session — all JS files node --check exit 0.
TR6.2 scope allowlist audit — changed files 18 source files listed exactly.
TR6.3 POST /request-otp = HTTP 404 (regression OTP removal NOT regressed).
TR6.4 GET /api/me w/o cookie → 401; key present adminCreatedByEmail.
TR6.5 admin 403suspense delete on non-owned target → HTTP 403 exact error string.
Status: pending

---

## Task 7 Independent review + review.md write.
Depends T1-T6 green
Status: pending
