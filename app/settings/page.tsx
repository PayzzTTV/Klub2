'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    organization_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFormData({
          name: data.name || '',
          organization_name: data.organization_name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
        });
      }
      setPageLoading(false);
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          organization_name: formData.organization_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
        })
        .eq('id', user.id);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="k-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="k-spinner" />
      </div>
    );
  }

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #333',
    padding: '10px 0',
    color: '#F0F0F0',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const disabledInputStyle = {
    ...inputStyle,
    color: '#444',
    cursor: 'not-allowed',
  };

  return (
    <div className="k-page">
      <div className="k-page-inner" style={{ maxWidth: '700px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid #1A1A1A' }}>
          <p className="k-section-label mb-3">Compte</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#F0F0F0', letterSpacing: '-0.02em' }}>
              Paramètres
            </h1>
            <Link
              href="/profile"
              style={{ fontSize: '10px', color: '#555', textDecoration: 'none', letterSpacing: '0.08em' }}
            >
              ← Voir mon profil
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Section Identité */}
          <div style={{ marginBottom: '40px' }}>
            <p className="k-section-label mb-6">Identité</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F0F0F0', display: 'block', marginBottom: '8px' }}>
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = '#333')}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F0F0F0', display: 'block', marginBottom: '8px' }}>
                  Organisation
                </label>
                <input
                  type="text"
                  value={formData.organization_name}
                  onChange={e => setFormData({ ...formData, organization_name: e.target.value })}
                  style={inputStyle}
                  placeholder="BDE / Asso..."
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = '#333')}
                />
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div style={{ marginBottom: '40px', paddingTop: '32px', borderTop: '1px solid #1A1A1A' }}>
            <p className="k-section-label mb-6">Contact</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '8px' }}>
                  Email (non modifiable)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  style={disabledInputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F0F0F0', display: 'block', marginBottom: '8px' }}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={inputStyle}
                  placeholder="+33 6 12 34 56 78"
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = '#333')}
                />
              </div>
              <div style={{ gridColumn: '2 / 4' }}>
                <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F0F0F0', display: 'block', marginBottom: '8px' }}>
                  Localisation
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  style={inputStyle}
                  placeholder="Paris, France"
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = '#333')}
                />
              </div>
            </div>
          </div>

          {/* Section Bio */}
          <div style={{ marginBottom: '40px', paddingTop: '32px', borderTop: '1px solid #1A1A1A' }}>
            <p className="k-section-label mb-6">À propos</p>
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F0F0F0', display: 'block', marginBottom: '8px' }}>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                style={{
                  ...inputStyle,
                  borderBottom: 'none',
                  border: '1px solid #333',
                  padding: '12px',
                  resize: 'none',
                  lineHeight: 1.6,
                }}
                placeholder="Décrivez votre organisation, votre activité..."
                onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                onBlur={e => (e.currentTarget.style.borderColor = '#333')}
              />
              <p style={{ fontSize: '11px', color: '#333', marginTop: '6px' }}>{formData.bio.length} / 500 caractères</p>
            </div>
          </div>

          {/* Feedback + Actions */}
          <div style={{ paddingTop: '32px', borderTop: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              {saved && (
                <p style={{ fontSize: '12px', color: '#00FF66', letterSpacing: '0.06em' }}>
                  Profil mis à jour
                </p>
              )}
              {error && (
                <p style={{ fontSize: '12px', color: '#FF0055', letterSpacing: '0.06em' }}>
                  {error}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  background: 'none', border: '1px solid #2A2A2A', color: '#A0A0A0',
                  padding: '10px 20px', fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#555')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#7C3AED', border: 'none', color: '#fff',
                  padding: '10px 24px', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: loading ? 0.6 : 1, transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#6D28D9'; }}
                onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#7C3AED'; }}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
