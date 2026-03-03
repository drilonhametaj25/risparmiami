import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";
import { PageFooter } from "./page-footer";

interface ChapterProps {
  number: number;
  title: string;
  intro: string;
  children: React.ReactNode;
}

export function Chapter({ number, title, intro, children }: ChapterProps) {
  return (
    <Page size="A4" style={styles.pageChapter} wrap>
      {/* Fixed compact header — repeats on every page */}
      <View style={styles.chapterHeaderFixed} fixed>
        <Text style={styles.chapterHeaderFixedNumber}>
          Cap. {number}
        </Text>
        <Text style={styles.chapterHeaderFixedTitle}>{title}</Text>
      </View>

      {/* Full header — only on first page */}
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterNumber}>
          Capitolo {number}
        </Text>
        <Text style={styles.chapterTitle}>{title}</Text>
        <Text style={styles.chapterIntro}>{intro}</Text>
      </View>

      {/* Rule Cards rendered as children */}
      {children}

      {/* Footer */}
      <PageFooter />
    </Page>
  );
}
