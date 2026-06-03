import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"Arvis X" <${config.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

export const sendOtpEmail = async (email: string, otp: string): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: 'Your Arvis X Verification Code',
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0a0a0a; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #fff; font-size: 24px; font-weight: 600; margin: 0;">Arvis X</h1>
          <p style="color: #a0a0a0; font-size: 14px; margin: 8px 0 0;">Verification Code</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 32px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 24px;">Use this code to verify your account</p>
          <div style="background: rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; letter-spacing: 12px; font-size: 36px; font-weight: 700; color: #fff; font-family: 'SF Mono', monospace;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px; margin: 24px 0 0;">This code expires in 10 minutes</p>
        </div>
        <p style="color: #555; font-size: 12px; text-align: center; margin-top: 24px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  });
};

export const sendBookingConfirmation = async (
  email: string,
  bookingRef: string,
  details: any,
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: `Booking Confirmed - ${bookingRef}`,
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0a0a0a; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #fff; font-size: 24px; font-weight: 600; margin: 0;">Booking Confirmed ✓</h1>
          <p style="color: #a0a0a0; font-size: 14px; margin: 8px 0 0;">${bookingRef}</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #fff; font-size: 16px; font-weight: 500; margin: 0 0 16px;">${details.serviceName}</p>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <div><p style="color: #a0a0a0; font-size: 12px; margin: 0;">Date</p><p style="color: #fff; font-size: 14px; margin: 4px 0 0;">${details.date}</p></div>
            <div><p style="color: #a0a0a0; font-size: 12px; margin: 0;">Amount</p><p style="color: #fff; font-size: 14px; margin: 4px 0 0;">₹${details.amount}</p></div>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 16px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">Show this QR code at boarding</p>
          </div>
        </div>
      </div>
    `,
  });
};
