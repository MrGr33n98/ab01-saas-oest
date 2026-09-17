"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

export function PlatformCtaBanner() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  return (
    <section className="relative overflow-hidden bg-[#D4F63C] py-20 sm:py-28 text-black">
      {/* Background Graphic Accents */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left Text */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[#D4F63C]">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-black/75">
                {isEn ? "Ready to launch?" : "Pronto para decolar?"}
              </span>
            </div>

            <h2 className="text-[38px] sm:text-[52px] lg:text-[60px] font-bold leading-[0.94] tracking-[-0.045em] text-black">
              {isEn
                ? "Request access to OEST's marketplace."
                : "Solicite acesso à plataforma OEST."}
            </h2>

            <p className="mt-4 text-[16px] sm:text-[18px] text-black/80 font-medium leading-relaxed">
              {isEn
                ? "Start capturing high-precision reality data with verified drone operators across Brazil today."
                : "Comece a capturar dados de realidade com a maior rede de operadores e pilotos de drone certificados do Brasil."}
            </p>
          </div>

          {/* Right Action Group */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <Link
              href="/app/missions/new"
              className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-black px-8 py-4 text-[15px] font-bold text-white shadow-xl transition-all duration-300 hover:bg-neutral-900 active:scale-[0.98]"
            >
              <span>{isEn ? "Request Flight Mission" : "Solicitar uma Missão"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/sign-up?role=operator"
              className="inline-flex items-center justify-center rounded-full border-2 border-black/30 bg-transparent px-6 py-4 text-[14px] font-bold text-black hover:border-black hover:bg-black/5 transition-all active:scale-[0.98]"
            >
              {isEn ? "Join as Operator" : "Sou Operador de Drone"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
