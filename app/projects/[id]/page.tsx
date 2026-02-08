'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProjectById, getProjectApplications, Project, ProjectApplication } from '@/lib/utils/projects';

export default function DemoProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [userRole, setUserRole] = useState<'BDE' | 'ORGA' | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Mock data - en vrai on ferait un fetch avec l'ID
  const mockProjects: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Gala de fin d\'année 2026',
      type: 'Gala',
      budget: 15000,
      capacity: 500,
      location: 'Paris',
      bdeName: 'BDE ESSEC',
      bdeAvatar: '🎓',
      startDate: '2026-06-15',
      endDate: '2026-06-15',
      status: 'published',
      description: 'Grand gala de fin d\'année avec 500 personnes. Besoin de prestataires son, lumière et DJ.\n\nNous recherchons des prestataires expérimentés pour assurer la réussite de notre événement phare de l\'année. L\'événement aura lieu dans un lieu prestigieux à Paris.\n\nBesoins spécifiques :\n- Système son professionnel (enceintes, micros, table de mixage)\n- Éclairage scénique (projecteurs, effets spéciaux)\n- DJ pour l\'animation musicale\n- Équipe technique sur place',
      applications: [
        {
          id: '1',
          orgaName: 'SoundTech Events',
          orgaRating: 4.8,
          orgaReviews: 15,
          proposedPrice: 5000,
          message: 'Nous avons 10 ans d\'expérience dans les galas étudiants. Notre équipe saura répondre à vos besoins.',
          date: '2026-01-20',
        },
        {
          id: '2',
          orgaName: 'LightShow Pro',
          orgaRating: 4.6,
          orgaReviews: 12,
          proposedPrice: 4500,
          message: 'Spécialisés en éclairage événementiel, nous avons déjà travaillé avec plusieurs BDE de grandes écoles.',
          date: '2026-01-18',
        },
      ],
    },
    '2': {
      id: '2',
      title: 'Festival Campus Summer',
      type: 'Festival',
      budget: 25000,
      capacity: 1000,
      location: 'Lyon',
      bdeName: 'BDE EM Lyon',
      bdeAvatar: '🎪',
      startDate: '2026-05-20',
      endDate: '2026-05-22',
      status: 'published',
      description: 'Festival outdoor sur 2 jours avec plusieurs scènes. Besoin de prestataires pour le son, la lumière, les structures et la sécurité.',
      applications: [],
    },
    '3': {
      id: '3',
      title: 'Soirée d\'intégration',
      type: 'Soirée',
      budget: 8000,
      capacity: 300,
      location: 'Toulouse',
      bdeName: 'BDE Toulouse BS',
      bdeAvatar: '🎉',
      startDate: '2026-09-10',
      endDate: '2026-09-10',
      status: 'published',
      description: 'Soirée de rentrée pour accueillir les nouveaux étudiants. Ambiance festive et conviviale.',
      applications: [],
    },
    '4': {
      id: '4',
      title: 'Conférence Tech & Innovation',
      type: 'Conférence',
      budget: 12000,
      capacity: 200,
      location: 'Paris',
      bdeName: 'BDE Télécom Paris',
      bdeAvatar: '💻',
      startDate: '2026-04-05',
      endDate: '2026-04-05',
      status: 'published',
      description: 'Conférence avec speakers renommés. Besoin de matériel audiovisuel professionnel.',
      applications: [],
    },
  };

  // Load project from Supabase or use mock data
  useEffect(() => {
    async function loadProject() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsDemo(false);
        setCurrentUserId(user.id);

        // Get user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
        }

        const [supabaseProject, projectApps] = await Promise.all([
          getProjectById(supabase, projectId),
          getProjectApplications(supabase, projectId),
        ]);

        if (supabaseProject) {
          setProject(supabaseProject);
          setApplications(projectApps || []);

          // Check if user is the owner
          if (supabaseProject.bde_id === user.id) {
            setIsOwner(true);
          }
        } else {
          // Fallback to mock data if project not found in DB
          setProject(mockProjects[projectId] || null);
        }
      } else {
        // Not authenticated, use mock data
        setIsDemo(true);
        setProject(mockProjects[projectId] || null);
      }
      setLoading(false);
    }

    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleAcceptApplication = async (applicationId: string) => {
    if (!currentUserId) return;

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
    if (!currentUserId) return;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A0A0A0]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Projet non trouvé</h1>
          <Link href="/projects" className="text-[#7C3AED] hover:underline">
            ← Retour aux projets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] py-12 px-4">
      <div className="max-w-7xl mx-auto">
      
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="brutalist-card p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="px-3 py-1 bg-[#7C3AED]/20 text-[#7C3AED] text-xs font-bold rounded mb-3 inline-block">
                    {project.type}
                  </span>
                  <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                  <div className="flex items-center gap-2 text-[#A0A0A0]">
                    <span className="text-2xl">{project.bdeAvatar || '🎓'}</span>
                    <span>{project.bde_profile?.organization_name || project.bde_profile?.name || project.bdeName || 'BDE'}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-sm text-[#A0A0A0]">Budget</div>
                    <div className="font-bold text-lg">{project.budget.toLocaleString('fr-FR')} €</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="text-sm text-[#A0A0A0]">Capacité</div>
                    <div className="font-bold text-lg">{project.capacity} personnes</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <div className="text-sm text-[#A0A0A0]">Lieu</div>
                    <div className="font-bold">{project.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="text-sm text-[#A0A0A0]">Date</div>
                    <div className="font-bold">
                      {new Date(project.start_date || project.startDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1A1A1A] pt-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-[#A0A0A0] whitespace-pre-line leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Applications (only visible to BDE) */}
            {((applications && applications.length > 0) || (project.applications && project.applications.length > 0)) && (
              <div className="brutalist-card p-8">
                <h2 className="text-2xl font-bold mb-6">
                  Candidatures Reçues ({applications.length || project.applications?.length || 0})
                </h2>

                <div className="space-y-4">
                  {(applications.length > 0 ? applications : project.applications || []).map((app: any) => (
                    <div
                      key={app.id}
                      className="border border-[#1A1A1A] rounded p-6 hover:border-[#7C3AED]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold mb-1">
                            {app.orga_profile?.organization_name || app.orga_profile?.name || app.orgaName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-[#7C3AED] font-bold">
                              ⭐ {app.orga_profile?.global_score || app.orgaRating}/5
                            </span>
                            <span className="text-[#A0A0A0]">
                              ({app.orgaReviews || 0} avis)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#A0A0A0]">Prix proposé</div>
                          <div className="text-2xl font-bold text-[#00FF66]">
                            {(app.proposed_price || app.proposedPrice).toLocaleString('fr-FR')} €
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-[#A0A0A0] mb-4">&quot;{app.message}&quot;</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#A0A0A0]">
                          Candidature reçue le {new Date(app.created_at || app.date).toLocaleDateString('fr-FR')}
                        </span>
                        <div className="flex gap-2">
                          <Link
                            href="/messages/conv-1"
                            className="brutalist-button px-4 py-2 text-sm"
                          >
                            💬 Message
                          </Link>
                          {/* Show Accept/Reject buttons only if user is owner and status is pending */}
                          {isOwner && app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAcceptApplication(app.id)}
                                className="brutalist-button-primary px-4 py-2 text-sm"
                              >
                                ✅ Accepter
                              </button>
                              <button
                                onClick={() => handleRejectApplication(app.id)}
                                className="brutalist-button px-4 py-2 text-sm hover:border-[#FF0055] hover:text-[#FF0055]"
                              >
                                ❌ Refuser
                              </button>
                            </>
                          )}
                          {/* Show status badge if not pending */}
                          {app.status === 'accepted' && (
                            <span className="px-4 py-2 bg-[#00FF66]/20 text-[#00FF66] text-sm font-semibold rounded">
                              ✅ Acceptée
                            </span>
                          )}
                          {app.status === 'rejected' && (
                            <span className="px-4 py-2 bg-[#FF0055]/20 text-[#FF0055] text-sm font-semibold rounded">
                              ❌ Refusée
                            </span>
                          )}
                          <Link
                            href={`/projects/${projectId}/applications/${app.id}`}
                            className="brutalist-button px-4 py-2 text-sm"
                          >
                            Voir profil
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {applications.length === 0 && (!project.applications || project.applications.length === 0) && (
              <div className="brutalist-card p-8 text-center">
                <p className="text-[#A0A0A0]">Aucune candidature pour le moment.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card - Only for ORGA and NOT owner */}
            {userRole === 'ORGA' && !isOwner && (
              <div className="brutalist-card p-6">
                <h3 className="text-lg font-bold mb-4">Vous êtes intéressé ?</h3>
                <Link
                  href={`/projects/${projectId}/apply`}
                  className="brutalist-button-primary px-6 py-3 block text-center mb-3"
                >
                  Candidater maintenant
                </Link>
                <p className="text-xs text-[#A0A0A0] text-center">
                  Proposez vos services et votre tarif
                </p>
              </div>
            )}

            {/* Info Card */}
            <div className="brutalist-card p-6">
              <h3 className="text-lg font-bold mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[#A0A0A0] mb-1">Statut</div>
                  <span className="px-2 py-1 bg-[#00FF66]/20 text-[#00FF66] text-xs font-bold rounded">
                    {project.status === 'published' ? 'Publié' : project.status}
                  </span>
                </div>

                <div>
                  <div className="text-[#A0A0A0] mb-1">Publié par</div>
                  <div className="font-semibold">{project.bdeName}</div>
                </div>

                <div>
                  <div className="text-[#A0A0A0] mb-1">Candidatures</div>
                  <div className="font-semibold">{applications.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
