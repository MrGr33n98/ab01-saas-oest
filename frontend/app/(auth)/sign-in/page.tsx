"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, Suspense } from "react";
import { Eye, EyeOff, Building2, Compass, ArrowRight, Sparkles, Check } from "lucide-react";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { saveSession } from "@/lib/api/auth-store";
import { DroneNetworkIllustration } from "@/components/auth/drone-network-illustration";
import { BrandLogo } from "@/components/layout/brand-logo";

type AuthResponse = {
  data: {
    user: { email: string; user_type?: "operator" | "enterprise" };
    organizations?: Array<{ id: string; slug?: string; role?: string; tenant_type?: "operator" | "enterprise" }>;
    organization?: { id: string; tenant_type?: "operator" | "enterprise" };
    tokens: { access_token: string; refresh_token?: string };
  };
};

type RoleMode = "customer" | "operator";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/app";
  const urlRole = searchParams.get("role") || searchParams.get("type");

  const [role, setRole] = useState<RoleMode>(
    urlRole === "operator" || urlRole === "drone_operator" ? "operator" : "customer"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (urlRole === "operator" || urlRole === "drone_operator") {
      setRole("operator");
    } else if (urlRole === "customer" || urlRole === "client") {
      setRole("customer");
    }
  }, [urlRole]);

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
      const tenantType = res.data.user.user_type || res.data.organization?.tenant_type;
      const matchingOrg = res.data.organizations?.find((organization) => organization.tenant_type === tenantType);
      const orgId = matchingOrg?.id || res.data.organization?.id || res.data.organizations?.[0]?.id || "";
      saveSession({
        accessToken: res.data.tokens.access_token,
        refreshToken: res.data.tokens.refresh_token,
        orgId,
        email: res.data.user.email,
        tenantType,
      });

      if (tenantType === "operator") {
        router.push("/operator");
      } else {
        router.push(next);
      }
    } catch (err) {
      const e = err as ApiError;
      setError(e.detail || e.title || "Credenciais inválidas. Verifique seu e-mail e senha.");
    } finally {
      setBusy(false);
    }
  }

  function handleQuickDemoLogin(roleTarget: RoleMode) {
    if (roleTarget === "customer") {
      saveSession({
        accessToken: "mock-jwt-customer-token",
        refreshToken: "mock-jwt-customer-refresh",
        orgId: "org-agro-1",
        email: "demo.empresa@oest.com.br",
        tenantType: "enterprise",
      });
      router.push("/app/missions");
    } else {
      saveSession({
        accessToken: "mock-jwt-operator-token",
        refreshToken: "mock-jwt-operator-refresh",
        orgId: "org-aerovision-1",
        email: "demo.operador@oest.com.br",
        tenantType: "operator",
      });
      router.push("/operator");
    }
  }

  const isCustomer = role === "customer";
  const bgClass = isCustomer ? "bg-[#B6FF55]" : "bg-[#5468FF]";
  const textClass = isCustomer ? "text-[#10170D]" : "text-white";
  const lineIllustrationColor = isCustomer ? "#10170D" : "#FFFFFF";

  return (
    <div
      className={`min-h-dvh w-full transition-colors duration-500 flex flex-col justify-between p-4 sm:p-8 lg:p-12 ${bgClass}`}
    >
      {/* Top Bar: Brand Logo & Role Switcher */}
      <div className="mx-auto w-full max-w-[1240px] flex items-center justify-between gap-4">
        <BrandLogo
          size="md"
          variant={isCustomer ? "auto" : "dark"}
          tagline="Drone Data as a Service"
          href="/"
        />

        {/* Role Toggle Selector */}
        <div className="flex items-center gap-1 rounded-full bg-black/10 p-1 backdrop-blur-md border border-black/5">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              isCustomer
                ? "bg-white text-[#10170D] shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Enterprise</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("operator")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              !isCustomer
                ? "bg-white text-[#5468FF] shadow-sm"
                : "text-[#10170D]/70 hover:text-[#10170D]"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Operador</span>
          </button>
        </div>
      </div>

      {/* Main Hero Grid: Illustration + Login Card */}
      <div className="mx-auto my-auto w-full max-w-[1240px] py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-[1.1fr_480px] gap-8 lg:gap-14 items-center">
        {/* Left Column: Heading, Value Proposition & Vector Illustration */}
        <div className={`space-y-6 ${textClass} select-none`}>
          {/* Section Header */}
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  isCustomer
                    ? "border-[#10170D]/20 bg-[#10170D]/10 text-[#10170D]"
                    : "border-white/20 bg-white/10 text-white"
                }`}
              >
                {isCustomer ? (
                  <Building2 className="h-5 w-5" />
                ) : (
                  <Compass className="h-5 w-5" />
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {isCustomer ? "Enterprise" : "Drone operator"}
              </h1>
            </div>

            <p className="text-base sm:text-lg font-medium leading-relaxed opacity-90">
              {isCustomer
                ? "Escale a captura de dados de drones em todo o território nacional e acesse operadores certificados pelo DECEA/ANAC em poucos cliques."
                : "Faça parte da maior rede de operadores de drones homologados do Brasil e receba missões remuneradas na sua região."}
            </p>
          </div>

          {/* Precision Vector Line-Art Illustration (Generated in Code) */}
          <div className="pt-2 flex items-center justify-center lg:justify-start">
            <DroneNetworkIllustration
              color={lineIllustrationColor}
              className="transition-colors duration-500 drop-shadow-sm max-h-[380px]"
            />
          </div>
        </div>

        {/* Right Column: Clean White Authentication Card */}
        <div className="w-full">
          <div className="rounded-[28px] border border-black/5 bg-white p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            {/* Card Header */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#10170D]">
                Bem-vindo de volta!
              </h2>
              <p className="text-xs sm:text-[13px] text-text-muted leading-relaxed">
                {isCustomer
                  ? "Acesse sua conta para gerenciar demandas, missões e dados geoespaciais com facilidade."
                  : "Acesse sua conta para acompanhar missões disponíveis, propostas e histórico de voos."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-xs font-medium text-danger">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#10170D]"
                >
                  Endereço de e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com.br"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-[#10170D] focus:outline-none focus:ring-1 focus:ring-[#10170D] transition"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#10170D]"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text placeholder:text-text-muted/60 focus:border-[#10170D] focus:outline-none focus:ring-1 focus:ring-[#10170D] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text focus:outline-none"
                    aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-text-muted">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-[#10170D] focus:ring-0"
                  />
                  <span>Lembrar-me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-text-muted hover:text-[#10170D] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Primary Black Sign In Button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#10170D] hover:bg-black py-3.5 text-center text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-70"
              >
                {busy ? "Entrando…" : "Entrar"}
              </button>

              {/* Google Social Button */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(role)}
                className="w-full rounded-xl border border-border/90 bg-white hover:bg-surface-soft py-2.5 text-center text-xs font-semibold text-text shadow-2xs transition flex items-center justify-center gap-2.5"
              >
                <GoogleIcon />
                <span>Continuar com Google</span>
              </button>
            </form>

            {/* Quick 1-Click Evaluation Strip */}
            <div className="mt-5 rounded-xl border border-border/80 bg-surface-soft p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] text-text-muted font-medium">
                  Modo de Demonstração (Mock):
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(role)}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <span>Acesso em 1 clique</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 border-t border-border/60 pt-4 text-center">
              <p className="text-xs text-text-muted">
                Novo na OEST?{" "}
                <Link
                  href={
                    isCustomer
                      ? "/sign-up?type=customer"
                      : "/sign-up?type=drone_operator"
                  }
                  className="font-bold text-[#10170D] hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Compliance */}
      <div className={`mx-auto w-full max-w-[1240px] text-center text-xs opacity-75 ${textClass}`}>
        OEST Drone Data Platform · Conformidade ANAC & DECEA · Brasil
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh w-full bg-[#B6FF55] flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
