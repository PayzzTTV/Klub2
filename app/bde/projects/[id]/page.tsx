'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getProjectById, getProjectApplications, updateProjectStatusByDate } from '@/lib/utils/projects';
import type { Project, ProjectApplication } from '@/types';

export default function BDEProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProjectDetail() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setCurrentUserId(user.id);

        // Update project status based on dates
        await updateProjectStatusByDate(supabase, projectId);

        // Load project and applications
        const [projectData, applicationsData] = await Promise.all([
          getProjectById(supabase, projectId),
          getProjectApplications(supabase, projectId),
        ]);

        if (!projectData) {
          setError('Projet non trouvé');
          setLoading(false);
          return;
        }

        // Verify ownership
        if (projectData.bde_id !== user.id) {
          setError('Vous n\'êtes pas le propriétaire de ce projet');
          setLoading(false);
          return;
        }

        setProject(projectData);
        setApplications(applicationsData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading project detail:', err);
        setError('Erreur lors du chargement du projet');
        setLoading(false);
      }
    }

    loadProjectDetail();
  }, [supabase, projectId, router]);

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('project_applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId);

      if (error) throw error;

      // Reload applications
      const updatedApplications = await getProjectApplications(supabase, projectId);
      setApplications(updatedApplications);

      alert('✅ Candidature acceptée !');
    } catch (err) {
      console.error('Error accepting application:', err);
      alert('❌ Erreur lors de l\'acceptation');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('project_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      // Reload applications
      const updatedApplications = await getProjectApplications(supabase, projectId);
      setApplications(updatedApplications);

      alert('❌ Candidature refusée');
    } catch (err) {
      console.error('Error rejecting application:', err);
      alert('❌ Erreur lors du refus');
    }
  };

  const handleStartProject = async () => {
    if (!confirm('⚠️ Démarrer ce projet ? Il passera en mode "En cours".')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'in_progress' })
        .eq('id', projectId);

      if (error) throw error;

      // Reload project
      const updatedProject = await getProjectById(supabase, projectId);
      setProject(updatedProject);

      alert('✅ Projet démarré !');
    } catch (err) {
      console.error('Error starting project:', err);
      alert('❌ Erreur lors du démarrage');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-[#A0A0A0]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-[#1A1A1A] px-6 py-4">
          <Link href="/bde/dashboard" className="text-2xl font-bold">
            ← KLUB
          </Link>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="brutalist-card bg-[#FF0055]/10 border-[#FF0055] p-6">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p className="text-[#A0A0A0]">{error}</p>
            <Link href="/bde/dashboard" className="brutalist-button inline-block mt-4 px-6 py-2">
              Retour au Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const acceptedApplication = applications.find(app => app.status === 'accepted');
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/bde/dashboard" className="text-2xl font-bold">
            ← KLUB
          </Link>
          <span className="text-sm text-[#A0A0A0]">Mon Projet</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Project Header */}
        <div className="brutalist-card p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded text-xs font-medium">
                  {project.type}
                </span>
                <span>📍 {project.location}</span>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded text-sm font-semibold ${
                project.status === 'published'
                  ? 'bg-[#7C3AED]/20 text-[#7C3AED]'
                  : project.status === 'in_progress'
                  ? 'bg-[#00FF66]/20 text-[#00FF66]'
                  : project.status === 'completed'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#A0A0A0]/20 text-[#A0A0A0]'
              }`}
            >
              {project.status === 'published' && '📢 Publié'}
              {project.status === 'in_progress' && '🚀 En cours'}
              {project.status === 'completed' && '✅ Terminé'}
              {project.status === 'draft' && '📝 Brouillon'}
            </span>
          </div>

          {/* Start Project Button - Only for published or pending_quotes */}
          {(project.status === 'published' || project.status === 'pending_quotes') && (
            <div className="mb-6">
              <button
                onClick={handleStartProject}
                className="brutalist-button-primary px-6 py-3"
              >
                🚀 Démarrer le projet
              </button>
              <p className="text-xs text-[#A0A0A0] mt-2">
                Le projet passera en mode "En cours"
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-xs text-[#A0A0A0] mb-1">Budget</div>
              <div className="text-xl font-bold">{project.budget.toLocaleString('fr-FR')} €</div>
            </div>
            <div>
              <div className="text-xs text-[#A0A0A0] mb-1">Capacité</div>
              <div className="text-xl font-bold">{project.capacity} pers.</div>
            </div>
            <div>
              <div className="text-xs text-[#A0A0A0] mb-1">Candidatures</div>
              <div className="text-xl font-bold">{applications.length}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs text-[#A0A0A0] mb-1">Date de début</div>
              <div className="text-sm">
                {new Date(project.start_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#A0A0A0] mb-1">Date de fin</div>
              <div className="text-sm">
                {new Date(project.end_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-[#A0A0A0] mb-2">Description</div>
            <p className="text-sm leading-relaxed">{project.description}</p>
          </div>
        </div>

        {/* Accepted Application */}
        {acceptedApplication && (
          <div className="brutalist-card p-6 mb-8 border-[#00FF66]">
            <h2 className="text-xl font-bold mb-4">✅ Prestataire Accepté</h2>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {acceptedApplication.orga_profile?.organization_name || acceptedApplication.orga_profile?.name}
                </h3>
                <p className="text-sm text-[#A0A0A0] mt-2">{acceptedApplication.message}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#00FF66]">
                  {acceptedApplication.proposed_price.toLocaleString('fr-FR')} €
                </div>
                <div className="text-xs text-[#A0A0A0] mt-1">Prix proposé</div>
              </div>
            </div>
            {project.status === 'completed' && !project.feedback_given && (
              <Link
                href={`/feedback/${project.id}`}
                className="brutalist-button-primary inline-block px-6 py-2 mt-4"
              >
                Donner mon feedback
              </Link>
            )}
          </div>
        )}

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">
              📬 Candidatures en attente ({pendingApplications.length})
            </h2>
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div key={app.id} className="brutalist-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {app.orga_profile?.organization_name || app.orga_profile?.name}
                      </h3>
                      <p className="text-sm text-[#A0A0A0] mt-2">{app.message}</p>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-[#7C3AED]">
                        {app.proposed_price.toLocaleString('fr-FR')} €
                      </div>
                      <div className="text-xs text-[#A0A0A0] mt-1">Prix proposé</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptApplication(app.id)}
                      className="brutalist-button-primary px-6 py-2 flex-1"
                    >
                      ✅ Accepter
                    </button>
                    <button
                      onClick={() => handleRejectApplication(app.id)}
                      className="brutalist-button px-6 py-2 flex-1"
                    >
                      ❌ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Applications */}
        {rejectedApplications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-[#A0A0A0]">
              Candidatures refusées ({rejectedApplications.length})
            </h2>
            <div className="space-y-4">
              {rejectedApplications.map((app) => (
                <div key={app.id} className="brutalist-card p-6 opacity-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {app.orga_profile?.organization_name || app.orga_profile?.name}
                      </h3>
                      <p className="text-sm text-[#A0A0A0] mt-1">{app.message}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {app.proposed_price.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Applications */}
        {applications.length === 0 && (
          <div className="brutalist-card p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-semibold mb-2">Aucune candidature pour le moment</h3>
            <p className="text-sm text-[#A0A0A0]">
              Les organisateurs pourront postuler dès que votre projet sera publié
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
