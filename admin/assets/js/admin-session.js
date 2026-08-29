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
      lines.push("Login Password: <use Regenerate Credentials below>");
      lines.push("Account PIN: <use Regenerate Credentials below>");
      lines.push("Transfer Code: <use Regenerate Credentials below>");
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
            return [
              "<tr>",
              `  <td class="mono">${formatShortDate(t.createdAt)}</td>`,
              `  <td class="mono">${escapeHtml(t.id || "").slice(0, 10)}…</td>`,
              `  <td><span class="pill info">${escapeHtml(t.type || "—")}</span></td>`,
              `  <td>${escapeHtml(t.note || t.reference || "—")}</td>`,
              `  <td style="text-align:right; font-weight:800; color:${amountColor}">${amountText}</td>`,
              `  <td>${statusPill(t.status || "PENDING")}</td>`,
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
        <h4>Account Credentials (manually resend to customer)</h4>
        <div class="warn">⚠️ Plaintext passwords & PINs are never stored. Use Regenerate Credentials to produce a new fresh set that you can copy and send to the customer. Regenerating invalidates the old password/PIN/transfer code and logs them out.</div>
        <div class="creds-actions">
          <button class="btn" id="reviewRegenerateBtn" type="button">Regenerate Credentials</button>
          <button class="btn-secondary" id="reviewCopyBtn" type="button">Copy to Clipboard</button>
        </div>
        <textarea id="reviewCredsOutput" spellcheck="false" readonly>${escapeHtml(initialCredsText)}</textarea>
      </div>
    `;

    setReviewBody(
      `<div class="review-grid">${profileHtml}${accountHtml}${secHtml}${txsHtml}${credsHtml}</div>`
    );

    const regenBtn = document.getElementById("reviewRegenerateBtn");
    const copyBtn = document.getElementById("reviewCopyBtn");
    regenBtn?.addEventListener("click", onRegenerateCreds);
    copyBtn?.addEventListener("click", onCopyCreds);
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
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating...";
      try {
        const payload = collectCreateForm();
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

  return `
    <tr data-uid="${escapeHtml(user.uid)}">

      <td>
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

      <td>
        <input
          type="text"
          data-field="accountNumber"
          value="${escapeHtml(user.accountNumber || "")}"
          placeholder="Account number"
          style="margin-bottom:8px"
        />

        <div class="sub">
          ${escapeHtml(user.currency || "USD")}
        </div>
      </td>

      <td>
        <input
          type="number"
          step="0.01"
          min="0"
          data-field="balance"
          value="${Number(user.balance || 0)}"
        />
      </td>

      <td>
        <select data-field="status">

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

      <td>
        <input
          type="text"
          data-field="firstname"
          value="${escapeHtml(user.firstname || "")}"
          placeholder="First name"
          style="margin-bottom:8px"
        />

        <input
          type="text"
          data-field="lastname"
          value="${escapeHtml(user.lastname || "")}"
          placeholder="Last name"
        />
      </td>

      <td>
        <div style="
          display:flex;
          flex-direction:column;
          gap:8px;
          min-width:120px;
        ">

          <button
            class="btn"
            type="button"
            data-action="save"
          >
            Save / Repair
          </button>

          <button
            class="btn-secondary"
            type="button"
            data-action="delete"
            style="
              border-color:rgba(239,68,68,.45);
              color:#fecaca;
            "
          >
            Delete
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

    async function loadUsers() {
      flash("");
      const session = await api("/api/admin/session");
      const data = await api("/api/admin/users");
      state.users = Array.isArray(data?.users) ? data.users : [];

      document.getElementById("adminIdentity").textContent = session?.admin?.email || "Admin";
      document.getElementById("adminTotalUsers").textContent = String(data?.summary?.totalUsers || 0);
      document.getElementById("adminTotalBalances").textContent = money(data?.summary?.totalBalance || 0);
      render(filterUsers());
    }

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

      const deleteButton = event.target.closest("[data-action='delete']");

if (deleteButton) {
  const row = deleteButton.closest("tr[data-uid]");

  if (!row) return;

  const uid = row.getAttribute("data-uid");

  if (!uid) return;

  const name =
    row.querySelector(".name")?.textContent?.trim() ||
    "this customer";

  const accountNumber =
    row.querySelector("[data-field='accountNumber']")?.value?.trim() ||
    "";

  const confirmed = window.confirm(
    `PERMANENTLY DELETE CUSTOMER?\n\n` +
    `Customer: ${name}\n` +
    `Account: ${accountNumber || "Unknown"}\n\n` +
    `This will remove the customer's login and account data from the platform.\n\n` +
    `This action cannot be undone.\n\n` +
    `Click OK to permanently delete this customer.`
  );

  if (!confirmed) {
    return;
  }

  deleteButton.disabled = true;
  deleteButton.textContent = "Deleting...";
  flash("");

  try {
    await api(
      `/api/admin/users/${encodeURIComponent(uid)}`,
      {
        method: "DELETE"
      }
    );

    flash("Customer account permanently deleted.");

    /*
     * Close the review modal if the deleted customer
     * happens to be open there.
     */
    if (reviewState?.uid === uid) {
      setReviewOpen(false);
    }

    /*
     * Reload the existing customer list and totals.
     */
    await loadUsers();

  } catch (error) {

    flash(
      error?.message ||
        "Unable to permanently delete customer.",
      true
    );

    deleteButton.disabled = false;
    deleteButton.textContent = "Delete";
  }

  return;
}
      if (!button) return;

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
