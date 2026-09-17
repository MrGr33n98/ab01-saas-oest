"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  MapPin,
  Plane,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { operatorApi, type OperatorDashboard } from "@/lib/api/operator";
import type { ApiError } from "@/lib/api/client";

const FALLBACK: OperatorDashboard = {
  organization: { id: "", name: "Sua operação", tenant_type: "operator", verification_status: "pending", accepting_jobs: true },
  profile_completion: { percentage: 0, complete: false, completed_sections: [] },
  onboarding_stages: [],
  invites_overview: { active: 0, accepted: 0 },
  orders_overview: { active: 0, completed: 0, pending_payment: 0 },
  missions_overview: { active: 0, completed: 0 },
  recent_invites: [],
  recent_notifications: [],
};

function Metric({ label, value, icon: Icon, href }: { label: string; value: number; icon: typeof Plane; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Icon className="h-4 w-4" /></span>
      </div>
      <strong className="mt-5 block text-3xl tracking-tight text-slate-950">{value}</strong>
      <span className="mt-2 inline-flex items-center text-xs font-semibold text-violet-700">Abrir <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
    </Link>
  );
}

export default function OperatorDashboardPage() {
  const [dashboard, setDashboard] = useState<OperatorDashboard>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    operatorApi.dashboard()
      .then((response) => setDashboard(response.data))
      .catch((reason: ApiError) => setError(reason.detail || reason.title || "Não foi possível carregar o seu painel."))
      .finally(() => setLoading(false));
  }, []);

  const completion = dashboard.profile_completion.percentage;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 px-6 py-7 text-white shadow-xl shadow-violet-900/15 md:px-9 md:py-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5" /> Operator workspace</span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Olá, {dashboard.organization.name}</h1>
            <p className="mt-2 text-sm leading-6 text-violet-100">Complete seu perfil operacional para se tornar elegível para novos convites dentro da sua área de disponibilidade.</p>
          </div>
          <Link href="/operator/onboarding">
            <Button className="bg-white text-violet-800 hover:bg-violet-50">{completion === 100 ? "Revisar cadastro" : "Continuar cadastro"}<ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Convites ativos" value={dashboard.invites_overview.active} icon={ClipboardList} href="/operator/invites" />
        <Metric label="Pedidos ativos" value={dashboard.orders_overview.active} icon={ReceiptText} href="/operator/missions" />
        <Metric label="Missões concluídas" value={dashboard.missions_overview.completed} icon={Plane} href="/operator/missions" />
        <Metric label="Pedidos concluídos" value={dashboard.orders_overview.completed} icon={FileCheck2} href="/operator/invoices" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-semibold text-slate-950">Progresso do perfil</h2>
                <p className="mt-1 text-sm text-slate-500">Este cadastro informa seu match e a análise da equipe DroneHub.</p>
              </div>
              <strong className="text-2xl text-violet-700">{loading ? "…" : `${completion}%`}</strong>
            </div>
            <div className="px-6 pt-5"><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${completion}%` }} /></div></div>
            <div className="divide-y divide-slate-100 px-6 py-3">
              {dashboard.onboarding_stages.map((stage) => (
                <Link key={stage.id} href={stage.href} className="flex items-center gap-3 py-3.5 text-sm transition hover:text-violet-700">
                  <CheckCircle2 className={`h-5 w-5 ${stage.complete ? "text-emerald-500" : "text-slate-300"}`} />
                  <span className="flex-1 font-medium text-slate-700">{stage.label}</span>
                  {stage.complete ? <span className="text-xs font-semibold text-emerald-600">Concluído</span> : <ArrowRight className="h-4 w-4 text-slate-400" />}
                </Link>
              ))}
              {!loading && dashboard.onboarding_stages.length === 0 && <p className="py-6 text-sm text-slate-500">Comece o cadastro para acompanhar as suas etapas.</p>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-600" /><h2 className="font-semibold text-slate-950">Seu status operacional</h2></div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{dashboard.organization.accepting_jobs ? "Você está disponível para novos jobs assim que o perfil for aprovado." : "Sua disponibilidade para novos jobs está pausada."}</p>
              <Link href="/operator/settings" className="mt-5 inline-flex text-sm font-semibold text-violet-700 hover:text-violet-800">Gerenciar disponibilidade <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-violet-600" /><h2 className="font-semibold text-slate-950">Atualizações recentes</h2></div>
              <div className="mt-4 space-y-4">
                {dashboard.recent_notifications.slice(0, 3).map((notification) => <div key={notification.id}><p className="text-sm font-medium text-slate-800">{notification.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{notification.body}</p></div>)}
                {!loading && dashboard.recent_notifications.length === 0 && <p className="text-sm text-slate-500">Nenhuma atualização por enquanto.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
