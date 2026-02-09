'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getBDEProjects, updateAllProjectStatuses } from '@/lib/utils/projects';
import { getProfile } from '@/lib/utils/profiles';
import { Profile, Project } from '@/types';
import { usePendingFeedback } from '@/lib/hooks/usePendingFeedback';
import FeedbackBanner from '@/components/feedback/FeedbackBanner';

export default function DemoBDEDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the pending feedback hook
  const { pendingProjects, loading: feedbackLoading } = usePendingFeedback(supabase, userId);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Update project statuses based on dates
      await updateAllProjectStatuses(supabase);

      // Load data in parallel
      const [profileData, projectsData] = await Promise.all([
        getProfile(supabase, user.id),
        getBDEProjects(supabase, user.id),
      ]);

      if (profileData) setProfile(profileData);
      if (projectsData) setProjects(projectsData);
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

  const hasPendingFeedback = pendingProjects.length > 0;

  return (
    <div className="min-h-screen bg-[#000000] py-8 sm:py-12 px-4">
      <main className="max-w-7xl mx-auto">
        {/* Bandeau de feedback obligatoire */}
        <FeedbackBanner projects={pendingProjects} />
        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
          <h2 className="text-lg sm:text-xl font-bold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasPendingFeedback ? (
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
                href="/bde/create-project"
                className="brutalist-card p-6 hover:border-[#7C3AED] cursor-pointer transition-all"
              >
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Créer un projet</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Postez un nouvel événement et trouvez des prestataires
                </p>
              </Link>
            )}

            <Link href="/rental/manage" className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-semibold mb-2">Gérer les locations</h3>
              <p className="text-sm text-[#A0A0A0]">
                Gérez les demandes de location de votre matériel
              </p>
            </Link>

            <Link href="/rental" className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
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
          <h2 className="text-lg sm:text-xl font-bold mb-4">Projets récents</h2>
          {projects.length === 0 ? (
            <div className="brutalist-card p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">Aucun projet pour le moment</h3>
              <p className="text-sm text-[#A0A0A0] mb-4">
                Créez votre premier projet pour commencer à collaborer avec des prestataires
              </p>
              {!hasPendingFeedback && (
                <Link
                  href="/bde/create-project"
                  className="brutalist-button-primary inline-block px-6 py-2"
                >
                  Créer un projet
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
              <Link
                key={project.id}
                href={`/bde/projects/${project.id}`}
                className="brutalist-card p-4 sm:p-6 hover:border-[#7C3AED] transition-all cursor-pointer block"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">{project.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#A0A0A0]">
                      <span>{project.type}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{project.location}</span>
                      <span className="hidden sm:inline">•</span>
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
              </Link>
            ))}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
