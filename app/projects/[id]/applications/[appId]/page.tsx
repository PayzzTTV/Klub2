'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ApplicationDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const appId = params.appId as string;

  // Mock data détaillée pour les candidatures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockApplications: Record<string, any> = {
    '1': {
      id: '1',
      projectId: '1',
      projectTitle: 'Gala de fin d\'année 2026',
      orgaName: 'SoundTech Events',
      orgaAvatar: '🎵',
      orgaRating: 4.8,
      orgaReviews: 15,
      orgaCompletedProjects: 23,
      proposedPrice: 5000,
      message: 'Nous avons 10 ans d\'expérience dans les galas étudiants. Notre équipe saura répondre à vos besoins avec professionnalisme et créativité. Nous mettons un point d\'honneur à créer des expériences inoubliables.',
      date: '2026-01-20',

      // Détails supplémentaires
      availableEquipment: '- Système son professionnel 15kW\n- Table de mixage numérique 32 canaux\n- 8 micros sans-fil premium\n- Enceintes line array pour 500+ personnes\n- Retours de scène\n- Câblage complet',

      experience: 'Nos références récentes :\n\n• Gala ESSEC 2025 (600 personnes) - Note 5/5\n• Soirée HEC Paris 2025 (450 personnes) - Note 4.9/5\n• Festival Campus EDHEC (800 personnes) - Note 4.8/5\n• Gala Polytechnique 2024 (700 personnes) - Note 5/5\n\nPlus de 50 événements étudiants réalisés avec succès.',

      proposedVenue: 'Le Grand Palais des Fêtes',
      venueCapacity: 600,
      venueAddress: '15 Avenue des Champs-Élysées, 75008 Paris',

      teamSize: 8,
      portfolio: 'https://soundtech-events.com',

      photos: [
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      ],

      certifications: ['ISO 9001', 'Sonorisation événementielle', 'Sécurité ERP'],

      timeline: [
        { date: '2026-01-20', event: 'Candidature envoyée' },
        { date: '2026-01-21', event: 'Profil consulté par le BDE' },
      ],
    },
    '2': {
      id: '2',
      projectId: '1',
      projectTitle: 'Gala de fin d\'année 2026',
      orgaName: 'LightShow Pro',
      orgaAvatar: '💡',
      orgaRating: 4.6,
      orgaReviews: 12,
      orgaCompletedProjects: 18,
      proposedPrice: 4500,
      message: 'Spécialisés en éclairage événementiel, nous avons déjà travaillé avec plusieurs BDE de grandes écoles.',
      date: '2026-01-18',

      availableEquipment: '- 20 projecteurs LED RGB\n- Console lumière DMX\n- Effets spéciaux (fumée, stroboscope)\n- Structure et câblage',

      experience: 'Plus de 30 événements réalisés depuis 2020.\n\nSpécialisation : éclairage scénique et ambiance pour galas et concerts.',

      proposedVenue: '',
      venueCapacity: 0,
      venueAddress: '',

      teamSize: 5,
      portfolio: 'https://lightshow-pro.fr',

      photos: [
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      ],

      certifications: ['Électricien qualifié', 'Habilitation électrique'],

      timeline: [
        { date: '2026-01-18', event: 'Candidature envoyée' },
      ],
    },
  };

  const application = mockApplications[appId];

  if (!application) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Candidature non trouvée</h1>
          <Link href={`/projects/${projectId}`} className="text-[#7C3AED] hover:underline">
            ← Retour au projet
          </Link>
        </div>
      </div>
    );
  }

  const isTopProvider = application.orgaRating >= 4.5 && application.orgaReviews >= 5;

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="brutalist-border border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter">
            <span className="text-white">K</span>
            <span className="text-[#7C3AED]">L</span>
            <span className="text-white">UB</span>
            <span className="text-sm text-[#A0A0A0] ml-4">Mode Démo</span>
          </h1>
          <Link href={`/projects/${projectId}`} className="text-sm text-[#A0A0A0] hover:text-white">
            ← Retour au projet
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header ORGA */}
            <div className="brutalist-card p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{application.orgaAvatar}</div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{application.orgaName}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[#7C3AED] font-bold text-lg">
                        ⭐ {application.orgaRating}/5
                      </span>
                      <span className="text-[#A0A0A0]">
                        ({application.orgaReviews} avis)
                      </span>
                      <span className="text-[#A0A0A0]">•</span>
                      <span className="text-[#A0A0A0]">
                        {application.orgaCompletedProjects} projets terminés
                      </span>
                    </div>
                  </div>
                </div>

                {isTopProvider && (
                  <span className="px-4 py-2 bg-[#00FF66]/20 text-[#00FF66] text-sm font-bold rounded border border-[#00FF66]/30">
                    ⭐ TOP PRESTATAIRE
                  </span>
                )}
              </div>

              <div className="border-t border-[#1A1A1A] pt-6">
                <div className="text-right mb-4">
                  <div className="text-sm text-[#A0A0A0] mb-1">Prix proposé</div>
                  <div className="text-4xl font-bold text-[#00FF66]">
                    {application.proposedPrice.toLocaleString('fr-FR')} €
                  </div>
                </div>
              </div>
            </div>

            {/* Message de motivation */}
            <div className="brutalist-card p-8">
              <h2 className="text-2xl font-bold mb-4">Message de motivation</h2>
              <p className="text-[#A0A0A0] leading-relaxed whitespace-pre-line">
                {application.message}
              </p>
            </div>

            {/* Photos */}
            {application.photos.length > 0 && (
              <div className="brutalist-card p-8">
                <h2 className="text-2xl font-bold mb-4">Portfolio Photos</h2>
                <div className="grid grid-cols-2 gap-4">
                  {application.photos.map((photo: string, index: number) => (
                    <div
                      key={index}
                      className="aspect-video rounded overflow-hidden border border-[#1A1A1A] hover:border-[#7C3AED] transition-colors"
                    >
                      <img
                        src={photo}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matériel disponible */}
            <div className="brutalist-card p-8">
              <h2 className="text-2xl font-bold mb-4">Matériel Disponible</h2>
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded p-4">
                <pre className="text-[#A0A0A0] whitespace-pre-line font-sans">
                  {application.availableEquipment}
                </pre>
              </div>
            </div>

            {/* Proposition de lieu */}
            {application.proposedVenue && (
              <div className="brutalist-card p-8">
                <h2 className="text-2xl font-bold mb-4">Proposition de Lieu</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Nom du lieu</div>
                    <div className="text-lg font-semibold">{application.proposedVenue}</div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-[#A0A0A0] mb-1">Capacité</div>
                      <div className="font-semibold">{application.venueCapacity} personnes</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#A0A0A0] mb-1">Taille de l&apos;équipe</div>
                      <div className="font-semibold">{application.teamSize} personnes</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Adresse</div>
                    <div className="font-semibold">{application.venueAddress}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Expérience */}
            <div className="brutalist-card p-8">
              <h2 className="text-2xl font-bold mb-4">Expérience</h2>
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded p-4">
                <pre className="text-[#A0A0A0] whitespace-pre-line font-sans leading-relaxed">
                  {application.experience}
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="brutalist-card p-6">
              <h3 className="text-lg font-bold mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="brutalist-button-primary px-6 py-3 w-full text-center">
                  ✓ Accepter la candidature
                </button>
                <button className="brutalist-button px-6 py-3 w-full text-center">
                  💬 Envoyer un message
                </button>
                <button className="brutalist-button px-6 py-3 w-full text-center text-[#FF0055]">
                  ✕ Refuser
                </button>
              </div>
            </div>

            {/* Informations */}
            <div className="brutalist-card p-6">
              <h3 className="text-lg font-bold mb-4">Informations</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-[#A0A0A0] mb-1">Projet</div>
                  <div className="font-semibold">{application.projectTitle}</div>
                </div>

                <div>
                  <div className="text-[#A0A0A0] mb-1">Candidature reçue</div>
                  <div className="font-semibold">
                    {new Date(application.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {application.portfolio && (
                  <div>
                    <div className="text-[#A0A0A0] mb-1">Portfolio</div>
                    <a
                      href={application.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7C3AED] hover:underline"
                    >
                      Voir le site →
                    </a>
                  </div>
                )}

                <div>
                  <div className="text-[#A0A0A0] mb-1">Taille de l&apos;équipe</div>
                  <div className="font-semibold">{application.teamSize} personnes</div>
                </div>
              </div>
            </div>

            {/* Certifications */}
            {application.certifications.length > 0 && (
              <div className="brutalist-card p-6">
                <h3 className="text-lg font-bold mb-4">Certifications</h3>
                <div className="space-y-2">
                  {application.certifications.map((cert: string, index: number) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded text-sm"
                    >
                      ✓ {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="brutalist-card p-6">
              <h3 className="text-lg font-bold mb-4">Historique</h3>
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {application.timeline.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 bg-[#7C3AED] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{item.event}</div>
                      <div className="text-xs text-[#A0A0A0]">
                        {new Date(item.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
