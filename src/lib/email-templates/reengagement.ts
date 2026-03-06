function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface ReengagementEmailProps {
  name?: string;
  totalSavings: number;
  pendingActions: number;
}

export function reengagementEmail({
  name,
  totalSavings,
  pendingActions,
}: ReengagementEmailProps): string {
  const safeName = name ? escapeHtml(name) : null;
  const greeting = safeName ? `${safeName}, ci manchi` : "Ci manchi";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; margin: 0;">Risparmi<span style="color: #0066FF;">aMi</span></h1>
  </div>
  <h2 style="font-size: 20px;">${greeting}!</h2>
  <p style="color: #4a4a4a; line-height: 1.6;">
    &Egrave; passato un po' di tempo dall'ultima volta che hai visitato RisparmiaMi.
    Nel frattempo, le tue opportunit&agrave; di risparmio ti stanno ancora aspettando.
  </p>
  <div style="background: #F2F0EC; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
    <p style="color: #6B6B6B; font-size: 14px; margin: 0 0 8px;">Ti aspettano ancora</p>
    <p style="font-size: 36px; font-weight: bold; color: #00A86B; margin: 0 0 8px;">&euro;${totalSavings.toLocaleString("it-IT")}</p>
    <p style="color: #6B6B6B; font-size: 14px; margin: 0;">
      in <strong>${pendingActions}</strong> ${pendingActions === 1 ? "azione" : "azioni"} da completare
    </p>
  </div>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Alcune di queste opportunit&agrave; hanno scadenze precise. Non aspettare troppo
    o potresti perdere centinaia di euro in agevolazioni e bonus.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXTAUTH_URL}/dashboard/azioni" style="background-color: #0066FF; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Recupera i tuoi risparmi</a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #9B9B9B; font-size: 12px; text-align: center;">
    RisparmiaMi — Scopri quanto stai perdendo ogni anno<br>
    <a href="${process.env.NEXTAUTH_URL}/dashboard/impostazioni" style="color: #9B9B9B;">Gestisci notifiche</a>
  </p>
</body>
</html>`;
}
