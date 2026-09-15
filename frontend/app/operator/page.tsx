"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Target,
  Wallet,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Plane,
} from "lucide-react";
import { StatCard } from "@/components/operator/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ActivationChecklist,
  type ChecklistItem,
} from "@/components/onboarding/activation-checklist";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useTranslations } from "@/lib/i18n/client";

type Job = {
  mission_id: string;
  title: string;
  status: string;
  area_hectares?: number | null;
  deadline_at?: string | null;
  invited?: boolean;
};

export default function OperatorDashboardPage() {
  const { t, locale } = useTranslations();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activation, setActivation] = useState<ChecklistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ data: Job[] }>("/operator/jobs"),
      apiFetch<{
        data: {
          items: Array<{
            id: string;
            label: string;
            label_en?: string;
            done: boolean;
            href?: string;
          }>;
        };
      }>("/operator/activation"),
    ])
      .then(([jobsRes, actRes]) => {
        setJobs(jobsRes.data || []);
        setActivation(
          (actRes.data?.items || []).map((i) => ({
            id: i.id,
            label: locale === "en" && i.label_en ? i.label_en : i.label,
            done: !!i.done,
            href: i.href,
          }))
        );
      })
      .catch((e: ApiError) =>
        setError(e.detail || e.title || t("common.error"))
      )
      .finally(() => setLoading(false));
  }, [locale, t]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">Operator Hub</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text md:text-3xl">
            {t("operator.hubTitle")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-text-muted">
            {t("operator.hubSubtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/operator/payments">
            <Button size="sm">{t("nav.payments")}</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard
            label={t("nav.jobs")}
            value={loading ? "…" : String(jobs.length)}
            hint={t("operator.jobsAvailable")}
            icon={Briefcase}
          />
          <StatCard label={t("nav.proposals")} value="—" icon={FileText} />
          <StatCard label="Win rate" value="—" icon={Target} />
          <StatCard label="GMV 30d" value="—" icon={Wallet} />
        </div>
        <ActivationChecklist
          title={t("operator.activation")}
          items={activation}
        />
      </div>

      {error && (
        <div className="rounded-input border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("operator.jobsAvailable")}</CardTitle>
          <CardDescription>API · matching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-text-muted">{t("common.loading")}</p>}
          {!loading && jobs.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">{t("operator.noJobs")}</p>
          )}
          {jobs.map((job) => (
            <Link
              key={job.mission_id}
              href="/operator/jobs"
              className="group flex items-start gap-3 rounded-input border border-border bg-surface-soft/50 p-3 hover:border-border-strong"
            >
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-input bg-surface text-accent-ink">
                <Plane className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <p className="font-medium text-text group-hover:underline">{job.title}</p>
                  {job.invited && <Badge variant="accent">Invite</Badge>}
                  <Badge variant="secondary">{job.status}</Badge>
                </div>
                {job.deadline_at && (
                  <p className="mt-1 text-xs text-text-muted">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {new Date(job.deadline_at).toLocaleDateString(
                      locale === "en" ? "en-US" : "pt-BR"
                    )}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100" />
            </Link>
          ))}
          <Link href="/operator/missions">
            <Button variant="secondary" size="sm" className="mt-2 w-full">
              {t("nav.missions")} <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
