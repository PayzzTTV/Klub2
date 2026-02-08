'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DateRangePicker from '@/components/ui/DateRangePicker';

// Mock equipment data (same as catalog)
const mockEquipment: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Système Son Professionnel 15kW',
    category: 'Son',
    owner: 'SoundTech Events',
    ownerId: 'orga-1',
    ownerRating: 4.8,
    ownerReviews: 15,
    dailyPrice: 350,
    quantity: 2,
    available: true,
    location: 'Paris',
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800',
    ],
    description: 'Système de sonorisation professionnel complet, idéal pour événements de 300 à 500 personnes. Inclut enceintes, amplificateurs, table de mixage et câblage complet.',
    specifications: {
      puissance: '15kW RMS',
      capacite: '500 personnes',
      configuration: '2x Sub 18" + 4x Tops 12"',
      marque: 'RCF / QSC',
      table: 'Behringer X32',
      cables: 'Câblage XLR complet',
    },
    included: [
      '2 Subwoofers 18 pouces (2000W chacun)',
      '4 Enceintes tops 12 pouces (1500W chacune)',
      'Console de mixage numérique 32 canaux',
      '2 Amplificateurs numériques',
      'Câblage XLR complet (50m)',
      'Pieds et structures',
      'Technicien disponible (+150€/jour)',
    ],
    terms: [
      'Caution: 1000€',
      'Installation et démontage inclus (Paris intra-muros)',
      'Assurance obligatoire',
      'Minimum 1 jour de location',
      'Réduction -10% à partir de 3 jours',
    ],
  },
  '2': {
    id: '2',
    title: 'Pack Lumière LED RGB - 12 projecteurs',
    category: 'Lumière',
    owner: 'LightShow Pro',
    ownerId: 'orga-2',
    ownerRating: 4.9,
    ownerReviews: 23,
    dailyPrice: 280,
    quantity: 1,
    available: true,
    location: 'Lyon',
    images: [
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    ],
    description: 'Pack complet de 12 projecteurs LED RGB avec console DMX. Parfait pour créer des ambiances lumineuses professionnelles.',
    specifications: {
      type: 'LED RGB',
      nombre: '12 projecteurs PAR64',
      puissance: '200W par projecteur',
      console: 'Console DMX 512',
      controle: 'DMX + Mode auto',
    },
    included: [
      '12 projecteurs LED RGB PAR64',
      'Console DMX 512 canaux',
      'Câblage DMX complet',
      'Câbles d\'alimentation',
      'Pieds et structures',
      'Flight cases de transport',
    ],
    terms: [
      'Caution: 500€',
      'Transport non inclus',
      'Installation sur demande (+100€)',
      'Mode d\'emploi fourni',
    ],
  },
};

export default function DemoRentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const equipmentId = params.id as string;
  const equipment = mockEquipment[equipmentId] || mockEquipment['1'];

  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [bookingData, setBookingData] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    message: '',
    acceptTerms: false,
  });

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Veuillez sélectionner les dates');
      return;
    }

    if (!bookingData.acceptTerms) {
      alert('Veuillez accepter les conditions');
      return;
    }

    const days = Math.ceil(
      (new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const totalPrice = days * equipment.dailyPrice;

    alert(
      `✅ Demande de location envoyée!\n\nDurée: ${days} jour(s)\nTotal: ${totalPrice}€\n\n${equipment.owner} recevra votre demande et vous contactera.`
    );

    setShowBookingForm(false);
    setBookingData({ startDate: '', endDate: '', message: '', acceptTerms: false });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/rental" className="text-sm text-[#A0A0A0] hover:text-white">
            ← Retour au catalogue
          </Link>
          <Link href="/demo" className="text-2xl font-bold">
            KLUB
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="brutalist-card overflow-hidden mb-4">
              <div className="relative aspect-video bg-[#0A0A0A]">
                <img
                  src={equipment.images[selectedImage]}
                  alt={equipment.title}
                  className="w-full h-full object-cover"
                />
                {!equipment.available && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <span className="px-6 py-3 bg-[#FF0055] text-white font-bold text-lg rounded">
                      Non disponible
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {equipment.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {equipment.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`brutalist-card overflow-hidden aspect-video ${
                      selectedImage === index ? 'border-[#7C3AED]' : ''
                    }`}
                  >
                    <img src={image} alt={`${equipment.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications */}
            <div className="brutalist-card p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Spécifications Techniques</h2>
              <div className="space-y-3">
                {Object.entries(equipment.specifications).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-start justify-between pb-3 border-b border-[#1A1A1A] last:border-0">
                    <span className="text-sm text-[#A0A0A0] capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-semibold text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[#7C3AED] text-white text-sm font-semibold rounded">
                  {equipment.category}
                </span>
                <span className="text-sm text-[#A0A0A0]">📍 {equipment.location}</span>
              </div>

              <h1 className="text-3xl font-bold mb-4">{equipment.title}</h1>

              <p className="text-[#A0A0A0] mb-6">{equipment.description}</p>

              {/* Owner Info */}
              <div className="flex items-center justify-between pb-6 border-b border-[#1A1A1A]">
                <div>
                  <p className="text-sm text-[#A0A0A0] mb-1">Propriétaire</p>
                  <p className="font-semibold">{equipment.owner}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#7C3AED] font-bold">★ {equipment.ownerRating}</span>
                    <span className="text-sm text-[#A0A0A0]">({equipment.ownerReviews} avis)</span>
                  </div>
                  <Link href={`/orga/${equipment.ownerId}`} className="text-sm text-[#7C3AED] hover:underline">
                    Voir le profil →
                  </Link>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="brutalist-card p-6 mb-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm text-[#A0A0A0] mb-1">Tarif journalier</p>
                  <p className="text-4xl font-bold text-[#00FF66]">{equipment.dailyPrice}€</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#A0A0A0]">Disponible</p>
                  <p className="text-sm font-semibold">{equipment.quantity} unité(s)</p>
                </div>
              </div>

              {equipment.available ? (
                <button
                  onClick={() => setShowBookingForm(!showBookingForm)}
                  className="brutalist-button-primary w-full py-3 text-lg font-bold"
                >
                  {showBookingForm ? 'Annuler' : '📅 Réserver maintenant'}
                </button>
              ) : (
                <button disabled className="brutalist-button w-full py-3 opacity-50 cursor-not-allowed">
                  Non disponible
                </button>
              )}
            </div>

            {/* Booking Form */}
            {showBookingForm && (
              <form onSubmit={handleSubmitBooking} className="brutalist-card p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Demande de Réservation</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Date de début *</label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Date de fin *</label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Message (optionnel)</label>
                    <textarea
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded px-4 py-3 focus:outline-none focus:border-[#7C3AED] min-h-[100px]"
                      placeholder="Décrivez votre événement, vos besoins spécifiques..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={bookingData.acceptTerms}
                      onChange={(e) => setBookingData({ ...bookingData, acceptTerms: e.target.checked })}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-[#A0A0A0]">
                      J&apos;accepte les conditions de location et m&apos;engage à respecter le matériel
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="brutalist-button-primary w-full py-3"
                  disabled={!bookingData.acceptTerms}
                >
                  Envoyer la demande
                </button>
              </form>
            )}

            {/* What's Included */}
            <div className="brutalist-card p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Inclus dans la location</h3>
              <ul className="space-y-2">
                {equipment.included.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-[#00FF66]">✓</span>
                    <span className="text-[#A0A0A0]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Terms & Conditions */}
            <div className="brutalist-card p-6">
              <h3 className="text-lg font-bold mb-4">Conditions</h3>
              <ul className="space-y-2">
                {equipment.terms.map((term: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-[#7C3AED]">•</span>
                    <span className="text-[#A0A0A0]">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
