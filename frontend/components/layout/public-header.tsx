"use client";

import Link from "next/link";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { BrandLogo } from "@/components/layout/brand-logo";
import { CategoriesDropdown } from "@/components/layout/categories-dropdown";
import { useTranslations } from "@/lib/i18n/client";

export function PublicHeader() {
  const { t } = useTranslations();

  const NAV = [
    { href: "/operators", label: t("nav.operators") },
    { href: "/services", label: t("nav.services") },
    { href: "/data-products", label: t("nav.dataProducts") },
    { href: "/coverage", label: t("nav.coverage") },
    { href: "/how-it-works", label: t("nav.howItWorks") },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/enterprise", label: t("nav.enterprise") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo size="md" tagline={t("brand.tagline")} />

        <nav className="hidden items-center gap-6 text-[14px] text-text-muted lg:flex">
          <CategoriesDropdown />
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium hover:text-text transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher className="mr-1" />
          <Link
            href="/sign-in"
            className="btn-ghost hidden sm:inline-flex text-[13px] font-medium"
          >
            {t("nav.signIn")}
          </Link>
          <Link
            href="/sign-up"
            className="btn-primary text-[13px] font-semibold"
          >
            {t("nav.signUp")}
          </Link>
        </div>
      </div>
    </header>
  );
}
