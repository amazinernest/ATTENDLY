import nodemailer, { type Transporter } from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || "ClassMark <noreply@omnicbt.online>";
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  (process.env.NODE_ENV === "production" ? "https://classmarker.online" : "http://localhost:3000");

let transporter: Transporter | null = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; simulated?: boolean; messageId?: string }> {
  // 1. Resend REST API (Zero-port restriction, fast delivery)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      let from = process.env.EMAIL_FROM || "ClassMark <noreply@omnicbt.online>";
      // onboarding@resend.dev blocks sending to external recipients on Resend.
      // If onboarding@resend.dev is configured, automatically fall back to the account's verified domain:
      if (from.includes("onboarding@resend.dev")) {
        from = "ClassMark <noreply@omnicbt.online>";
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        console.error("[Resend API Delivery Error]:", errorData);
        throw new Error(`Resend email delivery failed: ${errorData.message || response.statusText}`);
      }

      const data = (await response.json().catch(() => ({}))) as any;
      return { success: true, simulated: false, messageId: data.id };
    } catch (error) {
      console.error("[Email Delivery Error via Resend]:", error);
      throw error;
    }
  }

  // 2. Standard SMTP via Nodemailer
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        text,
        html,
      });
      return { success: true, simulated: false, messageId: info.messageId };
    } catch (error) {
      console.error("[Email Delivery Error via SMTP]:", error);
      throw new Error("Failed to deliver email through SMTP server.");
    }
  }

  // 3. Fallback: Simulated console dispatch in development
  console.log(`\n========================================================`);
  console.log(`[CLASSMARK LOCAL EMAIL DISPATCH] (SMTP/Resend not configured)`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message Body:\n${text}`);
  console.log(`========================================================\n`);
  return { success: true, simulated: true };
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;
  const subject = "Verify your ClassMark Lecturer Account";
  const text = `Welcome to ClassMark.\n\nPlease verify your institutional email address by opening the following link:\n${verifyUrl}\n\nThis verification link expires in 24 hours.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0369a1; margin-top: 0;">ClassMark Verification</h2>
      <p>Welcome to ClassMark, your university attendance management platform.</p>
      <p>Please click the button below to verify your email address and activate your account:</p>
      <div style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background-color: #0369a1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser:</p>
      <p style="color: #0369a1; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">This link will expire in 24 hours. If you did not create a ClassMark account, you can safely ignore this email.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, text, html });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  const subject = "Reset your ClassMark Password";
  const text = `You requested a password reset for your ClassMark account.\n\nPlease use the following link to set a new password:\n${resetUrl}\n\nThis link is single-use and expires in 1 hour.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0369a1; margin-top: 0;">Password Reset Request</h2>
      <p>We received a request to reset the password for your ClassMark lecturer account.</p>
      <div style="margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #0369a1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Or paste this link into your browser:</p>
      <p style="color: #0369a1; font-size: 14px; word-break: break-all;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">This link is valid for 1 hour. If you did not request a password reset, no action is needed.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, text, html });
}

export async function sendStudentOtpEmail(email: string, otpCode: string, courseCode: string): Promise<void> {
  const subject = `[ClassMark] Check-in Verification Code for ${courseCode}`;
  const text = `Your attendance check-in verification code for ${courseCode} is: ${otpCode}\n\nThis one-time passcode is valid for 10 minutes. Do not share this code with anyone.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h3 style="color: #0369a1; margin-top: 0;">Attendance Check-In Code</h3>
      <p>You are verifying your presence in <strong>${courseCode}</strong>.</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #0f172a; font-family: monospace;">${otpCode}</span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This single-use code is valid for 10 minutes. Enter it on the attendance page to confirm your check-in.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, text, html });
}
