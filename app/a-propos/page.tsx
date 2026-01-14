"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Globe, Zap, Search } from "lucide-react";

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
              <span className="text-blue-600 font-medium"> rassembler toutes les annonces immobilières de l’île sur une seule plateforme facile d’accès.</span>
            </p>
            
            <p className="text-slate-600 mb-10">
              Nous savons qu’aujourd’hui, le marché immobilier en Martinique est riche mais éclaté. Entre agences, portails nationaux et sites spécialisés, il est difficile de voir l’ensemble des biens disponibles au même endroit.
            </p>

            {/* Grid Avantages */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-bold text-slate-800 leading-tight">Vue complète du marché local</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-bold text-slate-800 leading-tight">Résultats mis à jour en continu</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-bold text-slate-800 leading-tight">Recherche optimisée par critères</p>
              </div>
            </div>

            <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl shadow-blue-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" /> Notre engagement
              </h3>
              <p className="leading-relaxed opacity-90">
                Transparence, simplicité et neutralité. Nous ne sommes pas une agence : nous vous donnons les outils pour prendre une décision éclairée, tout en vous renvoyant directement vers les professionnels responsables de chaque annonce.
              </p>
            </div>
          </div>
        </div>

        {/* Section Confiance */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-900 rounded-[2.5rem] p-8 sm:p-16 text-white">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <ShieldCheck className="text-blue-400 w-10 h-10" />
              Pourquoi nous faire confiance ?
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              AchatImmoMartinique.com s’appuie sur une méthodologie rigoureuse et transparente. Les annonces proviennent exclusivement de <span className="text-white font-semibold">professionnels de l'immobilier identifiés</span>.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-300">
                La plateforme ne modifie ni les prix, ni les descriptions, ni les coordonnées.
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-300">
                Chaque bien renvoie systématiquement vers sa source officielle (information fiable).
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-300">
                Une vision claire sans intermédiaire ni biais commercial.
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
            Une question ? Contactez-nous
          </a>
        </div>

      </section>
    </main>
  );
}
