"use client";

interface SortBarProps {
  totalResults: number;
  currentSort: string;
  onSortChange: (value: string) => void;
}

export default function SortBar({ totalResults, currentSort, onSortChange }: SortBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
        <span className="text-sm font-bold text-slate-700">{totalResults} annonces disponibles</span>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <label className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">Trier par</label>
        <select 
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full sm:w-48 bg-white border border-slate-200 text-xs font-bold px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
        >
          <option value="recent">Plus récent</option>
          <option value="prix-asc">Prix : croissant</option>
          <option value="prix-desc">Prix : décroissant</option>
        </select>
      </div>
    </div>
  );
}
