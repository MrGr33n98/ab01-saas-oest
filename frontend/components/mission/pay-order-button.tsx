"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";

type Props = {
  orderId: string;
  paymentStatus?: string | null;
};

export function PayOrderButton({ orderId, paymentStatus }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  if (paymentStatus === "paid") {
    return (
      <p className="text-sm font-medium text-success">Pagamento confirmado</p>
    );
  }

  async function checkout() {
    setBusy(true);
    setError(null);
    setHint(null);
    try {
      const res = await apiFetch<{
        data: {
          provider: string;
          checkout_url?: string | null;
          message?: string;
        };
      }>(`/orders/${orderId}/checkout`, { method: "POST", body: "{}" });

      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }
      setHint(
        res.data.message ||
          "Stripe desabilitado — pagamento manual/Pix via equipe DroneHub."
      );
    } catch (e) {
      const err = e as ApiError;
      setError(err.detail || err.title || "Falha no checkout");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={checkout} disabled={busy} className="w-full sm:w-auto">
        {busy ? "Abrindo checkout…" : "Pagar agora"}
      </Button>
      {hint && <p className="text-[13px] text-text-muted">{hint}</p>}
      {error && <p className="text-[13px] text-danger">{error}</p>}
    </div>
  );
}
