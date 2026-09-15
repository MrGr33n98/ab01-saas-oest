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

  function handleQuickDemoLogin(role: "customer" | "operator") {
    if (role === "customer") {
      saveSession({
        accessToken: "mock-jwt-customer-token",
        refreshToken: "mock-jwt-customer-refresh",
        orgId: "org-agro-1",
        email: "demo.cliente@dronehub.com.br",
      });
      router.push("/app/missions");
    } else {
      saveSession({
        accessToken: "mock-jwt-operator-token",
        refreshToken: "mock-jwt-operator-refresh",
        orgId: "org-aerovision-1",
        email: "demo.operador@dronehub.com.br",
      });
      router.push("/operator");
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Entrar no DroneHub</h1>
        <p className="mt-1 text-sm text-text-muted">
          Acesse missões, propostas, entregáveis e dashboards operacionais.
        </p>
      </div>

      {/* Demo Quick Access Banner */}
      <div className="rounded-input border border-primary/30 bg-primary/5 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            ⚡ Modo Demonstração Rápida (Mock Data)
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Teste toda a jornada da plataforma com dados simulados em 1 clique:
        </p>
        <div className="grid gap-2 sm:grid-cols-2 pt-1">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("customer")}
            className="rounded-input border border-primary/40 bg-surface px-3 py-2 text-xs font-semibold text-text hover:bg-surface-soft text-left transition shadow-xs"
          >
            🏢 <span className="font-bold">Cliente Agro</span>
            <span className="block text-[10px] text-text-muted font-normal">Workspace de Missões & Cotações</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("operator")}
            className="rounded-input border border-primary/40 bg-surface px-3 py-2 text-xs font-semibold text-text hover:bg-surface-soft text-left transition shadow-xs"
          >
            🛸 <span className="font-bold">Operador de Drones</span>
            <span className="block text-[10px] text-text-muted font-normal">Dashboard, Frota & Portfólio</span>
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
            placeholder="seu.email@empresa.com.br"
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
          {busy ? "Entrando…" : "Entrar com Senha"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
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
