import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/categories";
import { BrandLogo } from "@/components/layout/brand-logo";

const cols = {
  produto: [
    { href: "/how-it-works", label: "Como funciona" },
    { href: "/pricing", label: "Preços" },
    { href: "/enterprise", label: "Enterprise" },
    { href: "/coverage", label: "Cobertura" },
  ],
  marketplace: [
    { href: "/operators", label: "Operadores" },
    { href: "/services", label: "Serviços" },
    { href: "/data-products", label: "Produtos de dados" },
  ],
  recursos: [
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
    { href: "/glossary", label: "Glossário" },
    { href: "/customers", label: "Cases" },
    {
      href: "/compare/dronehub-vs-contratar-avulso",
      label: "DroneHub vs avulso",
    },
  ],
  empresa: [
    { href: "/contact", label: "Contato" },
    { href: "/legal/terms", label: "Termos" },
    { href: "/legal/privacy", label: "Privacidade" },
    { href: "/en", label: "English" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <BrandLogo size="md" tagline="Drone Data as a Service" />
            <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
              Marketplace e Mission OS para dados e serviços de drone no Brasil.
            </p>
          </div>
          {(
            [
              ["Produto", cols.produto],
              ["Marketplace", cols.marketplace],
              ["Recursos", cols.recursos],
              ["Empresa", cols.empresa],
            ] as const
          ).map(([title, links]) => (
            <div key={title}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                {title}
              </p>
              <ul className="mt-3 space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-text-muted hover:text-text hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-8">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
            Categorias
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {SERVICE_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="text-[13px] text-text-muted hover:text-text hover:underline"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] text-text-muted">
            GEO:{" "}
            <Link href="/locations/mt" className="underline hover:text-text">
              Mato Grosso
            </Link>
            {" · "}
            <Link href="/locations/ms" className="underline hover:text-text">
              Mato Grosso do Sul
            </Link>
            {" · "}
            <Link href="/locations/go" className="underline hover:text-text">
              Goiás
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-[12px] text-text-muted">
          © {new Date().getFullYear()} OEST · Drone Data as a Service · Brasil
        </p>
      </div>
    </footer>
  );
}
