"use client";

import React from "react";
import { BarChart2, Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function AnalyticsEmptyState() {
  return (
    <Card className="p-12 text-center border-border/60 bg-card shadow-xs flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center mb-4 border border-border/50">
        <BarChart2 className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        Nenhum evento registrado no período
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        Não foram computados eventos de telemetria ou transações para o intervalo de datas selecionado. Inicie novas missões ou altere o filtro para visualizar o histórico.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link
          href="/app/missions/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 shadow-xs transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          Criar Nova Missão
        </Link>
      </div>
    </Card>
  );
}
