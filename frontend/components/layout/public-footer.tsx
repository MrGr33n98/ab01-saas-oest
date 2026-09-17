"use client";

import Link from "next/link";
import { getLocalizedSectors } from "@/lib/categories";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useTranslations } from "@/lib/i18n/client";

export function PublicFooter() {
  const { t, locale } = useTranslations();
  const isEn = locale === "en";
  const categories = getLocalizedSectors(locale).filter((s) => s.slug !== "all");

  const cols = {
    produto: isEn
      ? [
          { href: "/how-it-works", label: "How it works" },
          { href: "/pricing", label: "Pricing" },
          { href: "/enterprise", label: "Enterprise" },
          { href: "/coverage", label: "Coverage" },
        ]
      : [
          { href: "/how-it-works", label: "Como funciona" },
          { href: "/pricing", label: "Preços" },
          { href: "/enterprise", label: "Enterprise" },
          { href: "/coverage", label: "Cobertura" },
        ],
    marketplace: isEn
      ? [
          { href: "/operators", label: "Operators" },
          { href: "/services", label: "Services" },
          { href: "/data-products", label: "Data products" },
        ]
      : [
          { href: "/operators", label: "Operadores" },
          { href: "/services", label: "Serviços" },
          { href: "/data-products", label: "Produtos de dados" },
        ],
    recursos: isEn
      ? [
          { href: "/blog", label: "Blog & Insights" },
          { href: "/faq", label: "FAQ" },
          { href: "/glossary", label: "Glossary" },
          { href: "/customers", label: "Case Studies" },
        ]
      : [
          { href: "/blog", label: "Blog" },
          { href: "/faq", label: "FAQ" },
          { href: "/glossary", label: "Glossário" },
          { href: "/customers", label: "Cases" },
        ],
    empresa: isEn
      ? [
          { href: "/contact", label: "Contact" },
          { href: "/legal/terms", label: "Terms" },
          { href: "/legal/privacy", label: "Privacy" },
        ]
      : [
          { href: "/contact", label: "Contato" },
          { href: "/legal/terms", label: "Termos" },
          { href: "/legal/privacy", label: "Privacidade" },
        ],
  };

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <BrandLogo size="md" tagline={t("brand.tagline")} />
            <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
              {isEn
                ? "Marketplace and Mission OS for drone services and geospatial reality data."
                : "Marketplace e Mission OS para dados e serviços de drone no Brasil."}
            </p>
          </div>
          {(
            [
              [isEn ? "Product" : "Produto", cols.produto],
              ["Marketplace", cols.marketplace],
              [isEn ? "Resources" : "Recursos", cols.recursos],
              [isEn ? "Company" : "Empresa", cols.empresa],
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
                      className="text-[13px] text-text-muted hover:text-text hover:underline transition-colors"
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
            {t("nav.categories")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="text-[13px] text-text-muted hover:text-text hover:underline transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-center text-[12px] text-text-muted">
          © {new Date().getFullYear()} OEST · {t("brand.tagline")} · Brasil
        </p>
      </div>
    </footer>
  );
}
