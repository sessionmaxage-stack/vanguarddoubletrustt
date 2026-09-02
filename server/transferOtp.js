const crypto = require("crypto");

const OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_DAILY_REQUESTS = 5; // Max 5 OTP requests per 24-hour window
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function getEncryptionKey() {
  const secret = process.env.OTP_ENCRYPTION_SECRET || process.env.PIN_COOKIE_SECRET || process.env.ADMIN_COOKIE_SECRET || "vanguard_default_otp_secure_key_2026";
  return crypto.createHash("sha256").update(String(secret)).digest();
}

function generate6DigitOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

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

/**
 * Encrypts 6-digit OTP using AES-256-GCM before temporary storage at rest.
 */
function encryptOtpRecord(otp, metadata = {}) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(String(otp), "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  const now = Date.now();
  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    createdAt: now,
    expiresAt: now + OTP_TTL_MS,
    verified: false,
    transferContext: {
      amount: metadata.amount || null,
      currency: metadata.currency || "USD",
      toAccountNumber: metadata.toAccountNumber || null,
      toEmail: metadata.toEmail || null,
      memo: metadata.memo || null
    }
  };
}

/**
 * Two-step validation:
 * 1. Decrypts ciphertext with AES-256-GCM and performs timing-safe exact match check.
 * 2. Checks if the 15-minute expiration window has elapsed.
 */
function decryptAndVerifyOtp(storedRecord, candidateOtp) {
  if (!storedRecord || typeof storedRecord !== "object") {
    return {
      valid: false,
      error: "No active verification code found for this transfer. Please request a new verification code."
    };
  }

  if (storedRecord.verified === true) {
    return {
      valid: false,
      error: "This verification code has already been used. Please request a new code to authorize this transfer."
    };
  }

  const { encryptedData, iv, authTag, expiresAt } = storedRecord;
  if (!encryptedData || !iv || !authTag) {
    return {
      valid: false,
      error: "Invalid or corrupted verification record. Please request a new verification code."
    };
  }

  let decryptedOtp = "";
  try {
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    decryptedOtp = decipher.update(encryptedData, "hex", "utf8");
    decryptedOtp += decipher.final("utf8");
  } catch (err) {
    return {
      valid: false,
      error: "Verification code decryption failed. Please check the code and try again."
    };
  }

  const candidateClean = String(candidateOtp || "").trim();
  if (!candidateClean || candidateClean.length !== 6) {
    return {
      valid: false,
      error: "Please enter a valid 6-digit verification code."
    };
  }

  // Step 1: Exact match comparison
  const bufCandidate = Buffer.from(candidateClean, "utf8");
  const bufDecrypted = Buffer.from(decryptedOtp, "utf8");
  const isMatch = bufCandidate.length === bufDecrypted.length && crypto.timingSafeEqual(bufCandidate, bufDecrypted);

  if (!isMatch) {
    return {
      valid: false,
      error: "Invalid verification code. Please check the 6-digit code sent to your registered email and try again."
    };
  }

  // Step 2: 15-minute expiration verification
  const now = Date.now();
  if (now > Number(expiresAt)) {
    return {
      valid: false,
      error: "Verification code has expired. Codes are strictly valid for 15 minutes. Please request a new code."
    };
  }

  return {
    valid: true,
    message: "Verification code validated successfully."
  };
}

/**
 * Checks 24-hour rate limit for OTP generation requests.
 */
function checkRateLimit(rateLimitData = {}) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const existingRequests = Array.isArray(rateLimitData.requests) ? rateLimitData.requests : [];
  const recentRequests = existingRequests.filter((ts) => typeof ts === "number" && ts > windowStart);

  if (recentRequests.length >= MAX_DAILY_REQUESTS) {
    const oldest = recentRequests[0];
    const resetTimeMs = oldest + RATE_LIMIT_WINDOW_MS - now;
    const resetHours = Math.ceil(resetTimeMs / (60 * 60 * 1000));
    return {
      allowed: false,
      remaining: 0,
      resetHours,
      error: `Daily verification code request limit exceeded. You can request up to ${MAX_DAILY_REQUESTS} codes per 24-hour period. Please try again in ${resetHours} hour(s) or contact support.`
    };
  }

  const updatedRequests = [...recentRequests, now];
  return {
    allowed: true,
    remaining: MAX_DAILY_REQUESTS - updatedRequests.length,
    requests: updatedRequests
  };
}

let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch (nmErr) {
  console.warn(`[Email Service] Nodemailer could not be loaded: ${nmErr && nmErr.message ? nmErr.message : nmErr}`);
}

/**
 * Creates an isolated Nodemailer transport configured exclusively from
 * environment variables. Returns null if Nodemailer is not installed or
 * if insufficient SMTP credentials are provided.
 *
 * This function is intentionally pure / stateless and side-effect free
 * other than logging, keeping the email layer fully decoupled from
 * other project components (OTP encryption, Firestore, HTTP handlers).
 */
function getMailTransporter() {
  if (!nodemailer) {
    console.warn("[Email Service] Nodemailer is not installed; outbound SMTP is disabled.");
    return null;
  }

  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
  const service = process.env.SMTP_SERVICE || process.env.MAIL_SERVICE;

  if (service && user && pass) {
    try {
      return nodemailer.createTransport({
        service,
        auth: { user, pass }
      });
    } catch (createErr) {
      console.error(`[Email Service] Failed to create service-based transport (${service}): ${createErr.message}`);
      return null;
    }
  }

  if (host && user && pass) {
    try {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465 || String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
        auth: { user, pass }
      });
    } catch (createErr) {
      console.error(`[Email Service] Failed to create host-based transport (${host}:${port}): ${createErr.message}`);
      return null;
    }
  }

  console.warn(
    "[Email Service] SMTP credentials are not fully configured in env vars. " +
    "Set either (SMTP_SERVICE + SMTP_USER + SMTP_PASS) or (SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS)."
  );
  return null;
}

/**
 * Validates SMTP connectivity and credentials by running
 * transporter.verify() when the service is first used.
 * Logs (but does not throw) on failure so callers remain isolated.
 */
async function verifyMailTransporter(transporter) {
  if (!transporter || typeof transporter.verify !== "function") return false;
  try {
    await transporter.verify();
    return true;
  } catch (verifyErr) {
    console.error(`[Email Service] SMTP transport verify() failed: ${verifyErr && verifyErr.message ? verifyErr.message : verifyErr}`);
    return false;
  }
}

/**
 * Isolated, pure function to compose transfer OTP emails. Produces
 * { subject, text, html } objects so the composition concern never
 * leaks into send handlers.
 */
function buildTransferOtpMessage(recipientName, otpCode, transferContext = {}) {
  const cleanName = String(recipientName || "Customer").trim();
  const cleanOtp = String(otpCode || "").trim();
  const amountStr = transferContext.amount
    ? `${String(transferContext.currency || "USD").toUpperCase()} ${Number(transferContext.amount).toFixed(2)}`
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

/**
 * Dedicated, isolated email service module — responsible only for email
 * composition and transmission. OTP encryption / Firestore state / HTTP
 * routing live in other modules and never leak into this layer.
 *
 * Dispatches transfer verification OTP email via SMTP to the registered
 * email address. Returns a structured result object.
 *
 * IMPORTANT: `delivered === true` ONLY when the actual SMTP `sendMail`
 * promise resolves successfully. No fallback "pretend it was delivered"
 * behavior — the upstream OTP flow must abort if the email cannot be
 * sent (codes must never be shown on the dashboard).
 */
async function sendTransferOtpEmail(recipientEmail, recipientName, otp, transferContext = {}) {
  const cleanEmail = String(recipientEmail || "").trim().toLowerCase();
  const cleanName = String(recipientName || "Customer").trim();
  const otpCode = String(otp || "").trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    const err = new Error("Recipient email address is invalid or not configured. Cannot dispatch transfer verification email.");
    console.error(`[Email Service] Transfer OTP email send aborted (invalid recipient): ${err.message}`);
    throw err;
  }

  if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
    const err = new Error("Invalid OTP code generated for email dispatch — expected a 6-digit numeric string.");
    console.error(`[Email Service] Transfer OTP email send aborted (invalid OTP): ${err.message}`);
    throw err;
  }

  const masked = maskEmail(cleanEmail);
  const amountStr = transferContext.amount
    ? `${String(transferContext.currency || "USD").toUpperCase()} ${Number(transferContext.amount).toFixed(2)}`
    : "your transfer";

  console.log(
    `[Email Service] Initiating transfer OTP email dispatch for ${cleanName} <${cleanEmail}> (${masked}). Transfer: ${amountStr}.`
  );

  const transporter = getMailTransporter();
  if (!transporter) {
    const err = new Error("Outbound email service is not available. SMTP credentials are not configured. Please contact an administrator.");
    console.error(`[Email Service] Transfer OTP email send FAILED: ${err.message}`);
    throw err;
  }

  const transportReady = await verifyMailTransporter(transporter);
  if (!transportReady) {
    const err = new Error("Outbound email service is not responding. SMTP verification failed — please check your SMTP credentials or try again later.");
    console.error(`[Email Service] Transfer OTP email send FAILED (transport not ready): ${err.message}`);
    throw err;
  }

  const message = buildTransferOtpMessage(cleanName, otpCode, transferContext);
  const fromAddr = process.env.SMTP_FROM || process.env.MAIL_FROM || `"VanguardDoubleTrust Security" <${process.env.SMTP_USER || process.env.MAIL_USER || "security@vanguarddoubletrust.com"}>`;

  try {
    const sent = await transporter.sendMail({
      from: fromAddr,
      to: cleanEmail,
      subject: message.subject,
      text: message.text,
      html: message.html
    });

    const acceptedOk = Array.isArray(sent.accepted) && sent.accepted.includes(cleanEmail);
    if (!acceptedOk) {
      console.warn(`[Email Service] SMTP sendMail resolved but recipient not listed in accepted list. Raw response: ${JSON.stringify({ accepted: sent.accepted, rejected: sent.rejected, response: sent.response })}`);
    }

    console.log(
      `[Email Service] Transfer OTP email successfully transmitted to ${cleanEmail} (${masked}). MessageId: ${sent.messageId || "N/A"}. Accepted: ${acceptedOk}.`
    );

    return {
      delivered: true,
      emailSent: true,
      recipient: cleanEmail,
      maskedEmail: masked,
      expiresInMinutes: 15,
      timestamp: new Date().toISOString(),
      messageId: sent.messageId || null
    };
  } catch (mailErr) {
    console.error(
      `[Email Service] Transfer OTP email send FAILURE for ${cleanEmail} (${masked}). Error: ${mailErr && mailErr.message ? mailErr.message : mailErr}. Stack: ${mailErr && mailErr.stack ? mailErr.stack : "N/A"}`
    );
    throw mailErr;
  }
}

/**
 * Isolated, pure message builder for new-account credential emails.
 */
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
    transferCode ? `Transfer Code: ${transferCode}` : "",
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
    "- VanguardDoubleTrust Security",
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

/**
 * Dedicated handler for account-creation OTP + credential emails.
 * Follows the same strict "actual SMTP success required for delivered=true"
 * contract as transfer OTP emails.
 */
async function sendAccountCreatedOtpEmail(recipientEmail, recipientName, otpCode, credentials = {}) {
  const cleanEmail = String(recipientEmail || "").trim().toLowerCase();
  const cleanName = String(recipientName || "Customer").trim();
  const otp = String(otpCode || "").trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    const err = new Error("Recipient email address is invalid - cannot dispatch account creation email.");
    console.error(`[Email Service] Account OTP email send aborted (invalid recipient): ${err.message}`);
    throw err;
  }
  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    const err = new Error("Invalid OTP code generated for account creation email dispatch.");
    console.error(`[Email Service] Account OTP email send aborted (invalid OTP): ${err.message}`);
    throw err;
  }

  const masked = maskEmail(cleanEmail);
  console.log(
    `[Email Service] Initiating account-creation OTP email dispatch for ${cleanName} <${cleanEmail}> (${masked}). Account: ${String(credentials.accountNumber || "N/A").trim()}.`
  );

  const transporter = getMailTransporter();
  if (!transporter) {
    const err = new Error("Outbound email service is not available. SMTP credentials are not configured.");
    console.error(`[Email Service] Account OTP email send FAILED: ${err.message}`);
    throw err;
  }

  const transportReady = await verifyMailTransporter(transporter);
  if (!transportReady) {
    const err = new Error("Outbound email service is not responding. SMTP verification failed.");
    console.error(`[Email Service] Account OTP email send FAILED (transport not ready): ${err.message}`);
    throw err;
  }

  const message = buildAccountCreatedMessage(cleanName, otp, credentials);
  const fromAddr = process.env.SMTP_FROM || process.env.MAIL_FROM || `"VanguardDoubleTrust Accounts" <${process.env.SMTP_USER || process.env.MAIL_USER || "accounts@vanguarddoubletrust.com"}>`;

  try {
    const sent = await transporter.sendMail({
      from: fromAddr,
      to: cleanEmail,
      subject: message.subject,
      text: message.text,
      html: message.html
    });

    const acceptedOk = Array.isArray(sent.accepted) && sent.accepted.includes(cleanEmail);
    console.log(
      `[Email Service] Account OTP email successfully transmitted to ${cleanEmail} (${masked}). MessageId: ${sent.messageId || "N/A"}. Accepted: ${acceptedOk}.`
    );

    return {
      delivered: true,
      emailSent: true,
      recipient: cleanEmail,
      maskedEmail: masked,
      expiresInMinutes: 15,
      timestamp: new Date().toISOString(),
      messageId: sent.messageId || null
    };
  } catch (mailErr) {
    console.error(
      `[Email Service] Account OTP email send FAILURE for ${cleanEmail} (${masked}). Error: ${mailErr && mailErr.message ? mailErr.message : mailErr}. Stack: ${mailErr && mailErr.stack ? mailErr.stack : "N/A"}`
    );
    throw mailErr;
  }
}

module.exports = {
  OTP_TTL_MS,
  MAX_DAILY_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  generate6DigitOtp,
  maskEmail,
  encryptOtpRecord,
  decryptAndVerifyOtp,
  checkRateLimit,
  getMailTransporter,
  verifyMailTransporter,
  buildTransferOtpMessage,
  buildAccountCreatedMessage,
  sendTransferOtpEmail,
  sendAccountCreatedOtpEmail
};
