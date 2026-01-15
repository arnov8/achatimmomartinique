"use client";

interface FooterProps {
  onToggleFavorites: () => void;
}

export default function Footer({ onToggleFavorites }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 px-6 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-xl md:text-2xl font-black text-blue-400 mb-2 italic">AchatImmoMartinique</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Plateforme de centralisation d'annonces immo</p>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-md font-medium">AchatImmoMartinique est un site indépendant de référencement d’annonces immobilières. Le site ne commercialise aucun bien et n’intervient pas dans les transactions.</p>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-8 border-b border-white/10 pb-2">Navigation</h4>
          <ul className="space-y-4 text-xs font-bold text-slate-300">
            <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-blue-400 transition-colors">Rechercher un bien (accueil)</button></li>
            <li><a href="#alerte-email" className="hover:text-blue-400 transition-colors">Alerte Email</a></li>
            <li><button onClick={onToggleFavorites} className="hover:text-blue-400 transition-colors text-left">Mes favoris</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-8 border-b border-white/10 pb-2">Informations</h4>
          <ul className="space-y-4 text-xs font-bold text-slate-300">
            <li><a href="/mentions-legales" className="hover:text-blue-400 transition-colors">Mention légales</a></li>
            <li><a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
            <li className="text-[9px] opacity-30 italic">MAJ : {new Date().toLocaleDateString('fr-FR')}</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
        <p className="text-[9px] font-bold uppercase tracking-widest">© {new Date().getFullYear()} • AchatImmoMartinique</p>
        <span className="text-[10px] font-black uppercase tracking-widest">L'EFFICACITÉ POUR LA RECHERCHE IMMOBILIÈRE</span>
      </div>
    </footer>
  );
}
