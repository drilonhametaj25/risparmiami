import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface RuleRequirementInput {
  field: string;
  operator: string;
  value: string;
  isRequired?: boolean;
}

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
  requirements: RuleRequirementInput[];
}

async function main() {
  console.log("Seeding database...");

  // Create default admin user
  const adminEmail = "info@drilonhametaj.it";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin" },
    create: {
      email: adminEmail,
      name: "Drilon Hametaj",
      role: "admin",
      currentPlan: "base",
      onboardingCompleted: true,
    },
  });
  console.log(`Admin user created/updated: ${adminEmail}`);

  const rulesDir = path.join(process.cwd(), "src/data/rules");
  const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith(".json"));

  let totalRules = 0;

  for (const file of files) {
    const filePath = path.join(rulesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const rules: RuleInput[] = JSON.parse(content);

    console.log(`Processing ${file}: ${rules.length} rules`);

    for (const rule of rules) {
      await prisma.rule.upsert({
        where: { slug: rule.slug },
        create: {
          slug: rule.slug,
          name: rule.name,
          shortDescription: rule.shortDescription,
          fullDescription: rule.fullDescription,
          category: rule.category,
          subcategory: rule.subcategory,
          target: rule.target,
          maxAmount: rule.maxAmount,
          percentage: rule.percentage,
          estimateFormula: rule.estimateFormula,
          certaintyLevel: rule.certaintyLevel,
          certaintyNote: rule.certaintyNote,
          howToClaim: rule.howToClaim,
          requiredDocs: rule.requiredDocs,
          whereToApply: rule.whereToApply,
          legalReference: rule.legalReference,
          officialUrl: rule.officialUrl,
          sourceName: rule.sourceName,
          validFrom: rule.validFrom ? new Date(rule.validFrom) : undefined,
          validUntil: rule.validUntil ? new Date(rule.validUntil) : undefined,
          deadline: rule.deadline ? new Date(rule.deadline) : undefined,
          tags: rule.tags,
          isActive: true,
          requirements: {
            create: rule.requirements.map((req) => ({
              field: req.field,
              operator: req.operator,
              value: req.value,
              isRequired: req.isRequired ?? true,
            })),
          },
        },
        update: {
          name: rule.name,
          shortDescription: rule.shortDescription,
          fullDescription: rule.fullDescription,
          category: rule.category,
          target: rule.target,
          maxAmount: rule.maxAmount,
          percentage: rule.percentage,
          certaintyLevel: rule.certaintyLevel,
          howToClaim: rule.howToClaim,
          requiredDocs: rule.requiredDocs,
          tags: rule.tags,
          isActive: true,
          lastVerified: new Date(),
        },
      });
      totalRules++;
    }
  }

  console.log(`Seeded ${totalRules} rules from ${files.length} files`);

  // Index rules in Meilisearch
  const meiliUrl = process.env.MEILISEARCH_URL || "http://localhost:7700";
  const meiliKey = process.env.MEILISEARCH_KEY || "meili_dev_key";

  try {
    const allRules = await prisma.rule.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        shortDescription: true,
        fullDescription: true,
        category: true,
        subcategory: true,
        target: true,
        maxAmount: true,
        certaintyLevel: true,
        isActive: true,
        tags: true,
      },
    });

    const meiliDocs = allRules.map((r) => ({
      ...r,
      maxAmount: r.maxAmount ? Number(r.maxAmount) : null,
    }));

    // Create or update the rules index
    const indexRes = await fetch(`${meiliUrl}/indexes/rules/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${meiliKey}`,
      },
      body: JSON.stringify(meiliDocs),
    });

    if (indexRes.ok) {
      console.log(`Indexed ${meiliDocs.length} rules in Meilisearch`);

      // Configure filterable and searchable attributes
      await fetch(`${meiliUrl}/indexes/rules/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${meiliKey}`,
        },
        body: JSON.stringify({
          searchableAttributes: ["name", "shortDescription", "fullDescription", "tags"],
          filterableAttributes: ["category", "target", "isActive", "certaintyLevel"],
          sortableAttributes: ["maxAmount", "name"],
        }),
      });
      console.log("Meilisearch index settings configured");
    } else {
      console.warn(`Meilisearch indexing failed (${indexRes.status}): ${await indexRes.text()}`);
    }
  } catch (e) {
    console.warn("Meilisearch not available, skipping indexing:", (e as Error).message);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
