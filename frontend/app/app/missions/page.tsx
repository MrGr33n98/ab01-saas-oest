"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

type Mission = {
  id: string;
  title: string;
  status: string;
  mission_type?: string;
  area_hectares?: number | null;
  deadline_at?: string | null;
  published_at?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-surface-soft text-text-muted border-border",
  planning: "bg-surface-soft text-text-muted border-border",
  published: "bg-blue-50 text-blue-700 border-blue-200",
  quoting: "bg-blue-50 text-blue-700 border-blue-200",
  operator_selected: "bg-yellow-50 text-yellow-700 border-yellow-200",
  scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  in_progress: "bg-orange-50 text-orange-700 border-orange-200",
  review: "bg-yellow-50 text-yellow-800 border-yellow-300",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  planning: "Planejamento",
  published: "Publicada",
  quoting: "Recebendo propostas",
  operator_selected: "Op. selecionado",
  scheduled: "Agendada",
  in_progress: "Em execução",
  processing: "Processando",
  review: "Em revisão",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Mission[] }>("/missions")
      .then((r) => setMissions(r.data))
      .catch(() => setError("Não foi possível carregar missões"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Missões</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Crie, publique e acompanhe missões de ponta a ponta.
          </p>
        </div>
        <Link href="/app/missions/new">
          <Button>Nova missão</Button>
        </Link>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-card bg-border/20" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-card border border-danger/30 bg-danger/5 p-4 text-center">
            <p className="text-[14px] text-danger">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(null); apiFetch<{ data: Mission[] }>("/missions").then((r) => setMissions(r.data)).catch(() => setError("Erro ao carregar")).finally(() => setLoading(false)); }}
              className="mt-2 text-[13px] text-text-muted underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && missions.length === 0 && (
          <div className="rounded-card border border-border bg-surface flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-surface-soft flex items-center justify-center mb-4">
              <span className="text-2xl">🚁</span>
            </div>
            <p className="text-[15px] font-medium text-text">Nenhuma missão ainda</p>
            <p className="mt-1 max-w-sm text-[14px] text-text-muted">
              Publique uma missão com AOI e produtos de dados para receber propostas de operadores elegíveis.
            </p>
            <Link href="/app/missions/new" className="mt-6">
              <Button variant="secondary">Criar primeira missão</Button>
            </Link>
          </div>
        )}

        {!loading && !error && missions.length > 0 && (
          <div className="space-y-3">
            {missions.map((m) => {
              const cls = STATUS_COLORS[m.status] ?? "bg-surface-soft text-text-muted border-border";
              return (
                <Link
                  key={m.id}
                  href={`/app/missions/${m.id}`}
                  className="block rounded-card border border-border bg-surface p-4 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-text truncate">{m.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-text-muted">
                        {m.mission_type && <span className="capitalize">{m.mission_type}</span>}
                        {m.area_hectares && <><span>·</span><span>{m.area_hectares.toFixed(1)} ha</span></>}
                        {m.deadline_at && <><span>·</span><span>Prazo: {new Date(m.deadline_at).toLocaleDateString("pt-BR")}</span></>}
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0 ${cls}`}>
                      {STATUS_LABELS[m.status] ?? m.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
