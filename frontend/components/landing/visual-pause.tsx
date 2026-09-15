import Image from "next/image";

export function VisualPause() {
  return (
    <section className="relative isolate min-h-[420px] overflow-hidden bg-oest-ink sm:min-h-[520px]">
      <Image
        src="/images/oest-solar-inspection.webp"
        alt="Drone profissional inspecionando uma usina solar"
        fill
        priority={false}
        sizes="100vw"
        className="object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-oest-ink/50 via-oest-ink/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 mx-auto flex max-w-[1320px] items-end px-6 pb-6 lg:px-8">
        <p className="max-w-xs border-l border-oest-yellow pl-3 text-[11px] font-medium uppercase leading-relaxed tracking-[0.12em] text-white/90">
          Captura técnica em ativos que exigem decisão precisa.
        </p>
      </div>
    </section>
  );
}
