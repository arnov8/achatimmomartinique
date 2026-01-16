"use client";
import { useState, useEffect } from "react";

export default function StickyFilter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Affiche le bouton si on a scrollé de plus de 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToFilters = () => {
    const element = document.getElementById("listing");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={scrollToFilters}
        className="bg-blue-700 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-blue-500/50 backdrop-blur-sm active:scale-95 transition-all"
      >
        <span className="text-lg">🔍</span>
        <span className="text-[11px] font-black uppercase tracking-widest">
          Modifier la recherche
        </span>
      </button>
    </div>
  );
}
