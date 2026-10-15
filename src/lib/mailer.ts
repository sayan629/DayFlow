
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sender = `"DayFlow" <${process.env.SMTP_USER}>`;

function emailLayout({
  title,
  message,
  buttonText,
  buttonUrl,
  expiryText,
  footerText,
}: {
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  expiryText: string;
  footerText: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background:#09090b;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
        <div style="padding:40px 16px;">
          <div style="max-width:520px;margin:0 auto;background:#18181b;padding:32px;border:1px solid #27272a;border-radius:16px;">

            <h1 style="margin:0 0 24px;color:#facc15;font-size:30px;">
              DayFlow
            </h1>

            <h2 style="margin:0 0 16px;color:#ffffff;font-size:24px;">
              ${title}
            </h2>

            <p style="color:#a1a1aa;line-height:1.7;font-size:15px;">
              ${message}
            </p>

            <a
              href="${buttonUrl}"
              style="display:inline-block;margin:20px 0;padding:13px 22px;background:#facc15;color:#09090b;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;"
            >
              ${buttonText}
            </a>

            <p style="color:#a1a1aa;font-size:13px;line-height:1.6;">
              ${expiryText}
            </p>

            <p style="color:#71717a;font-size:13px;line-height:1.6;">
              ${footerText}
            </p>

            <div style="margin-top:28px;padding-top:20px;border-top:1px solid #27272a;">
              <p style="margin:0;color:#52525b;font-size:12px;">
                Sent by DayFlow. Plan your day, one task at a time.
              </p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
) {
  await transporter.sendMail({
    from: sender,
    to,
    subject: "Reset your DayFlow password",

    text: `Reset your DayFlow password using this link:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.`,

    html: emailLayout({
      title: "Reset your password",
      message:
        "We received a request to reset your DayFlow password. Click the button below to choose a new password.",
      buttonText: "Reset Password",
      buttonUrl: resetUrl,
      expiryText: "This link will expire in 15 minutes.",
      footerText:
        "If you did not request a password reset, you can safely ignore this email.",
    }),
  });
}

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string
) {
  await transporter.sendMail({
    from: sender,
    to,
    subject: "Verify your DayFlow email address",

    text: `Welcome to DayFlow!

Please verify your email address by opening this link:

${verificationUrl}

This verification link will expire in 24 hours.

If you did not create a DayFlow account, you can safely ignore this email.`,

    html: emailLayout({
      title: "Verify your email",
      message:
        "Welcome to DayFlow! You're one step away from getting started. Confirm that this email address belongs to you by clicking the button below.",
      buttonText: "Verify Email Address",
      buttonUrl: verificationUrl,
      expiryText:
        "For your security, this verification link will expire in 24 hours.",
      footerText:
        "If you did not create a DayFlow account, you can safely ignore this email.",
    }),
  });
}
