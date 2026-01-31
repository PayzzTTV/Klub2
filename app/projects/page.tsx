import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { ProjectType } from '@/types';

export default async function ProjectsPage() {
  const supabase = await createClient();

  // Récupérer tous les projets publiés
  const { data: projects } = await supabase
    .from('projects')
    .select('*, bde:profiles!bde_id(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tighter cursor-pointer">
              <span className="text-white">K</span>
              <span className="text-[#7C3AED]">L</span>
              <span className="text-white">UB</span>
            </h1>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Projets disponibles</h1>
            <p className="text-[#A0A0A0]">
              {projects?.length || 0} événement(s) en attente de prestataires
            </p>
          </div>
        </div>

        {/* Liste des projets */}
        {projects && projects.length > 0 ? (
          <div className="grid gap-6">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="brutalist-card p-8 hover:border-[#7C3AED] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                      <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded font-medium">
                        {project.type}
                      </span>
                      <span>📍 {project.location}</span>
                      <span>
                        📅 {new Date(project.start_date).toLocaleDateString('fr-FR')}
                      </span>
                      {project.capacity && <span>👥 {project.capacity} personnes</span>}
                    </div>
                  </div>
                  {project.budget && (
                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-[#7C3AED]">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(Number(project.budget))}
                      </div>
                      <div className="text-xs text-[#A0A0A0]">Budget</div>
                    </div>
                  )}
                </div>

                <p className="text-[#A0A0A0] mb-4 line-clamp-3">{project.description}</p>

                {project.requirements && (
                  <div className="mt-4 pt-4 border-t border-[#1A1A1A]">
                    <p className="text-sm text-[#A0A0A0]">
                      <span className="font-semibold text-white">Besoins:</span>{' '}
                      {project.requirements}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#7C3AED] rounded flex items-center justify-center text-sm font-bold">
                      {project.bde?.name?.[0]?.toUpperCase() || 'B'}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{project.bde?.organization_name}</div>
                      <div className="text-xs text-[#A0A0A0]">{project.bde?.location}</div>
                    </div>
                  </div>
                  <div className="brutalist-button-primary px-6 py-2 text-sm">
                    Candidater →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="brutalist-card p-16 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">Aucun projet disponible</h2>
            <p className="text-[#A0A0A0]">
              Les nouveaux événements apparaîtront ici dès leur publication.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
