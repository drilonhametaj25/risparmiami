import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa sulla privacy di RisparmiaMi ai sensi del GDPR (Regolamento UE 2016/679).",
  alternates: { canonical: "https://risparmiami.pro/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="font-heading text-4xl mb-4">Privacy Policy</h1>
          <p className="text-text-muted text-sm mb-8">Ultimo aggiornamento: 3 marzo 2026</p>

          <h2>1. Titolare del trattamento</h2>
          <p>
            Il titolare del trattamento dei dati personali è RisparmiaMi, P.IVA 07327360488,
            contattabile all&apos;indirizzo email: <a href="mailto:privacy@risparmiami.pro">privacy@risparmiami.pro</a>.
          </p>

          <h2>2. Dati raccolti</h2>
          <p>Raccogliamo le seguenti categorie di dati personali:</p>
          <ul>
            <li><strong>Dati di identificazione:</strong> nome, cognome, indirizzo email, forniti in fase di registrazione.</li>
            <li><strong>Dati di profilazione finanziaria:</strong> informazioni sulla situazione economica, abitativa e familiare fornite volontariamente durante l&apos;onboarding (reddito indicativo, tipo di contratto, spese bollette, ecc.).</li>
            <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, durata delle sessioni, raccolti tramite cookie tecnici e analitici.</li>
            <li><strong>Dati di pagamento:</strong> elaborati direttamente da Stripe Inc. RisparmiaMi non memorizza dati di carte di credito.</li>
          </ul>

          <h2>3. Finalità del trattamento</h2>
          <p>I dati personali sono trattati per le seguenti finalità:</p>
          <ul>
            <li>Erogazione del servizio: analisi personalizzata delle opportunità di risparmio.</li>
            <li>Gestione dell&apos;account utente e autenticazione.</li>
            <li>Comunicazioni di servizio (email transazionali, report mensili).</li>
            <li>Miglioramento del servizio tramite analisi aggregate e anonimizzate.</li>
            <li>Adempimento di obblighi legali e fiscali.</li>
          </ul>

          <h2>4. Base giuridica</h2>
          <p>
            Il trattamento dei dati si basa su: consenso dell&apos;interessato (art. 6.1.a GDPR),
            esecuzione del contratto (art. 6.1.b GDPR), obblighi legali (art. 6.1.c GDPR)
            e legittimo interesse del titolare (art. 6.1.f GDPR).
          </p>

          <h2>5. Conservazione dei dati</h2>
          <p>
            I dati personali sono conservati per il tempo strettamente necessario alle finalità
            per cui sono stati raccolti. I dati dell&apos;account vengono eliminati entro 30 giorni
            dalla cancellazione dell&apos;account. I dati fiscali sono conservati per 10 anni come
            previsto dalla normativa vigente.
          </p>

          <h2>6. Condivisione dei dati</h2>
          <p>I dati personali possono essere condivisi con:</p>
          <ul>
            <li><strong>Stripe Inc.</strong> — per l&apos;elaborazione dei pagamenti.</li>
            <li><strong>Google LLC</strong> — per l&apos;autenticazione tramite Google OAuth.</li>
            <li><strong>Resend</strong> — per l&apos;invio di email transazionali.</li>
            <li><strong>Vercel Inc.</strong> — per l&apos;hosting della piattaforma.</li>
          </ul>
          <p>
            Tutti i fornitori terzi sono conformi al GDPR o aderiscono al Data Privacy Framework
            UE-USA. Non vendiamo mai i dati personali a terzi.
          </p>

          <h2>7. Diritti dell&apos;interessato</h2>
          <p>Ai sensi degli artt. 15-22 del GDPR, hai diritto a:</p>
          <ul>
            <li>Accedere ai tuoi dati personali.</li>
            <li>Rettificare dati inesatti o incompleti.</li>
            <li>Cancellare i tuoi dati (&quot;diritto all&apos;oblio&quot;).</li>
            <li>Limitare il trattamento.</li>
            <li>Portabilità dei dati.</li>
            <li>Opporti al trattamento.</li>
            <li>Revocare il consenso in qualsiasi momento.</li>
          </ul>
          <p>
            Per esercitare i tuoi diritti, scrivi a{" "}
            <a href="mailto:privacy@risparmiami.pro">privacy@risparmiami.pro</a>.
            Hai inoltre il diritto di presentare reclamo al Garante per la protezione dei
            dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>).
          </p>

          <h2>8. Sicurezza</h2>
          <p>
            Adottiamo misure tecniche e organizzative adeguate a proteggere i dati personali
            da accessi non autorizzati, perdita o distruzione. I dati sono trasmessi tramite
            connessioni cifrate (HTTPS/TLS) e memorizzati su infrastrutture conformi agli
            standard di sicurezza del settore.
          </p>

          <h2>9. Modifiche alla privacy policy</h2>
          <p>
            Ci riserviamo il diritto di modificare questa informativa. Le modifiche saranno
            pubblicate su questa pagina con la data di ultimo aggiornamento. In caso di
            modifiche sostanziali, gli utenti registrati saranno informati via email.
          </p>
        </div>
      </Container>
    </section>
  );
}
