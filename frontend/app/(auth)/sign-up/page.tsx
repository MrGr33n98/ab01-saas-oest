"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { saveSession } from "@/lib/api/auth-store";

type AuthResponse = {
  data: {
    user: { email: string };
    organization: { id: string; organization_type?: string };
    tokens: { access_token: string; refresh_token?: string };
  };
};

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    organization_name: "",
    organization_type: "customer",
    profile_kind: "solo",
    company_name: "",
    accepted_terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      });
      const dest =
        res.data.organization.organization_type === "drone_operator"
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
    <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight text-text">Criar conta</h1>
      <p className="mt-1 text-sm text-text-muted">
        Comece a publicar missões ou a receber jobs.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-input border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="first">
              Nome
            </label>
            <input
              id="first"
              className="input"
              required
              value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="last">
              Sobrenome
            </label>
            <input
              id="last"
              className="input"
              value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="email">
            E-mail corporativo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
          <p className="mt-1 text-[12px] text-text-muted">Mínimo 8 caracteres</p>
        </div>

        <div>
          <label className="label" htmlFor="org">
            Nome da organização
          </label>
          <input
            id="org"
            className="input"
            placeholder="Fazenda / empresa / operação"
            value={form.organization_name}
            onChange={(e) => set("organization_name", e.target.value)}
          />
        </div>

        <fieldset>
          <legend className="label">Tipo de conta</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  id: "customer",
                  title: "Cliente",
                  desc: "Publico missões e contrato dados",
                },
                {
                  id: "drone_operator",
                  title: "Operador",
                  desc: "Recebo jobs e entrego dados",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => set("organization_type", opt.id)}
                className={`rounded-input border px-3 py-3 text-left transition-colors ${
                  form.organization_type === opt.id
                    ? "border-accent-ink bg-accent/40 ring-1 ring-accent-ink"
                    : "border-border hover:border-border-strong"
                }`}
              >
                <p className="text-sm font-medium text-text">{opt.title}</p>
                <p className="mt-0.5 text-[12px] text-text-muted">{opt.desc}</p>
              </button>
            ))}
          </div>
        </fieldset>

        {form.organization_type === "drone_operator" && (
          <fieldset>
            <legend className="label">Tipo de operador</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  { id: "solo", title: "Solo", desc: "Piloto / micro operação" },
                  { id: "company", title: "Empresa", desc: "CNPJ / frota / time" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => set("profile_kind", opt.id)}
                  className={`rounded-input border px-3 py-3 text-left ${
                    form.profile_kind === opt.id
                      ? "border-accent-ink bg-accent/40"
                      : "border-border"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.title}</p>
                  <p className="text-[12px] text-text-muted">{opt.desc}</p>
                </button>
              ))}
            </div>
            {form.profile_kind === "company" && (
              <input
                className="input mt-3"
                placeholder="Razão social"
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
              />
            )}
          </fieldset>
        )}

        <label className="flex items-start gap-2 text-[13px] text-text-muted">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.accepted_terms}
            onChange={(e) => set("accepted_terms", e.target.checked)}
          />
          <span>
            Aceito os{" "}
            <Link href="/legal/terms" className="underline">
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link href="/legal/privacy" className="underline">
              política de privacidade
            </Link>
            .
          </span>
        </label>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Criando…" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Já tem conta?{" "}
        <Link href="/sign-in" className="font-medium text-text underline-offset-2 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
