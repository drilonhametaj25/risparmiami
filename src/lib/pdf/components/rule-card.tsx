import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";

interface RuleCardProps {
  rule: {
    name: string;
    shortDescription: string;
    maxAmount?: number | null;
    certaintyLevel: string;
    howToClaim?: string;
    requiredDocs?: string[];
    tags?: string[];
  };
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("it-IT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getCertaintyStyle(level: string) {
  switch (level) {
    case "certo":
      return styles.certoCertain;
    case "probabile":
      return styles.certoProbabile;
    case "consiglio":
      return styles.certoConsiglio;
    default:
      return styles.certoProbabile;
  }
}

function getCertaintyLabel(level: string): string {
  switch (level) {
    case "certo":
      return "Certo";
    case "probabile":
      return "Probabile";
    case "consiglio":
      return "Consiglio";
    default:
      return level;
  }
}

export function RuleCard({ rule }: RuleCardProps) {
  const hasDetails =
    (rule.howToClaim && rule.howToClaim.trim().length > 0) ||
    (rule.requiredDocs && rule.requiredDocs.length > 0);

  return (
    <View style={styles.ruleCard} wrap={false}>
      {/* Header: Name + Amount */}
      <View style={styles.ruleCardHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.ruleName}>{rule.name}</Text>
        </View>

        {rule.maxAmount != null && rule.maxAmount > 0 && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Fino a</Text>
            <Text style={styles.amount}>
              {"\u20AC"} {formatAmount(rule.maxAmount)}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.ruleDescription}>{rule.shortDescription}</Text>

      {/* Certainty Badge */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={[styles.certaintyBadge, getCertaintyStyle(rule.certaintyLevel)]}
        >
          <Text>{getCertaintyLabel(rule.certaintyLevel)}</Text>
        </View>
      </View>

      {/* How to Claim */}
      {rule.howToClaim && rule.howToClaim.trim().length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Come richiederlo</Text>
          <Text style={styles.infoText}>{rule.howToClaim}</Text>
        </View>
      )}

      {/* Required Documents */}
      {rule.requiredDocs && rule.requiredDocs.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Documenti necessari</Text>
          {rule.requiredDocs.map((doc, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>{"\u2022"}</Text>
              <Text style={styles.bulletText}>{doc}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tags */}
      {rule.tags && rule.tags.length > 0 && (
        <View style={styles.tagRow}>
          {rule.tags.map((tag, idx) => (
            <Text key={idx} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
