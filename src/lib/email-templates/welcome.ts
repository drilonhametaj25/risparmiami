function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function welcomeEmail(name?: string): string {
  const safeName = name ? escapeHtml(name) : null;
  const greeting = safeName ? `Ciao ${safeName}` : "Ciao";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; margin: 0;">Risparmi<span style="color: #0066FF;">aMi</span></h1>
  </div>
  <h2 style="font-size: 20px;">${greeting}, benvenuto su RisparmiaMi!</h2>
  <p>Grazie per esserti registrato. Ecco cosa puoi fare adesso:</p>
  <ol style="line-height: 1.8;">
    <li><strong>Completa il tuo profilo</strong> — Rispondi a poche domande sulla tua situazione finanziaria</li>
    <li><strong>Scopri i tuoi risparmi</strong> — Il nostro sistema analizza oltre 100 regole per trovare le opportunità che ti riguardano</li>
    <li><strong>Agisci</strong> — Segui le guide passo-passo per recuperare i tuoi soldi</li>
  </ol>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXTAUTH_URL}/onboarding/personale" style="background-color: #0066FF; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">Completa il profilo</a>
  </div>
  <p style="color: #6B6B6B; font-size: 14px;">Se hai domande, rispondi a questa email. Siamo qui per aiutarti.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #9B9B9B; font-size: 12px; text-align: center;">RisparmiaMi — Scopri quanto stai perdendo ogni anno</p>
</body>
</html>`;
}
