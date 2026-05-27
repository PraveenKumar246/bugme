import nodemailer from 'nodemailer';

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_PORT === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  // Development fallback: log to console instead of sending
  return null;
}

const transport = createTransport();

async function sendMail({ to, subject, html }) {
  const from = process.env.SMTP_FROM || 'Bugme <noreply@bugme.app>';

  if (!transport) {
    // Dev mode: print the email so you can test the flow without real SMTP
    console.log('\n📧 [DEV EMAIL — not sent, no SMTP configured]');
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:    ${html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()}\n`);
    return;
  }

  await transport.sendMail({ from, to, subject, html });
}

export function sendTeamInviteEmail({ to, inviterName, teamName, acceptUrl }) {
  const subject = `${inviterName} invited you to join ${teamName} on Bugme`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,-apple-system,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#6366f1;padding:32px 36px 28px;">
          <div style="font-size:28px;margin-bottom:8px;">🐛</div>
          <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Bugme</div>
        </div>
        <div style="padding:32px 36px;">
          <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 12px;letter-spacing:-0.3px;">
            You're invited to join a team
          </h2>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 24px;">
            <strong style="color:#111827;">${inviterName}</strong> has invited you to join
            <strong style="color:#111827;">${teamName}</strong> on Bugme — a bug tracking &amp;
            test management platform.
          </p>
          <a href="${acceptUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.01em;">
            Accept Invitation →
          </a>
          <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;line-height:1.5;">
            This invitation expires in 48 hours. If you didn't expect this email, you can safely ignore it.
          </p>
          <p style="font-size:12px;color:#d1d5db;margin:8px 0 0;">
            ${acceptUrl}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({ to, subject, html });
}
