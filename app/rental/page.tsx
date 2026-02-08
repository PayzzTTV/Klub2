'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getRentalItems } from '@/lib/utils/inventory';
import { InventoryItem } from '@/types';

// Mock equipment data (fallback for demo mode)
const mockEquipment = [
  {
    id: '1',
    title: 'Système Son Professionnel 15kW',
    category: 'Son',
    owner: 'SoundTech Events',
    ownerId: 'orga-1',
    dailyPrice: 350,
    quantity: 2,
    available: true,
    location: 'Paris',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    description: 'Système de sonorisation professionnel avec enceintes, amplis et table de mixage',
    specifications: {
      puissance: '15kW',
      capacite: '500 personnes',
      configuration: '2x Sub + 4x Tops',
    },
  },
  {
    id: '2',
    title: 'Pack Lumière LED RGB - 12 projecteurs',
    category: 'Lumière',
    owner: 'LightShow Pro',
    ownerId: 'orga-2',
    dailyPrice: 280,
    quantity: 1,
    available: true,
    location: 'Lyon',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    description: '12 projecteurs LED RGB avec console DMX et câblage complet',
    specifications: {
      type: 'LED RGB',
      nombre: '12 projecteurs',
      controle: 'Console DMX',
    },
  },
  {
    id: '3',
    title: 'Caméra 4K + Stabilisateur',
    category: 'Image',
    owner: 'VideoMakers Studio',
    ownerId: 'orga-3',
    dailyPrice: 200,
    quantity: 1,
    available: true,
    location: 'Paris',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    description: 'Caméra 4K professionnelle avec gimbal stabilisateur et accessoires',
    specifications: {
      resolution: '4K 60fps',
      stabilisateur: 'Gimbal 3 axes',
      autonomie: '4h',
    },
  },
  {
    id: '4',
    title: 'Barnums 3x3m - Lot de 4',
    category: 'Logistique',
    owner: 'EventPro',
    ownerId: 'orga-4',
    dailyPrice: 120,
    quantity: 4,
    available: true,
    location: 'Marseille',
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
    description: '4 barnums pliants 3x3m avec bâches, idéal pour stands extérieurs',
    specifications: {
      dimensions: '3x3m',
      couleur: 'Blanc',
      poids: '25kg/unité',
    },
  },
  {
    id: '5',
    title: 'Console DJ Pioneer XDJ-RX3',
    category: 'Son',
    owner: 'DJ Collective',
    ownerId: 'orga-5',
    dailyPrice: 180,
    quantity: 1,
    available: true,
    location: 'Paris',
    image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800',
    description: 'Console DJ all-in-one professionnelle avec écran tactile',
    specifications: {
      modele: 'Pioneer XDJ-RX3',
      canaux: '4 decks',
      connectivite: 'USB, Rekordbox',
    },
  },
  {
    id: '6',
    title: 'Écran LED Géant 3x2m',
    category: 'Image',
    owner: 'ScreenTech',
    ownerId: 'orga-6',
    dailyPrice: 450,
    quantity: 1,
    available: false,
    location: 'Lyon',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800',
    description: 'Écran LED géant modulaire pour événements outdoor/indoor',
    specifications: {
      dimensions: '3x2m',
      resolution: 'Full HD',
      luminosite: '5000 nits',
    },
  },
];

const categories = ['Tous', 'Son', 'Image', 'Lumière', 'Logistique'];

export default function DemoRentalPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [equipment, setEquipment] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    async function loadEquipment() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsDemo(false);
        const items = await getRentalItems(supabase, {
          category: selectedCategory === 'Tous' ? undefined : selectedCategory as any,
          availableOnly: true,
        });
        setEquipment(items || []);
      } else {
        // Not authenticated, use mock data
        setIsDemo(true);
        setEquipment(mockEquipment as any);
      }
      setLoading(false);
    }

    loadEquipment();
  }, [selectedCategory, supabase]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#000000]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/demo" className="text-2xl font-bold">
            KLUB
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/bde/dashboard" className="text-sm text-[#A0A0A0] hover:text-white">
              Dashboard
            </Link>
            <Link href="/projects" className="text-sm text-[#A0A0A0] hover:text-white">
              Projets
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🎵 Rental Hub
          </h1>
          <p className="text-lg text-[#A0A0A0] max-w-2xl">
            Louez du matériel professionnel entre communautés étudiantes.
            Son, lumière, vidéo, logistique - tout le nécessaire pour vos événements.
          </p>
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
            {filteredEquipment.length > 1 ? 's' : ''}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <Link
                key={item.id}
                href={`/rental/${item.id}`}
                className="brutalist-card overflow-hidden hover:border-[#7C3AED] transition-all group"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-[#0A0A0A]">
                  <img
                    src={(isDemo ? (item as any).image : item.images?.[0]) || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        {item.daily_price || (item as any).dailyPrice}€
                      </div>
                      <div className="text-xs text-[#A0A0A0]">par jour</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#A0A0A0] mb-1">Par</div>
                      <div className="text-sm font-semibold">
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
      </main>
    </div>
  );
}
