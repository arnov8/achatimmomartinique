"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export default function LegalPage() {
  const [animationData, setAnimationData] = useState(null);

  // Chargement robuste de l'animation pour Turbopack
  useEffect(() => {
    fetch("/animations/Legal.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Erreur chargement Lottie:", err));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        
        {/* Header avec Animation */}
        <div className="text-center mb-16">
          <div className="w-40 sm:w-56 mx-auto mb-8">
            {animationData && (
              <Lottie animationData={animationData} loop={true} />
            )}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6">
            Mentions légales
          </h1>
          <p className="text-lg text-blue-600 font-medium max-w-2xl mx-auto">
            Conformément à l'article 6 III de la loi n°2004-575 du 21 juin 2004
          </p>
        </div>

        {/* Contenu des Mentions Légales */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 sm:p-16">
          <div className="prose prose-slate max-w-none">
            
            <Section title="1. ÉDITEUR DU SITE">
              <p>Le site internet AchatImmoMartinique, accessible à l'adresse <strong>https://www.achatimmomartinique.com</strong>, est édité par :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Antilles Salons</strong></li>
                <li>Statut juridique : société</li>
                <li>Adresse : CC de Bellevue 97200 Fort-de-France</li>
                <li>Adresse électronique : contact@achatimmomartinique.com</li>
              </ul>
            </Section>

            <Section title="2. HÉBERGEMENT">
              <p>Le site est hébergé par : <strong>Wix.com Ltd et o2Switch</strong></p>
              <p>Sites internet : 
                <a href="https://www.wix.com" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline">wix.com</a> et 
                <a href="https://www.o2switch.fr" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline">o2switch.fr</a>
              </p>
            </Section>

            <Section title="3. NATURE ET OBJET DU SITE">
              <p>Le site AchatImmoMartinique est un site d'information et de référencement ayant pour objet exclusif de centraliser et présenter des annonces immobilières publiées par des agences et professionnels de l'immobilier exerçant en Martinique, à partir de sources accessibles publiquement.</p>
              <p>Il constitue un outil de consultation permettant aux utilisateurs de disposer d'une vue d'ensemble du marché immobilier local, sans se substituer aux professionnels de l'immobilier.</p>
            </Section>

            <Section title="4. ABSENCE DE QUALITÉ D'AGENCE IMMOBILIÈRE">
              <p>Le site AchatImmoMartinique :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>n'est pas une agence immobilière,</li>
                <li>ne réalise aucune opération de transaction immobilière,</li>
                <li>ne perçoit aucune commission ou avantage financier lié à la vente,</li>
                <li>n'intervient jamais dans les négociations ou actes de vente.</li>
              </ul>
            </Section>

            <Section title="5. ABSENCE DE MISE EN RELATION COMMERCIALE">
              <p>L'utilisateur accède directement aux annonces via un lien pointant vers le site officiel de l'agence immobilière, laquelle demeure seule responsable de la relation avec le client.</p>
            </Section>

            <Section title="6. ORIGINE DES ANNONCES">
              <p>Les informations affichées (prix, localisation, descriptif, etc.) sont reprises à titre strictement informatif, sans garantie d'exactitude ou d'exhaustivité de la part d'AchatImmoMartinique.</p>
            </Section>

            <Section title="7. RESPONSABILITÉ RELATIVE AUX ANNONCES">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-amber-900 font-bold">
                  Seules les informations figurant sur le site de l'agence immobilière émettrice font foi.
                </p>
              </div>
            </Section>

            <Section title="8. DROITS DE PROPRIÉTÉ INTELLECTUELLE">
              <p>L'ensemble des éléments constituant le site (structure, textes, graphismes, logos, code, etc.) est protégé par le Code de la propriété intellectuelle.</p>
              <p>Toute reproduction sans autorisation écrite préalable de l'éditeur est strictement interdite.</p>
            </Section>

            <Section title="9. SIGNALEMENT ET RECTIFICATION">
              <p>Toute agence souhaitant signaler une erreur ou demander la suppression d'une annonce peut en faire la demande via la page <a href="/contact" className="text-blue-600 underline">Contact</a>.</p>
            </Section>

            <Section title="10. DROIT APPLICABLE">
              <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
            </Section>

          </div>
        </div>

        {/* Bouton Retour Accueil */}
        <div className="mt-16 text-center">
          <a href="/" className="text-slate-500 hover:text-blue-600 font-semibold transition-colors">
            ← Retour à l'accueil
          </a>
        </div>

      </section>
    </main>
  );
}

// Composant interne pour structurer les sections proprement
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12 last:mb-0">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 border-b-4 border-blue-500/20 pb-2 inline-block">
        {title}
      </h2>
      <div className="text-slate-700 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}
