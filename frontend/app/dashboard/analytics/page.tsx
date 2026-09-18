"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LineChart, Sparkles } from "lucide-react";
import { getAnalyticsOverview, getAnalyticsFunnel, getAnalyticsWebhooks } from "@/lib/api/analytics";
import type {
  AnalyticsOverviewResponse,
  AnalyticsFunnelResponse,
  AnalyticsWebhooksResponse,
  DateRangeOption,
} from "@/types/analytics";
import { AnalyticsOverviewCards } from "@/components/analytics/AnalyticsOverviewCards";
import { AnalyticsFunnelChart } from "@/components/analytics/AnalyticsFunnelChart";
import { WebhooksHealthPanel } from "@/components/analytics/WebhooksHealthPanel";
import { TelemetryDateRangeFilter } from "@/components/analytics/TelemetryDateRangeFilter";
import { AnalyticsEmptyState } from "@/components/analytics/AnalyticsEmptyState";
import { AnalyticsErrorState } from "@/components/analytics/AnalyticsErrorState";

function getDateRange(range: DateRangeOption): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();

  if (range === "7d") {
    start.setDate(end.getDate() - 7);
  } else if (range === "30d") {
    start.setDate(end.getDate() - 30);
  } else if (range === "90d") {
    start.setDate(end.getDate() - 90);
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export default function AnalyticsDashboardPage() {
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>("30d");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ status?: number; message?: string } | null>(null);

  const [overviewData, setOverviewData] = useState<AnalyticsOverviewResponse | null>(null);
  const [funnelData, setFunnelData] = useState<AnalyticsFunnelResponse | null>(null);
  const [webhooksData, setWebhooksData] = useState<AnalyticsWebhooksResponse | null>(null);

  const fetchData = useCallback(async (range: DateRangeOption) => {
    setIsLoading(true);
    setError(null);

    const { startDate, endDate } = getDateRange(range);

    try {
      const [overviewRes, funnelRes, webhooksRes] = await Promise.all([
        getAnalyticsOverview({ startDate, endDate }),
        getAnalyticsFunnel({ startDate, endDate }),
        getAnalyticsWebhooks({ startDate, endDate }),
      ]);

      setOverviewData(overviewRes);
      setFunnelData(funnelRes);
      setWebhooksData(webhooksRes);
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string; detail?: string };
      setError({
        status: apiErr.status || 500,
        message: apiErr.detail || apiErr.message || "Erro ao conectar com o serviço de telemetria.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange, fetchData]);

  const handleRangeChange = (range: DateRangeOption) => {
    setSelectedRange(range);
  };

  const handleRefresh = () => {
    fetchData(selectedRange);
  };

  // Verifica se o período está sem dados
  const totalMissions = overviewData?.summary.missions_created ?? 0;
  const totalQuotes = overviewData?.summary.quotes_created ?? 0;
  const totalOrders = overviewData?.summary.orders_created ?? 0;
  const totalWebhooks = webhooksData?.total_deliveries ?? 0;
  const hasNoData = !isLoading && !error && totalMissions === 0 && totalQuotes === 0 && totalOrders === 0 && totalWebhooks === 0;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 text-primary font-medium text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Telemetry & Product Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2.5">
              <LineChart className="w-7 h-7 text-primary" />
              Analytics & Telemetria do Tenant
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Métricas auditáveis consolidadas em tempo real a partir de eventos reais do marketplace, funil de conversão e integridade de webhooks.
            </p>
          </div>

          <div className="shrink-0">
            <TelemetryDateRangeFilter
              selectedRange={selectedRange}
              onRangeChange={handleRangeChange}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Renderização de Estados */}
        {error ? (
          <AnalyticsErrorState
            status={error.status}
            message={error.message}
            onRetry={handleRefresh}
          />
        ) : hasNoData ? (
          <AnalyticsEmptyState />
        ) : (
          <div className="space-y-8">
            {/* Seção 1: Overview Cards */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Visão Geral das Métricas
              </h2>
              <AnalyticsOverviewCards
                summary={overviewData?.summary}
                isLoading={isLoading}
              />
            </section>

            {/* Seção 2: Funil e Saúde de Webhooks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Desempenho da Jornada
                </h2>
                <AnalyticsFunnelChart
                  steps={funnelData?.steps}
                  isLoading={isLoading}
                />
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Confiabilidade de Infraestrutura
                </h2>
                <WebhooksHealthPanel
                  webhooksData={webhooksData || undefined}
                  isLoading={isLoading}
                />
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
