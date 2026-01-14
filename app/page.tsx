"use client";

import { useState, useEffect, useMemo } from "react";
import Lottie from "lottie-react";
import Papa from "papaparse";

// --- TYPES ---
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
  // --- ÉTATS DONNÉES ---
  const [annonces, setAnnonces] = useState<AnnonceRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationData, setAnimationData] = useState(null);
  
  // --- ÉTATS FILTRES RECHERCHE ---
  const [filterCommune, setFilterCommune] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPieces, setFilterPieces] = useState("");
  const [filterSurface, setFilterSurface] = useState("");
  const [filterPrixMin, setFilterPrixMin] = useState("");
  const [filterPrixMax, setFilterPrixMax] = useState("");

  // --- ÉTATS ALERTE (PERSONNALISABLE) ---
  const [alertCommune, setAlertCommune] = useState("");
  const [alertType, setAlertType] = useState("");
  const [alertMaxPrice, setAlertMaxPrice] = useState("");
  const [email, setEmail] = useState("");
  const [alertStatus, setAlertStatus] = useState("");
  const [isAlertManual, setIsAlertManual] = useState(false);

  // --- ÉTATS INTERACTIFS ---
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // --- ÉTATS MODALES & SIMULATION ---
  const [selectedAnnonce, setSelectedAnnonce] = useState<AnnonceRaw | null>(null);
  const [apport, setApport] = useState(0);
  const [duree, setDuree] = useState(20);
  const [taux, setTaux] = useState(3.8);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_URL || "";

  // --- LOGIQUE DE SYNCHRONISATION ALERTE ---
  // L'alerte suit les filtres de recherche TANT QUE l'utilisateur n'y a pas touché manuellement
  useEffect(() => {
    if (!isAlertManual) {
      setAlertCommune(filterCommune);
      setAlertType(filterType);
      setAlertMaxPrice(filterPrixMax);
    }
  }, [filterCommune, filterType, filterPrixMax, isAlertManual]);

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    const savedFavs = localStorage.getItem("mes-favoris-immo");
    if (savedFavs) { setFavorites(JSON.parse(savedFavs)); }
    
    fetch("/animations/search-house.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Erreur Lottie:", err));
    
    fetchAnnonces();
  }, []);

  const fetchAnnonces = () => {
    setLoading(true);
    Papa.parse(SHEET_URL, {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        const data = (results.data as AnnonceRaw[]).filter(a => 
          a.LIEN && a.PRIX_NORMALISE && parseInt(a.PRIX_NORMALISE) >= 10000
        );
        setAnnonces(data);
        setLoading(false);
      },
    });
  };

  // --- CALCULS DES STATISTIQUES MARCHÉ ---
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
        stats[commune].habitableTotal += prixM2; stats[commune].habitableCount += 1;
      } else if (type === "Terrain") {
        stats[commune].terrainTotal += prixM2; stats[commune].terrainCount += 1;
      }
    });
    const moyennes: Record<string, { habitableMoyen: number; terrainMoyen: number }> = {};
    Object.keys(stats).forEach(c => {
      const s = stats[c];
      moyennes[c] = {
        habitableMoyen: s.habitableCount > 0 ? s.habitableTotal / s.habitableCount : 0,
        terrainMoyen: s.terrainCount > 0 ? s.terrainTotal / s.terrainCount : 0
      };
    });
    return moyennes;
  }, [annonces]);

  // --- FONCTIONS DE CALCULS UTILES (Correctif Vercel) ---
  const getEcartPrixM2 = (annonce: AnnonceRaw) => {
    const prix = parseInt(annonce.PRIX_NORMALISE);
    const surface = parseInt(annonce.SURFACE);
    const type = annonce.TYPE_NORMALISE;
    const commune = annonce.COMMUNE_NORMALISEE;

    if (!prix || !surface || surface <= 0 || !prixMoyensParCommune[commune]) {
      return { ecart: 0, applicable: false };
    }

    const prixM2 = prix / surface;
    let moyenneRef = 0;

    if (["Appartement", "Maison", "Villa"].includes(type)) {
      moyenneRef = prixMoyensParCommune[commune].habitableMoyen;
    } else if (type === "Terrain") {
      moyenneRef = prixMoyensParCommune[commune].terrainMoyen;
    }

    if (moyenneRef === 0) return { ecart: 0, applicable: false };

    const ecart = ((prixM2 - moyenneRef) / moyenneRef) * 100;
    return { ecart: Math.round(ecart), applicable: true };
  };

  const mensualite = useMemo(() => {
    if (!selectedAnnonce) return 0;
    const p = parseInt(selectedAnnonce.PRIX_NORMALISE);
    const m = p - apport;
    const r = taux / 100 / 12;
    const n = duree * 12;
    if (r === 0) return m / n;
    return (m * r) / (1 - Math.pow(1 + r, -n));
  }, [selectedAnnonce, apport, taux, duree]);

  // --- GESTION FAVORIS ---
  const toggleFavorite = (lien: string) => {
    const newFavs = favorites.includes(lien) ? favorites.filter(f => f !== lien) : [...favorites, lien];
    setFavorites(newFavs);
    localStorage.setItem("mes-favoris-immo", JSON.stringify(newFavs));
  };

  // --- FILTRAGE & PAGINATION ---
  const filteredData = useMemo(() => {
    const filtered = annonces.filter(a => {
      if (showOnlyFavorites && !favorites.includes(a.LIEN)) return false;
      const p = parseInt(a.PRIX_NORMALISE);
      const matchCommune = !filterCommune || a.COMMUNE_NORMALISEE === filterCommune;
      const matchType = !filterType || a.TYPE_NORMALISE === filterType;
      const piecesVal = parseInt(a["NOMBRE DE PIECES"]);
      const matchPieces = !filterPieces || (filterPieces === "5" ? piecesVal >= 5 : piecesVal === parseInt(filterPieces));
      const matchSurface = !filterSurface || parseInt(a.SURFACE) >= parseInt(filterSurface);
      const matchPrixMin = !filterPrixMin || p >= parseInt(filterPrixMin);
      const matchPrixMax = !filterPrixMax || p <= parseInt(filterPrixMax);
      return matchCommune && matchType && matchPieces && matchSurface && matchPrixMin && matchPrixMax;
    });
    return filtered.sort((a, b) => parseInt(a.PRIX_NORMALISE) - parseInt(b.PRIX_NORMALISE));
  }, [annonces, filterCommune, filterType, filterPieces, filterSurface, filterPrixMin, filterPrixMax, favorites, showOnlyFavorites]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const communesDispo = [...new Set(annonces.map(a => a.COMMUNE_NORMALISEE))].filter(c => c && c.trim() !== "").sort();
  const typesDispo = [...new Set(annonces.map(a => a.TYPE_NORMALISE))].filter(t => t && t.toUpperCase() !== "INCONNU").sort();

  // --- SOUMISSION ALERTE ---
  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertStatus("⏳ Envoi...");
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSec-DdyTrrQCu4zXyvdR4GBOy0bpIfLk_3003p0AO-U9KmF7Q/formResponse";
    const formData = new FormData();
    formData.append("entry.1097581547", email); 
    formData.append("entry.1184240355", alertType || "Tous les types");
    formData.append("entry.1319234674", alertCommune || "Toute la Martinique");
    formData.append("entry.624227201", alertMaxPrice || "Sans limite");
    
    try {
      await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });
      setAlertStatus("✅ C'est prêt !");
      setEmail("");
      setTimeout(() => setAlertStatus(""), 4000);
    } catch (error) { setAlertStatus("❌ Erreur"); }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans overflow-x-hidden">
      
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md py-4 px-4 md:px-6 border-b border-slate-100 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-blue-700 leading-none tracking-tighter">AchatImmoMartinique</h2>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">Centralisation d'annonces</p>
          </div>
          <button onClick={() => { setShowOnlyFavorites(!showOnlyFavorites); setCurrentPage(1); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all ${showOnlyFavorites ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}>
            ❤️ {favorites.length} <span className="hidden sm:inline">Favoris</span>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white py-12 md:py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-6xl font-black mb-6 leading-[1.1]">Trouvez votre futur chez-vous en Martinique.</h1>
            <p className="text-lg md:text-xl opacity-90 mb-10 font-medium max-w-2xl">Centralisation des annonces des agences de l'île.</p>
            <a href="#listing" className="inline-block bg-white text-blue-700 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all text-xs tracking-widest uppercase">Explorer</a>
          </div>
          <div className="w-full max-w-sm">
            {animationData && <Lottie animationData={animationData} loop />}
          </div>
        </div>
      </section>

      {/* RECHERCHE & FILTRES */}
      <section id="listing" className="max-w-[1600px] mx-auto px-4 md:px-6 w-full pt-10">
        
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 items-end">
            <FilterBox label="Ville" onChange={setFilterCommune} value={filterCommune}>
              <option value="">Martinique (Toute)</option>
              {communesDispo.map(c => <option key={c} value={c}>{c}</option>)}
            </FilterBox>
            <FilterBox label="Type" onChange={setFilterType} value={filterType}>
              <option value="">Tous les biens</option>
              {typesDispo.map(t => <option key={t} value={t}>{t}</option>)}
            </FilterBox>
            <FilterBox label="Pièces" onChange={setFilterPieces} value={filterPieces}>
              <option value="">Toutes</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n.toString()}>{n === 5 ? '5+' : n}</option>)}
            </FilterBox>
            <FilterBox label="Surface" onChange={setFilterSurface} value={filterSurface}>
              <option value="">Toutes</option>
              {[50, 70, 100, 150, 200].map(s => <option key={s} value={s.toString()}>{s} m² +</option>)}
            </FilterBox>
            <FilterBox label="Min €" onChange={setFilterPrixMin} value={filterPrixMin}>
              <option value="">Pas de min</option>
              {[50000, 100000, 150000, 200000, 300000].map(p => <option key={p} value={p.toString()}>{p.toLocaleString()} €</option>)}
            </FilterBox>
            <FilterBox label="Max €" onChange={setFilterPrixMax} value={filterPrixMax}>
              <option value="">Pas de max</option>
              {[200000, 300000, 400000, 500000, 1000000].map(p => <option key={p} value={p.toString()}>{p.toLocaleString()} €</option>)}
            </FilterBox>
          </div>
        </div>

        {/* ALERTE PERSONNALISABLE */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-500/30">
                  Alerte en temps réel
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-black mb-2">Créez votre alerte sur mesure.</h3>
                <p className="text-slate-400 text-sm font-medium">
                  {isAlertManual 
                    ? "Critéres d'alerte personnalisés." 
                    : "L'alerte utilise actuellement vos filtres de recherche."}
                </p>
              </div>

              <form onSubmit={handleAlertSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="votre@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72 font-bold"
                  required
                />
                <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
                  {alertStatus || "Activer l'alerte"}
                </button>
              </form>
            </div>

            {/* SÉLECTEURS INDÉPENDANTS ALERTE */}
            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secteur</span>
                <select 
                  value={alertCommune} 
                  onChange={(e) => { setAlertCommune(e.target.value); setIsAlertManual(true); }}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Toute la Martinique</option>
                  {communesDispo.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Type</span>
                <select 
                  value={alertType} 
                  onChange={(e) => { setAlertType(e.target.value); setIsAlertManual(true); }}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Tous types</option>
                  {typesDispo.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Budget Max</span>
                <select 
                  value={alertMaxPrice} 
                  onChange={(e) => { setAlertMaxPrice(e.target.value); setIsAlertManual(true); }}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Pas de limite</option>
                  {[100000, 200000, 300000, 400000, 500000, 1000000].map(p => (
                    <option key={p} value={p.toString()} className="bg-slate-900">{p.toLocaleString()} €</option>
                  ))}
                </select>
              </div>
            </div>
            
            {isAlertManual && (
              <button onClick={() => setIsAlertManual(false)} className="mt-6 text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 underline">
                🔄 Réinitialiser selon ma recherche
              </button>
            )}
          </div>
        </div>

        {/* GRILLE ANNONCES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-16">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest animate-pulse italic">Synchronisation...</div>
          ) : paginatedData.map((annonce, index) => {
            const isFav = favorites.includes(annonce.LIEN);
            const p = parseInt(annonce.PRIX_NORMALISE);
            const { ecart, applicable } = getEcartPrixM2(annonce);

            return (
              <div key={index} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group relative">
                <div className="p-6 md:p-8 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{annonce.TYPE_NORMALISE}</span>
                    <button onClick={() => toggleFavorite(annonce.LIEN)} className={`text-2xl transition-all ${isFav ? 'scale-110' : 'opacity-20 hover:opacity-100'}`}>❤️</button>
                  </div>
                  
                  {applicable && (
                    <div className={`mb-2 text-[10px] font-bold uppercase ${ecart <= -10 ? 'text-green-600' : 'text-slate-400'}`}>
                      {ecart <= 0 ? `${Math.abs(ecart)}% sous le marché` : `${ecart}% au dessus du marché`}
                    </div>
                  )}

                  <p className="text-3xl font-black text-slate-900 leading-none mb-2">{p.toLocaleString('fr-FR')} €</p>
                  <h3 className="text-lg font-black text-slate-800 mb-4 truncate">{annonce.COMMUNE_NORMALISEE}</h3>
                  
                  <div className="flex gap-3 mb-8">
                    <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-500">📐 {annonce.SURFACE}m²</span>
                    <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-500">🚪 {annonce["NOMBRE DE PIECES"]}p.</span>
                  </div>

                  <div className="mt-auto space-y-3">
                    <button onClick={() => { setSelectedAnnonce(annonce); setApport(Math.round(p * 0.1)); }} className="w-full bg-blue-50 text-blue-700 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100">📊 Simulation</button>
                    <a href={annonce.LIEN} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white text-center py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Lien Agence</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        {!loading && filteredData.length > itemsPerPage && (
           <div className="flex justify-center gap-4 mb-20">
             <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs disabled:opacity-30">Précédent</button>
             <button disabled={paginatedData.length < itemsPerPage} onClick={() => setCurrentPage(prev => prev + 1)} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs disabled:opacity-30">Suivant</button>
           </div>
        )}
      </section>

      {/* MODALE SIMULATION */}
      {selectedAnnonce && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setSelectedAnnonce(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-10 text-white text-center">
              <p className="text-5xl font-black mb-2">{Math.round(mensualite).toLocaleString('fr-FR')} €</p>
              <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Estimation Mensualité</p>
            </div>
            <div className="p-10 space-y-6">
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Apport : {apport.toLocaleString()} €</label>
                  <input type="range" min="0" max={parseInt(selectedAnnonce.PRIX_NORMALISE)} step="1000" value={apport} onChange={(e) => setApport(parseInt(e.target.value))} className="w-full accent-blue-600" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Durée : {duree} ans</label>
                  <input type="range" min="5" max="30" step="1" value={duree} onChange={(e) => setDuree(parseInt(e.target.value))} className="w-full accent-blue-600" />
               </div>
               <button onClick={() => setSelectedAnnonce(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-10 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-black text-blue-700">AchatImmoMartinique</h3>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} • MADE IN MARTINIQUE 🏝️</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// COMPOSANT FILTRE REUTILISABLE
function FilterBox({ label, children, onChange, value }: { label: string; children: React.ReactNode; onChange: (val: string) => void; value: string }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-xs font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all"
      >
        {children}
      </select>
    </div>
  );
}
