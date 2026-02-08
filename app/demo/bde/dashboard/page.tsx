'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getBDEProjects, hasPendingFeedback } from '@/lib/utils/projects';
import { getProfile } from '@/lib/utils/profiles';
import { Profile, Project } from '@/types';

export default function DemoBDEDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load data in parallel
      const [profileData, projectsData, needsFeedback] = await Promise.all([
        getProfile(supabase, user.id),
        getBDEProjects(supabase, user.id),
        hasPendingFeedback(supabase, user.id),
      ]);

      if (profileData) setProfile(profileData);
      if (projectsData) setProjects(projectsData);
      setPendingFeedback(needsFeedback);
      setLoading(false);
    }

    loadDashboard();
  }, [supabase, router]);

  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const activeProjects = projects.filter((p) => p.status === 'in_progress').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#000000]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
      </div>
    );
  }

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
            <span className="text-sm text-[#A0A0A0]">{profile?.organization_name || 'BDE'}</span>
            <div className="w-10 h-10 bg-[#7C3AED] rounded flex items-center justify-center font-bold">
              {profile?.name?.[0]?.toUpperCase() || 'B'}
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
              <Link
                href={`/demo/feedback/${projects.find(p => p.status === 'completed' && !p.feedback_given)?.id || '1'}`}
                className="brutalist-button-primary px-6 py-2 whitespace-nowrap"
              >
                Donner mon avis
              </Link>
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
              href="/demo/messages"
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
{pendingFeedback ? (
              <div className="brutalist-card p-6 opacity-50 cursor-not-allowed transition-all">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Créer un projet</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Postez un nouvel événement et trouvez des prestataires
                </p>
                <div className="mt-3 text-xs text-[#FF0055]">
                  ⚠️ Feedback obligatoire en attente
                </div>
              </div>
            ) : (
              <Link
                href="/demo/bde/create-project"
                className="brutalist-card p-6 hover:border-[#7C3AED] cursor-pointer transition-all"
              >
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Créer un projet</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Postez un nouvel événement et trouvez des prestataires
                </p>
              </Link>
            )}

            <Link href="/demo/rental" className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
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
          {projects.length === 0 ? (
            <div className="brutalist-card p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">Aucun projet pour le moment</h3>
              <p className="text-sm text-[#A0A0A0] mb-4">
                Créez votre premier projet pour commencer à collaborer avec des prestataires
              </p>
              {!pendingFeedback && (
                <Link
                  href="/demo/bde/create-project"
                  className="brutalist-button-primary inline-block px-6 py-2"
                >
                  Créer un projet
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
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
          )}
        </div>
      </main>
    </div>
  );
}
