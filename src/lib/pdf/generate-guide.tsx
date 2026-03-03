import React from "react";
import { Document } from "@react-pdf/renderer";
import type { Rule } from "@prisma/client";
import { registerFonts } from "./register-fonts";

import { CoverPage } from "./components/cover-page";
import { TableOfContents } from "./components/toc";
import { Chapter } from "./components/chapter";
import { RuleCard } from "./components/rule-card";
import { AppendixChecklist } from "./components/appendix-checklist";
import { AppendixTemplates } from "./components/appendix-templates";

// ==================== Category Configuration ====================

interface ChapterConfig {
  key: string;
  title: string;
  intro: string;
}

const CHAPTER_CONFIGS: ChapterConfig[] = [
  {
    key: "detrazioni-fiscali",
    title: "Detrazioni Fiscali",
    intro:
      "Le detrazioni fiscali ti permettono di ridurre l'imposta lorda IRPEF. In questa sezione trovi tutte le detrazioni disponibili, dai lavori edilizi alle spese sanitarie, dall'istruzione ai trasporti.",
  },
  {
    key: "bonus-inps",
    title: "Bonus e Agevolazioni INPS",
    intro:
      "L'INPS eroga numerosi bonus e prestazioni a sostegno delle famiglie, dei lavoratori e dei pensionati. Scopri quali agevolazioni puoi richiedere in base alla tua situazione.",
  },
  {
    key: "bollette",
    title: "Risparmio Bollette",
    intro:
      "Le bollette di luce e gas rappresentano una delle voci di spesa pi\u00F9 importanti. Qui trovi bonus sociali, strategie di cambio fornitore e consigli per ridurre i consumi.",
  },
  {
    key: "banca",
    title: "Risparmio Bancario",
    intro:
      "I costi bancari possono incidere significativamente sul budget familiare. Scopri come ottimizzare il tuo conto corrente, ridurre le commissioni e sfruttare le offerte migliori.",
  },
  {
    key: "trasporti",
    title: "Trasporti",
    intro:
      "Dalla mobilit\u00E0 sostenibile agli incentivi per l'acquisto di veicoli ecologici, passando per gli abbonamenti agevolati al trasporto pubblico.",
  },
  {
    key: "isee",
    title: "ISEE e Welfare",
    intro:
      "L'ISEE \u00E8 la chiave per accedere a numerose agevolazioni. In questa sezione trovi le prestazioni legate all'indicatore economico e i servizi di welfare disponibili.",
  },
  {
    key: "incentivi-imprese",
    title: "Incentivi per Imprese",
    intro:
      "Crediti d'imposta, contributi a fondo perduto e agevolazioni per le imprese italiane. Scopri come finanziare investimenti, formazione e innovazione.",
  },
];

// ==================== Helper Functions ====================

function groupRulesByCategory(rules: Rule[]): Map<string, Rule[]> {
  const groups = new Map<string, Rule[]>();

  for (const rule of rules) {
    const category = rule.category.toLowerCase();
    const existing = groups.get(category) || [];
    existing.push(rule);
    groups.set(category, existing);
  }

  return groups;
}

function mapRuleToCardProps(rule: Rule) {
  return {
    name: rule.name,
    shortDescription: rule.shortDescription,
    maxAmount: rule.maxAmount ? Number(rule.maxAmount) : null,
    certaintyLevel: rule.certaintyLevel,
    howToClaim: rule.howToClaim || undefined,
    requiredDocs: rule.requiredDocs.length > 0 ? rule.requiredDocs : undefined,
    tags: rule.tags.length > 0 ? rule.tags : undefined,
  };
}

// ==================== Document Component ====================

interface GuidePdfProps {
  rules: Rule[];
}

export function GuidePdf({ rules }: GuidePdfProps) {
  const groupedRules = groupRulesByCategory(rules);

  // Build chapters array: only include categories that have rules
  const knownKeys = new Set(CHAPTER_CONFIGS.map((c) => c.key));
  const uncategorizedRules: Rule[] = [];

  Array.from(groupedRules.entries()).forEach(([category, categoryRules]) => {
    if (!knownKeys.has(category)) {
      uncategorizedRules.push(...categoryRules);
    }
  });

  // Add uncategorized rules to the last chapter as catch-all
  if (uncategorizedRules.length > 0) {
    console.warn(
      `[PDF] ${uncategorizedRules.length} regole con categorie non mappate:`,
      uncategorizedRules.map((r) => `${r.name} (${r.category})`).join(", ")
    );
    const lastKey = CHAPTER_CONFIGS[CHAPTER_CONFIGS.length - 1].key;
    const existing = groupedRules.get(lastKey) || [];
    groupedRules.set(lastKey, [...existing, ...uncategorizedRules]);
  }

  // Filter chapters to only those with rules
  const activeChapters = CHAPTER_CONFIGS.filter((config) => {
    const categoryRules = groupedRules.get(config.key);
    return categoryRules && categoryRules.length > 0;
  });

  // Generate TOC data with rule counts
  const tocChapters = activeChapters.map((config, index) => ({
    title: config.title,
    pageNumber: index + 3,
    ruleCount: (groupedRules.get(config.key) || []).length,
  }));

  return (
    <Document
      title="La Guida Definitiva al Risparmio in Italia"
      author="RisparmiaMi.pro"
      subject="Guida completa alle agevolazioni fiscali e strategie di risparmio"
      keywords="risparmio, detrazioni, bonus, INPS, Italia, fiscale"
      language="it"
    >
      {/* Cover Page */}
      <CoverPage totalRules={rules.length} />

      {/* Table of Contents */}
      <TableOfContents chapters={tocChapters} />

      {/* Chapters with Rule Cards */}
      {activeChapters.map((config, index) => {
        const categoryRules = groupedRules.get(config.key) || [];

        // Sort rules: by certaintyLevel priority, then by maxAmount descending
        const sortedRules = [...categoryRules].sort((a, b) => {
          const certaintyOrder: Record<string, number> = {
            certo: 0,
            probabile: 1,
            consiglio: 2,
          };
          const aCertainty = certaintyOrder[a.certaintyLevel] ?? 3;
          const bCertainty = certaintyOrder[b.certaintyLevel] ?? 3;

          if (aCertainty !== bCertainty) return aCertainty - bCertainty;

          const aAmount = a.maxAmount ? Number(a.maxAmount) : 0;
          const bAmount = b.maxAmount ? Number(b.maxAmount) : 0;
          return bAmount - aAmount;
        });

        return (
          <Chapter
            key={config.key}
            number={index + 1}
            title={config.title}
            intro={config.intro}
          >
            {sortedRules.map((rule) => (
              <RuleCard key={rule.id} rule={mapRuleToCardProps(rule)} />
            ))}
          </Chapter>
        );
      })}

      {/* Appendices */}
      <AppendixChecklist />
      <AppendixTemplates />
    </Document>
  );
}

// ==================== PDF Buffer Generation ====================

export async function generatePdfBuffer(rules: Rule[]): Promise<Buffer> {
  registerFonts();
  const { renderToBuffer } = await import("@react-pdf/renderer");
  return renderToBuffer(<GuidePdf rules={rules} />);
}
