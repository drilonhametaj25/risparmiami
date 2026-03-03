/**
 * Standalone PDF generation script (CJS).
 * Reads rule data directly from JSON files (no database required).
 *
 * Usage: node scripts/generate-pdf.cjs
 */

const fs = require("fs");
const path = require("path");

// Register fonts FIRST using the same CJS Font instance as the renderer
const { Font } = require("@react-pdf/renderer");

const OPEN_SANS_BASE =
  "https://cdn.jsdelivr.net/npm/@fontsource/open-sans@5.0.28/files";

Font.register({
  family: "Open Sans",
  fonts: [
    { src: `${OPEN_SANS_BASE}/open-sans-latin-400-normal.woff`, fontWeight: 400 },
    { src: `${OPEN_SANS_BASE}/open-sans-latin-600-normal.woff`, fontWeight: 600 },
    { src: `${OPEN_SANS_BASE}/open-sans-latin-700-normal.woff`, fontWeight: 700 },
    { src: `${OPEN_SANS_BASE}/open-sans-latin-400-italic.woff`, fontWeight: 400, fontStyle: "italic" },
    { src: `${OPEN_SANS_BASE}/open-sans-latin-600-italic.woff`, fontWeight: 600, fontStyle: "italic" },
  ],
});

Font.registerHyphenationCallback((word) => [word]);
console.log("Fonts registered.");

// Load tsx for TypeScript support
require("tsx/cjs");

const { generatePdfBuffer } = require("../src/lib/pdf/generate-guide");
const { Decimal } = require("@prisma/client/runtime/library");

function jsonToRule(input, index) {
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
  };
}

async function main() {
  console.log("Reading rules from JSON files...");

  const rulesDir = path.join(process.cwd(), "src/data/rules");
  const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith(".json"));

  const allRules = [];
  let globalIndex = 0;

  for (const file of files) {
    const filePath = path.join(rulesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const rules = JSON.parse(content);

    console.log(`  ${file}: ${rules.length} rules`);

    for (const rule of rules) {
      allRules.push(jsonToRule(rule, globalIndex++));
    }
  }

  console.log(`\nTotal: ${allRules.length} rules loaded`);
  console.log("Generating PDF (this may take a minute)...\n");

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
  console.log(`PDF generated successfully!`);
  console.log(`  File: ${filepath}`);
  console.log(`  Size: ${sizeMb} MB`);
  console.log(`  Rules: ${allRules.length}`);
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
