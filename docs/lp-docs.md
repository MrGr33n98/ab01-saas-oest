OEST
DOSSIE MASTER DA LANDING PAGE
Reverse Engineering de UI/UX · Hierarquia · Grid · Tipografia · Componentes · Imagens · Motion · Responsividade

REFERENCIA VISUAL
GLOBHE — Reality Data Marketplace
Blueprint adaptado para OEST — Drone as a Service

Documento de especificacao para Design, Frontend, Produto e Agentes de Codigo

1. Escopo e metodo de leitura
Este dossie desmonta a landing page de referencia como um sistema de design: proporcoes, hierarquia, ritmo vertical, densidade, grid, tipografia, comportamento visual, componentes, fotografia, contraste, fluxo narrativo e principios de conversao. A analise combina medicao do screenshot fornecido com leitura da estrutura publica da pagina de referencia.
	Precisao
Dimensoes em pixels sao especificacoes inferidas a partir do screenshot e normalizadas para um desktop de 1440 px. O screenshot nao permite provar o valor CSS exato nem identificar com certeza a familia tipografica. Quando houver inferencia, ela esta marcada como tal.

A referencia organiza a proposta de valor em uma sequencia muito clara: realidade/dados no hero; captura sob demanda; plataforma; prova visual; escalabilidade; processo; cobertura; clientes; conversao; FAQ; footer. Essa logica e mais importante do que copiar literalmente a aparencia.
2. Screenshot de referencia
 
Figura 1 — Referencia visual analisada em quatro trechos para leitura do fluxo completo (screenshot original: 515 × 2048 px).

3. DNA visual da LP
Dimensao	Leitura da referencia	Aplicacao OEST
Personalidade	Editorial-tech, objetiva, crua, confiante	Enterprise, tecnologica, operacional, segura
Composicao	Grandes blocos horizontais e ritmo de poster	Secoes modulares full-width com grid consistente
Contraste	Branco + grafite + acentos neon violeta/lima	Azul OEST + branco/gelo + verde + amarelo pontual
Tipografia	Grotesk pesada, headlines grandes, tracking compacto	Grotesk/neo-grotesk bold para titulos; sans neutra para UI
Imagem	Recortes de plataforma + fotografia cinematografica	Interfaces reais + operacao urbana/industrial + drones
Densidade	Baixa densidade, muito respiro, poucas mensagens por bloco	Mesma disciplina; 1 ideia principal por secao
Narrativa	Problema → plataforma → prova → processo → escala → confianca	Demanda → matching → missao → dados → integracao → escala

4. Macroestrutura e ritmo vertical
No screenshot de 515 × 2048 px, os principais cortes visuais aparecem aproximadamente nas coordenadas abaixo. Ao normalizar para 1440 px de largura, a altura equivalente e multiplicada por ~2,80. O objetivo nao e reproduzir a altura absoluta, mas preservar a cadencia.
Bloco	Faixa screenshot	Altura equivalente 1440	Papel visual
Header + Hero	0–260 px	~730 px	White / imagem / composicao assimetrica
Plataforma / Devices	260–585 px	~910 px	Fundo gelo, headline central + mockups
Media hero / turbine	585–765 px	~500 px	Imagem full-bleed, dramatic crop
Valor / escalabilidade	765–895 px	~360 px	Grafite, 3 colunas
How it works	895–1115 px	~615 px	Grafite + 5 cards verticais
Global reach	1115–1390 px	~770 px	Branco, mapa dominante
Our users	1390–1605 px	~600 px	Branco, logos
Make the switch	1605–1685 px	~225 px	CTA minimal
FAQ	1685–1908 px	~625 px	Violeta full-width
Footer	1908–2048 px	~390 px	Near-black

	Regra de ritmo
A pagina alterna secoes claras e escuras para criar pulsacao: claro → claro/gelo → imagem escura → grafite → branco → branco → violeta → near-black. Na OEST, alternar Azul Principal, Branco/Gelo e Navy; reservar Verde para acao e Amarelo para assinatura/detalhe.


5. Grid, largura e alinhamentos
Token	Especificacao recomendada	Observacao
Canvas desktop	1440–1600 px	Layout continua full-width; conteudo interno com max-width
Container principal	1280–1320 px	~88–92% em 1440
Gutter desktop	32–48 px	Nunca colar conteudo na borda
Grid	12 colunas	Hero 6/6; sections 4/8; cards 5× iguais
Column gap	20–28 px	Cards estreitos usam 12–16 px
Section padding Y	96–144 px	FAQ/hero podem chegar a 160 px
Text max-width	520–660 px	Evita linhas longas
Hero visual	50–56% viewport	Produto/fotografia recebe mais area que copy
Radius	0–8 px	Referencia quase sem arredondamento; OEST pode usar 10–16 px sutil

Alinhamento dominante: a referencia usa bordas externas muito limpas, eixos verticais precisos e grande consistencia entre inicio de heading, cards e imagens. A sensacao premium vem mais do alinhamento e espaco do que de efeitos.
6. Sistema de spacing
Nivel	Valor	Uso
2xs	4 px	micro gaps, icon/text
xs	8 px	labels, icon rows
sm	12 px	form elements
md	16 px	component inner padding
lg	24 px	card gap
xl	32 px	content blocks
2xl	48 px	headings ↔ body / clusters
3xl	64 px	subsections
4xl	96 px	section padding
5xl	128 px	hero/major sections


7. Tipografia: hierarquia completa
	Familia tipografica
A familia exata nao pode ser confirmada apenas pelo screenshot. O desenho visual e de uma grotesk europeia moderna: x-height alto, largura compacta, terminais neutros e pesos fortes. Para reproduzir o comportamento: Neue Montreal, Suisse Int’l, Inter Tight, Helvetica Now, Graphik ou Arial/Helvetica como fallback.

Uso	Desktop	Mobile	Peso	Line-height	Tracking
Display Hero	72–88 px	46–56 px	700–800	0.90–0.98	-0.045em
H1/H2 grande	56–72 px	38–46 px	700–800	0.95–1.02	-0.04em
H2 secao	44–56 px	32–38 px	700	1.00–1.05	-0.03em
H3 card	24–32 px	22–26 px	600–700	1.00–1.10	-0.02em
Body large	18–22 px	17–19 px	400–500	1.45–1.60	0
Body	15–17 px	15–16 px	400	1.45–1.60	0
Eyebrow	11–13 px	10–12 px	600	1.1	0.12em
Nav	13–14 px	—	500	1	-0.01em
Button	12–14 px	13–14 px	600	1	0
Legal/footer	11–12 px	11–12 px	400	1.4	0

Caracteristica-chave: headlines usam quebras de linha deliberadas como parte do layout. Nao deixar o navegador quebrar de modo imprevisivel em desktop; usar max-width e, quando necessario, line breaks controlados.
8. Cores da referencia vs. sistema OEST
Funcao	Referencia observada	OEST recomendado
Primary dark	Near-black / graphite	Navy #111820 + Azul #2A57B8
Light canvas	White / mint-gray	Branco #FFFFFF + Gelo #CAD7F6 em baixa saturacao
Accent 1	Violeta eletrico	Azul #2A57B8
Accent 2	Lime acid	Verde #1A9E60
Accent 3	—	Amarelo #F8C623 somente para assinatura/alerta premium
Text on dark	White	Branco #FFFFFF
Text on light	Black / ink	Navy profundo #111820

	Uso de cor premium
Nao colorir todos os cards. Use ~70% branco/gelo, ~20% navy/azul e ~10% acentos. Verde e cor de acao/estado positivo. Amarelo deve aparecer em microdetalhes ou 1 assinatura geometrica, nunca competir com CTA.


9. Header / Navigation
Elemento	Spec	Comportamento
Altura	48–56 px desktop	Fino; quase editorial
Logo	110–140 px largura	Alinhado ao eixo esquerdo do container
Nav items	13–14 px / 500	Espacamento 24–32 px
Login	Ghost / texto	Separado dos CTAs principais
CTA header	32–38 px altura	Compacto; contraste alto
Sticky	Recomendado OEST	Ao scroll, fundo branco 92% + blur 12px

Na referencia, a navegacao e propositalmente discreta para nao concorrer com o hero. A OEST deve manter esse principio, mas pode usar sticky header com borda inferior 1 px e transicao suave.
10. Hero
Camada	Spec de referencia	Adaptacao OEST
Layout	Split assimetrico 48/52	Copy esquerda; visual de dados/operacao direita
Headline	3–5 linhas, muito grande	“Dados do mundo real para decisoes que movem negocios.”
Visual	Mockups/artefatos inclinados	Dashboard OEST + mapa urbano + drone, sem visual stock generico
CTA	2 botoes pequenos	Primario verde + secundario outline azul/navy
Microproof	Cards/labels integrados ao visual	status de missao, hectares, precisao, SLA
Whitespace	Muito alto	Preservar; nao lotar hero com 8 beneficios

O hero da referencia nao usa um “card de marketing” tradicional. Ele funciona como editorial spread: grande espaco branco, tipo preta forte, elementos visuais cortados na borda e pequenos blocos de informacao que parecem parte de um sistema real.

11. Secao “Task drones…” / Plataforma
Anatomia: fundo muito claro; headline centralizada; descricao curta em largura estreita; pequeno CTA; abaixo, dispositivo mobile alinhado a esquerda e notebook dominante ao centro/direita. O mockup toca quase a base da secao, criando ancoragem visual.
Elemento	Tamanho relativo	Regra
Headline	~50–60 px	max-width ~900 px, central
Body	14–16 px	max-width 720 px
CTA	micro button	nao rouba a cena
Laptop	~55–62% largura do container	imagem real da plataforma
Phone	~18–22%	sobreposicao controlada
Background	off-white/mint	sem sombras pesadas

	Aplicacao OEST
Usar screenshot real do painel OEST em notebook + fluxo “Criar missao” em mobile. O objetivo da secao e provar que existe produto, nao ilustrar genericamente “tecnologia”.

12. Secao full-bleed de imagem
A referencia usa uma fotografia dramaticamente recortada de uma turbina eolica. Ela funciona como pausa emocional entre produto e explicacao. O enquadramento e close, tecnico e cinematografico: o ativo ocupa a maior parte do quadro e o contexto fica secundario.
⦁	OEST: cidade + infraestrutura + drone; linhas de transmissao; ponte; solar; obra; telhado industrial.
⦁	Evitar paisagem “bonita” sem relacao operacional. A imagem deve mostrar um ativo que precisa ser medido/inspecionado.
⦁	Preferir luz real, atmosfera, detalhe tecnico e escala humana/industrial.
13. Secao “Digitize…” / Proposta enterprise
Fundo grafite e titulo branco central. Abaixo, tres colunas iguais; cada coluna tem headline curta em negrito + 2–4 linhas de corpo. Nao ha cards, bordas ou icones: a tipografia faz o trabalho.
Coluna	Logica da referencia	Copy OEST equivalente
01	Limited → scalable	De local para escalavel
02	Manual → automated	De manual para orquestrado
03	Ad hoc → standardized	De pontual para padronizado


14. “How it works” — componente central
E o trecho com maior personalidade visual: heading enorme sobre fundo grafite, seguido por 5 cards verticais estreitos com cores alternadas. Os cards funcionam como uma linha de tempo horizontal.
Spec	Valor recomendado desktop
Numero de cards	5
Card ratio	~0.72–0.82 W/H
Gap	8–12 px
Padding interno	18–22 px
Numero	44–56 px / top-right
Titulo	22–28 px
Body	12–14 px
Altura	360–430 px
Cores	3 claras + 1 neutra + 1 destaque forte

Para OEST, manter 5 etapas: Defina necessidade → Matching → Compare propostas → Acompanhe missao → Receba dados. Use #CAD7F6 e branco nos neutros; Verde nos passos de acao; Azul #2A57B8 como card de destaque; Amarelo apenas em indice/linha/icone.
15. Global Reach / Cobertura
Grande espaco branco com um titulo muito grande centralizado, paragrafo pequeno abaixo e mapa como objeto heroico. A secao transmite escala por vazio e simplificacao, nao por dezenas de marcadores e textos.
Elemento	Spec
Title	56–72 px central
Body	14–16 px, max 780 px
Mapa	50–65% viewport width
Map fill	cor unica com 2–3 tons
CTA	pequeno, abaixo do mapa
Altura	~650–800 px em desktop 1440

Na OEST: mapa do Brasil primeiro; global apenas quando houver cobertura real. Mostrar regioes/operadores de forma agregada, sem poluir.

16. Our Users / Logo Wall
A referencia coloca o social proof em um ambiente quase vazio. Logos grandes, monocromaticos ou com cor de marca muito suave, grid regular e sem cards.
Spec	Recomendacao
Grid desktop	4 × 2 ou 6 × 2
Logo box	160–220 × 72–96 px
Opacity	60–85%
Background	branco
Padding Y	96–140 px
Heading	56–64 px central

OEST: nao usar logos de empresas sem autorizacao. Quando nao houver grandes logos, trocar por “Setores atendidos”, associacoes, parceiros tecnologicos ou cases verificaveis.
17. CTA “Make the switch”
Minimalista e quase brutalista: titulo enorme, muito branco e um unico botao pequeno. A referencia evita banner com background complexo neste ponto; a clareza e a principal ferramenta.
	Copy OEST
“Pare de procurar drones. Comece a solicitar resultados.” + CTA “Solicitar uma missao”.

18. FAQ
Secao full-width em cor forte. Titulo grande alinhado ao centro/esquerda, lista de perguntas em accordion, separadores finos, simbolo + no extremo direito. A densidade e baixa.
Elemento	Spec
Background	Azul OEST #2A57B8
Heading	48–60 px branco
Accordion row	56–64 px
Question	14–16 px / 500
Divider	1 px white @ 20–30% opacity
Icon	+ 16–18 px
Max width	900–1080 px

19. Footer
O footer usa near-black, uma area forte de marca a esquerda e colunas enxutas a direita. A linha divisoria e discreta, links pequenos e sociais separados.
Zona	Conteudo OEST
Brand	Logo + positioning line
Produto	Plataforma, Solucoes, API, Cobertura
Empresa	Sobre, Cases, Conteudo, Carreiras
Operadores	Entrar para a rede, Requisitos, Ajuda
Legal	Privacidade, Termos, Cookies
Social	LinkedIn, Instagram, YouTube


20. Biblioteca de componentes
Componente	Dimensoes	Visual	Estado
Primary button	40–48h / 16–24px X	Verde, texto branco, radius 2–6	hover: -6% lightness + arrow translate 2px
Secondary button	40–48h	Outline 1px navy/white	hover: fill 6–8%
Text link	auto	13–14 px + seta	underline/arrow on hover
Process card	~220–250w × 360–430h	Flat, sem shadow	hover 2–4 px rise
Accordion	56–64h	linha + question + plus	open with 250–350ms
Logo cell	160–220w × 80h	sem container visivel	opacity 70→100% hover
Stat chip	auto	microtype + value	no shadow
Device mockup	responsive	transparent PNG/WebP	parallax muito leve opcional

21. Iconografia
A referencia praticamente nao depende de iconografia decorativa. O estilo premium vem de texto, fotografia e produto. Para OEST: usar icones apenas onde a tarefa exige entendimento imediato — setores, status, sensores e workflow.
⦁	Stroke 1.5–1.75 px; 20/24 px base.
⦁	Cantos geometricos, sem ilustração “cartoon”.
⦁	Uma unica familia de icones. Nao misturar Lucide, Heroicons e SVGs proprietarios sem normalizacao.
⦁	Cor: Navy no light; branco no dark; verde apenas para success/CTA.
22. Imagens e direcao de arte
Categoria	Direcao
Produto	Screenshot real, UI legivel, fundo removido, perspectiva sutil
Operacao	Drone proximo ao ativo; foco em trabalho, nao lazer
Urbano	Pontes, telhados, obras, torres, cidades, industria, energia
Agro/ambiental	Contexto de captura/monitoramento, sem turismo
Recorte	Close + crop ousado; objetos tocando bordas
Cor	Natural; contraste medio/alto; pouco filtro
Iluminacao	Golden hour / daylight tecnico; evitar stock hiper-saturado
Aspect ratios	16:9 hero media; 4:3 cards; transparent device PNGs

	Diferenca entre “premium” e “stock”
Premium: imagem especifica que prova um caso de uso. Stock: drone generico voando em ceu bonito. Toda imagem OEST deve responder “qual ativo esta sendo capturado e que dado sera gerado?”.


23. Motion / microinteracoes
Interacao	Duracao	Easing	Comportamento
Nav hover	120–160 ms	ease-out	opacity/underline
Button	160–200 ms	cubic-bezier(.2,.8,.2,1)	background + arrow 2px
Card hover	180–240 ms	ease-out	translateY(-2px), no heavy shadow
Accordion	250–350 ms	ease-in-out	height + opacity
Section reveal	400–650 ms	ease-out	y 12–24px + opacity
Mockup parallax	slow	linear/eased	max 8–16px

Nao usar animacao como decoracao. A referencia transmite tecnologia por composicao e escala; motion deve reforcar navegacao, progressao e status.
24. Responsividade
Breakpoint	Grid	Principais mudancas
≥1440	12 colunas	desktop completo, grandes headlines
1200–1439	12 colunas	container 1120–1200, type -8–10%
992–1199	8 colunas	hero 5/3, cards 3+2 ou scroll
768–991	8 colunas	hero stack parcial, nav compacta
480–767	4 colunas	1 coluna; mockups stack; process horizontal-scroll
<480	4 colunas	24px gutters, H1 46–52px, buttons full-width opcional

No mobile, manter o carater editorial: headlines ainda grandes, whitespace generoso, menos elementos simultaneos. Nao “miniaturizar” desktop; reorquestrar a historia.

25. Blueprint OEST — arquitetura final da LP
#	Secao	Conteudo
01	Header	Logo / Solucoes / Setores / Plataforma / Para operadores / Conteudo / Login / CTA
02	Hero	Dados do mundo real para decisoes que movem negocios.
03	Microproof	Missoes / hectares / operadores / compliance
04	Platform proof	Capture qualquer ativo. Em qualquer lugar. Quando precisar. + dashboard/mobile
05	Visual pause	Imagem urbana/industrial full-bleed
06	Enterprise value	Local→Escala / Manual→Orquestrado / Ad hoc→Padronizado
07	How it works	5 etapas
08	Sectors	Energia, Infra, Construcao, Mineracao, Agro, Imobiliario, Seguranca, Ambiente
09	Coverage	Mapa Brasil + capacidade distribuida
10	Integration	Mundo fisico → captura → OEST → GIS/BIM/ERP/AI
11	Dual audience	Para empresas / Para operadores
12	Social proof	Cases, partners, customer logos quando autorizados
13	Enterprise CTA	Pare de procurar drones. Comece a solicitar resultados.
14	FAQ	Pricing, prazo, operadores, formatos, API, compliance
15	Footer	Produto / Empresa / Operadores / Legal

26. Tokens OEST para implementacao
Paleta definida pelo projeto:
Token	HEX	Uso
brand.blue	#2A57B8	backgrounds fortes, headings em light, mapas
brand.green	#1A9E60	CTA, success, highlights
brand.yellow	#F8C623	assinatura, detalhe, premium accent
brand.lightblue	#CAD7F6	surfaces claras, diagrams, cards neutros
brand.white	#FFFFFF	canvas e texto em dark
ink	#111820	texto principal, footer, dark sections

Exemplo Tailwind:
brand: { blue:'#2A57B8', green:'#1A9E60', yellow:'#F8C623', lightblue:'#CAD7F6', white:'#FFFFFF', ink:'#111820' }
27. Regras de composicao OEST
⦁	Nao usar mais de 1 headline principal por viewport.
⦁	Nao usar mais de 2 CTAs primarios por secao.
⦁	Se uma secao tem uma imagem forte, reduzir decoracao, icones e cards.
⦁	Mockups sempre precisam mostrar produto real ou prototipo crivel.
⦁	Toda estatistica precisa ser verificavel; caso contrario, usar label de capacidade sem numero.
⦁	Evitar glassmorphism, sombras neon e gradientes genericos de SaaS.
⦁	Bordas e radius devem ser discretos; design deve parecer editorial/industrial.
⦁	Amarelo e assinatura, nao cor estrutural dominante.
⦁	No hero, vender resultado primeiro; “drone” e o mecanismo, nao o headline central.

28. Checklist de fidelidade visual
Area	Pergunta de QA
Grid	Todos os inicios de secao alinham no mesmo container?
Tipo	Headlines possuem line-height compacto e quebras deliberadas?
Ritmo	Ha 96–144 px de respiracao entre grandes blocos?
Contraste	A pagina alterna claro/escuro sem excesso de cores?
Produto	A plataforma aparece em tamanho suficiente para ser crivel?
Imagem	Fotos mostram operacao/ativo em vez de drone generico?
Cards	Cards sao flat, sem excesso de shadow/radius?
CTA	Verde e reservado para acao principal?
FAQ	Accordion tem linhas simples e alto contraste?
Footer	Near-black, organizado e com hierarchy baixa?
Mobile	Historia foi reordenada, nao apenas comprimida?
Performance	Hero image responsiva, WebP/AVIF, lazy load abaixo da dobra?

29. Performance e implementacao frontend
Tema	Requisito
Hero	AVIF/WebP, preload apenas do LCP
Mockups	PNG/WebP transparente otimizado; width/height fixos
Below-fold	loading=lazy
Fonts	self-hosted WOFF2; 2 pesos prioritarios; font-display: swap
CSS	tokens + container + fluid type
Animation	prefers-reduced-motion
SEO	H1 unico, semantic sections, alt text real
Accessibility	AA contrast; focus visible; accordion keyboard
Core Web Vitals	LCP <2.5s, CLS <0.1, INP <200ms como meta

30. Do / Don’t
DO	DON’T
Usar 1 ideia dominante por secao	Encher cada secao de 8 cards
Usar whitespace como elemento premium	Tentar preencher todo vazio
Usar imagens de ativo/operacao	Usar apenas drone no ceu
Mostrar produto real	Usar dashboard ficticio generico
Tipografia forte e simples	Misturar 3–4 fontes
CTA consistente	Mudar estilo de botao em cada bloco
Cor por funcao	Usar todas as cores em cada componente
Microinteracao sutil	Parallax/3D em tudo

31. Definition of Done da LP
⦁	Desktop 1440 e 1920 revisados visualmente.
⦁	Tablet 768/1024 sem colisoes.
⦁	Mobile 375/390/430 com hierarchy preservada.
⦁	Heading scale, line-height e max-width batem com o sistema.
⦁	Todos os CTAs usam variantes oficiais.
⦁	Nenhuma imagem sem funcao narrativa.
⦁	Dados/estatisticas aprovados pelo negocio.
⦁	FAQ acessivel e navegavel por teclado.
⦁	Core Web Vitals dentro das metas.
⦁	Analytics em CTA, request mission, operator signup e API interest.
⦁	SEO metadata, OG image e schema definidos.
⦁	Copy revisada para consistencia: “dados / missao / operador / entrega / integracao”.
32. Conclusao
A assinatura visual da referencia nao esta em “copiar roxo e verde”. Ela esta na disciplina: tipografia grande, layout editorial, muito espaco negativo, produto em evidencia, fotografia tecnica, uma narrativa por bloco e componentes quase sem ornamentacao. Para a OEST, o equivalente premium e usar azul institucional, superficies brancas/gelo, verde de acao e amarelo como assinatura, preservando o mesmo grau de clareza e tensao visual.
	Direcao final
OEST deve parecer menos “site de empresa de drone” e mais uma infraestrutura enterprise para solicitar, operar e integrar dados do mundo fisico.

33. Fontes de referencia
1. Screenshot fornecido pelo usuario — base principal para medicao visual e reverse engineering.
2. Estrutura publica da pagina GLOBHE — usada apenas para validar a ordem e o papel narrativo das secoes. O dossie nao replica codigo, assets proprietarios ou implementacao da referencia.