import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Termini di Servizio",
  description: "Termini e condizioni di utilizzo della piattaforma RisparmiaMi.",
  alternates: { canonical: "https://risparmiami.pro/termini" },
};

export default function TerminiPage() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="font-heading text-4xl mb-4">Termini di Servizio</h1>
          <p className="text-text-muted text-sm mb-8">Ultimo aggiornamento: 3 marzo 2026</p>

          <h2>1. Accettazione dei termini</h2>
          <p>
            Utilizzando la piattaforma RisparmiaMi (di seguito &quot;il Servizio&quot;), gestita da
            RisparmiaMi, P.IVA 07327360488, accetti integralmente i presenti Termini di Servizio.
            Se non accetti questi termini, ti invitiamo a non utilizzare il Servizio.
          </p>

          <h2>2. Descrizione del servizio</h2>
          <p>
            RisparmiaMi è una piattaforma informativa che aggrega e organizza informazioni
            pubblicamente disponibili su detrazioni fiscali, bonus, agevolazioni e strategie
            di risparmio in Italia. Il Servizio analizza il profilo dell&apos;utente per
            individuare le opportunità di risparmio potenzialmente applicabili.
          </p>

          <h2>3. Natura informativa del servizio</h2>
          <p>
            <strong>Il Servizio ha natura esclusivamente informativa e divulgativa.</strong> Le
            informazioni fornite non costituiscono consulenza fiscale, finanziaria, legale o
            professionale di alcun tipo. RisparmiaMi non è uno studio commercialista, un CAF,
            né un intermediario finanziario. Prima di intraprendere qualsiasi azione fiscale o
            finanziaria, ti consigliamo di consultare un professionista abilitato.
          </p>

          <h2>4. Account utente</h2>
          <ul>
            <li>Per accedere al Servizio è necessario creare un account fornendo un indirizzo email valido o utilizzando l&apos;autenticazione Google.</li>
            <li>Sei responsabile della riservatezza delle tue credenziali di accesso.</li>
            <li>Devi fornire informazioni veritiere e aggiornate.</li>
            <li>Ogni account è personale e non trasferibile.</li>
          </ul>

          <h2>5. Piani e pagamenti</h2>
          <ul>
            <li><strong>Piano Gratuito:</strong> accesso limitato alle funzionalità base del Servizio.</li>
            <li><strong>Piani a pagamento:</strong> prevedono funzionalità aggiuntive come descritto nella pagina Prezzi. I pagamenti sono elaborati da Stripe Inc.</li>
            <li><strong>Guida PDF:</strong> acquisto una tantum, con download disponibile tramite link dedicato.</li>
            <li>I prezzi sono indicati in Euro (EUR) e IVA inclusa ove applicabile.</li>
            <li>Gli abbonamenti si rinnovano automaticamente salvo disdetta entro la data di rinnovo.</li>
          </ul>

          <h2>6. Diritto di recesso</h2>
          <p>
            Ai sensi dell&apos;art. 52 del Codice del Consumo (D.Lgs. 206/2005), hai diritto
            di recedere dal contratto entro 14 giorni dalla sottoscrizione, senza dover
            fornire alcuna motivazione. Per gli abbonamenti, puoi cancellarli in qualsiasi
            momento dalla dashboard del tuo account. Per la Guida PDF, il diritto di recesso
            si estingue una volta scaricato il contenuto digitale.
          </p>

          <h2>7. Limitazione di responsabilità</h2>
          <ul>
            <li>RisparmiaMi non garantisce l&apos;accuratezza, completezza o attualità delle informazioni fornite.</li>
            <li>Le normative fiscali e i bonus possono variare nel tempo. È responsabilità dell&apos;utente verificare le informazioni con le fonti ufficiali.</li>
            <li>RisparmiaMi non è responsabile per eventuali perdite economiche derivanti dall&apos;utilizzo delle informazioni fornite.</li>
            <li>Il Servizio è fornito &quot;così com&apos;è&quot; (as is) senza garanzie di alcun tipo.</li>
          </ul>

          <h2>8. Proprietà intellettuale</h2>
          <p>
            Tutti i contenuti del Servizio (testi, grafica, loghi, software, database) sono
            di proprietà di RisparmiaMi o dei rispettivi titolari e sono protetti dalle leggi
            sul diritto d&apos;autore. È vietata la riproduzione, distribuzione o modifica dei
            contenuti senza autorizzazione scritta.
          </p>

          <h2>9. Sospensione e cancellazione</h2>
          <p>
            RisparmiaMi si riserva il diritto di sospendere o cancellare l&apos;account di un
            utente in caso di violazione dei presenti termini, utilizzo fraudolento del
            Servizio, o comportamento lesivo nei confronti di altri utenti o del Servizio stesso.
          </p>

          <h2>10. Legge applicabile e foro competente</h2>
          <p>
            I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia
            è competente il Foro del consumatore ai sensi dell&apos;art. 66-bis del Codice del
            Consumo, oppure il Foro di Firenze per le controversie tra professionisti.
          </p>

          <h2>11. Contatti</h2>
          <p>
            Per qualsiasi domanda relativa ai presenti termini, puoi contattarci
            all&apos;indirizzo email: <a href="mailto:info@risparmiami.pro">info@risparmiami.pro</a>.
          </p>
        </div>
      </Container>
    </section>
  );
}
