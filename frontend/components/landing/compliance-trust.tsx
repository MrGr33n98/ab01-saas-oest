export function ComplianceTrust() {
  const certifications = [
    {
      title: "ANAC — RBAC-E 94",
      desc: "Todas as aeronaves cadastradas possuem registro ativo no SISANT e certificado de aeronavegabilidade para operações Classe 3 e Classe 2.",
      badge: "REGULAÇÃO",
    },
    {
      title: "DECEA — SARPAS",
      desc: "Solicitação e aprovação prévia de plano de voo no Sistema de Solicitação de Acesso de Aeronaves Remotamente Pilotadas para cada missão.",
      badge: "ESPAÇO AÉREO",
    },
    {
      title: "Ministério da Defesa",
      desc: "Procedimentos de aerolevantamento aderentes às normas vigentes e diretrizes de mapeamento aeroespacial em território nacional.",
      badge: "DEFESA",
    },
    {
      title: "Seguro RETA Ativo",
      desc: "Apólice obrigatória com cobertura de danos a terceiros vigente em 100% dos voos agendados e executados via plataforma OEST.",
      badge: "SEGURO",
    },
    {
      title: "ART / RRT (CREA & CAU)",
      desc: "Responsabilidade técnica formalizada por engenheiros cartógrafos e agrimensores habilitados nos conselhos profissionais.",
      badge: "ENGENHARIA",
    },
    {
      title: "LGPD & SOC 2 Ready",
      desc: "Isolamento absoluto de dados entre organizações com criptografia AES-256 em repouso e TLS 1.3 em trânsito.",
      badge: "SEGURANÇA",
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-oest-blue">
            CONFORMIDADE OPERACIONAL & JURÍDICA
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-oest-ink">
            Segurança de voo e conformidade regulatória{" "}
            <span className="text-oest-blue">sem exceções.</span>
          </h2>
          <p className="text-base text-text-muted">
            A contratação de serviços com drones no Brasil envolve órgãos federais e responsabilidade civil objetiva. A OEST garante a blindagem técnica da sua organização.
          </p>
        </div>

        {/* 6 Compliance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface-soft p-6 flex flex-col justify-between hover:border-oest-blue/30 transition-all"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-oest-blue bg-oest-ice/40 px-2 py-0.5 rounded uppercase">
                  {item.badge}
                </span>
                <h3 className="text-lg font-bold text-oest-ink mt-3">{item.title}</h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-1.5 text-[11px] font-semibold text-oest-green">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Checagem automatizada na plataforma</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
