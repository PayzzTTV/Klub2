'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProjectById } from '@/lib/utils/projects';
import { createApplication } from '@/lib/utils/projects';
import type { Project } from '@/types';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    proposedPrice: '',
    message: '',
  });

  // Check authentication and load project
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }

      setCurrentUserId(user.id);

      // Check if user is ORGA (only ORGA can apply)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'ORGA') {
        setError('Seuls les Orgas peuvent postuler aux projets.');
        setLoading(false);
        return;
      }

      // Load project
      const projectData = await getProjectById(supabase, projectId);
      if (projectData) {
        setProject(projectData);
      } else {
        setError('Projet non trouvé');
      }

      setLoading(false);
    }

    loadData();
  }, [supabase, projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!currentUserId) {
      setError('Vous devez être connecté pour postuler');
      setSubmitting(false);
      return;
    }

    const proposedPrice = parseFloat(formData.proposedPrice);
    if (isNaN(proposedPrice) || proposedPrice < 0) {
      setError('Le prix proposé doit être un nombre positif');
      setSubmitting(false);
      return;
    }

    if (!formData.message.trim()) {
      setError('Le message de motivation est requis');
      setSubmitting(false);
      return;
    }

    // Create application in Supabase
    const application = await createApplication(
      supabase,
      currentUserId,
      projectId,
      proposedPrice,
      formData.message
    );

    if (application) {
      alert('✅ Candidature envoyée avec succès !');
      router.push(`/demo/projects/${projectId}`);
    } else {
      setError('Erreur lors de l\'envoi de la candidature. Vous avez peut-être déjà postulé à ce projet.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED] mx-auto mb-4"></div>
          <p className="text-[#A0A0A0]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{error}</h1>
          <Link href="/demo/projects" className="text-[#7C3AED] hover:underline">
            ← Retour aux projets
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Projet non trouvé</h1>
          <Link href="/demo/projects" className="text-[#7C3AED] hover:underline">
            ← Retour aux projets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter">
            <span className="text-white">K</span>
            <span className="text-[#7C3AED]">L</span>
            <span className="text-white">UB</span>
          </h1>
          <Link href={`/demo/projects/${projectId}`} className="text-sm text-[#A0A0A0] hover:text-white">
            ← Retour
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Candidater au projet</h1>
          <p className="text-xl text-[#A0A0A0]">{project.title}</p>
        </div>

        {error && (
          <div className="brutalist-card p-4 mb-6 bg-[#FF0055]/10 border-[#FF0055]">
            <p className="text-[#FF0055]">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Prix proposé */}
            <div className="brutalist-card p-6">
              <h2 className="text-xl font-bold mb-4">Votre Proposition</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Prix proposé (€) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.proposedPrice}
                    onChange={(e) => setFormData({ ...formData, proposedPrice: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                    placeholder="5000"
                    min="0"
                    step="0.01"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]">€</span>
                </div>
                {project.budget && (
                  <p className="text-xs text-[#A0A0A0] mt-2">
                    Budget du BDE : {project.budget.toLocaleString('fr-FR')} €
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Message de motivation *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED] min-h-[200px]"
                  placeholder="Présentez votre expertise, vos références et pourquoi vous êtes le meilleur choix pour ce projet..."
                  required
                />
                <p className="text-xs text-[#A0A0A0] mt-2">
                  Décrivez votre expérience, le matériel dont vous disposez, votre équipe, etc.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="brutalist-button-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Envoi en cours...' : 'Envoyer la candidature'}
              </button>
              <Link
                href={`/demo/projects/${projectId}`}
                className="brutalist-button px-8 py-3 inline-block"
              >
                Annuler
              </Link>
            </div>
          </form>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <div className="brutalist-card p-6">
              <h3 className="text-lg font-bold mb-4">💡 Conseils</h3>
              <ul className="space-y-3 text-sm text-[#A0A0A0]">
                <li className="flex gap-2">
                  <span className="text-[#7C3AED]">•</span>
                  <span>Proposez un prix compétitif mais réaliste</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#7C3AED]">•</span>
                  <span>Mettez en avant vos expériences similaires</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#7C3AED]">•</span>
                  <span>Soyez précis sur le matériel fourni</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#7C3AED]">•</span>
                  <span>Montrez votre motivation et votre professionnalisme</span>
                </li>
              </ul>
            </div>

            <div className="brutalist-card p-6 bg-[#7C3AED]/10 border-[#7C3AED]/30">
              <h3 className="text-sm font-bold mb-2">📋 Informations</h3>
              <p className="text-xs text-[#A0A0A0]">
                Votre candidature sera visible par le BDE. Vous recevrez une notification si elle est acceptée.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
