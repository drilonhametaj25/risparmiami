function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface TrialEndingEmailProps {
  name?: string;
  totalSavings: number;
  totalActions: number;
  completedActions: number;
}

export function trialEndingEmail({
  name,
  totalSavings,
  totalActions,
  completedActions,
}: TrialEndingEmailProps): string {
  const safeName = name ? escapeHtml(name) : null;
  const greeting = safeName ? `Ciao ${safeName}` : "Ciao";
  const remainingActions = totalActions - completedActions;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; margin: 0;">Risparmi<span style="color: #0066FF;">aMi</span></h1>
  </div>
  <h2 style="font-size: 20px;">${greeting}, il tuo periodo di prova sta per scadere</h2>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Tra pochi giorni perderai l'accesso alle tue opportunit&agrave; di risparmio personalizzate.
  </p>
  <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
    <p style="margin: 0 0 4px; color: #6B6B6B; font-size: 12px; text-transform: uppercase;">Risparmi che perderai</p>
    <p style="font-size: 36px; font-weight: bold; color: #DC2626; margin: 0 0 16px;">&euro;${totalSavings.toLocaleString("it-IT")}</p>
    <div style="display: flex; gap: 16px; justify-content: center;">
      <div>
        <p style="font-size: 20px; font-weight: bold; margin: 0;">${remainingActions}</p>
        <p style="font-size: 12px; color: #6B6B6B; margin: 4px 0 0;">Azioni da completare</p>
      </div>
      <div>
        <p style="font-size: 20px; font-weight: bold; margin: 0;">${completedActions}</p>
        <p style="font-size: 12px; color: #6B6B6B; margin: 4px 0 0;">Gi&agrave; completate</p>
      </div>
    </div>
  </div>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Passa a un piano a pagamento per continuare a scoprire e richiedere tutte le agevolazioni,
    bonus e detrazioni a cui hai diritto.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXTAUTH_URL}/prezzi" style="background-color: #0066FF; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Passa a Premium</a>
  </div>
  <p style="color: #6B6B6B; font-size: 13px; text-align: center; line-height: 1.5;">
    Non perdere i tuoi &euro;${totalSavings.toLocaleString("it-IT")} di risparmi potenziali.<br>
    Agisci ora prima che sia troppo tardi.
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #9B9B9B; font-size: 12px; text-align: center;">
    RisparmiaMi — Scopri quanto stai perdendo ogni anno<br>
    <a href="${process.env.NEXTAUTH_URL}/dashboard/impostazioni" style="color: #9B9B9B;">Gestisci notifiche</a>
  </p>
</body>
</html>`;
}
