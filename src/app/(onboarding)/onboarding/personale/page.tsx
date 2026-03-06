import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Onboarding",
};

/**
 * Map raw quiz answers (stored in QuizResult.answers JSON) to onboarding
 * field names so the wizard can be pre-filled for users who completed the
 * quiz before registering.
 */
function mapQuizToOnboarding(quizAnswers: Record<string, string>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  // lavoro -> employmentType
  if (quizAnswers.lavoro) {
    const employmentMap: Record<string, string> = {
      dipendente: "dipendente",
      autonomo: "autonomo",
      pensionato: "pensionato",
      disoccupato: "disoccupato",
    };
    mapped.employmentType = employmentMap[quizAnswers.lavoro] ?? undefined;
  }

  // reddito -> incomeRange
  if (quizAnswers.reddito) {
    const incomeMap: Record<string, string> = {
      under15: "0-15000",
      "15_28": "15000-28000",
      "28_50": "28000-50000",
      "50_75": "50000-75000",
      over75: "75000+",
    };
    mapped.incomeRange = incomeMap[quizAnswers.reddito] ?? undefined;
  }

  // figli -> childrenCount
  if (quizAnswers.figli) {
    mapped.childrenCount =
      quizAnswers.figli === "3+" ? 3 : parseInt(quizAnswers.figli, 10);
  }

  // abitazione -> housingType + hasMortgage
  if (quizAnswers.abitazione) {
    const housingMap: Record<string, { housingType: string; hasMortgage?: boolean }> = {
      mutuo: { housingType: "proprietà", hasMortgage: true },
      proprieta: { housingType: "proprietà", hasMortgage: false },
      affitto: { housingType: "affitto" },
      altro: { housingType: "altro" },
    };
    const h = housingMap[quizAnswers.abitazione];
    if (h) {
      mapped.housingType = h.housingType;
      if (h.hasMortgage !== undefined) mapped.hasMortgage = h.hasMortgage;
    }
  }

  // bollette -> electricityBimonthly (approximate)
  if (quizAnswers.bollette) {
    const billMap: Record<string, string> = {
      under100: "0-50",
      "100_200": "50-100",
      "200_350": "100-175",
      over350: "175+",
    };
    mapped.electricityBimonthly = billMap[quizAnswers.bollette] ?? undefined;
  }

  return mapped;
}

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Try to load quiz answers for pre-fill (only useful when profile is empty)
  let quizDefaults: Record<string, unknown> = {};
  const cookieStore = cookies();
  const quizSessionId = cookieStore.get("quiz_session")?.value;
  if (quizSessionId) {
    try {
      const quizResult = await prisma.quizResult.findFirst({
        where: { sessionId: quizSessionId },
        orderBy: { createdAt: "desc" },
      });
      if (quizResult) {
        quizDefaults = mapQuizToOnboarding(
          quizResult.answers as Record<string, string>
        );
      }
    } catch {
      // Non-critical — ignore quiz lookup failures
    }
  }

  // Build initial data: profile values take precedence over quiz defaults
  const profileData = profile
    ? {
        birthYear: profile.birthYear ?? undefined,
        region: profile.region ?? undefined,
        province: profile.province ?? undefined,
        maritalStatus: profile.maritalStatus ?? undefined,
        citizenship: profile.citizenship ?? "IT",
        childrenCount: profile.childrenCount ?? 0,
        childrenAges: profile.childrenAges ?? [],
        employmentType: profile.employmentType ?? undefined,
        contractType: profile.contractType ?? undefined,
        incomeRange: profile.incomeRange ?? undefined,
        iseeRange: profile.iseeRange ?? undefined,
        hasCommercialistaOrCaf: profile.hasCommercialistaOrCaf ?? false,
        housingType: profile.housingType ?? undefined,
        isPrimaryResidence: profile.isPrimaryResidence ?? true,
        rentAmountRange: profile.rentAmountRange ?? undefined,
        hasMortgage: profile.hasMortgage ?? false,
        hasRenovatedRecently: profile.hasRenovatedRecently ?? false,
        renovationYear: profile.renovationYear ?? undefined,
        heatingType: profile.heatingType ?? undefined,
        electricityProvider: profile.electricityProvider ?? undefined,
        electricityBimonthly: profile.electricityBimonthly ?? undefined,
        gasProvider: profile.gasProvider ?? undefined,
        gasBimonthly: profile.gasBimonthly ?? undefined,
        bankName: profile.bankName ?? undefined,
        accountType: profile.accountType ?? undefined,
        estimatedBankCost: profile.estimatedBankCost ?? undefined,
        hasInsurance: profile.hasInsurance ?? false,
        insuranceTypes: profile.insuranceTypes ?? [],
        travelFrequency: profile.travelFrequency ?? undefined,
        hasPets: profile.hasPets ?? false,
        medicalExpensesRange: profile.medicalExpensesRange ?? undefined,
        hasChildrenInSchool: profile.hasChildrenInSchool ?? false,
        hasChildrenInDaycare: profile.hasChildrenInDaycare ?? false,
        subscriptionCount: profile.subscriptionCount ?? undefined,
      }
    : undefined;

  // Merge: quiz defaults first, then profile values override (profile wins)
  const initialData =
    profileData || Object.keys(quizDefaults).length > 0
      ? { ...quizDefaults, ...(profileData ?? {}) }
      : undefined;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-[640px]">
        <OnboardingWizard
          initialData={initialData}
          currentStep={profile?.onboardingStep ?? 0}
        />
      </div>
    </div>
  );
}
