"use client";

import React from "react";
import { AlertCircle, Lock, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface AnalyticsErrorStateProps {
  status?: number;
  message?: string;
  onRetry: () => void;
}

export function AnalyticsErrorState({ status, message, onRetry }: AnalyticsErrorStateProps) {
  const isForbidden = status === 401 || status === 403;

  if (isForbidden) {
    return (
      <Card className="p-12 text-center border-border/60 bg-card shadow-xs flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Acesso Restrito aos Dados Analíticos
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Sua conta não possui permissões administrativas suficientes nesta organização para visualizar a telemetria do tenant.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-muted text-foreground border border-border/60 text-xs font-medium shadow-xs transition-colors"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-12 text-center border-border/60 bg-card shadow-xs flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        Falha ao carregar métricas de telemetria
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        {message || "Ocorreu uma instabilidade na comunicação com a API de Analytics. Por favor, tente novamente."}
      </p>
      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Tentar Novamente
        </button>
      </div>
    </Card>
  );
}
