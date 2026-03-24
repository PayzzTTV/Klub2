'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getRentalItems, InventoryItemWithOwner } from '@/lib/utils/inventory';

const categories = ['Tous', 'Son', 'Image', 'Lumière', 'Logistique'];

export default function DemoRentalPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [equipment, setEquipment] = useState<InventoryItemWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    async function loadEquipment() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }

      setIsDemo(false);
      const items = await getRentalItems(supabase, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category: selectedCategory === 'Tous' ? undefined : selectedCategory as any,
        availableOnly: true,
      });
      setEquipment(items || []);
      setLoading(false);
    }

    loadEquipment();
  }, [selectedCategory, supabase, router]);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.owner && (
        item.owner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.owner.organization_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ));

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#000000]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Hero Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                🎵 Rental Hub
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-[#A0A0A0] max-w-2xl">
                Louez du matériel professionnel entre communautés étudiantes.
                Son, lumière, vidéo, logistique - tout le nécessaire pour vos événements.
              </p>
            </div>
            {!isDemo && (
              <Link
                href="/rental/create"
                className="brutalist-button bg-purple-600 hover:bg-purple-700 w-full sm:w-auto whitespace-nowrap"
              >
                ➕ Ajouter du Matériel
              </Link>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="brutalist-card p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher du matériel, un propriétaire..."
                className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-[#A0A0A0]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-[#A0A0A0] hover:text-white"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded border whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                    : 'bg-transparent border-[#1A1A1A] text-[#A0A0A0] hover:border-[#7C3AED] hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-[#A0A0A0]">
            {filteredEquipment.length} résultat{filteredEquipment.length > 1 ? 's' : ''} trouvé
            {filteredEquipment.length > 1 ? 's' : ''}{totalPages > 1 && ` — page ${currentPage}/${totalPages}`}
          </p>
        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length === 0 ? (
          <div className="brutalist-card p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Aucun résultat</h3>
            <p className="text-[#A0A0A0]">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedEquipment.map((item) => (
              <Link
                key={item.id}
                href={`/rental/${item.id}`}
                className="brutalist-card overflow-hidden hover:border-[#7C3AED] transition-all group"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-[#0A0A0A]">
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    src={(isDemo ? (item as any).image : item.images?.[0]) || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <span className="px-4 py-2 bg-[#FF0055] text-white font-semibold rounded">
                        Non disponible
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-[#7C3AED] text-white text-xs font-semibold rounded">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[#7C3AED] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#A0A0A0] mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]">
                    <div>
                      <div className="text-2xl font-bold text-[#00FF66]">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {item.daily_price || (item as any).dailyPrice}€
                      </div>
                      <div className="text-xs text-[#A0A0A0]">par jour</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#A0A0A0] mb-1">Par</div>
                      <div className="text-sm font-semibold">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {item.owner?.organization_name || item.owner?.name || (item as any).owner}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#A0A0A0]">
                    <span>📍 {item.location}</span>
                    <span>•</span>
                    <span>Quantité: {item.quantity}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#1A1A1A] text-sm disabled:opacity-30 hover:border-[#7C3AED] transition-colors"
            >
              ← Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 border text-sm transition-colors ${
                  page === currentPage
                    ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-white'
                    : 'border-[#1A1A1A] hover:border-[#7C3AED]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#1A1A1A] text-sm disabled:opacity-30 hover:border-[#7C3AED] transition-colors"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
