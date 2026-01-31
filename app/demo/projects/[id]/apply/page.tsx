'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DemoApplyPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [formData, setFormData] = useState({
    proposedPrice: '',
    message: '',
    availableEquipment: '',
    experience: '',
    proposedVenue: '',
    venueCapacity: '',
    venueAddress: '',
    photos: [] as File[],
    portfolio: '',
    teamSize: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, photos: files });

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setPhotoPreview(previews);
  };

  // Mock project data
  const mockProjects: Record<string, any> = {
    '1': { title: 'Gala de fin d\'année 2026', budget: 15000 },
    '2': { title: 'Festival Campus Summer', budget: 25000 },
    '3': { title: 'Soirée d\'intégration', budget: 8000 },
    '4': { title: 'Conférence Tech & Innovation', budget: 12000 },
  };

  const project = mockProjects[projectId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mode Démo : Votre candidature a été envoyée avec succès ! (Données non enregistrées)');
    router.push('/demo/projects');
  };

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
            <span className="text-sm text-[#A0A0A0] ml-4">Mode Démo</span>
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
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0]">€</span>
                </div>
                <p className="text-xs text-[#A0A0A0] mt-2">
                  Budget du BDE : {project.budget.toLocaleString('fr-FR')} €
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Message de motivation *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED] min-h-[120px]"
                  placeholder="Présentez votre expertise, vos références et pourquoi vous êtes le meilleur choix pour ce projet..."
                  required
                />
              </div>
            </div>

            {/* Matériel disponible */}
            <div className="brutalist-card p-6">
              <h2 className="text-xl font-bold mb-4">Matériel & Équipement</h2>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Matériel que vous pouvez fournir
                </label>
                <textarea
                  value={formData.availableEquipment}
                  onChange={(e) => setFormData({ ...formData, availableEquipment: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED] min-h-[100px]"
                  placeholder="Listez le matériel que vous possédez (son, lumière, vidéo, etc.)"
                />
              </div>
            </div>

            {/* Proposition de Lieu (optionnel) */}
            <div className="brutalist-card p-6">
              <h2 className="text-xl font-bold mb-4">Proposition de Lieu (Optionnel)</h2>
              <p className="text-sm text-[#A0A0A0] mb-4">
                Si vous pouvez également fournir un lieu pour l&apos;événement
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nom du lieu
                  </label>
                  <input
                    type="text"
                    value={formData.proposedVenue}
                    onChange={(e) => setFormData({ ...formData, proposedVenue: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                    placeholder="Ex: Salle de réception Le Grand Palace"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Capacité
                    </label>
                    <input
                      type="number"
                      value={formData.venueCapacity}
                      onChange={(e) => setFormData({ ...formData, venueCapacity: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                      placeholder="500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Taille de l&apos;équipe
                    </label>
                    <input
                      type="number"
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                      placeholder="5"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                    placeholder="123 Rue de la Fête, 75001 Paris"
                  />
                </div>
              </div>
            </div>

            {/* Photos & Portfolio */}
            <div className="brutalist-card p-6">
              <h2 className="text-xl font-bold mb-4">Photos & Portfolio</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Lien portfolio / site web
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                    placeholder="https://monportfolio.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Photos de vos événements précédents
                  </label>
                  <div className="border-2 border-dashed border-[#1A1A1A] rounded p-6 text-center hover:border-[#7C3AED] transition-colors">
                    <input
                      type="file"
                      id="photos"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label htmlFor="photos" className="cursor-pointer">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-sm font-semibold mb-1">
                        Cliquez pour ajouter des photos
                      </p>
                      <p className="text-xs text-[#A0A0A0]">
                        PNG, JPG jusqu&apos;à 10MB (max 5 photos)
                      </p>
                    </label>
                  </div>

                  {photoPreview.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {photoPreview.map((preview, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded overflow-hidden border border-[#1A1A1A]"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expérience */}
            <div className="brutalist-card p-6">
              <h2 className="text-xl font-bold mb-4">Expérience</h2>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Projets similaires réalisés
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED] min-h-[100px]"
                  placeholder="Décrivez vos expériences pertinentes pour ce type d'événement..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="brutalist-button-primary px-8 py-3"
              >
                Envoyer la candidature
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

            <div className="brutalist-card p-6">
              <h3 className="text-lg font-bold mb-4">📊 Votre Profil</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[#A0A0A0] mb-1">Note moyenne</div>
                  <div className="text-2xl font-bold text-[#7C3AED]">4.7/5</div>
                </div>
                <div>
                  <div className="text-[#A0A0A0] mb-1">Avis reçus</div>
                  <div className="font-bold">12</div>
                </div>
                <div>
                  <div className="text-[#A0A0A0] mb-1">Projets terminés</div>
                  <div className="font-bold">8</div>
                </div>
              </div>
            </div>

            <div className="brutalist-card p-6 bg-[#7C3AED]/10 border-[#7C3AED]/30">
              <h3 className="text-sm font-bold mb-2">⭐ TOP PRESTATAIRE</h3>
              <p className="text-xs text-[#A0A0A0]">
                Votre badge sera visible par le BDE et augmente vos chances d&apos;être sélectionné
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
