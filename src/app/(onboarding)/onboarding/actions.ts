"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatchesForUser } from "@/lib/rule-engine";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from "@/lib/validations/onboarding";

const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema];

export async function saveOnboardingStep(step: number, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autenticato");

  // Validate data against the corresponding step schema
  const schema = stepSchemas[step];
  const validated = schema ? schema.parse(data) : data;

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      onboardingStep: step + 1,
      ...validated,
    },
    update: {
      onboardingStep: step + 1,
      ...validated,
    },
  });

  revalidatePath("/onboarding/personale");
}

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autenticato");

  await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: { onboardingCompleted: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  });

  // Compute matches based on user profile
  await computeMatchesForUser(session.user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
