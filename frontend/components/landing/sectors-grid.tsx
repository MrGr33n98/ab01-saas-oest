"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { getLocalizedSectors } from "@/lib/categories";

export function SectorsGrid() {
  const { t, locale } = useTranslations();
  const sectors = getLocalizedSectors(locale).filter((s) => s.slug !== "all");

  return (
    <section id="setores" className="bg-oest-ice/18 py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">
              {t("landing.sectorsSection.badge")}
            </p>
            <h2 className="mt-5 text-[40px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink sm:text-[52px]">
              {t("landing.sectorsSection.title")}
            </h2>
          </div>
          <p className="max-w-[440px] text-[16px] leading-relaxed text-oest-ink/65 lg:col-span-4 lg:col-start-8">
            {t("landing.sectorsSection.subtitle")}
          </p>
        </div>

        {/* 8 Clickable Sector Items */}
        <div className="mt-14 grid gap-x-8 border-t border-oest-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((sec, idx) => (
            <Link
              key={sec.slug}
              href={`/categories/${sec.slug}`}
              className="group block border-b border-oest-ink/15 py-6 transition-all hover:bg-black/[0.015] rounded-lg px-2 -mx-2 focus:outline-none focus:ring-2 focus:ring-oest-blue/30"
              title={`${sec.name}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.14em] text-oest-blue font-mono">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight className="h-4 w-4 text-oest-blue opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
              </div>

              <h3 className="mt-4 text-[21px] font-bold tracking-[-0.03em] text-oest-ink transition-colors group-hover:text-oest-blue">
                {sec.name}
              </h3>

              <p className="mt-3 max-w-[245px] text-[13px] leading-relaxed text-oest-ink/65 transition-colors group-hover:text-oest-ink/90">
                {sec.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-oest-blue opacity-0 group-hover:opacity-100 transition-opacity">
                {t("landing.sectorsSection.exploreSector")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
