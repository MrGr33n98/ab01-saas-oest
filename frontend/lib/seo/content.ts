/** Conteúdo SEO estático — money pages, FAQ, GEO, glossário (pt-BR). */

export const SITE = {
  name: "DroneHub",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "pt-BR",
};

export type FaqItem = { q: string; a: string };

export const SITE_FAQ: FaqItem[] = [
  {
    q: "O que é uma missão no DroneHub?",
    a: "Uma missão é um pedido estruturado de captura ou entrega de dados geoespaciais (AOI, produtos, prazo). Operadores verificados enviam propostas; você compara e aceita na plataforma.",
  },
  {
    q: "Como funciona o pagamento (Pix/cartão)?",
    a: "Após aceitar uma proposta, o pedido fica pendente de pagamento. Você paga via Stripe (cartão ou Pix, quando habilitado) ou fluxo manual/concierge no MVP. Só então a execução começa.",
  },
  {
    q: "Os operadores são verificados?",
    a: "Sim. Perfis públicos exigem verificação da plataforma. Avaliações só entram após missões concluídas — sem estrelas inventadas.",
  },
  {
    q: "Quanto custa um ortomosaico por hectare?",
    a: "O preço depende de área, GSD, região e complexidade. No DroneHub você recebe propostas competitivas de operadores elegíveis em vez de um preço fixo opaco.",
  },
  {
    q: "Posso comprar só o dado, sem voo novo?",
    a: "Sim, quando houver data products ou biblioteca da organização. Missões novas cobrem captura sob demanda; repositórios suportam recompra de entregas já aprovadas.",
  },
  {
    q: "Atendem Mato Grosso, Goiás e Mato Grosso do Sul?",
    a: "Sim. O GTM prioriza MT, MS e GO, com operadores e cobertura regional. Veja as páginas de localização e filtre operadores por área.",
  },
  {
    q: "Como funciona disputa de entrega?",
    a: "Você revisa o entregável no workspace, aprova ou rejeita com motivo. O fluxo fica auditado na missão; mediação da plataforma atua antes de escalar conflito.",
  },
  {
    q: "Foreign buyers: can I use English and pay in BRL?",
    a: "Yes. The product UI supports English and Brazilian operations settle in BRL. Use the language switcher and create a customer account to post missions.",
  },
];

export const CATEGORY_CONTENT: Record<
  string,
  { name: string; h1: string; intro: string; faq: FaqItem[]; relatedProducts: string[] }
> = {
  mapping: {
    name: "Mapeamento",
    h1: "Mapeamento com drone no Brasil",
    intro:
      "Publique missões de mapeamento aéreo com ortomosaico, curvas de nível e produtos topográficos. No DroneHub você define a AOI, escolhe os data products e recebe propostas de operadores verificados — com workspace único até a entrega aprovada. Ideal para agrimensura, planejamento e acompanhamento territorial em MT, MS, GO e demais regiões cobertas.",
    faq: [
      { q: "O que está incluso num mapeamento típico?", a: "Em geral ortomosaico georreferenciado; DTM/DSM e curvas sob demanda na missão." },
      { q: "Qual GSD pedir?", a: "Depende do uso: 5–10 cm/px é comum em campo; projetos de engenharia podem exigir mais detalhe." },
      { q: "Preciso de topógrafo no local?", a: "Pontos de controle aumentam acurácia; combine com o operador na proposta." },
    ],
    relatedProducts: ["orthomosaic", "dtm", "dsm", "point-cloud"],
  },
  inspection: {
    name: "Inspeção",
    h1: "Inspeção com drone de ativos e infraestrutura",
    intro:
      "Inspeções visuais de torres, linhas, telhados e estruturas com registro rastreável. Monte a missão, receba quotes de operadores com frota adequada e aprove laudos e imagens no mesmo fluxo.",
    faq: [
      { q: "Serve para linhas de transmissão?", a: "Sim, desde que o operador declare capacidade e cobertura na região do ativo." },
      { q: "Entrega é só foto?", a: "Pode incluir relatório técnico, anotações e termografia se contratados na missão." },
    ],
    relatedProducts: ["report", "thermal"],
  },
  agriculture: {
    name: "Agricultura",
    h1: "Agricultura de precisão com drone e NDVI",
    intro:
      "Monitore lavouras com NDVI, ortomosaicos e séries temporais. Fazendas em Mato Grosso e Cerrado publicam missões, comparam operadores e recebem dados prontos para decisão de manejo — sem coordenar tudo no WhatsApp.",
    faq: [
      { q: "NDVI sozinho basta?", a: "É um indicador; combine com visitas de campo e histórico da safra." },
      { q: "Qual frequência de voo?", a: "Depende da cultura e do estágio; muitas fazendas repetem missões na mesma AOI." },
    ],
    relatedProducts: ["ndvi", "orthomosaic"],
  },
  construction: {
    name: "Construção",
    h1: "Acompanhamento de obra com drone",
    intro:
      "Controle de avanço, volumes e comunicação visual de canteiro. Missões recorrentes no DroneHub geram histórico auditável para engenharia e incorporadoras.",
    faq: [
      { q: "Dá para medir volume de estoque?", a: "Sim, com nuvem de pontos / DSM e metodologia acordada na proposta." },
    ],
    relatedProducts: ["orthomosaic", "dsm", "point-cloud"],
  },
  mining: {
    name: "Mineração",
    h1: "Dados aéreos para mineração e pilhas",
    intro:
      "Levantamentos de pilhas, cortes e monitoramento de áreas de lavra. Operadores com experiência em mining propõem prazo e produto; o pagamento e a entrega ficam no Mission OS.",
    faq: [
      { q: "LiDAR ou fotogrametria?", a: "Depende da vegetação e da precisão; compare propostas no workspace." },
    ],
    relatedProducts: ["lidar", "point-cloud", "dsm"],
  },
  "thermal-inspection": {
    name: "Inspeção térmica",
    h1: "Inspeção térmica com drone",
    intro:
      "Termografia de painéis solares, subestações e equipamentos. Solicite operadores com payload térmico e receba o entregável com fluxo de aprovação claro.",
    faq: [
      { q: "Precisa de certificação específica?", a: "Exija na proposta operadores com experiência e calibração declarada." },
    ],
    relatedProducts: ["thermal", "report"],
  },
  media: {
    name: "Mídia aérea",
    h1: "Fotos e vídeos aéreos profissionais",
    intro:
      "Conteúdo aéreo para marketing e documentação institucional, com operadores verificados e briefing via missão.",
    faq: [{ q: "Entrega em 4K?", a: "Especifique resolução e direitos de uso na missão." }],
    relatedProducts: ["report"],
  },
  survey: {
    name: "Topografia",
    h1: "Topografia e levantamento com drone",
    intro:
      "Levantamentos cadastrais e de apoio com produtos fotogramétricos. Publique a AOI, receba quotes e valide entregas no workspace.",
    faq: [{ q: "Substitui método convencional?", a: "Complementa; requisitos legais variam por uso e município." }],
    relatedProducts: ["orthomosaic", "dtm", "point-cloud"],
  },
};

export const PRODUCT_CONTENT: Record<
  string,
  { name: string; h1: string; intro: string; faq: FaqItem[] }
> = {
  orthomosaic: {
    name: "Ortomosaico",
    h1: "Comprar ortomosaico gerado por drone",
    intro:
      "Ortomosaico georreferenciado a partir de captura aérea. Defina área e especificação na missão e compare propostas de operadores no Brasil.",
    faq: [
      { q: "Em que formato recebo?", a: "Comum GeoTIFF / COG; combine com o operador no aceite." },
      { q: "Preço por hectare?", a: "Varia por GSD e logística; use quotes em vez de tabela única." },
    ],
  },
  "point-cloud": {
    name: "Nuvem de pontos",
    h1: "Nuvem de pontos com drone",
    intro: "Modelos 3D densos para volume, BIM e análise de superfície.",
    faq: [{ q: "Fotogrametria ou LiDAR?", a: "Depende do projeto; LiDAR penetra melhor em vegetação." }],
  },
  dtm: {
    name: "DTM",
    h1: "DTM — modelo digital de terreno",
    intro: "Superfície do terreno sem objetos; base para engenharia e drenagem.",
    faq: [{ q: "Diferença para DSM?", a: "DSM inclui coberturas; DTM representa o solo." }],
  },
  dsm: {
    name: "DSM",
    h1: "DSM — modelo digital de superfície",
    intro: "Superfície com vegetação e edificações para análise visual e volumes aparentes.",
    faq: [{ q: "Serve para volume de pilha?", a: "Sim, com metodologia e controle adequados." }],
  },
  ndvi: {
    name: "NDVI",
    h1: "NDVI com drone para agricultura",
    intro: "Índice de vegetação para manejo e monitoramento de lavoura.",
    faq: [{ q: "Sensor RGB ou multiespectral?", a: "Multiespectral tende a ser mais confiável para NDVI." }],
  },
  thermal: {
    name: "Termografia",
    h1: "Termografia aérea com drone",
    intro: "Mapas térmicos de ativos e usinas solares.",
    faq: [{ q: "Precisa de radiometria?", a: "Para quantificar temperatura, sim — especifique na missão." }],
  },
  lidar: {
    name: "LiDAR",
    h1: "LiDAR aéreo com drone",
    intro: "Nuvens de alta precisão sob vegetação e para corredores longos.",
    faq: [{ q: "Sempre necessário?", a: "Não; fotogrametria resolve muitos casos a menor custo." }],
  },
  report: {
    name: "Relatório técnico",
    h1: "Relatório técnico de inspeção ou voo",
    intro: "Documento estruturado com achados, imagens e recomendações.",
    faq: [{ q: "Modelo fixo?", a: "O escopo do relatório entra na proposta do operador." }],
  },
};

export const LOCATIONS: Record<
  string,
  { name: string; h1: string; intro: string; cities: { slug: string; name: string }[] }
> = {
  mt: {
    name: "Mato Grosso",
    h1: "Drones e dados geoespaciais em Mato Grosso",
    intro:
      "MT concentra demanda agrícola e logística. Publique missões de NDVI, mapeamento e inspeção com operadores que declaram cobertura no estado.",
    cities: [
      { slug: "cuiaba", name: "Cuiabá" },
      { slug: "sorriso", name: "Sorriso" },
      { slug: "lucas-do-rio-verde", name: "Lucas do Rio Verde" },
      { slug: "sinop", name: "Sinop" },
    ],
  },
  ms: {
    name: "Mato Grosso do Sul",
    h1: "Drones e dados em Mato Grosso do Sul",
    intro:
      "MS combina agribusiness e infraestrutura. Use o DroneHub para contratar captura e produtos de dados com processo claro.",
    cities: [
      { slug: "campo-grande", name: "Campo Grande" },
      { slug: "dourados", name: "Dourados" },
    ],
  },
  go: {
    name: "Goiás",
    h1: "Drones e dados em Goiás",
    intro:
      "Goiás no corredor do Cerrado: mapeamento, obra e agricultura de precisão via marketplace e Mission OS.",
    cities: [
      { slug: "goiania", name: "Goiânia" },
      { slug: "rio-verde", name: "Rio Verde" },
    ],
  },
};

export const GLOSSARY: Record<string, { term: string; definition: string; related?: string[] }> = {
  ortomosaico: {
    term: "Ortomosaico",
    definition:
      "Imagem aérea mosaica corrigida geometricamente, com escala uniforme, usada como mapa base.",
    related: ["orthomosaic", "mapping"],
  },
  ndvi: {
    term: "NDVI",
    definition:
      "Normalized Difference Vegetation Index — indicador de vigor vegetativo a partir de bandas do vermelho e infravermelho próximo.",
    related: ["ndvi", "agriculture"],
  },
  dtm: {
    term: "DTM",
    definition: "Digital Terrain Model — modelo da superfície do terreno sem vegetação e edificações.",
    related: ["dtm"],
  },
  dsm: {
    term: "DSM",
    definition: "Digital Surface Model — inclui vegetação e construções sobre o terreno.",
    related: ["dsm"],
  },
  lidar: {
    term: "LiDAR",
    definition: "Light Detection and Ranging — sensor ativo que gera nuvens de pontos de alta precisão.",
    related: ["lidar"],
  },
  gsd: {
    term: "GSD",
    definition: "Ground Sample Distance — tamanho no terreno representado por um pixel da imagem.",
    related: ["orthomosaic"],
  },
  aoi: {
    term: "AOI",
    definition: "Area of Interest — polígono da área da missão no DroneHub.",
    related: ["mapping"],
  },
  fotogrametria: {
    term: "Fotogrametria",
    definition: "Técnica de medir e modelar a partir de fotografias sobrepostas.",
    related: ["orthomosaic", "point-cloud"],
  },
  "nuvem-de-pontos": {
    term: "Nuvem de pontos",
    definition: "Conjunto de pontos 3D representando a superfície ou o terreno.",
    related: ["point-cloud"],
  },
  termografia: {
    term: "Termografia",
    definition: "Imageamento na faixa infravermelha térmica para detectar anomalias de temperatura.",
    related: ["thermal"],
  },
  rtk: {
    term: "RTK",
    definition: "Real Time Kinematic — correção GNSS em tempo real para maior acurácia de posição.",
    related: ["survey"],
  },
  gcp: {
    term: "GCP",
    definition: "Ground Control Point — ponto de controle em solo para amarrar o modelo ao sistema de referência.",
    related: ["survey", "orthomosaic"],
  },
  cog: {
    term: "COG",
    definition: "Cloud Optimized GeoTIFF — GeoTIFF otimizado para leitura parcial em nuvem.",
    related: ["orthomosaic"],
  },
  mission: {
    term: "Missão",
    definition: "Unidade de trabalho no DroneHub: AOI, produtos, prazo, quotes e entregas.",
    related: [],
  },
  "data-product": {
    term: "Data product",
    definition: "Produto de dados entregável (ortomosaico, NDVI, relatório, etc.) associado à missão.",
    related: [],
  },
};

export const COMPARE_AVULSO = {
  h1: "DroneHub vs contratar operador avulso",
  intro:
    "Contratar por indicação ou WhatsApp funciona até a primeira disputa de prazo ou arquivo. O DroneHub estrutura missão, propostas, pagamento e aprovação de entrega.",
  rows: [
    { label: "Comparar propostas", hub: "Lado a lado no workspace", avulso: "Planilha / mensagens" },
    { label: "Operadores", hub: "Verificados + cobertura", avulso: "Rede pessoal" },
    { label: "Pagamento", hub: "Pedido + Stripe/Pix", avulso: "Transferência informal" },
    { label: "Entrega", hub: "Upload, preview, approve/reject", avulso: "Link de drive solto" },
    { label: "Histórico", hub: "Auditável na org", avulso: "Depende de e-mail" },
  ],
};

export const CUSTOMERS = [
  {
    slug: "agro-cerrado",
    name: "Grupo Agro Cerrado (ilustrativo)",
    summary:
      "Missões recorrentes de NDVI em talhões no MT — propostas comparadas e entregas aprovadas no workspace.",
    sector: "Agricultura",
  },
  {
    slug: "infra-centro-oeste",
    name: "Infra Centro-Oeste (ilustrativo)",
    summary:
      "Inspeções de ativos com relatório técnico e rastro de aprovação para compliance interno.",
    sector: "Infraestrutura",
  },
];
