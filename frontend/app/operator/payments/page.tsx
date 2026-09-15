"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useTranslations } from "@/lib/i18n/client";

type ConnectData = {
  stripe_enabled?: boolean;
  account_id?: string | null;
  status?: {
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    details_submitted?: boolean;
  };
  platform_fee_bps?: number;
};

export default function OperatorPaymentsPage() {
  const { t } = useTranslations();
  const [data, setData] = useState<ConnectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await apiFetch<{ data: ConnectData }>("/operator/connect");
      setData(res.data);
    } catch (e) {
      setError((e as ApiError).detail || (e as ApiError).title || t("common.error"));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function startOnboarding() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{
        data: { onboarding_url?: string; message?: string };
      }>("/operator/connect", { method: "POST", body: "{}" });
      if (res.data.onboarding_url) {
        window.location.href = res.data.onboarding_url;
        return;
      }
      setError(res.data.message || "Connect offline — payouts manuais");
    } catch (e) {
      setError((e as ApiError).detail || (e as ApiError).title || t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  const ready = data?.status?.payouts_enabled || data?.status?.charges_enabled;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-text">{t("nav.payments")}</h1>
      <p className="text-sm text-text-muted">{t("operator.connectPayouts")}</p>
      {error && (
        <div className="rounded-input border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Stripe Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-text-muted">
            Stripe: {data?.stripe_enabled ? "on" : "off"} · fee{" "}
            {data?.platform_fee_bps != null
              ? `${(data.platform_fee_bps / 100).toFixed(1)}%`
              : "—"}
          </p>
          {data?.account_id && (
            <p className="font-mono text-xs text-text-muted">{data.account_id}</p>
          )}
          {ready ? (
            <p className="font-medium text-success">{t("operator.connectReady")}</p>
          ) : (
            <Button onClick={startOnboarding} disabled={busy}>
              {busy ? t("common.loading") : t("operator.connectCta")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
