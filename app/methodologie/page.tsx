"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export default function MethodologyPage() {
  const [animationData, setAnimationData] = useState(null);

  // Chargement robuste de l'animation pour Turbopack
  useEffect(() => {
    fetch("/animations/methodology.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Erreur chargement Lottie:", err));
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
            Méthodologie et sources
          </h1>
          <p className="text-xl text-blue-600 font-medium max-w-2xl mx-auto">
            Comment sont collectées les annonces ?
          </p>
        </div>

        {/* Contenu Principal */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 sm:p-16">
          <div className="prose prose-lg max-w-none">
            
            {/* Section 1 */}
            <div className="mb-12 pb-12 border-b border-slate-100">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 flex items-center gap-4">
                <span className="bg-blue-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg shadow-blue-200">1</span>
                Collecte des données
              </h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                Les annonces présentées sur <strong className="text-blue-600">AchatImmoMartinique</strong> sont collectées à partir de <strong>sources accessibles publiquement</strong>, principalement les sites internet des agences et professionnels de l'immobilier exerçant en Martinique.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Un traitement automatisé permet d'identifier les annonces et d'en extraire les informations principales :
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Type de bien
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Localisation (commune)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Prix de vente
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Surface habitable
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 flex items-center gap-4">
                <span className="bg-blue-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg shadow-blue-200">2</span>
                Traitement et présentation
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Ces informations sont ensuite <strong>présentées sous un format homogène</strong> afin de faciliter leur consultation. L'objectif est de permettre aux utilisateurs d'avoir une <strong>vue d'ensemble du marché</strong> sans avoir à naviguer entre des dizaines de sites.
              </p>
            </div>

            {/* Section Avertissement */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-8 rounded-2xl mb-8">
              <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                Important à savoir
              </h3>
              <p className="text-amber-800 leading-relaxed mb-4">
                Des <strong>écarts peuvent exister</strong> en raison des délais de mise à jour ou de modifications apportées par les agences après la collecte.
              </p>
              <ul className="space-y-2 text-sm text-amber-700 italic">
                <li>• Biens potentiellement déjà vendus ou loués</li>
                <li>• Erreurs de saisie sur le site source</li>
              </ul>
            </div>

            {/* Source de vérité */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-2xl mb-12">
              <h3 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                Source de vérité
              </h3>
              <p className="text-blue-800 font-bold text-lg">
                Seules les annonces publiées sur les sites des agences immobilières font foi.
              </p>
              <p className="text-blue-700 mt-2">
                Chaque annonce renvoie systématiquement vers le site officiel de l'agence.
              </p>
            </div>

            {/* Call to action */}
            <div className="pt-10 border-t border-slate-100 text-center">
              <p className="text-slate-600 mb-8">
                Vous constatez une erreur ou souhaitez plus d'informations ?
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg hover:scale-105"
              >
                Nous contacter
              </a>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}