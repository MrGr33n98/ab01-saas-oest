import Link from "next/link";

export function AudienceSplit() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="max-w-[700px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">Uma plataforma, duas pontas</p>
          <h2 className="mt-5 text-[40px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink sm:text-[52px]">Criado para quem precisa de dados. Feito com quem opera no campo.</h2>
        </div>
        <div className="mt-14 grid border-y border-oest-ink/15 md:grid-cols-2">
          <article className="py-10 md:pr-14 lg:pr-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">Para empresas</p>
            <h3 className="mt-5 max-w-[460px] text-[30px] font-bold leading-[1.02] tracking-[-0.035em] text-oest-ink">Transforme uma necessidade de campo em uma solicitação técnica clara.</h3>
            <p className="mt-5 max-w-[450px] text-[15px] leading-relaxed text-oest-ink/65">Organize escopo, comparações e entregas em um fluxo que conversa com as decisões da sua operação.</p>
            <Link href="/app/missions/new" className="mt-8 inline-flex text-[13px] font-semibold text-oest-blue underline-offset-4 hover:underline">Solicitar uma missão <span className="ml-1" aria-hidden>→</span></Link>
          </article>
          <article className="border-t border-oest-ink/15 py-10 md:border-l md:border-t-0 md:pl-14 lg:pl-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-green">Para operadores</p>
            <h3 className="mt-5 max-w-[460px] text-[30px] font-bold leading-[1.02] tracking-[-0.035em] text-oest-ink">Dê mais clareza à capacidade e à entrega do seu time.</h3>
            <p className="mt-5 max-w-[450px] text-[15px] leading-relaxed text-oest-ink/65">Apresente a especialidade da sua operação e receba oportunidades com contexto técnico desde o primeiro contato.</p>
            <Link href="/sign-up?role=operator" className="mt-8 inline-flex text-[13px] font-semibold text-oest-blue underline-offset-4 hover:underline">Entrar para a rede <span className="ml-1" aria-hidden>→</span></Link>
          </article>
        </div>
      </div>
    </section>
  );
}
