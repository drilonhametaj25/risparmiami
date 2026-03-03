interface MonthlyReportData {
  name?: string;
  totalSavings: number;
  newRules: number;
  completedActions: number;
  pendingActions: number;
  upcomingDeadlines: { name: string; date: string }[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function monthlyReportEmail(data: MonthlyReportData): string {
  const safeName = data.name ? escapeHtml(data.name) : null;
  const greeting = safeName ? `Ciao ${safeName}` : "Ciao";
  const deadlinesList = data.upcomingDeadlines.length > 0
    ? data.upcomingDeadlines.map(d => `<li>${escapeHtml(d.name)} — scadenza ${escapeHtml(d.date)}</li>`).join("")
    : "<li>Nessuna scadenza imminente</li>";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; margin: 0;">Risparmi<span style="color: #0066FF;">aMi</span></h1>
  </div>
  <h2 style="font-size: 20px;">${greeting}, ecco il tuo riepilogo mensile</h2>

  <div style="background: #F2F0EC; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
    <p style="color: #6B6B6B; font-size: 14px; margin: 0 0 8px;">Risparmio potenziale totale</p>
    <p style="font-size: 36px; font-weight: bold; color: #00A86B; margin: 0;">€${data.totalSavings.toLocaleString("it-IT")}</p>
  </div>

  <div style="display: flex; gap: 16px; margin: 24px 0;">
    <div style="flex: 1; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 16px; text-align: center;">
      <p style="font-size: 24px; font-weight: bold; margin: 0;">${data.completedActions}</p>
      <p style="font-size: 12px; color: #6B6B6B; margin: 4px 0 0;">Azioni completate</p>
    </div>
    <div style="flex: 1; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 16px; text-align: center;">
      <p style="font-size: 24px; font-weight: bold; margin: 0;">${data.pendingActions}</p>
      <p style="font-size: 12px; color: #6B6B6B; margin: 4px 0 0;">Da completare</p>
    </div>
    <div style="flex: 1; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 16px; text-align: center;">
      <p style="font-size: 24px; font-weight: bold; margin: 0;">${data.newRules}</p>
      <p style="font-size: 12px; color: #6B6B6B; margin: 4px 0 0;">Nuove regole</p>
    </div>
  </div>

  <h3 style="font-size: 16px;">Prossime scadenze</h3>
  <ul style="line-height: 1.8;">${deadlinesList}</ul>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background-color: #0066FF; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">Vai alla dashboard</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #9B9B9B; font-size: 12px; text-align: center;">
    RisparmiaMi — Scopri quanto stai perdendo ogni anno<br>
    <a href="${process.env.NEXTAUTH_URL}/dashboard/impostazioni" style="color: #9B9B9B;">Gestisci notifiche</a>
  </p>
</body>
</html>`;
}
