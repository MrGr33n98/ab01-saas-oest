"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";

type Plan = {
  id: string;
  slug: string;
  name: string;
  price_monthly_cents?: number;
  features_json?: Record<string, boolean>;
  active?: boolean;
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Array<{ key: string; name: string; min_plan: string }>>([]);

  useEffect(() => {
    apiFetch<{ data: Plan[] }>("/admin/plans").then((r) => setPlans(r.data || [])).catch(() => {});
    apiFetch<{ data: Array<{ key: string; name: string; min_plan: string }> }>("/admin/feature_definitions")
      .then((r) => setFeatures(r.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <h1 className="text-2xl font-semibold">Admin · Planos & features</h1>
      <section>
        <h2 className="font-medium">Planos</h2>
        <ul className="mt-3 space-y-3">
          {plans.map((p) => (
            <li key={p.id} className="rounded-card border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{p.name}</span>
                <Badge variant="secondary">{p.slug}</Badge>
                {p.active === false && <Badge>Inativo</Badge>}
              </div>
              <p className="text-sm text-text-muted">
                {((p.price_monthly_cents || 0) / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
                /mês
              </p>
              <p className="mt-2 text-xs text-text-muted">
                {Object.entries(p.features_json || {})
                  .filter(([, v]) => v)
                  .map(([k]) => k)
                  .join(" · ") || "—"}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-medium">Catálogo de features</h2>
        <ul className="mt-3 divide-y divide-border text-sm">
          {features.map((f) => (
            <li key={f.key} className="flex justify-between py-2">
              <span>{f.name}</span>
              <span className="text-text-muted">
                {f.key} · min {f.min_plan}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
