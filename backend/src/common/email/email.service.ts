import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../logger/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      } : undefined,
    });
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      console.info(`[Email Service] Email sent to: ${to} | Subject: ${subject}`);
      logger.info({ messageId: info.messageId, to, subject }, 'Email sent successfully');
    } catch (error) {
      logger.error({ error, to, subject }, 'Failed to send email');
      // We don't throw here to prevent blocking the main business logic
    }
  }

  // ─── Lifecycle Emails ──────────────────────────────────────────────────────

  async sendTenantCreatedEmail(email: string, tenantName: string) {
    const subject = `Welcome to Madarsa Cloud - ${tenantName}`;
    const html = `
      <h1>Account Created</h1>
      <p>Hello,</p>
      <p>Your institution <strong>${tenantName}</strong> has been registered successfully.</p>
      <p>Our team will review your application shortly. Once approved, you will be able to access the full dashboard.</p>
      <p>Best regards,<br/>The Madarsa Cloud Team</p>
    `;
    this.sendEmail(email, subject, html); // Async fire-and-forget
  }

  async sendTenantApprovedEmail(email: string, tenantName: string) {
    const subject = `Institution Approved - ${tenantName}`;
    const html = `
      <h1>Great News!</h1>
      <p>Your institution <strong>${tenantName}</strong> has been approved by the platform administrator.</p>
      <p>You can now log in and begin using the platform features.</p>
      <p><a href="${env.FRONTEND_URL || 'http://localhost:3000'}/login">Log In Now</a></p>
    `;
    this.sendEmail(email, subject, html);
  }

  async sendOnboardingCompletedEmail(email: string, tenantName: string) {
    const subject = `Configuration Complete - ${tenantName}`;
    const html = `
      <h1>Setup Complete</h1>
      <p>You have successfully completed the institution setup for <strong>${tenantName}</strong>.</p>
      <p>Our administrators will perform a final check to activate all business features.</p>
    `;
    this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();
