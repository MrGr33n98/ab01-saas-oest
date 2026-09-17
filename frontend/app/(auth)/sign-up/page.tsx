"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { saveSession } from "@/lib/api/auth-store";
import { Building2, Compass, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";

type AuthResponse = {
  data: {
    user: { email: string; user_type?: "operator" | "enterprise" };
    organization: { id: string; organization_type?: string; tenant_type?: "operator" | "enterprise" };
    tokens: { access_token: string; refresh_token?: string };
  };
};

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") || searchParams.get("role")) === "drone_operator" ? "drone_operator" : "customer";

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    organization_name: "",
    organization_type: initialType,
    profile_kind: "solo",
    company_name: "",
    accepted_terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = searchParams.get("type") || searchParams.get("role");
    if (t === "drone_operator" || t === "customer") {
      setForm((f) => ({ ...f, organization_type: t }));
    }
  }, [searchParams]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.accepted_terms) {
      setError("Aceite os termos para continuar");
      return;
    }
    if (form.password.length < 8) {
      setError("Senha com no mínimo 8 caracteres");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<AuthResponse>("/auth/sign_up", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          ...form,
          user_type: form.organization_type === "drone_operator" ? "operator" : "enterprise",
          accepted_terms: true,
          profile_kind: form.organization_type === "drone_operator" ? form.profile_kind : undefined,
          company_name: form.company_name || undefined,
        }),
      });
      saveSession({
        accessToken: res.data.tokens.access_token,
        refreshToken: res.data.tokens.refresh_token,
        orgId: res.data.organization.id,
        email: res.data.user.email,
        tenantType: res.data.user.user_type || res.data.organization.tenant_type,
      });
      const dest =
        (res.data.user.user_type || res.data.organization.tenant_type) === "operator"
          ? "/operator"
          : "/app";
      router.push(dest);
    } catch (err) {
      const e = err as ApiError;
      setError(e.detail || e.title || "Não foi possível criar a conta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <div className="mx-auto w-full max-w-[1240px] flex items-center justify-between pb-6">
        <BrandLogo size="md" tagline="Drone Data as a Service" href="/" />
        <Link href="/sign-in" className="text-xs font-bold text-text-muted hover:text-oest-ink">
          Já tem conta? Entrar →
        </Link>
      </div>

      {/* Card */}
      <div className="mx-auto my-auto w-full max-w-xl rounded-3xl border border-border/80 bg-white p-6 sm:p-10 shadow-2xl ring-1 ring-black/5">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-oest-ink">
            Criar Conta na OEST
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Comece a publicar missões ou receba jobs remunerados com sua frota.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-2 text-xs text-danger font-medium">
            {error}
          </div>
        )}

        {/* Tipo de Conta Toggle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text">
            Perfil de Acesso
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => set("organization_type", "customer")}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                form.organization_type === "customer"
                  ? "border-[#10170D] bg-[#B6FF55]/20 ring-1 ring-[#10170D]"
                  : "border-border hover:bg-surface-soft"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-black/10">
                <Building2 className="h-4 w-4 text-text" />
              </div>
              <div>
                <p className="text-xs font-bold text-text">Empresa / Cliente</p>
                <p className="text-[10px] text-text-muted">Contratar dados</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => set("organization_type", "drone_operator")}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                form.organization_type === "drone_operator"
                  ? "border-[#5468FF] bg-[#5468FF]/10 ring-1 ring-[#5468FF]"
                  : "border-border hover:bg-surface-soft"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-black/10">
                <Compass className="h-4 w-4 text-[#5468FF]" />
              </div>
              <div>
                <p className="text-xs font-bold text-text">Operador de Drone</p>
                <p className="text-[10px] text-text-muted">Voar & coletar dados</p>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-text mb-1" htmlFor="first">
              Nome
            </label>
            <input
              id="first"
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-oest-blue focus:outline-none focus:ring-1 focus:ring-oest-blue"
              required
              value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text mb-1" htmlFor="last">
              Sobrenome
            </label>
            <input
              id="last"
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-oest-blue focus:outline-none focus:ring-1 focus:ring-oest-blue"
              value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1" htmlFor="email">
            E-mail corporativo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-oest-blue focus:outline-none focus:ring-1 focus:ring-oest-blue"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="seu.email@empresa.com.br"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1" htmlFor="password">
            Senha (mínimo 8 caracteres)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-oest-blue focus:outline-none focus:ring-1 focus:ring-oest-blue"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1" htmlFor="org">
            Nome da Organização ou Operação
          </label>
          <input
            id="org"
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-oest-blue focus:outline-none focus:ring-1 focus:ring-oest-blue"
            placeholder="Empresa, Fazenda ou Nome Comercial"
            value={form.organization_name}
            onChange={(e) => set("organization_name", e.target.value)}
          />
        </div>

        {form.organization_type === "drone_operator" && (
          <div className="space-y-2 rounded-xl bg-surface-soft p-3.5 border border-border/80">
            <label className="block text-xs font-semibold text-text">Estrutura Operacional</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set("profile_kind", "solo")}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                  form.profile_kind === "solo"
                    ? "border-text bg-white font-bold text-text shadow-2xs"
                    : "border-border text-text-muted"
                }`}
              >
                Piloto Solo / Autônomo
              </button>
              <button
                type="button"
                onClick={() => set("profile_kind", "company")}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                  form.profile_kind === "company"
                    ? "border-text bg-white font-bold text-text shadow-2xs"
                    : "border-border text-text-muted"
                }`}
              >
                Empresa com Frota / CNPJ
              </button>
            </div>
            {form.profile_kind === "company" && (
              <input
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-text placeholder:text-text-muted/60 mt-2"
                placeholder="Razão Social / CNPJ"
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
              />
            )}
          </div>
        )}

        <label className="flex items-start gap-2 text-xs text-text-muted pt-2">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-border"
            checked={form.accepted_terms}
            onChange={(e) => set("accepted_terms", e.target.checked)}
          />
          <span>
            Aceito os{" "}
            <Link href="/legal/terms" className="underline text-text font-medium">
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link href="/legal/privacy" className="underline text-text font-medium">
              política de privacidade
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-accent hover:brightness-95 py-3.5 px-4 text-center text-sm font-bold text-accent-ink shadow-md transition-all active:scale-[0.99]"
        >
          {busy ? "Criando Conta…" : "Criar Conta na OEST"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-muted">
        Já possui conta?{" "}
        <Link href="/sign-in" className="font-bold text-text hover:text-oest-blue underline">
          Entrar
        </Link>
      </p>
      </div>

      <div className="mx-auto w-full max-w-[1240px] text-center text-xs text-text-muted pt-6">
        OEST · Infraestrutura de Dados Geoespaciais & Drones Homologados · Brasil
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-border/30" />}>
      <SignUpContent />
    </Suspense>
  );
}
