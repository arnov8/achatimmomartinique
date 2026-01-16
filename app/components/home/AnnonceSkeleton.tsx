"use client";

export default function AnnonceSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
      {/* Simulation Image */}
      <div className="aspect-[4/3] bg-slate-200" />
      
      <div className="p-5 space-y-4">
        {/* Simulation Badge Ville */}
        <div className="h-4 w-24 bg-slate-200 rounded-full" />
        
        {/* Simulation Titre (2 lignes) */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-slate-200 rounded-md" />
          <div className="h-5 w-2/3 bg-slate-200 rounded-md" />
        </div>
        
        {/* Simulation Prix */}
        <div className="h-8 w-32 bg-slate-100 rounded-lg mt-4" />
        
        {/* Simulation Specs (Surface, Pièces) */}
        <div className="flex gap-3 pt-2">
          <div className="h-4 w-12 bg-slate-100 rounded" />
          <div className="h-4 w-12 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}
