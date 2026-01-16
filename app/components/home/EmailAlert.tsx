"use client";

import { useState } from "react";

interface EmailAlertProps {
  currentCommune: string;
  currentType: string;
  currentPrixMax: string;
  onAlertSubmit: (email: string, criteria: any) => Promise<void>;
}

export default function EmailAlert({ currentCommune, currentType, currentPrixMax, onAlertSubmit }: EmailAlertProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [extraCriteria, setExtraCriteria] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("⏳ Traitement...");
    try {
      await onAlertSubmit(email, {
        commune: currentCommune || "Toute la Martinique",
        type: currentType || "Tous les types",
        prixMax: currentPrixMax || "Sans limite",
        extra: extraCriteria
      });
      setStatus("✅ Alerte activée !");
      setEmail("");
      setExtraCriteria("");
      setTimeout(() => setStatus(""), 5000);
    } catch (error) {
      setStatus("❌ Une erreur est survenue");
    }
  };

  return (
    <section id="alerte-email" className="relative overflow-hidden bg-blue-700 rounded-[2.5rem] p-8 md:p-14 mb-12 shadow-2xl border-4 border-white/10">
      {/* Motifs décoratifs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full -ml-32 -mb-32 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 px-4 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-white text-[10px] font-black uppercase tracking-widest">Service Puissant Gratuit</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Ne ratez plus aucune <span className="text-cyan-300">opportunité</span> 🔔
          </h2>
          
          <p className="text-blue-100 text-base md:text-lg max-w-xl font-medium">
            Le marché martiniquais est très réactif. Soyez le premier informé dès qu'un bien correspond à vos attentes.
          </p>

          <div className="flex flex-wrap gap-3 py-4">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold">
              📍 {currentCommune || "Toute la Martinique"}
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold">
              🏠 {currentType || "Tous types"}
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold">
              💰 Max: {currentPrixMax ? `${parseInt(currentPrixMax).toLocaleString()} €` : "Illimité"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full lg:w-[450px] bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Précisions (ex: Piscine, Vue mer...)</label>
            <input 
              type="text" 
              placeholder="Ajouter d'autres critères..." 
              value={extraCriteria}
              onChange={(e) => setExtraCriteria(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Votre Email</label>
            <input 
              type="email" 
              required 
              placeholder="votre-email@exemple.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500 transition-all"
            />
          </div>

          <button className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-200/50 transform hover:-translate-y-1">
            {status || "Activer mon alerte immo 🚀"}
          </button>

          <div className="flex items-center gap-3 justify-center pt-2">
            <span className="text-[10px] text-slate-400 font-medium">🛡️ Pas de spam. Désinscription en 1 clic.</span>
          </div>
        </form>
      </div>
    </section>
  );
}
