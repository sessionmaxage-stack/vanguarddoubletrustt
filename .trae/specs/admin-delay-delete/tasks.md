# TASKS.md — Admin Delay + Admin Delete
## Mapping to Acceptance Criteria
| AC ID | Primary Task |
|---|---|
| FR-AC-1.1, 1.2, 1.3 | Task 1 (server edits: delay + /api/me flag) |
| FR-AC-1.4, 1.5, 1.6 | Task 2 (frontend: auth-session.js + dashboard.php spinner/countdown) |
| FR-AC-2.1, 2.2, 2.3, 2.4, 2.5 | Task 3 (admin-session.js delete enable/typed-confirm wiring) |
| NFR-AC-SCOPE, REGRESSION | Task 4 + Task 5 (review) |
---
## Task 1: Server-side 120s Delay + /api/me Flag
**File allowlist:** `server/index.js` only.
### Sub-steps
1. Add a `sleep(ms)` Promise-based helper at the top of server/index.js near other small pure helpers (`cleanString` / `buildAllowedLanguageSet` region) around L820-840:
   ```js
   function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
   ```
   Use unique insertion; no redefinition.
2. **GET /api/me L773-788 JSON response**: add key `isAdminCreatedAccount: isAdminGeneratedAccount(freshUser)`. Do NOT modify existing keys or order; append last before closing `});`. This satisfies FR-AC-1.2 / FR-AC-1.3.
3. **POST /api/customer/transfer (L1434 handler)**: Locate where: (a) OTP forbidden guard passes, (b) transfer PIN is validated against userDoc.security.transferPinHash, (c) recipient doc loaded and balance/fees computed, (d) `batch.set(senderRef, {...})` is about to be called — INSERT a guard immediately before the first Firestore batch.commit():
   ```js
   if (isAdminGeneratedAccount(userDoc)) {
     console.log(`[ADMIN-HOLD] Holding transfer for admin-created sender ${uid} for 120s…`);
     await sleep(120000);
   }
   ```
   The placement is critical — delay runs AFTER validation (so invalid requests fail fast) but BEFORE money moves (so abort mid-delay is safe with no side effects). This satisfies FR-1.1, FR-AC-1.1.
4. **POST /api/customer/transfer/execute handler**: Repeat the same sleep(120000) block using the same isAdminGeneratedAccount(senderUserDoc) conditional, at the identical position: after all validation + batch writes prepared but BEFORE the first batch.commit().
5. Ensure the sleep helper is NOT redefined elsewhere in the file (grep for existing sleep/msetTimeout patterns first). This spec assumes none.
6. Run `node --check server/index.js` post-edit.
### Test Requirements (Task 1 — TRs, all `rule` type)
- **TR-1.1 [rule]**: `node --check server/index.js` exits with code 0.
- **TR-1.2 [rule]**: Grep server/index.js for `sleep(120000)` — exactly 2 occurrences (both transfer handlers).
- **TR-1.3 [rule]**: Grep server/index.js response JSON of `app.get("/api/me"...` for `isAdminCreatedAccount` — exactly 1 occurrence with value boolean expression `isAdminGeneratedAccount(freshUser)` (not hardcoded true/false).
- **TR-1.4 [rule]**: For the INSERT location: visually verify (via Read tool) that the `if (isAdminGeneratedAccount(userDoc)) await sleep(120000);` block is placed AFTER transfer PIN regex validation and BEFORE the first `await batch.commit()` call.
- **TR-1.5 [rule]**: grep for `function sleep` — exactly 1 definition.
**Status:** pending
**Depends on:** None
**Priority:** high
---
## Task 2: Frontend Spinner + Countdown for Admin-Created Account Transfers
**File allowlist:** `customer/assets/js/auth-session.js` + `customer/dashboard.php` (only the two standalone transfer flows).
### Sub-step 2a — auth-session.js processTransfer function
1. At the top of `processTransfer`, right after the existing `L`/`T` i18n helpers (placed in impl4 of prior spec), add a closure-scope variable `let isAdminSender = false;`.
2. Before calling `showCombinedPinAndOtpDialog(...)`, **only if the dialog was NOT already shown because transferPin exists in the calling context** (i.e., we're about to ask user for PIN / or we have PIN already from the dialog) — but actually at the very beginning of processTransfer, fire-and-forget (no await) a fetch to `/api/me` with credentials include:
   ```js
   fetch("/api/me", { credentials: "include" })
     .then(r => r.ok ? r.json() : Promise.reject())
     .then(me => { isAdminSender = Boolean(me?.isAdminCreatedAccount); })
     .catch(() => { isAdminSender = false; });
   ```
   Wait for this promise with await before showing the Swal — we need isAdminSender truthy/falsy known before processing Swal. Wrap the promise with `await Promise.race([mePromise, new Promise(r => setTimeout(() => r(false), 5000))])` so network hang doesn't block.
3. The existing xfer_processing Swal (title: T('xfer_processing')) currently shows a spinner via Swal.showLoading() inside didOpen. For admin-created accounts, modify the Swal to:
   - Show the existing spinner
   - Add a dynamic html body below the title that starts as:
     ```
     <div class="admin-hold-banner" style="color:#f59e0b;font-weight:700;font-size:14px;margin-top:8px;">
       ⚠️ Admin account security hold — processing in <span id="vtHoldCountdown">02:00</span>…
     </div>
     ```
   - Start a setInterval of 250 ms that decrements remainingMs from 120000 down to 0, formatting as `mm:ss`. Write to #vtHoldCountdown via textContent.
   - The Swal must NOT close until BOTH:
     a. The remainingMs countdown has reached 0 (frontend timer) AND
     b. The HTTP fetch promise has resolved/rejected.
   Implement this by replacing the current `Swal.fire({ didOpen, ... }).then(result => ...)` flow with:
   ```js
   const processingSwal = Swal.fire({
     title: T('xfer_processing'),
     html: isAdminSender ? holdBannerHtml : "",
     didOpen: () => { Swal.showLoading(); if (isAdminSender) startCountdown(120000, '#vtHoldCountdown'); },
     allowOutsideClick: false,
     allowEscapeKey: false,
     showConfirmButton: false
   });
   const [fetchResult] = await Promise.all([
     processFetch,
     isAdminSender ? sleep(120000) : Promise.resolve()
   ]);
   processingSwal.close();
   ```
   Where `sleep` is a local helper inside auth-session.js (don't leak to global — wrap in function scoped). `startCountdown` uses setInterval; pass the target element selector and starting ms, clearInterval at 0. This implements FR-AC-1.4 Score 2 requirement (2:00 countdown shown, min 120s spinner regardless of server timing).
4. Non-admin senders (isAdminSender falsy): NO html banner, NO countdown, NO extra frontend Promise.all sleep — exactly the same behavior as prior code (the fetch itself just runs as before and returns whenever server is done). This implements FR-AC-1.5.
### Sub-step 2b — dashboard.php standalone doExecuteTransfer
1. Mirror the same logic: before doExecuteTransfer body does fetch("/api/customer/transfer"):
   - If a module-scoped `isAdminSenderCached` variable is not yet set, load it with fetch("/api/me", {credentials:"include"}) → store.
2. Before showing Swal processing, construct the same `Promise.all([fetch, isAdminSenderCached ? sleep(120000) : Promise.resolve()])` pattern.
3. Show the same countdown banner inside the existing processing Swal. For dashboard.php standalone, write the sleep + startCountdown helpers as inline functions (no global leak). This implements FR-AC-1.6.
### Test Requirements (Task 2 — TRs)
- **TR-2.1 [rule]**: `node --check customer/assets/js/auth-session.js` exits 0.
- **TR-2.2 [rule]**: In auth-session.js, grep for `isAdminCreatedAccount` → exactly 1 reference (the /api/me accessor me?.isAdminCreatedAccount, not hardcoded).
- **TR-2.3 [rule]**: In auth-session.js, grep for `Promise.all` → at least 1 new occurrence combining fetch + (sleep or delay) promise branch.
- **TR-2.4 [rule]**: In auth-session.js, non-admin path (isAdminSender falsy) does NOT call sleep/setTimeout of 120000 on the client — the ternary `isAdminSender ? sleep(120000) : Promise.resolve()` proves branch.
- **TR-2.5 [rule]**: Dashboard.php standalone — balanced braces / PHP syntax visual check; no new PHP keywords (<?php ... ?> already present) introduced in JS blocks. Swal logic mirrors auth-session.js rules.
**Status:** pending
**Depends on:** Task 1 (because /api/me now exposes isAdminCreatedAccount boolean Task 1 already added; task 2 reads that flag).
**Priority:** high
---
## Task 3: Admin Delete Button Enable + Typed Confirm
**File allowlist:** `admin/assets/js/admin-session.js` only (NO server edits — delete endpoint already works).
### Sub-steps
1. **rowMarkup(user) function (L834-1002)**: The Delete button currently has `disabled`, `opacity:0.55`, locked title. Compute a derived variable in rowMarkup:
   ```js
   const isAdminGen = Boolean(user.adminGenerated || user.createdBy || user._adminCreated === true);
   const createdAtMs = user.createdAt ? Date.parse(user.createdAt) : NaN;
   const ageDays = Number.isFinite(createdAtMs) ? (Date.now() - createdAtMs) / 86400000 : 0;
   const statusSetForOld = new Set(["CLOSED", "EXPIRED", "SUSPENDED", "BLOCKED"]);
   const isOld = ageDays >= 30 || statusSetForOld.has(String(user.status || "ACTIVE").toUpperCase());
   const canDelete = !isAdminGen && isOld;
   ```
   (Note: user.adminGenerated/createdBy/_adminCreated are NOT in current GET /api/admin/users response. We need Task 3.X server-side fix to ADD these to L1878-1890 /api/admin/users response projection so the frontend can make this decision. This is a small server/index.js edit that falls within Feature 2 scope because it's a read-only projection addition to enable the delete button. Scope this edit as Task 3 addendum.)
2. Task 3 addendum (server/index.js): In `app.get("/api/admin/users", requireAdminAuth, ...)` return projection L1878-1890, add 3 new projected fields:
   ```
   adminGenerated: data.adminGenerated === true,
   createdBy: data.createdBy || null,
   _adminCreated: data._adminCreated === true
   ```
   This is read-only data exposure — no schema mutation.
3. Apply canDelete to the Delete button:
   - If `canDelete === true` → remove `disabled` attribute, remove opacity/cursor disabled styles, change `title` to "Permanently delete this old customer account." Keep button label "Delete".
   - If `canDelete === false` → keep current disabled styling but change the title to be accurate: `isAdminGen ? "Admin-generated accounts are permanently locked and cannot be deleted." : "Only old (≥ 30 days old or CLOSED/EXPIRED/SUSPENDED/BLOCKED) customer accounts may be deleted."`
4. **Delete click handler (L1050-1055 currently flashing)**: Replace the current `if (deleteButton) { flash("Admin-generated accounts are locked..."); return; }` stub with the following logic:
   ```js
   if (deleteButton) {
     const row = deleteButton.closest("tr[data-uid]");
     const uid = row?.getAttribute("data-uid");
     const isDisabled = deleteButton.hasAttribute("disabled") || deleteButton.disabled;
     if (isDisabled) { flash(deleteButton.getAttribute("title") || "Delete unavailable for this account.", true); return; }
     if (!uid) { flash("Unable to locate account identifier.", true); return; }
     // Render fixture data for confirm dialog
     const userNameCell = row.querySelector("a.review-link, .name")?.textContent?.trim() || "Unknown customer";
     const status = row.querySelector("[data-field='status']")?.value || row.querySelector(".status")?.textContent?.trim() || "ACTIVE";
     const dateCreated = row.closest("tr")?.getAttribute("data-created") || "(not available)";
     // Use native prompt for typed confirmation (per spec FR-2.2)
     const message =
       `PERMANENTLY DELETE THIS OLD CUSTOMER ACCOUNT?\n\n` +
       `This will permanently erase:\n` +
       `• Customer profile, KYC data, credentials, and contact information\n` +
       `• Firebase login record (prevents future sign-ins)\n` +
       `• ALL transactions (local + Firestore sub-collection + top-level global transactions)\n` +
       `• Local JSON mirror data\n\n` +
       `Account UID: ${uid}\n` +
       `Account name: ${userNameCell}\n` +
       `Created: ${dateCreated}\n` +
       `Status: ${status}\n\n` +
       `This action CANNOT be undone.\n\n` +
       `Type the exact word "DELETE" into the prompt field below to confirm.`;
     const typed = window.prompt(message, "");
     if (typed == null) return; // cancel
     if (String(typed).trim() !== "DELETE") { flash("Confirmation string did not match. Delete aborted.", true); return; }
     // Call endpoint
     deleteButton.disabled = true;
     deleteButton.textContent = "Deleting…";
     flash("");
     api(`/api/admin/users/${encodeURIComponent(uid)}`, { method: "DELETE" })
       .then(data => { flash(data?.message || "Customer account permanently deleted."); return loadUsers(); })
       .catch(err => { flash(err?.message || "Unable to delete customer account.", true); })
       .finally(() => { deleteButton.disabled = false; deleteButton.textContent = "Delete"; });
     return;
   }
   ```
   Also add `data-created` attribute to the row element `<tr>` in rowMarkup so the confirm dialog can display the date: `data-created="${escapeHtml(formatShortDate(user.createdAt))}"`.
5. Preserve the existing `reviewLink` and save button click handlers — do not change their logic.
### Test Requirements (Task 3 — TRs)
- **TR-3.1 [rule]**: `node --check admin/assets/js/admin-session.js` (Node will parse pure JS without DOM globals — non-DOM syntax is validated) exits 0.
- **TR-3.2 [rule]**: rowMarkup — canDelete computation uses exactly the 3 criteria: (a) NOT adminGenerated/createdBy/_adminCreated; (b) ageDays >= 30 OR status in {CLOSED/EXPIRED/SUSPENDED/BLOCKED}. This is provable via code grep for the Set/list.
- **TR-3.3 [rule]**: Click handler — presence of `window.prompt` with string body containing "Type the exact word" and literal `"DELETE"` equality check after trim.
- **TR-3.4 [rule]**: Delete fetch call uses `DELETE` method + admin cookie (api helper already uses credentials include globally — confirmed in existing api() L386-400).
- **TR-3.5 [rule]**: Server /api/admin/users projection now includes adminGenerated, createdBy, _adminCreated fields — grep server/index.js L1868-1890 region for each of those 3 names.
- **TR-3.6 [rule]**: Server guard "Admin-generated accounts are permanently locked…" string still present in DELETE /api/admin/users/:uid endpoint (not removed by accident).
**Status:** pending
**Depends on:** None (Task 3 addendum server edit is done as part of Task 3 itself; runs before frontend reads).
**Priority:** high
---
## Task 4: Syntax + Scope + Regression Pre-Review Checks
**Files:** Run `node --check` on all 4 edited JS files.
### Sub-steps
1. Execute:
   ```
   node --check server/index.js
   node --check customer/assets/js/auth-session.js
   node --check admin/assets/js/admin-session.js
   ```
   All 3 must exit 0.
2. dashboard.php: manual balanced-brace/balanced-HTML-tag visual scan since `php -l` may not be available (PowerShell env). No PHP syntax errors expected (only `<script>`/`<style>` blocks touched).
3. Grep for any modified file outside the allowlist via:
   ```
   Get-ChildItem -Recurse -File -Exclude *.md | Where-Object { $_.LastWriteTime -ge (Get-Date).AddMinutes(-60) } | Select-Object FullName, LastWriteTime
   ```
   Confirm names subset of allowlist.
4. VS Code GetDiagnostics: confirm no new error markers.
5. Node smoke test: start server with node server/index.js, send:
   - `curl POST /api/admin/login` — expect 401 (no creds) or 200.
   - `curl GET /api/me` — expect 401 (missing cookie) or 200 with `isAdminCreatedAccount: boolean` key in JSON.
   - Stop server after smoke.
### Test Requirements (Task 4 — TRs)
- **TR-4.1 [rule]**: 3/3 `node --check` exit 0.
- **TR-4.2 [rule]**: Grep for modified files outside allowlist = 0 hits (only .md artifacts counted).
- **TR-4.3 [rule]**: /api/me JSON contains key `isAdminCreatedAccount` (smoke test or code grep).
- **TR-4.4 [rule]**: No new import/require statements in edited files (no new dependencies added — NFR-1).
**Status:** pending
**Depends on:** Tasks 1, 2, 3 complete.
**Priority:** medium
---
## Task 5: Independent Review
### Sub-steps
1. Write review.md at `.trae/specs/admin-delay-delete/review.md`.
2. Sections: (a) Scope verification (files modified vs. allowlist), (b) Feature 1 AC evidence, (c) Feature 2 AC evidence, (d) Syntax check evidence, (e) Regression smoke: prior OTP guard still works, /request-otp still 404, delete server 403 guard preserved, (f) AC pass scorecard.
3. For rubric ACs FR-AC-1.4 / FR-AC-2.5 provide score + rationale + evidence (code line references).
### Test Requirements (Task 5 — TRs = Review criteria)
- **TR-5.1 [rule]**: review.md exists and contains evidence sections for each AC in spec.md scorecard.
- **TR-5.2 [rule]**: review.md enumerates all 5 edited files and maps each to allowlist entry.
- **TR-5.3 [rule]**: 15+ ACs tracked; every AC linked to at least one objective evidence line (code line range or command output).
- **TR-5.4 [rubric 0-2] Workflow fidelity**: Score as defined in TRAE-spec-mode artifact templates. Threshold: ≥ 2.
**Status:** pending
**Depends on:** Task 4 passes all rule TRs.
**Priority:** high
