"use client";

import Link from "next/link";

interface HeaderProps {
  favoritesCount: number;
  onToggleFavorites: () => void;
  showOnlyFavorites: boolean;
}

export default function Header({ favoritesCount, onToggleFavorites, showOnlyFavorites }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md py-4 px-4 md:px-6 border-b border-slate-100 sticky top-0 z-40 shadow-sm print:hidden">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* LOGO ET TITRE */}
        <div className="flex flex-col cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <h2 className="text-xl md:text-2xl font-black text-blue-700 leading-none tracking-tighter">
            AchatImmoMartinique
          </h2>
          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">
            Plateforme de centralisation d'annonces immo
          </p>
        </div>

        {/* MENU DE NAVIGATION (Restauré) */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">
            Accueil
          </Link>
          <Link href="/a-propos" className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">
            À propos
          </Link>
          <Link href="/mentions-legales" className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">
            Mentions légales
          </Link>
          <Link href="/methodologie" className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">
            Méthodologie
          </Link>
          <Link href="/contact" className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* BOUTON FAVORIS */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleFavorites} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all shadow-sm ${
              showOnlyFavorites ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ❤️ <span className="hidden sm:inline">Mes Favoris</span> ({favoritesCount})
          </button>
        </div>
      </div>
    </header>
  );
}
