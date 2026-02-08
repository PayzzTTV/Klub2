'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrgaStats, isTopProvider as checkTopProvider } from '@/lib/utils/profiles';
import { getOrgaReviews } from '@/lib/utils/reviews';
import { Review } from '@/types';

export default function DemoOrgaDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    activeApplications: 0,
    completedProjects: 0,
  });
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [isTopProvider, setIsTopProvider] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load stats and reviews in parallel
      const [statsData, reviewsData, topProviderStatus] = await Promise.all([
        getOrgaStats(supabase, user.id),
        getOrgaReviews(supabase, user.id),
        checkTopProvider(supabase, user.id),
      ]);

      if (statsData) setStats(statsData);
      if (reviewsData) setRecentReviews(reviewsData.slice(0, 3)); // Only show 3 most recent
      setIsTopProvider(topProviderStatus);
      setLoading(false);
    }

    loadDashboard();
  }, [supabase, router]);

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
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}/5
            </div>
            <div className="text-sm text-[#A0A0A0]">Note moyenne</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#00FF66] mb-1">
              {stats.totalReviews}
            </div>
            <div className="text-sm text-[#A0A0A0]">Avis reçus</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.activeApplications}
            </div>
            <div className="text-sm text-[#A0A0A0]">Candidatures en cours</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.completedProjects}
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

          <Link href="/demo/messages" className="brutalist-card p-6 hover:border-[#7C3AED] transition-colors">
            <h3 className="text-xl font-bold mb-2">💬 Messages</h3>
            <p className="text-sm text-[#A0A0A0]">Communiquez avec les BDE</p>
          </Link>
        </div>

        {/* Recent Reviews */}
        <div className="brutalist-card p-8">
          <h2 className="text-2xl font-bold mb-6">Derniers Avis Reçus</h2>

          {recentReviews.length === 0 ? (
            <p className="text-[#A0A0A0] text-center py-8">
              Aucun avis pour le moment. Complétez vos premiers projets pour recevoir des feedbacks !
            </p>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-[#1A1A1A] rounded p-4 hover:border-[#7C3AED]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{review.project?.title || 'Projet'}</h3>
                      <p className="text-sm text-[#A0A0A0]">
                        {review.reviewer?.organization_name || review.reviewer?.name || 'BDE'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#7C3AED]">
                        {review.global_rating.toFixed(1)}
                      </span>
                      <span className="text-[#A0A0A0]">/5</span>
                    </div>
                  </div>

                  <p className="text-sm mb-2">&quot;{review.comment}&quot;</p>

                  <div className="text-xs text-[#A0A0A0]">
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
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
