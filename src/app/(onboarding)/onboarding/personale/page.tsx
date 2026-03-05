import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // If already completed, redirect to dashboard
  if (session.user.onboardingCompleted) {
    redirect("/dashboard");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-[640px]">
        <OnboardingWizard
          initialData={profile ? {
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
          } : undefined}
          currentStep={profile?.onboardingStep ?? 0}
        />
      </div>
    </div>
  );
}
