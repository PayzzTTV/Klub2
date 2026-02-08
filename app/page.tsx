import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000]">

      <div className="flex items-center justify-center px-4 py-16">
        <main className="max-w-4xl w-full text-center animate-fade-in">
        {/* Logo / Title */}
        <div className="mb-12">
          <h1 className="text-7xl font-bold tracking-tighter mb-4">
            <span className="text-white">K</span>
            <span className="text-[#7C3AED]">L</span>
            <span className="text-white">UB</span>
          </h1>
          <p className="text-xl text-[#A0A0A0] tracking-wide">
            La plateforme collaborative pour BDE & Orgas
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Projets</h3>
            <p className="text-sm text-[#A0A0A0]">
              Postez vos événements et trouvez les meilleurs prestataires
            </p>
          </div>

          <div className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
            <div className="text-3xl mb-3">🎵</div>
            <h3 className="text-lg font-semibold mb-2">Matériel</h3>
            <p className="text-sm text-[#A0A0A0]">
              Louez et partagez du matériel entre communautés
            </p>
          </div>

          <div className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold mb-2">Messages</h3>
            <p className="text-sm text-[#A0A0A0]">
              Communiquez en temps réel avec les BDE et Orgas
            </p>
          </div>

          <div className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold mb-2">Réputation</h3>
            <p className="text-sm text-[#A0A0A0]">
              Système de feedback pour garantir la qualité
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
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
        </div>

        {/* Demo Button */}
        <div className="mb-8">
          <Link
            href="/rental"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] border border-[#7C3AED] text-[#7C3AED] font-medium hover:bg-[#7C3AED] hover:text-white transition-all"
          >
            <span>🎬</span>
            <span>Louer du Matériel</span>
            <span className="text-xs opacity-70">(Catalogue)</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-[#7C3AED]">100+</div>
            <div className="text-sm text-[#A0A0A0] mt-1">BDE Inscrits</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#7C3AED]">50+</div>
            <div className="text-sm text-[#A0A0A0] mt-1">Orgas Vérifiées</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#7C3AED]">500+</div>
            <div className="text-sm text-[#A0A0A0] mt-1">Projets Réalisés</div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
