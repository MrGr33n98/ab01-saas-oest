"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type ApiError } from "@/lib/api/client";

type Job = {
  id: string;
  title: string;
  status: string;
  mission_type?: string;
  area_hectares?: number | null;
  deadline_at?: string | null;
  estimated_budget_min?: number | null;
  estimated_budget_max?: number | null;
  currency?: string;
  products?: Array<{ name?: string; slug?: string; data_product_id: string }>;
};

export default function OperatorJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Job[] }>("/operator/jobs")
      .then((r) => setJobs(r.data))
      .catch((e: ApiError) => setError(e.detail ?? "Erro ao carregar jobs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-text">Jobs compatíveis</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Missões elegíveis baseadas na sua área de cobertura e serviços.
        </p>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-card bg-border/20" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-card border border-danger/30 bg-danger/5 p-4 text-center">
            <p className="text-[14px] text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="card py-16 text-center">
            <div className="text-3xl mb-4">🎯</div>
            <p className="text-[15px] font-medium text-text">Nenhum job compatível no momento</p>
            <p className="mt-2 max-w-sm mx-auto text-[14px] text-text-muted">
              Complete seu perfil, área de cobertura e serviços para aparecer no matching.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/operator/coverage" className="btn btn-secondary">
                Definir área de cobertura
              </Link>
              <Link href="/operator/services" className="btn btn-secondary">
                Cadastrar serviços
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    total: "",
    currency: job.currency ?? "BRL",
    proposal_text: "",
    estimated_delivery_at: "",
  });

  async function submitProposal() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/missions/${job.id}/quotes`, {
        method: "POST",
        idempotencyKey: `proposal-${job.id}-${Date.now()}`,
        body: JSON.stringify({
          total: parseFloat(form.total),
          currency: form.currency,
          proposal_text: form.proposal_text,
          estimated_delivery_at: form.estimated_delivery_at || undefined,
        }),
      });
      setSent(true);
      setShowForm(false);
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail ?? "Erro ao enviar proposta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold text-text">{job.title}</p>
          <div className="mt-1 flex flex-wrap gap-2 text-[13px] text-text-muted">
            {job.mission_type && <span className="capitalize">{job.mission_type}</span>}
            {job.area_hectares && <><span>·</span><span>{job.area_hectares.toFixed(1)} ha</span></>}
            {job.deadline_at && (
              <><span>·</span><span>Prazo: {new Date(job.deadline_at).toLocaleDateString("pt-BR")}</span></>
            )}
          </div>
          {job.estimated_budget_min && (
            <p className="mt-1 text-[13px] text-text-muted">
              Orçamento estimado: {job.currency ?? "BRL"} {job.estimated_budget_min.toLocaleString("pt-BR")}
              {job.estimated_budget_max && `–${job.estimated_budget_max.toLocaleString("pt-BR")}`}
            </p>
          )}
        </div>
        <div className="shrink-0">
          {sent ? (
            <span className="text-[13px] font-medium text-success">✓ Proposta enviada</span>
          ) : (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="btn btn-primary text-[13px] px-3 py-1.5"
            >
              {showForm ? "Cancelar" : "Enviar proposta"}
            </button>
          )}
        </div>
      </div>

      {job.products && job.products.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.products.map((p, i) => (
            <span key={i} className="rounded-full bg-surface-soft border border-border px-2.5 py-0.5 text-[12px] text-text">
              {p.name ?? p.slug ?? p.data_product_id}
            </span>
          ))}
        </div>
      )}

      {showForm && !sent && (
        <div className="mt-3 border-t border-border pt-4 space-y-3">
          {error && (
            <p className="text-[13px] text-danger border border-danger/30 rounded-input bg-danger/5 px-3 py-2">
              {error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor={`total-${job.id}`}>Valor total ({job.currency ?? "BRL"})</label>
              <input
                id={`total-${job.id}`}
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0,00"
                value={form.total}
                onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
              />
            </div>
            <div>
              <label className="label" htmlFor={`delivery-${job.id}`}>Entrega estimada</label>
              <input
                id={`delivery-${job.id}`}
                type="date"
                className="input"
                value={form.estimated_delivery_at}
                onChange={(e) => setForm((f) => ({ ...f, estimated_delivery_at: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor={`proposal-${job.id}`}>Proposta / Carta de apresentação</label>
            <textarea
              id={`proposal-${job.id}`}
              rows={3}
              className="input resize-none"
              placeholder="Descreva sua abordagem, equipamentos e diferenciais..."
              value={form.proposal_text}
              onChange={(e) => setForm((f) => ({ ...f, proposal_text: e.target.value }))}
            />
          </div>
          <button
            onClick={submitProposal}
            disabled={submitting || !form.total}
            className="btn btn-primary w-full sm:w-auto"
          >
            {submitting ? "Enviando…" : "Enviar proposta"}
          </button>
        </div>
      )}
    </div>
  );
}
