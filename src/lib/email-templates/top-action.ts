function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface TopActionEmailProps {
  name?: string;
  actionName: string;
  actionCategory: string;
  estimatedSaving: number;
  totalSavings: number;
  totalActions: number;
}

export function topActionEmail({
  name,
  actionName,
  actionCategory,
  estimatedSaving,
  totalSavings,
  totalActions,
}: TopActionEmailProps): string {
  const safeName = name ? escapeHtml(name) : null;
  const greeting = safeName ? `Ciao ${safeName}` : "Ciao";
  const safeActionName = escapeHtml(actionName);
  const safeCategory = escapeHtml(actionCategory);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; margin: 0;">Risparmi<span style="color: #0066FF;">aMi</span></h1>
  </div>
  <h2 style="font-size: 20px;">${greeting},</h2>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Abbiamo analizzato il tuo profilo e trovato <strong>${totalActions} opportunit&agrave;</strong> di risparmio
    per un totale di <strong style="color: #00A86B;">&euro;${totalSavings.toLocaleString("it-IT")}</strong>.
  </p>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Ecco la tua opportunit&agrave; numero 1:
  </p>
  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <p style="margin: 0 0 4px; color: #6B6B6B; font-size: 12px; text-transform: uppercase;">${safeCategory}</p>
    <h3 style="margin: 0 0 8px; color: #1A1A1A; font-size: 18px;">${safeActionName}</h3>
    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #00A86B;">+&euro;${estimatedSaving.toLocaleString("it-IT")}</p>
  </div>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Accedi alla tua dashboard per scoprire come richiederla e le altre ${totalActions - 1} opportunit&agrave;.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXTAUTH_URL}/dashboard/azioni" style="background-color: #0066FF; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">Vai alla dashboard</a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #9B9B9B; font-size: 12px; text-align: center;">
    RisparmiaMi — Scopri quanto stai perdendo ogni anno<br>
    <a href="${process.env.NEXTAUTH_URL}/dashboard/impostazioni" style="color: #9B9B9B;">Gestisci notifiche</a>
  </p>
</body>
</html>`;
}
