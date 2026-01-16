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
  // --- TOUTE VOTRE LOGIQUE ACTUELLE (CONSERVÉE) ---
  const [annonces, setAnnonces] = useState<AnnonceRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationData, setAnimationData] = useState(null);
  const [filterCommune, setFilterCommune] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPieces, setFilterPieces] = useState("");
  const [sortBy, setSortBy] = useState("recent");etape 2 jai c
  const [filterSurface, setFilterSurface] = useState("");
  const [filterPrixMin, setFilterPrixMin] = useState("");
  const [filterPrixMax, setFilterPrixMax] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [investorMode, setInvestorMode] = useState(false);
  const [email, setEmail] = useState("");
  const [alertStatus, setAlertStatus] = useState("");
  const [selectedAnnonce, setSelectedAnnonce] = useState<AnnonceRaw | null>(null);
  const [apport, setApport] = useState(0);
  const [duree, setDuree] = useState(20);
  const [taux, setTaux] = useState(3.8);
  const [investAnnonce, setInvestAnnonce] = useState<AnnonceRaw | null>(null);
  const [loyerEstime, setLoyerEstime] = useState(800);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_URL || "";

  useEffect(() => {
    const savedFavs = localStorage.getItem("mes-favoris-immo");
    if (savedFavs) { setFavorites(JSON.parse(savedFavs)); }
    const savedNotes = localStorage.getItem("mes-notes-immo");
    if (savedNotes) { setNotes(JSON.parse(savedNotes)); }
  }, []);

  useEffect(() => { localStorage.setItem("mes-favoris-immo", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("mes-notes-immo", JSON.stringify(notes)); }, [notes]);

  useEffect(() => {
    fetch("/animations/search-house.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Erreur Lottie:", err));
  }, []);

  const fetchAnnonces = () => {
    setLoading(true);
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = (results.data as AnnonceRaw[]).filter(a => 
          a.LIEN && a.PRIX_NORMALISE && parseInt(a.PRIX_NORMALISE) >= 10000
        );
        setAnnonces(data);
        setLoading(false);
      },
    });
  };

  useEffect(() => { fetchAnnonces(); }, []);

  const toggleFavorite = (lien: string) => {
    setFavorites(prev => prev.includes(lien) ? prev.filter(id => id !== lien) : [...prev, lien]);
  };

  const updateNote = (lien: string, text: string) => {
    setNotes(prev => ({ ...prev, [lien]: text }));
  };

  const handleToggleOnlyFavorites = () => {
    setShowOnlyFavorites(!showOnlyFavorites);
    setCurrentPage(1);
    document.getElementById('listing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAlertSubmit = async (email: string, criteria: any) => {
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSec-DdyTrrQCu4zXyvdR4GBOy0bpIfLk_3003p0AO-U9KmF7Q/formResponse";
    const formData = new FormData();
    formData.append("entry.1097581547", email); 
    formData.append("entry.1184240355", criteria.type);
    formData.append("entry.1319234674", criteria.commune);
    formData.append("entry.624227201", criteria.prixMax);
    // On ajoute les précisions supplémentaires dans un champ note si nécessaire
    // formData.append("entry.VOTRE_ID_NOTE", criteria.extra); 

    await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });
  };

  const prixMoyensParCommune = useMemo(() => {
    const stats: Record<string, { habitableTotal: number; habitableCount: number; terrainTotal: number; terrainCount: number; }> = {};
    annonces.forEach(a => {
      const commune = a.COMMUNE_NORMALISEE;
      const prix = parseInt(a.PRIX_NORMALISE);
      const surface = parseInt(a.SURFACE);
      const type = a.TYPE_NORMALISE;
      if (!commune || !prix || !surface || surface <= 0) return;
      if (!stats[commune]) { stats[commune] = { habitableTotal: 0, habitableCount: 0, terrainTotal: 0, terrainCount: 0 }; }
      const prixM2 = prix / surface;
      if (["Appartement", "Maison", "Villa"].includes(type)) {
        stats[commune].habitableTotal += prixM2;
        stats[commune].habitableCount += 1;
      } else if (type === "Terrain") {
        stats[commune].terrainTotal += prixM2;
        stats[commune].terrainCount += 1;
      }
    });
    const moyennes: Record<string, { habitableMoyen: number; terrainMoyen: number }> = {};
    Object.keys(stats).forEach(commune => {
      const s = stats[commune];
      moyennes[commune] = {
        habitableMoyen: s.habitableCount > 0 ? s.habitableTotal / s.habitableCount : 0,
        terrainMoyen: s.terrainCount > 0 ? s.terrainTotal / s.terrainCount : 0
      };
    });
    return moyennes;
  }, [annonces]);

  const getEcartPrixM2 = (annonce: AnnonceRaw) => {
    const commune = annonce.COMMUNE_NORMALISEE;
    const prix = parseInt(annonce.PRIX_NORMALISE);
    const surface = parseInt(annonce.SURFACE);
    const type = annonce.TYPE_NORMALISE;
    if (!commune || !prix || !surface || surface <= 0) return { ecart: 0, applicable: false };
    const prixM2Annonce = prix / surface;
    const moyennes = prixMoyensParCommune[commune];
    if (!moyennes) return { ecart: 0, applicable: false };
    if (["Appartement", "Maison", "Villa"].includes(type)) {
      if (moyennes.habitableMoyen <= 0) return { ecart: 0, applicable: false };
      return { ecart: ((prixM2Annonce - moyennes.habitableMoyen) / moyennes.habitableMoyen) * 100, applicable: true };
    } else if (type === "Terrain") {
      if (moyennes.terrainMoyen <= 0) return { ecart: 0, applicable: false };
      return { ecart: ((prixM2Annonce - moyennes.terrainMoyen) / moyennes.terrainMoyen) * 100, applicable: true };
    }
    return { ecart: 0, applicable: false };
  };

  // On calcule la liste qui est à la fois FILTRÉE et TRIÉE
  const filteredAndSortedAnnonces = useMemo(() => {
    let result = annonces.filter((annonce) => {
      const matchCommune = filterCommune === "" || annonce.COMMUNE_NORMALISEE === filterCommune;
      const matchType = filterType === "" || annonce.TYPE_NORMALISE === filterType;
      const matchPieces = filterPieces === "" || annonce["NOMBRE DE PIECES"] === filterPieces;
      return matchCommune && matchType && matchPieces;
    });

    // On applique le tri sur le résultat du filtre
    return [...result].sort((a, b) => {
      if (sortBy === "prix-asc") {
        return parseFloat(a.PRIX_NORMALISE) - parseFloat(b.PRIX_NORMALISE);
      } else if (sortBy === "prix-desc") {
        return parseFloat(b.PRIX_NORMALISE) - parseFloat(a.PRIX_NORMALISE);
      } else {
        // Par défaut : le plus récent en premier
        return new Date(b["DATE ET HEURE"]).getTime() - new Date(a["DATE ET HEURE"]).getTime();
      }
    });
  }, [annonces, filterCommune, filterType, filterPieces, sortBy]);

  // IMPORTANT : On définit les données à afficher à partir de cette liste triée
  const paginatedData = filteredAndSortedAnnonces.slice(0, 20);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const mensualite = useMemo(() => {
    if (!selectedAnnonce) return 0;
    const prix = parseInt(selectedAnnonce.PRIX_NORMALISE);
    const capital = (prix * 1.08) - apport;
    if (capital <= 0) return 0;
    const r = (taux / 100) / 12;
    const n = duree * 12;
    return (capital * r) / (1 - Math.pow(1 + r, -n));
  }, [selectedAnnonce, apport, duree, taux]);

  const rendementData = useMemo(() => {
    if (!investAnnonce) return { brut: 0, net: 0 };
    const prixAchat = parseInt(investAnnonce.PRIX_NORMALISE);
    const prixTotal = prixAchat * 1.08;
    const annuel = loyerEstime * 12;
    const brut = (annuel / prixAchat) * 100;
    const net = ((annuel * 0.70) / prixTotal) * 100;
    return { brut, net };
  }, [investAnnonce, loyerEstime]);

  const communesDispo = [...new Set(annonces.map(a => a.COMMUNE_NORMALISEE))].filter(c => c && c.trim() !== "").sort();
  const typesDispo = [...new Set(annonces.map(a => a.TYPE_NORMALISE))].filter(t => t && t.toUpperCase() !== "INCONNU").sort();

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans overflow-x-hidden">
      
      <Header 
        favoritesCount={favorites.length} 
        onToggleFavorites={handleToggleOnlyFavorites} 
        showOnlyFavorites={showOnlyFavorites} 
      />

      {/* HERO SECTION (Conservée car elle est unique) */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white py-12 md:py-16 px-6 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-6xl font-black mb-4 leading-[1.1]">Les annonces immo de Martinique, enfin réunies au même endroit.</h1>
            <p className="text-base md:text-xl opacity-95 mb-8 font-medium max-w-2xl">AchatImmoMartinique est un outil indépendant qui centralise les annonces publiées par les agences immobilières de l’île afin de vous offrir une vision claire, globale et actualisée des biens disponibles en Martinique.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a href="#listing" className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all">Voir les annonces</a>
              <button onClick={fetchAnnonces} className="bg-blue-900/40 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl font-bold hover:bg-blue-800/50 transition-all text-xs uppercase tracking-widest">🔄 Actualiser</button>
            </div>
          </div>
          <div className="w-full max-w-[200px] md:max-w-md">
            {animationData && <Lottie animationData={animationData} loop className="drop-shadow-2xl" />}
          </div>
        </div>
      </section>

      {/* FILTRES & ALERTE EMAIL (Conservés ici pour la simplicité) */}
      <section id="listing" className="max-w-[1600px] mx-auto px-4 md:px-6 w-full pt-8 print:hidden">
        <div className="bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end">
            <FilterBox label="Ville" onChange={setFilterCommune}>
              <option value="">Martinique</option>
              {communesDispo.map(c => <option key={c} value={c}>{c}</option>)}
            </FilterBox>
            <FilterBox label="Type" onChange={setFilterType}>
              <option value="">Tous</option>
              {typesDispo.map(t => <option key={t} value={t}>{t}</option>)}
            </FilterBox>
            <FilterBox label="Pièces" onChange={setFilterPieces}>
              <option value="">Toutes</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n.toString()}>{n === 5 ? '5+' : n}</option>)}
            </FilterBox>
            <FilterBox label="Surface" onChange={setFilterSurface}>
              <option value="">Toutes</option>
              {[50, 70, 100, 150, 200].map(s => <option key={s} value={s.toString()}>{s} m² +</option>)}
            </FilterBox>
            <FilterBox label="Min €" onChange={setFilterPrixMin}>
              <option value="">Pas de min</option>
              {[30000, 50000, 100000, 150000, 200000, 300000, 500000].map(p => <option key={p} value={p.toString()}>{p.toLocaleString()} €</option>)}
            </FilterBox>
            <FilterBox label="Max €" onChange={setFilterPrixMax}>
              <option value="">Pas de max</option>
              {[100000, 200000, 300000, 400000, 500000, 1000000].map(p => <option key={p} value={p.toString()}>{p.toLocaleString()} €</option>)}
            </FilterBox>
            {/* BOUTON DE TRI */}
            <FilterBox label="Trier par" onChange={setSortBy}>
              <option value="recent">Plus récent</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
            </FilterBox>
        
        {/* COMPOSANT ALERTE EMAIL PREMIUM */}
        <EmailAlert 
          currentCommune={filterCommune}
          currentType={filterType}
          currentPrixMax={filterPrixMax}
          onAlertSubmit={handleAlertSubmit}
        />

        {/* BARRE D'INFOS HAUT DE GRILLE */}
<div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
  {/* COMPTEUR D'ANNONCES AVEC DIODE LIVE */}
  <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
    <div className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
    </div>
    <p className="text-[11px] font-black uppercase tracking-wider text-slate-600">
      <span className="text-blue-700">{filteredData.length}</span> annonces consultables actuellement
    </p>
  </div>

  {/* BOUTON MODE INVESTISSEUR */}
  <button 
    onClick={() => setInvestorMode(!investorMode)} 
    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 transition-all shadow-sm ${
      investorMode 
        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
    }`}
  >
    <span className="text-base">{investorMode ? '📈' : '🏠'}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">
      {investorMode ? 'Mode Investisseur Actif' : 'Passer en Mode Investisseur'}
    </span>
  </button>
</div>

        {/* GRILLE ANNONCES */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-16">
  {loading ? (
    // On affiche 10 squelettes pendant le chargement
    <>
      {[...Array(10)].map((_, i) => (
        <AnnonceSkeleton key={i} />
      ))}
    </>
  ) : (
    /* On utilise ici les données triées et paginées */
    paginatedData.map((annonce, index) => (
      <AnnonceCard key={index} annonce={annonce} />
    ))
  )}
      <AnnonceCard 
        key={index}
        annonce={annonce}
        isFav={favorites.includes(annonce.LIEN)}
        onToggleFavorite={toggleFavorite}
        note={notes[annonce.LIEN] || ""}
        onUpdateNote={updateNote}
        investorMode={investorMode}
        onSimulateLoan={(a) => { setSelectedAnnonce(a); setApport(Math.round(parseInt(a.PRIX_NORMALISE) * 0.1)); }}
        onCalculateInvest={(a) => setInvestAnnonce(a)}
        ecartData={getEcartPrixM2(annonce)}
      />
    ))
  )}
</div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-20">
            <button onClick={() => {setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({top: 800, behavior: 'smooth'})}} disabled={currentPage === 1} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 disabled:opacity-20 hover:bg-slate-50 transition-all">←</button>
            <span className="font-black text-slate-600 bg-white px-8 py-3 rounded-2xl shadow-sm border border-slate-50 text-sm">{currentPage} / {totalPages}</span>
            <button onClick={() => {setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({top: 800, behavior: 'smooth'})}} disabled={currentPage === totalPages} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 disabled:opacity-20 hover:bg-slate-50 transition-all">→</button>
          </div>
        )}
      </section>

{/* SECTION À PROPOS / MÉTHODOLOGIE */}
      <AboutSection />
      
      <Footer onToggleFavorites={handleToggleOnlyFavorites} />

      {/* MODALES DE CALCULS (Conservées ici car elles gèrent des états locaux complexes) */}
      {selectedAnnonce && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setSelectedAnnonce(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
            <h2 className="text-2xl font-black mb-6">📊 Simulation Prêt</h2>
            <p className="text-4xl font-black text-blue-600 mb-8">{Math.round(mensualite).toLocaleString('fr-FR')} € / mois</p>
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Apport : {apport.toLocaleString()} €</label>
                <input type="range" min="0" max={parseInt(selectedAnnonce.PRIX_NORMALISE)} step="5000" value={apport} onChange={(e) => setApport(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none accent-blue-600" />
              </div>
              <button onClick={() => setSelectedAnnonce(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px]">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {investAnnonce && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-indigo-900/70 backdrop-blur-md" onClick={() => setInvestAnnonce(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
            <h2 className="text-2xl font-black mb-6">📈 Rentabilité</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div><p className="text-2xl font-black">{rendementData.brut.toFixed(2)} %</p><p className="text-[9px] font-bold uppercase opacity-50">Brut</p></div>
              <div><p className="text-2xl font-black text-indigo-600">{rendementData.net.toFixed(2)} %</p><p className="text-[9px] font-bold uppercase opacity-50">Net</p></div>
            </div>
            <button onClick={() => setInvestAnnonce(null)} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase text-[10px]">Fermer</button>
          </div>
        </div>
      )}
      {/* ... tes autres modales ... */}
      
      <StickyFilter />
    </main>
  );
}

// Fonction utilitaire FilterBox (Conservée en bas de page pour la lisibilité)
function FilterBox({ label, children, onChange }: { label: string; children: React.ReactNode; onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <select onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-5 text-sm font-bold text-slate-800 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all shadow-sm">
          {children}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
}
