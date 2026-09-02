'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getPublishedProjects, ProjectWithProfile } from '@/lib/utils/projects';

export default function DemoProjectsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<ProjectWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
  });

  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'capacity'>('date');

  const projectTypes = ['all', 'Gala', 'Soirée', 'Festival', 'Conférence', 'Autre'];

  // Load projects from Supabase
  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const supabaseProjects = await getPublishedProjects(supabase, {
        type: filters.type,
        search: ''
      });
      setProjects(supabaseProjects || []);
      setLoading(false);
    }

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, router]); // Only reload when type filter changes

  // Client-side filtering and sorting
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = filters.search === '' ||
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesBudgetMin = filters.budgetMin === '' || (project.budget && project.budget >= Number(filters.budgetMin));
      const matchesBudgetMax = filters.budgetMax === '' || (project.budget && project.budget <= Number(filters.budgetMax));
      const matchesLocation = filters.location === '' ||
        project.location.toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesBudgetMin && matchesBudgetMax && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      } else if (sortBy === 'budget') {
        return (b.budget || 0) - (a.budget || 0);
      } else if (sortBy === 'capacity') {
        return (b.capacity || 0) - (a.capacity || 0);
      }
      return 0;
    });

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.location || filters.budgetMin || filters.budgetMax;

  return (
    <div className="k-page">
      <div className="k-page-inner">

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <div className="k-section-label" style={{ marginBottom: '0.75rem' }}>Marketplace</div>
            <h1
              className="k-neon"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: '#E8E8E8',
                lineHeight: 1,
              }}
            >
              Projets
            </h1>
          </div>
          {!loading && (
            <div style={{ textAlign: 'right', paddingTop: '0.25rem' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#7C3AED',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {filteredProjects.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#F0F0F0', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
                résultats
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <div className="k-spinner" />
          </div>
        )}

        {!loading && (
          <>
            {/* Filter bar */}
            <div
              style={{
                borderBottom: '1px solid #222',
                paddingBottom: '1.25rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto auto auto',
                gap: '1rem',
                alignItems: 'end',
              }}
            >
              {/* Search */}
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.4rem' }}>
                  Rechercher
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="k-input"
                  style={{ width: '100%' }}
                  placeholder="Titre, description, ville..."
                />
              </div>

              {/* Location */}
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.4rem' }}>
                  Ville
                </div>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="k-input"
                  style={{ width: '100%' }}
                  placeholder="Paris, Lyon..."
                />
              </div>

              {/* Budget min */}
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.4rem' }}>
                  Budget min
                </div>
                <input
                  type="number"
                  value={filters.budgetMin}
                  onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
                  className="k-input"
                  style={{ width: '7rem' }}
                  placeholder="5000"
                />
              </div>

              {/* Budget max */}
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.4rem' }}>
                  Budget max
                </div>
                <input
                  type="number"
                  value={filters.budgetMax}
                  onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                  className="k-input"
                  style={{ width: '7rem' }}
                  placeholder="50000"
                />
              </div>

              {/* Sort */}
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.4rem' }}>
                  Trier
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'budget' | 'capacity')}
                  className="k-select"
                  style={{ width: '10rem' }}
                >
                  <option value="date">Date</option>
                  <option value="budget">Budget</option>
                  <option value="capacity">Capacité</option>
                </select>
              </div>
            </div>

            {/* Type filter pills */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {projectTypes.map((type) => {
                const isActive = filters.type === type;
                return (
                  <button
                    key={type}
                    onClick={() => setFilters({ ...filters, type })}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #7C3AED' : '2px solid transparent',
                      color: isActive ? '#F0F0F0' : '#A0A0A0',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 400,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '0.4rem 1rem',
                      cursor: 'pointer',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#F0F0F0';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#A0A0A0';
                    }}
                  >
                    {type === 'all' ? 'Tous' : type}
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  onClick={() => setFilters({ type: 'all', search: '', budgetMin: '', budgetMax: '', location: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: '2px solid transparent',
                    color: '#FF0055',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    padding: '0.4rem 1rem',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                    transition: 'color 0.15s',
                  }}
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Empty state */}
            {filteredProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <div
                  style={{
                    fontSize: '6rem',
                    fontWeight: 800,
                    color: '#111',
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    marginBottom: '1rem',
                  }}
                >
                  0
                </div>
                <div style={{ fontSize: '0.85rem', color: '#F0F0F0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Aucun projet ne correspond à vos critères
                </div>
              </div>
            ) : (
              /* Projects grid */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1px',
                  background: '#111',
                }}
              >
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="k-card"
                    style={{ background: '#000' }}
                  >
                    {/* Top row: title + type badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: '#E8E8E8',
                            letterSpacing: '-0.02em',
                            marginBottom: '0.2rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {project.title}
                        </h3>
                        <div style={{ fontSize: '0.7rem', color: '#F0F0F0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {project.bde_profile?.organization_name || project.bde_profile?.name || 'BDE'}
                        </div>
                      </div>
                      <span className="k-badge k-badge-violet" style={{ flexShrink: 0 }}>
                        {project.type}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#E8E8E8',
                        lineHeight: 1.55,
                        marginBottom: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {project.description}
                    </p>

                    <hr className="k-divider" style={{ marginBottom: '1.25rem' }} />

                    {/* Metadata grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem 1.5rem',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.2rem' }}>
                          Budget
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00FF66' }}>
                          {project.budget?.toLocaleString('fr-FR') || '0'} €
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.2rem' }}>
                          Capacité
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8' }}>
                          {project.capacity || 0} pers.
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.2rem' }}>
                          Lieu
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8' }}>
                          {project.location}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#F0F0F0', marginBottom: '0.2rem' }}>
                          Date
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8' }}>
                          {new Date(project.start_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link
                        href={`/projects/${project.id}/apply`}
                        className="k-btn"
                        style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'block' }}
                      >
                        Candidater
                      </Link>
                      <Link
                        href={`/projects/${project.id}`}
                        className="k-btn-ghost"
                        style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '0 1.25rem' }}
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
