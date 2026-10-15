import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
) {
  await transporter.sendMail({
    from: `"DayFlow" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your DayFlow password",
    text: `Reset your DayFlow password using this link:

${resetUrl}

This link will expire in 1 hour.

If you did not request a password reset, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#09090b; padding:40px; color:#ffffff;">
        <div style="max-width:520px; margin:auto; background:#18181b; padding:32px; border-radius:16px;">
          
          <h1 style="margin:0 0 12px; color:#facc15;">
            DayFlow
          </h1>

          <h2 style="margin-bottom:12px;">
            Reset your password
          </h2>

          <p style="color:#a1a1aa; line-height:1.6;">
            We received a request to reset your DayFlow password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              margin:20px 0;
              padding:12px 20px;
              background:#facc15;
              color:#09090b;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            Reset Password
          </a>

          <p style="color:#71717a; font-size:13px; line-height:1.5;">
            This link will expire in 1 hour.
          </p>

          <p style="color:#71717a; font-size:13px;">
            If you did not request this password reset, you can safely ignore
            this email.
          </p>

        </div>
      </div>
    `,
  });
}