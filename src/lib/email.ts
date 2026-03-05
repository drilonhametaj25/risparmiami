import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      ...(port !== 465 && { requireTLS: true }),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
      tls: { rejectUnauthorized: false },
    });
  }
  return _transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || "RisparmiaMi <info@drilonhametaj.it>",
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
