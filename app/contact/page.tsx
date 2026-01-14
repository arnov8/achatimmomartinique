"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";

export default function ContactPage() {
  const [animationData, setAnimationData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Chargement robuste de l'animation pour éviter les erreurs localhost/Turbopack
  useEffect(() => {
    fetch("/animations/Contact.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Erreur Lottie:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // CONNEXION À MAKE.COM
      const response = await fetch("https://hook.eu2.make.com/khv1jkf9ilkg8u6xm1pb288hkppkiwo8", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        // Reset du message de succès après 5 secondes
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error("Erreur envoi Webhook:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-48 sm:w-64 mx-auto mb-8">
            {animationData && (
              <Lottie animationData={animationData} loop={true} />
            )}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Une question, une remarque <br className="hidden sm:block" /> ou un signalement ?
          </h1>
          <p className="text-xl text-blue-600 font-medium">
            Ce formulaire est à votre disposition.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* Formulaire (Colonne Gauche - 3/5) */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 sm:p-12 order-2 lg:order-1">
            
            {/* Messages d'état */}
            {submitStatus === "success" && (
              <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-2xl animate-pulse">
                <p className="text-green-800 font-bold">✅ Message envoyé avec succès !</p>
              </div>
            )}
            {submitStatus === "error" && (
              <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl">
                <p className="text-red-800 font-bold">❌ Une erreur est survenue. Réessayez.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-blue-500 transition-all outline-none"
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Votre email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-blue-500 transition-all outline-none"
                />
              </div>
              
              <select
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="">Objet de votre message</option>
                <option value="Fonctionnement du site">Fonctionnement du site</option>
                <option value="Affichage des annonces">Affichage des annonces</option>
                <option value="Utilisation des informations">Utilisation des informations</option>
                <option value="Autre">Autre demande</option>
              </select>

              <textarea
                name="message"
                required
                rows={6}
                placeholder="Votre message..."
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:border-blue-500 transition-all outline-none resize-none"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {isSubmitting ? "Envoi en cours..." : "J'envoie mon message"}
              </button>
            </form>
          </div>

          {/* Textes d'information (Colonne Droite - 2/5) */}
          <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed italic border-l-2 border-blue-200 pl-4">
                Ce formulaire permet de nous contacter pour toute question relative au fonctionnement du site, à l’affichage des annonces ou à l’utilisation des informations présentées sur <span className="font-bold text-slate-900">AchatImmoMartinique</span>.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Les messages transmis via cette page sont destinés à améliorer la qualité et la fiabilité du service proposé. Chaque demande est examinée avec attention.
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">ℹ️</span> Rappel important
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                AchatImmoMartinique est un outil de consultation et de référencement. Pour toute démarche liée à une <strong>transaction immobilière</strong>, à une <strong>visite</strong> ou à des <strong>informations détaillées</strong> sur un bien, l’utilisateur est invité à consulter directement l’annonce publiée par l’agence immobilière concernée.
              </p>
              {/* Décoration subtile */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-600/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <div className="flex items-center gap-4 text-slate-400 px-4">
              <div className="w-12 h-[1px] bg-slate-300"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Contact Digital Uniquement</p>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
