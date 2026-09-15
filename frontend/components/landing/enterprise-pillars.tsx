const pillars = [
  ["01", "De local para escalável", "Conecte uma demanda distribuída a uma operação coordenada."],
  ["02", "De manual para orquestrado", "Substitua fluxos dispersos por uma missão com contexto e acompanhamento."],
  ["03", "De pontual para padronizado", "Defina a entrega que seu time precisa repetir, comparar e integrar."],
];

export function EnterprisePillars() {
  return (
    <section className="bg-oest-ink py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="mx-auto max-w-[940px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-ice">Infraestrutura operacional</p>
          <h2 className="mt-5 text-[42px] font-bold leading-[0.96] tracking-[-0.045em] sm:text-[56px] lg:text-[68px]">
            Transforme voos isolados em um fluxo contínuo de dados.
          </h2>
        </div>
        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-14 lg:gap-20">
          {pillars.map(([number, title, body]) => (
            <article className="border-t border-white/25 pt-5" key={number}>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-oest-yellow">{number}</p>
              <h3 className="mt-8 max-w-[280px] text-[28px] font-bold leading-[1.02] tracking-[-0.035em]">{title}</h3>
              <p className="mt-5 max-w-[310px] text-[15px] leading-relaxed text-white/65">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
