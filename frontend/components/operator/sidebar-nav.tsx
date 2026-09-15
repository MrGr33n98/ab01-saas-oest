"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Plane,
  Users,
  Wrench,
  Map,
  ShieldCheck,
  BarChart3,
  Wallet,
  Settings,
  Crosshair,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/operator", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/operator/jobs", label: "Jobs abertos", icon: Briefcase },
  { href: "/operator/proposals", label: "Propostas", icon: FileText },
  { href: "/operator/missions", label: "Missões ativas", icon: Crosshair },
  { href: "/operator/fleet", label: "Frota", icon: Plane },
  { href: "/operator/pilots", label: "Pilotos", icon: Users },
  { href: "/operator/services", label: "Serviços", icon: Wrench },
  { href: "/operator/coverage", label: "Cobertura", icon: Map },
  { href: "/operator/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/operator/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/operator/payments", label: "Pagamentos", icon: Wallet },
  { href: "/operator/settings", label: "Configurações", icon: Settings },
];

export function OperatorSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-input px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-ink shadow-sm"
                : "text-text-muted hover:bg-surface-soft hover:text-text"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-accent-ink" : "text-text-muted group-hover:text-text"
              )}
            />
            <span className="flex-1 truncate">{item.label}</span>
            {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
          </Link>
        );
      })}
    </nav>
  );
}
