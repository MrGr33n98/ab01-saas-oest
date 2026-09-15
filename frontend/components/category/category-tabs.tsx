"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export type CategoryTabKey = "operators" | "services" | "cases" | "insights";

export function CategoryTabs({
  operatorCount = 24,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: {
  operatorCount?: number;
  activeTab: CategoryTabKey;
  onTabChange: (tab: CategoryTabKey) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const tabs = [
    { key: "operators" as const, label: `Operadores (${operatorCount})` },
    { key: "services" as const, label: "Serviços" },
    { key: "cases" as const, label: "Cases" },
    { key: "insights" as const, label: "Dados e Insights" },
  ];

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Tab Navigation */}
      <nav className="flex items-center gap-6 overflow-x-auto text-[14px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative py-1 font-semibold transition-colors ${
                isActive ? "text-[#1A9E60]" : "text-text-muted hover:text-text"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-[#1A9E60]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Global Quick Search */}
      <div className="relative w-full sm:w-72 lg:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar operadores, serviços ou localização…"
          className="h-9 w-full rounded-input border border-border bg-surface pl-9 pr-3 text-[13px] text-text placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
    </div>
  );
}
