import Link from "next/link";

const proof = ["Solicitação orientada por ativo", "Matching por capacidade", "Dados prontos para integrar"];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-28 sm:pb-28 sm:pt-36 lg:pb-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <p className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">
              <span className="h-2 w-2 bg-oest-yellow" />
              Drone as a Service · Reality Data
            </p>
            <h1 className="max-w-[650px] text-[48px] font-bold leading-[0.94] tracking-[-0.05em] text-oest-ink sm:text-[60px] lg:text-[78px]">
              Dados do mundo real para decisões que movem negócios.
            </h1>
            <p className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-oest-ink/70 sm:text-[19px]">
              Solicite uma missão, encontre capacidade operacional e receba dados geoespaciais para a próxima decisão da sua equipe.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/app/missions/new" className="btn-oest-green px-6 py-3.5">
                Solicitar uma missão <span aria-hidden>→</span>
              </Link>
              <Link href="#plataforma" className="btn-oest-outline px-6 py-3.5">
                Conhecer a plataforma
              </Link>
            </div>
            <ul className="mt-10 flex max-w-[600px] flex-wrap gap-x-6 gap-y-3 border-t border-oest-ink/15 pt-4 text-[12px] text-oest-ink/65">
              {proof.map((item) => (
                <li className="flex items-center gap-2" key={item}>
                  <span className="h-1.5 w-1.5 rounded-full bg-oest-green" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative overflow-hidden border border-oest-ink/15 bg-oest-navy p-3 sm:p-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3 text-[10px] font-medium uppercase tracking-[0.12em] text-oest-ice">
                <span>Mission Control / Mapa de captura</span>
                <span className="text-oest-green">Planejamento ativo</span>
              </div>
              <div className="relative mt-3 aspect-[16/10] overflow-hidden border border-white/10 bg-[#14223c]">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: "linear-gradient(rgba(202,215,246,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(202,215,246,.16) 1px, transparent 1px)", backgroundSize: "36px 36px" }}
                />
                <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 640 400" fill="none">
                  <path d="M70 93 500 65l85 224-415 54L70 93Z" fill="#2A57B8" fillOpacity=".28" stroke="#CAD7F6" strokeWidth="2" />
                  {[120, 155, 190, 225, 260].map((y) => <path key={y} d={`M106 ${y} 535 ${y - 22}`} stroke="#CAD7F6" strokeDasharray="5 6" strokeOpacity=".65" />)}
                  <circle cx="348" cy="182" r="10" fill="#1A9E60" />
                  <circle cx="348" cy="182" r="22" stroke="#1A9E60" strokeOpacity=".7" />
                </svg>
                <div className="absolute right-3 top-3 border border-white/15 bg-oest-ink/85 px-3 py-2 text-[10px] leading-5 text-white sm:right-5 sm:top-5">
                  <p className="text-white/50">ATIVO</p>
                  <p>Usina solar · inspeção</p>
                  <p className="mt-1 text-oest-yellow">GSD alvo: 1,8 cm/px</p>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 border border-white/15 bg-oest-ink/85 px-3 py-2 text-[10px] text-white sm:bottom-5 sm:left-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-oest-green" />
                  Área de interesse validada
                </div>
              </div>
              <div className="grid grid-cols-3 gap-px bg-white/10 text-[10px] uppercase tracking-[0.08em] text-white/75">
                <div className="bg-oest-navy px-3 py-3"><span className="block text-white/45">Tipo</span>Fotogrametria</div>
                <div className="bg-oest-navy px-3 py-3"><span className="block text-white/45">Entrega</span>GeoTIFF / LAS</div>
                <div className="bg-oest-navy px-3 py-3"><span className="block text-white/45">Status</span><span className="text-oest-green">Pronto para cotar</span></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden border border-oest-ink/15 bg-white px-4 py-3 sm:block lg:-left-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-oest-blue">Missão</p>
              <p className="mt-1 text-sm font-semibold text-oest-ink">Um pedido, uma visão operacional.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
