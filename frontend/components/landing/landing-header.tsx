"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-oest-ink/10 py-2.5"
          : "bg-white/85 backdrop-blur-sm border-b border-transparent py-3"
      }`}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-7 w-7 items-center justify-center bg-oest-blue text-[11px] font-bold tracking-tighter text-white transition-transform group-hover:scale-105">
            OE
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-[19px] font-bold tracking-tight text-oest-ink">
              OEST<span className="text-oest-blue font-light">.</span>
            </span>
            <span className="mt-0.5 text-[8px] font-semibold tracking-[0.16em] uppercase text-oest-blue">
              Reality Data
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium tracking-tight text-oest-ink/80">
          <Link href="#plataforma" className="hover:text-oest-blue transition-colors">
            Plataforma
          </Link>
          <Link href="#como-funciona" className="hover:text-oest-blue transition-colors">
            Como Funciona
          </Link>
          <Link href="#setores" className="hover:text-oest-blue transition-colors">
            Setores
          </Link>
          <Link href="#cobertura" className="hover:text-oest-blue transition-colors">
            Cobertura Brasil
          </Link>
          <Link href="#integracoes" className="hover:text-oest-blue transition-colors">
            Dados & APIs
          </Link>
          <Link href="/blog" className="hover:text-oest-blue transition-colors">
            Insights
          </Link>
          <Link href="/operator/jobs" className="text-oest-blue font-semibold hover:underline">
            Para Operadores
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-[13px] font-medium text-oest-ink/80 hover:text-oest-ink px-3 py-2 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/app/missions/new"
            className="btn-oest-green px-4 py-2 text-[13px]"
          >
            Solicitar Missão
            <span className="text-white/80">→</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-oest-ink focus:outline-none"
          aria-label="Alternar menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-oest-ink">
            <Link
              href="#plataforma"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              Plataforma
            </Link>
            <Link
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              Como Funciona
            </Link>
            <Link
              href="#setores"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              Setores Atendidos
            </Link>
            <Link
              href="#cobertura"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              Cobertura Brasil
            </Link>
            <Link
              href="#integracoes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              Produtos de Dados & GIS
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-border/40 hover:text-oest-blue"
            >
              Artigos & Insights
            </Link>
            <Link
              href="/operator/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 font-semibold text-oest-blue border-b border-border/40"
            >
              Portal do Operador
            </Link>
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in"
              className="btn-oest-outline w-full py-2.5 text-center text-sm"
            >
              Acessar Conta
            </Link>
            <Link
              href="/app/missions/new"
              className="btn-oest-green w-full py-2.5 text-center text-sm"
            >
              Solicitar Missão Agora
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
