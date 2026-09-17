"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { CategoriesDropdown } from "@/components/layout/categories-dropdown";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useTranslations } from "@/lib/i18n/client";
import { getLocalizedSectors } from "@/lib/categories";
import { ChevronDown } from "lucide-react";

export function LandingHeader() {
  const { t, locale } = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const localizedSectors = getLocalizedSectors(locale).filter((s) => s.slug !== "all");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-oest-ink/10 py-2.5 shadow-xs"
          : "bg-white/85 backdrop-blur-sm border-b border-transparent py-3"
      }`}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 lg:px-8">
        {/* Brand Logo */}
        <BrandLogo size="md" tagline={t("brand.tagline")} />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium tracking-tight text-oest-ink/80">
          <Link href="/platform" className="hover:text-oest-blue transition-colors">
            {t("nav.platform")}
          </Link>
          <Link href="#como-funciona" className="hover:text-oest-blue transition-colors">
            {t("nav.howItWorks")}
          </Link>
          
          {/* Dropdown de Categorias */}
          <CategoriesDropdown />

          <Link href="#cobertura" className="hover:text-oest-blue transition-colors">
            {t("nav.coverage")}
          </Link>
          <Link href="#integracoes" className="hover:text-oest-blue transition-colors">
            {t("nav.dataProducts")}
          </Link>
          <Link href="/blog" className="hover:text-oest-blue transition-colors">
            {t("nav.insights")}
          </Link>
          <Link href="/operator/jobs" className="text-oest-blue font-semibold hover:underline">
            {t("nav.forOperators")}
          </Link>
        </nav>

        {/* Desktop CTAs + Locale Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/sign-in"
            className="text-[13px] font-medium text-oest-ink/80 hover:text-oest-ink px-3 py-2 transition-colors"
          >
            {t("nav.signIn")}
          </Link>
          <Link
            href="/app/missions/new"
            className="btn-oest-green px-4 py-2 text-[13px]"
          >
            {t("nav.requestMission")}
            <span className="text-white/80">→</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-oest-ink focus:outline-none"
            aria-label="Alternar menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-oest-ink">
            <Link
              href="/platform"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              {t("nav.platform")}
            </Link>
            <Link
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              {t("nav.howItWorks")}
            </Link>

            {/* Mobile Expandable Categories */}
            <div className="border-b border-border/40 py-2">
              <button
                type="button"
                onClick={() => setMobileCategoriesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between py-1 text-left font-medium text-oest-ink hover:text-oest-blue"
              >
                <span>{t("nav.categories")} / {t("nav.sectors")}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobileCategoriesOpen ? "rotate-180 text-oest-blue" : "text-text-muted"
                  }`}
                />
              </button>
              {mobileCategoriesOpen && (
                <div className="mt-2 grid grid-cols-1 gap-1 pl-2 animate-in fade-in-0 duration-150">
                  {localizedSectors.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-muted hover:bg-surface-soft hover:text-oest-ink"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-text-muted/80">{cat.operator_count} {t("categories.opsSuffix")}</span>
                    </Link>
                  ))}
                  <Link
                    href="/categories/infraestrutura"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-1 px-2.5 py-1 text-xs font-semibold text-oest-green"
                  >
                    {t("nav.viewAllCategories")}
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="#cobertura"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              {t("nav.coverage")}
            </Link>
            <Link
              href="#integracoes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              {t("nav.dataProducts")}
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              {t("nav.insights")}
            </Link>
            <Link
              href="/operator/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 font-semibold text-oest-blue border-b border-border/40"
            >
              {t("nav.forOperators")}
            </Link>
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in"
              className="btn-oest-outline w-full py-2.5 text-center text-sm font-medium"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              href="/app/missions/new"
              className="btn-oest-green w-full py-2.5 text-center text-sm font-semibold"
            >
              {t("nav.requestMission")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
