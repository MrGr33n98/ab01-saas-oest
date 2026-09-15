const sectors = [
  ["Energia", "Inspeção de geração, transmissão e ativos renováveis."],
  ["Infraestrutura", "Levantamento, monitoramento e inspeção de ativos críticos."],
  ["Construção", "Acompanhamento de obra, topografia e contexto para BIM."],
  ["Mineração", "Volume, estabilidade, terreno e evolução de frentes."],
  ["Agronegócio", "Leitura territorial e inteligência para o manejo."],
  ["Imobiliário", "Terreno, cobertura, documentação e visualização espacial."],
  ["Segurança", "Captura planejada para perímetros e ativos de operação."],
  ["Ambiental", "Monitoramento de áreas, vegetação e evidências de campo."],
];

export function SectorsGrid() {
  return (
    <section id="setores" className="bg-oest-ice/18 py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">Setores</p><h2 className="mt-5 text-[40px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink sm:text-[52px]">A captura certa para o contexto do seu ativo.</h2></div>
          <p className="max-w-[440px] text-[16px] leading-relaxed text-oest-ink/65 lg:col-span-4 lg:col-start-8">Cada missão combina contexto operacional, precisão solicitada e a forma como os dados serão usados depois do campo.</p>
        </div>
        <div className="mt-14 grid gap-x-8 border-t border-oest-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map(([name, description], index) => <article className="border-b border-oest-ink/15 py-6" key={name}><p className="text-[10px] font-semibold tracking-[0.14em] text-oest-blue">0{index + 1}</p><h3 className="mt-4 text-[21px] font-bold tracking-[-0.03em] text-oest-ink">{name}</h3><p className="mt-3 max-w-[235px] text-[13px] leading-relaxed text-oest-ink/65">{description}</p></article>)}
        </div>
      </div>
    </section>
  );
}
