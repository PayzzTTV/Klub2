'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getRentalItemById, getItemRentals } from '@/lib/utils/inventory';
import { createRentalRequest } from '@/lib/utils/rentals';
import { getOrgaStats } from '@/lib/utils/profiles';
import type { InventoryItem } from '@/types';

type InventoryItemWithOwner = InventoryItem & {
  owner?: {
    id: string;
    name: string;
    organization_name?: string;
    avatar_url?: string;
    role: string;
    location?: string;
  };
};

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const equipmentId = params.id as string;
  const supabase = createClient();

  const [equipment, setEquipment] = useState<InventoryItemWithOwner | null>(null);
  const [ownerStats, setOwnerStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [bookedDates, setBookedDates] = useState<any[]>([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    message: '',
    acceptTerms: false,
  });

  // Load equipment data
  useEffect(() => {
    async function loadEquipment() {
      try {
        setLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setCurrentUserId(user.id);

        // Load equipment
        const equipmentData = await getRentalItemById(supabase, equipmentId) as InventoryItemWithOwner;
        if (!equipmentData) {
          setError('Équipement non trouvé');
          setLoading(false);
          return;
        }
        setEquipment(equipmentData);

        // Load owner stats if ORGA
        if (equipmentData.owner?.role === 'ORGA') {
          const stats = await getOrgaStats(supabase, equipmentData.owner_id);
          setOwnerStats(stats);
        }

        // Load booked dates
        const rentals = await getItemRentals(supabase, equipmentId, false);
        setBookedDates(rentals);

        setLoading(false);
      } catch (err) {
        console.error('Error loading equipment:', err);
        setError('Erreur lors du chargement');
        setLoading(false);
      }
    }

    loadEquipment();
  }, [supabase, equipmentId, router]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Veuillez sélectionner les dates');
      return;
    }

    if (!bookingData.acceptTerms) {
      alert('Veuillez accepter les conditions');
      return;
    }

    if (!currentUserId || !equipment) {
      alert('Erreur: données manquantes');
      return;
    }

    // Calculate days and total price
    const days = Math.ceil(
      (new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1; // +1 pour inclure le jour de fin

    const totalPrice = days * equipment.daily_price;

    setSubmitting(true);

    try {
      const rental = await createRentalRequest(supabase, {
        item_id: equipmentId,
        renter_id: currentUserId,
        owner_id: equipment.owner_id,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_price: totalPrice,
        message: bookingData.message,
      });

      if (!rental) {
        alert('❌ Erreur lors de l\'envoi de la demande');
        setSubmitting(false);
        return;
      }

      alert(
        `✅ Demande de location envoyée!\n\nDurée: ${days} jour(s)\nTotal: ${totalPrice}€\n\nLe propriétaire recevra votre demande et vous contactera.`
      );

      // Reset form
      setShowBookingForm(false);
      setBookingData({ startDate: '', endDate: '', message: '', acceptTerms: false });
      setSubmitting(false);
    } catch (err) {
      console.error('Error creating rental request:', err);
      alert('❌ Erreur lors de l\'envoi de la demande');
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-[#A0A0A0]">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-black text-white">
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
          <div className="brutalist-card bg-[#FF0055]/10 border-[#FF0055] p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">❌</div>
              <div>
                <h2 className="text-xl font-bold text-[#FF0055] mb-2">Erreur</h2>
                <p className="text-sm text-[#A0A0A0]">{error || 'Équipement non trouvé'}</p>
                <Link href="/rental" className="brutalist-button inline-block mt-4 px-6 py-2">
                  Retour au Catalogue
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const ownerName = equipment.owner?.organization_name || equipment.owner?.name || 'Propriétaire';
  const ownerRating = ownerStats?.average_rating || 0;
  const ownerReviewCount = ownerStats?.total_reviews || 0;

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
                {equipment.images && equipment.images.length > 0 ? (
                  <img
                    src={equipment.images[selectedImage]}
                    alt={equipment.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#A0A0A0]">
                    <span className="text-6xl">📦</span>
                  </div>
                )}
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
            {equipment.images && equipment.images.length > 1 && (
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
            {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
              <div className="brutalist-card p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">Spécifications Techniques</h2>
                <div className="space-y-3">
                  {Object.entries(equipment.specifications).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-start justify-between pb-3 border-b border-[#1A1A1A] last:border-0">
                      <span className="text-sm text-[#A0A0A0] capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[#7C3AED] text-white text-sm font-semibold rounded">
                  {equipment.category}
                </span>
                {equipment.location && (
                  <span className="text-sm text-[#A0A0A0]">📍 {equipment.location}</span>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{equipment.title}</h1>

              <p className="text-[#A0A0A0] mb-6">{equipment.description}</p>

              {/* Owner Info */}
              <div className="flex items-center justify-between pb-6 border-b border-[#1A1A1A]">
                <div>
                  <p className="text-sm text-[#A0A0A0] mb-1">Propriétaire</p>
                  <p className="font-semibold">{ownerName}</p>
                </div>
                {ownerReviewCount > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#7C3AED] font-bold">★ {ownerRating.toFixed(1)}</span>
                      <span className="text-sm text-[#A0A0A0]">({ownerReviewCount} avis)</span>
                    </div>
                    {equipment.owner && (
                      <Link href={`/orga/${equipment.owner_id}`} className="text-sm text-[#7C3AED] hover:underline">
                        Voir le profil →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="brutalist-card p-6 mb-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm text-[#A0A0A0] mb-1">Tarif journalier</p>
                  <p className="text-4xl font-bold text-[#00FF66]">{equipment.daily_price}€</p>
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

            {/* Booked Dates Info */}
            {showBookingForm && bookedDates.length > 0 && (
              <div className="brutalist-card p-6 mb-6 bg-yellow-900/20 border-yellow-700">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  📅 Dates déjà réservées
                </h3>
                <div className="space-y-2 text-sm">
                  {bookedDates.slice(0, 5).map((rental) => (
                    <div key={rental.id} className="flex items-center justify-between text-gray-300">
                      <span>
                        {new Date(rental.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {' → '}
                        {new Date(rental.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="px-2 py-1 bg-yellow-700 rounded text-xs">
                        {rental.status === 'pending' ? '⏳ Pending' : '✅ Confirmé'}
                      </span>
                    </div>
                  ))}
                  {bookedDates.length > 5 && (
                    <p className="text-xs text-gray-400 mt-2">
                      + {bookedDates.length - 5} autre(s) réservation(s)
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  ℹ️ Vérifiez que vos dates ne chevauchent pas ces périodes
                </p>
              </div>
            )}

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
                  disabled={!bookingData.acceptTerms || submitting}
                  className={`brutalist-button-primary w-full py-3 ${
                    !bookingData.acceptTerms || submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                </button>
              </form>
            )}

            {/* Rental Info */}
            <div className="brutalist-card p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Conditions de Location</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-[#7C3AED]">•</span>
                  <span className="text-[#A0A0A0]">
                    Durée minimum: {equipment.min_rental_days} jour(s)
                  </span>
                </li>
                {equipment.max_rental_days && (
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-[#7C3AED]">•</span>
                    <span className="text-[#A0A0A0]">
                      Durée maximum: {equipment.max_rental_days} jour(s)
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-[#7C3AED]">•</span>
                  <span className="text-[#A0A0A0]">
                    État: {equipment.condition}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-[#7C3AED]">•</span>
                  <span className="text-[#A0A0A0]">
                    Le propriétaire confirmera votre demande sous 24h
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-[#7C3AED]">•</span>
                  <span className="text-[#A0A0A0]">
                    Caution et conditions détaillées communiquées après acceptation
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
