"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [animationData, setAnimationData] = useState(null);

  // On charge le JSON dynamiquement pour être sûr qu'il s'anime
  useEffect(() => {
    fetch("/animations/about.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        
        {/* Header avec Animation */}
        <div className="text-center mb-16">
          <div className="w-48 sm:w-64 mx-auto mb-8">
            {animationData && (
              <Lottie animationData={animationData} loop={true} />
            )}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6">
            À propos
          </h1>
          <p className="text-xl text-blue-600 font-medium max-w-2xl mx-auto">
            Un outil indépendant pour simplifier la recherche immobilière en Martinique
          </p>
        </div>

        {/* Carte de contenu principale */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 sm:p-16">
          <div className="space-y-8 text-lg text-slate-700 leading-relaxed">
            
            <p>
              <span className="font-bold text-slate-900">AchatImmoMartinique</span> est une plateforme de référencement ayant pour objectif de faciliter l’accès aux annonces immobilières publiées par les agences locales.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
              <p className="italic text-slate-800">
                Le site <strong className="text-blue-700">ne se substitue pas aux professionnels de l’immobilier</strong> et n’intervient à aucun moment dans les transactions.
              </p>
            </div>

            <p>
              Il propose un point d’entrée unique permettant d’accéder rapidement à une vue d’ensemble du marché immobilier martiniquais.
            </p>

            <p className="pt-4">
              Chaque annonce référencée renvoie vers le site de l’agence qui la publie, <span className="font-semibold text-slate-900 underline decoration-blue-500/30">seule habilitée à fournir des informations détaillées</span> et à accompagner un projet d’acquisition.
            </p>

          </div>
        </div>

        {/* Pied de page / Contact */}
        <div className="mt-16 text-center">
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg"
          >
            Nous contacter
          </a>
        </div>

      </section>
    </main>
  );
}