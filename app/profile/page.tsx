'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type UserProfile = {
  id: string;
  role: 'BDE' | 'ORGA';
  name: string;
  organization_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) { setProfile(data as UserProfile); }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="k-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="k-spinner" />
      </div>
    );
  }

  if (!profile) return null;

  const initial = profile.name.charAt(0).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const isActive = profile.role === 'BDE';

  return (
    <div className="k-page">
      <div className="k-page-inner">

        {/* Header */}
        <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid #1A1A1A' }}>
          <p className="k-section-label mb-3">Mon compte</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#F0F0F0', letterSpacing: '-0.02em' }}>
              Mon Profil
            </h1>
            <Link
              href="/settings"
              style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#F0F0F0', textDecoration: 'none', border: '1px solid #2A2A2A',
                padding: '8px 16px', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#7C3AED')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
            >
              Modifier →
            </Link>
          </div>
        </div>

        {/* Avatar + identité */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'start', marginBottom: '40px' }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', background: '#7C3AED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {initial}
          </div>

          {/* Info principale */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F0F0F0', letterSpacing: '-0.02em' }}>
                {profile.name}
              </h2>
              <span
                style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '3px 8px', border: `1px solid ${isActive ? '#7C3AED' : '#00FF66'}`,
                  color: isActive ? '#7C3AED' : '#00FF66',
                }}
              >
                {profile.role}
              </span>
            </div>
            {profile.organization_name && (
              <p style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '4px' }}>{profile.organization_name}</p>
            )}
            <p style={{ fontSize: '11px', color: '#444', letterSpacing: '0.06em' }}>Membre depuis {memberSince}</p>
          </div>
        </div>

        {/* Infos grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: '#1A1A1A', border: '1px solid #1A1A1A', marginBottom: '40px' }}>
          {[
            { label: 'Email', value: profile.email },
            { label: 'Téléphone', value: profile.phone || '—' },
            { label: 'Localisation', value: profile.location || '—' },
            { label: 'Rôle', value: profile.role },
          ].map((item) => (
            <div key={item.label} style={{ background: '#000', padding: '20px 24px' }}>
              <p className="k-section-label mb-2">{item.label}</p>
              <p style={{ fontSize: '14px', color: item.value === '—' ? '#333' : '#F0F0F0', fontWeight: 500 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div style={{ border: '1px solid #1A1A1A', padding: '24px', marginBottom: '40px' }}>
            <p className="k-section-label mb-3">Bio</p>
            <p style={{ fontSize: '14px', color: '#F0F0F0', lineHeight: 1.7 }}>{profile.bio}</p>
          </div>
        )}

      </div>
    </div>
  );
}
