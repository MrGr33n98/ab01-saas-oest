import Link from "next/link";

const columns = [
  ["Produto", [["Plataforma", "#plataforma"], ["Soluções", "#setores"], ["Integrações", "#integracoes"], ["Cobertura", "#cobertura"]]],
  ["Empresa", [["Sobre", "/enterprise"], ["Conteúdo", "/blog"], ["Contato", "/contact"], ["Carreiras", "/careers"]]],
  ["Operadores", [["Entrar para a rede", "/sign-up?role=operator"], ["Missões", "/operator/jobs"], ["Ajuda", "/contact"], ["Login", "/sign-in"]]],
];

export function LandingFooter() {
  return (
    <footer className="bg-oest-ink pb-8 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link className="inline-flex items-center gap-2" href="/"><span className="flex h-8 w-8 items-center justify-center bg-oest-blue text-[11px] font-bold tracking-tighter">OE</span><span className="text-2xl font-bold tracking-[-0.04em]">OEST<span className="font-light text-oest-blue">.</span></span></Link>
            <p className="mt-5 max-w-[310px] text-[13px] leading-relaxed text-white/55">Infraestrutura para solicitar, operar e integrar dados do mundo físico.</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {columns.map(([name, links]) => <div key={name as string}><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-oest-ice">{name as string}</p><ul className="mt-5 space-y-3">{(links as string[][]).map(([label, href]) => <li key={label}><Link className="text-[13px] text-white/60 transition-colors hover:text-white" href={href}>{label}</Link></li>)}</ul></div>)}
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} OEST. Todos os direitos reservados.</p><div className="flex gap-5"><Link href="/privacy" className="hover:text-white">Privacidade</Link><Link href="/terms" className="hover:text-white">Termos</Link><a href="https://www.linkedin.com" rel="noreferrer" target="_blank" className="hover:text-white">LinkedIn</a><a href="https://www.instagram.com" rel="noreferrer" target="_blank" className="hover:text-white">Instagram</a></div></div>
      </div>
    </footer>
  );
}
