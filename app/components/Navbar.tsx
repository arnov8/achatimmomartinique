"use client";

import { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/a-propos", label: "À propos" },
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/methodologie", label: "Méthodologie" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏠</span>
              <span className="font-black text-xl text-slate-900 hidden sm:block">
                AchatImmo<span className="text-blue-600">Martinique</span>
              </span>
              <span className="font-black text-xl text-slate-900 sm:hidden">
                AIM
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {isOpen ? (
                <HiX className="w-6 h-6 text-slate-900" />
              ) : (
                <HiMenu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-16 left-0 right-0 bg-white shadow-2xl border-b border-slate-100">
            <div className="px-4 py-6 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-4 rounded-2xl text-base font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}