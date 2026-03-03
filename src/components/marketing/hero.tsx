"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="relative"
    >
      <div className="bg-white rounded-lg shadow-lg border border-border-light p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Risparmio potenziale</p>
            <p className="text-2xl font-mono font-bold text-accent-success">€2.847</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent-success/10 flex items-center justify-center">
            <span className="text-accent-success text-lg">↑</span>
          </div>
        </div>
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>Recuperato</span>
            <span className="font-mono">€340</span>
          </div>
          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "12%" }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              className="h-full bg-accent-success rounded-full"
            />
          </div>
        </div>
        {/* Action items */}
        <div className="space-y-2">
          {[
            { label: "Detrazione affitto giovani", amount: "€1.200", badge: "certo", color: "bg-accent-success" },
            { label: "Bonus mobili", amount: "€340", badge: "certo", color: "bg-accent-success" },
            { label: "Bolletta luce sopra media", amount: "€180", badge: "probabile", color: "bg-accent-warning" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.15 }}
              className="flex items-center justify-between py-2 px-3 rounded-sm bg-bg-primary"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs text-text-primary">{item.label}</span>
              </div>
              <span className="text-xs font-mono font-medium text-accent-success">{item.amount}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-bg-dark overflow-hidden">
      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Container className="relative z-10 py-32 md:py-40">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-4xl md:text-5xl lg:text-display text-white leading-tight"
            >
              Scopri quanto stai perdendo ogni anno.{" "}
              <span className="text-white/50">Senza saperlo.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-lg text-white/60 max-w-xl leading-relaxed"
            >
              Detrazioni non sfruttate, bonus mai richiesti, bollette troppo care, abbonamenti dimenticati. Gli italiani perdono in media{" "}
              <span className="text-white font-mono">€2.000-3.000</span>/anno.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" asChild>
                <Link href="/tools/calcola-risparmio">
                  Calcola il tuo risparmio
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <a
                href="#come-funziona"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium py-3"
              >
                Scopri come funziona
                <ArrowDown className="h-4 w-4" />
              </a>
            </motion.div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}

export { Hero };
