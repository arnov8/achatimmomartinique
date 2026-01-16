"use client";

import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  favoritesCount: number;
  onToggleFavorites: () => void;
  showOnlyFavorites: boolean;
}

export default function Header({ favoritesCount, onToggleFavorites, showOnlyFavorites }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuLinks = [
    { name: "Accueil", href: "/" },
    { name: "À propos", href: "/a-propos" },
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Méthodologie", href: "/methodologie" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    // Raffinement : Réduction du padding vertical (py-3 au lieu de py-4) et bordure ultra-fine
    <header className="bg-white/90 backdrop-blur-md py-3 px-4 md:px-6 border-b border-slate-200/50 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] print:hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center gap-2">
          
          {/* LOGO ET TITRE */}
          <div 
            className="flex flex-col cursor-pointer flex-shrink-1 min-w-0" 
            onClick={() => {
              window.scrollTo({top: 0, behavior: 'smooth'});
              setIsMenuOpen(false);
            }}
          >
            {/* Raffinement : Texte un peu plus compact et précis */}
            <h2 className="text-base md:text-xl font-black text-blue-700 leading-none tracking-tight truncate">
              AchatImmoMartinique
            </h2>
            <p className="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 truncate">
              Plateforme de centralisation d'annonces immo
            </p>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden lg:flex items-center gap-8">
            {menuLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-blue-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ACTIONS : FAVORIS + BURGER MOBILE */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button 
              onClick={onToggleFavorites} 
              className={`flex items-center gap-2 px-3.5 py-2 md:px-5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all border ${
                showOnlyFavorites 
                ? 'bg-red-500 border-red-500 text-white shadow-red-200 shadow-lg' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <span className={showOnlyFavorites ? 'scale-110' : ''}>❤️</span>
              <span className="hidden sm:inline">Mes Favoris</span>
              <span className={`ml-1 ${showOnlyFavorites ? 'text-white' : 'text-blue-600'}`}>({favoritesCount})</span>
            </button>

            {/* BOUTON BURGER */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent active:border-slate-200"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MENU MOBILE DÉROULANT */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-3 py-4 border-t border-slate-100 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-300">
            {menuLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 hover:bg-slate-50 px-3 py-3 rounded-lg transition-all"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
