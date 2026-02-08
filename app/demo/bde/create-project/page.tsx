'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createProject } from '@/lib/utils/projects';

export default function DemoCreateProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Gala',
    budget: '',
    capacity: '',
    location: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  const projectTypes = ['Gala', 'Soirée', 'Festival', 'Conférence', 'Autre'];

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!isDemo && currentUserId) {
      // Production mode: Save to Supabase
      console.log('Form data before parsing:', formData);

      const projectData = {
        title: formData.title,
        type: formData.type as any,
        budget: parseFloat(formData.budget),
        capacity: parseInt(formData.capacity),
        location: formData.location,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      console.log('Parsed project data:', projectData);
      console.log('Budget:', projectData.budget, 'Capacity:', projectData.capacity);

      const newProject = await createProject(supabase, currentUserId, projectData);

      if (newProject) {
        alert('✅ Projet créé avec succès !');
        router.push(`/demo/projects/${newProject.id}`);
      } else {
        alert('❌ Erreur lors de la création du projet. Vérifiez vos permissions.');
        setSubmitting(false);
      }
    } else {
      // Demo mode: Just show alert
      alert('Mode Démo : Le projet a été créé avec succès ! (Données non enregistrées)');
      setSubmitting(false);
      router.push('/demo/bde/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter">
            <span className="text-white">K</span>
            <span className="text-[#7C3AED]">L</span>
            <span className="text-white">UB</span>
            {isDemo && <span className="text-sm text-[#A0A0A0] ml-4">(Mode Démo)</span>}
          </h1>
          <Link href="/demo" className="text-sm text-[#A0A0A0] hover:text-white">
            ← Retour
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Créer un Projet</h1>
          <p className="text-[#A0A0A0]">Postez votre événement et trouvez les meilleurs prestataires</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold mb-2">Titre du projet *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
              placeholder="Ex: Gala de fin d'année 2026"
              required
            />
          </div>

          {/* Type et Budget */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Type d&apos;événement *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Budget estimé (€) *</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                placeholder="15000"
                min="0"
                required
              />
            </div>
          </div>

          {/* Capacité et Lieu */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Capacité attendue *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                placeholder="500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Lieu *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                placeholder="Paris, France"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Date de début *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Date de fin *</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED] min-h-[150px]"
              placeholder="Décrivez votre événement, vos besoins en prestataires, matériel requis..."
              required
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="brutalist-button-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Création en cours...' : 'Publier le projet'}
            </button>
            <Link
              href="/demo/bde/dashboard"
              className="brutalist-button px-8 py-3 inline-block"
            >
              Annuler
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
