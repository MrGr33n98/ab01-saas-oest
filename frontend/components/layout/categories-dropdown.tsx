"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Building2,
  Zap,
  Sprout,
  Mountain,
  HardHat,
  Trees,
  Home,
  ShieldCheck,
  FolderKanban,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { getLocalizedSectors } from "@/lib/categories";
import { useTranslations } from "@/lib/i18n/client";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "building-2": Building2,
  "zap": Zap,
  "sprout": Sprout,
  "mountain": Mountain,
  "hard-hat": HardHat,
  "trees": Trees,
  "home": Home,
  "shield-check": ShieldCheck,
};

interface CategoriesDropdownProps {
  currentPath?: string;
  className?: string;
  isDarkTheme?: boolean;
  onItemClick?: () => void;
}

export function CategoriesDropdown({
  currentPath = "",
  className = "",
  isDarkTheme = false,
  onItemClick,
}: CategoriesDropdownProps) {
  const { t, locale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = getLocalizedSectors(locale).filter((s) => s.slug !== "all");

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group inline-flex items-center gap-1.5 transition-colors focus:outline-none ${
          isDarkTheme
            ? "text-white/80 hover:text-white"
            : "text-oest-ink/80 hover:text-oest-blue"
        } ${isOpen ? (isDarkTheme ? "text-white" : "text-oest-blue") : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{t("nav.categories")}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-oest-blue" : "text-oest-ink/50 group-hover:text-oest-blue"
          }`}
        />
      </button>

      {/* Dropdown Flyout Panel */}
      {isOpen && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="w-[660px] max-w-[92vw] rounded-2xl border border-border/80 bg-white p-5 shadow-2xl ring-1 ring-black/5">
            {/* Header / Intro */}
            <div className="mb-3.5 flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-[13px] font-semibold tracking-tight text-oest-ink">
                  {t("categories.title")}
                </h3>
                <p className="text-[11px] text-text-muted">
                  {t("categories.subtitle")}
                </p>
              </div>
              <Link
                href="/categories/infraestrutura"
                onClick={() => {
                  setIsOpen(false);
                  onItemClick?.();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-oest-green hover:underline"
              >
                {t("nav.viewFullCatalog")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* 2-Column Grid of 8 Categories */}
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon_key] || FolderKanban;
                const isSelected = currentPath.includes(`/categories/${cat.slug}`);

                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      onItemClick?.();
                    }}
                    className={`group flex items-start gap-3 rounded-xl p-2.5 transition-all ${
                      isSelected
                        ? "bg-surface-soft ring-1 ring-black/10"
                        : "hover:bg-surface-soft"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isSelected
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-black group-hover:bg-black group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-oest-ink group-hover:text-oest-blue">
                          {cat.name}
                        </span>
                        <span className="text-[10px] font-medium text-text-muted">
                          {cat.operator_count} {t("categories.opsSuffix")}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-[11px] text-text-muted">
                        {cat.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Footer Row */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-soft px-3.5 py-2.5 text-[12px]">
              <span className="text-text-muted">
                {t("nav.needCustomFlight")}
              </span>
              <Link
                href="/app/missions/new"
                onClick={() => {
                  setIsOpen(false);
                  onItemClick?.();
                }}
                className="font-semibold text-oest-blue hover:underline"
              >
                {t("nav.quickQuote")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
