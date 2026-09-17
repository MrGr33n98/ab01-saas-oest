"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useTranslations } from "@/lib/i18n/client";

export function LandingFooter() {
  const { t, locale } = useTranslations();
  const isEn = locale === "en";

  const columns = isEn
    ? [
        ["Product", [["Platform", "#plataforma"], ["Sectors & Solutions", "#setores"], ["Data & GIS APIs", "#integracoes"], ["Coverage", "#cobertura"]]],
        ["Company", [["About", "/enterprise"], ["Blog & Insights", "/blog"], ["Contact", "/contact"], ["Careers", "/careers"]]],
        ["Operators", [["Join the Network", "/sign-up?role=operator"], ["Available Missions", "/operator/jobs"], ["Help Center", "/contact"], ["Login", "/sign-in"]]],
      ]
    : [
        ["Produto", [["Plataforma", "#plataforma"], ["Soluções", "#setores"], ["Integrações", "#integracoes"], ["Cobertura", "#cobertura"]]],
        ["Empresa", [["Sobre", "/enterprise"], ["Conteúdo", "/blog"], ["Contato", "/contact"], ["Carreiras", "/careers"]]],
        ["Operadores", [["Entrar para a rede", "/sign-up?role=operator"], ["Missões", "/operator/jobs"], ["Ajuda", "/contact"], ["Login", "/sign-in"]]],
      ];

  return (
    <footer className="bg-oest-ink pb-8 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <BrandLogo variant="dark" size="lg" tagline={t("brand.tagline")} />
            <p className="mt-5 max-w-[310px] text-[13px] leading-relaxed text-white/55">
              {isEn
                ? "The complete infrastructure to request, operate, and integrate physical world data."
                : "Infraestrutura para solicitar, operar e integrar dados do mundo físico."}
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {columns.map(([name, links]) => (
              <div key={name as string}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-oest-ice">
                  {name as string}
                </p>
                <ul className="mt-5 space-y-3">
                  {(links as string[][]).map(([label, href]) => (
                    <li key={label}>
                      <Link
                        className="text-[13px] text-white/60 transition-colors hover:text-white"
                        href={href}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} OEST. {t("footer.rights")}</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <a href="https://www.linkedin.com" rel="noreferrer" target="_blank" className="hover:text-white transition-colors">
              LinkedIn
            </a>
            <a href="https://www.instagram.com" rel="noreferrer" target="_blank" className="hover:text-white transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
