'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrgaStats, isTopProvider as checkTopProvider } from '@/lib/utils/profiles';
import { getOrgaReviews, ReviewWithRelations } from '@/lib/utils/reviews';
import { DashboardORGASkeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function DemoOrgaDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    activeApplications: 0,
    completedProjects: 0,
  });
  const [recentReviews, setRecentReviews] = useState<ReviewWithRelations[]>([]);
  const [isTopProvider, setIsTopProvider] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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

  if (loading) return <DashboardORGASkeleton />;

  return (
    <div className="min-h-screen bg-[#000000] py-8 sm:py-12 px-4">
      <main className="max-w-7xl mx-auto">
        {/* Welcome + Badge */}
        <div className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{t.orga.dashboard.title}</h1>
            <p className="text-sm sm:text-base text-[#A0A0A0]">{t.orga.dashboard.subtitle}</p>
          </div>
          {isTopProvider && (
            <span className="px-4 py-2 bg-[#00FF66]/20 text-[#00FF66] text-sm font-bold rounded border border-[#00FF66]/30">
              {t.orga.dashboard.topProvider}
            </span>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#7C3AED] mb-1">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}/5
            </div>
            <div className="text-sm text-[#A0A0A0]">{t.orga.dashboard.stats.avgRating}</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-[#00FF66] mb-1">
              {stats.totalReviews}
            </div>
            <div className="text-sm text-[#A0A0A0]">{t.orga.dashboard.stats.reviews}</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.activeApplications}
            </div>
            <div className="text-sm text-[#A0A0A0]">{t.orga.dashboard.stats.applications}</div>
          </div>

          <div className="brutalist-card p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.completedProjects}
            </div>
            <div className="text-sm text-[#A0A0A0]">{t.orga.dashboard.stats.completed}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          <Link href="/projects" className="brutalist-card p-6 hover:border-[#7C3AED] transition-colors">
            <h3 className="text-xl font-bold mb-2">{t.orga.dashboard.quickActions.viewProjects.title}</h3>
            <p className="text-sm text-[#A0A0A0]">{t.orga.dashboard.quickActions.viewProjects.desc}</p>
          </Link>

          <Link href="/rental" className="brutalist-card p-6 hover:border-[#7C3AED] transition-colors">
            <h3 className="text-xl font-bold mb-2">{t.orga.dashboard.quickActions.rentEquipment.title}</h3>
            <p className="text-sm text-[#A0A0A0]">{t.orga.dashboard.quickActions.rentEquipment.desc}</p>
          </Link>

          <Link href="/rental/manage" className="brutalist-card p-6 hover:border-[#7C3AED] transition-colors">
            <h3 className="text-xl font-bold mb-2">{t.orga.dashboard.quickActions.manageRentals.title}</h3>
            <p className="text-sm text-[#A0A0A0]">{t.orga.dashboard.quickActions.manageRentals.desc}</p>
          </Link>
        </div>

        {/* Recent Reviews */}
        <div className="brutalist-card p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">{t.orga.dashboard.recentReviews}</h2>

          {recentReviews.length === 0 ? (
            <p className="text-[#A0A0A0] text-center py-8">
              {t.orga.dashboard.noReviews}
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
