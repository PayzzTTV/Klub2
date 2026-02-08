import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function BDEDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'BDE') {
    redirect('/dashboard/orga');
  }

  // Vérifier si des feedbacks sont en attente
  const { data: pendingFeedbacks } = await supabase
    .from('projects')
    .select('*, selected_orga:profiles!selected_orga_id(*)')
    .eq('bde_id', user.id)
    .eq('status', 'completed')
    .eq('feedback_given', false);

  // Récupérer les projets du BDE
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('bde_id', user.id)
    .order('created_at', { ascending: false });

  // Statistiques
  const totalProjects = projects?.length || 0;
  const completedProjects = projects?.filter((p) => p.status === 'completed').length || 0;
  const activeProjects = projects?.filter((p) => p.status === 'in_progress').length || 0;

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tighter">
              <span className="text-white">K</span>
              <span className="text-[#7C3AED]">L</span>
              <span className="text-white">UB</span>
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#A0A0A0]">{profile.organization_name}</span>
            <div className="w-10 h-10 bg-[#7C3AED] rounded flex items-center justify-center font-bold">
              {profile.name[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Bandeau de feedback obligatoire */}
      {pendingFeedbacks && pendingFeedbacks.length > 0 && (
        <div className="bg-[#FF0055] border-b border-[#FF0055]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white mb-1">⚠️ Feedback obligatoire</h3>
                <p className="text-sm text-white/90">
                  Vous avez {pendingFeedbacks.length} projet(s) terminé(s) en attente de feedback.
                  Vous devez donner votre avis avant de créer un nouveau projet.
                </p>
              </div>
              <Link
                href={`/projects/${pendingFeedbacks[0].id}/feedback`}
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
              href="/dashboard/bde"
              className="py-4 border-b-2 border-[#7C3AED] text-white font-medium"
            >
              Tableau de bord
            </Link>
            <Link
              href="/projects"
              className="py-4 border-b-2 border-transparent text-[#A0A0A0] hover:text-white transition-colors"
            >
              Mes projets
            </Link>
            <Link
              href="/rental"
              className="py-4 border-b-2 border-transparent text-[#A0A0A0] hover:text-white transition-colors"
            >
              Matériel
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
            <Link
              href="/projects/new"
              className={`brutalist-card p-6 hover:border-[#7C3AED] transition-all ${
                pendingFeedbacks && pendingFeedbacks.length > 0
                  ? 'opacity-50 cursor-not-allowed pointer-events-none'
                  : ''
              }`}
            >
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Créer un projet</h3>
              <p className="text-sm text-[#A0A0A0]">
                Postez un nouvel événement et trouvez des prestataires
              </p>
              {pendingFeedbacks && pendingFeedbacks.length > 0 && (
                <div className="mt-3 text-xs text-[#FF0055]">
                  ⚠️ Feedback obligatoire en attente
                </div>
              )}
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
          <h2 className="text-xl font-bold mb-4">Projets récents</h2>
          {projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="brutalist-card p-6 block hover:border-[#7C3AED] transition-all"
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
                            : project.status === 'completed'
                            ? 'bg-white/20 text-white'
                            : 'bg-[#A0A0A0]/20 text-[#A0A0A0]'
                        }`}
                      >
                        {project.status === 'published' && 'Publié'}
                        {project.status === 'in_progress' && 'En cours'}
                        {project.status === 'completed' && 'Terminé'}
                        {project.status === 'draft' && 'Brouillon'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="brutalist-card p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">Aucun projet pour le moment</h3>
              <p className="text-[#A0A0A0] mb-6">
                Créez votre premier projet pour commencer à collaborer avec des organisateurs.
              </p>
              <Link href="/projects/new" className="brutalist-button-primary px-6 py-3 inline-block">
                Créer mon premier projet
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
