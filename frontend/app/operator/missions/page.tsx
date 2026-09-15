"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type ApiError } from "@/lib/api/client";

type Mission = {
  id: string;
  title: string;
  status: string;
  mission_type?: string;
  area_hectares?: number | null;
  deadline_at?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  operator_selected: "Op. selecionado",
  scheduled: "Agendada",
  in_progress: "Em execução",
  processing: "Processando",
  review: "Em revisão",
  completed: "Concluída",
};

const STATUS_COLORS: Record<string, string> = {
  operator_selected: "bg-yellow-50 text-yellow-700 border-yellow-200",
  scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  in_progress: "bg-orange-50 text-orange-700 border-orange-200",
  processing: "bg-orange-50 text-orange-700 border-orange-200",
  review: "bg-yellow-50 text-yellow-800 border-yellow-300",
  completed: "bg-green-50 text-green-700 border-green-200",
};

export default function OperatorMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Mission[] }>("/operator/missions")
      .then((r) => setMissions(r.data))
      .catch((e: ApiError) => setError(e.detail ?? "Erro ao carregar missões"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Missões em execução</h1>
      <p className="mt-1 text-[15px] text-text-muted">Missões atribuídas a você.</p>

      <div className="mt-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-card bg-border/20" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-card border border-danger/30 bg-danger/5 p-4 text-center">
            <p className="text-[14px] text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && missions.length === 0 && (
          <div className="card py-16 text-center">
            <div className="text-3xl mb-4">🚁</div>
            <p className="text-[15px] font-medium text-text">Nenhuma missão atribuída</p>
            <p className="mt-2 text-[14px] text-text-muted">
              Quando uma proposta sua for aceita, a missão aparecerá aqui.
            </p>
          </div>
        )}

        {!loading && !error && missions.length > 0 && (
          <div className="space-y-3">
            {missions.map((m) => {
              const cls = STATUS_COLORS[m.status] ?? "bg-surface-soft text-text-muted border-border";
              return (
                <div key={m.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[15px] font-semibold text-text">{m.title}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-[13px] text-text-muted">
                        {m.mission_type && <span className="capitalize">{m.mission_type}</span>}
                        {m.area_hectares && <><span>·</span><span>{m.area_hectares.toFixed(1)} ha</span></>}
                        {m.deadline_at && (
                          <><span>·</span><span>Prazo: {new Date(m.deadline_at).toLocaleDateString("pt-BR")}</span></>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
                        {STATUS_LABELS[m.status] ?? m.status}
                      </span>
                      <Link
                        href={`/operator/missions/${m.id}`}
                        className="text-[13px] font-medium text-text-muted hover:text-text"
                      >
                        Ver detalhes →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
