import Link from "next/link";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { BrandLogo } from "@/components/layout/brand-logo";

const NAV = [
  { href: "/operators", label: "Operadores" },
  { href: "/services", label: "Serviços" },
  { href: "/data-products", label: "Dados" },
  { href: "/coverage", label: "Cobertura" },
  { href: "/how-it-works", label: "Como funciona" },
  { href: "/pricing", label: "Preços" },
  { href: "/enterprise", label: "Enterprise" },
];

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogo size="md" tagline="Drone Data as a Service" />
        <nav className="hidden items-center gap-6 text-[14px] text-text-muted lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-text">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="btn-ghost hidden sm:inline-flex text-[14px]">
            Entrar
          </Link>
          <Link href="/sign-up" className="btn-primary text-[14px]">
            Criar conta
          </Link>
        </div>
      </div>
            <div className="ml-2"><LocaleSwitcher locale="pt-BR" /></div>
      </header>
  );
}
