import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, colors } from "../styles";
import { PageFooter } from "./page-footer";

const CHECKLIST_ITEMS = [
  {
    title: "Modello 730 / Redditi PF",
    description:
      "Dichiarazione dei redditi dell'anno precedente. Necessario per detrazioni e deduzioni fiscali.",
  },
  {
    title: "CUD / Certificazione Unica",
    description:
      "Rilasciata dal datore di lavoro o dall'ente pensionistico. Attesta i redditi percepiti.",
  },
  {
    title: "Documenti di identità",
    description:
      "Carta d'identità o passaporto in corso di validità. Richiesta per tutte le pratiche.",
  },
  {
    title: "Codice Fiscale / Tessera Sanitaria",
    description:
      "Indispensabile per qualsiasi interazione con la Pubblica Amministrazione.",
  },
  {
    title: "ISEE in corso di validità",
    description:
      "Indicatore della situazione economica equivalente. Fondamentale per bonus e agevolazioni a soglia.",
  },
  {
    title: "Visura camerale (per aziende)",
    description:
      "Documento ufficiale della Camera di Commercio. Necessario per incentivi e crediti d'imposta.",
  },
  {
    title: "Ultime bollette luce/gas",
    description:
      "Servono per richiedere bonus sociali e per confrontare le offerte di mercato libero.",
  },
  {
    title: "Estratto conto bancario",
    description:
      "Utile per verificare i costi bancari e valutare alternative più convenienti.",
  },
  {
    title: "Contratto di lavoro",
    description:
      "Specifica il tipo di contratto, la retribuzione e i benefit aziendali.",
  },
  {
    title: "Documenti di proprietà immobiliare",
    description:
      "Atto di compravendita, visura catastale. Necessari per detrazioni su ristrutturazioni e mutui.",
  },
];

export function AppendixChecklist() {
  return (
    <Page size="A4" style={styles.pageWithFooter} wrap>
      {/* Header */}
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterNumber}>Appendice A</Text>
        <Text style={styles.chapterTitle}>Checklist Documenti</Text>
        <Text style={styles.chapterIntro}>
          Prima di richiedere qualsiasi agevolazione, assicurati di avere a
          disposizione tutti i documenti necessari. Usa questa checklist per
          verificare di non dimenticare nulla.
        </Text>
      </View>

      {/* Checklist Items */}
      {CHECKLIST_ITEMS.map((item, idx) => (
        <View key={idx} style={styles.checklistItem} wrap={false}>
          <Text style={styles.checkbox}>{"\u25A1"}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Open Sans",
                fontWeight: 700,
                color: colors.text,
                marginBottom: 2,
              }}
            >
              {item.title}
            </Text>
            <Text style={styles.small}>{item.description}</Text>
          </View>
        </View>
      ))}

      <PageFooter />
    </Page>
  );
}
