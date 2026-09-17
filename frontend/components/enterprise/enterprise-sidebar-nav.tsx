"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  CircleHelp,
  CreditCard,
  FileText,
  Grid2X2,
  KeyRound,
  LifeBuoy,
  ReceiptText,
  Repeat2,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Grid2X2;
  exact?: boolean;
  children?: Array<{ href: string; label: string }>;
};

const MAIN: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: Grid2X2, exact: true },
  {
    href: "/app/orders",
    label: "Pedidos",
    icon: ShoppingCart,
    children: [
      { href: "/app/orders?status=pending_payment", label: "Aguardando confirmação" },
      { href: "/app/orders?status=paid", label: "Confirmados" },
      { href: "/app/orders?status=in_progress", label: "Em andamento" },
      { href: "/app/orders?status=completed", label: "Concluídos" },
    ],
  },
  { href: "/app/missions", label: "Missões", icon: Repeat2 },
];

const BUSINESS: NavItem[] = [
  { href: "/app/enterprise", label: "Empresa", icon: Building2 },
  { href: "/app/invoices", label: "Faturas", icon: ReceiptText },
  { href: "/app/api-keys", label: "Chaves de API", icon: KeyRound },
];

const SUPPORT: NavItem[] = [
  { href: "/app/support", label: "Contato e suporte", icon: LifeBuoy },
  { href: "/legal/terms", label: "Termos e condições", icon: FileText },
  { href: "/faq", label: "Central de ajuda", icon: CircleHelp },
];

function Section({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8d96b3]">
        {label}
      </p>
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const expanded = Boolean(item.children && (active || pathname.startsWith("/app/orders")));
        const Icon = item.icon;

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-md px-3 text-[14px] font-semibold transition-colors",
                active ? "bg-[#111111] text-white shadow-sm" : "text-[#171a22] hover:bg-[#f2f3f6]"
              )}
            >
              <Icon className="h-[17px] w-[17px] shrink-0 stroke-[1.8]" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.children && <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />}
            </Link>
            {item.children && expanded && (
              <div className="ml-8 mt-1 space-y-0.5 border-l border-[#e3e5eb] pl-3">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block rounded px-2 py-1.5 text-[13px] font-medium text-[#667085] hover:bg-[#f4f5f7] hover:text-[#171a22]"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function EnterpriseSidebarNav() {
  return (
    <nav className="flex flex-1 flex-col overflow-y-auto px-3 pb-5">
      <Section label="Principal" items={MAIN} />
      <Section label="Negócio" items={BUSINESS} />
      <Section label="Suporte" items={SUPPORT} />
    </nav>
  );
}
