"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, TrendingUp, Briefcase, Home, Users, Zap, Share2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Question {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SavingsBreakdown {
  category: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const questions: Question[] = [
  {
    id: "lavoro",
    label: "Qual è la tua situazione lavorativa?",
    options: [
      { value: "dipendente", label: "Dipendente" },
      { value: "autonomo", label: "Autonomo" },
      { value: "pensionato", label: "Pensionato" },
      { value: "disoccupato", label: "Disoccupato" },
    ],
  },
  {
    id: "reddito",
    label: "Qual è il tuo reddito annuo lordo?",
    options: [
      { value: "under15", label: "Meno di 15.000 €" },
      { value: "15_28", label: "15.000 – 28.000 €" },
      { value: "28_50", label: "28.000 – 50.000 €" },
      { value: "50_75", label: "50.000 – 75.000 €" },
      { value: "over75", label: "Oltre 75.000 €" },
    ],
  },
  {
    id: "figli",
    label: "Quanti figli hai?",
    options: [
      { value: "0", label: "0" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3+", label: "3 o più" },
    ],
  },
  {
    id: "abitazione",
    label: "Sei proprietario o in affitto?",
    options: [
      { value: "mutuo", label: "Proprietario con mutuo" },
      { value: "proprieta", label: "Proprietario senza mutuo" },
      { value: "affitto", label: "In affitto" },
      { value: "altro", label: "Altro" },
    ],
  },
  {
    id: "bollette",
    label: "Quanto spendi di bollette al bimestre?",
    options: [
      { value: "under100", label: "Meno di 100 €" },
      { value: "100_200", label: "100 – 200 €" },
      { value: "200_350", label: "200 – 350 €" },
      { value: "over350", label: "Oltre 350 €" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Calculation logic                                                  */
/* ------------------------------------------------------------------ */

function calculateSavings(answers: Record<string, string>): SavingsBreakdown[] {
  const breakdown: SavingsBreakdown[] = [];

  // Base savings
  breakdown.push({
    category: "Ottimizzazione base",
    icon: <TrendingUp className="h-5 w-5" />,
    min: 500,
    max: 800,
    description: "Detrazioni standard e ottimizzazioni fiscali di base accessibili a tutti.",
  });

  // Employment
  const lavoro = answers.lavoro;
  if (lavoro === "dipendente") {
    breakdown.push({
      category: "Detrazioni lavoro dipendente",
      icon: <Briefcase className="h-5 w-5" />,
      min: 300,
      max: 600,
      description: "Detrazioni per reddito da lavoro dipendente e spese professionali.",
    });
  } else if (lavoro === "autonomo") {
    breakdown.push({
      category: "Deduzioni lavoro autonomo",
      icon: <Briefcase className="h-5 w-5" />,
      min: 400,
      max: 800,
      description: "Deduzioni per contributi, spese professionali e regime forfettario.",
    });
  } else if (lavoro === "pensionato") {
    breakdown.push({
      category: "Agevolazioni pensionati",
      icon: <Briefcase className="h-5 w-5" />,
      min: 200,
      max: 400,
      description: "Detrazioni pensione, esenzioni e agevolazioni dedicate.",
    });
  }

  // Income bonus
  const reddito = answers.reddito;
  if (["28_50", "50_75", "over75"].includes(reddito)) {
    breakdown.push({
      category: "Detrazioni per reddito",
      icon: <TrendingUp className="h-5 w-5" />,
      min: 200,
      max: 500,
      description:
        "Maggiori possibilità di detrazione per spese sanitarie, istruzione, previdenza e assicurazioni.",
    });
  }

  // Children
  const figli = answers.figli;
  const numFigli = figli === "3+" ? 3 : parseInt(figli, 10);
  if (numFigli > 0) {
    breakdown.push({
      category: `Agevolazioni figli (${numFigli === 3 ? "3+" : numFigli})`,
      icon: <Users className="h-5 w-5" />,
      min: 400 * numFigli,
      max: 800 * numFigli,
      description:
        "Assegno Unico, detrazioni per figli a carico, bonus asilo nido e spese scolastiche.",
    });
  }

  // Housing
  const abitazione = answers.abitazione;
  if (abitazione === "mutuo") {
    breakdown.push({
      category: "Detrazione interessi mutuo",
      icon: <Home className="h-5 w-5" />,
      min: 300,
      max: 600,
      description:
        "Detrazione del 19% sugli interessi passivi del mutuo fino a 4.000 €.",
    });
  } else if (abitazione === "affitto") {
    breakdown.push({
      category: "Detrazione canone affitto",
      icon: <Home className="h-5 w-5" />,
      min: 200,
      max: 500,
      description: "Detrazione per inquilini a basso reddito o trasferiti per lavoro.",
    });
  }

  // Bills
  const bollette = answers.bollette;
  if (bollette === "200_350") {
    breakdown.push({
      category: "Ottimizzazione bollette",
      icon: <Zap className="h-5 w-5" />,
      min: 100,
      max: 300,
      description: "Cambio fornitore, bonus energia e revisione contratti.",
    });
  } else if (bollette === "over350") {
    breakdown.push({
      category: "Ottimizzazione bollette",
      icon: <Zap className="h-5 w-5" />,
      min: 200,
      max: 500,
      description:
        "Risparmio significativo con cambio fornitore, bonus sociale e riduzione consumi.",
    });
  }

  return breakdown;
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span className="font-money">
      {value.toLocaleString("it-IT")} €
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "quiz-risparmio";

function loadQuizState(): { step: number; answers: Record<string, string>; showResults: boolean } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveQuizState(step: number, answers: Record<string, string>, showResults: boolean) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers, showResults }));
  } catch { /* ignore quota errors */ }
}

export function CalcolaRisparmioQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const saved = loadQuizState();
    if (saved) {
      setStep(saved.step);
      setAnswers(saved.answers);
      setShowResults(saved.showResults);
    }
    setHydrated(true);
  }, []);

  // Persist state to sessionStorage on change
  useEffect(() => {
    if (hydrated) {
      saveQuizState(step, answers, showResults);
    }
  }, [step, answers, showResults, hydrated]);

  // Persist quiz results to DB when results are shown
  const savedRef = useRef(false);

  useEffect(() => {
    if (!showResults || savedRef.current) return;
    savedRef.current = true;

    const breakdown = calculateSavings(answers);
    const totalMin = breakdown.reduce((s, b) => s + b.min, 0);
    const totalMax = breakdown.reduce((s, b) => s + b.max, 0);

    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        estimatedMin: totalMin,
        estimatedMax: totalMax,
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
  }, [showResults, answers]);

  const currentQuestion = questions[step];
  const progress = ((step + (showResults ? 1 : 0)) / questions.length) * 100;

  const handleAnswer = useCallback(
    (value: string) => {
      const updated = { ...answers, [currentQuestion.id]: value };
      setAnswers(updated);

      if (step < questions.length - 1) {
        setStep((s) => s + 1);
      } else {
        setShowResults(true);
      }
    },
    [answers, currentQuestion, step]
  );

  const goBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
    } else if (step > 0) {
      setStep((s) => s - 1);
    }
  }, [showResults, step]);

  const reset = useCallback(() => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
    savedRef.current = false;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const breakdown = showResults ? calculateSavings(answers) : [];
  const totalMin = breakdown.reduce((s, b) => s + b.min, 0);
  const totalMax = breakdown.reduce((s, b) => s + b.max, 0);

  const handleShareQuiz = useCallback(() => {
    const text = `Ho scoperto che potrei risparmiare ${totalMin.toLocaleString("it-IT")}–${totalMax.toLocaleString("it-IT")} € all'anno! Calcola anche tu il tuo risparmio con RisparmiaMi`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "Il mio risparmio — RisparmiaMi",
        text,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}: ${url}`).then(() => {
        alert("Link copiato negli appunti!");
      }).catch(() => {});
    }
  }, [totalMin, totalMax]);

  return (
    <section className="bg-bg-primary py-16 md:py-24 min-h-[80vh]">
      <Container size="narrow">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl text-text-primary mb-3">
            Calcola il tuo Risparmio
          </h1>
          <p className="font-body text-text-secondary text-lg">
            Rispondi a 5 domande e scopri quanto potresti risparmiare ogni anno.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-bg-secondary rounded-full h-2 mb-8">
          <motion.div
            className="bg-accent-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            /* ---- Question step ---- */
            <motion.div
              key={`question-${step}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <Card padding="lg">
                <p className="text-sm text-text-secondary font-body mb-2">
                  Domanda {step + 1} di {questions.length}
                </p>
                <h2 className="font-heading text-xl md:text-2xl text-text-primary mb-6">
                  {currentQuestion.label}
                </h2>

                <div className="grid gap-3">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className={`w-full text-left px-5 py-4 rounded-md border font-body transition-all duration-200 ${
                        answers[currentQuestion.id] === opt.value
                          ? "border-accent-primary bg-accent-primary/5 text-accent-primary"
                          : "border-border-light bg-white text-text-primary hover:border-accent-primary/40 hover:bg-bg-secondary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {step > 0 && (
                  <button
                    onClick={goBack}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors font-body"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Indietro
                  </button>
                )}
              </Card>
            </motion.div>
          ) : (
            /* ---- Results ---- */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Total */}
              <Card padding="lg" className="text-center mb-8">
                <p className="font-body text-text-secondary mb-2">
                  Il tuo risparmio annuo stimato
                </p>
                <div className="text-4xl md:text-5xl font-heading text-accent-success mb-1">
                  <AnimatedCounter target={totalMin} /> &ndash;{" "}
                  <AnimatedCounter target={totalMax} />
                </div>
                <p className="text-sm text-text-secondary font-body mt-2">
                  Stima indicativa basata sulle tue risposte
                </p>
              </Card>

              {/* Breakdown */}
              <div className="grid gap-4 mb-8">
                {breakdown.map((item, i) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 * i, duration: 0.4 }}
                  >
                    <Card hover>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-heading text-base text-text-primary">
                              {item.category}
                            </h3>
                            <span className="font-money text-accent-success whitespace-nowrap">
                              {item.min.toLocaleString("it-IT")}&ndash;
                              {item.max.toLocaleString("it-IT")}&nbsp;&euro;
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary font-body">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Card padding="lg" className="text-center bg-bg-secondary">
                <h3 className="font-heading text-xl text-text-primary mb-2">
                  Vuoi un&apos;analisi completa e personalizzata?
                </h3>
                <p className="font-body text-text-secondary mb-5">
                  Registrati gratis per scoprire tutti i bonus, le detrazioni e le
                  ottimizzazioni a cui hai diritto.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/registrati">
                    <Button size="lg">
                      Registrati gratis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <button
                    onClick={handleShareQuiz}
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors font-body"
                  >
                    <Share2 className="h-4 w-4" />
                    Condividi il risultato
                  </button>
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors font-body"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Ripeti il quiz
                  </button>
                </div>
              </Card>

              {/* Back link */}
              <button
                onClick={goBack}
                className="mt-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors font-body"
              >
                <ArrowLeft className="h-4 w-4" />
                Modifica le risposte
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
