"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListChecks,
  Receipt,
  Landmark,
  CreditCard,
  Train,
  FileText,
  Building2,
  Settings,
  Star,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPlan: string;
}

const navItems = [
  { label: "Panoramica", href: "/dashboard", icon: LayoutDashboard },
  { label: "Azioni", href: "/dashboard/azioni", icon: ListChecks },
  { label: "Detrazioni", href: "/dashboard/detrazioni", icon: Receipt },
  { label: "Bollette", href: "/dashboard/bollette", icon: FileText },
  { label: "Banca", href: "/dashboard/banca", icon: Landmark },
  { label: "Abbonamenti", href: "/dashboard/abbonamenti", icon: CreditCard },
  { label: "Trasporti", href: "/dashboard/trasporti", icon: Train },
  { label: "ISEE", href: "/dashboard/isee", icon: Star },
];

const bottomItems = [
  { label: "Abbonamento", href: "/dashboard/abbonamento", icon: CreditCard },
  { label: "Impostazioni", href: "/dashboard/impostazioni", icon: Settings },
];

export function Sidebar({ open, onClose, currentPlan }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white border-r border-border-light z-50 flex flex-col transition-transform duration-300",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-text-primary">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          // Hide incentivi for non-azienda plans
          if (item.href === "/dashboard/incentivi" && currentPlan !== "azienda") {
            return null;
          }
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
                isActive
                  ? "bg-accent-primary/10 text-accent-primary font-medium"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {currentPlan === "azienda" && (
          <Link
            href="/dashboard/incentivi"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
              pathname.startsWith("/dashboard/incentivi")
                ? "bg-accent-primary/10 text-accent-primary font-medium"
                : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
            )}
          >
            <Building2 className="h-4 w-4" />
            Incentivi Imprese
          </Link>
        )}
      </nav>

      <div className="border-t border-border-light px-3 py-4 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
                isActive
                  ? "bg-accent-primary/10 text-accent-primary font-medium"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
