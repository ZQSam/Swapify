import nodemailer from "nodemailer";
import { Resend } from "resend";

const mailMode = (process.env.MAIL_MODE || "smtp").toLowerCase();

const resend =
  mailMode === "resend" && process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

let transporter = null;
if (mailMode === "smtp") {
  const secure =
    String(process.env.SMTP_SECURE).toLowerCase() === "true" ||
    Number(process.env.SMTP_PORT) === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
  });

  transporter
    .verify()
    .then(() => console.log("SMTP verified ✅", process.env.SMTP_HOST, process.env.SMTP_PORT))
    .catch((err) => console.error("SMTP verify FAILED ❌", err));
}

export async function sendEmail({ to, subject, text, html }) {
  if (resend) {
    const from = process.env.RESEND_FROM || "BookSwap <onboarding@resend.dev>";
    const { error } = await resend.emails.send({ from, to, subject, text, html });
    if (error) throw error;
    return;
  }
  if (!transporter) throw new Error("SMTP transporter not configured");
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}
