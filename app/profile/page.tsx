'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data as UserProfile);
      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#A0A0A0]">Chargement...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mon Profil</h1>
          <p className="text-[#A0A0A0]">Gérez vos informations personnelles</p>
        </div>

        {/* Avatar & Info principale */}
        <div className="brutalist-card p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#00FF66] flex items-center justify-center text-white font-bold text-4xl">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <span className={`px-3 py-1 text-xs font-bold border ${
                  profile.role === 'BDE'
                    ? 'border-[#7C3AED] text-[#7C3AED] bg-[#7C3AED]/10'
                    : 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10'
                }`}>
                  {profile.role}
                </span>
              </div>

              {profile.organization_name && (
                <p className="text-[#A0A0A0] mb-4">{profile.organization_name}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#A0A0A0]">Email:</span>
                  <p className="text-white font-medium">{profile.email}</p>
                </div>

                {profile.phone && (
                  <div>
                    <span className="text-[#A0A0A0]">Téléphone:</span>
                    <p className="text-white font-medium">{profile.phone}</p>
                  </div>
                )}

                {profile.location && (
                  <div>
                    <span className="text-[#A0A0A0]">Localisation:</span>
                    <p className="text-white font-medium">{profile.location}</p>
                  </div>
                )}

                <div>
                  <span className="text-[#A0A0A0]">Membre depuis:</span>
                  <p className="text-white font-medium">
                    {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-[#1A1A1A]">
              <h3 className="text-sm font-semibold text-[#A0A0A0] mb-2">Bio</h3>
              <p className="text-white">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/settings')}
            className="brutalist-button-primary px-6 py-3"
          >
            ✏️ Modifier mon profil
          </button>

          <button
            onClick={() => router.back()}
            className="brutalist-button px-6 py-3"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
}
