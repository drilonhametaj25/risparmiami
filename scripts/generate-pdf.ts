/**
 * Standalone PDF generation script.
 * Reads rule data directly from JSON files (no database required).
 *
 * Usage: npx tsx scripts/generate-pdf.ts
 */

import * as fs from "fs";
import * as path from "path";
import type { Rule } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// ==================== Types ====================

interface RuleInput {
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory?: string;
  target: string;
  maxAmount?: number;
  percentage?: number;
  estimateFormula?: string;
  certaintyLevel: string;
  certaintyNote?: string;
  howToClaim: string;
  requiredDocs: string[];
  whereToApply?: string;
  legalReference?: string;
  officialUrl?: string;
  sourceName?: string;
  validFrom?: string;
  validUntil?: string;
  deadline?: string;
  tags: string[];
}

function jsonToRule(input: RuleInput, index: number): Rule {
  return {
    id: `rule-${index}`,
    slug: input.slug,
    name: input.name,
    shortDescription: input.shortDescription,
    fullDescription: input.fullDescription,
    category: input.category,
    subcategory: input.subcategory || null,
    target: input.target,
    maxAmount: input.maxAmount != null ? new Decimal(input.maxAmount) : null,
    percentage: input.percentage != null ? new Decimal(input.percentage) : null,
    estimateFormula: input.estimateFormula || null,
    certaintyLevel: input.certaintyLevel,
    certaintyNote: input.certaintyNote || null,
    howToClaim: input.howToClaim,
    requiredDocs: input.requiredDocs,
    whereToApply: input.whereToApply || null,
    legalReference: input.legalReference || null,
    officialUrl: input.officialUrl || null,
    sourceName: input.sourceName || null,
    validFrom: input.validFrom ? new Date(input.validFrom) : null,
    validUntil: input.validUntil ? new Date(input.validUntil) : null,
    deadline: input.deadline ? new Date(input.deadline) : null,
    isActive: true,
    lastVerified: new Date(),
    version: 1,
    tags: input.tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Rule;
}

async function main() {
  console.log("Reading rules from JSON files...");

  const rulesDir = path.join(process.cwd(), "src/data/rules");
  const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith(".json"));

  const allRules: Rule[] = [];
  let globalIndex = 0;

  for (const file of files) {
    const filePath = path.join(rulesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const rules: RuleInput[] = JSON.parse(content);

    console.log(`  ${file}: ${rules.length} rules`);

    for (const rule of rules) {
      allRules.push(jsonToRule(rule, globalIndex++));
    }
  }

  console.log(`\nTotal: ${allRules.length} rules loaded`);
  console.log("Generating PDF (this may take a minute)...");

  // Import generates-guide which also registers fonts via register-fonts.ts
  const { generatePdfBuffer } = await import("../src/lib/pdf/generate-guide");
  const pdfBuffer = await generatePdfBuffer(allRules);

  // Save to public/generated-pdfs/
  const pdfDir = path.join(process.cwd(), "public", "generated-pdfs");
  fs.mkdirSync(pdfDir, { recursive: true });

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `guida-risparmio-${timestamp}.pdf`;
  const filepath = path.join(pdfDir, filename);

  fs.writeFileSync(filepath, pdfBuffer);

  // Also save as "latest"
  const latestPath = path.join(pdfDir, "guida-risparmio-latest.pdf");
  fs.writeFileSync(latestPath, pdfBuffer);

  const sizeMb = (pdfBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`\nPDF generated successfully!`);
  console.log(`  File: ${filepath}`);
  console.log(`  Size: ${sizeMb} MB`);
  console.log(`  Rules: ${allRules.length}`);
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
