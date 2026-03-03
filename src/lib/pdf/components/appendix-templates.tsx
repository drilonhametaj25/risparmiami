import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";
import { PageFooter } from "./page-footer";

const TEMPLATES = [
  {
    title: "Richiesta calcolo ISEE",
    body: `Spett.le CAF / Patronato [NOME CAF/PATRONATO]
Via [INDIRIZZO]
[CAP] [CITT\u00C0] ([PROVINCIA])

Oggetto: Richiesta di elaborazione ISEE ${new Date().getFullYear()}

Il/La sottoscritto/a [NOME COGNOME], nato/a a [LUOGO DI NASCITA] il [DATA DI NASCITA], residente in [INDIRIZZO DI RESIDENZA], codice fiscale [CODICE FISCALE],

CHIEDE

l'elaborazione della Dichiarazione Sostitutiva Unica (DSU) ai fini del calcolo dell'Indicatore della Situazione Economica Equivalente (ISEE) per l'anno ${new Date().getFullYear()}.

A tal fine, allega la seguente documentazione:
- Documento di identit\u00E0 in corso di validit\u00E0
- Codice fiscale di tutti i componenti del nucleo familiare
- Ultima dichiarazione dei redditi (730/Redditi PF)
- Certificazione Unica (CU) dell'anno precedente
- Saldo e giacenza media dei conti correnti al 31/12/[ANNO]
- Documentazione patrimoniale immobiliare
- Eventuale contratto di locazione registrato

Si richiede il rilascio dell'attestazione ISEE ordinaria.

In fede,

[LUOGO], [DATA]

_________________________
[FIRMA]`,
  },
  {
    title: "Richiesta detrazione fiscale",
    body: `Spett.le Agenzia delle Entrate
Direzione Provinciale di [CITT\u00C0]
Via [INDIRIZZO]
[CAP] [CITT\u00C0]

Oggetto: Richiesta di chiarimenti su detrazione fiscale \u2014 [TIPO DI DETRAZIONE]

Il/La sottoscritto/a [NOME COGNOME], codice fiscale [CODICE FISCALE], residente in [INDIRIZZO DI RESIDENZA],

in qualit\u00E0 di contribuente,

ESPONE

che in data [DATA] ha sostenuto spese per [DESCRIZIONE DELLA SPESA] per un importo complessivo di Euro [IMPORTO], come documentato dalle ricevute/fatture allegate.

CHIEDE

di poter usufruire della detrazione fiscale prevista dall'art. [ARTICOLO] del TUIR / D.L. [NUMERO DECRETO] del [DATA DECRETO], nella misura del [PERCENTUALE]% della spesa sostenuta, pari ad Euro [IMPORTO DETRAZIONE].

Si allegano:
- Copia del documento di identit\u00E0
- Fatture/ricevute delle spese sostenute
- Ricevuta del bonifico parlante (se applicabile)
- Dichiarazione di conformit\u00E0 dei lavori (se applicabile)

Distinti saluti,

[LUOGO], [DATA]

_________________________
[FIRMA]`,
  },
  {
    title: "Reclamo fornitore utenze (luce/gas)",
    body: `Spett.le [NOME FORNITORE]
Servizio Clienti / Ufficio Reclami
Via [INDIRIZZO]
[CAP] [CITT\u00C0]

Raccomandata A/R (oppure PEC: [INDIRIZZO PEC])

Oggetto: Reclamo formale \u2014 Contratto n. [NUMERO CONTRATTO] / POD: [CODICE POD] / PDR: [CODICE PDR]

Il/La sottoscritto/a [NOME COGNOME], titolare dell'utenza sopra indicata, con la presente

CONTESTA

quanto segue:

[DESCRIZIONE DETTAGLIATA DEL PROBLEMA]
(ad esempio: addebito non riconosciuto in bolletta del [DATA], conguaglio eccessivo, mancata applicazione dello sconto contrattuale, ritardo nell'attivazione/disattivazione, ecc.)

L'importo contestato ammonta a Euro [IMPORTO].

CHIEDE

1. La verifica immediata dell'anomalia segnalata
2. Il ricalcolo / storno delle somme indebitamente addebitate
3. Il rimborso di Euro [IMPORTO] entro 30 giorni dalla presente
4. La conferma scritta della risoluzione del problema

Si avverte che, in mancanza di riscontro entro 40 giorni dalla ricezione della presente, ci si riserva di adire le vie legali e/o di presentare reclamo all'ARERA (Autorit\u00E0 di Regolazione per Energia Reti e Ambiente) tramite lo Sportello per il Consumatore.

Si allegano:
- Copia del documento di identit\u00E0
- Copia della bolletta contestata
- Eventuali precedenti comunicazioni

Distinti saluti,

[LUOGO], [DATA]

_________________________
[FIRMA]`,
  },
];

export function AppendixTemplates() {
  return (
    <Page size="A4" style={styles.pageWithFooter} wrap>
      {/* Header */}
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterNumber}>Appendice B</Text>
        <Text style={styles.chapterTitle}>Modelli di Lettere</Text>
        <Text style={styles.chapterIntro}>
          Questi modelli ti aiuteranno a scrivere comunicazioni formali per
          richiedere agevolazioni o presentare reclami. Sostituisci i campi tra
          parentesi quadre [CAMPO] con i tuoi dati personali.
        </Text>
      </View>

      {/* Template Letters — wrap allowed for long content */}
      {TEMPLATES.map((template, idx) => (
        <View key={idx} style={styles.templateBlock} wrap>
          <Text style={styles.templateTitle}>
            {String.fromCharCode(65 + idx)}. {template.title}
          </Text>
          <Text style={styles.templateText}>{template.body}</Text>
        </View>
      ))}

      <PageFooter />
    </Page>
  );
}
