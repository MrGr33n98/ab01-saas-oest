"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";

function ResetForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    if (password.length < 8) {
      setError("Mínimo 8 caracteres");
      return;
    }
    if (!token) {
      setError("Link inválido — solicite um novo");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/auth/password/reset", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ token, password }),
      });
      router.push("/sign-in?reset=1");
    } catch (err) {
      const e = err as ApiError;
      setError(e.detail || e.title || "Não foi possível redefinir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold text-text">Nova senha</h1>
      <p className="mt-1 text-sm text-text-muted">Defina uma senha forte para a conta.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-input border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="password">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirmar
          </label>
          <input
            id="confirm"
            type="password"
            required
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Salvando…" : "Salvar senha"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link href="/sign-in" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-border/40" />}>
      <ResetForm />
    </Suspense>
  );
}
