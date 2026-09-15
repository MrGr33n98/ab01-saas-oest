"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { saveSession } from "@/lib/api/auth-store";

type AuthResponse = {
  data: {
    user: { email: string };
    organizations?: Array<{ id: string; slug?: string; role?: string }>;
    organization?: { id: string };
    tokens: { access_token: string; refresh_token?: string };
  };
};

function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<AuthResponse>("/auth/sign_in", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email, password }),
      });
      const orgId =
        res.data.organization?.id || res.data.organizations?.[0]?.id || "";
      saveSession({
        accessToken: res.data.tokens.access_token,
        refreshToken: res.data.tokens.refresh_token,
        orgId,
        email: res.data.user.email,
      });
      router.push(next);
    } catch (err) {
      const e = err as ApiError;
      setError(e.detail || e.title || "Não foi possível entrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight text-text">Entrar</h1>
      <p className="mt-1 text-sm text-text-muted">
        Acesse missões, propostas e entregas.
      </p>

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
            autoComplete="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-text-muted hover:text-text"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Não tem conta?{" "}
        <Link href="/sign-up" className="font-medium text-text underline-offset-2 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-border/40" />}>
      <SignInForm />
    </Suspense>
  );
}
