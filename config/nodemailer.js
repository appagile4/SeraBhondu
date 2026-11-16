import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "appagile4@gmail.com",
    pass: (process.env.EMAIL_PASS || "").replace(/\s+/g, ""),
  },
});

/**
 * Send 6-digit OTP verification email with a 1-minute expiration notice
 */
export const sendOtpEmail = async (email, otp, name = "User") => {
  const mailOptions = {
    from: `"Serabondhu" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Serabondhu Verification Code: ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #013819 0%, #014923 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
            Sera<span style="color: #E30613;">bondhu</span><span style="font-size: 14px; font-weight: 400; opacity: 0.85;">.net</span>
          </h1>
          <p style="margin: 6px 0 0; font-size: 12px; color: #e8f5e9; font-weight: 500;">
            Bangladesh's Trusted Online Marketplace • সেরাবন্ধু — কিনুন • বিক্রি করুন • খুঁজুন
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px; text-align: center;">
          <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">
            Verify Your Email Address
          </h2>
          <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
            Welcome <strong>${name}</strong>! Use the One-Time Password (OTP) below to complete your authentication on Serabondhu.
          </p>

          <!-- OTP Code Display Box -->
          <div style="background: #f8fafc; border: 2px dashed #014923; border-radius: 12px; padding: 20px; margin: 0 auto 24px; max-width: 320px;">
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #014923; font-family: monospace;">
              ${otp}
            </div>
            <div style="margin-top: 8px; font-size: 12px; font-weight: 700; color: #dc2626;">
              ⏱ Expires in exactly 1 minute (60 seconds)
            </div>
          </div>

          <p style="margin: 0 0 12px; color: #64748b; font-size: 13px;">
            If this code expires, you can click <strong>"Resend OTP"</strong> in the app to receive a fresh verification code.
          </p>
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            If you did not request this code, please disregard this email. Never share your OTP with anyone.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
          © ${new Date().getFullYear()} Serabondhu. Dhaka, Bangladesh.<br />
          Need assistance? Contact our team at <a href="mailto:support@serabondhu.net" style="color: #014923; text-decoration: none; font-weight: 600;">support@serabondhu.net</a>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export default transporter;
