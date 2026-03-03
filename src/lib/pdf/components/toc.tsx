import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, colors, fontSizes } from "../styles";
import { PageFooter } from "./page-footer";

interface TocChapter {
  title: string;
  pageNumber: number;
  ruleCount: number;
}

interface TocProps {
  chapters: TocChapter[];
}

export function TableOfContents({ chapters }: TocProps) {
  return (
    <Page size="A4" style={styles.pageWithFooter}>
      <View style={styles.chapterHeader}>
        <Text style={styles.h2}>Indice</Text>
      </View>

      {/* Chapter entries */}
      {chapters.map((chapter, index) => (
        <View key={index} style={styles.tocEntry}>
          <Text style={styles.tocNumber}>{index + 1}.</Text>
          <Text style={styles.tocTitle}>{chapter.title}</Text>
          <Text style={styles.tocRuleCount}>({chapter.ruleCount})</Text>
          <View style={styles.tocDots} />
          <Text style={styles.tocPageNumber}>{chapter.pageNumber}</Text>
        </View>
      ))}

      {/* Appendices section */}
      <View style={{ marginTop: 16 }}>
        <Text
          style={{
            fontSize: fontSizes.small,
            fontFamily: "Open Sans",
            fontWeight: 700,
            color: colors.muted,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          Appendici
        </Text>

        <View style={styles.tocEntry}>
          <Text style={styles.tocNumber}>A.</Text>
          <Text style={styles.tocTitle}>Checklist Documenti</Text>
          <View style={styles.tocDots} />
          <Text style={styles.tocPageNumber}>{"\u2014"}</Text>
        </View>

        <View style={styles.tocEntry}>
          <Text style={styles.tocNumber}>B.</Text>
          <Text style={styles.tocTitle}>Modelli di Lettere</Text>
          <View style={styles.tocDots} />
          <Text style={styles.tocPageNumber}>{"\u2014"}</Text>
        </View>
      </View>

      <PageFooter />
    </Page>
  );
}
