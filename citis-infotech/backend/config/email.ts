import nodemailer from 'nodemailer';

const port = Number(process.env.SMTP_PORT || 587);

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: process.env.SMTP_SECURE === 'true' || port === 465,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export const emailFrom = process.env.EMAIL_FROM || 'CITIS InfoTech <noreply@citisinfotech.com>';
