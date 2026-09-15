import Link from "next/link";
import { NotificationBell } from "@/components/layout/notification-bell";
import { BrandLogo } from "@/components/layout/brand-logo";

const nav = [
  { href: "/app", label: "Início" },
  { href: "/app/projects", label: "Projetos" },
  { href: "/app/missions", label: "Missões" },
  { href: "/app/orders", label: "Pedidos" },
  { href: "/app/data-library", label: "Biblioteca" },
  { href: "/app/team", label: "Equipe" },
  { href: "/app/billing", label: "Billing" },
  { href: "/app/settings", label: "Configurações" },
];

export default function CustomerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:block">
        <div className="flex h-14 items-center border-b border-border px-4">
          <BrandLogo size="sm" href="/app" tagline="Drone Data" />
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {nav.map((item) => (
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
          <div className="md:hidden">
            <BrandLogo size="sm" href="/app" tagline="Drone Data" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <span className="text-[13px] text-text-muted">Org ativa</span>
            <div className="h-8 w-8 rounded-full bg-surface-soft border border-border" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>

      {/* PWA bottom nav — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {[
          { href: "/app", label: "Home" },
          { href: "/app/missions", label: "Missões" },
          { href: "/app/data-library", label: "Dados" },
          { href: "/app/settings", label: "Perfil" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center py-2 text-[11px] text-text-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
