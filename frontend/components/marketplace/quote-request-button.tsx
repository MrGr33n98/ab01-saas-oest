"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";

export function QuoteRequestButton({
  slug,
  enabled,
}: {
  slug: string;
  enabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    message: "",
  });

  if (!enabled) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/marketplace/profiles/${slug}/quote_requests`, {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify(form),
      });
      setSent(true);
      setOpen(false);
    } catch (err) {
      setError((err as ApiError).detail || (err as ApiError).title || "Falha");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <p className="text-sm font-medium text-success">
        Solicitação enviada. O operador entrará em contato.
      </p>
    );
  }

  return (
    <div>
      <Button onClick={() => setOpen(!open)}>Solicitar orçamento</Button>
      {open && (
        <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-card border border-border p-4">
          {error && <p className="text-sm text-danger">{error}</p>}
          <input
            className="input"
            placeholder="Nome"
            required
            value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          />
          <input
            className="input"
            type="email"
            placeholder="E-mail"
            required
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Telefone"
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
          />
          <textarea
            className="input min-h-[80px]"
            placeholder="Descreva a necessidade"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Enviando…" : "Enviar"}
          </Button>
        </form>
      )}
    </div>
  );
}
