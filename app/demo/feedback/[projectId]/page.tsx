'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import StarRating from '@/components/ui/StarRating';

export default function DemoFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  // Mock project data
  const mockProjects: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Gala de fin d\'année 2026',
      orgaName: 'SoundTech Events',
      orgaId: 'orga-1',
      completedDate: '2026-01-25',
    },
  };

  const project = mockProjects[projectId] || mockProjects['1'];

  const [ratings, setRatings] = useState({
    punctuality: 0,
    quality: 0,
    communication: 0,
    value: 0,
    global: 0,
  });

  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (ratings.punctuality === 0 || ratings.quality === 0 ||
        ratings.communication === 0 || ratings.value === 0 || ratings.global === 0) {
      alert('Veuillez noter tous les critères');
      return;
    }

    if (comment.trim().length < 10) {
      alert('Veuillez ajouter un commentaire (minimum 10 caractères)');
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      alert('✅ Feedback envoyé avec succès!\n\nVous pouvez maintenant créer de nouveaux projets.');
      router.push('/demo/bde/dashboard');
    }, 1000);
  };

  const averageRating = (
    (ratings.punctuality + ratings.quality + ratings.communication + ratings.value + ratings.global) / 5
  ).toFixed(1);

  const canSubmit =
    ratings.punctuality > 0 &&
    ratings.quality > 0 &&
    ratings.communication > 0 &&
    ratings.value > 0 &&
    ratings.global > 0 &&
    comment.trim().length >= 10;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/demo/bde/dashboard" className="text-2xl font-bold">
            ← KLUB
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Warning Banner */}
        <div className="brutalist-card bg-[#FF0055]/10 border-[#FF0055] p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div>
              <h2 className="text-xl font-bold text-[#FF0055] mb-2">
                Feedback Obligatoire
              </h2>
              <p className="text-sm text-[#A0A0A0]">
                Vous devez évaluer <strong className="text-white">{project.orgaName}</strong> avant de pouvoir créer un nouveau projet.
                Votre feedback aide la communauté à maintenir un niveau de qualité élevé.
              </p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="brutalist-card p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
              <p className="text-sm text-[#A0A0A0]">
                Organisé par <strong className="text-white">{project.orgaName}</strong>
              </p>
            </div>
            <span className="px-4 py-2 bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66] rounded text-sm font-semibold">
              ✓ TERMINÉ
            </span>
          </div>
          <div className="text-sm text-[#A0A0A0]">
            Date de fin: {new Date(project.completedDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Criteria */}
          <div className="brutalist-card p-6">
            <h2 className="text-xl font-bold mb-6">Évaluation de la Prestation</h2>

            <div className="space-y-6">
              {/* Ponctualité */}
              <div className="pb-6 border-b border-[#1A1A1A]">
                <StarRating
                  label="Ponctualité"
                  value={ratings.punctuality}
                  onChange={(value) => setRatings({ ...ratings, punctuality: value })}
                />
                <p className="text-xs text-[#A0A0A0] mt-2">
                  Respect des horaires, livraison dans les délais
                </p>
              </div>

              {/* Qualité */}
              <div className="pb-6 border-b border-[#1A1A1A]">
                <StarRating
                  label="Qualité du Service"
                  value={ratings.quality}
                  onChange={(value) => setRatings({ ...ratings, quality: value })}
                />
                <p className="text-xs text-[#A0A0A0] mt-2">
                  Professionnalisme, qualité du matériel et de l&apos;exécution
                </p>
              </div>

              {/* Communication */}
              <div className="pb-6 border-b border-[#1A1A1A]">
                <StarRating
                  label="Communication"
                  value={ratings.communication}
                  onChange={(value) => setRatings({ ...ratings, communication: value })}
                />
                <p className="text-xs text-[#A0A0A0] mt-2">
                  Réactivité, clarté des échanges, disponibilité
                </p>
              </div>

              {/* Rapport Qualité/Prix */}
              <div className="pb-6 border-b border-[#1A1A1A]">
                <StarRating
                  label="Rapport Qualité/Prix"
                  value={ratings.value}
                  onChange={(value) => setRatings({ ...ratings, value: value })}
                />
                <p className="text-xs text-[#A0A0A0] mt-2">
                  Adéquation entre le prix et la prestation fournie
                </p>
              </div>

              {/* Note Globale */}
              <div>
                <StarRating
                  label="Note Globale"
                  value={ratings.global}
                  onChange={(value) => setRatings({ ...ratings, global: value })}
                />
                <p className="text-xs text-[#A0A0A0] mt-2">
                  Votre satisfaction générale
                </p>
              </div>
            </div>

            {/* Average Display */}
            {averageRating !== '0.0' && (
              <div className="mt-6 pt-6 border-t border-[#1A1A1A]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#A0A0A0]">
                    Moyenne Calculée
                  </span>
                  <span className="text-2xl font-bold text-[#7C3AED]">
                    {averageRating}/5
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="brutalist-card p-6">
            <h2 className="text-xl font-bold mb-4">Commentaire</h2>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Partagez votre expérience *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED] min-h-[150px]"
                placeholder="Décrivez votre expérience avec cet organisateur. Qu'est-ce qui s'est bien passé ? Y a-t-il des points à améliorer ?"
                required
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#A0A0A0]">
                  Minimum 10 caractères
                </p>
                <span className={`text-xs font-semibold ${
                  comment.length >= 10 ? 'text-[#00FF66]' : 'text-[#A0A0A0]'
                }`}>
                  {comment.length} caractères
                </span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Link
              href="/demo/bde/dashboard"
              className="brutalist-button px-6 py-3 flex-1 text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`brutalist-button-primary px-6 py-3 flex-1 ${
                !canSubmit || submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Envoi en cours...' : 'Envoyer le Feedback'}
            </button>
          </div>

          {!canSubmit && (
            <p className="text-sm text-[#FF0055] text-center">
              Veuillez remplir tous les critères et ajouter un commentaire
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
