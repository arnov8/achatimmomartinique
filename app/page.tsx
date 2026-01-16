"use client";

import { useState, useEffect, useMemo } from "react";
import Lottie from "lottie-react";
import Papa from "papaparse";

// COMPOSANTS
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AnnonceCard from "./components/home/AnnonceCard";
import AboutSection from "./components/layout/AboutSection";
import EmailAlert from "./components/home/EmailAlert";
import StickyFilter from "./components/home/StickyFilter";
import AnnonceSkeleton from "./components/home/AnnonceSkeleton";

type AnnonceRaw = {
  TITRE: string; TYPE_NORMALISE: string; TYPE: string; COMMUNE_NORMALISEE: string;
  LOCALISATION: string; PRIX_NORMALISE: string; PRIX: string; LIEN: string;
  SURFACE: string; "NOMBRE DE PIECES": string; "NOMBRE APPARTS": string; 
  SOCIETE: string; "DATE ET HEURE": string;
};

export default function Home() {
  const [annonces, setAnnonces] = useState<AnnonceRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationData, setAnimationData] = useState(null);
  const [filterCommune, setFilterCommune] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPrixMin, setFilterPrixMin] = useState("");
  const [filterPrixMax, setFilterPrixMax] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [notes, setNotes] = useState<{[key: string]: string}>({});
  const [investorMode, setInvestorMode] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState<AnnonceRaw | null>(null);
  const [apport, setApport] = useState(0);
  const [investAnnonce, setInvestAnnonce] = useState<AnnonceRaw | null>(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/Antho972/scrapping_immo/refs/heads/main/all_annonces.csv")
      .then(r => r.text()).then(csv => {
        Papa.parse(csv, { header: true, skipEmptyLines: true, complete: (res) => {
          setAnnonces(res.data as AnnonceRaw[]); setLoading(false);
        }});
      });
    fetch("https://assets9.lottiefiles.com/packages/lf20_m6zptbeu.json").then(r => r.json()).then(setAnimationData);
    setFavorites(JSON.parse(localStorage.getItem("favorites") || "[]"));
    setNotes(JSON.parse(localStorage.getItem("notes") || "{}"));
  }, []);

  const toggleFavorite = (id: string) => {
    const newF = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newF); localStorage.setItem("favorites", JSON.stringify(newF));
  };

  const filteredAnnonces = useMemo(() => {
    return annonces.filter(a => {
      if (showOnlyFavorites && !favorites.includes(a.LIEN)) return false;
      if (filterCommune && a.COMMUNE_NORMALISEE !== filterCommune) return false;
      if (filterType && a.TYPE_NORMALISE !== filterType) return false;
      const p = parseInt(a.PRIX_NORMALISE);
      if (filterPrixMin && p < parseInt(filterPrixMin)) return false;
      if (filterPrixMax && p > parseInt(filterPrixMax)) return false;
      return true;
    });
  }, [annonces, filterCommune, filterType, filterPrixMin, filterPrixMax, favorites, showOnlyFavorites]);

  const simulation = useMemo(() => {
    if (!selectedAnnonce) return null;
    const cap = parseInt(selectedAnnonce.PRIX_NORMALISE) - apport;
    const m = (cap * (0.04/12)) / (1 - Math.pow(1 + (0.04/12), -300));
    return { mensualite: Math.round(m) };
  }, [selectedAnnonce, apport]);
  return (
    <main className="min-h-screen bg-white">
      <Header favoritesCount={favorites.length} onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)} showOnlyFavorites={showOnlyFavorites} />
      
      <section className="bg-slate-50 py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Mode Investisseur inclus</div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">Toutes les annonces immo de <span className="text-blue-700">Martinique</span>.</h1>
            <p className="text-lg text-slate-500 font-medium">L'outil de centralisation le plus complet pour votre recherche.</p>
            <button onClick={() => document.getElementById('listing')?.scrollIntoView({behavior:'smooth'})} className="bg-blue-700 text-white px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-blue-200">Voir les annonces</button>
          </div>
          <div className="hidden lg:block h-[400px]">{animationData && <Lottie animationData={animationData} className="h-full w-full" />}</div>
        </div>
      </section>

      <section id="listing" className="max-w-[1600px] mx-auto px-4 md:px-6 -mt-10 relative z-10">
        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-2xl border border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <FilterBox label="Commune" onChange={setFilterCommune}>
              <option value="">Toutes</option>
              {Array.from(new Set(annonces.map(a => a.COMMUNE_NORMALISEE))).filter(Boolean).sort().map(c => <option key={c} value={c}>{c}</option>)}
            </FilterBox>
            <FilterBox label="Type" onChange={setFilterType}>
              <option value="">Tous</option>
              {Array.from(new Set(annonces.map(a => a.TYPE_NORMALISE))).filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
            </FilterBox>
            <FilterBox label="Prix Min" onChange={setFilterPrixMin}>
              <option value="">0 €</option>
              {[100000, 200000, 300000].map(p => <option key={p} value={p}>{p.toLocaleString()} €</option>)}
            </FilterBox>
            <FilterBox label="Prix Max" onChange={setFilterPrixMax}>
              <option value="">Illimité</option>
              {[300000, 500000, 750000, 1000000].map(p => <option key={p} value={p}>{p.toLocaleString()} €</option>)}
            </FilterBox>
            <button onClick={() => {setFilterCommune(""); setFilterType("");}} className="self-end bg-slate-100 text-slate-600 font-black uppercase text-[10px] py-4 rounded-xl hover:bg-slate-200 transition-all">Reset</button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 mb-8 px-2">
          <div className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{filteredAnnonces.length} résultats</div>
          <button onClick={() => setInvestorMode(!investorMode)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${investorMode ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>🚀 Mode Investisseur</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 mb-16">
          {loading ? <>{[...Array(10)].map((_, i) => <AnnonceSkeleton key={i} />)}</> : 
            filteredAnnonces.slice(0, 100).map((a, i) => (
              <AnnonceCard key={i} annonce={a} isFav={favorites.includes(a.LIEN)} onToggleFavorite={toggleFavorite} note={notes[a.LIEN] || ""} onUpdateNote={(id, n) => {const nts={...notes, [id]:n}; setNotes(nts); localStorage.setItem("notes", JSON.stringify(nts));}} investorMode={investorMode} onSimulateLoan={sel => {setSelectedAnnonce(sel); setApport(Math.round(parseInt(sel.PRIX_NORMALISE)*0.1));}} onCalculateInvest={setInvestAnnonce} ecartData={{prixM2: parseInt(a.PRIX_NORMALISE)/parseInt(a.SURFACE), ecart: ((parseInt(a.PRIX_NORMALISE)/parseInt(a.SURFACE)-3500)/3500)*100}} />
            ))
          }
        </div>
        <EmailAlert /><AboutSection />
      </section>
      <Footer />

      {selectedAnnonce && simulation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-black mb-4 uppercase">Estimer mon crédit</h3>
            <input type="number" value={apport} onChange={e => setApport(parseInt(e.target.value))} className="w-full bg-slate-50 border p-4 rounded-xl mb-4 font-bold outline-none" />
            <div className="bg-blue-50 p-5 rounded-2xl mb-6 text-center">
              <p className="text-4xl font-black text-blue-700">{simulation.mensualite} € <span className="text-sm opacity-50 font-bold">/mois</span></p>
            </div>
            <button onClick={() => setSelectedAnnonce(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px]">Fermer</button>
          </div>
        </div>
      )}

      {investAnnonce && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase text-center">Analyse Investisseur</h3>
            <div className="bg-indigo-50 p-6 rounded-2xl flex justify-around mb-8 text-center">
              <div><p className="text-2xl font-black text-indigo-600">{(( (parseInt(investAnnonce.SURFACE)*15)*12 ) / parseInt(investAnnonce.PRIX_NORMALISE)*100).toFixed(2)} %</p><p className="text-[9px] font-bold uppercase opacity-50">Rendement Brut</p></div>
            </div>
            <button onClick={() => setInvestAnnonce(null)} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase text-[10px]">Fermer</button>
          </div>
        </div>
      )}
      <StickyFilter />
    </main>
  );
}

function FilterBox({ label, children, onChange }: { label: string; children: React.ReactNode; onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <select onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none appearance-none shadow-sm cursor-pointer">{children}</select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
}
