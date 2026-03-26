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
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function DemoBDEDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the pending feedback hook
  const { pendingProjects, loading: feedbackLoading } = usePendingFeedback(supabase, userId);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      await updateAllProjectStatuses(supabase);

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
        <div className="k-spinner" />
      </div>
    );
  }

  const hasPendingFeedback = pendingProjects.length > 0;

  function statusBadge(status: string) {
    if (status === 'published') return <span className="k-badge k-badge-violet">{t.projects.status.published}</span>;
    if (status === 'in_progress') return <span className="k-badge k-badge-green">{t.projects.status.in_progress}</span>;
    if (status === 'completed') return <span className="k-badge k-badge-white">{t.projects.status.completed}</span>;
    if (status === 'cancelled') return <span className="k-badge k-badge-red">{t.projects.status.cancelled}</span>;
    return <span className="k-badge">{status}</span>;
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="k-page">
      <div className="k-page-inner">
        <FeedbackBanner projects={pendingProjects} />

        {/* Greeting */}
        <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid #1A1A1A' }}>
          <p className="k-section-label mb-3">{today}</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#F0F0F0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {profile?.organization_name ?? profile?.name ?? 'BDE'}
            </h1>
            <span className="k-badge k-badge-violet">BDE</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1A1A1A', border: '1px solid #1A1A1A', marginBottom: '40px' }}>
          {[
            { label: t.bde.dashboard.stats.created, value: totalProjects, color: '#7C3AED' },
            { label: t.bde.dashboard.stats.active, value: activeProjects, color: '#00FF66' },
            { label: t.bde.dashboard.stats.completed, value: completedProjects, color: '#F0F0F0' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#000', padding: '24px 28px' }}>
              <p className="k-section-label mb-4" style={{ whiteSpace: 'nowrap' }}>{stat.label}</p>
              <p style={{ fontSize: '40px', fontWeight: 700, color: stat.color, lineHeight: 1, letterSpacing: '-0.03em', fontFamily: 'Inter, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: '40px' }}>
          <p className="k-section-label mb-4">{t.bde.dashboard.quickActions}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1A1A1A', border: '1px solid #1A1A1A' }}>
            {hasPendingFeedback ? (
              <div style={{ background: '#000', padding: '24px', opacity: 0.35, cursor: 'not-allowed' }}>
                <p className="k-section-label mb-4">{t.bde.dashboard.actions.createProject.num}</p>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F0F0F0', marginBottom: '8px' }}>{t.bde.dashboard.actions.createProject.title}</h3>
                <p style={{ fontSize: '12px', color: '#555', marginBottom: '12px' }}>{t.bde.dashboard.actions.createProject.desc}</p>
                <p style={{ fontSize: '10px', color: '#FF0055', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.bde.dashboard.actions.createProject.blocked}</p>
              </div>
            ) : (
              <Link
                href="/bde/create-project"
                style={{ background: '#000', padding: '24px', textDecoration: 'none', display: 'block', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0A0A0A')}
                onMouseLeave={e => (e.currentTarget.style.background = '#000')}
              >
                <p className="k-section-label mb-4">{t.bde.dashboard.actions.createProject.num}</p>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F0F0F0', marginBottom: '8px' }}>{t.bde.dashboard.actions.createProject.title}</h3>
                <p style={{ fontSize: '12px', color: '#555' }}>{t.bde.dashboard.actions.createProject.desc}</p>
              </Link>
            )}

            <Link
              href="/rental/manage"
              style={{ background: '#000', padding: '24px', textDecoration: 'none', display: 'block', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A0A0A')}
              onMouseLeave={e => (e.currentTarget.style.background = '#000')}
            >
              <p className="k-section-label mb-4">{t.bde.dashboard.actions.manageRentals.num}</p>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F0F0F0', marginBottom: '8px' }}>{t.bde.dashboard.actions.manageRentals.title}</h3>
              <p style={{ fontSize: '12px', color: '#555' }}>{t.bde.dashboard.actions.manageRentals.desc}</p>
            </Link>

            <Link
              href="/rental"
              style={{ background: '#000', padding: '24px', textDecoration: 'none', display: 'block', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0A0A0A')}
              onMouseLeave={e => (e.currentTarget.style.background = '#000')}
            >
              <p className="k-section-label mb-4">{t.bde.dashboard.actions.browseEquipment.num}</p>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F0F0F0', marginBottom: '8px' }}>{t.bde.dashboard.actions.browseEquipment.title}</h3>
              <p style={{ fontSize: '12px', color: '#555' }}>{t.bde.dashboard.actions.browseEquipment.desc}</p>
            </Link>
          </div>
        </div>

        {/* Projects list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p className="k-section-label">{t.bde.dashboard.recentProjects}</p>
            {projects.length > 0 && (
              <Link href="/bde/projects" style={{ fontSize: '10px', color: '#7C3AED', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}>
                {t.bde.dashboard.viewAll}
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <div style={{ border: '1px solid #1A1A1A', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#333', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>{t.bde.dashboard.noProjects}</p>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>
                {t.bde.dashboard.noProjectsDesc}
              </p>
              {!hasPendingFeedback && (
                <Link href="/bde/create-project" className="k-btn">
                  {t.bde.dashboard.createProject}
                </Link>
              )}
            </div>
          ) : (
            <div style={{ border: '1px solid #1A1A1A' }}>
              {projects.map((project, index) => (
                <Link
                  key={project.id}
                  href={`/bde/projects/${project.id}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    borderBottom: index < projects.length - 1 ? '1px solid #1A1A1A' : 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#0A0A0A')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F0F0F0', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.title}
                      </p>
                      <p style={{ fontSize: '11px', color: '#444' }}>
                        {project.type}{project.location ? ` — ${project.location}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      {statusBadge(project.status)}
                      <span style={{ fontSize: '11px', color: '#444', whiteSpace: 'nowrap' }}>
                        {new Date(project.start_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
