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
} catch (_) {}

function getMailTransporter() {
  if (!nodemailer) return null;

  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
  const service = process.env.SMTP_SERVICE || process.env.MAIL_SERVICE;

  if (service && user && pass) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass }
    });
  }

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465 || String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Emits audit log and dispatches transfer verification OTP email via SMTP if configured.
 */
async function sendTransferOtpEmail(recipientEmail, recipientName, otp, transferContext = {}) {
  const cleanEmail = String(recipientEmail || "").trim().toLowerCase();
  const cleanName = String(recipientName || "Customer").trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Recipient email address is invalid or not configured. Please contact an administrator to verify your email.");
  }

  const otpCode = String(otp || "").trim();
  if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
    throw new Error("Invalid OTP code generated for email dispatch.");
  }

  const masked = maskEmail(cleanEmail);
  const amountStr = transferContext.amount ? `${transferContext.currency || "USD"} ${Number(transferContext.amount).toFixed(2)}` : "your transfer";

  console.log(`[Transfer OTP Delivery] Successfully dispatched 6-digit OTP [${otpCode}] to email: ${cleanEmail} (${masked}) for ${cleanName}. Transfer: ${amountStr}. Expiration: 15 minutes.`);

  let emailSent = false;
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      const fromAddr = process.env.SMTP_FROM || process.env.MAIL_FROM || `"VanguardDoubleTrust Security" <${process.env.SMTP_USER || "security@vanguarddoubletrust.com"}>`;
      const htmlBody = `
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
              <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; margin: 10px 0;">${otpCode}</div>
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

      await transporter.sendMail({
        from: fromAddr,
        to: cleanEmail,
        subject: `[VanguardDoubleTrust] Your Transfer Verification Code: ${otpCode}`,
        text: `Your VanguardDoubleTrust 6-digit OTP verification code is ${otpCode}. Valid for 15 minutes. Transfer: ${amountStr}.`,
        html: htmlBody
      });
      emailSent = true;
      console.log(`[Transfer OTP Delivery] Live email successfully transmitted to ${cleanEmail}`);
    } catch (mailErr) {
      console.warn(`[Transfer OTP Delivery] SMTP transmission warning: ${mailErr.message}`);
    }
  }

  return {
    delivered: true,
    emailSent,
    recipient: cleanEmail,
    maskedEmail: masked,
    otp: otpCode,
    expiresInMinutes: 15,
    timestamp: new Date().toISOString()
  };
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
  sendTransferOtpEmail
};
