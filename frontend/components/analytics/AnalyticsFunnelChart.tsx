"use client";

import React from "react";
import { Filter, ArrowDown, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FunnelStep } from "@/types/analytics";

interface AnalyticsFunnelChartProps {
  steps?: FunnelStep[];
  isLoading?: boolean;
}

const STEP_LABELS: Record<string, { title: string; desc: string }> = {
  mission_created: {
    title: "1. Missão Criada",
    desc: "Clientes iniciando requisição de serviço",
  },
  mission_published: {
    title: "2. Missão Publicada",
    desc: "Demandas aprovadas e abertas a operadores",
  },
  quote_accepted: {
    title: "3. Cotação Aceita",
    desc: "Proposta escolhida e aceita pelo contratante",
  },
  order_created: {
    title: "4. Pedido Gerado",
    desc: "Ordem de serviço formalizada e confirmada",
  },
};

export function AnalyticsFunnelChart({ steps, isLoading }: AnalyticsFunnelChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border-border/60">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const defaultSteps: FunnelStep[] = [
    { step: "mission_created", count: 0, conversion_rate: 100 },
    { step: "mission_published", count: 0, conversion_rate: 0 },
    { step: "quote_accepted", count: 0, conversion_rate: 0 },
    { step: "order_created", count: 0, conversion_rate: 0 },
  ];

  const currentSteps = steps && steps.length > 0 ? steps : defaultSteps;
  const maxCount = Math.max(...currentSteps.map((s) => s.count), 1);

  return (
    <Card className="p-6 border-border/60 bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-border/40">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            Funil de Conversão do Marketplace
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Eficiência da jornada de ponta a ponta: da criação da missão até a conversão em pedido
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {currentSteps.map((s, idx) => {
          const meta = STEP_LABELS[s.step] || {
            title: s.step,
            desc: "Etapa de telemetria de produto",
          };

          const widthPercent = Math.max(Math.round((s.count / maxCount) * 100), s.count > 0 ? 6 : 0);
          const prevStep = idx > 0 ? currentSteps[idx - 1] : null;
          const dropOff = prevStep && prevStep.count > 0 && prevStep.count >= s.count
            ? (((prevStep.count - s.count) / prevStep.count) * 100).toFixed(1)
            : null;

          return (
            <div key={s.step} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground">{meta.title}</span>
                  <span className="hidden sm:inline text-muted-foreground text-[11px]">
                    · {meta.desc}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground text-sm">
                    {s.count.toLocaleString("pt-BR")}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40">
                    {s.conversion_rate}% conv.
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-muted/50 rounded-lg h-7 p-1 flex items-center border border-border/30">
                <div
                  className="bg-primary/90 h-full rounded-md transition-all duration-500 ease-out flex items-center justify-end px-2"
                  style={{ width: `${widthPercent}%` }}
                >
                  {widthPercent > 15 && (
                    <span className="text-[10px] font-medium text-primary-foreground">
                      {s.count}
                    </span>
                  )}
                </div>
              </div>

              {/* Step drop-off indicator */}
              {idx < currentSteps.length - 1 && (
                <div className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-muted-foreground">
                  <ArrowDown className="w-3 h-3 text-muted-foreground/70" />
                  {dropOff !== null && parseFloat(dropOff) > 0 ? (
                    <span>
                      Queda de <strong className="text-amber-500/90 font-medium">{dropOff}%</strong> nesta etapa
                    </span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Conversão total preservada
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
