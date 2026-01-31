'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DemoProjectsPage() {
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
  });

  const mockProjects = [
    {
      id: '1',
      title: 'Gala de fin d\'année 2026',
      type: 'Gala',
      budget: 15000,
      capacity: 500,
      location: 'Paris',
      bdeName: 'BDE ESSEC',
      startDate: '2026-06-15',
      description: 'Grand gala de fin d\'année avec 500 personnes. Besoin de prestataires son, lumière et DJ.',
    },
    {
      id: '2',
      title: 'Festival Campus Summer',
      type: 'Festival',
      budget: 25000,
      capacity: 1000,
      location: 'Lyon',
      bdeName: 'BDE EM Lyon',
      startDate: '2026-05-20',
      description: 'Festival outdoor sur 2 jours avec plusieurs scènes.',
    },
    {
      id: '3',
      title: 'Soirée d\'intégration',
      type: 'Soirée',
      budget: 8000,
      capacity: 300,
      location: 'Toulouse',
      bdeName: 'BDE Toulouse BS',
      startDate: '2026-09-10',
      description: 'Soirée de rentrée pour accueillir les nouveaux étudiants.',
    },
    {
      id: '4',
      title: 'Conférence Tech & Innovation',
      type: 'Conférence',
      budget: 12000,
      capacity: 200,
      location: 'Paris',
      bdeName: 'BDE Télécom Paris',
      startDate: '2026-04-05',
      description: 'Conférence avec speakers renommés. Besoin de matériel audiovisuel professionnel.',
    },
  ];

  const projectTypes = ['all', 'Gala', 'Soirée', 'Festival', 'Conférence', 'Autre'];

  const filteredProjects = mockProjects.filter((project) => {
    const matchesType = filters.type === 'all' || project.type === filters.type;
    const matchesSearch = project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          project.location.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter">
            <span className="text-white">K</span>
            <span className="text-[#7C3AED]">L</span>
            <span className="text-white">UB</span>
            <span className="text-sm text-[#A0A0A0] ml-4">Mode Démo</span>
          </h1>
          <Link href="/demo" className="text-sm text-[#A0A0A0] hover:text-white">
            ← Retour
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Projets Disponibles</h1>
          <p className="text-[#A0A0A0]">Découvrez les événements à venir et postulez en tant qu&apos;ORGA</p>
        </div>

        {/* Filters */}
        <div className="brutalist-card p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Rechercher</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-2 focus:outline-none focus:border-[#7C3AED]"
                placeholder="Nom du projet, ville..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Type d&apos;événement</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-2 focus:outline-none focus:border-[#7C3AED]"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Tous les types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-6 text-sm text-[#A0A0A0]">
          {filteredProjects.length} projet(s) trouvé(s)
        </div>

        {filteredProjects.length === 0 ? (
          <div className="brutalist-card p-12 text-center">
            <p className="text-[#A0A0A0]">Aucun projet ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="brutalist-card p-6 hover:border-[#7C3AED] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                    <p className="text-sm text-[#A0A0A0]">{project.bdeName}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] text-xs font-bold rounded">
                    {project.type}
                  </span>
                </div>

                <p className="text-sm text-[#A0A0A0] mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A0A0A0]">💰</span>
                    <span className="font-semibold">{project.budget.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#A0A0A0]">👥</span>
                    <span>{project.capacity} personnes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#A0A0A0]">📍</span>
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#A0A0A0]">📅</span>
                    <span>
                      {new Date(project.startDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/demo/projects/${project.id}/apply`}
                    className="brutalist-button-primary px-4 py-2 text-sm flex-1 text-center"
                  >
                    Candidater
                  </Link>
                  <Link
                    href={`/demo/projects/${project.id}`}
                    className="brutalist-button px-4 py-2 text-sm text-center"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
