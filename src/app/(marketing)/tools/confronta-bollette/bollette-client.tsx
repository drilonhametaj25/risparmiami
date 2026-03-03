"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Flame, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Zona = "nord" | "centro" | "sud";

interface RegionData {
  label: string;
  zona: Zona;
}

interface Averages {
  luce: { min: number; max: number };
  gas: { min: number; max: number };
}

interface ComparisonResult {
  luceAvg: number;
  gasAvg: number;
  luceDiff: number;
  gasDiff: number;
  luceAnnualSaving: number;
  gasAnnualSaving: number;
  totalAnnualSaving: number;
  tips: string[];
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const regions: Record<string, RegionData> = {
  piemonte: { label: "Piemonte", zona: "nord" },
  valle_aosta: { label: "Valle d'Aosta", zona: "nord" },
  lombardia: { label: "Lombardia", zona: "nord" },
  trentino: { label: "Trentino-Alto Adige", zona: "nord" },
  veneto: { label: "Veneto", zona: "nord" },
  friuli: { label: "Friuli Venezia Giulia", zona: "nord" },
  liguria: { label: "Liguria", zona: "nord" },
  emilia: { label: "Emilia-Romagna", zona: "nord" },
  toscana: { label: "Toscana", zona: "centro" },
  umbria: { label: "Umbria", zona: "centro" },
  marche: { label: "Marche", zona: "centro" },
  lazio: { label: "Lazio", zona: "centro" },
  abruzzo: { label: "Abruzzo", zona: "centro" },
  molise: { label: "Molise", zona: "centro" },
  campania: { label: "Campania", zona: "sud" },
  puglia: { label: "Puglia", zona: "sud" },
  basilicata: { label: "Basilicata", zona: "sud" },
  calabria: { label: "Calabria", zona: "sud" },
  sicilia: { label: "Sicilia", zona: "sud" },
  sardegna: { label: "Sardegna", zona: "sud" },
};

const averagesByZona: Record<Zona, Averages> = {
  nord: { luce: { min: 55, max: 65 }, gas: { min: 80, max: 100 } },
  centro: { luce: { min: 50, max: 60 }, gas: { min: 70, max: 90 } },
  sud: { luce: { min: 45, max: 55 }, gas: { min: 50, max: 70 } },
};

const sizeMultiplier: Record<string, number> = {
  monolocale: 0.6,
  bilocale: 0.8,
  trilocale: 1.0,
  quadrilocale: 1.3,
};

/* ------------------------------------------------------------------ */
/*  Calculation                                                        */
/* ------------------------------------------------------------------ */

function calculate(
  regione: string,
  luce: number,
  gas: number,
  tipo: string
): ComparisonResult {
  const zona = regions[regione].zona;
  const avg = averagesByZona[zona];
  const mult = sizeMultiplier[tipo];

  const luceAvg = Math.round(((avg.luce.min + avg.luce.max) / 2) * mult);
  const gasAvg = Math.round(((avg.gas.min + avg.gas.max) / 2) * mult);

  const luceDiff = luce - luceAvg;
  const gasDiff = gas - gasAvg;

  // 6 bimestri / anno
  const luceAnnualSaving = Math.max(0, luceDiff * 6);
  const gasAnnualSaving = Math.max(0, gasDiff * 6);
  const totalAnnualSaving = luceAnnualSaving + gasAnnualSaving;

  const tips: string[] = [];

  if (luceDiff > 15) {
    tips.push(
      "La tua spesa per la luce è significativamente sopra la media. Valuta di confrontare le offerte sul Portale Offerte ARERA."
    );
  }
  if (gasDiff > 20) {
    tips.push(
      "Spendi molto più della media per il gas. Controlla l'efficienza della caldaia e valuta un cambio fornitore."
    );
  }
  if (luceDiff > 0 || gasDiff > 0) {
    tips.push(
      "Verifica se hai diritto al Bonus Sociale energia elettrica e gas (ISEE sotto 9.530 € o 20.000 € con 4+ figli)."
    );
  }
  if (luceDiff <= 0 && gasDiff <= 0) {
    tips.push(
      "Le tue bollette sono nella media o sotto! Potresti comunque risparmiare con piccoli accorgimenti quotidiani."
    );
  }
  tips.push(
    "Considera la lettura regolare dei contatori per evitare bollette di conguaglio impreviste."
  );
  if (tipo === "quadrilocale") {
    tips.push(
      "Per abitazioni grandi, valuta l'installazione di un termostato smart per ridurre i consumi del 10-15%."
    );
  }

  return { luceAvg, gasAvg, luceDiff, gasDiff, luceAnnualSaving, gasAnnualSaving, totalAnnualSaving, tips };
}

/* ------------------------------------------------------------------ */
/*  Comparison bar                                                     */
/* ------------------------------------------------------------------ */

function ComparisonBar({
  label,
  icon,
  userValue,
  avgValue,
  unit,
}: {
  label: string;
  icon: React.ReactNode;
  userValue: number;
  avgValue: number;
  unit: string;
}) {
  const maxVal = Math.max(userValue, avgValue) * 1.2;
  const userPct = Math.min((userValue / maxVal) * 100, 100);
  const avgPct = Math.min((avgValue / maxVal) * 100, 100);
  const isAbove = userValue > avgValue;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="font-heading text-base text-text-primary">{label}</span>
      </div>

      {/* User bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-body text-text-secondary">Tu</span>
          <span className={`font-money ${isAbove ? "text-red-500" : "text-accent-success"}`}>
            {userValue}&nbsp;{unit}
          </span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-4 overflow-hidden">
          <motion.div
            className={`h-4 rounded-full ${isAbove ? "bg-red-400" : "bg-accent-success"}`}
            initial={{ width: 0 }}
            animate={{ width: `${userPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Average bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-body text-text-secondary">Media regionale</span>
          <span className="font-money text-text-secondary">
            {avgValue}&nbsp;{unit}
          </span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-4 rounded-full bg-accent-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${avgPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ConfrontaBolletteClient() {
  const [regione, setRegione] = useState("lombardia");
  const [luce, setLuce] = useState("");
  const [gas, setGas] = useState("");
  const [tipo, setTipo] = useState("trilocale");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ luce?: string; gas?: string }>({});

  const result = useMemo(() => {
    if (!submitted) return null;
    const luceNum = parseFloat(luce);
    const gasNum = parseFloat(gas);
    if (isNaN(luceNum) || isNaN(gasNum)) return null;
    return calculate(regione, luceNum, gasNum, tipo);
  }, [submitted, regione, luce, gas, tipo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { luce?: string; gas?: string } = {};
    if (!luce || isNaN(parseFloat(luce)) || parseFloat(luce) < 0) {
      newErrors.luce = "Inserisci un importo valido";
    }
    if (!gas || isNaN(parseFloat(gas)) || parseFloat(gas) < 0) {
      newErrors.gas = "Inserisci un importo valido";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
    }
  };

  const handleChange = () => {
    setSubmitted(false);
    setErrors({});
  };

  return (
    <section className="bg-bg-primary py-16 md:py-24 min-h-[80vh]">
      <Container size="narrow">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl text-text-primary mb-3">
            Confronta le tue Bollette
          </h1>
          <p className="font-body text-text-secondary text-lg">
            Scopri se stai pagando pi&ugrave; della media nella tua regione e quanto potresti risparmiare.
          </p>
        </div>

        {/* Form */}
        <Card padding="lg" className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Region */}
            <div className="w-full">
              <label className="block text-sm font-medium text-text-primary mb-1.5 font-body">
                Regione
              </label>
              <select
                value={regione}
                onChange={(e) => {
                  setRegione(e.target.value);
                  handleChange();
                }}
                className="w-full px-4 py-2.5 rounded-sm border border-border-light bg-white text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-colors duration-200 font-body"
              >
                {Object.entries(regions).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Luce */}
              <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-1.5 font-body">
                  Spesa bimestrale luce (&euro;)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="es. 75"
                  value={luce}
                  onChange={(e) => {
                    setLuce(e.target.value);
                    handleChange();
                  }}
                  className={`w-full px-4 py-2.5 rounded-sm border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-colors duration-200 font-body ${
                    errors.luce
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                      : "border-border-light focus:border-accent-primary focus:ring-accent-primary/20"
                  }`}
                />
                {errors.luce && (
                  <p className="mt-1 text-sm text-red-500 font-body">{errors.luce}</p>
                )}
              </div>

              {/* Gas */}
              <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-1.5 font-body">
                  Spesa bimestrale gas (&euro;)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="es. 120"
                  value={gas}
                  onChange={(e) => {
                    setGas(e.target.value);
                    handleChange();
                  }}
                  className={`w-full px-4 py-2.5 rounded-sm border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-colors duration-200 font-body ${
                    errors.gas
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                      : "border-border-light focus:border-accent-primary focus:ring-accent-primary/20"
                  }`}
                />
                {errors.gas && (
                  <p className="mt-1 text-sm text-red-500 font-body">{errors.gas}</p>
                )}
              </div>
            </div>

            {/* Tipo abitazione */}
            <div className="w-full">
              <label className="block text-sm font-medium text-text-primary mb-1.5 font-body">
                Tipo abitazione
              </label>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  handleChange();
                }}
                className="w-full px-4 py-2.5 rounded-sm border border-border-light bg-white text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-colors duration-200 font-body"
              >
                <option value="monolocale">Monolocale</option>
                <option value="bilocale">Bilocale</option>
                <option value="trilocale">Trilocale</option>
                <option value="quadrilocale">Quadrilocale+</option>
              </select>
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Zap className="mr-2 h-4 w-4" />
                Confronta ora
              </Button>
            </div>
          </form>
        </Card>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="bollette-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Comparison bars */}
              <Card padding="lg" className="mb-6">
                <ComparisonBar
                  label="Bolletta Luce"
                  icon={<Zap className="h-5 w-5 text-yellow-500" />}
                  userValue={parseFloat(luce)}
                  avgValue={result.luceAvg}
                  unit="€/bim."
                />
                <ComparisonBar
                  label="Bolletta Gas"
                  icon={<Flame className="h-5 w-5 text-orange-500" />}
                  userValue={parseFloat(gas)}
                  avgValue={result.gasAvg}
                  unit="€/bim."
                />
              </Card>

              {/* Savings summary */}
              {result.totalAnnualSaving > 0 ? (
                <Card padding="lg" className="mb-6 border-accent-success/30">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingDown className="h-6 w-6 text-accent-success" />
                    <h3 className="font-heading text-xl text-text-primary">
                      Potresti risparmiare
                    </h3>
                  </div>
                  <p className="font-money text-3xl text-accent-success mb-2">
                    circa {result.totalAnnualSaving.toLocaleString("it-IT")}&nbsp;&euro;/anno
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm font-body text-text-secondary">
                    {result.luceAnnualSaving > 0 && (
                      <span>
                        Luce: {result.luceAnnualSaving.toLocaleString("it-IT")}&nbsp;&euro;/anno
                      </span>
                    )}
                    {result.gasAnnualSaving > 0 && (
                      <span>
                        Gas: {result.gasAnnualSaving.toLocaleString("it-IT")}&nbsp;&euro;/anno
                      </span>
                    )}
                  </div>
                </Card>
              ) : (
                <Card padding="lg" className="mb-6 border-accent-success/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-accent-success" />
                    <div>
                      <h3 className="font-heading text-lg text-text-primary">
                        Ottimo! Sei nella media o sotto
                      </h3>
                      <p className="font-body text-sm text-text-secondary">
                        Le tue bollette sono in linea con la media regionale per il tuo tipo di abitazione.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Tips */}
              <Card padding="lg" className="mb-8">
                <h3 className="font-heading text-lg text-text-primary mb-4">
                  Consigli per risparmiare
                </h3>
                <ul className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <AlertTriangle className="h-4 w-4 text-accent-primary flex-shrink-0 mt-0.5" />
                      <span className="font-body text-sm text-text-secondary">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>

              {/* CTA */}
              <Card padding="lg" className="text-center bg-bg-secondary">
                <h3 className="font-heading text-xl text-text-primary mb-2">
                  Vuoi un&apos;analisi dettagliata delle tue bollette?
                </h3>
                <p className="font-body text-text-secondary mb-5">
                  Registrati per ricevere confronti personalizzati e suggerimenti su
                  come ridurre le tue spese energetiche.
                </p>
                <Link href="/registrati">
                  <Button size="lg">
                    Registrati gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
