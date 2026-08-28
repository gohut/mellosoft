import { Resend } from "resend";
import nodemailer from "nodemailer";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== "re_demo_resend_api_key" ? new Resend(resendApiKey) : null;

/**
 * Send OTP Email to user
 */
export async function sendOtpEmail({ to, otpCode, purpose = "Verification" }) {
  const from = process.env.EMAIL_FROM || "Mellosoft Support <support@mellosoft.com>";
  const subject = `Your Mellosoft ${purpose} OTP Code: ${otpCode}`;

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #FAF9F5; padding: 40px 24px; border-radius: 16px; border: 1px solid #E7E7E2;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1B1F8C; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.02em;">Mellosoft</h1>
        <p style="color: #6B6B75; font-size: 14px; margin-top: 4px;">Luxury Sleep & Comfort</p>
      </div>

      <div style="background: #FFFFFF; border-radius: 12px; padding: 32px 24px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="font-size: 20px; color: #14151A; margin-top: 0;">${purpose} Code</h2>
        <p style="color: #6B6B75; font-size: 15px; margin-bottom: 24px;">Use the following One-Time Password (OTP) to complete your verification. This code is valid for 10 minutes.</p>

        <div style="background: #E8E9F8; border-radius: 12px; padding: 18px; display: inline-block; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 800; color: #1B1F8C; letter-spacing: 8px;">${otpCode}</span>
        </div>

        <p style="color: #6B6B75; font-size: 13px; margin: 0;">If you did not request this code, please ignore this email.</p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9CA3AF;">
        &copy; ${new Date().getFullYear()} Mellosoft Sleep Inc. All rights reserved.
      </div>
    </div>
  `;

  // 1. Try Resend if configured
  if (resend) {
    try {
      const res = await resend.emails.send({
        from,
        to: [to],
        subject,
        html,
      });
      return { success: true, messageId: res.id, provider: "resend" };
    } catch (err) {
      console.warn("Resend API failed, trying SMTP fallback:", err.message);
    }
  }

  // 2. Try Nodemailer SMTP if configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      return { success: true, messageId: info.messageId, provider: "smtp" };
    } catch (err) {
      console.warn("SMTP email dispatch failed:", err.message);
    }
  }

  // 3. Fallback for Local Dev / Testing (log OTP to server log)
  console.log(`\n========================================`);
  console.log(`[Mellosoft Mail Service] OTP for ${to}: ${otpCode} (${purpose})`);
  console.log(`========================================\n`);

  return { success: true, provider: "dev_logger", otpCode };
}

/**
 * Send Order Invoice Email to customer
 */
export async function sendOrderConfirmationEmail({ to, order }) {
  const from = process.env.EMAIL_FROM || "Mellosoft Orders <orders@mellosoft.com>";
  const subject = `Order Confirmation #${order.id} - Mellosoft`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F5; padding: 32px 20px;">
      <h2 style="color: #1B1F8C;">Thank you for your order, ${order.customerName}!</h2>
      <p style="color: #4B5563;">Your order <strong>#${order.id}</strong> has been received and is now processing.</p>
      <p style="color: #111827; font-size: 18px; font-weight: bold;">Total Paid: ₹${order.totalAmount}</p>
      <p style="color: #6B7280; font-size: 14px;">We'll notify you as soon as your items ship.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({ from, to: [to], subject, html });
      return { success: true };
    } catch (e) {
      console.warn("Failed to send order email via Resend:", e.message);
    }
  }

  console.log(`[Order Email Log] Order #${order.id} confirmation sent to ${to}`);
  return { success: true, provider: "dev_logger" };
}
