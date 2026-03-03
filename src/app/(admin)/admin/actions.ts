"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Accesso non autorizzato. Solo gli amministratori possono eseguire questa azione.");
  }
  return session.user;
}

export async function getUserDetail(userId: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      companyProfile: true,
      subscription: true,
      pdfPurchases: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: { matches: true },
      },
    },
  });

  return user;
}

export async function promoteToAdmin(formData: FormData) {
  await requireAdmin();

  const email = formData.get("email") as string;
  if (!email) {
    throw new Error("Email obbligatoria.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Utente non trovato con questa email.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  });

  revalidatePath("/admin/impostazioni");
}

export async function demoteAdmin(userId: string) {
  const currentUser = await requireAdmin();

  if (currentUser.id === userId) {
    throw new Error("Non puoi rimuovere te stesso dal ruolo di amministratore.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "user" },
  });

  revalidatePath("/admin/impostazioni");
}

export async function toggleRuleActive(ruleId: string) {
  await requireAdmin();

  const rule = await prisma.rule.findUnique({
    where: { id: ruleId },
    select: { isActive: true },
  });

  if (!rule) {
    throw new Error("Regola non trovata.");
  }

  await prisma.rule.update({
    where: { id: ruleId },
    data: { isActive: !rule.isActive },
  });

  revalidatePath("/admin/regole");
}

export async function duplicateRule(ruleId: string) {
  await requireAdmin();

  const rule = await prisma.rule.findUnique({
    where: { id: ruleId },
    include: { requirements: true },
  });

  if (!rule) {
    throw new Error("Regola non trovata.");
  }

  const { id, createdAt, updatedAt, requirements, ...ruleData } = rule;

  await prisma.rule.create({
    data: {
      ...ruleData,
      name: `${rule.name} (copia)`,
      slug: `${rule.slug}-copia`,
      isActive: false,
      requirements: {
        create: requirements.map(({ id, ruleId, ...req }) => req),
      },
    },
  });

  revalidatePath("/admin/regole");
}

export async function deleteRule(ruleId: string) {
  await requireAdmin();

  await prisma.$transaction([
    prisma.userMatch.deleteMany({ where: { ruleId } }),
    prisma.ruleRequirement.deleteMany({ where: { ruleId } }),
    prisma.rule.delete({ where: { id: ruleId } }),
  ]);

  revalidatePath("/admin/regole");
}

export async function createRule(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const fullDescription = formData.get("fullDescription") as string;
  const category = formData.get("category") as string;
  const subcategory = formData.get("subcategory") as string;
  const target = formData.get("target") as string;
  const maxAmount = formData.get("maxAmount") as string;
  const percentage = formData.get("percentage") as string;
  const estimateFormula = formData.get("estimateFormula") as string;
  const certaintyLevel = formData.get("certaintyLevel") as string;
  const certaintyNote = formData.get("certaintyNote") as string;
  const howToClaim = formData.get("howToClaim") as string;
  const requiredDocsRaw = formData.get("requiredDocs") as string;
  const whereToApply = formData.get("whereToApply") as string;
  const legalReference = formData.get("legalReference") as string;
  const officialUrl = formData.get("officialUrl") as string;
  const sourceName = formData.get("sourceName") as string;
  const validFrom = formData.get("validFrom") as string;
  const validUntil = formData.get("validUntil") as string;
  const deadline = formData.get("deadline") as string;
  const isActive = formData.get("isActive") === "true";
  const seoTitle = formData.get("seoTitle") as string;
  const seoDescription = formData.get("seoDescription") as string;
  const tagsRaw = formData.get("tags") as string;
  const requirementsRaw = formData.get("requirements") as string;

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const requiredDocs = requiredDocsRaw
    ? requiredDocsRaw.split(",").map((d) => d.trim()).filter(Boolean)
    : [];
  const requirements = requirementsRaw ? JSON.parse(requirementsRaw) : [];

  await prisma.rule.create({
    data: {
      name,
      slug,
      shortDescription,
      fullDescription,
      category,
      subcategory: subcategory || null,
      target,
      maxAmount: maxAmount ? parseFloat(maxAmount) : null,
      percentage: percentage ? parseFloat(percentage) : null,
      estimateFormula: estimateFormula || null,
      certaintyLevel,
      certaintyNote: certaintyNote || null,
      howToClaim,
      requiredDocs,
      whereToApply: whereToApply || null,
      legalReference: legalReference || null,
      officialUrl: officialUrl || null,
      sourceName: sourceName || null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      deadline: deadline ? new Date(deadline) : null,
      isActive,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      tags,
      requirements: {
        create: requirements.map(
          (req: { field: string; operator: string; value: string; isRequired: boolean }) => ({
            field: req.field,
            operator: req.operator,
            value: req.value,
            isRequired: req.isRequired,
          })
        ),
      },
    },
  });

  redirect("/admin/regole");
}

export async function updateRule(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const fullDescription = formData.get("fullDescription") as string;
  const category = formData.get("category") as string;
  const subcategory = formData.get("subcategory") as string;
  const target = formData.get("target") as string;
  const maxAmount = formData.get("maxAmount") as string;
  const percentage = formData.get("percentage") as string;
  const estimateFormula = formData.get("estimateFormula") as string;
  const certaintyLevel = formData.get("certaintyLevel") as string;
  const certaintyNote = formData.get("certaintyNote") as string;
  const howToClaim = formData.get("howToClaim") as string;
  const requiredDocsRaw = formData.get("requiredDocs") as string;
  const whereToApply = formData.get("whereToApply") as string;
  const legalReference = formData.get("legalReference") as string;
  const officialUrl = formData.get("officialUrl") as string;
  const sourceName = formData.get("sourceName") as string;
  const validFrom = formData.get("validFrom") as string;
  const validUntil = formData.get("validUntil") as string;
  const deadline = formData.get("deadline") as string;
  const isActive = formData.get("isActive") === "true";
  const seoTitle = formData.get("seoTitle") as string;
  const seoDescription = formData.get("seoDescription") as string;
  const tagsRaw = formData.get("tags") as string;
  const requirementsRaw = formData.get("requirements") as string;

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const requiredDocs = requiredDocsRaw
    ? requiredDocsRaw.split(",").map((d) => d.trim()).filter(Boolean)
    : [];
  const requirements = requirementsRaw ? JSON.parse(requirementsRaw) : [];

  await prisma.$transaction([
    prisma.ruleRequirement.deleteMany({ where: { ruleId: id } }),
    prisma.rule.update({
      where: { id },
      data: {
        name,
        slug,
        shortDescription,
        fullDescription,
        category,
        subcategory: subcategory || null,
        target,
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        percentage: percentage ? parseFloat(percentage) : null,
        estimateFormula: estimateFormula || null,
        certaintyLevel,
        certaintyNote: certaintyNote || null,
        howToClaim,
        requiredDocs,
        whereToApply: whereToApply || null,
        legalReference: legalReference || null,
        officialUrl: officialUrl || null,
        sourceName: sourceName || null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        deadline: deadline ? new Date(deadline) : null,
        isActive,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        tags,
        version: { increment: 1 },
        requirements: {
          create: requirements.map(
            (req: { field: string; operator: string; value: string; isRequired: boolean }) => ({
              field: req.field,
              operator: req.operator,
              value: req.value,
              isRequired: req.isRequired,
            })
          ),
        },
      },
    }),
  ]);

  revalidatePath("/admin/regole");
  redirect("/admin/regole");
}

export async function uploadPdf(formData: FormData) {
  await requireAdmin();

  const file = formData.get("pdf") as File;
  if (!file || file.type !== "application/pdf") {
    throw new Error("Il file deve essere un PDF valido.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "generated-pdfs");

  await fs.mkdir(dir, { recursive: true });

  const latestPath = path.join(dir, "guida-risparmio-latest.pdf");
  await fs.writeFile(latestPath, buffer);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const timestampedPath = path.join(dir, `guida-risparmio-${timestamp}.pdf`);
  await fs.writeFile(timestampedPath, buffer);

  revalidatePath("/admin/pdf");
}

export async function triggerPdfGeneration() {
  await requireAdmin();

  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/cron/generate-pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  });

  if (!response.ok) {
    throw new Error("Errore nella generazione del PDF.");
  }

  revalidatePath("/admin/pdf");
}

export async function triggerMonthlyReport() {
  await requireAdmin();

  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/cron/monthly-report`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
  });

  if (!response.ok) {
    throw new Error("Errore nell'invio del report mensile.");
  }
}
