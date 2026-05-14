const crypto   = require("crypto");
const bcrypt   = require("bcrypt");
const User     = require("../models/User");
const nodemailer = require("nodemailer");

/* ── Email transporter (supports Gmail, Outlook, any SMTP) ── */
const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",   // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/* ══════════════════════════════════════════════════════
   POST /auth/forgot-password
   Body: { email }
   Generates a reset token, stores the HASH in DB,
   emails the RAW token to the user.
══════════════════════════════════════════════════════ */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Always return 200 — never reveal whether email exists (security)
  const successMsg = "If that email is registered you will receive a reset link shortly.";

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.json({ message: successMsg });

  // Generate a raw 32-byte token (sent in email)
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Store only the SHA-256 hash in the DB
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetToken   = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Build reset URL
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl    = `${frontendUrl}/reset-password/${rawToken}`;

  // Send email
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"ShopCart Co." <${process.env.SMTP_USER}>`,
      to:      user.email,
      subject: "Reset your ShopCart password",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
          <div style="text-align:center;margin-bottom:28px;">
            <span style="font-size:40px;">🛍</span>
            <h2 style="margin:12px 0 4px;color:#162231;">Reset your password</h2>
            <p style="color:#6b7280;font-size:14px;">You requested a password reset for your ShopCart account.</p>
          </div>
          <div style="background:#fff;border-radius:10px;padding:28px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <p style="color:#374151;font-size:15px;margin-bottom:24px;">
              Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#162231;color:#fff;text-decoration:none;
                      padding:13px 32px;border-radius:8px;font-weight:600;font-size:15px;">
              Reset Password
            </a>
            <p style="margin-top:20px;font-size:12px;color:#9ca3af;">
              Or copy this link:<br/>
              <span style="word-break:break-all;color:#3b82f6;">${resetUrl}</span>
            </p>
          </div>
          <p style="text-align:center;margin-top:20px;font-size:12px;color:#9ca3af;">
            If you didn't request this, you can safely ignore this email.<br/>
            Your password won't change until you click the link above.
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Roll back token if email fails — user can try again
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.error("[forgot-password] Email send failed:", err.message);
    return res.status(500).json({ message: "Failed to send reset email. Please try again." });
  }

  res.json({ message: successMsg });
};

/* ══════════════════════════════════════════════════════
   POST /auth/reset-password/:token
   Body: { password }
   Hashes the URL token, looks up the hash in DB,
   checks expiry, updates password.
══════════════════════════════════════════════════════ */
const resetPassword = async (req, res) => {
  const { token }    = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  // Hash the incoming token to compare against DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken:   hashedToken,
    passwordResetExpires: { $gt: new Date() },   // not expired
  });

  if (!user) {
    return res.status(400).json({ message: "Reset link is invalid or has expired" });
  }

  // Update password + clear reset fields
  user.password             = await bcrypt.hash(password, 10);
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken         = undefined;   // invalidate existing sessions
  await user.save();

  res.json({ message: "Password reset successfully. You can now log in." });
};

module.exports = { forgotPassword, resetPassword };
