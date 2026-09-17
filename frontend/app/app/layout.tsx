import Link from "next/link";
import { Bell, Menu, MessageSquare } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { EnterpriseSidebarNav } from "@/components/enterprise/enterprise-sidebar-nav";
import { EnterpriseAccountMenu } from "@/components/enterprise/enterprise-account-menu";

export default function CustomerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-[#f5f6f9] text-[#151821]">
      <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-[#e6e8ed] bg-white lg:flex">
        <div className="flex h-[76px] items-center border-b border-[#f0f1f4] px-5">
          <BrandLogo size="sm" href="/app" tagline="Enterprise" />
        </div>
        <EnterpriseSidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b border-[#e8eaee] bg-white/95 px-4 backdrop-blur lg:px-7">
          <div className="flex items-center gap-3 lg:hidden">
            <Menu className="h-5 w-5 text-[#414754]" />
            <BrandLogo size="sm" href="/app" tagline="Enterprise" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Notificações" className="rounded-md p-2 text-[#20242d] hover:bg-[#f2f3f5]">
              <Bell className="h-[18px] w-[18px] fill-current" />
            </button>
            <button aria-label="Mensagens" className="rounded-md p-2 text-[#20242d] hover:bg-[#f2f3f5]">
              <MessageSquare className="h-[18px] w-[18px] fill-current" />
            </button>
            <EnterpriseAccountMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#e6e8ed] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {[
          { href: "/app", label: "Início" },
          { href: "/app/missions", label: "Missões" },
          { href: "/app/orders", label: "Pedidos" },
          { href: "/app/enterprise", label: "Empresa" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center py-2 text-[11px] font-medium text-[#687080]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
