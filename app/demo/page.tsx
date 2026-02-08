'use client';

import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tighter">
            <span className="text-white">K</span>
            <span className="text-[#7C3AED]">L</span>
            <span className="text-white">UB</span>
            <span className="text-sm text-[#A0A0A0] ml-4">Mode Démo</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Bienvenue sur <span className="text-[#7C3AED]">KLUB</span>
          </h1>
          <p className="text-xl text-[#A0A0A0] mb-8">
            Plateforme collaborative BDE & Organisateurs d'événements
          </p>
        </div>

        {/* Navigation démo */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="brutalist-card p-8">
            <h2 className="text-2xl font-bold mb-4">🎓 Espace BDE</h2>
            <p className="text-[#A0A0A0] mb-6">
              Créez des projets, trouvez des prestataires et gérez vos événements
            </p>
            <div className="space-y-3">
              <Link
                href="/demo/bde/dashboard"
                className="brutalist-button-primary px-6 py-3 block text-center"
              >
                Voir le Dashboard BDE →
              </Link>
              <Link
                href="/demo/bde/create-project"
                className="brutalist-button px-6 py-3 block text-center"
              >
                Créer un Projet →
              </Link>
            </div>
          </div>

          <div className="brutalist-card p-8">
            <h2 className="text-2xl font-bold mb-4">🎪 Espace ORGA</h2>
            <p className="text-[#A0A0A0] mb-6">
              Consultez les projets, construisez votre réputation
            </p>
            <div className="space-y-3">
              <Link
                href="/demo/orga/dashboard"
                className="brutalist-button-primary px-6 py-3 block text-center"
              >
                Voir le Dashboard ORGA →
              </Link>
              <Link
                href="/demo/projects"
                className="brutalist-button px-6 py-3 block text-center"
              >
                Voir les Projets →
              </Link>
            </div>
          </div>
        </div>

        {/* Démo de la messagerie */}
        <div className="mb-12">
          <div className="brutalist-card p-8 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-2xl font-bold mb-3">Messagerie Temps Réel</h2>
            <p className="text-[#A0A0A0] mb-6">
              Communiquez instantanément avec les BDE et Orgas
            </p>
            <Link
              href="/demo/messages"
              className="brutalist-button-primary px-6 py-3 inline-block"
            >
              Voir les Messages →
            </Link>
          </div>
        </div>

        {/* Features principales */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Fonctionnalités Clés</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="brutalist-card p-6 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-semibold mb-2">Feedback Obligatoire</h3>
              <p className="text-sm text-[#A0A0A0]">
                Les BDE doivent noter les Orgas avant de créer un nouveau projet
              </p>
            </div>

            <div className="brutalist-card p-6 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Système de Réputation</h3>
              <p className="text-sm text-[#A0A0A0]">
                Badge &quot;Top Prestataire&quot; pour les Orgas avec &gt;4.5/5
              </p>
            </div>

            <div className="brutalist-card p-6 text-center">
              <div className="text-4xl mb-3">🎵</div>
              <h3 className="text-lg font-semibold mb-2">Rental Hub</h3>
              <p className="text-sm text-[#A0A0A0]">
                Location de matériel entre BDE et Orgas
              </p>
            </div>

            <div className="brutalist-card p-6 text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-lg font-semibold mb-2">Messagerie Temps Réel</h3>
              <p className="text-sm text-[#A0A0A0]">
                Chat instantané avec notifications en direct
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
