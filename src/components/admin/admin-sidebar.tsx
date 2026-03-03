"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  CreditCard,
  Settings,
  ArrowLeft,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Utenti", href: "/admin/utenti", icon: Users },
  { label: "Regole", href: "/admin/regole", icon: BookOpen },
  { label: "PDF", href: "/admin/pdf", icon: FileText },
  { label: "Abbonamenti", href: "/admin/abbonamenti", icon: CreditCard },
  { label: "Impostazioni", href: "/admin/impostazioni", icon: Settings },
];

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
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
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Logo />
          </Link>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-danger/10 text-accent-danger">
            ADMIN
          </span>
        </div>
        <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-text-primary">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
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
      </nav>

      <div className="border-t border-border-light px-3 py-4">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla Dashboard
        </Link>
      </div>
    </aside>
  );
}
