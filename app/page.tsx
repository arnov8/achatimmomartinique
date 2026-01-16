"use client";

import { useState, useEffect, useMemo } from "react";
import Lottie from "lottie-react";
import Papa from "papaparse";

// CORRECTION DES CHEMINS ICI :
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AnnonceCard from "./components/home/AnnonceCard";
import AboutSection from "./components/layout/AboutSection";
import EmailAlert from "./components/home/EmailAlert";
import StickyFilter from "./components/home/StickyFilter";
import AnnonceSkeleton from "./components/home/AnnonceSkeleton";

type AnnonceRaw = {
  TITRE: string;
  TYPE_NORMALISE: string;
  TYPE: string;
  COMMUNE_NORMALISEE: string;
  LOCALISATION: string;
  PRIX_NORMALISE: string;
  PRIX: string;
  LIEN: string;
  SURFACE: string;
  "NOMBRE DE PIECES": string;
  "NOMBRE APPARTS": string; 
  SOCIETE: string;
  "DATE ET HEURE": string;
};

export default function Home() {
  const [annonces, setAnnonces] = useState<AnnonceRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationData, setAnimationData] = useState(null);
  const [filterCommune, setFilterCommune] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPieces, setFilterPieces] = useState("");
  const [filterSurface, setFilterSurface] = useState("");
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
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setAnnonces(results.data as AnnonceRaw[]);
            setLoading(false);
          },
        });
      });

    fetch("https://assets9.lottiefiles.com/packages/lf20_m6zptbeu.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));

    const savedFavs = localStorage.getItem("favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };

  const updateNote = (id: string, note: string) => {
    const newNotes = { ...notes, [id]: note };
    setNotes(newNotes);
    localStorage.setItem("notes", JSON.stringify(newNotes));
  };

  const filteredAnnonces = useMemo(() => {
    return annonces.filter((a) => {
      if (showOnlyFavorites && !favorites.includes(a.LIEN)) return false;
      if (filterCommune && a.COMMUNE_NORMALISEE !== filterCommune) return false;
      if (filterType && a.TYPE_NORMALISE !== filterType) return false;
      if (filterPieces && a.SURFACE !== filterPieces) return false;
      
      const prix = parseInt(a.PRIX_NORMALISE);
      if (filterPrixMin && prix < parseInt(filterPrixMin)) return false;
      if (filterPrixMax && prix > parseInt(filterPrixMax)) return false;
      
      return true;
    });
  }, [annonces, filterCommune, filterType, filterPieces, filterPrixMin, filterPrixMax, favorites, showOnlyFavorites]);

  const paginatedData = filteredAnnonces.slice(0, 100);

  const getEcartPrixM2 = (annonce: AnnonceRaw) => {
    const prix = parseInt(annonce.PRIX_NORMALISE);
    const surface = parseInt(annonce.SURFACE);
    if (!prix || !surface) return null;
    const prixM2 = prix / surface;
    const prixM2Moyen = 3500; 
    const ecart = ((prixM2 - prixM2Moyen) / prixM2Moyen) * 100;
    return { prixM2, ecart };
  };

  const stats = useMemo(() => {
    if (filteredAnnonces.length === 0) return { avg: 0, min: 0 };
    const prix = filteredAnnonces.map(a => parseInt(a.PRIX_NORMALISE)).filter(p => !isNaN(p));
    return {
      avg: Math.round(prix.reduce((a, b) => a + b, 0) / prix.length),
      min: Math.min(...prix)
    };
  }, [filteredAnnonces]);

  const simulation = useMemo(() => {
    if (!selectedAnnonce) return null;
    const capital = parseInt(selectedAnnonce.PRIX_NORMALISE) - apport;
    const tauxMensuel = 0.04 / 12;
    const dureeMois = 25 * 12;
    const mensualite = (capital * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois));
    return { mensualite: Math.round(mensualite), capital };
  }, [selectedAnnonce, apport]);

  const rendementData = useMemo(() => {
    if (!investAnnonce) return null;
    const prix = parseInt(investAnnonce.PRIX_NORMALISE);
    const loyerEstime = (parseInt(investAnnonce.SURFACE) * 15) || 800;
    const brut = (loyerEstime * 12 / prix) * 100;
    const net = brut * 0.8; 
    return { brut, net, loyerEstime };
  }, [investAnnonce]);

  return (
    <main className="min-h-screen bg-white">
      <Header 
        favoritesCount={favorites.includes.length} 
        onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
        showOnlyFavorites={showOnlyFavorites}
      />
      
      {/* HERO SECTION - RAFFINÉ (Espaces réduits) */}
      <section className="bg-slate-50 py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Nouveau : Mode Investisseur inclus
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              Toutes les annonces de la <span className="text-blue-700">Martinique</span> au même endroit.
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl">
              Ne perdez plus de temps à parcourir 10 sites. Nous centralisons tout pour vous aider à trouver votre futur chez-vous.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => document.getElementById('listing')?.scrollIntoView({behavior:'smooth'})} className="bg-blue-700 text-white px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-200">
                Voir les annonces
              </button>
            </div>
          </div>
          <div className="hidden lg:block h-[400px]">
            {animationData && <Lottie animationData={animationData} className="h-full w-full" />}
          </div>
        </div>
      </section>

      {/* FILTRES - RAFFINÉ (Compact et Moderne) */}
      <section id="listing" className="max-w-[1600px] mx-auto px-4 md:px-6 -mt-10 relative z-10">
        <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <FilterBox label="Commune" onChange={setFilterCommune}>
              <option value="">Toutes</option>
              {Array.from(new Set(annonces.map(a => a.COMMUNE_NORMALISEE))).filter(Boolean).sort().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FilterBox>

            <FilterBox label="Type de bien" onChange={setFilterType}>
              <option value="">Tous</option>
              {Array.from(new Set(annonces.map(a => a.TYPE_NORMALISE))).filter(Boolean).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </FilterBox>

            <FilterBox label="Surface min" onChange={setFilterSurface}>
              <option value="">Peu importe</option>
              {[20, 40, 60, 80, 100, 150].map(s => <option key={s} value={s}>{s} m² +</option>)}
            </FilterBox>

            <FilterBox label="Prix Min" onChange={setFilterPrixMin}>
              <option value="">0 €</option>
              {[100000, 200000, 300000, 400000, 500000].map(p => <option key={p} value={p}>{p.toLocaleString()} €</option>)}
            </FilterBox>

            <FilterBox label="Prix Max" onChange={setFilterPrixMax}>
              <option value="">Illimité</option>
              {[200000, 300000, 400000, 500000, 750000, 1000000].map(p => <option key={p} value={p}>{p.toLocaleString()} €</option>)}
            </FilterBox>

            <div className="flex flex-col gap-3 justify-end">
              <button onClick={() => { setFilterCommune(""); setFilterType(""); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase text-[10px] py-4 rounded-xl transition-all">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* BARRE D'INFOS - RAFFINÉE (Plus fine) */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 mb-8 gap-6">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xl">📊</span>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Résultats</p>
              <p className="text-sm font-bold text-slate-800">{filteredAnnonces.length} annonces trouvées</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-2">Outils Pro :</span>
            <button 
              onClick={() => setInvestorMode(!investorMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                investorMode ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🚀 Mode Investisseur {investorMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* GRILLE ANNONCES - RAFFINÉE (Gap réduit) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 mb-16">
          {loading ? (
            <>
              {[...Array(10)].map((_, i) => (
                <AnnonceSkeleton key={i} />
              ))}
            </>
          ) : (
            paginatedData.map((annonce, index) => (
              <AnnonceCard 
                key={index}
                annonce={annonce}
                isFav={favorites.includes(annonce.LIEN)}
                onToggleFavorite={toggleFavorite}
                note={notes[annonce.LIEN] || ""}
                onUpdateNote={updateNote}
                investorMode={investorMode}
                onSimulateLoan={(a) => {
                  setSelectedAnnonce(a);
                  setApport(Math.round(parseInt(a.PRIX_NORMALISE) * 0.1));
                }}
                onCalculateInvest={(a) => setInvestAnnonce(a)}
                ecartData={getEcartPrixM2(annonce)}
              />
            ))
          )}
        </div>

        <EmailAlert />
        <AboutSection />
      </section>

      <Footer />

      {/* MODALE SIMULATION - RAFFINÉE (Espaces optimisés) */}
      {selectedAnnonce && simulation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Estimer mon crédit</h3>
            <p className="text-sm text-slate-500 mb-6">{selectedAnnonce.TITRE}</p>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Apport Personnel (€)</label>
                <input 
                  type="number" 
                  value={apport} 
                  onChange={(e) => setApport(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Mensualité estimée (25 ans / 4%)</p>
                <p className="text-4xl font-black text-blue-700">{simulation.mensualite} € <span className="text-sm opacity-50">/mois</span></p>
              </div>
            </div>
            <button onClick={() => setSelectedAnnonce(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all">Fermer</button>
          </div>
        </div>
      )}

      {/* MODALE INVESTISSEUR - RAFFINÉE */}
      {investAnnonce && rendementData && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">💰</span>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Analyse Investisseur</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-[9px] font-bold uppercase text-slate-400">Loyer Estime (15€/m2)</p>
                <p className="text-lg font-black text-slate-800">{rendementData.loyerEstime} €</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-[9px] font-bold uppercase text-slate-400">Cash-flow Brut</p>
                <p className="text-lg font-black text-slate-800">+{Math.round(rendementData.loyerEstime * 0.7)} €</p>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex justify-around text-center mb-8">
              <div>
                <p className="text-2xl font-black text-indigo-600">{rendementData.brut.toFixed(2)} %</p>
                <p className="text-[9px] font-bold uppercase opacity-50">Brut</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-600">{rendementData.net.toFixed(2)} %</p>
                <p className="text-[9px] font-bold uppercase opacity-50">Net</p>
              </div>
            </div>
            <button onClick={() => setInvestAnnonce(null)} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all">Fermer</button>
          </div>
        </div>
      )}

      <StickyFilter />
    </main>
  );
}

// Fonction utilitaire FilterBox - RAFFINÉE (Plus compacte)
function FilterBox({ label, children, onChange }: { label: string; children: React.ReactNode; onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <select 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all shadow-sm"
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
