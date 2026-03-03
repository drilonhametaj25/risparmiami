import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";

export function PageFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.pageFooter} fixed>
      <Text style={styles.pageFooterText}>
        RisparmiaMi.pro {"\u2014"} La Guida al Risparmio {currentYear}
      </Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}
