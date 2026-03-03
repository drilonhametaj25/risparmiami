"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Tv,
  Music,
  Cloud,
  Newspaper,
  Dumbbell,
  Gamepad2,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  subscriptions: Subscription[];
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const categories: Category[] = [
  {
    id: "video",
    label: "Streaming Video",
    icon: <Tv className="h-5 w-5" />,
    subscriptions: [
      { id: "netflix", name: "Netflix", monthlyCost: 15.49 },
      { id: "prime", name: "Amazon Prime Video", monthlyCost: 4.99 },
      { id: "disney", name: "Disney+", monthlyCost: 8.99 },
      { id: "dazn", name: "DAZN", monthlyCost: 34.99 },
      { id: "now", name: "NOW TV", monthlyCost: 14.99 },
      { id: "appletv", name: "Apple TV+", monthlyCost: 9.99 },
      { id: "paramount", name: "Paramount+", monthlyCost: 7.99 },
    ],
  },
  {
    id: "musica",
    label: "Streaming Musica",
    icon: <Music className="h-5 w-5" />,
    subscriptions: [
      { id: "spotify", name: "Spotify Premium", monthlyCost: 10.99 },
      { id: "apple_music", name: "Apple Music", monthlyCost: 10.99 },
      { id: "youtube_premium", name: "YouTube Premium", monthlyCost: 11.99 },
      { id: "amazon_music", name: "Amazon Music Unlimited", monthlyCost: 10.99 },
      { id: "tidal", name: "Tidal", monthlyCost: 10.99 },
    ],
  },
  {
    id: "software",
    label: "Software / Cloud",
    icon: <Cloud className="h-5 w-5" />,
    subscriptions: [
      { id: "icloud", name: "iCloud+ (50 GB)", monthlyCost: 0.99 },
      { id: "icloud200", name: "iCloud+ (200 GB)", monthlyCost: 2.99 },
      { id: "google_one", name: "Google One (100 GB)", monthlyCost: 1.99 },
      { id: "ms365", name: "Microsoft 365 Personal", monthlyCost: 7.0 },
      { id: "adobe", name: "Adobe Creative Cloud", monthlyCost: 62.99 },
      { id: "dropbox", name: "Dropbox Plus", monthlyCost: 11.99 },
      { id: "chatgpt", name: "ChatGPT Plus", monthlyCost: 20.0 },
    ],
  },
  {
    id: "news",
    label: "News / Riviste",
    icon: <Newspaper className="h-5 w-5" />,
    subscriptions: [
      { id: "corriere", name: "Corriere della Sera Digital", monthlyCost: 9.99 },
      { id: "repubblica", name: "la Repubblica", monthlyCost: 9.99 },
      { id: "sole24ore", name: "Il Sole 24 Ore", monthlyCost: 14.99 },
      { id: "internazionale", name: "Internazionale", monthlyCost: 7.99 },
    ],
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: <Dumbbell className="h-5 w-5" />,
    subscriptions: [
      { id: "palestra", name: "Abbonamento Palestra", monthlyCost: 40.0 },
      { id: "freeletics", name: "Freeletics", monthlyCost: 7.49 },
      { id: "strava", name: "Strava Premium", monthlyCost: 7.99 },
      { id: "peloton", name: "Peloton", monthlyCost: 12.99 },
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    icon: <Gamepad2 className="h-5 w-5" />,
    subscriptions: [
      { id: "ps_plus", name: "PlayStation Plus Essential", monthlyCost: 5.41 },
      { id: "ps_extra", name: "PlayStation Plus Extra", monthlyCost: 11.58 },
      { id: "xbox_core", name: "Xbox Game Pass Core", monthlyCost: 5.75 },
      { id: "xbox_ultimate", name: "Xbox Game Pass Ultimate", monthlyCost: 14.99 },
      { id: "nintendo", name: "Nintendo Switch Online", monthlyCost: 3.33 },
    ],
  },
  {
    id: "altro",
    label: "Altro",
    icon: <MoreHorizontal className="h-5 w-5" />,
    subscriptions: [
      { id: "vpn", name: "VPN (NordVPN / ExpressVPN)", monthlyCost: 4.99 },
      { id: "antivirus", name: "Antivirus Premium", monthlyCost: 3.99 },
      { id: "dating", name: "App di dating (Tinder / Bumble)", monthlyCost: 14.99 },
      { id: "box_mensile", name: "Box mensile (cibo / beauty)", monthlyCost: 25.0 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Category section                                                   */
/* ------------------------------------------------------------------ */

function CategorySection({
  category,
  checkedIds,
  onToggle,
}: {
  category: Category;
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const checkedCount = category.subscriptions.filter((s) => checkedIds.has(s.id)).length;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 bg-bg-secondary/50 hover:bg-bg-secondary transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-accent-primary">{category.icon}</span>
          <span className="font-heading text-base text-text-primary">{category.label}</span>
          {checkedCount > 0 && (
            <span className="bg-accent-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {checkedCount}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-text-secondary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-secondary" />
        )}
      </button>

      {/* Subscriptions */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border-light">
              {category.subscriptions.map((sub) => {
                const isChecked = checkedIds.has(sub.id);
                return (
                  <label
                    key={sub.id}
                    className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-colors ${
                      isChecked ? "bg-accent-primary/5" : "hover:bg-bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(sub.id)}
                        className="h-4 w-4 rounded border-border-light text-accent-primary focus:ring-accent-primary/20"
                      />
                      <span className="font-body text-text-primary text-sm">{sub.name}</span>
                    </div>
                    <span className="font-money text-sm text-text-secondary whitespace-nowrap">
                      {sub.monthlyCost.toFixed(2).replace(".", ",")}&nbsp;&euro;/mese
                    </span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ChecklistAbbonamentiClient() {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const allSubscriptions = useMemo(
    () => categories.flatMap((c) => c.subscriptions),
    []
  );

  const toggleSubscription = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const monthlyTotal = useMemo(() => {
    return allSubscriptions
      .filter((s) => checkedIds.has(s.id))
      .reduce((sum, s) => sum + s.monthlyCost, 0);
  }, [checkedIds, allSubscriptions]);

  const annualTotal = monthlyTotal * 12;
  const selectedCount = checkedIds.size;
  const isHigh = monthlyTotal > 100;

  return (
    <section className="bg-bg-primary py-16 md:py-24 min-h-[80vh]">
      <Container size="narrow">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl text-text-primary mb-3">
            Checklist Abbonamenti
          </h1>
          <p className="font-body text-text-secondary text-lg">
            Seleziona tutti i tuoi abbonamenti attivi e scopri quanto spendi ogni mese.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-4 mb-8">
          {categories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              checkedIds={checkedIds}
              onToggle={toggleSubscription}
            />
          ))}
        </div>

        {/* Running total (sticky on mobile) */}
        <div className="sticky bottom-4 z-10 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCount}
              initial={{ scale: 0.98, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                padding="md"
                className={`shadow-lg border-2 ${
                  isHigh ? "border-red-300 bg-red-50/80" : "border-accent-primary/20 bg-white/95"
                } backdrop-blur-sm`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-body text-sm text-text-secondary">
                      {selectedCount} {selectedCount === 1 ? "abbonamento selezionato" : "abbonamenti selezionati"}
                    </p>
                    <div className="flex items-baseline gap-4">
                      <div>
                        <span className="font-body text-xs text-text-secondary">Mensile: </span>
                        <span
                          className={`font-money text-2xl ${
                            isHigh ? "text-red-500" : "text-accent-primary"
                          }`}
                        >
                          {monthlyTotal.toFixed(2).replace(".", ",")}&nbsp;&euro;
                        </span>
                      </div>
                      <div>
                        <span className="font-body text-xs text-text-secondary">Annuale: </span>
                        <span
                          className={`font-money text-2xl ${
                            isHigh ? "text-red-500" : "text-accent-primary"
                          }`}
                        >
                          {annualTotal.toFixed(2).replace(".", ",")}&nbsp;&euro;
                        </span>
                      </div>
                    </div>
                  </div>
                  {isHigh && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="font-body text-sm font-medium">
                        Spendi pi&ugrave; di 100&nbsp;&euro;/mese!
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Summary & advice */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <Card padding="lg" className="mb-6">
                <h3 className="font-heading text-lg text-text-primary mb-4">
                  Riepilogo
                </h3>

                {/* Per-category summary */}
                <div className="space-y-3 mb-6">
                  {categories
                    .map((cat) => {
                      const catSubs = cat.subscriptions.filter((s) => checkedIds.has(s.id));
                      const catTotal = catSubs.reduce((sum, s) => sum + s.monthlyCost, 0);
                      return { ...cat, catSubs, catTotal };
                    })
                    .filter((c) => c.catTotal > 0)
                    .sort((a, b) => b.catTotal - a.catTotal)
                    .map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-accent-primary">{cat.icon}</span>
                          <span className="font-body text-sm text-text-primary">
                            {cat.label}{" "}
                            <span className="text-text-secondary">
                              ({cat.catSubs.length})
                            </span>
                          </span>
                        </div>
                        <span className="font-money text-sm text-text-primary">
                          {cat.catTotal.toFixed(2).replace(".", ",")}&nbsp;&euro;/mese
                        </span>
                      </div>
                    ))}
                </div>

                {/* Advice */}
                <div
                  className={`p-4 rounded-md ${
                    isHigh ? "bg-red-50 border border-red-200" : "bg-accent-success/5 border border-accent-success/20"
                  }`}
                >
                  {isHigh ? (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-heading text-base text-text-primary mb-1">
                          Attenzione: spesa elevata!
                        </p>
                        <p className="font-body text-sm text-text-secondary">
                          Stai spendendo oltre 100&nbsp;&euro; al mese in abbonamenti, pari a{" "}
                          <strong className="font-money">
                            {annualTotal.toFixed(2).replace(".", ",")}&nbsp;&euro;
                          </strong>{" "}
                          all&apos;anno. Ti consigliamo di rivedere i servizi che usi meno frequentemente
                          e valutare piani famiglia o bundle per risparmiare.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-heading text-base text-text-primary mb-1">
                          Spesa sotto controllo
                        </p>
                        <p className="font-body text-sm text-text-secondary">
                          I tuoi abbonamenti sono sotto i 100&nbsp;&euro;/mese. Verifica comunque
                          periodicamente se usi tutti i servizi attivi per evitare sprechi.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* CTA */}
              <Card padding="lg" className="text-center bg-bg-secondary">
                <h3 className="font-heading text-xl text-text-primary mb-2">
                  Vuoi ottimizzare le tue spese ricorrenti?
                </h3>
                <p className="font-body text-text-secondary mb-5">
                  Registrati per ricevere suggerimenti personalizzati su come ridurre
                  i costi degli abbonamenti e trovare alternative pi&ugrave; convenienti.
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
