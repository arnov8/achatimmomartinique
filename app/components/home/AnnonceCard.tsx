"use client";

interface AnnonceCardProps {
  annonce: any;
  isFav: boolean;
  onToggleFavorite: (lien: string) => void;
  note: string;
  onUpdateNote: (lien: string, text: string) => void;
  investorMode: boolean;
  onSimulateLoan: (annonce: any) => void;
  onCalculateInvest: (annonce: any) => void;
  ecartData: { ecart: number; applicable: boolean };
}

export default function AnnonceCard({ 
  annonce, isFav, onToggleFavorite, note, onUpdateNote, 
  investorMode, onSimulateLoan, onCalculateInvest, ecartData 
}: AnnonceCardProps) {
  const p = parseInt(annonce.PRIX_NORMALISE);
  const isInvestReady = ["Appartement", "Maison", "Villa", "Immeuble"].includes(annonce.TYPE_NORMALISE);

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group relative">
      <div className="p-5 md:p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{annonce.TYPE_NORMALISE}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`J'ai trouvé ce bien immo : ${annonce.TITRE}\nLien : ${annonce.LIEN}\nAnnonce trouvée avec AchatImmoMartinique.com 👍🏽`)}`, "_blank")} 
              className="opacity-40 hover:opacity-100 transition-all flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-[22px] h-[22px] fill-[#25D366]">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.6-8.7-45-27.7-16.6-14.8-27.8-33.2-31.1-38.7-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.5 5.5-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
            </button>
            <button onClick={() => onToggleFavorite(annonce.LIEN)} className={`text-xl transition-all ${isFav ? 'scale-110' : 'opacity-20 hover:opacity-100'}`}>❤️</button>
          </div>
        </div>
        
        <div className="mb-4 min-h-[80px]">
          {!investorMode ? (
            <>
              <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{p.toLocaleString('fr-FR')} €</p>
              <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tight">Estim. frais de notaire : {Math.round(p * 0.08).toLocaleString('fr-FR')} €</div>
            </>
          ) : (
            <div className="bg-indigo-600 p-3 rounded-xl text-white">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black uppercase opacity-80">Rendement Brut</span>
                <span className="text-lg font-black">{((800 * 12 / p) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black uppercase opacity-80">Potentiel Airbnb</span>
                <span className="text-[10px] font-black italic">~110€ / nuit</span>
              </div>
            </div>
          )}
          {ecartData.applicable && !investorMode && (
            <div className={`text-[8px] font-black mt-2 inline-block px-1.5 py-0.5 rounded ${ecartData.ecart > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {ecartData.ecart > 0 ? '+' : ''}{ecartData.ecart.toFixed(0)}% / m² moy.
            </div>
          )}
        </div>

        <h3 className="text-sm font-black text-slate-800 mb-3 truncate uppercase tracking-tight">{annonce.COMMUNE_NORMALISEE}</h3>
        <div className="flex gap-2 mb-4">
          <span className="text-[10px] font-bold text-slate-400">📐 {annonce.SURFACE}m²</span>
          <span className="text-[10px] font-bold text-slate-400">🚪 {annonce["NOMBRE DE PIECES"]}p.</span>
        </div>

        {isFav && (
          <div className="mb-4">
            <textarea value={note} onChange={(e) => onUpdateNote(annonce.LIEN, e.target.value)} placeholder="Note privée..." className="w-full bg-yellow-50/50 border border-yellow-100 rounded-xl p-3 text-[9px] h-12 resize-none outline-none font-medium" />
          </div>
        )}

        <div className="mt-auto space-y-2 pt-4 border-t border-slate-50">
          <button onClick={() => onSimulateLoan(annonce)} className="w-full bg-slate-50 text-slate-500 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-colors">📊 Simuler mon prêt</button>
          {isInvestReady && (
            <button onClick={() => onCalculateInvest(annonce)} className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">📈 Calcul Rendement</button>
          )}
          <a href={annonce.LIEN} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white text-center py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Voir l'annonce</a>
        </div>
      </div>
    </div>
  );
}
