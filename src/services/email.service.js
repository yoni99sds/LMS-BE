import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

let transporter;

try {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 2525;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass }
    });
    logger.info('SMTP Mailer initialized successfully.');
  } else {
    logger.warn('SMTP Credentials missing. Mailer will log emails to console instead.');
  }
} catch (error) {
  logger.error('Failed to initialize SMTP transporter: %s', error.message);
}

export const emailService = {
  sendEmail: async ({ to, subject, html, text }) => {
    const from = process.env.SMTP_FROM || 'LMS Platform <noreply@lms-platform.com>';

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from,
          to,
          subject,
          html,
          text
        });
        logger.info(`Email sent successfully: ${info.messageId}`);
        return info;
      } catch (err) {
        logger.error(`Error sending email to ${to}: %s`, err.message);
        throw err;
      }
    } else {
      // Console fallback for local development
      logger.info('==================== OUTGOING EMAIL ====================');
      logger.info(`FROM: ${from}`);
      logger.info(`TO: ${to}`);
      logger.info(`SUBJECT: ${subject}`);
      logger.info(`BODY (HTML):\n${html}`);
      logger.info('========================================================');
      return { messageId: 'mock-id-console' };
    }
  },

  sendOtpEmail: async (email, otp) => {
    const html = `
      <div style="font-family: 'Outfit', 'Inter', sans-serif; padding: 20px; border-radius: 10px; background-color: #f9f9f9; border: 1px solid #eee; max-width: 600px; margin: auto;">
        <h2 style="color: #6366f1; text-align: center;">LMS Secure Verification Code</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Your verification code for Multi-Factor Authentication (MFA) is:</p>
        <div style="background-color: #e0e7ff; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #4338ca; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">LMS Platform Services. All rights reserved.</p>
      </div>
    `;
    const text = `Your LMS verification code is: ${otp}. This code expires in 10 minutes.`;
    return await emailService.sendEmail({ to: email, subject: 'LMS - MFA OTP Verification', html, text });
  },

  sendPasswordResetEmail: async (email, resetUrl) => {
    const html = `
      <div style="font-family: 'Outfit', 'Inter', sans-serif; padding: 20px; border-radius: 10px; background-color: #f9f9f9; border: 1px solid #eee; max-width: 600px; margin: auto;">
        <h2 style="color: #ef4444; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">We received a request to reset your password. Click the button below to secure your account and set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 14px; color: #3b82f6; word-break: break-all;">${resetUrl}</p>
        <p style="font-size: 14px; color: #666;">This link is valid for 10 minutes. If you did not request a password reset, no action is needed.</p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">LMS Platform Services. All rights reserved.</p>
      </div>
    `;
    const text = `You requested a password reset. Reset your password using this link: ${resetUrl}. Link expires in 10 minutes.`;
    return await emailService.sendEmail({ to: email, subject: 'LMS - Password Reset Link', html, text });
  }
};

export default emailService;
