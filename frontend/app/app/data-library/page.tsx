"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/client";

type Item = {
  id: string;
  title?: string;
  status?: string;
  mission_id?: string;
  version?: number;
};

export default function DataLibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: Item[] }>("/data-library")
      .then((r) => setItems(r.data || []))
      .catch((e: ApiError) => {
        // Endpoint may 404 until fully wired — show honest empty
        if (e.status === 404) setItems([]);
        else setError(e.detail || e.title || "Erro ao carregar biblioteca");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Biblioteca de dados</h1>
      <p className="mt-1 text-[15px] text-text-muted">
        Entregas aprovadas da organização — base para recompra e consulta.
      </p>

      {error && (
        <p className="mt-4 text-[14px] text-danger">{error}</p>
      )}

      {loading ? (
        <div className="mt-10 h-32 animate-pulse rounded-card bg-border/40" />
      ) : items.length === 0 ? (
        <div className="mt-10 card py-16 text-center">
          <p className="font-medium text-text">Biblioteca vazia</p>
          <p className="mt-2 text-[14px] text-text-muted">
            Após aprovar deliverables em missões concluídas, os datasets aparecem aqui.
          </p>
          <Link href="/app/missions" className="btn-secondary mt-6 inline-flex">
            Ver missões
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-card border border-border">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-text">{it.title || it.id}</p>
                <p className="text-[12px] text-text-muted">
                  {it.status}
                  {it.version != null ? ` · v${it.version}` : ""}
                </p>
              </div>
              {it.mission_id && (
                <Link
                  href={`/app/missions/${it.mission_id}`}
                  className="text-[13px] text-text underline"
                >
                  Missão
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
