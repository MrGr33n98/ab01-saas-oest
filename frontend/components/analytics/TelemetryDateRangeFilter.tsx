"use client";

import React from "react";
import { Calendar, RefreshCw } from "lucide-react";
import type { DateRangeOption } from "@/types/analytics";

interface TelemetryDateRangeFilterProps {
  selectedRange: DateRangeOption;
  onRangeChange: (range: DateRangeOption) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const RANGE_LABELS: Record<DateRangeOption, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
};

export function TelemetryDateRangeFilter({
  selectedRange,
  onRangeChange,
  onRefresh,
  isLoading,
}: TelemetryDateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/60 rounded-xl p-2.5 shadow-sm">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground ml-1.5" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Período:
        </span>
        <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/40">
          {(["7d", "30d", "90d"] as DateRangeOption[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onRangeChange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedRange === range
                  ? "bg-background text-foreground shadow-xs border border-border/50 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {RANGE_LABELS[range]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-background hover:bg-muted/80 text-foreground border border-border/60 shadow-xs transition-colors disabled:opacity-50"
        title="Atualizar métricas em tempo real"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
        <span>{isLoading ? "Atualizando..." : "Atualizar"}</span>
      </button>
    </div>
  );
}
