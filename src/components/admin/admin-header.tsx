"use client";

import { Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onMenuClick: () => void;
}

export function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-danger/10 text-accent-danger">
          Admin
        </span>
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
