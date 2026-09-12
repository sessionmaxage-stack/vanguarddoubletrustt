(() => {
  function money(value, currency) {
    const n = Number(value);
    const cur = String(currency || "USD").toUpperCase() || "USD";
    if (!Number.isFinite(n)) return `0.00 ${cur}`;
    try {
      return n.toLocaleString(undefined, { style: "currency", currency: cur });
    } catch {
      return `${n.toFixed(2)} ${cur}`;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(v) {
    if (!v) return "—";
    try {
      const d = new Date(v);
      if (!Number.isFinite(+d)) return String(v);
      return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return String(v);
    }
  }

  function formatShortDate(v) {
    if (!v) return "—";
    try {
      const d = new Date(v);
      if (!Number.isFinite(+d)) return String(v);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    } catch {
      return String(v);
    }
  }

  function statusPill(status) {
    const s = String(status || "ACTIVE").toUpperCase();
    let cls = "info";
    if (s === "ACTIVE" || s === "COMPLETED") cls = "ok";
    else if (s === "PENDING" || s === "PROCESSING") cls = "warn";
    else if (s === "SUSPENDED" || s === "CLOSED" || s === "FAILED" || s === "BLOCKED") cls = "bad";
    return `<span class="pill ${cls}">${escapeHtml(s)}</span>`;
  }

  function setReviewOpen(open) {
    const modal = document.getElementById("adminReviewModal");
    if (!modal) return;
    modal.style.display = open ? "block" : "none";
    if (!open) {
      const body = document.getElementById("reviewBody");
      const title = document.getElementById("reviewTitle");
      const sub = document.getElementById("reviewSub");
      if (body) body.innerHTML = `<div class="review-loading">Loading customer account details…</div>`;
      if (title) title.textContent = "Customer Account Review";
      if (sub) sub.textContent = "Loading…";
    }
  }

  function setReviewBody(html) {
    const body = document.getElementById("reviewBody");
    if (!body) return;
    body.innerHTML = html || "";
  }

  function setReviewTitle(title, sub) {
    const el = document.getElementById("reviewTitle");
    const s = document.getElementById("reviewSub");
    if (el && title != null) el.textContent = title;
    if (s && sub != null) s.textContent = sub;
  }

  function kv(label, value, mono) {
    return `
      <div class="kv">
        <div class="k">${escapeHtml(label)}</div>
        <div class="v ${mono ? "mono" : ""}">${value == null || value === "" ? "—" : String(value)}</div>
      </div>
    `;
  }

  function buildCredentialsText(user, account, creds, includeCredentials) {
    const name = `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "Customer";
    const lines = [
      `Customer Name: ${name}`,
      `Account No: ${account?.accountNumber || ""}`,
      `Balance: ${money(account?.balance || 0, account?.currency || "USD")}`,
      `Account Status: ${account?.status || "ACTIVE"}`,
      `Login Email: ${creds?.email || user?.email || ""}`
    ];
    if (includeCredentials) {
      lines.push(`Login Password: ${creds?.password || ""}`);
      lines.push(`Account PIN: ${creds?.accountPin || ""}`);
      lines.push(`Transfer Code: ${creds?.transferCode || ""}`);
    } else {
      lines.push("Login Password: <displayed at account creation>");
      lines.push("Account PIN: <displayed at account creation>");
      lines.push("Transfer Code: <displayed at account creation>");
    }
    lines.push("");
    return lines.join("\n");
  }

  let reviewState = {
    uid: null,
    user: null,
    lastCredentials: null
  };

  async function loadCustomerReview(uid) {
    if (!uid) return;
    reviewState = { uid, user: null, lastCredentials: null };
    setReviewOpen(true);
    setReviewTitle("Customer Account Review", "Loading…");
    setReviewBody(`<div class="review-loading">Loading customer account details…</div>`);
    try {
      const data = await api(`/api/admin/users/${encodeURIComponent(uid)}`);
      const u = data?.user || {};
      reviewState.user = u;
      renderCustomerReview(u);
    } catch (e) {
      setReviewTitle("Customer Account Review", "Load failed");
      setReviewBody(
        `<div class="review-empty" style="color:#bfdbfe">${escapeHtml(
          e?.message || "Unable to load customer details."
        )}</div>`
      );
    }
  }

  function renderCustomerReview(u) {
    const prof = u.profile || {};
    const acc = u.account || {};
    const sec = u.security || {};
    const auth = u.auth || {};
    const txs = Array.isArray(u.transactions) ? u.transactions : [];
    const fullName = `${prof.firstname || ""} ${prof.lastname || ""}`.trim() || "Customer";
    setReviewTitle(
      `${fullName} — Account Review`,
      `UID ${u.uid} · Email ${u.email || "—"}`
    );

    const totalTx = txs.length;
    const lastSignIn = auth.lastSignInTime || acc.lastLogin || acc.openingDate || u.createdAt;

    const sessEmail = String(window.ADMIN_SESSION_EMAIL || "").trim();
    const ownerEmail = String(window.ADMIN_OWNER_EMAIL || "").trim();
    const isAdminGen = !!(u.adminGenerated || u._adminCreated || (u.createdBy && String(u.createdBy).trim()));
    const createdByStr = String(u.createdBy || "").trim();
    const canAct = !isAdminGen || (createdByStr === sessEmail || sessEmail === ownerEmail);

    const createdAtMs = u.createdAt ? Date.parse(u.createdAt) : NaN;
    const ageDays = Number.isFinite(createdAtMs) ? ((Date.now() - createdAtMs) / 86400000) : 0;
    const oldStatusSet = new Set(["CLOSED","EXPIRED","SUSPENDED","BLOCKED"]);
    const statusUp = String(u.status || acc.status || "ACTIVE").toUpperCase();
    const isOld = ageDays >= 30 || oldStatusSet.has(statusUp);
    const canDelete = !isAdminGen || isOld;

    const accountActionsHtml = `
      <div style="display:flex;flex-direction:column;gap:8px;min-width:120px;margin:0 0 12px;">
        <button type="button" data-action="suspend" data-uid="${escapeHtml(u.uid)}" ${canAct ? '' : 'disabled title="Only the admin who created this account (or account owner) can perform actions on admin-generated accounts."'} style="min-height:34px;padding:6px 10px;border-radius:10px;font-weight:800;border:1px solid #f59e0b;background:#fffbeb;color:#92400e;cursor:pointer;${canAct?'':'opacity:0.5;cursor:not-allowed;'}">
          <i class="fas fa-pause" style="margin-right:6px;"></i>Suspend
        </button>
        <button type="button" data-action="close" data-uid="${escapeHtml(u.uid)}" ${canAct ? '' : 'disabled title="Only the admin who created this account (or account owner) can perform actions on admin-generated accounts."'} style="min-height:34px;padding:6px 10px;border-radius:10px;font-weight:800;border:1px solid #7c2d12;background:#fff7ed;color:#7c2d12;cursor:pointer;${canAct?'':'opacity:0.5;cursor:not-allowed;'}">
          <i class="fas fa-door-closed" style="margin-right:6px;"></i>Close
        </button>
        <button type="button" data-action="delete" data-uid="${escapeHtml(u.uid)}" data-created="${escapeHtml(u.createdAt||'')}" data-status="${escapeHtml(u.status||acc.status||'')}" ${(canAct && canDelete) ? '' : 'disabled title="Delete requires account creator/owner ownership + account must be 30+ days old OR have status in [CLOSED,EXPIRED,SUSPENDED,BLOCKED]."'} style="min-height:34px;padding:6px 10px;border-radius:10px;font-weight:800;border:1px solid #dc2626;background:#fef2f2;color:#991b1b;cursor:pointer;${(canAct && canDelete)?'':'opacity:0.5;cursor:not-allowed;'}">
          <i class="fas fa-trash-alt" style="margin-right:6px;"></i>Delete
        </button>
      </div>
    `;

    const profilePicUrl = String(
      prof.profilePic || prof.photoURL || prof.photo || prof.avatar || ""
    ).trim();
    const profilePicHtml = profilePicUrl
      ? `<img src="${escapeHtml(profilePicUrl)}" alt="Profile" style="max-width:120px;max-height:120px;border-radius:12px;border:1px solid rgba(219,234,254,0.2);display:block;" onerror="this.style.display='none'" />`
      : "";

    const profileHtml = `
      <div class="review-panel">
        <h4>Profile / KYC</h4>
        ${profilePicUrl ? kv("Profile Photo", profilePicHtml) : kv("Profile Photo", "—")}
        ${kv("First name", escapeHtml(prof.firstname || ""))}
        ${kv("Last name", escapeHtml(prof.lastname || ""))}
        ${kv("Email", escapeHtml(u.email || ""))}
        ${kv("Preferred Language", `<span class="pill info">${escapeHtml(String(prof.preferredLanguage || u.preferredLanguage || "en").toUpperCase())}</span>`)}
        ${kv("Phone", escapeHtml(prof.phone || ""))}
        ${kv("Gender", escapeHtml(prof.gender || ""))}
        ${kv("Date of birth", escapeHtml(prof.dateOfBirth || ""))}
        ${kv("Occupation", escapeHtml(prof.occupation || ""))}
        ${kv("Nationality", escapeHtml(prof.nationality || ""))}
        ${kv("Address", escapeHtml(prof.address || ""))}
        ${kv("City", escapeHtml(prof.city || ""))}
        ${kv("State", escapeHtml(prof.state || ""))}
        ${kv("ZIP / Postal", escapeHtml(prof.zipCode || ""))}
        ${kv("Country", escapeHtml(prof.country || ""))}
      </div>
    `;

    const accountHtml = `
      <div class="review-panel">
        <h4>Account</h4>
        ${kv("Account No.", `<span class="mono">${escapeHtml(acc.accountNumber || "")}</span>`, true)}
        ${kv("Branch code", escapeHtml(acc.branchCode || ""))}
        ${kv("Account type", escapeHtml(acc.accountType || "SAVINGS"))}
        ${kv("Currency", escapeHtml(acc.currency || "USD"))}
        ${kv("Balance", money(acc.balance || 0, acc.currency || "USD"))}
        ${kv("Status", statusPill(acc.status || "ACTIVE"))}
        ${kv("Opening date", formatDate(acc.openingDate || u.createdAt))}
        ${kv("Last login (account)", formatDate(acc.lastLogin || null))}
        ${kv("Updated at", formatDate(u.updatedAt || null))}
        ${acc.routingNumber ? kv("Routing No.", escapeHtml(acc.routingNumber)) : ""}
        ${acc.iban ? kv("IBAN", `<span class="mono">${escapeHtml(acc.iban)}</span>`, true) : ""}
        ${acc.swiftBic ? kv("SWIFT/BIC", escapeHtml(acc.swiftBic)) : ""}
      </div>
    `;

    const secHtml = `
      <div class="review-panel">
        <h4>Security / Auth</h4>
        ${kv("Account PIN", sec.accountPinHashSet ? `<span class="pill ok">SET</span>` : `<span class="pill bad">NOT SET</span>`)}
        ${kv("Transfer code", sec.transferPinHashSet ? `<span class="pill ok">SET</span>` : `<span class="pill bad">NOT SET</span>`)}
        ${kv("2FA", sec.twoFactorEnabled ? `<span class="pill ok">ON</span>` : `<span class="pill warn">OFF</span>`)}
        ${kv("Last PIN change", formatDate(sec.lastPinChangeAt || null))}
        ${kv("Last password change", formatDate(sec.lastPasswordChangeAt || null))}
        ${kv("Firebase verified", auth.emailVerified ? `<span class="pill ok">YES</span>` : `<span class="pill warn">NO</span>`)}
        ${kv("Account disabled", auth.disabled ? `<span class="pill bad">YES</span>` : `<span class="pill ok">NO</span>`)}
        ${kv("Last sign-in (Firebase)", formatDate(lastSignIn || null))}
        ${kv("Firebase created", formatDate(auth.creationTime || u.createdAt))}
      </div>
    `;

    const txRowsHtml = totalTx
      ? txs
          .map((t) => {
            const amt = Number(t.amount || 0);
            const sign =
              t.type === "ADMIN_CREDIT" ||
              t.type === "OPENING_BALANCE" ||
              /CREDIT|IN|DEPOSIT|RECEIV/i.test(t.type || "")
                ? 1
                : -1;
            const signedAmt = sign * Math.abs(amt);
            const signPrefix = signedAmt >= 0 ? "+" : "";
            const amountColor = signedAmt >= 0 ? "#93c5fd" : "#dbeafe";
            const amountText = signPrefix + money(signedAmt, t.currency || acc.currency || "USD");
            const isOpeningBal = String(t.type || "").toUpperCase() === "OPENING_BALANCE";
            const openingDelBtn = isOpeningBal
              ? `<button type="button" data-action="delete-opening-tx" data-txid="${escapeHtml(t.id)}" ${canAct ? '' : 'disabled'} style="min-height:30px;padding:4px 8px;border-radius:8px;font-size:12px;font-weight:800;border:1px solid #dc2626;background:#fff;color:#991b1b;cursor:pointer;${canAct?'':'opacity:0.5;cursor:not-allowed;'}">
                  🗑️ Delete
                </button>`
              : "";
            return [
              "<tr>",
              `  <td class="mono">${formatShortDate(t.createdAt)}</td>`,
              `  <td class="mono">${escapeHtml(t.id || "").slice(0, 10)}…</td>`,
              `  <td><span class="pill info">${escapeHtml(t.type || "—")}</span></td>`,
              `  <td>${escapeHtml(t.note || t.reference || "—")}</td>`,
              `  <td style="text-align:right; font-weight:800; color:${amountColor}">${amountText}</td>`,
              `  <td style="display:flex;align-items:center;justify-content:space-between;gap:8px;">${statusPill(t.status || "PENDING")}${openingDelBtn}</td>`,
              "</tr>"
            ].join("");
          })
          .join("")
      : `<tr><td colspan="6" class="review-empty">No transactions yet for this customer.</td></tr>`;

    const txsHtml = `
      <div class="review-panel review-txs">
        <h4>Recent Transactions (${totalTx} shown, latest 25)</h4>
        <div class="txs-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Tx ID</th>
                <th>Type</th>
                <th>Note / Reference</th>
                <th style="text-align:right">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${txRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const initialCredsText = buildCredentialsText(
      { firstname: prof.firstname, lastname: prof.lastname, email: u.email },
      acc,
      { email: u.email },
      false
    );

    const credsHtml = `
      <div class="review-panel review-creds">
        <h4>Account Credentials</h4>
        <div class="warn">ℹ️ Account credentials are displayed once at account creation. Passwords and PINs are securely hashed and never stored in plaintext. Copy credentials from the creation output before closing the new-account modal.</div>
        ${accountActionsHtml}
        <div class="creds-actions">
          <button class="btn-secondary" id="reviewCopyBtn" type="button">Copy to Clipboard</button>
        </div>
        <textarea id="reviewCredsOutput" spellcheck="false" readonly>${escapeHtml(initialCredsText)}</textarea>
      </div>
    `;

    setReviewBody(
      `<div class="review-grid">${profileHtml}${accountHtml}${secHtml}${txsHtml}${credsHtml}</div>`
    );

    const copyBtn = document.getElementById("reviewCopyBtn");
    copyBtn?.addEventListener("click", onCopyCreds);

    const reviewBodyEl = document.getElementById("reviewBody");
    if (reviewBodyEl && !reviewBodyEl.__vtActionsWired) {
      reviewBodyEl.__vtActionsWired = true;
      reviewBodyEl.addEventListener("click", async (event) => {
        const uid = reviewState.uid;
        const curUser = reviewState.user;
        const sessEmailL = String(window.ADMIN_SESSION_EMAIL || "").trim();
        const ownerEmailL = String(window.ADMIN_OWNER_EMAIL || "").trim();

        function computeCanActLocal(user) {
          if (!user) return true;
          const isAG = !!(user.adminGenerated || user._adminCreated || (user.createdBy && String(user.createdBy).trim()));
          if (!isAG) return true;
          const cb = String(user.createdBy || "").trim();
          return cb === sessEmailL || sessEmailL === ownerEmailL;
        }

        const canActLocal = computeCanActLocal(curUser);

        const suspendBtn = event.target.closest("[data-action='suspend']");
        const closeBtn = event.target.closest("[data-action='close']");
        const deleteBtn = event.target.closest("[data-action='delete']");
        const delOpeningBtn = event.target.closest("[data-action='delete-opening-tx']");

        if (suspendBtn) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const bUid = suspendBtn.getAttribute("data-uid") || uid;
          if (suspendBtn.disabled || suspendBtn.hasAttribute("disabled")) {
            try { Swal.fire({icon:'error', title:'Permission denied', text:suspendBtn.getAttribute("title") || 'Action not permitted.'}); } catch(e) {}
            return;
          }
          if (!canActLocal) {
            try { Swal.fire({icon:'error', title:'Permission denied', text:'Only the admin who created this account (or account owner) can perform actions on admin-generated accounts.'}); } catch(e) {}
            return;
          }
          try {
            const r = await Swal.fire({title:'Suspend account?', text:'This user will be unable to transact.', icon:'warning', showCancelButton:true, confirmButtonText:'Suspend', cancelButtonText:'Cancel', confirmButtonColor:'#d97706'});
            if (!r.isConfirmed) return;
          } catch(e) {
            if (!window.confirm("Suspend account? This user will be unable to transact.")) return;
          }
          suspendBtn.disabled = true;
          const oldT = suspendBtn.innerHTML;
          suspendBtn.textContent = "Suspending…";
          try {
            await api(`/api/admin/users/${encodeURIComponent(bUid)}/suspend`, { method: "POST" });
            await loadCustomerReview(bUid);
          } catch (err) {
            try { Swal.fire({icon:'error', title:'Failed', text: err?.message || 'Unable to suspend account.'}); } catch(e) {}
            suspendBtn.disabled = false;
            suspendBtn.innerHTML = oldT;
          }
          return;
        }

        if (closeBtn) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const bUid = closeBtn.getAttribute("data-uid") || uid;
          if (closeBtn.disabled || closeBtn.hasAttribute("disabled")) {
            try { Swal.fire({icon:'error', title:'Permission denied', text:closeBtn.getAttribute("title") || 'Action not permitted.'}); } catch(e) {}
            return;
          }
          if (!canActLocal) {
            try { Swal.fire({icon:'error', title:'Permission denied', text:'Only the admin who created this account (or account owner) can perform actions on admin-generated accounts.'}); } catch(e) {}
            return;
          }
          try {
            const r = await Swal.fire({title:'Permanently close account?', text:'Account will be marked CLOSED. This can be reverted by re-opening.', icon:'warning', showCancelButton:true, confirmButtonText:'Close Account', confirmButtonColor:'#7c2d12'});
            if (!r.isConfirmed) return;
          } catch(e) {
            if (!window.confirm("Permanently close account? Account will be marked CLOSED.")) return;
          }
          closeBtn.disabled = true;
          const oldT = closeBtn.innerHTML;
          closeBtn.textContent = "Closing…";
          try {
            await api(`/api/admin/users/${encodeURIComponent(bUid)}/close`, { method: "POST" });
            await loadCustomerReview(bUid);
          } catch (err) {
            try { Swal.fire({icon:'error', title:'Failed', text: err?.message || 'Unable to close account.'}); } catch(e) {}
            closeBtn.disabled = false;
            closeBtn.innerHTML = oldT;
          }
          return;
        }

        if (deleteBtn) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const bUid = deleteBtn.getAttribute("data-uid") || uid;
          const statusField = deleteBtn.getAttribute("data-status") || "";
          const createdFrom = deleteBtn.getAttribute("data-created") || "";
          const userDisplayName = curUser ? `${curUser.profile?.firstname||''} ${curUser.profile?.lastname||''}`.trim() || curUser.email || bUid : bUid;

          if (!canActLocal) {
            try { Swal.fire({icon:'error', title:'Permission denied', text:'Only the admin who created this account (or account owner) can delete admin-generated accounts.'}); } catch(e) {}
            return;
          }
          if (deleteBtn.disabled || deleteBtn.hasAttribute("disabled")) {
            try { Swal.fire({icon:'error', title:'Cannot delete', text: deleteBtn.getAttribute("title") || 'This account cannot be deleted at this time.'}); } catch(e) {}
            return;
          }

          const confirmMessage = `PERMANENTLY DELETE THIS OLD CUSTOMER ACCOUNT?\n\nThis will permanently erase:\n• Customer profile, KYC data, credentials, and contact information\n• Firebase login record (prevents future sign-ins)\n• ALL transactions (local + Firestore sub-collection + top-level global transactions)\n• Local JSON mirror data\n\nAccount UID: ${bUid}\nAccount name: ${userDisplayName}\nCreated: ${createdFrom}\nStatus: ${statusField}\n\nThis action CANNOT be undone.\n\nType the exact word "DELETE" into the prompt field below to confirm.`;

          const confirmResult = window.prompt(confirmMessage, "");
          if (confirmResult === null) return;
          if (String(confirmResult).trim() !== "DELETE") {
            try { Swal.fire({icon:'error', title:'Aborted', text:'Confirmation string did not match. Delete aborted.'}); } catch(e) {}
            return;
          }
          deleteBtn.disabled = true;
          deleteBtn.textContent = "Deleting…";
          try {
            await api(`/api/admin/users/${encodeURIComponent(bUid)}`, { method: "DELETE" });
            setReviewOpen(false);
            const tb = document.getElementById("adminUsersBody");
            const tbl = tb && tb.closest("table");
            if (typeof window !== "undefined") {
              try {
                const ld = window.__vtReloadListUsers || null;
                if (typeof ld === "function") ld();
              } catch(e) {}
            }
          } catch (err) {
            try { Swal.fire({icon:'error', title:'Delete failed', text: err?.message || 'Unable to delete account.'}); } catch(e) {}
            deleteBtn.disabled = false;
            deleteBtn.textContent = "Delete";
          }
          return;
        }

        if (delOpeningBtn) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const txid = delOpeningBtn.getAttribute("data-txid") || "";
          const bUid = uid;
          if (!bUid || !txid) return;
          if (delOpeningBtn.disabled || delOpeningBtn.hasAttribute("disabled")) {
            try { Swal.fire({icon:'error', title:'Permission denied', text:'Only the admin who created this account (or account owner) can delete opening-balance entries.'}); } catch(e) {}
            return;
          }
          if (!canActLocal) {
            try { Swal.fire({icon:'error', title:'Permission denied', text:'Only the admin who created this account (or account owner) can delete opening-balance entries.'}); } catch(e) {}
            return;
          }
          let confirmed = false;
          try {
            const r = await Swal.fire({title:'Delete this opening-balance entry?', text:'This action is permanent. Type DELETE below to confirm.', input:'text', inputPlaceholder:'Type DELETE to confirm', showCancelButton:true, confirmButtonText:'Permanently Delete', confirmButtonColor:'#dc2626', preConfirm: (v) => String(v||'').trim() === 'DELETE' ? true : Swal.showValidationMessage('You must type exactly DELETE')});
            confirmed = !!r.isConfirmed;
          } catch(e) {
            const typed = window.prompt("Delete this opening-balance entry?\n\nThis action is permanent.\n\nType DELETE to confirm:", "");
            confirmed = typed != null && String(typed).trim() === "DELETE";
          }
          if (!confirmed) return;
          delOpeningBtn.disabled = true;
          const oldT = delOpeningBtn.innerHTML;
          delOpeningBtn.textContent = "Deleting…";
          try {
            await api(`/api/admin/users/${encodeURIComponent(bUid)}/opening-balances/${encodeURIComponent(txid)}`, { method: "DELETE" });
            await loadCustomerReview(bUid);
          } catch (err) {
            try { Swal.fire({icon:'error', title:'Delete failed', text: err?.message || 'Unable to delete opening-balance entry.'}); } catch(e) {}
            delOpeningBtn.disabled = false;
            delOpeningBtn.innerHTML = oldT;
          }
          return;
        }
      });
    }
  }

  async function onRegenerateCreds() {
    const uid = reviewState.uid;
    const btn = document.getElementById("reviewRegenerateBtn");
    const out = document.getElementById("reviewCredsOutput");
    if (!uid) return;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Regenerating…";
    }
    try {
      const data = await api(`/api/admin/users/${encodeURIComponent(uid)}/regenerate-credentials`, {
        method: "POST"
      });
      reviewState.lastCredentials = data || null;
      const text = buildCredentialsText(data?.user, data?.account, data?.credentials, true);
      if (out) out.value = text;
      flash("Credentials regenerated. Copy them now and send to the customer.");
    } catch (e) {
      flash(e?.message || "Unable to regenerate credentials.", true);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Regenerate Credentials";
      }
    }
  }

  async function onCopyCreds() {
    const out = document.getElementById("reviewCredsOutput");
    const btn = document.getElementById("reviewCopyBtn");
    const text = String(out?.value || "").trim();
    if (!text) {
      flash("Nothing to copy. Regenerate credentials first.", true);
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        out?.select();
        document.execCommand("copy");
        window.getSelection()?.removeAllRanges();
      }
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "Copied ✓";
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = old;
          btn.disabled = false;
        }, 1600);
      }
      flash("Account details copied to clipboard.");
    } catch (e) {
      flash(e?.message || "Unable to copy.", true);
    }
  }

  function randomInt(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  }

  function randomDigits(len) {
    const n = randomInt(0, Math.pow(10, len) - 1);
    return String(n).padStart(len, "0");
  }

  function randomPassword() {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const specials = "!@#$%&*_-+";
    const pick = (s) => s.charAt(Math.floor(Math.random() * s.length));
    let out = "";
    out += pick("ABCDEFGHJKLMNPQRSTUVWXYZ");
    out += pick(numbers);
    out += pick(specials);
    for (let i = 0; i < 9; i++) out += pick(letters + numbers);
    out += pick(specials);
    return out;
  }

  function setModalOpen(open) {
    const modal = document.getElementById("adminCreateModal");
    if (!modal) return;
    modal.style.display = open ? "block" : "none";
  }

  function setCreateOutput(text) {
    const out = document.getElementById("adminCreateOutput");
    if (!out) return;
    out.value = text || "";
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });

    if (!res.ok) {
      let msg = "Request failed";
      try {
        const data = await res.json();
        msg = String(data?.error || data?.detail || msg);
      } catch {}
      throw new Error(msg);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return null;
  }

  function flash(message, isError) {
    const el = document.getElementById("adminFlash") || document.getElementById("adminLoginError");
    if (!el) return;
    el.textContent = message || "";
    el.style.color = isError ? "#bfdbfe" : "#93c5fd";
  }

  function flashCreate(message, isError) {
    const el = document.getElementById("adminCreateFlash");
    if (!el) return;
    el.textContent = message || "";
    el.style.color = isError ? "#bfdbfe" : "#93c5fd";
  }

  function wireAdminLogin() {
    const form = document.getElementById("adminLoginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      flash("");

      const email = String(document.getElementById("adminEmail")?.value || "").trim();
      const password = String(document.getElementById("adminPassword")?.value || "");

      try {
        await api("/api/admin/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        window.location.href = "/admin/dashboard.html";
      } catch (error) {
        flash(error?.message || "Unable to sign in", true);
      }
    });
  }

  function wireAdminDashboard() {
    const tableBody = document.getElementById("adminUsersBody");
    if (!tableBody) return;

    const searchInput = document.getElementById("adminUserSearch");
    const logoutBtn = document.getElementById("adminLogoutBtn");
    const createBtn = document.getElementById("adminCreateUserBtn");
    const clearAllBtn = document.getElementById("adminClearAllUsersBtn");
    const closeBtn = document.getElementById("adminCreateCloseBtn");
    const generateBtn = document.getElementById("adminGenerateBtn");
    const submitBtn = document.getElementById("adminCreateSubmitBtn");
    let state = { users: [] };

    clearAllBtn?.addEventListener("click", async () => {
      const confirmed = window.confirm(
        "PERMANENTLY CLEAR ALL OLD CUSTOMER ACCOUNTS?\n\n" +
        "This will delete ALL registered/generated customer accounts, their Firebase logins, and transaction records.\n\n" +
        "This action cannot be undone.\n\n" +
        "Click OK to clear all old customer accounts."
      );
      if (!confirmed) return;

      clearAllBtn.disabled = true;
      clearAllBtn.textContent = "Clearing...";
      flash("");

      try {
        const data = await api("/api/admin/clear-users", { method: "POST" });
        flash(data?.message || "All old customer accounts cleared successfully.");
        await loadUsers();
      } catch (error) {
        flash(error?.message || "Unable to clear customer accounts.", true);
      } finally {
        clearAllBtn.disabled = false;
        clearAllBtn.textContent = "Clear Old Accounts";
      }
    });

    logoutBtn?.addEventListener("click", async () => {
      try {
        await api("/api/admin/logout", { method: "POST" });
      } catch {}
      window.location.href = "/admin/login.html";
    });

    function collectCreateForm() {
      return {
        firstname: String(document.getElementById("createFirstname")?.value || "").trim(),
        lastname: String(document.getElementById("createLastname")?.value || "").trim(),
        email: String(document.getElementById("createEmail")?.value || "").trim(),
        password: String(document.getElementById("createPassword")?.value || ""),
        accountPin: String(document.getElementById("createAccountPin")?.value || "").trim(),
        transferCode: String(document.getElementById("createTransferCode")?.value || "").trim(),
        startingBalance: String(document.getElementById("createStartingBalance")?.value || "").trim(),
        phone: String(document.getElementById("createPhone")?.value || "").trim(),
        country: String(document.getElementById("createCountry")?.value || "").trim(),
        preferredLanguage: String(document.getElementById("createPreferredLanguage")?.value || "en").trim(),
        gender: String(document.getElementById("createGender")?.value || "").trim(),
        dateOfBirth: String(document.getElementById("createDateOfBirth")?.value || "").trim(),
        nationality: String(document.getElementById("createNationality")?.value || "").trim(),
        occupation: String(document.getElementById("createOccupation")?.value || "").trim(),
        address: String(document.getElementById("createAddress")?.value || "").trim(),
        city: String(document.getElementById("createCity")?.value || "").trim(),
        state: String(document.getElementById("createState")?.value || "").trim(),
        zipCode: String(document.getElementById("createZipCode")?.value || "").trim(),
        profilePic: String(document.getElementById("createProfilePic")?.value || "").trim()
      };
    }

    function resizeAndCompressImage(file, maxDimension = 500, quality = 0.85) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Unable to read selected image file."));
        reader.onload = (e) => {
          const img = new Image();
          img.onerror = () => reject(new Error("Invalid or corrupt image file."));
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const outFormat = file.type === "image/png" ? "image/png" :
                              file.type === "image/gif" ? "image/gif" :
                              file.type === "image/webp" ? "image/webp" : "image/jpeg";
            const dataUrl = canvas.toDataURL(outFormat, quality);
            resolve({
              dataUrl,
              width,
              height,
              format: outFormat,
              fileName: file.name,
              fileSize: file.size
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    async function uploadAdminProfilePic(fileDataUrl, fileName) {
      const res = await fetch("/api/admin/upload-profile-pic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileDataUrl, fileName })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(String(data?.error || "Failed to upload profile picture."));
      }
      return data;
    }

    function wireProfilePicUploader() {
      const dropzone = document.getElementById("createProfilePicDropzone");
      const fileInput = document.getElementById("createProfilePicFile");
      const hiddenVal = document.getElementById("createProfilePic");
      const promptWrap = document.getElementById("createProfilePicPrompt");
      const previewWrap = document.getElementById("createProfilePicPreviewWrap");
      const previewImg = document.getElementById("createProfilePicPreview");
      const nameEl = document.getElementById("createProfilePicName");
      const metaEl = document.getElementById("createProfilePicMeta");
      const statusEl = document.getElementById("createProfilePicStatus");
      const removeBtn = document.getElementById("createProfilePicRemoveBtn");
      const errorEl = document.getElementById("createProfilePicError");

      if (!dropzone || !fileInput) return;

      function showError(msg) {
        if (!errorEl) return;
        if (msg) {
          errorEl.textContent = msg;
          errorEl.style.display = "block";
        } else {
          errorEl.textContent = "";
          errorEl.style.display = "none";
        }
      }

      function resetPicState() {
        if (fileInput) fileInput.value = "";
        if (hiddenVal) hiddenVal.value = "";
        if (previewImg) previewImg.src = "";
        if (nameEl) nameEl.textContent = "";
        if (metaEl) metaEl.textContent = "";
        if (statusEl) statusEl.textContent = "";
        if (promptWrap) promptWrap.style.display = "block";
        if (previewWrap) previewWrap.style.display = "none";
        showError("");
      }

      async function processAndUploadFile(file) {
        showError("");
        if (!file) return;

        // Validation 1: Size (Max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          showError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB maximum limit.`);
          return;
        }

        // Validation 2: Format
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        const validExts = ["jpg", "jpeg", "png", "webp", "gif"];
        if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
          showError("Invalid file format. Only JPG, PNG, WebP, and GIF images are allowed.");
          return;
        }

        try {
          if (statusEl) {
            statusEl.textContent = "Optimizing image (500x500)...";
            statusEl.style.color = "#93c5fd";
          }
          if (promptWrap) promptWrap.style.display = "none";
          if (previewWrap) previewWrap.style.display = "flex";
          if (nameEl) nameEl.textContent = file.name;
          if (metaEl) metaEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;

          // Step 1: Resize and compress to max 500x500
          const processed = await resizeAndCompressImage(file, 500, 0.85);
          if (previewImg) previewImg.src = processed.dataUrl;
          if (metaEl) metaEl.textContent = `${processed.width}x${processed.height}px • ${(file.size / 1024).toFixed(1)} KB`;

          // Step 2: Upload to server endpoint
          if (statusEl) {
            statusEl.textContent = "Uploading to secure storage...";
            statusEl.style.color = "#93c5fd";
          }
          const uploadRes = await uploadAdminProfilePic(processed.dataUrl, file.name);
          const finalUrl = uploadRes.secure_url || processed.dataUrl;
          if (hiddenVal) hiddenVal.value = finalUrl;

          if (statusEl) {
            statusEl.textContent = "✓ Uploaded & Attached";
            statusEl.style.color = "#34d399";
          }
        } catch (err) {
          showError(err.message || "Failed to process and upload image.");
          resetPicState();
        }
      }

      dropzone.addEventListener("click", (e) => {
        if (e.target === removeBtn || removeBtn?.contains(e.target)) return;
        fileInput.click();
      });

      fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];
        if (file) processAndUploadFile(file);
      });

      removeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        resetPicState();
      });

      // Drag & Drop
      ["dragenter", "dragover"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = "#60a5fa";
          dropzone.style.background = "rgba(30, 58, 138, 0.3)";
        });
      });

      ["dragleave", "drop"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.borderColor = "rgba(147,197,253,0.3)";
          dropzone.style.background = "rgba(15,23,42,0.4)";
        });
      });

      dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const file = dt && dt.files && dt.files[0];
        if (file) processAndUploadFile(file);
      });

      window.__vtResetAdminPicUpload = resetPicState;
    }

    function fillCreateForm(next) {
      if (next.firstname != null) document.getElementById("createFirstname").value = next.firstname;
      if (next.lastname != null) document.getElementById("createLastname").value = next.lastname;
      if (next.email != null) document.getElementById("createEmail").value = next.email;
      if (next.password != null) document.getElementById("createPassword").value = next.password;
      if (next.accountPin != null) document.getElementById("createAccountPin").value = next.accountPin;
      if (next.transferCode != null) document.getElementById("createTransferCode").value = next.transferCode;
      if (next.startingBalance != null) document.getElementById("createStartingBalance").value = next.startingBalance;
      if (next.phone != null) document.getElementById("createPhone").value = next.phone;
      if (next.country != null) document.getElementById("createCountry").value = next.country;
      if (next.preferredLanguage != null) document.getElementById("createPreferredLanguage").value = next.preferredLanguage;
      if (next.gender != null) document.getElementById("createGender").value = next.gender;
      if (next.dateOfBirth != null) document.getElementById("createDateOfBirth").value = next.dateOfBirth;
      if (next.nationality != null) document.getElementById("createNationality").value = next.nationality;
      if (next.occupation != null) document.getElementById("createOccupation").value = next.occupation;
      if (next.address != null) document.getElementById("createAddress").value = next.address;
      if (next.city != null) document.getElementById("createCity").value = next.city;
      if (next.state != null) document.getElementById("createState").value = next.state;
      if (next.zipCode != null) document.getElementById("createZipCode").value = next.zipCode;
      if (next.profilePic != null) {
        document.getElementById("createProfilePic").value = next.profilePic;
        if (!next.profilePic) {
          if (typeof window.__vtResetAdminPicUpload === "function") {
            window.__vtResetAdminPicUpload();
          }
        } else {
          const previewWrap = document.getElementById("createProfilePicPreviewWrap");
          const promptWrap = document.getElementById("createProfilePicPrompt");
          const previewImg = document.getElementById("createProfilePicPreview");
          const nameEl = document.getElementById("createProfilePicName");
          const statusEl = document.getElementById("createProfilePicStatus");
          if (previewImg) previewImg.src = next.profilePic;
          if (nameEl) nameEl.textContent = "Attached Profile Picture";
          if (statusEl) {
            statusEl.textContent = "✓ Image Loaded";
            statusEl.style.color = "#34d399";
          }
          if (promptWrap) promptWrap.style.display = "none";
          if (previewWrap) previewWrap.style.display = "flex";
        }
      }
    }

    function renderCreatedInfo(data) {
      const user = data?.user || {};
      const creds = data?.credentials || {};
      const account = data?.account || {};
      setCreateOutput(
        [
          `Customer Name: ${(user.firstname || "").trim()} ${(user.lastname || "").trim()}`.trim(),
          `Account No: ${account.accountNumber || user.accountNumber || ""}`,
          `Starting Balance: ${money(account.balance || 0)}`,
          `Login Email: ${creds.email || user.email || ""}`,
          `Login Password: ${creds.password || ""}`,
          `Account PIN: ${creds.accountPin || ""}`,
          `Transfer Code: ${creds.transferCode || ""}`,
          ""
        ].join("\n")
      );
    }

    createBtn?.addEventListener("click", () => {
      flashCreate("");
      setCreateOutput("");
      fillCreateForm({
        password: randomPassword(),
        accountPin: randomDigits(6),
        transferCode: randomDigits(6),
        startingBalance: "0",
        phone: "",
        country: "",
        preferredLanguage: "en",
        gender: "",
        dateOfBirth: "",
        nationality: "",
        occupation: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        profilePic: ""
      });
      setModalOpen(true);
    });

    closeBtn?.addEventListener("click", () => {
      setModalOpen(false);
    });

    generateBtn?.addEventListener("click", () => {
      flashCreate("");
      const cur = collectCreateForm();
      fillCreateForm({
        password: cur.password || randomPassword(),
        accountPin: /^\d{6}$/.test(cur.accountPin) ? cur.accountPin : randomDigits(6),
        transferCode: cur.transferCode ? cur.transferCode : randomDigits(6)
      });
    });

    wireProfilePicUploader();

    submitBtn?.addEventListener("click", async () => {
      flashCreate("");
      const payload = collectCreateForm();
      if (!payload.preferredLanguage || !payload.preferredLanguage.trim()) {
        flashCreate("Preferred Language is mandatory. Please select an account language.", true);
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating...";
      try {
        const data = await api("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        renderCreatedInfo(data);
        flashCreate("Customer created successfully.");
        await loadUsers();
      } catch (error) {
        flashCreate(error?.message || "Unable to create customer", true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
      }
    });

    function rowMarkup(user) {
  const fullName =
    `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
    "No name set";

  const isAdminGen = !!(user.adminGenerated || user._adminCreated || (user.createdBy && String(user.createdBy).trim()));
  const createdByStr = String(user.createdBy || "").trim();
  const canAct = !isAdminGen || (createdByStr === sessionEmail || sessionEmail === OWNER_EMAIL);

  const createdAtMs = user.createdAt ? Date.parse(user.createdAt) : NaN;
  const ageDays = Number.isFinite(createdAtMs) ? ((Date.now() - createdAtMs) / 86400000) : 0;
  const oldStatusSet = new Set(["CLOSED","EXPIRED","SUSPENDED","BLOCKED"]);
  const statusUp = String(user.status || "ACTIVE").toUpperCase();
  const isOld = ageDays >= 30 || oldStatusSet.has(statusUp);
  const canDelete = !isAdminGen || isOld;

  return `
    <tr data-uid="${escapeHtml(user.uid)}" data-created="${escapeHtml(user.createdAt ? (new Date(user.createdAt)).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}) : '—')}">

      <td data-label="Customer">
        <div class="name">
          <a
            class="review-link"
            data-action="review"
            data-uid="${escapeHtml(user.uid)}"
            href="javascript:void(0)"
          >
            ${escapeHtml(fullName)}
          </a>
        </div>

        <div class="sub">
          ${user.email ? escapeHtml(user.email) : "No email"}
        </div>

        <div class="sub">
          UID: ${escapeHtml(user.uid)}
        </div>
      </td>

      <td data-label="Account">
        <input
          type="text"
          data-field="accountNumber"
          value="${escapeHtml(user.accountNumber || "")}"
          placeholder="Account number"
          style="margin-bottom:8px"
          disabled
        />

        <div class="sub">
          ${escapeHtml(user.currency || "USD")}
        </div>
      </td>

      <td data-label="Balance">
        <input
          type="number"
          step="0.01"
          min="0"
          data-field="balance"
          value="${Number(user.balance || 0)}"
          disabled
        />
      </td>

      <td data-label="Status">
        <select data-field="status" disabled>

          <option
            value="ACTIVE"
            ${user.status === "ACTIVE" ? "selected" : ""}
          >
            ACTIVE
          </option>

          <option
            value="PENDING"
            ${user.status === "PENDING" ? "selected" : ""}
          >
            PENDING
          </option>

          <option
            value="EXPIRED"
            ${user.status === "EXPIRED" ? "selected" : ""}
          >
            EXPIRED
          </option>

          <option
            value="SUSPENDED"
            ${user.status === "SUSPENDED" ? "selected" : ""}
          >
            SUSPENDED
          </option>

          <option
            value="BLOCKED"
            ${user.status === "BLOCKED" ? "selected" : ""}
          >
            BLOCKED
          </option>

          <option
            value="CLOSED"
            ${user.status === "CLOSED" ? "selected" : ""}
          >
            CLOSED
          </option>

        </select>

        <div class="sub">
          <span class="status">
            ${escapeHtml(user.status || "ACTIVE")}
          </span>
        </div>
      </td>

      <td data-label="Names">
        <input
          type="text"
          data-field="firstname"
          value="${escapeHtml(user.firstname || "")}"
          placeholder="First name"
          style="margin-bottom:8px"
          disabled
        />

        <input
          type="text"
          data-field="lastname"
          value="${escapeHtml(user.lastname || "")}"
          placeholder="Last name"
          disabled
        />
      </td>

      <td data-action-col>
        <div style="display:flex;flex-direction:column;gap:8px;min-width:120px;">
          <button type="button" data-action="suspend" data-uid="${escapeHtml(user.uid)}" ${canAct ? '' : 'disabled title="Only the admin who created this account (or account owner) can perform actions on admin-generated accounts."'} style="min-height:34px;padding:6px 10px;border-radius:10px;font-weight:800;border:1px solid #f59e0b;background:#fffbeb;color:#92400e;cursor:pointer;${canAct?'':'opacity:0.5;cursor:not-allowed;'}">
            <i class="fas fa-pause" style="margin-right:6px;"></i>Suspend
          </button>
          <button type="button" data-action="close" data-uid="${escapeHtml(user.uid)}" ${canAct ? '' : 'disabled title="Only the admin who created this account (or account owner) can perform actions on admin-generated accounts."'} style="min-height:34px;padding:6px 10px;border-radius:10px;font-weight:800;border:1px solid #7c2d12;background:#fff7ed;color:#7c2d12;cursor:pointer;${canAct?'':'opacity:0.5;cursor:not-allowed;'}">
            <i class="fas fa-door-closed" style="margin-right:6px;"></i>Close
          </button>
          <button type="button" data-action="delete" data-uid="${escapeHtml(user.uid)}" data-created="${escapeHtml(user.createdAt||'')}" data-status="${escapeHtml(user.status||'')}" ${(canAct && canDelete) ? '' : 'disabled title="Delete requires account creator/owner ownership + account must be 30+ days old OR have status in [CLOSED,EXPIRED,SUSPENDED,BLOCKED]."'} style="min-height:34px;padding:6px 10px;border-radius:10px;font-weight:800;border:1px solid #dc2626;background:#fef2f2;color:#991b1b;cursor:pointer;${(canAct && canDelete)?'':'opacity:0.5;cursor:not-allowed;'}">
            <i class="fas fa-trash-alt" style="margin-right:6px;"></i>Delete
          </button>
        </div>
      </td>

    </tr>
  `;
}

    function render(users) {
      if (!users.length) {
        tableBody.innerHTML = `<tr><td colspan="6" class="muted">No users found.</td></tr>`;
        return;
      }
      tableBody.innerHTML = users.map(rowMarkup).join("");
    }

    function filterUsers() {
      const q = String(searchInput?.value || "").trim().toLowerCase();
      if (!q) return state.users;
      return state.users.filter((user) => {
        return [user.firstname, user.lastname, user.email, user.accountNumber, user.status]
          .join(" ")
          .toLowerCase()
          .includes(q);
      });
    }

    let sessionEmail = "";
    let OWNER_EMAIL = "";

    async function loadUsers() {
      flash("");
      const session = await api("/api/admin/session");
      sessionEmail = String(session?.admin?.email || "").trim();
      window.ADMIN_SESSION_EMAIL = sessionEmail;
      try {
        const me = await api("/api/admin/me");
        OWNER_EMAIL = String(me?.ownerEmail || me?.admin?.ownerEmail || me?.owner || "").trim();
        window.ADMIN_OWNER_EMAIL = OWNER_EMAIL;
      } catch {}
      const data = await api("/api/admin/users");
      state.users = Array.isArray(data?.users) ? data.users : [];

      document.getElementById("adminIdentity").textContent = session?.admin?.email || "Admin";
      document.getElementById("adminTotalUsers").textContent = String(data?.summary?.totalUsers || 0);
      document.getElementById("adminTotalBalances").textContent = money(data?.summary?.totalBalance || 0);
      render(filterUsers());
    }
    window.__vtReloadListUsers = loadUsers;

    searchInput?.addEventListener("input", () => {
      render(filterUsers());
    });

    tableBody.addEventListener("click", async (event) => {
      const reviewLink = event.target.closest("[data-action='review']");
      if (reviewLink) {
        event.preventDefault();
        const uid = reviewLink.getAttribute("data-uid") || reviewLink.closest("tr[data-uid]")?.getAttribute("data-uid");
        if (uid) loadCustomerReview(uid);
        return;
      }

      const button = event.target.closest("[data-action='save']");
      const suspendButton = event.target.closest("[data-action='suspend']");
      const closeButton = event.target.closest("[data-action='close']");
      const deleteButton = event.target.closest("[data-action='delete']");

      function findUser(uid) {
        return (state.users || []).find(u => u && String(u.uid) === String(uid)) || null;
      }
      function computeCanAct(user) {
        if (!user) return true;
        const isAdminGen = !!(user.adminGenerated || user._adminCreated || (user.createdBy && String(user.createdBy).trim()));
        if (!isAdminGen) return true;
        const createdByStr = String(user.createdBy || "").trim();
        return createdByStr === sessionEmail || sessionEmail === OWNER_EMAIL;
      }

      if (suspendButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const uid = suspendButton.getAttribute("data-uid");
        const user = findUser(uid);
        const canAct = computeCanAct(user);
        if (suspendButton.disabled || suspendButton.hasAttribute("disabled")) {
          flash(suspendButton.getAttribute("title") || "You cannot perform this action.", true);
          return;
        }
        if (!canAct) {
          try { Swal.fire({icon:'error', title:'Permission denied', text:'Only the admin who created this account (or account owner) can perform actions on admin-generated accounts.'}); } catch(e) {}
          flash("Permission denied.", true);
          return;
        }
        if (!uid) { flash("Unable to locate account identifier.", true); return; }
        try {
          const r = await Swal.fire({title:'Suspend account?', text:'This user will be unable to transact.', icon:'warning', showCancelButton:true, confirmButtonText:'Suspend', cancelButtonText:'Cancel', confirmButtonColor:'#d97706'});
          if (!r.isConfirmed) return;
        } catch(e) {
          if (!window.confirm("Suspend account? This user will be unable to transact.")) return;
        }
        suspendButton.disabled = true;
        const oldText = suspendButton.innerHTML;
        suspendButton.textContent = "Suspending…";
        try {
          await api(`/api/admin/users/${encodeURIComponent(uid)}/suspend`, { method: "POST" });
          flash("Account suspended.");
          await loadUsers();
        } catch (err) {
          flash(err?.message || "Unable to suspend account.", true);
          suspendButton.disabled = false;
          suspendButton.innerHTML = oldText;
        }
        return;
      }

      if (closeButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const uid = closeButton.getAttribute("data-uid");
        const user = findUser(uid);
        const canAct = computeCanAct(user);
        if (closeButton.disabled || closeButton.hasAttribute("disabled")) {
          flash(closeButton.getAttribute("title") || "You cannot perform this action.", true);
          return;
        }
        if (!canAct) {
          try { Swal.fire({icon:'error', title:'Permission denied', text:'Only the admin who created this account (or account owner) can perform actions on admin-generated accounts.'}); } catch(e) {}
          flash("Permission denied.", true);
          return;
        }
        if (!uid) { flash("Unable to locate account identifier.", true); return; }
        try {
          const r = await Swal.fire({title:'Permanently close account?', text:'Account will be marked CLOSED. This can be reverted by re-opening.', icon:'warning', showCancelButton:true, confirmButtonText:'Close Account', confirmButtonColor:'#7c2d12'});
          if (!r.isConfirmed) return;
        } catch(e) {
          if (!window.confirm("Permanently close account? Account will be marked CLOSED.")) return;
        }
        closeButton.disabled = true;
        const oldText = closeButton.innerHTML;
        closeButton.textContent = "Closing…";
        try {
          await api(`/api/admin/users/${encodeURIComponent(uid)}/close`, { method: "POST" });
          flash("Account closed.");
          await loadUsers();
        } catch (err) {
          flash(err?.message || "Unable to close account.", true);
          closeButton.disabled = false;
          closeButton.innerHTML = oldText;
        }
        return;
      }

      if (deleteButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const row = deleteButton.closest("tr[data-uid]");
        const uid = row ? row.getAttribute("data-uid") : (deleteButton.getAttribute("data-uid") || null);
        const user = findUser(uid);
        const canAct = computeCanAct(user);

        if (!canAct) {
          try { Swal.fire({icon:'error', title:'Permission denied', text:'Only the admin who created this account (or account owner) can delete admin-generated accounts.'}); } catch(e) {}
          flash("Permission denied.", true);
          return;
        }

        const userNameCell = row ? (row.querySelector("a.review-link")?.textContent || row.querySelector(".name")?.textContent || "").trim() : (user ? `${user.firstname||''} ${user.lastname||''}`.trim() : "");
        const statusField = row ? (row.querySelector("[data-field='status']")?.value || row.querySelector(".status span")?.textContent || row.querySelector(".status")?.textContent || "ACTIVE").trim() : (deleteButton.getAttribute("data-status") || user?.status || "ACTIVE");
        const createdFrom = row ? row.getAttribute("data-created") || "—" : (deleteButton.getAttribute("data-created") || user?.createdAt || "—");

        if (deleteButton.disabled || deleteButton.hasAttribute("disabled")) {
          flash(deleteButton.getAttribute("title") || "This account cannot be deleted at this time.", true);
          return;
        }
        if (!uid) {
          flash("Unable to locate account identifier.", true);
          return;
        }

        const confirmMessage = `PERMANENTLY DELETE THIS OLD CUSTOMER ACCOUNT?\n\nThis will permanently erase:\n• Customer profile, KYC data, credentials, and contact information\n• Firebase login record (prevents future sign-ins)\n• ALL transactions (local + Firestore sub-collection + top-level global transactions)\n• Local JSON mirror data\n\nAccount UID: ${uid}\nAccount name: ${userNameCell}\nCreated: ${createdFrom}\nStatus: ${statusField}\n\nThis action CANNOT be undone.\n\nType the exact word "DELETE" into the prompt field below to confirm.`;

        const confirmResult = window.prompt(confirmMessage, "");
        if (confirmResult === null) {
          return;
        }
        if (String(confirmResult).trim() !== "DELETE") {
          flash("Confirmation string did not match. Delete aborted.", true);
          return;
        }

        deleteButton.disabled = true;
        deleteButton.textContent = "Deleting…";
        flash("");

        try {
          const body = await api(`/api/admin/users/${encodeURIComponent(uid)}`, { method: "DELETE" });
          flash(body?.message || "Old customer account permanently deleted.");
          await loadUsers();
        } catch (err) {
          flash(err?.message || "Unable to delete customer account.", true);
        } finally {
          deleteButton.disabled = false;
          deleteButton.textContent = "Delete";
        }

        return;
      }
      if (!button) return;
      flash("Admin-generated accounts are locked and cannot be modified. No edits to account number, balance, status, or names are permitted for admin-created accounts.", true);
      return;

      const row = button.closest("tr[data-uid]");
      if (!row) return;
      const uid = row.getAttribute("data-uid");

      const payload = {
  accountNumber:
    row.querySelector("[data-field='accountNumber']")?.value?.trim() || "",

  balance:
    row.querySelector("[data-field='balance']")?.value || "",

  status:
    row.querySelector("[data-field='status']")?.value || "ACTIVE",

  firstname:
    row.querySelector("[data-field='firstname']")?.value?.trim() || "",

  lastname:
    row.querySelector("[data-field='lastname']")?.value?.trim() || ""
};

      button.disabled = true;
      button.textContent = "Saving...";
      flash("");

      try {
        await api(`/api/admin/users/${encodeURIComponent(uid)}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        flash("Customer account updated successfully.");
        await loadUsers();
      } catch (error) {
        flash(error?.message || "Unable to update user", true);
      } finally {
        button.disabled = false;
        button.textContent = "Save";
      }
    });

    loadUsers().catch((error) => {
      flash(error?.message || "Unable to load admin dashboard", true);
      if (/unauthorized/i.test(String(error?.message || ""))) {
        window.location.href = "/admin/login.html";
      }
    });

    const reviewCloseBtn = document.getElementById("reviewCloseBtn");
    const reviewModal = document.getElementById("adminReviewModal");
    reviewCloseBtn?.addEventListener("click", () => setReviewOpen(false));
    reviewModal?.addEventListener("click", (e) => {
      if (e.target && e.target.id === "adminReviewModal") setReviewOpen(false);
    });
    if (window.addEventListener) {
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && reviewModal && reviewModal.style.display === "block") {
          setReviewOpen(false);
        }
      }, false);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireAdminLogin();
    wireAdminDashboard();
  });
})();
