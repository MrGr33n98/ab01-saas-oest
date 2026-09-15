"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/auth/password/forgot", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err) {
      const e = err as ApiError;
      setError(e.detail || e.title || "Falha ao enviar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold text-text">Recuperar senha</h1>
      <p className="mt-1 text-sm text-text-muted">
        Enviaremos um link se o e-mail estiver cadastrado.
      </p>

      {sent ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-input border border-border bg-surface-soft px-3 py-3 text-sm text-text">
            Se existir uma conta para <strong>{email}</strong>, o e-mail já foi
            enfileirado (Mailpit em dev / SES em produção).
          </p>
          <Link href="/sign-in" className="btn-primary inline-flex">
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-input border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">
              {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Enviando…" : "Enviar link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link href="/sign-in" className="underline">
          Voltar
        </Link>
      </p>
    </div>
  );
}
