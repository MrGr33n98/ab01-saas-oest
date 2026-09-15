const sectors = ["Energia", "Infraestrutura", "Construção", "Mineração", "Agronegócio", "Imobiliário", "Segurança", "Ambiental"];

export function SocialProof() {
  return (
    <section className="border-t border-oest-ink/10 bg-white py-24 text-center sm:py-32">
      <div className="mx-auto max-w-[1120px] px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">Versatilidade operacional</p>
        <h2 className="mt-5 text-[40px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink sm:text-[54px]">Ativos diferentes. Uma mesma linguagem operacional.</h2>
        <div className="mt-14 grid grid-cols-2 border-l border-t border-oest-ink/12 sm:grid-cols-4">
          {sectors.map((sector) => <div className="flex h-24 items-center justify-center border-b border-r border-oest-ink/12 px-3 text-[15px] font-semibold tracking-[-0.02em] text-oest-ink/60 transition-colors hover:text-oest-ink" key={sector}>{sector}</div>)}
        </div>
      </div>
    </section>
  );
}
