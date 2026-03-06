import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CompanyWizard } from "@/components/onboarding/company-wizard";

export const metadata: Metadata = {
  title: "Onboarding Azienda",
};

export default async function CompanyOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-[640px]">
        <CompanyWizard
          initialData={profile ? {
            companyName: profile.companyName ?? undefined,
            legalForm: profile.legalForm ?? undefined,
            atecoCode: profile.atecoCode ?? undefined,
            atecoDescription: profile.atecoDescription ?? undefined,
            region: profile.region ?? undefined,
            province: profile.province ?? undefined,
            foundedYear: profile.foundedYear ?? undefined,
            employeeCount: profile.employeeCount ?? undefined,
            revenueRange: profile.revenueRange ?? undefined,
            taxRegime: profile.taxRegime ?? undefined,
            hasAccountant: profile.hasAccountant ?? false,
            hasRequestedTaxCredits: profile.hasRequestedTaxCredits ?? false,
            investsInTraining: profile.investsInTraining ?? false,
            investsInRD: profile.investsInRD ?? false,
            boughtEquipmentRecently: profile.boughtEquipmentRecently ?? false,
            energyCostRange: profile.energyCostRange ?? undefined,
            gasCostRange: profile.gasCostRange ?? undefined,
            telecomCostRange: profile.telecomCostRange ?? undefined,
            hasCompanyVehicles: profile.hasCompanyVehicles ?? false,
            offersWelfare: profile.offersWelfare ?? false,
            hasApprentices: profile.hasApprentices ?? false,
            hiredRecently: profile.hiredRecently ?? false,
            hiredYouth: profile.hiredYouth ?? false,
            hiredWomen: profile.hiredWomen ?? false,
            hiredDisadvantaged: profile.hiredDisadvantaged ?? false,
          } : undefined}
        />
      </div>
    </div>
  );
}
