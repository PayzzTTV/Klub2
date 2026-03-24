'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createProject } from '@/lib/utils/projects';
import { useToast } from '@/lib/hooks/useToast';

export default function DemoCreateProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast, ToastContainer } = useToast();
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        toast.success('Projet créé avec succès !');
        router.push(`/projects/${newProject.id}`);
      } else {
        toast.error('Erreur lors de la création du projet. Vérifiez vos permissions.');
        setSubmitting(false);
      }
    } else {
      // Demo mode: Just show toast
      toast.info('Mode Démo : Le projet a été créé avec succès !');
      setSubmitting(false);
      router.push('/bde/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] py-12 px-4">
      <div className="max-w-7xl mx-auto">
      
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
              href="/bde/dashboard"
              className="brutalist-button px-8 py-3 inline-block"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
