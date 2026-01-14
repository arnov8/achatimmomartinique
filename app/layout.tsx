import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar"; // On importe ta barre de menu

// 1. CONFIGURATION SEO
export const metadata: Metadata = {
  title: "Achat Immo Martinique | Annonces immobilières centralisées",
  description: "Trouvez votre futur bien en Martinique. Toutes les annonces des agences immobilières regroupées gratuitement sur une seule plateforme.",
  keywords: ["immobilier Martinique", "achat maison Martinique", "annonces immobilières", "appartement Martinique"],
};

// 2. STRUCTURE DU SITE
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased text-slate-900 bg-[#f8fafc]">
        {/* On place la Navbar ici pour qu'elle soit visible partout */}
        <Navbar /> 
        
        {/* Le contenu de tes pages s'affiche ici */}
        {children}
      </body>
    </html>
  );
}