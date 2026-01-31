'use client';

import Link from 'next/link';

// Données de démo statiques
const mockProfile = {
  name: 'Jean Dupont',
  organization_name: 'BDE Polytechnique',
  location: 'Paris',
};

const mockProjects = [
  {
    id: '1',
    title: 'Gala de fin d\'année 2026',
    type: 'Gala',
    location: 'Paris',
    start_date: '2026-06-15',
    status: 'published',
    budget: 15000,
    capacity: 500,
  },
  {
    id: '2',
    title: 'Soirée Étudiante - Rentrée',
    type: 'Soirée',
    location: 'Paris',
    start_date: '2026-09-10',
    status: 'in_progress',
    budget: 8000,
    capacity: 300,
  },
  {
    id: '3',
    title: 'Festival Inter-Écoles',
    type: 'Festival',
    location: 'Lyon',
    start_date: '2026-05-20',
    status: 'completed',
    budget: 25000,
    capacity: 1000,
  },
];

const pendingFeedback = true; // Simule un feedback en attente

export default function DemoBDEDashboard() {
  const totalProjects = mockProjects.length;
  const completedProjects = mockProjects.filter((p) => p.status === 'completed').length;
  const activeProjects = mockProjects.filter((p) => p.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/demo">
            <h1 className="text-2xl font-bold tracking-tighter cursor-pointer">
              <span className="text-white">K</span>
              <span className="text-[#7C3AED]">L</span>
              <span className="text-white">UB</span>
              <span className="text-sm text-[#A0A0A0] ml-4">Démo BDE</span>
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#A0A0A0]">{mockProfile.organization_name}</span>
            <div className="w-10 h-10 bg-[#7C3AED] rounded flex items-center justify-center font-bold">
              {mockProfile.name[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Bandeau de feedback obligatoire */}
      {pendingFeedback && (
        <div className="bg-[#FF0055] border-b border-[#FF0055]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white mb-1">⚠️ Feedback obligatoire</h3>
                <p className="text-sm text-white/90">
                  Vous avez 1 projet(s) terminé(s) en attente de feedback.
                  Vous devez donner votre avis avant de créer un nouveau projet.
                </p>
              </div>
              <button className="brutalist-button-primary px-6 py-2 whitespace-nowrap">
                Donner mon avis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <Link
              href="/demo/bde/dashboard"
              className="py-4 border-b-2 border-[#7C3AED] text-white font-medium"
            >
              Tableau de bord
            </Link>
            <Link
              href="/demo/projects"
              className="py-4 border-b-2 border-transparent text-[#A0A0A0] hover:text-white transition-colors"
            >
              Mes projets
            </Link>
            <Link
              href="/demo"
              className="py-4 border-b-2 border-transparent text-[#A0A0A0] hover:text-white transition-colors"
            >
              Matériel
            </Link>
            <Link
              href="/demo"
              className="py-4 border-b-2 border-transparent text-[#A0A0A0] hover:text-white transition-colors"
            >
              Messages
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#7C3AED] mb-2">{totalProjects}</div>
            <div className="text-sm text-[#A0A0A0]">Projets créés</div>
          </div>
          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#00FF66] mb-2">{activeProjects}</div>
            <div className="text-sm text-[#A0A0A0]">En cours</div>
          </div>
          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-white mb-2">{completedProjects}</div>
            <div className="text-sm text-[#A0A0A0]">Terminés</div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div
              className={`brutalist-card p-6 ${
                pendingFeedback
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-[#7C3AED] cursor-pointer'
              } transition-all`}
            >
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Créer un projet</h3>
              <p className="text-sm text-[#A0A0A0]">
                Postez un nouvel événement et trouvez des prestataires
              </p>
              {pendingFeedback && (
                <div className="mt-3 text-xs text-[#FF0055]">
                  ⚠️ Feedback obligatoire en attente
                </div>
              )}
            </div>

            <Link href="/demo" className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="text-lg font-semibold mb-2">Louer du matériel</h3>
              <p className="text-sm text-[#A0A0A0]">
                Parcourez le catalogue de matériel disponible
              </p>
            </Link>
          </div>
        </div>

        {/* Liste des projets récents */}
        <div>
          <h2 className="text-xl font-bold mb-4">Projets récents</h2>
          <div className="space-y-4">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                className="brutalist-card p-6 hover:border-[#7C3AED] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                      <span>{project.type}</span>
                      <span>•</span>
                      <span>{project.location}</span>
                      <span>•</span>
                      <span>{new Date(project.start_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        project.status === 'published'
                          ? 'bg-[#7C3AED]/20 text-[#7C3AED]'
                          : project.status === 'in_progress'
                          ? 'bg-[#00FF66]/20 text-[#00FF66]'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {project.status === 'published' && 'Publié'}
                      {project.status === 'in_progress' && 'En cours'}
                      {project.status === 'completed' && 'Terminé'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
