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

// Composant interne pour les filtres
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

  useEffect(() => {
    localStorage.setItem("mes-favoris-immo", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("mes-notes-immo", JSON.stringify(notes));
  }, [notes]);

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

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertStatus("⏳ Création...");
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSec-DdyTrrQCu4zXyvdR4GBOy0bpIfLk_3003p0AO-U9KmF7Q/formResponse";
    const formData = new FormData();
    formData.append("entry.1097581547", email); 
    formData.append("entry.1184240355", filterType || "Tous les types");
    formData.append("entry.1319234674", filterCommune || "Toute la Martinique");
    formData.append("entry.624227201", filterPrixMax || "999999999");
    try {
      await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });
      setAlertStatus("✅ Alerte activée !");
      setEmail("");
    } catch (error) { setAlertStatus("❌ Erreur"); }
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
      
      {/* HEADER AVEC LOGO ET NOUVEAU SLOGAN EN HAUT À GAUCHE */}
      <header className="bg-white py-4 px-6 border-b border-slate-100 flex justify-between items-center print:hidden">
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black text-blue-700 leading-none">AchatImmoMartinique</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Plateforme de centralisation d'annonces immo</span>
        </div>
        <div className="hidden md:block">
          <form onSubmit={handleAlertSubmit} className="flex gap-2">
            <input 
              type="email" 
              placeholder="Votre email..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
              {alertStatus || "Alerte Email"}
            </button>
          </form>
        </div>
      </header>

      {/* HERO SECTION - TEXTES MODIFIÉS */}
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

      {/* TEXTE EXPLICATIF 1 - VERSION LONGUE DEMANDÉE */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 text-center md:text-left print:hidden">
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-slate-800 font-bold leading-relaxed text-xs md:text-base">
            AchatImmoMartinique centralise en un seul point d’accès les annonces immobilières des agences locales, pour offrir une vision claire, rapide et complète du marché martiniquais. Chaque annonce renvoie directement vers le site officiel de l’agence concernée.
          </p>
        </div>
      </section>

      {/* FILTRES - OPTIONS NETTOYÉES */}
      <section id="listing" className="max-w-[1600px] mx-auto px-4 md:px-6 w-full pt-4 print:hidden">
        <div className="bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 mb-8 md:mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 items-end">
            <FilterBox label="Ville" onChange={setFilterCommune}>
              <option value="">Toute la Martinique</option>
              {communesDispo.map(c => <option key={c} value={c}>{c}</option>)}
            </FilterBox>
            <FilterBox label="Type" onChange={setFilterType}>
              <option value="">Tous les types</option>
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

        {/* GRILLE ANNONCES - TOUT EST RÉINTÉGRÉ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mb-16">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest animate-pulse italic">Synchronisation en cours...</div>
          ) : paginatedData.map((annonce, index) => {
            const isFav = favorites.includes(annonce.LIEN);
            const p = parseInt(annonce.PRIX_NORMALISE);
            const surface = parseInt(annonce.SURFACE);
            const prixM2 = surface > 0 ? Math.round(p / surface) : 0;
            const dateAnnonce = new Date(annonce["DATE ET HEURE"]);
            const isNew = (new Date().getTime() - dateAnnonce.getTime()) / (1000 * 3600 * 24) < 3;
            const isInvestReady = ["Appartement", "Maison", "Immeuble", "Villa"].includes(annonce.TYPE_NORMALISE);
            const { ecart, applicable } = getEcartPrixM2(annonce);

            const handleWhatsAppShare = () => {
              const text = `Bonjour ! Ce bien m'intéresse : ${annonce.TITRE} à ${annonce.COMMUNE_NORMALISEE} (${p.toLocaleString()}€). Voici le lien : ${annonce.LIEN}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
            };

            return (
              <div key={index} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group relative">
                {isNew && (
                  <div className="absolute top-4 left-4 z-10 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-widest">Nouveau</div>
                )}
                <div className="p-5 md:p-8 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{annonce.TYPE_NORMALISE}</span>
                    <div className="flex gap-2">
                      <button onClick={handleWhatsAppShare} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-green-50 rounded-full hover:bg-green-100">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.4 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.4-29.8-17-41-4.5-10.9-9.1-9.4-12.4-9.6-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                      </button>
                      <button onClick={() => toggleFavorite(annonce.LIEN)} className={`text-xl md:text-2xl transition-all ${isFav ? 'scale-110' : 'opacity-20 hover:opacity-100'}`}>❤️</button>
                    </div>
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

                  {isFav && (
                    <div className="mb-6">
                      <label className="text-[8px] font-black uppercase text-slate-400 mb-2 block tracking-widest">📝 Ma note privée</label>
                      <textarea 
                        value={notes[annonce.LIEN] || ""} 
                        onChange={(e) => updateNote(annonce.LIEN, e.target.value)}
                        placeholder="Ex: Appeler lundi..."
                        className="w-full bg-yellow-50/50 border border-yellow-100 rounded-xl p-3 text-[10px] h-16 resize-none outline-none"
                      />
                    </div>
                  )}

                  <div className="mt-auto space-y-2 md:space-y-3">
                    <button onClick={() => { setSelectedAnnonce(annonce); setApport(Math.round(p * 0.1)); }} className="w-full bg-blue-50 text-blue-700 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest">📊 Simuler mon prêt</button>
                    {isInvestReady && (
                      <button onClick={() => setInvestAnnonce(annonce)} className="w-full bg-indigo-50 text-indigo-700 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest">📈 Calcul Rendement</button>
                    )}
                    <a href={annonce.LIEN} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white text-center py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Voir l'original</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION RÉINTÉGRÉE */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-20">
            <button onClick={() => {setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({top: 800, behavior: 'smooth'})}} disabled={currentPage === 1} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm disabled:opacity-20 hover:bg-slate-50">←</button>
            <span className="font-black text-slate-600 bg-white px-8 py-3 rounded-2xl shadow-sm border border-slate-50 text-sm">{currentPage} / {totalPages}</span>
            <button onClick={() => {setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({top: 800, behavior: 'smooth'})}} disabled={currentPage === totalPages} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm disabled:opacity-20 hover:bg-slate-50">→</button>
          </div>
        )}
      </section>

      {/* SECTION ENGAGEMENT (CONSERVÉE) */}
      <section className="bg-slate-900 text-white py-20 px-6 print:hidden">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Notre Engagement</div>
          <h2 className="text-3xl md:text-5xl font-black leading-tight">Une éthique de transparence totale.</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-slate-300 text-sm">
              L'objectif n'est pas de remplacer les professionnels, mais de proposer un outil de consultation centralisé facilitant la comparaison.
            </div>
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-slate-300 text-sm">
              AchatImmoMartinique ne commercialise aucun bien et ne perçoit aucune commission. Nous sommes un agrégateur purement informatif.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - TEXTE MODIFIÉ */}
      <footer className="bg-white border-t border-slate-100 py-16 px-6 mt-auto text-center print:hidden">
        <p className="text-blue-700 font-black text-2xl mb-2">AchatImmoMartinique</p>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pipeline de liens d'annonces immobilières</p>
        <p className="text-slate-300 text-[10px] mt-8">© {new Date().getFullYear()} - Centralisation Immobilière Martinique</p>
      </footer>

      {/* MODALE PRÊT (RÉINTÉGRÉE COMPLÈTE) */}
      {selectedAnnonce && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setSelectedAnnonce(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-10 text-white">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Projet Bancaire</span>
                <button onClick={() => setSelectedAnnonce(null)} className="text-xl">✕</button>
              </div>
              <p className="text-5xl font-black mb-2">{Math.round(mensualite).toLocaleString('fr-FR')} €</p>
              <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Par mois (estimation)</p>
            </div>
            <div className="p-10 space-y-8">
              <div>
                <label className="flex justify-between text-[9px] font-black uppercase text-slate-400 mb-4 italic">Apport : {apport.toLocaleString()} €</label>
                <input type="range" min="0" max={parseInt(selectedAnnonce.PRIX_NORMALISE)} step="5000" value={apport} onChange={(e) => setApport(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Durée (ans)</label>
                  <select value={duree} onChange={(e) => setDuree(parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-4 font-black text-sm">
                    {[15, 20, 25].map(y => <option key={y} value={y}>{y} ans</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Taux (%)</label>
                  <input type="number" step="0.1" value={taux} onChange={(e) => setTaux(parseFloat(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-4 font-black text-sm" />
                </div>
              </div>
              <button onClick={() => setSelectedAnnonce(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Fermer la simulation</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE RENDEMENT (RÉINTÉGRÉE COMPLÈTE) */}
      {investAnnonce && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-indigo-900/70 backdrop-blur-md" onClick={() => setInvestAnnonce(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-10 text-white">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Rentabilité Locative</span>
                <button onClick={() => setInvestAnnonce(null)} className="text-xl">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-black">{rendementData.brut.toFixed(2)} %</p>
                  <p className="text-[9px] opacity-70 font-bold uppercase">Rendement Brut</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-cyan-300">{rendementData.net.toFixed(2)} %</p>
                  <p className="text-[9px] opacity-70 font-bold uppercase">Rendement Net (est.)</p>
                </div>
              </div>
            </div>
            <div className="p-10 space-y-8">
              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-[9px] font-black uppercase text-slate-400">Loyer mensuel estimé</label>
                  <span className="font-black text-indigo-600">{loyerEstime} €</span>
                </div>
                <input type="range" min="300" max="5000" step="50" value={loyerEstime} onChange={(e) => setLoyerEstime(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-[10px] text-slate-500 italic">
                * Rendement net après frais de notaire (8%) et 30% de charges (taxes, entretien).
              </div>
              <button onClick={() => setInvestAnnonce(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Retour</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
