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
    <header className="bg-white/80 backdrop-blur-md py-4 px-4 md:px-6 border-b border-slate-100 sticky top-0 z-50 shadow-sm print:hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center gap-4">
          
          {/* LOGO ET TITRE */}
          <div 
            className="flex flex-col cursor-pointer flex-shrink-0" 
            onClick={() => {
              window.scrollTo({top: 0, behavior: 'smooth'});
              setIsMenuOpen(false);
            }}
          >
            <h2 className="text-lg md:text-2xl font-black text-blue-700 leading-none tracking-tighter">
              AchatImmoMartinique
            </h2>
            <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">
              Plateforme de centralisation d'annonces immo
            </p>
          </div>

          {/* MENU DESKTOP (Largeur écran > 1024px) */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ACTIONS : FAVORIS + BURGER MOBILE */}
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={onToggleFavorites} 
              className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all shadow-sm ${
                showOnlyFavorites ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ❤️ <span className="hidden sm:inline">Mes Favoris</span> ({favoritesCount})
            </button>

            {/* BOUTON BURGER (Mobile uniquement) */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MENU MOBILE DÉROULANT (S'affiche au clic sur le burger) */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 py-4 border-t border-slate-50 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            {menuLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 px-2 py-1"
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
