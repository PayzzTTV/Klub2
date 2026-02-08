'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Project = {
  id: string;
  title: string;
  type: string;
  budget: number;
  capacity: number;
  location: string;
  start_date: string;
  status: string;
};

export default function BDEProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Récupérer TOUS les projets du BDE (peu importe le statut)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('bde_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        return;
      }

      setProjects(data || []);
      setLoading(false);
    }

    loadProjects();
  }, []);

  const handleDeleteProject = async (projectId: string, status: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Warning message based on status
    const warningMessages = {
      in_progress: '⚠️ Ce projet est EN COURS. Êtes-vous sûr de vouloir le supprimer ?',
      completed: '⚠️ Ce projet est TERMINÉ. Voulez-vous vraiment le supprimer ?',
      default: '⚠️ Êtes-vous sûr de vouloir supprimer ce projet ?'
    };

    const message = warningMessages[status as keyof typeof warningMessages] || warningMessages.default;

    if (!confirm(message)) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Reload projects
      setProjects(projects.filter(p => p.id !== projectId));
      alert('✅ Projet supprimé avec succès !');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'border-[#A0A0A0] text-[#A0A0A0] bg-[#A0A0A0]/10',
      published: 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10',
      pending_quotes: 'border-[#FFA500] text-[#FFA500] bg-[#FFA500]/10',
      in_progress: 'border-[#7C3AED] text-[#7C3AED] bg-[#7C3AED]/10',
      completed: 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10',
      cancelled: 'border-[#FF0055] text-[#FF0055] bg-[#FF0055]/10',
    };

    const labels = {
      draft: '📝 Brouillon',
      published: '🟢 Publié',
      pending_quotes: '⏳ En attente',
      in_progress: '⚡ En cours',
      completed: '✅ Terminé',
      cancelled: '❌ Annulé',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#A0A0A0]">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mes Projets</h1>
            <p className="text-[#A0A0A0]">Gérez tous vos événements</p>
          </div>

          <Link
            href="/bde/create-project"
            className="brutalist-button-primary px-6 py-3"
          >
            ✨ Nouveau Projet
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="brutalist-card p-6">
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div className="text-sm text-[#A0A0A0]">Total projets</div>
          </div>
          <div className="brutalist-card p-6">
            <div className="text-2xl font-bold text-[#00FF66]">
              {projects.filter(p => p.status === 'published').length}
            </div>
            <div className="text-sm text-[#A0A0A0]">Publiés</div>
          </div>
          <div className="brutalist-card p-6">
            <div className="text-2xl font-bold text-[#7C3AED]">
              {projects.filter(p => p.status === 'in_progress').length}
            </div>
            <div className="text-sm text-[#A0A0A0]">En cours</div>
          </div>
          <div className="brutalist-card p-6">
            <div className="text-2xl font-bold text-white">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-[#A0A0A0]">Terminés</div>
          </div>
        </div>

        {/* Liste des projets */}
        {projects.length === 0 ? (
          <div className="brutalist-card p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-white mb-2">Aucun projet</h2>
            <p className="text-[#A0A0A0] mb-6">Créez votre premier événement !</p>
            <Link href="/bde/create-project" className="brutalist-button-primary px-6 py-3 inline-block">
              ✨ Créer un projet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="brutalist-card p-6 hover:border-[#7C3AED] transition-all relative group">
                {/* Bouton Supprimer */}
                <button
                  onClick={(e) => handleDeleteProject(project.id, project.status, e)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF0055] text-white px-3 py-1 text-xs font-semibold hover:bg-[#FF0055]/80 z-10"
                  title="Supprimer le projet"
                >
                  🗑️ Supprimer
                </button>

                <Link href={`/bde/projects/${project.id}`} className="block">
                  {/* Status */}
                  <div className="mb-4">
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {project.title}
                  </h3>

                  {/* Type */}
                  <div className="text-sm text-[#7C3AED] mb-4">
                    {project.type}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#A0A0A0]">
                      <span>💰</span>
                      <span>{project.budget.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#A0A0A0]">
                      <span>👥</span>
                      <span>{project.capacity} personnes</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#A0A0A0]">
                      <span>📍</span>
                      <span className="line-clamp-1">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#A0A0A0]">
                      <span>📅</span>
                      <span>{new Date(project.start_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-[#1A1A1A]">
                    <span className="text-sm text-[#7C3AED] font-semibold">
                      Voir détails →
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
