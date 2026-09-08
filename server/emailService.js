const nodemailer = require("nodemailer");

let cachedTransporter = null;
let cachedConfigSig = "";
let cachedVerifyResult = { ok: false, checkedAt: 0 };
let lastSuccessfulSendAt = 0;

function maskEmail(email) {
  if (!email || typeof email !== "string") return "";
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const user = parts[0];
  const domain = parts[1];
  if (user.length <= 2) {
    return `${user[0] || "*"}***@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
  const service = process.env.SMTP_SERVICE || process.env.MAIL_SERVICE;
  const secure = port === 465 || String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  return { host, port, user, pass, service, secure };
}

function getFromAddress() {
  return (
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    `"VanguardDoubleTrust Security" <${
      process.env.SMTP_USER || process.env.MAIL_USER || "security@vanguarddoubletrust.com"
    }>`
  );
}

function getMailTransporter() {
  const { host, port, user, pass, service, secure } = getSmtpConfig();
  const sig = `${service || ""}|${host || ""}:${port}|${secure}|${user}|${pass ? String(pass).slice(0,8) : ""}`;
  if (cachedTransporter && cachedConfigSig === sig) {
    return cachedTransporter;
  }
  cachedTransporter = null;
  cachedConfigSig = sig;
  cachedVerifyResult = { ok: false, checkedAt: 0 };

  const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || (process.env.NODE_ENV === "production"));
  const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || (isRender ? 8000 : 20000));
  const greetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT_MS || (isRender ? 10000 : 30000));
  const socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT_MS || (isRender ? 20000 : 60000));
  const pool = isRender ? false : Boolean(process.env.SMTP_POOL_ENABLED !== "false");
  const maxConnections = Number(process.env.SMTP_MAX_CONNECTIONS || 1);

  if (service && user && pass) {
    try {
      cachedTransporter = nodemailer.createTransport({
        service,
        auth: { user, pass },
        pool,
        maxConnections,
        connectionTimeout,
        greetingTimeout,
        socketTimeout,
        logger: false,
        debug: false
      });
      return cachedTransporter;
    } catch (createErr) {
      console.error(
        `[EmailService] Failed to create service-based transport (${service}): ${createErr.message}`
      );
      return null;
    }
  }

  if (host && user && pass) {
    try {
      cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        pool,
        maxConnections,
        connectionTimeout,
        greetingTimeout,
        socketTimeout,
        tls: { rejectUnauthorized: port !== 587 },
        requireTLS: port === 587,
        logger: false,
        debug: false
      });
      return cachedTransporter;
    } catch (createErr) {
      console.error(
        `[EmailService] Failed to create host-based transport (${host}:${port}): ${createErr.message}`
      );
      return null;
    }
  }

  console.warn(
    "[EmailService] SMTP credentials are not fully configured in env vars. " +
      "Set either (SMTP_SERVICE + SMTP_USER + SMTP_PASS) or (SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS)."
  );
  return null;
}

async function verifyMailTransporter(transporter, opts = {}) {
  if (!transporter || typeof transporter.verify !== "function") return false;
  const force = Boolean(opts.force);
  const maxAgeMs = Number.isFinite(Number(opts.maxAgeMs)) ? Number(opts.maxAgeMs) : 30 * 60 * 1000;
  const now = Date.now();
  const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || (process.env.NODE_ENV === "production"));
  const recentSuccessWindowMs = Number(process.env.SMTP_LIVENESS_WINDOW_MS || 60 * 60 * 1000);

  if (!force) {
    if (cachedVerifyResult.ok && cachedVerifyResult.transporter === transporter && (now - cachedVerifyResult.checkedAt) < maxAgeMs) {
      return true;
    }
    if (lastSuccessfulSendAt > 0 && (now - lastSuccessfulSendAt) < recentSuccessWindowMs) {
      return true;
    }
  }

  const verifyTimeoutMs = Number(opts.timeoutMs || (isRender ? Number(process.env.SMTP_VERIFY_TIMEOUT_MS || 7000) : Number(process.env.SMTP_VERIFY_TIMEOUT_MS || 15000)));
  let timeoutHandle = null;
  let verifyDone = false;

  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        if (!verifyDone) {
          reject(new Error(`SMTP verify() timed out after ${verifyTimeoutMs}ms`));
        }
      }, verifyTimeoutMs);
    });
    const verifyPromise = Promise.resolve().then(async () => {
      try {
        const result = await transporter.verify();
        return result;
      } catch (e) {
        throw e;
      } finally {
        verifyDone = true;
      }
    });
    await Promise.race([verifyPromise, timeoutPromise]);
    cachedVerifyResult = { ok: true, transporter, checkedAt: now };
    if (timeoutHandle) clearTimeout(timeoutHandle);
    return true;
  } catch (verifyErr) {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    cachedVerifyResult = { ok: false, transporter, checkedAt: now };
    const msg = verifyErr && verifyErr.message ? verifyErr.message : verifyErr;
    console.warn(
      `[EmailService] SMTP transport verify() did not succeed (${msg}). Will attempt direct send anyway.`
    );
    return isRender ? true : false;
  }
}

function validateRecipient(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { valid: false, email: cleanEmail, error: "Recipient email address is invalid or not configured." };
  }
  return { valid: true, email: cleanEmail };
}

async function sendMail({ to, subject, text, html, from, extraHeaders }) {
  const recipientCheck = validateRecipient(to);
  if (!recipientCheck.valid) {
    const err = new Error(
      `Cannot dispatch email: ${recipientCheck.error}`
    );
    console.error(`[EmailService] Send aborted (invalid recipient): ${err.message}`);
    throw err;
  }

  if (!subject || (!text && !html)) {
    const err = new Error("Email subject and at least one of text or html body are required.");
    console.error(`[EmailService] Send aborted (missing content): ${err.message}`);
    throw err;
  }

  const cleanTo = recipientCheck.email;
  let cleanFrom = String(from || getFromAddress()).trim();
  const smtpCfg = getSmtpConfig();
  const smtpUser = String(smtpCfg.user || "").trim().toLowerCase();
  if (smtpUser && /gmail\.com$/i.test(smtpUser)) {
    const m = cleanFrom.match(/<([^>]+)>\s*$/);
    const addr = (m && m[1]) ? String(m[1]).trim().toLowerCase() : cleanFrom.toLowerCase().replace(/^["']|["']$/g, "");
    if (addr !== smtpUser) {
      const display = cleanFrom.replace(/<[^>]+>\s*$/, "").trim() || "VanguardDoubleTrust Security";
      cleanFrom = `"${display.replace(/^"|"$/g, "")}" <${smtpUser}>`;
    }
  }
  const maskedTo = maskEmail(cleanTo);
  const replyTo = String(smtpUser || cleanFrom.replace(/^.*<([^>]+)>\s*$/, "$1") || "").trim();

  console.log(
    `[EmailService] Initiating email dispatch to ${maskedTo}. Subject: "${String(subject).slice(0, 80)}"`
  );

  const transporter = getMailTransporter();
  if (!transporter) {
    const err = new Error(
      "Outbound email service is not available. SMTP credentials are not configured. Please contact an administrator."
    );
    console.error(`[EmailService] Send FAILED: ${err.message}`);
    throw err;
  }

  const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || (process.env.NODE_ENV === "production"));
  const sendTimeoutMs = Number(process.env.SMTP_SEND_TIMEOUT_MS || (isRender ? 25000 : 60000));

  const transportReady = await verifyMailTransporter(transporter, { maxAgeMs: 30 * 60 * 1000 });
  if (!transportReady) {
    const err = new Error(
      "Outbound email service is not responding. SMTP verification failed — please check your SMTP credentials or try again later."
    );
    console.error(`[EmailService] Send FAILED (transport not ready): ${err.message}`);
    throw err;
  }

  let sendTimeoutHandle = null;
  let sendDone = false;
  try {
    const sendTimeoutPromise = new Promise((_, reject) => {
      sendTimeoutHandle = setTimeout(() => {
        if (!sendDone) {
          reject(new Error(`SMTP sendMail timed out after ${sendTimeoutMs}ms`));
        }
      }, sendTimeoutMs);
    });
    const sendPromise = (async () => {
      try {
        const sent = await transporter.sendMail({
          from: cleanFrom,
          to: cleanTo,
          replyTo: replyTo,
          subject,
          text: text || undefined,
          html: html || undefined,
          headers: Object.assign(
            {
              "X-Mailer": "VanguardDoubleTrust SecureMail v1.0",
              "X-VT-Service": "vanguarddoubletrust",
              "X-VT-Audit-Id": `audit-${Date.now()}-${require("crypto").randomBytes(6).toString("hex")}`,
              "X-VT-OTP-Expires": "900",
              "X-VT-OTP-Window-Mins": "15",
              "X-Priority": "1 (Highest)",
              "X-MSMail-Priority": "High",
              "Importance": "High",
              "X-Auto-Response-Suppress": "All,OOF,DR,RN,NRN,AutoReply",
              "List-Unsubscribe": "<mailto:security@vanguarddoubletrust.com?subject=unsubscribe-security-alerts>"
            },
            extraHeaders && typeof extraHeaders === "object" && !Array.isArray(extraHeaders) ? extraHeaders : {}
          )
        });
        return sent;
      } finally {
        sendDone = true;
      }
    })();
    const sent = await Promise.race([sendPromise, sendTimeoutPromise]);
    if (sendTimeoutHandle) clearTimeout(sendTimeoutHandle);

    lastSuccessfulSendAt = Date.now();

    const acceptedOk = Array.isArray(sent.accepted) && sent.accepted.includes(cleanTo);
    if (!acceptedOk) {
      console.warn(
        `[EmailService] SMTP sendMail resolved but recipient not listed in accepted list. Raw response: ${JSON.stringify(
          { accepted: sent.accepted, rejected: sent.rejected, response: sent.response }
        )}`
      );
    }

    console.log(
      `[EmailService] Email successfully transmitted to ${cleanTo} (${maskedTo}). MessageId: ${
        sent.messageId || "N/A"
      }. Accepted: ${acceptedOk}.`
    );

    return {
      delivered: true,
      emailSent: true,
      recipient: cleanTo,
      maskedEmail: maskedTo,
      timestamp: new Date().toISOString(),
      messageId: sent.messageId || null,
      accepted: Boolean(acceptedOk),
      response: sent.response || "",
      envelope: sent.envelope || null
    };
  } catch (mailErr) {
    if (sendTimeoutHandle) clearTimeout(sendTimeoutHandle);
    console.error(
      `[EmailService] Email send FAILURE for ${cleanTo} (${maskedTo}). Error: ${
        mailErr && mailErr.message ? mailErr.message : mailErr
      }. Stack: ${mailErr && mailErr.stack ? mailErr.stack : "N/A"}`
    );
    throw mailErr;
  }
}

function buildTransferOtpMessage(recipientName, otpCode, transferContext = {}) {
  const cleanName = String(recipientName || "Customer").trim();
  const cleanOtp = String(otpCode || "").trim();
  const amountStr = transferContext.amount
    ? `${String(transferContext.currency || "USD").toUpperCase()} ${Number(
        transferContext.amount
      ).toFixed(2)}`
    : "your transfer";

  const subject = `[VanguardDoubleTrust] Your Transfer Verification Code: ${cleanOtp}`;
  const text = [
    `Hello ${cleanName},`,
    "",
    `A request has been initiated to transfer ${amountStr} from your VanguardDoubleTrust account.`,
    "",
    `Your 6-digit One-Time Password (OTP): ${cleanOtp}`,
    "This code is strictly valid for 15 minutes and can only be used once.",
    "",
    "If you did not initiate this transaction, please immediately secure your account and contact VanguardDoubleTrust Fraud Protection.",
    "",
    "- VanguardDoubleTrust Security"
  ].join("\n");

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em;">VanguardDoubleTrust</h1>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.85;">Secure Transaction Authorization</p>
      </div>
      <div style="padding: 32px 24px; color: #1e293b;">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #0f172a;">Transfer Verification Code</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Hello <strong>${cleanName}</strong>,<br>
          A request has been initiated to transfer <strong>${amountStr}</strong> from your VanguardDoubleTrust account.
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center;">
          <div style="font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase;">Your One-Time Password (OTP)</div>
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; margin: 10px 0;">${cleanOtp}</div>
          <div style="font-size: 12px; color: #dc2626; font-weight: 600;">Valid for 15 minutes only</div>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
          If you did not initiate this transaction, please immediately secure your account and contact VanguardDoubleTrust Fraud Protection.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} VanguardDoubleTrust. All rights reserved. Secure Banking Services.
      </div>
    </div>
  `;

  return { subject, text, html };
}

function buildAccountCreatedMessage(recipientName, otp, credentials = {}) {
  const cleanName = String(recipientName || "Customer").trim();
  const cleanOtp = String(otp || "").trim();
  const accountNumber = String(credentials.accountNumber || "").trim();
  const loginEmail = String(credentials.email || "").trim();
  const loginPassword = String(credentials.password || "").trim();
  const accountPin = String(credentials.accountPin || "").trim();
  const transferCode = String(credentials.transferCode || "").trim();

  const subject = `[VanguardDoubleTrust] Your New Account OTP: ${cleanOtp}`;

  const credentialsLines = [
    loginEmail ? `Login Email: ${loginEmail}` : "",
    loginPassword ? `Login Password: ${loginPassword}` : "",
    accountNumber ? `Account Number: ${accountNumber}` : "",
    accountPin ? `Account PIN: ${accountPin}` : "",
    transferCode ? `Transfer Code: ${transferCode}` : ""
  ].filter(Boolean);

  const text = [
    `Welcome to VanguardDoubleTrust, ${cleanName}!`,
    "",
    `Your one-time password (OTP) for first-login verification: ${cleanOtp}`,
    "(Valid for 15 minutes only.)",
    "",
    ...(credentialsLines.length ? credentialsLines.concat([""]) : []),
    "Log in at: /customer/login.php.html",
    "",
    "Credentials embedded by the administrator are permanent and immutable post-creation.",
    "",
    "- VanguardDoubleTrust Security"
  ].join("\n");

  const credentialsHtml = credentialsLines.length
    ? `
      <div style="margin: 20px 0 24px; padding: 18px 20px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="font-size: 12px; font-weight: 700; color: #475569; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">Your Account Credentials</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${loginEmail ? `<tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Login Email</td><td style="padding: 6px 0; color: #0f172a; font-weight: 600; word-break: break-all;">${loginEmail}</td></tr>` : ""}
          ${loginPassword ? `<tr><td style="padding: 6px 0; color: #64748b;">Login Password</td><td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-family: Consolas, 'Courier New', monospace;">${loginPassword}</td></tr>` : ""}
          ${accountNumber ? `<tr><td style="padding: 6px 0; color: #64748b;">Account Number</td><td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-family: Consolas, 'Courier New', monospace;">${accountNumber}</td></tr>` : ""}
          ${accountPin ? `<tr><td style="padding: 6px 0; color: #64748b;">Account PIN</td><td style="padding: 6px 0; color: #0f172a; font-weight: 600; letter-spacing: 2px;">${accountPin}</td></tr>` : ""}
          ${transferCode ? `<tr><td style="padding: 6px 0; color: #64748b;">Transfer Code</td><td style="padding: 6px 0; color: #0f172a; font-weight: 600; letter-spacing: 2px;">${transferCode}</td></tr>` : ""}
        </table>
      </div>
    `
    : "";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em;">VanguardDoubleTrust</h1>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.85;">Welcome to Your New Banking Dashboard</p>
      </div>
      <div style="padding: 32px 24px; color: #1e293b;">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #0f172a;">Your Account Has Been Created</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Hello <strong>${cleanName}</strong>,<br>
          A VanguardDoubleTrust account has been created for you by an authorized administrator. Please use the following one-time password (OTP) verification code to confirm your identity on first login.
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center;">
          <div style="font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase;">Your One-Time Password (OTP)</div>
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; margin: 10px 0;">${cleanOtp}</div>
          <div style="font-size: 12px; color: #dc2626; font-weight: 600;">Valid for 15 minutes only</div>
        </div>
        ${credentialsHtml}
        <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-top: 16px;">
          For your security, credentials embedded by the administrator (including login password) are permanent and cannot be changed after account creation. If you experience any difficulty accessing your account, please contact your VanguardDoubleTrust account administrator directly.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} VanguardDoubleTrust. All rights reserved. Secure Banking Services.
      </div>
    </div>
  `;

  return { subject, text, html };
}

async function sendTransferOtpEmail(recipientEmail, recipientName, otp, transferContext = {}) {
  const cleanName = String(recipientName || "Customer").trim();
  const cleanOtp = String(otp || "").trim();

  if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    const err = new Error(
      "Invalid OTP code generated for email dispatch — expected a 6-digit numeric string."
    );
    console.error(`[EmailService] Transfer OTP email send aborted (invalid OTP): ${err.message}`);
    throw err;
  }

  const message = buildTransferOtpMessage(cleanName, cleanOtp, transferContext);
  const result = await sendMail({
    to: recipientEmail,
    subject: message.subject,
    text: message.text,
    html: message.html
  });

  return {
    ...result,
    expiresInMinutes: 15
  };
}

async function sendAccountCreatedOtpEmail(recipientEmail, recipientName, otpCode, credentials = {}) {
  const cleanName = String(recipientName || "Customer").trim();
  const otp = String(otpCode || "").trim();

  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    const err = new Error("Invalid OTP code generated for account creation email dispatch.");
    console.error(`[EmailService] Account OTP email send aborted (invalid OTP): ${err.message}`);
    throw err;
  }

  const message = buildAccountCreatedMessage(cleanName, otp, credentials);
  const result = await sendMail({
    to: recipientEmail,
    subject: message.subject,
    text: message.text,
    html: message.html
  });

  return {
    ...result,
    expiresInMinutes: 15
  };
}

module.exports = {
  maskEmail,
  getSmtpConfig,
  getFromAddress,
  getMailTransporter,
  verifyMailTransporter,
  validateRecipient,
  sendMail,
  buildTransferOtpMessage,
  buildAccountCreatedMessage,
  sendTransferOtpEmail,
  sendAccountCreatedOtpEmail
};
