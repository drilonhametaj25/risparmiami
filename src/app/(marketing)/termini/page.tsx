import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Termini di Servizio — RisparmiaMi",
  description:
    "Termini e condizioni di utilizzo della piattaforma RisparmiaMi. Leggi le condizioni relative ad account, abbonamenti, pagamenti e limitazioni di responsabilità.",
  alternates: { canonical: "https://risparmiami.pro/termini" },
};

export default function TerminiPage() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="font-heading text-4xl mb-4">Termini di Servizio</h1>
          <p className="text-text-muted text-sm mb-8">
            Ultimo aggiornamento: 6 marzo 2026
          </p>

          <h2>1. Definizioni</h2>
          <p>Ai fini dei presenti Termini di Servizio si intende per:</p>
          <ul>
            <li>
              <strong>&quot;RisparmiaMi&quot;</strong> (di seguito anche
              &quot;la Piattaforma&quot; o &quot;Noi&quot;): il servizio online
              gestito da RisparmiaMi, P.IVA 07327360488, con sede operativa a
              Firenze, Italia, raggiungibile all&apos;indirizzo{" "}
              <a href="https://risparmiami.pro">risparmiami.pro</a>.
            </li>
            <li>
              <strong>&quot;Utente&quot;</strong> (di seguito anche &quot;Tu&quot;
              o &quot;l&apos;Utente&quot;): qualsiasi persona fisica che accede
              alla Piattaforma, registra un account o utilizza i Servizi offerti,
              sia in modalità gratuita che a pagamento.
            </li>
            <li>
              <strong>&quot;Servizio&quot;</strong> o{" "}
              <strong>&quot;Servizi&quot;</strong>: l&apos;insieme delle
              funzionalità offerte dalla Piattaforma, incluse l&apos;analisi
              personalizzata del risparmio, il confronto di opportunità fiscali e
              agevolative, la generazione di report, la Guida PDF e ogni altro
              strumento messo a disposizione dell&apos;Utente.
            </li>
          </ul>

          <h2>2. Oggetto del servizio</h2>
          <p>
            RisparmiaMi è una piattaforma informativa dedicata all&apos;analisi
            del risparmio personale e familiare in Italia. Il Servizio consente
            all&apos;Utente di:
          </p>
          <ul>
            <li>
              Compilare un profilo personale con informazioni sulla propria
              situazione economica, familiare e abitativa.
            </li>
            <li>
              Ricevere un&apos;analisi personalizzata delle opportunità di
              risparmio potenzialmente applicabili (detrazioni fiscali, bonus
              statali, agevolazioni regionali, strategie per ridurre le spese
              ricorrenti).
            </li>
            <li>
              Confrontare diverse opportunità di risparmio e monitorarne
              l&apos;evoluzione nel tempo.
            </li>
            <li>
              Accedere a contenuti informativi, guide e strumenti di calcolo.
            </li>
          </ul>
          <p>
            Il Servizio ha natura esclusivamente informativa e divulgativa e non
            sostituisce in alcun modo la consulenza professionale di un
            commercialista, consulente fiscale o finanziario abilitato.
          </p>

          <h2>3. Registrazione e account</h2>
          <p>
            Per accedere alle funzionalità del Servizio è necessario creare un
            account. La registrazione è consentita alle persone fisiche che
            abbiano compiuto 18 anni di età.
          </p>
          <ul>
            <li>
              La registrazione avviene tramite indirizzo email e password, oppure
              tramite autenticazione con account Google (Google OAuth).
            </li>
            <li>
              L&apos;Utente è tenuto a fornire informazioni veritiere, accurate e
              aggiornate al momento della registrazione e durante l&apos;utilizzo
              del Servizio.
            </li>
            <li>
              L&apos;Utente è l&apos;unico responsabile della riservatezza delle
              proprie credenziali di accesso (email e password) e di tutte le
              attività svolte tramite il proprio account.
            </li>
            <li>
              Ogni account è strettamente personale e non trasferibile a terzi.
            </li>
            <li>
              In caso di accesso non autorizzato o sospetto uso improprio
              dell&apos;account, l&apos;Utente è tenuto a informare
              tempestivamente RisparmiaMi all&apos;indirizzo{" "}
              <a href="mailto:supporto@risparmiami.pro">
                supporto@risparmiami.pro
              </a>
              .
            </li>
          </ul>
          <p>
            RisparmiaMi si riserva il diritto di sospendere o cancellare account
            in caso di violazione dei presenti Termini, comportamenti fraudolenti
            o utilizzo improprio del Servizio.
          </p>

          <h2>4. Piani e abbonamenti</h2>
          <p>Il Servizio è disponibile nei seguenti piani:</p>
          <ul>
            <li>
              <strong>Piano Gratuito (Free):</strong> accesso limitato alle
              funzionalità base della Piattaforma, inclusa un&apos;analisi
              iniziale semplificata del profilo di risparmio.
            </li>
            <li>
              <strong>Piano Personale:</strong> al costo di{" "}
              <strong>&euro;4,99/mese</strong>, include l&apos;accesso completo a
              tutte le funzionalità di analisi, report personalizzati, notifiche
              su nuove opportunità e storico delle analisi.
            </li>
            <li>
              <strong>Piano Azienda:</strong> al costo di{" "}
              <strong>&euro;29/mese</strong>, pensato per professionisti e piccole
              imprese, include tutte le funzionalità del Piano Personale con in
              più la gestione di profili multipli, report aggregati e supporto
              prioritario.
            </li>
          </ul>
          <p>
            Tutti i piani a pagamento prevedono un{" "}
            <strong>periodo di prova gratuito di 7 giorni</strong>. Al termine del
            periodo di prova, l&apos;abbonamento si attiverà automaticamente salvo
            disdetta effettuata dall&apos;Utente prima della scadenza dei 7
            giorni. I prezzi sono indicati in Euro (EUR) e si intendono IVA
            inclusa ove applicabile.
          </p>

          <h2>5. Pagamenti e fatturazione</h2>
          <p>
            I pagamenti sono elaborati in modo sicuro tramite{" "}
            <strong>Stripe Inc.</strong>, fornitore certificato di servizi di
            pagamento. RisparmiaMi non memorizza in alcun modo i dati delle carte
            di credito o debito dell&apos;Utente.
          </p>
          <ul>
            <li>
              <strong>Rinnovo automatico:</strong> gli abbonamenti si rinnovano
              automaticamente alla scadenza del periodo di fatturazione (mensile).
              L&apos;Utente riceverà una notifica via email in prossimità di ogni
              rinnovo.
            </li>
            <li>
              <strong>Cancellazione:</strong> l&apos;Utente può cancellare il
              proprio abbonamento in qualsiasi momento dalla sezione
              &quot;Impostazioni&quot; del proprio account. La cancellazione avrà
              effetto alla fine del periodo di fatturazione corrente e
              l&apos;Utente manterrà l&apos;accesso alle funzionalità premium fino
              a tale data. Non sono previsti rimborsi per periodi parziali.
            </li>
            <li>
              <strong>Fatturazione:</strong> per ogni pagamento verrà emessa
              ricevuta in formato elettronico, accessibile dalla dashboard
              dell&apos;account.
            </li>
          </ul>

          <h2>6. Guida PDF</h2>
          <p>
            RisparmiaMi offre una Guida PDF al risparmio come prodotto digitale
            acquistabile separatamente.
          </p>
          <ul>
            <li>
              <strong>Prezzo:</strong> la Guida PDF è disponibile al costo di{" "}
              <strong>&euro;19</strong> (acquisto singolo, una tantum).
            </li>
            <li>
              <strong>Diritto di recesso:</strong> ai sensi dell&apos;art. 52 del
              Codice del Consumo (D.Lgs. 206/2005), l&apos;Utente ha diritto di
              recedere dall&apos;acquisto entro <strong>30 giorni</strong> dalla
              data di acquisto, senza dover fornire alcuna motivazione. Per
              esercitare il recesso, scrivere a{" "}
              <a href="mailto:supporto@risparmiami.pro">
                supporto@risparmiami.pro
              </a>{" "}
              indicando il numero d&apos;ordine. Il rimborso sarà effettuato
              tramite lo stesso metodo di pagamento utilizzato per l&apos;acquisto.
            </li>
            <li>
              <strong>Download:</strong> la Guida PDF potrà essere scaricata un
              massimo di <strong>3 volte</strong> tramite il link personalizzato
              fornito dopo l&apos;acquisto. Superato tale limite, l&apos;Utente
              potrà richiedere un nuovo link contattando il supporto.
            </li>
            <li>
              È vietata la ridistribuzione, la condivisione o la rivendita della
              Guida PDF a terzi.
            </li>
          </ul>

          <h2>7. Limitazioni di responsabilità</h2>
          <p>
            <strong>
              Le informazioni fornite da RisparmiaMi non costituiscono consulenza
              fiscale, finanziaria, legale o professionale di alcun tipo.
            </strong>
          </p>
          <ul>
            <li>
              RisparmiaMi raccoglie e organizza informazioni pubblicamente
              disponibili relative a detrazioni, bonus, agevolazioni e strategie
              di risparmio. Tali informazioni hanno scopo esclusivamente
              informativo e divulgativo.
            </li>
            <li>
              Le normative fiscali, i bonus e le agevolazioni sono soggetti a
              frequenti modifiche da parte del legislatore. È responsabilità
              dell&apos;Utente verificare sempre l&apos;attualità e
              l&apos;applicabilità delle informazioni con le fonti ufficiali
              (Agenzia delle Entrate, INPS, enti locali).
            </li>
            <li>
              <strong>
                Prima di intraprendere qualsiasi azione fiscale o finanziaria,
                l&apos;Utente è tenuto a consultare un commercialista o
                professionista abilitato.
              </strong>
            </li>
            <li>
              RisparmiaMi non è responsabile per eventuali danni diretti,
              indiretti, incidentali o consequenziali derivanti dall&apos;utilizzo
              o dall&apos;impossibilità di utilizzo del Servizio.
            </li>
            <li>
              Il Servizio è fornito &quot;così com&apos;è&quot; (as is) e
              &quot;come disponibile&quot; (as available), senza garanzie di alcun
              tipo, espresse o implicite, incluse garanzie di accuratezza,
              completezza, idoneità per un uso particolare o non violazione.
            </li>
            <li>
              RisparmiaMi non garantisce la disponibilità ininterrotta del
              Servizio e si riserva il diritto di effettuare interventi di
              manutenzione programmata o straordinaria.
            </li>
          </ul>

          <h2>8. Proprietà intellettuale</h2>
          <p>
            Tutti i contenuti presenti sulla Piattaforma, inclusi a titolo
            esemplificativo e non esaustivo testi, grafica, loghi, icone,
            immagini, software, database, algoritmi di analisi e report generati,
            sono di proprietà esclusiva di RisparmiaMi o dei rispettivi titolari e
            sono protetti dalle leggi italiane e internazionali sul diritto
            d&apos;autore e sulla proprietà intellettuale.
          </p>
          <p>
            È vietata qualsiasi riproduzione, distribuzione, modifica,
            pubblicazione, trasmissione o utilizzo commerciale dei contenuti senza
            la preventiva autorizzazione scritta di RisparmiaMi. L&apos;Utente
            ottiene esclusivamente una licenza limitata, non esclusiva, non
            trasferibile e revocabile per l&apos;utilizzo personale del Servizio.
          </p>

          <h2>9. Modifica dei termini</h2>
          <p>
            RisparmiaMi si riserva il diritto di modificare i presenti Termini di
            Servizio in qualsiasi momento. Le modifiche saranno pubblicate su
            questa pagina con aggiornamento della data di &quot;Ultimo
            aggiornamento&quot;.
          </p>
          <p>
            In caso di modifiche sostanziali che incidano sui diritti
            dell&apos;Utente, quest&apos;ultimo sarà informato via email con un
            preavviso di almeno 15 giorni. L&apos;utilizzo continuato del Servizio
            dopo la notifica delle modifiche costituisce accettazione dei nuovi
            termini. In caso di disaccordo, l&apos;Utente potrà cancellare il
            proprio account e interrompere l&apos;utilizzo del Servizio.
          </p>

          <h2>10. Legge applicabile e foro competente</h2>
          <p>
            I presenti Termini di Servizio sono regolati dalla legge italiana. Per
            qualsiasi controversia derivante dall&apos;interpretazione,
            esecuzione o risoluzione dei presenti Termini:
          </p>
          <ul>
            <li>
              Per gli Utenti qualificabili come &quot;consumatori&quot; ai sensi
              del Codice del Consumo (D.Lgs. 206/2005), è competente in via
              esclusiva il Foro del luogo di residenza o domicilio del
              consumatore, ai sensi dell&apos;art. 66-bis del medesimo Codice.
            </li>
            <li>
              Per tutti gli altri casi, è competente in via esclusiva il{" "}
              <strong>Tribunale di Firenze</strong>.
            </li>
          </ul>
          <p>
            Le parti si impegnano a tentare una risoluzione amichevole della
            controversia prima di adire le vie legali, anche attraverso gli
            strumenti di risoluzione alternativa delle controversie (ADR) previsti
            dalla normativa europea. La piattaforma ODR (Online Dispute
            Resolution) della Commissione Europea è accessibile all&apos;indirizzo:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/consumers/odr
            </a>
            .
          </p>

          <h2>11. Contatti</h2>
          <p>
            Per qualsiasi domanda, segnalazione o richiesta relativa ai presenti
            Termini di Servizio, puoi contattarci ai seguenti recapiti:
          </p>
          <ul>
            <li>
              <strong>Email supporto:</strong>{" "}
              <a href="mailto:supporto@risparmiami.pro">
                supporto@risparmiami.pro
              </a>
            </li>
            <li>
              <strong>Email privacy:</strong>{" "}
              <a href="mailto:privacy@risparmiami.pro">
                privacy@risparmiami.pro
              </a>
            </li>
            <li>
              <strong>Sito web:</strong>{" "}
              <a href="https://risparmiami.pro">risparmiami.pro</a>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
