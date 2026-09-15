import Link from "next/link";

const steps = [
  ["01", "Defina a necessidade", "Informe o ativo, delimite a área de interesse e descreva a entrega que sua equipe precisa.", "bg-oest-ice text-oest-ink", "text-oest-blue"],
  ["02", "Encontre capacidade", "A missão organiza requisitos para encontrar a capacidade operacional mais adequada.", "bg-white text-oest-ink", "text-oest-ink/35"],
  ["03", "Compare propostas", "Avalie escopo, prazo e abordagem técnica para escolher com mais contexto.", "bg-oest-blue text-white", "text-oest-yellow"],
  ["04", "Acompanhe a missão", "Mantenha o time alinhado do planejamento de campo ao processamento.", "bg-oest-green text-white", "text-oest-yellow"],
  ["05", "Receba os dados", "Centralize arquivos, status e entregáveis para a próxima decisão.", "bg-[#F7F8F9] text-oest-ink", "text-oest-yellow"],
];

export function HowItWorksCards() {
  return (
    <section id="como-funciona" className="overflow-hidden bg-oest-ink py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-ice">Como funciona</p>
            <h2 className="mt-4 text-[44px] font-bold leading-[0.92] tracking-[-0.05em] sm:text-[58px] lg:text-[72px]">Uma missão. Cinco passos claros.</h2>
          </div>
          <p className="max-w-[340px] text-[15px] leading-relaxed text-white/65">Uma experiência desenhada para tornar a captura de realidade contratável, visível e integrada.</p>
        </div>
        <div className="mt-14 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin] lg:overflow-visible">
          {steps.map(([number, title, body, color, numberColor]) => (
            <article className={`flex min-h-[370px] min-w-[220px] flex-1 flex-col justify-between p-5 transition-transform duration-200 hover:-translate-y-1 ${color}`} key={number}>
              <div>
                <p className={`text-[48px] font-bold leading-none tracking-[-0.05em] ${numberColor}`}>{number}</p>
                <h3 className="mt-12 max-w-[180px] text-[24px] font-bold leading-[1.02] tracking-[-0.03em]">{title}</h3>
              </div>
              <p className="max-w-[195px] text-[13px] leading-relaxed opacity-75">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/app/missions/new" className="btn-oest-green px-6 py-3.5">Iniciar uma missão <span aria-hidden>→</span></Link>
        </div>
      </div>
    </section>
  );
}
