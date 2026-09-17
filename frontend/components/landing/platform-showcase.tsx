"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/client";

export function PlatformShowcase() {
  const { locale } = useTranslations();
  const isEn = locale === "en";

  return (
    <section id="plataforma" className="overflow-hidden bg-oest-ice/35 py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">
            {isEn ? "The OEST Platform" : "A plataforma OEST"}
          </p>
          <h2 className="mt-5 text-[40px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink sm:text-[52px] lg:text-[62px]">
            {isEn
              ? "Capture any asset. Anywhere. Whenever you need."
              : "Capture qualquer ativo. Em qualquer lugar. Quando precisar."}
          </h2>
          <p className="mx-auto mt-6 max-w-[680px] text-[16px] leading-relaxed text-oest-ink/65">
            {isEn
              ? "A structured workflow to turn field capture into organized, traceable reality data ready for your GIS and engineering pipelines."
              : "Um fluxo claro para transformar uma necessidade de campo em uma entrega organizada, rastreável e pronta para o seu ecossistema de dados."}
          </p>
          <Link
            href="/app/missions/new"
            className="mt-7 inline-flex items-center gap-1 text-[13px] font-semibold text-oest-blue underline-offset-4 hover:underline"
          >
            <span>{isEn ? "Explore mission workflow" : "Ver o fluxo de uma missão"}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="relative mx-auto mt-12 flex max-w-[1100px] justify-center px-2 sm:mt-16 sm:px-4">
          <div className="relative w-full max-w-[1040px] transition-all duration-500 ease-out sm:hover:scale-[1.01] sm:hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
            <Image
              src="/images/notebook-oset.png"
              alt="Dashboard OEST exibido em notebook"
              width={1536}
              height={1024}
              sizes="(max-width: 640px) 96vw, (max-width: 1024px) 90vw, 1040px"
              priority
              className="h-auto w-full object-contain filter drop-shadow-[0_24px_48px_rgba(8,21,37,0.10)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

