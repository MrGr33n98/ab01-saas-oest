import Link from "next/link";

export function BrazilCoverage() {
  return (
    <section id="cobertura" className="overflow-hidden bg-white py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-[1320px] px-6 text-center lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">Cobertura distribuída</p>
        <h2 className="mx-auto mt-5 max-w-[950px] text-[44px] font-bold leading-[0.96] tracking-[-0.05em] text-oest-ink sm:text-[58px] lg:text-[72px]">
          A operação começa onde o seu ativo está.
        </h2>
        <p className="mx-auto mt-6 max-w-[680px] text-[16px] leading-relaxed text-oest-ink/65">
          Planeje missões em todo o Brasil com requisitos técnicos consistentes, independentemente da localização da demanda.
        </p>
        <div className="relative mx-auto mt-12 max-w-[700px] sm:mt-16">
          <svg aria-label="Mapa estilizado do Brasil com cinco polos de operação" className="h-auto w-full" role="img" viewBox="0 0 600 620" fill="none">
            <path d="M196 48 312 37l100 48 106 121-19 105-65 48-11 102-83 105-55-28-40-96-79-43-63-106 26-111 54-81 13-53Z" fill="#CAD7F6" fillOpacity=".65" stroke="#2A57B8" strokeWidth="2" />
            <path d="m130 184 280 190M226 109l90 353M167 294l256-83" stroke="#2A57B8" strokeDasharray="5 8" strokeOpacity=".28" />
            {[[235,141],[394,250],[317,314],[392,421],[279,502]].map(([x, y], index) => <g key={index}><circle cx={x} cy={y} r="13" fill="#1A9E60" fillOpacity=".14"/><circle cx={x} cy={y} r="5" fill={index === 2 ? "#F8C623" : "#2A57B8"}/></g>)}
          </svg>
          <div className="absolute bottom-[11%] right-[2%] border border-oest-ink/12 bg-white px-4 py-3 text-left shadow-sm sm:right-[5%]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-oest-blue">Território</p>
            <p className="mt-1 text-[12px] font-medium text-oest-ink">Solicite sua área de interesse.</p>
          </div>
        </div>
        <Link href="/coverage" className="mt-7 inline-flex text-[13px] font-semibold text-oest-blue underline-offset-4 hover:underline">Consultar cobertura <span className="ml-1" aria-hidden>→</span></Link>
      </div>
    </section>
  );
}
