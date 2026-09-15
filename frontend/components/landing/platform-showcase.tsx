import Link from "next/link";

export function PlatformShowcase() {
  return (
    <section id="plataforma" className="overflow-hidden bg-oest-ice/35 py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">A plataforma OEST</p>
          <h2 className="mt-5 text-[40px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink sm:text-[52px] lg:text-[62px]">
            Capture qualquer ativo. Em qualquer lugar. Quando precisar.
          </h2>
          <p className="mx-auto mt-6 max-w-[680px] text-[16px] leading-relaxed text-oest-ink/65">
            Um fluxo claro para transformar uma necessidade de campo em uma entrega organizada, rastreável e pronta para o seu ecossistema de dados.
          </p>
          <Link href="/app/missions/new" className="mt-7 inline-flex text-[13px] font-semibold text-oest-blue underline-offset-4 hover:underline">
            Ver o fluxo de uma missão <span className="ml-1" aria-hidden>→</span>
          </Link>
        </div>

        <div className="relative mx-auto mt-14 max-w-[1100px] pt-8 sm:mt-18">
          <div className="overflow-hidden border border-oest-ink/15 bg-white">
            <div className="flex items-center gap-1.5 border-b border-oest-ink/10 bg-white px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-oest-ink/20" />
              <span className="h-2 w-2 rounded-full bg-oest-ink/20" />
              <span className="h-2 w-2 rounded-full bg-oest-ink/20" />
              <span className="ml-3 text-[10px] font-medium tracking-[0.08em] text-oest-ink/45">APP.OEST / MISSÕES / NOVA SOLICITAÇÃO</span>
            </div>
            <div className="grid min-h-[430px] grid-cols-[170px_1fr] bg-[#f7f9ff] sm:min-h-[520px] sm:grid-cols-[210px_1fr]">
              <aside className="border-r border-oest-ink/10 bg-white p-4 text-[10px] font-medium text-oest-ink/45 sm:p-5">
                <p className="mb-8 text-[11px] font-bold tracking-tight text-oest-ink">OEST.</p>
                <div className="space-y-4">
                  <p className="text-oest-blue">Missões</p><p>Operadores</p><p>Dados</p><p>Integrações</p>
                </div>
              </aside>
              <div className="p-5 sm:p-8">
                <div className="flex items-start justify-between">
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-oest-blue">Nova missão</p><h3 className="mt-2 text-xl font-bold tracking-tight text-oest-ink sm:text-2xl">Inspeção de ativo</h3></div>
                  <p className="border border-oest-green/25 bg-oest-green/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-oest-green">Rascunho válido</p>
                </div>
                <div className="mt-7 grid gap-5 md:grid-cols-[.9fr_1.25fr]">
                  <div className="space-y-4">
                    {[["Tipo de captura", "Fotogrametria RGB + térmico"], ["Entrega", "Ortomosaico, relatório e pontos"], ["Janela", "A definir com a operação"]].map(([label, value]) => (
                      <div className="border-b border-oest-ink/10 pb-3" key={label}><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-oest-ink/40">{label}</p><p className="mt-1 text-[11px] font-medium text-oest-ink">{value}</p></div>
                    ))}
                  </div>
                  <div className="relative min-h-[240px] overflow-hidden bg-oest-navy p-4 sm:min-h-[320px]">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(202,215,246,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(202,215,246,.16) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                    <svg aria-hidden className="relative h-full w-full" viewBox="0 0 350 245" fill="none"><path d="M50 45 292 32l22 148-211 31L50 45Z" fill="#2A57B8" fillOpacity=".35" stroke="#CAD7F6" strokeWidth="1.5"/><circle cx="217" cy="120" r="7" fill="#1A9E60"/><circle cx="217" cy="120" r="16" stroke="#1A9E60"/><path d="m75 95 200-11M80 125l200-12M84 155l200-12" stroke="#CAD7F6" strokeDasharray="4 5" strokeOpacity=".75"/></svg>
                    <p className="absolute bottom-4 left-4 text-[9px] font-medium uppercase tracking-[0.1em] text-oest-ice">Área de interesse / Geometria</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 left-3 hidden w-[170px] border border-oest-ink/15 bg-white p-3 sm:block lg:left-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-oest-blue">Mobile</p>
            <p className="mt-3 text-[12px] font-semibold text-oest-ink">Acompanhe a missão em campo.</p>
            <div className="mt-5 h-20 border border-oest-ink/10 bg-oest-ice/35 p-2"><div className="h-2 w-1/2 bg-oest-blue/30" /><div className="mt-2 h-8 bg-oest-navy" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
