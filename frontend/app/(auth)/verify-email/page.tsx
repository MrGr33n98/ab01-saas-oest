"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [message, setMessage] = useState<string>("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    apiFetch<{ data: { message: string } }>("/auth/verify_email", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (mounted) {
          setStatus("success");
          setMessage(res.data.message || "E-mail confirmado com sucesso!");
        }
      })
      .catch((err: ApiError) => {
        if (mounted) {
          setStatus("error");
          setMessage(err.detail || err.title || "Link de confirmação inválido ou expirado.");
        }
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  async function onResend(e: FormEvent) {
    e.preventDefault();
    if (!resendEmail) return;
    setResendBusy(true);
    try {
      await apiFetch("/auth/resend_verification", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendSent(true);
    } catch {
      // Always show success message to prevent user enumeration
      setResendSent(true);
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold text-text">Confirmação de e-mail</h1>
      <p className="mt-1 text-sm text-text-muted">
        Verificação de segurança da sua conta DroneHub.
      </p>

      {status === "verifying" && (
        <div className="mt-8 text-center py-6">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
          <p className="mt-4 text-sm text-text">Verificando seu e-mail…</p>
        </div>
      )}

      {status === "success" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-input border border-green-300 bg-green-50 p-4 text-green-900 text-sm">
            <p className="font-semibold">✓ {message}</p>
            <p className="mt-1 text-xs opacity-90">
              Sua conta está verificada e pronta para publicar e aceitar missões.
            </p>
          </div>
          <Link href="/sign-in" className="btn-primary inline-flex w-full justify-center">
            Fazer login
          </Link>
        </div>
      )}

      {(status === "error" || status === "idle") && (
        <div className="mt-6 space-y-6">
          {status === "error" && (
            <div className="rounded-input border border-danger/30 bg-danger/5 p-4 text-danger text-sm">
              <p className="font-medium">Falha na verificação</p>
              <p className="mt-1 text-xs">{message}</p>
            </div>
          )}

          {status === "idle" && (
            <p className="text-sm text-text-muted">
              Informe seu e-mail abaixo para receber um novo link de confirmação.
            </p>
          )}

          {resendSent ? (
            <div className="rounded-input border border-border bg-surface-soft p-4 text-sm text-text">
              Link enviado! Verifique sua caixa de entrada e pasta de spam.
            </div>
          ) : (
            <form onSubmit={onResend} className="space-y-4">
              <div>
                <label className="label" htmlFor="resend-email">
                  E-mail cadastrado
                </label>
                <input
                  id="resend-email"
                  type="email"
                  required
                  className="input"
                  placeholder="voce@empresa.com.br"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={resendBusy}>
                {resendBusy ? "Enviando…" : "Reenviar link de confirmação"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-text-muted">
            <Link href="/sign-in" className="underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-border/40" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
