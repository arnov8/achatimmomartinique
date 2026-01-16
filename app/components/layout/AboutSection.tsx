"use client";

export default function AboutSection() {
  return (
    <section className="bg-slate-50 py-16 px-4 md:px-6 border-t border-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 leading-tight">
            Une approche centralisée pour votre recherche immobilière en Martinique
          </h2>
          
          <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
            <p>
              Trouver un bien immobilier en Martinique implique souvent de consulter de nombreux sites d’agences, 
              de comparer des informations présentées de manière hétérogène et de naviguer entre différentes plateformes.
            </p>
            
            <p className="font-semibold text-blue-700">
              AchatImmoMartinique a été conçu pour simplifier cette démarche.
            </p>

            <p>
              Le site regroupe, en un seul point d’accès, les annonces immobilières diffusées par les agences locales, 
              tout en conservant un lien direct vers leurs sites officiels. 
              L’objectif n’est pas de remplacer les professionnels de l’immobilier, mais de proposer un 
              <strong> outil de consultation centralisé</strong>, facilitant la comparaison et la recherche.
            </p>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <p className="text-xs md:text-sm text-slate-500 italic">
                AchatImmoMartinique ne commercialise aucun bien, ne perçoit aucune commission et n’intervient à 
                aucun moment dans les transactions. Chaque annonce consultable sur le site renvoie vers 
                l’annonce d’origine publiée par l’agence concernée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
