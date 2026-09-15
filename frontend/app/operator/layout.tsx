import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { OperatorSidebarNav } from "@/components/operator/sidebar-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BannerSlot } from "@/components/ads/banner-slot";
import { NotificationBell } from "@/components/layout/notification-bell";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-bg">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-input bg-accent text-sm font-bold text-accent-ink">
            DH
          </div>
          <div className="min-w-0">
            <Link href="/operator" className="block truncate text-sm font-semibold text-text">
              Operator Hub
            </Link>
            <p className="truncate text-[11px] text-text-muted">Painel operacional</p>
          </div>
        </div>

        <OperatorSidebarNav />

        <div className="mt-auto border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-input bg-surface-soft p-2.5">
            <Avatar className="h-9 w-9">
              <AvatarFallback>OP</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">Sua empresa</p>
              <Badge variant="accent" className="mt-0.5">
                Verificado
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur md:px-6">
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="h-9 w-full rounded-input border border-border bg-surface-soft pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="Buscar jobs, missões…"
              disabled
              title="Busca na próxima iteração"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
            <Link
              href="/operators"
              className="hidden text-sm text-text-muted hover:text-text sm:inline"
            >
              Ver perfil público
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mb-6">
            <BannerSlot placement="app.dashboard_top" />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
