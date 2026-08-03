import nodemailer from 'nodemailer';

/**
 * Local-first mail transport.
 * - If SMTP_HOST is set, use your free local SMTP (Mailpit/MailHog) or any SMTP you already run.
 * - Otherwise use JSON transport and log messages to the console (no external service).
 */
const createTransport = () => {
  if (!process.env.SMTP_HOST) {
    console.info('[email] SMTP_HOST not set — using console/json transport (no external email service)');
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const port = Number(process.env.SMTP_PORT || 1025);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
};

export const transporter = createTransport();

export const emailFrom =
  process.env.EMAIL_FROM || 'CITIS InfoTech <noreply@localhost>';
