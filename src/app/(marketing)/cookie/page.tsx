import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Informativa sull'utilizzo dei cookie da parte di RisparmiaMi.",
  alternates: { canonical: "https://risparmiami.pro/cookie" },
};

export default function CookiePage() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="font-heading text-4xl mb-4">Cookie Policy</h1>
          <p className="text-text-muted text-sm mb-8">Ultimo aggiornamento: 3 marzo 2026</p>

          <h2>1. Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo
            quando visiti un sito web. Sono ampiamente utilizzati per far funzionare i siti
            web, migliorarne l&apos;efficienza e fornire informazioni ai proprietari del sito.
          </p>

          <h2>2. Cookie utilizzati da RisparmiaMi</h2>

          <h3>Cookie tecnici (necessari)</h3>
          <p>
            Questi cookie sono essenziali per il funzionamento del sito e non possono essere
            disabilitati. Includono:
          </p>
          <ul>
            <li><strong>Cookie di sessione:</strong> mantengono attiva la sessione di autenticazione dell&apos;utente.</li>
            <li><strong>Cookie CSRF:</strong> proteggono i form da attacchi di tipo Cross-Site Request Forgery.</li>
            <li><strong>Cookie di preferenze:</strong> memorizzano le impostazioni dell&apos;utente (es. consenso cookie).</li>
          </ul>
          <p><em>Durata:</em> sessione o fino a 30 giorni.</p>
          <p><em>Base giuridica:</em> legittimo interesse (art. 6.1.f GDPR).</p>

          <h3>Cookie analitici</h3>
          <p>
            Utilizziamo cookie analitici per comprendere come gli utenti interagiscono con
            il sito, raccogliendo dati in forma aggregata e anonima. Questi ci aiutano a
            migliorare il Servizio.
          </p>
          <p><em>Durata:</em> fino a 12 mesi.</p>
          <p><em>Base giuridica:</em> consenso dell&apos;interessato (art. 6.1.a GDPR).</p>

          <h3>Cookie di terze parti</h3>
          <p>Alcuni servizi di terze parti possono impostare i propri cookie:</p>
          <ul>
            <li><strong>Stripe:</strong> per la sicurezza dei pagamenti e la prevenzione delle frodi.</li>
            <li><strong>Google:</strong> per l&apos;autenticazione tramite Google OAuth.</li>
          </ul>

          <h2>3. Come gestire i cookie</h2>
          <p>
            Puoi controllare e gestire i cookie attraverso le impostazioni del tuo browser.
            Tieni presente che disabilitare i cookie tecnici potrebbe compromettere il
            funzionamento del sito. Ecco come gestire i cookie nei principali browser:
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
            <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>

          <h2>4. Aggiornamenti</h2>
          <p>
            Questa Cookie Policy può essere aggiornata periodicamente. La data di ultimo
            aggiornamento è indicata in alto. Ti consigliamo di consultare questa pagina
            regolarmente.
          </p>

          <h2>5. Contatti</h2>
          <p>
            Per domande sulla nostra Cookie Policy, contattaci
            all&apos;indirizzo: <a href="mailto:privacy@risparmiami.pro">privacy@risparmiami.pro</a>.
          </p>
        </div>
      </Container>
    </section>
  );
}
