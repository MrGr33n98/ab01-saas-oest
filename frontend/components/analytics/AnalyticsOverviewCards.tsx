"use client";

import React from "react";
import {
  Layers,
  Send,
  CheckCircle2,
  ShoppingCart,
  CheckCheck,
  Webhook,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsSummary } from "@/types/analytics";

interface AnalyticsOverviewCardsProps {
  summary?: AnalyticsSummary;
  isLoading?: boolean;
}

export function AnalyticsOverviewCards({ summary, isLoading }: AnalyticsOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="p-4 border-border/60">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-7 w-16 my-1" />
            <Skeleton className="h-3 w-32 mt-2" />
          </Card>
        ))}
      </div>
    );
  }

  const s = summary || {
    missions_created: 0,
    missions_published: 0,
    quotes_created: 0,
    quotes_accepted: 0,
    orders_created: 0,
    orders_completed: 0,
    webhooks_succeeded: 0,
    webhooks_failed: 0,
  };

  const totalWebhooks = s.webhooks_succeeded + s.webhooks_failed;
  const webhookSuccessRate = totalWebhooks > 0
    ? ((s.webhooks_succeeded / totalWebhooks) * 100).toFixed(1)
    : "100.0";

  const cards = [
    {
      title: "Missões Criadas",
      value: s.missions_created,
      description: "Demandas iniciadas no período",
      icon: Layers,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Missões Publicadas",
      value: s.missions_published,
      description: "Abertas para cotação",
      icon: Send,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Cotações Aceitas",
      value: s.quotes_accepted,
      description: "Propostas contratadas",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Pedidos Criados",
      value: s.orders_created,
      description: "Ordens de serviço geradas",
      icon: ShoppingCart,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Pedidos Concluídos",
      value: s.orders_completed,
      description: "Missões finalizadas e entregues",
      icon: CheckCheck,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
    },
    {
      title: "Webhooks Enviados",
      value: totalWebhooks,
      description: `${s.webhooks_succeeded} entregues · ${s.webhooks_failed} falhas`,
      icon: Webhook,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Taxa de Sucesso Webhooks",
      value: `${webhookSuccessRate}%`,
      description: "Confiabilidade de entrega",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="p-4 bg-card border-border/60 hover:border-border transition-all duration-200 shadow-xs"
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
              {typeof card.value === "number" ? card.value.toLocaleString("pt-BR") : card.value}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
              {card.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
