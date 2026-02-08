'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  getOwnerRentalRequests,
  getRenterRentalRequests,
  updateRentalStatus,
} from '@/lib/utils/inventory';

type RentalStatus = 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled';

export default function ManageRentalsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);

  const [filterStatus, setFilterStatus] = useState<RentalStatus | 'all'>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUserId(user.id);

      // Load incoming requests (as owner)
      const incoming = await getOwnerRentalRequests(
        supabase,
        user.id,
        filterStatus === 'all' ? undefined : filterStatus
      );
      setIncomingRequests(incoming);

      // Load outgoing requests (as renter)
      const outgoing = await getRenterRentalRequests(
        supabase,
        user.id,
        filterStatus === 'all' ? undefined : filterStatus
      );
      setOutgoingRequests(outgoing);

      setLoading(false);
    }

    loadData();
  }, [supabase, router, filterStatus]);

  const handleApprove = async (rentalId: string) => {
    const success = await updateRentalStatus(supabase, rentalId, 'approved');
    if (success) {
      alert('✅ Demande approuvée !');
      // Reload data
      window.location.reload();
    } else {
      alert('❌ Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (rentalId: string) => {
    const success = await updateRentalStatus(supabase, rentalId, 'cancelled');
    if (success) {
      alert('❌ Demande refusée');
      window.location.reload();
    } else {
      alert('❌ Erreur lors du refus');
    }
  };

  const handleComplete = async (rentalId: string) => {
    const success = await updateRentalStatus(supabase, rentalId, 'completed');
    if (success) {
      alert('✅ Location marquée comme terminée');
      window.location.reload();
    } else {
      alert('❌ Erreur');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: '⏳ En attente',
      approved: '✅ Approuvée',
      ongoing: '🔄 En cours',
      completed: '✅ Terminée',
      cancelled: '❌ Annulée',
    };
    return badges[status as keyof typeof badges] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-600',
      approved: 'bg-green-600',
      ongoing: 'bg-blue-600',
      completed: 'bg-gray-600',
      cancelled: 'bg-red-600',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-600';
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 to include both start and end days
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const currentRequests = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
          >
            ← Retour
          </button>
          <h1 className="text-4xl font-bold mb-2">📋 Gérer les Locations</h1>
          <p className="text-gray-400">Gérez vos demandes de location entrantes et sortantes</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-6 py-3 rounded border transition-all ${
              activeTab === 'incoming'
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'bg-transparent border-gray-800 text-gray-400 hover:border-purple-600 hover:text-white'
            }`}
          >
            📥 Demandes Reçues
            {incomingRequests.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-purple-800 rounded text-xs">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-6 py-3 rounded border transition-all ${
              activeTab === 'outgoing'
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'bg-transparent border-gray-800 text-gray-400 hover:border-purple-600 hover:text-white'
            }`}
          >
            📤 Mes Demandes
            {outgoingRequests.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-purple-800 rounded text-xs">
                {outgoingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter by Status */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {['all', 'pending', 'approved', 'ongoing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded border whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-transparent border-gray-800 hover:border-purple-600'
              }`}
            >
              {status === 'all' ? 'Tous' : getStatusBadge(status)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {currentRequests.length === 0 ? (
          <div className="brutalist-card p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold mb-2">Aucune demande</h3>
            <p className="text-gray-400">
              {activeTab === 'incoming'
                ? 'Vous n\'avez pas encore reçu de demandes de location'
                : 'Vous n\'avez pas encore fait de demandes de location'}
            </p>
            <Link href="/rental" className="brutalist-button mt-6 inline-block">
              Parcourir le catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentRequests.map((request) => (
              <div key={request.id} className="brutalist-card p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Item Image */}
                  <div className="w-full md:w-48 h-32 flex-shrink-0">
                    <img
                      src={request.item.images?.[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'}
                      alt={request.item.title}
                      className="w-full h-full object-cover rounded border border-gray-800"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          <Link
                            href={`/rental/${request.item.id}`}
                            className="hover:text-purple-500"
                          >
                            {request.item.title}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="px-2 py-1 bg-purple-900 rounded text-xs">
                            {request.item.category}
                          </span>
                          <span>•</span>
                          <span>
                            {activeTab === 'incoming'
                              ? `Par: ${request.renter?.organization_name || request.renter?.name}`
                              : `Propriétaire: ${request.owner?.organization_name || request.owner?.name}`}
                          </span>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(request.status)}`}>
                        {getStatusBadge(request.status)}
                      </span>
                    </div>

                    {/* Rental Details */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-900 rounded">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Période</div>
                        <div className="font-semibold">
                          {formatDate(request.start_date)} → {formatDate(request.end_date)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {calculateDays(request.start_date, request.end_date)} jour(s)
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-400 mb-1">Prix</div>
                        <div className="text-2xl font-bold text-green-500">
                          {request.total_price}€
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ({request.item.daily_price}€/jour)
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-400 mb-1">Contact</div>
                        <div className="text-sm">
                          {activeTab === 'incoming' ? (
                            <>
                              <div>📧 {request.renter?.email || 'N/A'}</div>
                              <div>📱 {request.renter?.phone || 'N/A'}</div>
                            </>
                          ) : (
                            <>
                              <div>📧 {request.owner?.email || 'N/A'}</div>
                              <div>📱 {request.owner?.phone || 'N/A'}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {activeTab === 'incoming' && (
                      <div className="flex gap-3">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="brutalist-button bg-green-600 hover:bg-green-700"
                            >
                              ✅ Approuver
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="brutalist-button bg-red-600 hover:bg-red-700"
                            >
                              ❌ Refuser
                            </button>
                          </>
                        )}

                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleComplete(request.id)}
                            className="brutalist-button bg-blue-600 hover:bg-blue-700"
                          >
                            ✅ Marquer comme terminée
                          </button>
                        )}

                        {request.status === 'ongoing' && (
                          <button
                            onClick={() => handleComplete(request.id)}
                            className="brutalist-button bg-blue-600 hover:bg-blue-700"
                          >
                            ✅ Marquer comme terminée
                          </button>
                        )}
                      </div>
                    )}

                    {activeTab === 'outgoing' && request.status === 'pending' && (
                      <button
                        onClick={() => handleReject(request.id)}
                        className="brutalist-button bg-red-600 hover:bg-red-700"
                      >
                        ❌ Annuler la demande
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
