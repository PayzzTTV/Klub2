'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

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
    }

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

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

      setMessage('✅ Profil mis à jour avec succès !');
      setTimeout(() => router.push('/profile'), 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('❌ Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-[#A0A0A0]">Modifiez vos informations</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div className="brutalist-card p-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-white px-4 py-3 focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {/* Organisation */}
          <div className="brutalist-card p-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Organisation
            </label>
            <input
              type="text"
              value={formData.organization_name}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-white px-4 py-3 focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {/* Email (readonly) */}
          <div className="brutalist-card p-6">
            <label className="block text-sm font-semibold text-[#A0A0A0] mb-2">
              Email (non modifiable)
            </label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-[#A0A0A0] px-4 py-3 cursor-not-allowed"
            />
          </div>

          {/* Téléphone */}
          <div className="brutalist-card p-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-white px-4 py-3 focus:outline-none focus:border-[#7C3AED] transition-colors"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          {/* Localisation */}
          <div className="brutalist-card p-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Localisation
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-white px-4 py-3 focus:outline-none focus:border-[#7C3AED] transition-colors"
              placeholder="Paris, France"
            />
          </div>

          {/* Bio */}
          <div className="brutalist-card p-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-white px-4 py-3 focus:outline-none focus:border-[#7C3AED] transition-colors resize-none"
              placeholder="Parlez-nous de vous..."
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`brutalist-card p-4 ${
              message.startsWith('✅')
                ? 'border-[#00FF66] bg-[#00FF66]/10 text-[#00FF66]'
                : 'border-[#FF0055] bg-[#FF0055]/10 text-[#FF0055]'
            }`}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="brutalist-button-primary px-6 py-3 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="brutalist-button px-6 py-3"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
