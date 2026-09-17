"use client";

import Link from "next/link";
import {
  LayoutGrid,
  Zap,
  Building2,
  HardHat,
  Mountain,
  Sprout,
  Home,
  ShieldCheck,
  Trees,
  Headphones,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";
import type { CategorySidebarItem } from "@/lib/categories";
import { getLocalizedSectors } from "@/lib/categories";
import { useTranslations } from "@/lib/i18n/client";
import { BannerSlot } from "@/components/ads/banner-slot";

const ICONS: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid,
  "zap": Zap,
  "building-2": Building2,
  "hard-hat": HardHat,
  "mountain": Mountain,
  "sprout": Sprout,
  "home": Home,
  "shield-check": ShieldCheck,
  "trees": Trees,
};

export function CategorySidebar({
  items: _initialItems,
  activeSlug,
}: {
  items?: CategorySidebarItem[];
  activeSlug: string;
}) {
  const { t, locale } = useTranslations();
  const items = getLocalizedSectors(locale);

  return (
    <aside className="w-full shrink-0 lg:w-[260px]">
      <div className="rounded-card border border-border bg-surface p-4 shadow-xs">
        <h2 className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          {t("categories.sidebarTitle")}
        </h2>

        <nav className="mt-3 flex flex-col gap-1">
          {items.map((item) => {
            const isActive = activeSlug === item.slug;
            const Icon = ICONS[item.icon_key] || FolderKanban;
            const href = item.slug === "all" ? "/categories/all" : `/categories/${item.slug}`;

            return (
              <Link
                key={item.id}
                href={href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium transition-all ${
                  isActive
                    ? "bg-[#EBF7EE] font-semibold text-[#1A9E60]"
                    : "text-text-muted hover:bg-surface-soft hover:text-text"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-[#1A9E60]" : "text-text-muted group-hover:text-text"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                    isActive
                      ? "bg-[#1A9E60]/15 text-[#1A9E60]"
                      : "bg-surface-soft text-text-muted group-hover:bg-border/60"
                  }`}
                >
                  {item.operator_count}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Support Help Card */}
        <div className="mt-6 rounded-xl border border-border/80 bg-surface-soft/60 p-4">
          <div className="flex items-start gap-3">
            <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
            <div>
              <p className="text-[13px] font-semibold text-text leading-tight">
                {t("categories.supportTitle")}
              </p>
              <p className="mt-1 text-[12px] text-text-muted leading-relaxed">
                {t("categories.supportDesc")}
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-block w-full rounded-md border border-border bg-surface px-3 py-1.5 text-center text-[12px] font-semibold text-text shadow-2xs hover:bg-surface-soft transition-colors"
              >
                {t("categories.supportCta")}
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Banner Ad (OEST Ads: category.sidebar) */}
        <div className="mt-4">
          <BannerSlot placement="category.sidebar" category={activeSlug} variant="sidebar" />
        </div>
      </div>
    </aside>
  );
}
