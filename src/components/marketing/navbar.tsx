"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/come-funziona", label: "Come funziona" },
  { href: "/prezzi", label: "Prezzi" },
  { href: "/blog", label: "Blog" },
  { href: "/tools/calcola-risparmio", label: "Strumenti Gratuiti" },
];

function Navbar() {
  const pathname = usePathname();
  const hasDarkHero = pathname === "/";
  const [scrolled, setScrolled] = useState(!hasDarkHero);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hasDarkHero) {
      setScrolled(true);
      return;
    }
    const handler = () => setScrolled(window.scrollY > 80);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [hasDarkHero]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-border-light shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-content mx-auto px-6 md:px-20 lg:px-[120px]">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Logo light={!scrolled} />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    scrolled
                      ? "text-text-secondary hover:text-text-primary"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  scrolled
                    ? "text-text-secondary hover:text-text-primary"
                    : "text-white/80 hover:text-white"
                )}
              >
                Accedi
              </Link>
              <Button size="sm" asChild>
                <Link href="/tools/calcola-risparmio">Prova Gratis</Link>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "lg:hidden p-2 rounded-sm transition-colors",
                scrolled ? "text-text-primary" : "text-white"
              )}
              aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-lg lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-border-light">
                  <Logo size="sm" />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 text-text-secondary"
                    aria-label="Chiudi menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex-1 p-6 space-y-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-body text-text-primary hover:text-accent-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-6 border-t border-border-light space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center py-2.5 text-sm text-text-secondary hover:text-text-primary"
                  >
                    Accedi
                  </Link>
                  <Button className="w-full" asChild>
                    <Link href="/tools/calcola-risparmio" onClick={() => setMobileOpen(false)}>
                      Prova Gratis
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export { Navbar };
