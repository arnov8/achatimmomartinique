"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/animations/About.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        
        {/* Header avec Animation */}
        <div className="text-center mb-16">
          <div className="w-48 sm:w-64 mx-auto mb-8">
            {animationData && (
              <Lottie animationData={animationData} loop={true} />
            )}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            À propos
          </h1>
          <p className="text-xl sm:text-2xl text-blue-600 font-semibold max-w-3xl mx-auto">
            Notre mission : simplifier l’achat immobilier en Martinique
          </p>
        </div>

        {/* Section Mission */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 sm:p-16 mb-12">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              <span className="font-bold text-slate-900">AchatImmoMartinique.com</span> a été conçu pour répondre à un besoin clair : 
              <span className="text-blue-600 font-medium text-xl block mt-2"> 
                Rassembler toutes les annonces immobilières de l’île sur une seule plateforme facile d’accès.
              </span>
            </p>
            
            <p className="text-slate-600 mb-10 leading-relaxed">
              Nous savons qu’aujourd’hui, le marché immobilier en Martinique est riche mais éclaté. Entre agences, portails nationaux et sites spécialisés, il est difficile de voir l’ensemble des biens disponibles au même endroit. C’est pourquoi nous avons créé un système qui agrège les offres de nos partenaires pour vous offrir :
            </p>

            {/* Grid Avantages - Utilisation d'Emojis à la place de Lucide */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-3xl mb-3">📍</span>
                <p className="text-sm font-bold text-slate-800 leading-tight">Une vue complète du marché local</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-3xl mb-3">⚡</span>
                <p className="text-sm font-bold text-slate-800 leading-tight">Des résultats mis à jour en continu</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-3xl mb-3">🔍</span>
                <p className="text-sm font-bold text-slate-800 leading-tight">Une recherche optimisée par critères</p>
              </div>
            </div>

            <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl shadow-blue-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                ✅ Notre engagement
              </h3>
              <p className="leading-relaxed opacity-95">
                <strong>Transparence, simplicité et neutralité.</strong> Nous ne sommes pas une agence : nous vous donnons les outils pour prendre une décision éclairée, tout en vous renvoyant directement vers les professionnels responsables de chaque annonce.
              </p>
            </div>
          </div>
        </div>

        {/* Section Pourquoi nous faire confiance */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-900 rounded-[2.5rem] p-8 sm:p-16 text-white">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-blue-400 block text-sm uppercase tracking-widest mb-2 font-black">Confiance & Transparence</span>
              Pourquoi choisir notre plateforme ?
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              AchatImmoMartinique.com s’appuie sur une méthodologie rigoureuse. Les annonces proviennent exclusivement de <span className="text-white font-semibold underline decoration-blue-500 underline-offset-4">professionnels de l'immobilier identifiés</span>.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
              <p className="text-sm text-slate-200">
                La plateforme ne modifie ni les prix, ni les descriptions, ni les coordonnées des annonces.
              </p>
            </div>
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
              <p className="text-sm text-slate-200">
                Chaque bien renvoie systématiquement vers sa source officielle, garantissant une information fiable.
              </p>
            </div>
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
              <p className="text-sm text-slate-200">
                Une vision claire du marché en Martinique, sans intermédiaire ni biais commercial.
              </p>
            </div>
          </div>
        </div>

        {/* Pied de page / Contact */}
        <div className="mt-16 text-center">
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-full font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl"
          >
            Nous contacter
          </a>
        </div>

      </section>
    </main>
  );
}
