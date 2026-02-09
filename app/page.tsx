'use client';

import Link from "next/link";
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000]">

      <div className="flex items-center justify-center px-4 py-16">
        <main className="max-w-4xl w-full text-center">
        {/* Logo / Title */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-4">
            <span className="text-white">K</span>
            <span className="text-[#7C3AED]">L</span>
            <span className="text-white">UB</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#A0A0A0] tracking-wide">
            La plateforme collaborative pour BDE & Orgas
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="brutalist-card p-6 hover:border-[#7C3AED] transition-all"
            variants={fadeInUp}
          >
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Projets</h3>
            <p className="text-sm text-[#A0A0A0]">
              Postez vos événements et trouvez les meilleurs prestataires
            </p>
          </motion.div>

          <motion.div
            className="brutalist-card p-6 hover:border-[#7C3AED] transition-all"
            variants={fadeInUp}
          >
            <div className="text-3xl mb-3">🎵</div>
            <h3 className="text-lg font-semibold mb-2">Matériel</h3>
            <p className="text-sm text-[#A0A0A0]">
              Louez et partagez du matériel entre communautés
            </p>
          </motion.div>

          <motion.div
            className="brutalist-card p-6 hover:border-[#7C3AED] transition-all"
            variants={fadeInUp}
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold mb-2">Messages</h3>
            <p className="text-sm text-[#A0A0A0]">
              Communiquez en temps réel avec les BDE et Orgas
            </p>
          </motion.div>

          <motion.div
            className="brutalist-card p-6 hover:border-[#7C3AED] transition-all"
            variants={fadeInUp}
          >
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold mb-2">Réputation</h3>
            <p className="text-sm text-[#A0A0A0]">
              Système de feedback pour garantir la qualité
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          {...fadeInUp}
        >
          <Link
            href="/login"
            className="brutalist-button-primary px-8 py-3 text-lg font-semibold w-full sm:w-auto"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="brutalist-button px-8 py-3 text-lg font-semibold w-full sm:w-auto"
          >
            Créer un compte
          </Link>
        </motion.div>

        {/* Demo Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link
            href="/rental"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] border border-[#7C3AED] text-[#7C3AED] font-medium hover:bg-[#7C3AED] hover:text-white transition-all"
          >
            <span>🎬</span>
            <span>Louer du Matériel</span>
            <span className="text-xs opacity-70">(Catalogue)</span>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#7C3AED]">100+</div>
            <div className="text-xs sm:text-sm text-[#A0A0A0] mt-1">BDE Inscrits</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#7C3AED]">50+</div>
            <div className="text-xs sm:text-sm text-[#A0A0A0] mt-1">Orgas Vérifiées</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#7C3AED]">500+</div>
            <div className="text-xs sm:text-sm text-[#A0A0A0] mt-1">Projets Réalisés</div>
          </div>
        </motion.div>
      </main>
      </div>
    </div>
  );
}
