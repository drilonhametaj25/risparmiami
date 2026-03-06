"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { saveOnboardingStep, completeOnboarding } from "@/app/(onboarding)/onboarding/actions";
import { StepAboutYou } from "./steps/step-1-about-you";
import { StepFamily } from "./steps/step-2-family";
import { StepWork } from "./steps/step-3-work";
import { StepHousing } from "./steps/step-4-housing";
import { StepExpenses } from "./steps/step-5-expenses";
import { StepLifestyle } from "./steps/step-6-lifestyle";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StepData = Record<string, any>;

const TOTAL_STEPS = 6;

const stepTitles = [
  "Chi sei",
  "Famiglia",
  "Lavoro e reddito",
  "Casa",
  "Spese fisse",
  "Stile di vita",
];

interface OnboardingWizardProps {
  initialData?: StepData;
  currentStep?: number;
}

export function OnboardingWizard({ initialData = {}, currentStep = 0 }: OnboardingWizardProps) {
  const [step, setStep] = useState(currentStep);
  const [data, setData] = useState<StepData>(initialData);
  const [isPending, startTransition] = useTransition();

  function handleNext(stepData: StepData) {
    const merged = { ...data, ...stepData };
    setData(merged);

    startTransition(async () => {
      await saveOnboardingStep(step, stepData);
      if (step < TOTAL_STEPS - 1) {
        setStep(step + 1);
      } else {
        await completeOnboarding();
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
          Passo {step + 1} di {TOTAL_STEPS}
        </p>
        <h2 className="font-heading text-2xl mt-1">{stepTitles[step]}</h2>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>Step {step + 1} di {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-2">
          <motion.div
            className="bg-accent-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && <StepAboutYou data={data} onNext={handleNext} />}
          {step === 1 && <StepFamily data={data} onNext={handleNext} onBack={handleBack} />}
          {step === 2 && <StepWork data={data} onNext={handleNext} onBack={handleBack} />}
          {step === 3 && <StepHousing data={data} onNext={handleNext} onBack={handleBack} />}
          {step === 4 && <StepExpenses data={data} onNext={handleNext} onBack={handleBack} />}
          {step === 5 && <StepLifestyle data={data} onNext={handleNext} onBack={handleBack} isPending={isPending} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
