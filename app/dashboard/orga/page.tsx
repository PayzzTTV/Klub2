import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ORGADashboard() {
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

  if (!profile || profile.role !== 'ORGA') {
    redirect('/dashboard/bde');
  }

  // Récupérer les statistiques de réputation
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_id', user.id);

  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (reviews!.reduce((sum, r) => sum + Number(r.global_rating), 0) / totalReviews).toFixed(1)
    : '0.0';

  const isTopProvider = Number(averageRating) >= 4.5 && totalReviews >= 5;

  // Récupérer les candidatures en cours
  const { data: applications } = await supabase
    .from('project_applications')
    .select('*, project:projects(*)')
    .eq('orga_id', user.id)
    .order('created_at', { ascending: false });

  const pendingApplications = applications?.filter((a) => a.status === 'pending') || [];
  const acceptedApplications = applications?.filter((a) => a.status === 'accepted') || [];

  // Récupérer les projets disponibles
  const { data: availableProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);

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
            {isTopProvider && (
              <span className="px-3 py-1 bg-[#00FF66]/20 text-[#00FF66] text-xs font-bold rounded">
                ⭐ TOP PRESTATAIRE
              </span>
            )}
            <span className="text-sm text-[#A0A0A0]">{profile.organization_name}</span>
            <div className="w-10 h-10 bg-[#7C3AED] rounded flex items-center justify-center font-bold">
              {profile.name[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <Link
              href="/dashboard/orga"
              className="py-4 border-b-2 border-[#7C3AED] text-white font-medium"
            >
              Tableau de bord
            </Link>
            <Link
              href="/projects"
              className="py-4 border-b-2 border-transparent text-[#A0A0A0] hover:text-white transition-colors"
            >
              Projets disponibles
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
        {/* Carte de réputation */}
        <div className="brutalist-card p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{profile.organization_name}</h2>
              <p className="text-[#A0A0A0] mb-4">{profile.location}</p>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-4xl font-bold text-[#7C3AED]">{averageRating}</div>
                  <div className="text-sm text-[#A0A0A0]">Note moyenne</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">{totalReviews}</div>
                  <div className="text-sm text-[#A0A0A0]">Avis reçus</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#00FF66]">{acceptedApplications.length}</div>
                  <div className="text-sm text-[#A0A0A0]">Projets acceptés</div>
                </div>
              </div>
            </div>
            {isTopProvider && (
              <div className="text-6xl">⭐</div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#7C3AED] mb-2">{pendingApplications.length}</div>
            <div className="text-sm text-[#A0A0A0]">Candidatures en attente</div>
          </div>
          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#00FF66] mb-2">{acceptedApplications.length}</div>
            <div className="text-sm text-[#A0A0A0]">Projets en cours</div>
          </div>
          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-white mb-2">{availableProjects?.length || 0}</div>
            <div className="text-sm text-[#A0A0A0]">Nouveaux projets</div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/projects" className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Parcourir les projets</h3>
              <p className="text-sm text-[#A0A0A0]">
                Consultez les événements disponibles et proposez vos services
              </p>
            </Link>

            <Link href="/rental" className="brutalist-card p-6 hover:border-[#7C3AED] transition-all">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="text-lg font-semibold mb-2">Gérer mon matériel</h3>
              <p className="text-sm text-[#A0A0A0]">
                Mettez votre équipement en location ou louez du matériel
              </p>
            </Link>
          </div>
        </div>

        {/* Projets disponibles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Nouveaux projets disponibles</h2>
            <Link href="/projects" className="text-[#7C3AED] hover:underline text-sm">
              Voir tous →
            </Link>
          </div>
          {availableProjects && availableProjects.length > 0 ? (
            <div className="space-y-4">
              {availableProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="brutalist-card p-6 block hover:border-[#7C3AED] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-[#A0A0A0] mb-3">
                        <span>{project.type}</span>
                        <span>•</span>
                        <span>{project.location}</span>
                        <span>•</span>
                        <span>{new Date(project.start_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="text-sm text-[#A0A0A0] line-clamp-2">{project.description}</p>
                    </div>
                    {project.budget && (
                      <div className="ml-6 text-right">
                        <div className="text-2xl font-bold text-[#7C3AED]">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(Number(project.budget))}
                        </div>
                        <div className="text-xs text-[#A0A0A0]">Budget</div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="brutalist-card p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">Aucun projet disponible</h3>
              <p className="text-[#A0A0A0]">
                Revenez plus tard pour découvrir de nouveaux événements.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
