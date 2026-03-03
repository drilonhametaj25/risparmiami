"use client";

import { Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    currentPlan: string;
  };
  onMenuClick: () => void;
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const planLabel = user.currentPlan === "azienda" ? "Azienda" : user.currentPlan === "personale" ? "Personale" : "Gratis";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-border-light px-6 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-text-secondary hover:text-text-primary"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <Badge variant={user.currentPlan === "free" ? "consiglio" : "certo"}>
          {planLabel}
        </Badge>
        <div className="text-sm text-text-secondary">
          {user.name || user.email}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-text-muted hover:text-text-primary transition-colors"
          title="Esci"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
