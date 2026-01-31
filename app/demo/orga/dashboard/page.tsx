'use client';

import Link from 'next/link';

export default function DemoOrgaDashboardPage() {
  const mockStats = {
    averageRating: 4.7,
    totalReviews: 12,
    activeApplications: 3,
    completedProjects: 8,
  };

  const mockRecentReviews = [
    {
      id: '1',
      projectTitle: 'Gala ESSEC 2025',
      bdeName: 'BDE ESSEC',
      rating: 5.0,
      comment: 'Prestataire exceptionnel, très professionnel et à l\'écoute',
      date: '2026-01-15',
    },
    {
      id: '2',
      projectTitle: 'Soirée intégration HEC',
      bdeName: 'BDE HEC Paris',
      rating: 4.5,
      comment: 'Très bon travail, quelques petits détails à améliorer',
      date: '2026-01-10',
    },
    {
      id: '3',
      projectTitle: 'Festival Campus',
      bdeName: 'BDE Dauphine',
      rating: 4.8,
      comment: 'Excellente collaboration, matériel de qualité',
      date: '2025-12-20',
    },
  ];

  const isTopProvider = mockStats.averageRating >= 4.5 && mockStats.totalReviews >= 5;

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter">
            <span className="text-white">K</span>
            <span className="text-[#7C3AED]">L</span>
            <span className="text-white">UB</span>
            <span className="text-sm text-[#A0A0A0] ml-4">Mode Démo - ORGA</span>
          </h1>
          <Link href="/demo" className="text-sm text-[#A0A0A0] hover:text-white">
            ← Retour
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome + Badge */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard ORGA</h1>
            <p className="text-[#A0A0A0]">Gérez vos candidatures et suivez votre réputation</p>
          </div>
          {isTopProvider && (
            <span className="px-4 py-2 bg-[#00FF66]/20 text-[#00FF66] text-sm font-bold rounded border border-[#00FF66]/30">
              ⭐ TOP PRESTATAIRE
            </span>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#7C3AED] mb-1">
              {mockStats.averageRating.toFixed(1)}/5
            </div>
            <div className="text-sm text-[#A0A0A0]">Note moyenne</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#00FF66] mb-1">
              {mockStats.totalReviews}
            </div>
            <div className="text-sm text-[#A0A0A0]">Avis reçus</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {mockStats.activeApplications}
            </div>
            <div className="text-sm text-[#A0A0A0]">Candidatures en cours</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {mockStats.completedProjects}
            </div>
            <div className="text-sm text-[#A0A0A0]">Projets terminés</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/demo/projects" className="brutalist-card p-6 hover:border-[#7C3AED] transition-colors">
            <h3 className="text-xl font-bold mb-2">📋 Voir les Projets</h3>
            <p className="text-sm text-[#A0A0A0]">Consultez les événements disponibles et postulez</p>
          </Link>

          <div className="brutalist-card p-6 opacity-50 cursor-not-allowed">
            <h3 className="text-xl font-bold mb-2">💬 Messages</h3>
            <p className="text-sm text-[#A0A0A0]">Communiquez avec les BDE (Prochainement)</p>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="brutalist-card p-8">
          <h2 className="text-2xl font-bold mb-6">Derniers Avis Reçus</h2>

          {mockRecentReviews.length === 0 ? (
            <p className="text-[#A0A0A0] text-center py-8">
              Aucun avis pour le moment. Complétez vos premiers projets pour recevoir des feedbacks !
            </p>
          ) : (
            <div className="space-y-4">
              {mockRecentReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-[#1A1A1A] rounded p-4 hover:border-[#7C3AED]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{review.projectTitle}</h3>
                      <p className="text-sm text-[#A0A0A0]">{review.bdeName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#7C3AED]">
                        {review.rating.toFixed(1)}
                      </span>
                      <span className="text-[#A0A0A0]">/5</span>
                    </div>
                  </div>

                  <p className="text-sm mb-2">&quot;{review.comment}&quot;</p>

                  <div className="text-xs text-[#A0A0A0]">
                    {new Date(review.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
