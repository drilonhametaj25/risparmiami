import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/shared/logo";

const FOOTER_LINKS = {
  prodotto: [
    { href: "/come-funziona", label: "Come funziona" },
    { href: "/prezzi", label: "Prezzi" },
    { href: "/tools/calcola-risparmio", label: "Dashboard" },
    { href: "/guida-pdf", label: "Guida PDF" },
  ],
  risorse: [
    { href: "/blog", label: "Blog" },
    { href: "/tools/calcola-risparmio", label: "Calcola Risparmio" },
    { href: "/tools/verifica-bonus", label: "Verifica Bonus" },
    { href: "/tools/confronta-bollette", label: "Confronta Bollette" },
    { href: "/tools/checklist-abbonamenti", label: "Checklist Abbonamenti" },
  ],
  legale: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/termini", label: "Termini di Servizio" },
    { href: "/cookie", label: "Cookie Policy" },
  ],
};

function Footer() {
  return (
    <footer className="bg-bg-dark text-white">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div>
              <Logo light size="lg" />
              <p className="mt-4 text-sm text-white/60 leading-relaxed">
                Scopri tutti i soldi che stai perdendo senza saperlo: detrazioni, bonus, bollette, abbonamenti.
              </p>
            </div>

            {/* Prodotto */}
            <div>
              <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
                Prodotto
              </h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.prodotto.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risorse */}
            <div>
              <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
                Risorse
              </h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.risorse.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legale */}
            <div>
              <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
                Legale
              </h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.legale.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              RisparmiaMi organizza informazioni pubbliche. Non sostituisce consulenza professionale.
            </p>
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} RisparmiaMi &mdash; P.IVA 07327360488
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
