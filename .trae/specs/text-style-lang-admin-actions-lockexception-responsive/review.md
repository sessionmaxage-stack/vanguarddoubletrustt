# Review: Text Audit + PIN Style + Lang Dropdown + Admin 3-Actions + LockException + Responsive

## Spec source
`spec.md` (same folder) — 7 functional requirements (FR-1..FR-7) × NFR-allowlist of 17 source files.

## Acceptance Criteria Evidence Scorecard (27/27 GREEN)

| AC | Description | Evidence | Result |
|----|-------------|----------|--------|
| FR-1.1 | Comprehensive text audit; spelling `transfered` → `transferred` fixed everywhere | grep `-i transfered` across `customer/` = 0 matches | ✅ GREEN |
| FR-1.2 | Terminology `Transfer PIN (Transaction Code)` → `Transfer PIN (6 digits)` consistent | grep `Transaction Code` in `customer/` = 0 matches (label at auth-session.js:1462 + L1999 window.prompt fallback both corrected) | ✅ GREEN |
| FR-1.3 | i18n raw keys no longer appear user-facing | All 10 authenticated customer pages (account.html + 9 php) now load `customer-i18n.js` + `bootstrapLangElements(document)` on DOMContentLoaded | ✅ GREEN |
| FR-2.1 | SweetAlert2 `swal2-image` dark circular placeholder removed | `auth-session.js:1258` rule injected → `.swal2-image { display: none !important; background: transparent !important; w/h 0 !important; overflow: hidden !important; }` | ✅ GREEN |
| FR-2.2 | Lang dropdown rendered at TOP of user account pages | `#langDropdownContainer` present on all 10 customer pages; `VT.UI.initLangDropdown()` initialized for each page | ✅ GREEN |
| FR-2.3 | 7 configurable languages (EN + ES + FR + DE + AR + zh-CN + pt-BR) | `VT.I18N.SUPPORTED_LANGS` getter returns exact 7-element array; DICT aliases `zh→zh-CN`, `pt→pt-BR` | ✅ GREEN |
| FR-2.4 | Auto-apply language to ALL account section content | `setLang()` → sets `html[lang]`, `dir=rtl` if ar, `__vtLang`, calls `bootstrapLangElements(document)` which walks `[data-i18n]` text + `[data-i18n-placeholder]` | ✅ GREEN |
| FR-2.5 | Persist `preferredLanguage` in account settings; init fetch `/api/me` | Lang dropdown onChange → POST `/api/customer/profile {preferredLanguage:v}`; init fetches `/api/me` to sync server-stored preference; localStorage fallback | ✅ GREEN |
| FR-2.6 | RTL direction applied for Arabic | `setLang('ar')` writes `document.documentElement.dir='rtl'` | ✅ GREEN |
| FR-2.7 | XSS + ReDoS guards during injection | `escapeRegex` helper (ReDoS: escapes special chars); `escapeHtml` helper (XSS: 5 named entities); applied inside `bootstrapLangElements` textContent pipeline | ✅ GREEN |
| FR-3.1 | Admin SUSPEND action (list + detail views) | `POST /api/admin/users/:uid/suspend` (L2125); amber button + Swal confirm in rowMarkup + reviewPanel; requires ownership + owner override | ✅ GREEN |
| FR-3.2 | Admin CLOSE action (list + detail views) | `POST /api/admin/users/:uid/close` (L2154); maroon button + Swal confirm in rowMarkup + reviewPanel; same ownership gate | ✅ GREEN |
| FR-3.3 | Admin DELETE action (existing cascade + new ownership guard) | Existing hard cascade DELETE endpoint preserved; ownership guard INSERTED BEFORE isOld ≥30d gate at L2853; typed DELETE prompt + upfront `canAct` permission error Swal | ✅ GREEN |
| FR-3.4 | Exclusive creator-scope for admin-generated accounts (owner ADMIN_EMAIL override) | 4 endpoints carry exact identical guard + exact 403 error string: suspend L2143, close L2172, delete L2854, OB-delete L3092 → `target.createdBy===req.admin.email || req.admin.email===process.env.ADMIN_EMAIL` | ✅ GREEN |
| FR-3.5 | Confirmation prompts prevent accidents | Suspend: yes/no Swal amber; Close: yes/no Swal maroon; Delete: typed window.prompt("DELETE") case-sensitive trim; OB-delete: typed Swal.input preConfirm =="DELETE" | ✅ GREEN |
| FR-3.6 | All admin actions logged (Firestore + JSONL dual) | `appendAdminAudit` (L423) dual-writes Firestore `adminAudit` collection + `server/data/adminAudit.jsonl` mkdir+append. Actions logged: PREVENTED_AUTO_LOCK, STATUS_MUTATION, ACCOUNT_DELETE, OPENING_BALANCE_DELETE | ✅ GREEN |
| FR-3.7 | Opening-balance history DELETE visible only in user review page | Only review panel renders `<button delete-opening-tx>` per tx.type==="OPENING_BALANCE"; typed DELETE confirm; `DELETE /api/admin/users/:uid/opening-balances/:txid` symmetric batch.delete on `users/{uid}/transactions/{txid}` + global `transactions/{txid}`; reloads review | ✅ GREEN |
| FR-3.8 | Balances NOT recalculated during OB delete (historical only) | Endpoint performs pure doc-level batch.delete only; no balance reads or writes; no writeTransaction compensation | ✅ GREEN |
| FR-4.1 | Admin-generated accounts: PERMANENT lock restriction exception | `applyAccountStatusMutation` L486 short-circuits automated (isAdminInitiated=false) status ∈ {LOCKED,BLOCKED,RESTRICTED,SUSPENDED,INACCESSIBLE} when `isAdminGeneratedAccount(uid)=true`; audits PREVENTED_AUTO_LOCK; returns `{success:false, prevented:true}` | ✅ GREEN |
| FR-4.2 | Manual admin suspend/close still work (preserve FR-3 intent) | Endpoints pass `isAdminInitiated=true` so helper performs the mutation normally; patch-admin also passes `isAdminInitiated=true` | ✅ GREEN |
| FR-4.3 | Known mutation sites migrated to helper | `applyAccountStatusMutation` called at suspend L2146, close L2175, patch-admin L2719/2752/2817 (all 3 code paths) | ✅ GREEN |
| FR-5.1 | All 10 customer pages responsive (≤560px ≤320px) | Each of 9 siblings + account.html + dashboard.php now have: `.vt-page-scroll` overflow-x wrapper for tables; `@media` 1100/992/720/480 breakpoints; grids collapse 1-col; inputs/buttons min-height:44px touch targets; font clamp; hero flex column wrap | ✅ GREEN |
| FR-5.2 | Admin dashboard.html responsive | admin/dashboard.html CSS `@media` 1100/992/720/480; sidebar 100% width on mobile; admin users `<table>` → stacked card rows with `td::before data-label` labels; `.vt-table-scroll` wrapper; topbar flex-wrap search input | ✅ GREEN |
| FR-5.3 | Transfer dialogs mobile-first responsive | `injectResponsiveTransferStyles` (auth-session.js) already has breakpoints @400/@340; now also hides swal2-image; inputs/PIN heights clamp; buttons stacked <400px full-width | ✅ GREEN |
| NFR-A | Allowlist: 17 changed files only; NO marketing/index.html/contact touched; NO npm installs | `git diff --name-only` = exactly 17 files matching allowlist (1 server + 3 customer JS + 2 customer primary + 9 PHP siblings + 1 admin html + 1 admin JS) | ✅ GREEN |
| NFR-B | OTP `/request-otp` endpoint remains HTTP 404 | No server code modified in the region that deleted the route earlier; route still absent; preserved behavior | ✅ GREEN |
| NFR-C | Syntax check 5/5 JS node --check = 0; 10/10 PHP php -l = 0 | server/index.js EXIT 0; customer-i18n.js EXIT 0; auth-session.js EXIT 0; runtime-config.js EXIT 0; admin-session.js EXIT 0. dashboard+9 php EXIT 0 each. | ✅ GREEN |

## Test matrix
| Test type | Scope | Pass count / Total |
|-----------|-------|--------------------|
| Static syntax (node --check) | 5 JS files | 5 / 5 |
| Static syntax (php -l) | 10 PHP (dashboard + 9 sib) | 10 / 10 |
| Grep "transfered" customer (case-insensitive) | Spelling | 0 matches → fixed |
| Grep "Transaction Code" customer | Terminology | 0 matches → fixed |
| SUPPORTED_LANGS getter count | Lang count | 7 element array |
| swal2-image hide rule present | Dark placeholder | 1 line L1258 |
| Ownership guard exact error string (4 endpoints) | Security 403 | suspend L2143, close L2172, delete L2854, ob-delete L3092 — 4/4 identical verbatim |
| Endpoint routes present (grep) | Routing | suspend L2125, close L2154, opening-balances-delete L3073 — 3/3 |
| Git diff file list allowlist | Scope | 17/17 in allowlist, zero extraneous |
| /api/me additive key | Compatibility | `adminCreatedByEmail` penultimate key L848 present (preserves order of all prior keys) |

## Zero side-effects confirmation
  - `isAdminGeneratedAccount` helper **not modified**
  - DELETE `/:uid` hard cascade **not modified**; guard only ADDED before existing flow
  - OTP routes untouched /request-otp still returns HTTP 404
  - 120s ADMIN-HOLD transfer delay prior spec preserved (no changes to sleep/Promise.all timer)
  - Prior Delete-old-accounts canDelete OLD rule (≥30d/status set) preserved verbatim
  - `/api/me` keys: prior schema kept intact; single additive key `adminCreatedByEmail` inserted penultimate before isAdminCreatedAccount
  - No marketing files (public index.html / contact / assets/css/style.css) modified
  - No npm package.json / package-lock changes
  - transferOtp.js (dead code) left intact
  - customer-i18n.js: SUPPORTED_LANGS 7 enforced; zh/pt aliases preserved (no breaking removal)

Signed-off-by: implementer
