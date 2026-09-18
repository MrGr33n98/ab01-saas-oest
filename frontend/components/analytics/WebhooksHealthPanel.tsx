"use client";

import React from "react";
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsWebhooksResponse } from "@/types/analytics";

interface WebhooksHealthPanelProps {
  webhooksData?: AnalyticsWebhooksResponse;
  isLoading?: boolean;
}

export function WebhooksHealthPanel({ webhooksData, isLoading }: WebhooksHealthPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border-border/60">
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  const total = webhooksData?.total_deliveries ?? 0;
  const succeeded = webhooksData?.succeeded ?? 0;
  const failed = webhooksData?.failed ?? 0;
  const rate = webhooksData?.success_rate_percentage ?? 100.0;

  const isHealthy = rate >= 95.0 && failed === 0;

  return (
    <Card className="p-6 border-border/60 bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-border/40">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Saúde & Confiabilidade de Webhooks
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoramento de disparos de eventos para integrações externas do tenant
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isHealthy ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Operacional Saudável
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              Atenção: Falhas Detectadas
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
          <span className="text-xs font-medium text-muted-foreground">Total Disparado</span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {total.toLocaleString("pt-BR")}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Payloads enviados no período
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Entregues com Sucesso</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {succeeded.toLocaleString("pt-BR")}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Respostas HTTP 2xx recebidas
          </span>
        </div>

        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Falhas de Entrega</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {failed.toLocaleString("pt-BR")}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Timeout ou HTTP 4xx/5xx
          </span>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
          <span className="text-xs font-medium text-muted-foreground">Taxa de Sucesso</span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {rate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            SLA de entrega garantido
          </span>
        </div>
      </div>
    </Card>
  );
}
