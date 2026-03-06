"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { saveCompanyOnboardingStep, completeCompanyOnboarding } from "@/app/(onboarding)/onboarding/actions";
import { CompanyStepInfo } from "./company-steps/step-1-company-info";
import { CompanyStepSize } from "./company-steps/step-2-size";
import { CompanyStepTax } from "./company-steps/step-3-tax";
import { CompanyStepInvestments } from "./company-steps/step-4-investments";
import { CompanyStepStaff } from "./company-steps/step-5-staff";

type StepData = Record<string, any>;

const TOTAL_STEPS = 5;

const stepTitles = [
  "Info azienda",
  "Dimensione",
  "Fiscalità",
  "Investimenti e costi",
  "Personale",
];

interface CompanyWizardProps {
  initialData?: StepData;
  currentStep?: number;
}

export function CompanyWizard({ initialData = {}, currentStep = 0 }: CompanyWizardProps) {
  const [step, setStep] = useState(currentStep);
  const [data, setData] = useState<StepData>(initialData);
  const [isPending, startTransition] = useTransition();

  function handleNext(stepData: StepData) {
    const merged = { ...data, ...stepData };
    setData(merged);

    startTransition(async () => {
      await saveCompanyOnboardingStep(step, stepData);
      if (step < TOTAL_STEPS - 1) {
        setStep(step + 1);
      } else {
        await completeCompanyOnboarding();
      }
    });
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div>
      <div className="text-center mb-8">
        <Logo />
        <p className="text-text-muted text-sm mt-4">
          Profilo aziendale — Passo {step + 1} di {TOTAL_STEPS}
        </p>
        <h2 className="font-heading text-2xl mt-1">{stepTitles[step]}</h2>
      </div>

      <div className="w-full bg-bg-secondary rounded-full h-1.5 mb-8">
        <motion.div
          className="bg-accent-primary h-1.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && <CompanyStepInfo data={data} onNext={handleNext} />}
          {step === 1 && <CompanyStepSize data={data} onNext={handleNext} onBack={handleBack} />}
          {step === 2 && <CompanyStepTax data={data} onNext={handleNext} onBack={handleBack} />}
          {step === 3 && <CompanyStepInvestments data={data} onNext={handleNext} onBack={handleBack} />}
          {step === 4 && <CompanyStepStaff data={data} onNext={handleNext} onBack={handleBack} isPending={isPending} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
