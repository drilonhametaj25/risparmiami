import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Cookie Policy — RisparmiaMi",
  description:
    "Informativa sull'utilizzo dei cookie da parte di RisparmiaMi. Scopri quali cookie utilizziamo, perché e come gestirli.",
  alternates: { canonical: "https://risparmiami.pro/cookie" },
};

export default function CookiePage() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="font-heading text-4xl mb-4">Cookie Policy</h1>
          <p className="text-text-muted text-sm mb-8">
            Ultimo aggiornamento: 6 marzo 2026
          </p>

          <p>
            La presente Cookie Policy descrive le tipologie di cookie e
            tecnologie similari utilizzati dal sito web{" "}
            <a href="https://risparmiami.pro">risparmiami.pro</a> (di seguito
            &quot;il Sito&quot;), gestito da RisparmiaMi, P.IVA 07327360488. La
            presente informativa è resa ai sensi dell&apos;art. 13 del
            Regolamento UE 2016/679 (GDPR) e del Provvedimento del Garante
            Privacy dell&apos;8 maggio 2014 in materia di cookie.
          </p>

          <h2>1. Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che vengono memorizzati sul
            dispositivo dell&apos;Utente (computer, smartphone, tablet) quando
            visita un sito web. Sono ampiamente utilizzati per far funzionare
            correttamente i siti web, migliorarne le prestazioni e fornire
            informazioni ai proprietari del sito.
          </p>
          <p>
            I cookie possono essere &quot;di sessione&quot; (cancellati
            automaticamente alla chiusura del browser) oppure
            &quot;persistenti&quot; (rimangono sul dispositivo fino alla scadenza
            prestabilita o alla cancellazione manuale da parte dell&apos;Utente).
            Possono inoltre essere &quot;di prima parte&quot; (impostati dal sito
            visitato) o &quot;di terze parti&quot; (impostati da domini diversi da
            quello del sito visitato).
          </p>

          <h2>2. Cookie tecnici (necessari)</h2>
          <p>
            Questi cookie sono essenziali per il corretto funzionamento del Sito e
            non possono essere disabilitati senza compromettere l&apos;esperienza
            d&apos;uso. Non richiedono il consenso dell&apos;Utente ai sensi della
            normativa vigente.
          </p>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Finalità</th>
                <th>Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>next-auth.session-token</code>
                </td>
                <td>
                  Cookie di sessione di NextAuth.js, necessario per mantenere
                  attiva l&apos;autenticazione dell&apos;Utente dopo il login.
                </td>
                <td>30 giorni</td>
              </tr>
              <tr>
                <td>
                  <code>next-auth.csrf-token</code>
                </td>
                <td>
                  Token CSRF (Cross-Site Request Forgery) utilizzato da NextAuth.js
                  per proteggere i form e le richieste da attacchi informatici.
                </td>
                <td>Sessione</td>
              </tr>
              <tr>
                <td>
                  <code>next-auth.callback-url</code>
                </td>
                <td>
                  Memorizza l&apos;URL di ritorno dopo il processo di
                  autenticazione.
                </td>
                <td>Sessione</td>
              </tr>
            </tbody>
          </table>
          <p>
            <em>Base giuridica:</em> legittimo interesse del titolare (art. 6.1.f
            GDPR) e necessità tecnica. Questi cookie sono strettamente necessari
            per l&apos;erogazione del servizio richiesto dall&apos;Utente.
          </p>

          <h2>3. Cookie analitici (Umami)</h2>
          <p>
            Per comprendere come gli Utenti interagiscono con il Sito e
            migliorare la qualità del Servizio, utilizziamo{" "}
            <strong>Umami Analytics</strong>, una soluzione di web analytics{" "}
            <strong>self-hosted</strong> (ospitata sui nostri server) e{" "}
            <strong>privacy-friendly</strong>.
          </p>
          <p>Caratteristiche di Umami Analytics:</p>
          <ul>
            <li>
              <strong>Nessuna profilazione:</strong> Umami non crea profili
              comportamentali degli Utenti e non traccia la navigazione
              cross-site.
            </li>
            <li>
              <strong>Dati anonimi e aggregati:</strong> i dati raccolti sono
              anonimizzati. Non vengono raccolti indirizzi IP in forma completa,
              né dati personali identificativi.
            </li>
            <li>
              <strong>Self-hosted:</strong> l&apos;istanza di Umami è ospitata
              sulla nostra infrastruttura, senza condivisione di dati con terze
              parti.
            </li>
            <li>
              <strong>Conforme al GDPR:</strong> grazie alla natura anonima e
              aggregata dei dati, Umami non richiede il consenso preventivo
              dell&apos;Utente ai sensi del Provvedimento del Garante Privacy
              dell&apos;8 maggio 2014 e delle Linee Guida sui cookie del 10 giugno
              2021.
            </li>
          </ul>
          <p>
            <em>Dati raccolti:</em> pagine visitate, durata delle visite,
            referrer, tipo di dispositivo e browser (in forma aggregata).
          </p>
          <p>
            <em>Base giuridica:</em> legittimo interesse (art. 6.1.f GDPR),
            trattandosi di cookie analitici con impatto minimo sulla privacy
            dell&apos;Utente.
          </p>

          <h2>4. Cookie di terze parti</h2>
          <p>
            Alcuni servizi integrati nel Sito possono impostare propri cookie sul
            dispositivo dell&apos;Utente:
          </p>

          <h3>Stripe (pagamenti)</h3>
          <p>
            Per l&apos;elaborazione sicura dei pagamenti e la prevenzione delle
            frodi, utilizziamo <strong>Stripe Inc.</strong> come fornitore di
            servizi di pagamento. Stripe può impostare cookie tecnici e di
            sicurezza necessari per il funzionamento del sistema di pagamento.
          </p>
          <ul>
            <li>
              <strong>Finalità:</strong> sicurezza delle transazioni, prevenzione
              frodi, autenticazione 3D Secure.
            </li>
            <li>
              <strong>Tipo:</strong> cookie tecnici e di sicurezza (necessari).
            </li>
            <li>
              Per maggiori informazioni:{" "}
              <a
                href="https://stripe.com/it/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy di Stripe
              </a>
              .
            </li>
          </ul>

          <h3>Google (autenticazione)</h3>
          <p>
            Se l&apos;Utente sceglie di accedere tramite Google OAuth, Google può
            impostare cookie necessari per il processo di autenticazione.
          </p>
          <ul>
            <li>
              <strong>Finalità:</strong> autenticazione sicura dell&apos;Utente.
            </li>
            <li>
              <strong>Tipo:</strong> cookie tecnici (necessari per
              l&apos;autenticazione).
            </li>
            <li>
              Per maggiori informazioni:{" "}
              <a
                href="https://policies.google.com/privacy?hl=it"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy di Google
              </a>
              .
            </li>
          </ul>

          <h2>5. Come gestire i cookie</h2>
          <p>
            L&apos;Utente può controllare e gestire i cookie attraverso le
            impostazioni del proprio browser. Si tenga presente che la
            disabilitazione dei cookie tecnici potrebbe compromettere il
            funzionamento del Sito e impedire l&apos;accesso a determinate
            funzionalità.
          </p>
          <p>
            Ecco come gestire i cookie nei principali browser:
          </p>
          <ul>
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
          <p>
            In alternativa, l&apos;Utente può visitare il sito{" "}
            <a
              href="https://www.youronlinechoices.eu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.youronlinechoices.eu
            </a>{" "}
            per informazioni su come gestire le preferenze sui cookie di
            profilazione.
          </p>

          <h2>6. Aggiornamento della policy</h2>
          <p>
            La presente Cookie Policy può essere aggiornata periodicamente per
            riflettere modifiche ai cookie utilizzati o alla normativa vigente. La
            data di ultimo aggiornamento è indicata in cima a questa pagina.
          </p>
          <p>
            Ti consigliamo di consultare questa pagina regolarmente per rimanere
            informato sull&apos;uso dei cookie. In caso di modifiche sostanziali,
            gli utenti registrati saranno informati via email.
          </p>

          <h2>7. Contatti</h2>
          <p>
            Per qualsiasi domanda, chiarimento o richiesta relativa alla presente
            Cookie Policy o all&apos;utilizzo dei cookie sul Sito, puoi
            contattarci ai seguenti recapiti:
          </p>
          <ul>
            <li>
              <strong>Email privacy:</strong>{" "}
              <a href="mailto:privacy@risparmiami.pro">
                privacy@risparmiami.pro
              </a>
            </li>
            <li>
              <strong>Email supporto:</strong>{" "}
              <a href="mailto:supporto@risparmiami.pro">
                supporto@risparmiami.pro
              </a>
            </li>
          </ul>
          <p>
            Hai inoltre il diritto di presentare reclamo al Garante per la
            protezione dei dati personali:{" "}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.garanteprivacy.it
            </a>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
