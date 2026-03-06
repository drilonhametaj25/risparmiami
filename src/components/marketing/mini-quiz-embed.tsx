"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/shared/section-wrapper";

const QUESTIONS = [
  {
    id: "employment",
    question: "Qual e la tua situazione lavorativa?",
    options: [
      { value: "dipendente", label: "Dipendente" },
      { value: "autonomo", label: "Autonomo / P.IVA" },
      { value: "disoccupato", label: "Disoccupato" },
      { value: "pensionato", label: "Pensionato" },
      { value: "studente", label: "Studente" },
    ],
  },
  {
    id: "housing",
    question: "Sei proprietario o affittuario?",
    options: [
      { value: "proprietario", label: "Proprietario" },
      { value: "affittuario", label: "Affittuario" },
    ],
  },
  {
    id: "children",
    question: "Hai figli?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "1 figlio" },
      { value: "2", label: "2 figli" },
      { value: "3+", label: "3 o piu" },
    ],
  },
];

function estimateSavings(answers: Record<string, string>): { min: number; max: number } {
  let min = 400;
  let max = 1200;

  if (answers.employment === "dipendente") { min += 200; max += 800; }
  if (answers.employment === "autonomo") { min += 500; max += 2000; }
  if (answers.housing === "affittuario") { min += 300; max += 1200; }
  if (answers.housing === "proprietario") { min += 100; max += 500; }
  if (answers.children && answers.children !== "0") {
    const kids = answers.children === "3+" ? 3 : parseInt(answers.children);
    min += kids * 200;
    max += kids * 800;
  }

  return { min, max };
}

function MiniQuizEmbed() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      setTimeout(() => setShowResult(true), 200);
    }
  }

  const result = estimateSavings(answers);

  // Persist quiz results to DB when results are shown
  const savedRef = useRef(false);

  useEffect(() => {
    if (!showResult || savedRef.current) return;
    savedRef.current = true;

    // Map mini-quiz keys to the full-quiz keys so onboarding pre-fill works
    const mappedAnswers: Record<string, string> = {};
    if (answers.employment) mappedAnswers.lavoro = answers.employment;
    if (answers.housing) {
      mappedAnswers.abitazione =
        answers.housing === "affittuario" ? "affitto" : "proprieta";
    }
    if (answers.children) mappedAnswers.figli = answers.children;

    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: mappedAnswers,
        estimatedMin: result.min,
        estimatedMax: result.max,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.sessionId) {
          document.cookie = `quiz_session=${data.sessionId}; path=/; max-age=3600`;
        }
      })
      .catch(() => {
        // Non-critical — silently ignore
      });
  }, [showResult, answers, result.min, result.max]);

  return (
    <SectionWrapper variant="muted">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-heading text-h1 text-text-primary">
            Prova ora &mdash; ci vogliono 2 minuti
          </h2>
          <p className="mt-2 text-body text-text-secondary">
            Rispondi a 3 domande e scopri subito quanto potresti risparmiare.
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i <= step ? "bg-accent-primary w-6" : "bg-border-light"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-center text-h3 font-heading text-text-primary mb-6">
                {QUESTIONS[step].question}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {QUESTIONS[step].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(QUESTIONS[step].id, option.value)}
                    className={cn(
                      "p-4 rounded-md border border-border-light bg-white text-center",
                      "hover:border-accent-primary hover:shadow-md transition-all duration-200",
                      "text-body text-text-primary font-medium",
                      answers[QUESTIONS[step].id] === option.value && "border-accent-primary bg-accent-primary/5"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-text-secondary mb-2">Il tuo risparmio potenziale stimato</p>
              <p className="text-4xl md:text-5xl font-mono font-bold text-accent-success">
                &euro;{result.min.toLocaleString("it-IT")} &mdash; &euro;{result.max.toLocaleString("it-IT")}
              </p>
              <p className="text-small text-text-muted mt-2">all&apos;anno</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild>
                  <Link href="/registrati" data-umami-event="quiz-complete">
                    Registrati per il report completo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/guida-pdf" data-umami-event="quiz-complete">Acquista la guida PDF</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}

export { MiniQuizEmbed };
