function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface NewRulesEmailProps {
  name?: string;
  newRulesCount: number;
  topNewRules: { name: string; category: string; maxAmount: number | null }[];
}

export function newRulesEmail({
  name,
  newRulesCount,
  topNewRules,
}: NewRulesEmailProps): string {
  const safeName = name ? escapeHtml(name) : null;
  const greeting = safeName ? `Ciao ${safeName}` : "Ciao";

  const rulesList = topNewRules
    .map((r) => {
      const safeName = escapeHtml(r.name);
      const safeCategory = escapeHtml(r.category);
      const amountDisplay = r.maxAmount
        ? `<span style="color: #00A86B; font-weight: bold;">fino a &euro;${r.maxAmount.toLocaleString("it-IT")}</span>`
        : `<span style="color: #6B6B6B;">importo variabile</span>`;
      return `
      <div style="background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 16px; margin: 8px 0;">
        <p style="margin: 0 0 4px; color: #6B6B6B; font-size: 11px; text-transform: uppercase;">${safeCategory}</p>
        <p style="margin: 0 0 4px; font-weight: 600; font-size: 15px;">${safeName}</p>
        <p style="margin: 0; font-size: 14px;">${amountDisplay}</p>
      </div>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; margin: 0;">Risparmi<span style="color: #0066FF;">aMi</span></h1>
  </div>
  <h2 style="font-size: 20px;">${greeting}, ci sono ${newRulesCount} nuove opportunit&agrave;!</h2>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Abbiamo aggiunto nuove agevolazioni e bonus al nostro database.
    Ecco le pi&ugrave; rilevanti:
  </p>
  <div style="margin: 24px 0;">
    ${rulesList}
  </div>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Accedi alla dashboard per verificare se queste nuove opportunit&agrave; si applicano al tuo profilo.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXTAUTH_URL}/dashboard/azioni" style="background-color: #0066FF; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">Scopri le nuove opportunit&agrave;</a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #9B9B9B; font-size: 12px; text-align: center;">
    RisparmiaMi — Scopri quanto stai perdendo ogni anno<br>
    <a href="${process.env.NEXTAUTH_URL}/dashboard/impostazioni" style="color: #9B9B9B;">Gestisci notifiche</a>
  </p>
</body>
</html>`;
}
