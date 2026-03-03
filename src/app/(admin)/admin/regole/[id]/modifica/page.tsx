import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RuleForm } from "@/components/admin/rule-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaRegolaPage({ params }: PageProps) {
  const { id } = await params;

  const rule = await prisma.rule.findUnique({
    where: { id },
    include: { requirements: true },
  });

  if (!rule) notFound();

  // Serialize Decimal and DateTime fields for client component
  const serializedRule = {
    ...rule,
    maxAmount: rule.maxAmount ? Number(rule.maxAmount) : null,
    percentage: rule.percentage ? Number(rule.percentage) : null,
    validFrom: rule.validFrom ? rule.validFrom.toISOString() : null,
    validUntil: rule.validUntil ? rule.validUntil.toISOString() : null,
    deadline: rule.deadline ? rule.deadline.toISOString() : null,
    lastVerified: rule.lastVerified ? rule.lastVerified.toISOString() : null,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
    requirements: rule.requirements.map((req) => ({
      id: req.id,
      ruleId: req.ruleId,
      field: req.field,
      operator: req.operator,
      value: req.value,
      isRequired: req.isRequired,
    })),
  };

  return (
    <div>
      <h1 className="font-heading text-2xl mb-6">Modifica regola</h1>
      <RuleForm initialData={serializedRule} />
    </div>
  );
}
