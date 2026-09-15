import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/operators", label: "Operadores" },
  { href: "/admin/verifications", label: "Verificações" },
  { href: "/admin/missions", label: "Missões" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/disputes", label: "Disputas" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/risk", label: "Risco" },
  { href: "/admin/marketplace", label: "Marketplace" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/support", label: "Suporte" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:block">
        <div className="flex h-14 items-center border-b border-border px-4">
          <BrandLogo size="sm" href="/admin" tagline="Admin Console" />
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-input px-3 py-2 text-[14px] text-text-muted hover:bg-surface-soft hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
