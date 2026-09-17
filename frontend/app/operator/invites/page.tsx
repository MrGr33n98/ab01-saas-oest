"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, MapPin, Plane, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { operatorApi, type OperatorInvite } from "@/lib/api/operator";
import type { ApiError } from "@/lib/api/client";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  accepted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  declined: "bg-slate-100 text-slate-600 ring-slate-200",
  expired: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function OperatorInvitesPage() {
  const [invites, setInvites] = useState<OperatorInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    operatorApi.invites().then(({ data }) => setInvites(data)).catch((reason: ApiError) => setError(reason.detail || reason.title || "Não foi possível carregar os convites.")).finally(() => setLoading(false));
  }, []);

  async function respond(invite: OperatorInvite, action: "accept" | "decline") {
    setBusy(invite.id);
    try {
      const result = await operatorApi.respondToInvite(invite.id, action);
      setInvites((current) => current.map((item) => item.id === invite.id ? result.data : item));
    } catch (reason) {
      const apiError = reason as ApiError;
      setError(apiError.detail || apiError.title || "Não foi possível atualizar o convite.");
    } finally { setBusy(null); }
  }

  return <div className="mx-auto max-w-6xl pb-12">
    <div className="rounded-3xl bg-violet-700 px-7 py-8 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Operator network</p><h1 className="mt-2 text-3xl font-bold">My invites</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">Avalie os trabalhos direcionados ao seu perfil. Aceitar um convite libera a jornada de proposta, sem criar uma obrigação automática.</p></div>
    {error && <div className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
    <div className="mt-7 space-y-4">{loading && <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />}{!loading && invites.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Plane className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-4 font-semibold text-slate-800">Nenhum convite pendente</h2><p className="mt-1 text-sm text-slate-500">Mantenha disponibilidade, equipamentos e documentos atualizados para melhorar o match.</p></div>}{invites.map((invite) => <article key={invite.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyle[invite.status] || statusStyle.pending}`}>{invite.status}</span><span className="text-xs font-medium text-slate-500">Recebido em {new Date(invite.created_at).toLocaleDateString("pt-BR")}</span></div><h2 className="mt-3 text-xl font-bold text-slate-950">{invite.mission.title}</h2><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-violet-600" />{[invite.mission.city, invite.mission.state_code, invite.mission.country_code].filter(Boolean).join(", ") || "Local a definir"}</span>{invite.mission.deadline_at && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-violet-600" />Prazo {new Date(invite.mission.deadline_at).toLocaleDateString("pt-BR")}</span>}</div>{invite.message && <p className="mt-4 max-w-2xl rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{invite.message}</p>}</div><div className="min-w-48 rounded-xl bg-violet-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-violet-700">Faixa estimada</p><p className="mt-1 text-lg font-bold text-violet-950">{invite.mission.estimated_budget_min ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: invite.mission.currency }).format(invite.mission.estimated_budget_min) : "A combinar"}{invite.mission.estimated_budget_max ? ` – ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: invite.mission.currency }).format(invite.mission.estimated_budget_max)}` : ""}</p></div></div>{invite.status === "pending" && <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5"><Button disabled={busy === invite.id} onClick={() => respond(invite, "accept")}><Check className="h-4 w-4" />Aceitar convite</Button><Button variant="secondary" disabled={busy === invite.id} onClick={() => respond(invite, "decline")}><X className="h-4 w-4" />Recusar</Button></div>}</article>)}</div>
  </div>;
}
