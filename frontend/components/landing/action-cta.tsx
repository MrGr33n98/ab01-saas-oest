"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/client";

export function ActionCta() {
  const { t, locale } = useTranslations();
  const isEn = locale === "en";

  return (
    <section className="bg-white py-28 text-center sm:py-36 lg:py-40">
      <div className="mx-auto max-w-[1000px] px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">
          {isEn ? "Next Step" : "Próximo passo"}
        </p>
        <h2 className="mt-5 text-[46px] font-bold leading-[0.94] tracking-[-0.05em] text-oest-ink sm:text-[62px] lg:text-[76px]">
          {isEn
            ? "Stop searching for drones. Start requesting results."
            : "Pare de procurar drones. Comece a solicitar resultados."}
        </h2>
        <Link
          href="/app/missions/new"
          className="btn-oest-green mt-9 px-6 py-3.5 inline-flex items-center gap-2"
        >
          <span>{t("landing.ctaPrimary")}</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
