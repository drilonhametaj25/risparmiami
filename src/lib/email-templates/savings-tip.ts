function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface SavingsTipEmailProps {
  name?: string;
  tipTitle: string;
  tipContent: string;
  ctaText: string;
  ctaUrl: string;
}

export function savingsTipEmail({
  name,
  tipTitle,
  tipContent,
  ctaText,
  ctaUrl,
}: SavingsTipEmailProps): string {
  const safeName = name ? escapeHtml(name) : null;
  const greeting = safeName ? `Ciao ${safeName}` : "Ciao";
  const safeTipTitle = escapeHtml(tipTitle);
  const safeTipContent = escapeHtml(tipContent);
  const safeCtaText = escapeHtml(ctaText);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; margin: 0;">Risparmi<span style="color: #0066FF;">aMi</span></h1>
  </div>
  <h2 style="font-size: 20px;">${greeting}, lo sapevi?</h2>
  <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <p style="margin: 0 0 4px; color: #6B6B6B; font-size: 12px; text-transform: uppercase;">Consiglio di risparmio</p>
    <h3 style="margin: 0 0 12px; color: #1A1A1A; font-size: 18px;">${safeTipTitle}</h3>
    <p style="margin: 0; color: #4a4a4a; line-height: 1.6; font-size: 14px;">${safeTipContent}</p>
  </div>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${ctaUrl}" style="background-color: #0066FF; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">${safeCtaText}</a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #9B9B9B; font-size: 12px; text-align: center;">
    RisparmiaMi — Scopri quanto stai perdendo ogni anno<br>
    <a href="${process.env.NEXTAUTH_URL}/dashboard/impostazioni" style="color: #9B9B9B;">Gestisci notifiche</a>
  </p>
</body>
</html>`;
}
