"use client";

export default function AboutSection() {
  return (
    <section className="bg-slate-50 py-16 px-4 md:px-6 border-t border-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 md:p-14 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Petit accent décoratif en arrière-plan */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <div className="relative z-10">
            <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              💡 Notre Mission
            </span>
            
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-10 leading-tight tracking-tight">
              Une approche centralisée pour votre recherche immobilière en Martinique 🏝️
            </h2>
            
            <div className="grid gap-8 text-slate-600 leading-relaxed text-sm md:text-base">
              <div className="flex gap-4">
                <span className="text-2xl flex-shrink-0">🔍</span>
                <p>
                  Trouver un bien immobilier en Martinique implique souvent de consulter de nombreux sites d’agences, 
                  de comparer des informations hétérogènes et de naviguer entre différentes plateformes.
                </p>
              </div>
              
              <div className="flex gap-4 items-center bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <span className="text-2xl flex-shrink-0">🚀</span>
                <p className="font-bold text-blue-800">
                  AchatImmoMartinique a été conçu pour simplifier cette démarche en regroupant tout en un seul point d'accès.
                </p>
              </div>

              <div className="flex gap-4">
                <span className="text-2xl flex-shrink-0">🤝</span>
                <p>
                  Le site centralise les annonces des agences locales, tout en conservant un lien direct vers leurs sites officiels. 
                  L’objectif n’est pas de remplacer les professionnels, mais de proposer un 
                  <span className="text-slate-900 font-bold"> outil de consultation centralisé</span> pour faciliter votre recherche.
                </p>
              </div>

              <div className="pt-8 border-t border-slate-100 mt-4">
                <div className="flex gap-4 items-start bg-slate-50 p-5 rounded-2xl">
                  <span className="text-xl flex-shrink-0 opacity-70">⚖️</span>
                  <p className="text-xs md:text-sm text-slate-500 italic leading-snug">
                    <strong className="text-slate-700 not-italic uppercase text-[10px] block mb-1">Transparence totale</strong>
                    AchatImmoMartinique ne commercialise aucun bien, ne perçoit aucune commission et n’intervient pas dans les transactions. 
                    Chaque annonce renvoie vers l’annonce d’origine publiée par l’agence concernée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
