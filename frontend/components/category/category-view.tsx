"use client";

import { useState, useMemo } from "react";
import { CategoryHero } from "./category-hero";
import { CategoryTabs, type CategoryTabKey } from "./category-tabs";
import { CategoryFilters, type ViewMode } from "./category-filters";
import { CategoryOperatorGrid } from "./category-operator-grid";
import { CategoryFAQ } from "./category-faq";
import { CategoryUseCases } from "./category-use-cases";
import { CategoryRelatedGrid } from "./category-related";
import { CategoryCTA } from "./category-cta";
import { BannerSlot } from "@/components/ads/banner-slot";
import type { CategoryDetail } from "@/lib/categories";
import { getLocalizedCategoryDetail } from "@/lib/categories";
import { useTranslations } from "@/lib/i18n/client";
import type { CategoryOperatorData } from "./category-operator-card";

export function CategoryView({
  category: initialCategory,
  initialOperators,
}: {
  category: CategoryDetail;
  initialOperators: CategoryOperatorData[];
}) {
  const { t, locale } = useTranslations();
  const category = useMemo(
    () => getLocalizedCategoryDetail(initialCategory, locale),
    [initialCategory, locale]
  );

  const [activeTab, setActiveTab] = useState<CategoryTabKey>("operators");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [locationFilter, setLocationFilter] = useState("");

  // Client-side filtering of operators
  const filteredOperators = useMemo(() => {
    let list = [...initialOperators];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (op) =>
          op.name.toLowerCase().includes(q) ||
          op.headline.toLowerCase().includes(q) ||
          op.city?.toLowerCase().includes(q) ||
          op.state_code?.toLowerCase().includes(q) ||
          op.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (locationFilter) {
      list = list.filter((op) => op.state_code === locationFilter);
    }

    if (sortBy === "rating") {
      list.sort((a, b) => b.rating_average - a.rating_average);
    } else if (sortBy === "missions") {
      list.sort((a, b) => b.missions_completed - a.missions_completed);
    }

    return list;
  }, [initialOperators, searchQuery, locationFilter, sortBy]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Compact Hero Banner */}
      <CategoryHero category={category} />

      {/* 2. Navigation Tabs & Global Search */}
      <CategoryTabs
        operatorCount={category.counts.operators}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Tab: Operators Content */}
      {activeTab === "operators" && (
        <>
          {/* 3. Filter Bar & View Toggle */}
          <CategoryFilters
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            locationFilter={locationFilter}
            onLocationChange={setLocationFilter}
          />

          {/* 4. Three-Column Operator Grid */}
          <CategoryOperatorGrid
            operators={filteredOperators}
            viewMode={viewMode}
          />
        </>
      )}

      {/* Tab: Services */}
      {activeTab === "services" && (
        <CategoryUseCases
          useCases={category.use_cases}
          title={category.editorial?.services_title || t("categories.tabs.services")}
          description={category.editorial?.services_description || "Soluções e pacotes de contratação para sua operação."}
        />
      )}

      {/* Tab: Cases */}
      {activeTab === "cases" && (
        <div className="rounded-card border border-border bg-surface p-8 text-center">
          <p className="font-semibold text-text">Cases de Sucesso em {category.name}</p>
          <p className="mt-1 text-sm text-text-muted">
            Relatórios e resultados de auditorias de alta precisão realizados por operadores homologados.
          </p>
        </div>
      )}

      {/* Tab: Insights & Overview */}
      {activeTab === "insights" && category.editorial?.overview_body && (
        <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold text-text">
            {category.editorial.overview_title || t("categories.tabs.insights")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-text-muted">
            {category.editorial.overview_body}
          </p>
        </div>
      )}

      {/* 5. Practical Use Cases Section */}
      {category.use_cases && category.use_cases.length > 0 && activeTab === "operators" && (
        <CategoryUseCases
          useCases={category.use_cases}
          title={category.editorial?.use_cases_title}
          description={category.editorial?.use_cases_description}
        />
      )}

      {/* 6. FAQ Accordion for SEO & AEO */}
      {category.faqs && category.faqs.length > 0 && (
        <CategoryFAQ
          faqs={category.faqs}
          title={category.editorial?.faq_title}
          description={category.editorial?.faq_description}
        />
      )}

      {/* 7. Related Categories */}
      {category.related_categories && category.related_categories.length > 0 && (
        <CategoryRelatedGrid
          categories={category.related_categories}
          title={category.editorial?.related_categories_title}
        />
      )}

      {/* 8. Sponsored Footer Banner (OEST Ads: category.footer_above) */}
      <BannerSlot
        placement="category.footer_above"
        category={category.slug}
        variant="footer"
      />

      {/* 9. Conversion Bottom CTA */}
      <CategoryCTA
        title={category.cta.title}
        description={category.cta.description}
        primaryLabel={category.cta.primary_label}
        primaryUrl={category.cta.primary_url}
        secondaryLabel={category.cta.secondary_label}
        secondaryUrl={category.cta.secondary_url}
      />
    </div>
  );
}
