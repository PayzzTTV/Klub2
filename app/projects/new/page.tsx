'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { ProjectType } from '@/types';

const PROJECT_TYPES: ProjectType[] = [
  'Gala',
  'Soirée',
  'Festival',
  'Conférence',
  'Concert',
  'Compétition',
  'Autre',
];

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'Gala' as ProjectType,
    budget: '',
    capacity: '',
    location: '',
    description: '',
    requirements: '',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Vérifier que l'utilisateur peut poster un projet
      const { data: canPost } = await supabase.rpc('can_post_new_project', {
        bde_uuid: user.id,
      });

      if (!canPost) {
        setError(
          'Vous devez d\'abord donner votre feedback sur vos projets terminés avant de créer un nouveau projet.'
        );
        setLoading(false);
        return;
      }

      const projectData = {
        bde_id: user.id,
        title: formData.title,
        type: formData.type,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        location: formData.location,
        description: formData.description,
        requirements: formData.requirements || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: publish ? 'published' : 'draft',
      };

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/projects/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard/bde">
            <h1 className="text-2xl font-bold tracking-tighter cursor-pointer">
              <span className="text-white">←</span>{' '}
              <span className="text-white">K</span>
              <span className="text-[#7C3AED]">L</span>
              <span className="text-white">UB</span>
            </h1>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Créer un projet</h1>
          <p className="text-[#A0A0A0]">
            Décrivez votre événement pour trouver les meilleurs prestataires
          </p>
        </div>

        <form className="space-y-8">
          {error && (
            <div className="bg-[#FF0055]/10 border border-[#FF0055] p-4 rounded">
              <p className="text-[#FF0055]">{error}</p>
            </div>
          )}

          {/* Informations de base */}
          <div className="brutalist-card p-8">
            <h2 className="text-xl font-bold mb-6">Informations de base</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Titre du projet *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Gala de fin d'année 2026"
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-2">
                    Type d'événement *
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as ProjectType })
                    }
                    required
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                  >
                    {PROJECT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-2">
                    Lieu *
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="Ex: Paris, France"
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium mb-2">
                    Budget (€)
                  </label>
                  <input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="Ex: 15000"
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium mb-2">
                    Capacité (personnes)
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Ex: 500"
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium mb-2">
                    Date de début *
                  </label>
                  <input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium mb-2">
                    Date de fin *
                  </label>
                  <input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="brutalist-card p-8">
            <h2 className="text-xl font-bold mb-6">Description détaillée</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description de l'événement *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  placeholder="Décrivez votre événement en détail : thème, déroulement, ambiance recherchée..."
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium mb-2">
                  Besoins spécifiques
                </label>
                <textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  placeholder="Ex: Système son professionnel, éclairage LED, DJ, catering..."
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="brutalist-button px-8 py-3 font-semibold disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer en brouillon'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="brutalist-button-primary px-8 py-3 font-semibold disabled:opacity-50 flex-1"
            >
              {loading ? 'Publication...' : 'Publier le projet'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
