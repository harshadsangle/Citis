import { emailFrom, transporter } from '../config/email';

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const clientBase = () =>
  (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();

const send = async (to: string, subject: string, html: string) => {
  if (!to) {
    console.warn(`[email] skipped "${subject}" — no recipient configured`);
    return { messageId: 'skipped' };
  }
  const info = await transporter.sendMail({ from: emailFrom, to, subject, html });
  if (!process.env.SMTP_HOST) {
    console.info(`[email] ${subject} → ${to}`);
    console.info(JSON.stringify(info, null, 2));
  }
  return info;
};

export const sendContactNotification = (contact: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) =>
  send(
    process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@localhost',
    `New contact: ${contact.subject}`,
    `<h2>New contact request</h2><p><b>Name:</b> ${escapeHtml(contact.name)}</p>
   <p><b>Email:</b> ${escapeHtml(contact.email)}</p><p><b>Phone:</b> ${escapeHtml(contact.phone)}</p>
   <p><b>Message:</b></p><p>${escapeHtml(contact.message).replace(/\n/g, '<br>')}</p>`,
  );

export const sendCareerApplication = (
  application: {
    name: string;
    email: string;
    phone?: string;
    resume: string;
    coverLetter?: string;
  },
  careerTitle: string,
) =>
  send(
    process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@localhost',
    `New application: ${careerTitle}`,
    `<h2>${escapeHtml(careerTitle)}</h2><p><b>Applicant:</b> ${escapeHtml(application.name)}</p>
   <p><b>Email:</b> ${escapeHtml(application.email)}</p><p><b>Phone:</b> ${escapeHtml(application.phone)}</p>
   <p><a href="${escapeHtml(application.resume)}">View resume</a></p>
   <p>${escapeHtml(application.coverLetter).replace(/\n/g, '<br>')}</p>`,
  );

export const sendPasswordReset = (email: string, token: string) => {
  const url = `${clientBase()}/auth/reset-password?token=${encodeURIComponent(token)}`;
  return send(
    email,
    'Reset your password',
    `<p>This link expires in one hour.</p><p><a href="${url}">Reset password</a></p>`,
  );
};

export const sendVerification = (email: string, token: string) => {
  const url = `${clientBase()}/auth/verify-email?token=${encodeURIComponent(token)}`;
  return send(
    email,
    'Verify your email',
    `<p><a href="${url}">Verify email address</a></p>`,
  );
};

export const sendWelcome = (email: string, name: string) =>
  send(
    email,
    'Welcome to CITIS InfoTech',
    `<p>Welcome, ${escapeHtml(name)}. Your email has been verified.</p>`,
  );
