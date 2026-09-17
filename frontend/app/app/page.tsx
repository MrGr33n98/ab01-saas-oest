"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, CircleDot, Clock3, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enterpriseApi, type EnterpriseDashboard } from "@/lib/api/enterprise";
import type { ApiError } from "@/lib/api/client";

const EMPTY_DASHBOARD: EnterpriseDashboard = {
  organization: { id: "", name: "sua empresa", tenant_type: "enterprise", organization_type: "enterprise" },
  total_orders: 0,
  profile_completion: { percentage: 0, complete: false, fields: {} },
  orders_overview: { unconfirmed: 0, confirmed: 0, active: 0, completed: 0 },
  missions_overview: { unconfirmed: 0, confirmed: 0, active: 0, completed: 0 },
  recent_notifications: [],
};

const overview = [
  { key: "unconfirmed", label: "Aguardando confirmação", icon: Clock3, tone: "bg-[#fff0dc] text-[#c97616]" },
  { key: "confirmed", label: "Confirmados", icon: CircleDot, tone: "bg-[#edf0ff] text-[#5368f4]" },
  { key: "active", label: "Em andamento", icon: Send, tone: "bg-[#f0edff] text-[#775cf3]" },
  { key: "completed", label: "Concluídos", icon: CheckCircle2, tone: "bg-[#e8f8f1] text-[#0d9b72]" },
] as const;

function OverviewRow({ title, data, order }: { title: string; data: EnterpriseDashboard["orders_overview"]; order: boolean }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#171a22]">{title}</h2>
        <Link href={order ? "/app/orders" : "/app/missions"} className="text-xs font-semibold text-[#587c12] hover:underline">Ver todos</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overview.map(({ key, label, icon: Icon, tone }) => (
          <Link key={key} href={order ? `/app/orders?status=${key}` : "/app/missions"} className="group flex min-h-[72px] items-center gap-3 rounded-lg border border-[#dfe2e7] bg-white px-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-[#b9c4a0] hover:shadow-sm">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tone}`}><Icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1 text-[13px] font-medium text-[#6d7280]">{data[key] > 0 ? `${data[key]} ${label.toLowerCase()}` : `Nenhum ${label.toLowerCase()}`}</span>
            <ArrowRight className="h-4 w-4 text-[#a1a7b2] opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function CustomerAppHome() {
  const [dashboard, setDashboard] = useState<EnterpriseDashboard>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    enterpriseApi.dashboard()
      .then((response) => setDashboard({ ...EMPTY_DASHBOARD, ...response.data }))
      .catch((reason: ApiError) => setError(reason.detail || "Não foi possível atualizar o resumo."))
      .finally(() => setLoading(false));
  }, []);

  const completion = dashboard.profile_completion.percentage;

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-16 lg:pb-0">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,.78fr)]">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#668f06] to-[#a7d947] px-5 py-5 text-white shadow-[0_5px_12px_rgba(86,121,17,0.2)] sm:px-6">
          <div className="absolute -right-9 -top-12 h-44 w-44 rounded-[45%] border-[22px] border-white/10 rotate-[-20deg]" />
          <div className="absolute right-20 top-11 h-20 w-20 rounded-full border-[16px] border-white/10" />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">Enterprise workspace</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.035em] sm:text-[28px]">Solicite seus dados de realidade</h1>
            <p className="mt-1 max-w-3xl text-sm leading-5 text-white/90">Publique uma necessidade, encontre operadores homologados e acompanhe a entrega de dados geoespaciais em um único lugar.</p>
            <Link href="/app/missions/new" className="mt-4 inline-block"><Button size="sm" className="bg-white text-[#1d2512] hover:bg-white/90">Criar solicitação <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </section>
        <section className="rounded-xl border border-[#dfe2e7] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between text-sm font-bold text-[#555c68]">Total de pedidos <ArrowRight className="h-4 w-4 text-[#999fab]" /></div>
          <p className="mt-3 text-5xl font-extrabold tracking-[-0.05em] text-[#2d313a]">{loading ? "—" : dashboard.total_orders}</p>
          <div className="mt-3 h-1 rounded-full bg-[#75a90c]" />
        </section>
      </div>

      <section className="rounded-xl border border-[#e0e3e8] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#171a22]">Complete seu perfil</h2>
            <p className="mt-1 text-[13px] text-[#737a88]">Conclua os dados da empresa para liberar todas as funcionalidades. <strong className="text-[#252a33]">{completion}% concluído</strong></p>
          </div>
          <Link href="/app/enterprise"><Button size="sm">{completion === 100 ? "Ver perfil" : "Completar perfil"}</Button></Link>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eff0f2]"><div className="h-full rounded-full bg-[#17a269] transition-all" style={{ width: `${completion}%` }} /></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["Dados pessoais", dashboard.profile_completion.fields.personal_details],
            ["Contato e localização", dashboard.profile_completion.fields.contact_location],
            ["Faturamento", dashboard.profile_completion.fields.billing],
          ].map(([label, done]) => <span key={String(label)} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${done ? "border-[#c8edb9] bg-[#f3ffe9] text-[#6f9f1a]" : "border-[#e4e6ea] bg-[#fafafa] text-[#8a919e]"}`}>• {label}</span>)}
        </div>
      </section>

      {error && <div className="rounded-lg border border-[#f1c5c7] bg-[#fff4f4] px-4 py-3 text-sm text-[#bd4047]">{error}</div>}

      <OverviewRow title="Visão geral dos pedidos" data={dashboard.orders_overview} order />
      <OverviewRow title="Visão geral das missões" data={dashboard.missions_overview} order={false} />

      <section className="rounded-xl border border-[#e0e3e8] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-5">
        <div className="flex items-center justify-between"><h2 className="text-[15px] font-bold text-[#242832]">Notificações recentes</h2><Link href="/app/support" className="text-xs font-semibold text-[#587c12] hover:underline">Ver todas</Link></div>
        {dashboard.recent_notifications.length === 0 ? <div className="flex min-h-24 items-center justify-center text-[13px] text-[#9298a5]">Nenhuma notificação recente</div> : <div className="mt-3 divide-y divide-[#eef0f3]">{dashboard.recent_notifications.map((notice) => <div key={notice.id} className="py-3"><p className="text-sm font-semibold text-[#30343e]">{notice.title}</p>{notice.body && <p className="mt-0.5 text-xs text-[#777e8c]">{notice.body}</p>}</div>)}</div>}
      </section>

      <section className="flex items-center gap-3 rounded-xl border border-[#dcebbb] bg-[#f8ffed] p-4 text-sm text-[#4e621d]"><Sparkles className="h-5 w-5 text-[#77a91a]" /><span>O seu workspace está isolado por organização. Troque de organização somente pelo fluxo de sessão autorizado.</span></section>
    </div>
  );
}
