import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, colors, fontSizes } from "../styles";

interface CoverPageProps {
  totalRules: number;
}

const MONTHS_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export function CoverPage({ totalRules }: CoverPageProps) {
  const now = new Date();
  const currentMonth = MONTHS_IT[now.getMonth()];
  const currentYear = now.getFullYear();

  return (
    <Page size="A4" style={styles.coverPage}>
      {/* Top accent bar */}
      <View style={styles.coverDecorTop} />

      {/* Main content */}
      <View style={styles.coverContainer}>
        {/* Brand */}
        <Text style={styles.coverBrand}>RisparmiaMi.pro</Text>

        {/* Title */}
        <Text style={styles.coverTitle}>
          La Guida Definitiva{"\n"}al Risparmio in Italia
        </Text>

        {/* Subtitle */}
        <Text style={styles.coverSubtitle}>
          Edizione {currentYear} {"\u2014"} Aggiornata a {currentMonth} {currentYear}
        </Text>

        {/* Stats */}
        <View style={styles.coverStatsContainer}>
          <Text style={styles.coverStatsNumber}>{totalRules}</Text>
          <Text style={styles.coverStatsLabel}>
            agevolazioni e strategie di risparmio verificate
          </Text>
        </View>

        {/* Tagline */}
        <Text
          style={{
            fontSize: fontSizes.bodySmall,
            fontFamily: "Open Sans",
            color: colors.mutedLight,
            textAlign: "center",
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          Detrazioni fiscali, bonus INPS, risparmio su bollette e banca, trasporti, ISEE e incentivi per imprese.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.coverFooter}>
        <Text style={styles.coverFooterText}>
          risparmiami.pro {"\u2014"} Tutti i diritti riservati {"\u00A9"} {currentYear}
        </Text>
      </View>

      {/* Bottom accent bar */}
      <View style={styles.coverDecorBottom} />
    </Page>
  );
}
