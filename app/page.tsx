"use client";

import { useState, useEffect, useMemo } from "react";
import Lottie from "lottie-react";
import Papa from "papaparse";

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

const FilterBox = ({ label, onChange, children }: { label: string, onChange: (val: string) => void, children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <select 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 md:p-4 text-xs md:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
    >
      {children}
    </select>
  </div>
);

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
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Système d'alerte
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

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertStatus("⏳ Création...");
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSec-DdyTrrQCu4zXyvdR4GBOy0bpIfLk_3003p0AO-U9KmF7Q/formResponse";
    const formData = new FormData();
    formData.append("entry.1097581547", email); 
    formData.append("entry.1184240355", filterType || "Tous les types");
    formData.append("entry.1319234674", filterCommune || "Toute la Martinique");
    try {
      await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });
      setAlertStatus("✅ Alerte activée !");
      setEmail("");
    } catch (error) { setAlertStatus("❌ Erreur"); }
  };

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
      if (type === "Appartement" || type === "Maison" || type === "Villa") {
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

  const getEcartPrixM2 = (annonce: AnnonceRaw): { ecart: number; applicable: boolean } => {
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
      
      {/* HEADER AVEC LOGO ET SLOGAN EN HAUT À GAUCHE */}
      <header className="bg-white py-4 px-6 border-b border-slate-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black text-blue-700 leading-none">AchatImmoMartinique</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Plateforme de centralisation d'annonces immo</span>
        </div>
        <div className="hidden md:block">
          <form onSubmit={handleAlertSubmit} className="flex gap-2">
            <input 
              type="email" 
              placeholder="Alerte email..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
              {alertStatus || "Activer"}
            </button>
          </form>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white py-12 md:py-20 px-6 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-6xl font-black mb-4 leading-[1.1]">
              Les annonces immo de Martinique, enfin réunies au même endroit.
            </h1>
            
            <p className="text-sm md:text-lg font-bold uppercase tracking-[0.2em] text-cyan-200 mb-4">
              PIPELINE DE LIENS D'ANNONCES IMMOBILIERES
            </p>

            <p className="text-base md:text-xl opacity-95 mb-8 font-medium leading-relaxed max-w-2xl">
              <strong>AchatImmoMartinique</strong> centralise les annonces publiées par les professionnels et agences immobilières de l'île.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
              <a href="#listing" className="bg-white text-blue-700 px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black shadow-2xl hover:scale-105 transition-all uppercase text-[10px] md:text-xs tracking-widest">Voir les annonces</a>
              <button onClick={fetchAnnonces} className="bg-blue-900/40 backdrop-blur-md border border-white/20 px-5 py-3.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-blue-800/50 transition-all text-[10px] md:text-xs uppercase tracking-widest">🔄 Actualiser</button>
              <button onClick={handleToggleOnlyFavorites} className={`flex items-center gap-2 px-5 py-3.5 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all text-[10px] md:text-xs uppercase tracking-widest ${showOnlyFavorites ? 'bg-red-500 text-white border border-red-400' : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30'}`}>
                ❤️ Mes Favoris ({favorites.length})
              </button>
            </div>
          </div>
          <div className="w-full max-w-[200px] md:max-w-md">
            {animationData && <Lottie animationData={animationData} loop className="drop-shadow-2xl" />}
          </div>
        </div>
      </section>

      {/* TEXTE EXPLICATIF MODIFIÉ */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 text-center md:text-left print:hidden">
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-slate-800 font-medium leading-relaxed text-sm md:text-base">
            <strong>AchatImmoMartinique</strong> centralise en un seul point d’accès les annonces immobilières des agences locales, pour offrir une vision claire, rapide et complète du marché martiniquais. Chaque annonce renvoie directement vers le site officiel de l’agence concernée.
          </p>
        </div>
      </section>

      {/* FILTRES NETTOYÉS */}
      <section id="listing" className="max-w-[1600px] mx-auto px-4 md:px-6 w-full pt-4 print:hidden">
        <div className="bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 mb-8 md:mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 items-end">
            <FilterBox label="Ville" onChange={setFilterCommune}>
              <option value="">Toute l'île</option>
              {communesDispo.map(c => <option key={c} value={c}>{c}</option>)}
            </FilterBox>
            <FilterBox label="Type" onChange={setFilterType}>
              <option value="">Tous les biens</option>
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
          </div>
        </div>

        {/* GRILLE ANNONCES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mb-16">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest animate-pulse italic">Synchronisation en cours...</div>
          ) : paginatedData.map((annonce, index) => {
            const isFav = favorites.includes(annonce.LIEN);
            const p = parseInt(annonce.PRIX_NORMALISE);
            const surface = parseInt(annonce.SURFACE);
            const { ecart, applicable } = getEcartPrixM2(annonce);

            return (
              <div key={index} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group relative">
                <div className="p-5 md:p-8 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{annonce.TYPE_NORMALISE}</span>
                    <button onClick={() => toggleFavorite(annonce.LIEN)} className={`text-xl md:text-2xl transition-all ${isFav ? 'scale-110' : 'opacity-20 hover:opacity-100'}`}>❤️</button>
                  </div>
                  
                  <div className="mb-4 md:mb-6">
                    <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{p.toLocaleString('fr-FR')} €</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">+ notaire: {Math.round(p * 0.08).toLocaleString('fr-FR')} €</p>
                      {applicable && (
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${ecart > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {ecart > 0 ? '+' : ''}{ecart.toFixed(0)}% /m²
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-slate-800 mb-4 truncate">{annonce.COMMUNE_NORMALISEE}</h3>
                  <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
                    <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold text-slate-500">📐 {annonce.SURFACE}m²</span>
                    <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold text-slate-500">🚪 {annonce["NOMBRE DE PIECES"]}p.</span>
                  </div>

                  <div className="mt-auto space-y-2 md:space-y-3">
                    <button onClick={() => { setSelectedAnnonce(annonce); setApport(Math.round(p * 0.1)); }} className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">📊 Simuler mon prêt</button>
                    <a href={annonce.LIEN} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white text-center py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Voir l'original</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-10 px-6 mt-auto text-center">
        <p className="text-blue-700 font-black text-xl mb-2">Achat Immo Martinique</p>
        <p className="text-slate-400 text-xs">Pipeline de liens d'annonces immobilières - {new Date().getFullYear()}</p>
      </footer>

      {/* MODALE SIMULATEUR */}
      {selectedAnnonce && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedAnnonce(null)} className="absolute top-4 right-4 text-slate-400">✕</button>
              <h2 className="text-2xl font-black mb-4">Simulateur</h2>
              <p className="text-3xl font-black text-blue-600 mb-6">{Math.round(mensualite).toLocaleString()} € /mois</p>
              <button onClick={() => setSelectedAnnonce(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase">Fermer</button>
           </div>
        </div>
      )}
    </main>
  );
}
