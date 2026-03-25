'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getRentalItems, InventoryItemWithOwner } from '@/lib/utils/inventory';

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
  const [equipment, setEquipment] = useState<InventoryItemWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    async function loadEquipment() {
      setLoading(true);

      // Dev mode bypass
      const devAuth = typeof window !== 'undefined' && localStorage.getItem('dev_authenticated') === 'true';
      if (devAuth) {
        setIsDemo(true);
        setEquipment([]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      setIsDemo(false);
      const items = await getRentalItems(supabase, {
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

  if (loading) {
    return (
      <div className="k-page flex items-center justify-center min-h-screen">
        <span className="k-spinner" />
      </div>
    );
  }

  return (
    <div className="k-page">
      <div className="k-page-inner">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="k-section-label mb-2">— Matériel</p>
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: '#E8E8E8',
              }}
            >
              Rental Hub
            </h1>
          </div>
          {!isDemo && (
            <Link href="/rental/create" className="k-btn whitespace-nowrap">
              Ajouter du matériel
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid #222',
              paddingBottom: '12px',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A0A0A0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher du matériel, un propriétaire..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#E8E8E8',
                fontSize: '1rem',
              }}
              className="placeholder-[#555]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#555',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E8E8E8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            marginBottom: '32px',
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '6px 18px',
                border: selectedCategory === category ? 'none' : '1px solid #1A1A1A',
                background: selectedCategory === category ? '#7C3AED' : 'transparent',
                color: selectedCategory === category ? '#fff' : '#E8E8E8',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: selectedCategory === category ? 600 : 400,
                whiteSpace: 'nowrap',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = '#7C3AED';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = '#1A1A1A';
                  e.currentTarget.style.color = '#E8E8E8';
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="k-section-label">
            {filteredEquipment.length} résultat{filteredEquipment.length > 1 ? 's' : ''} trouvé
            {filteredEquipment.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length === 0 ? (
          <div className="k-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#333"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto 20px' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#E8E8E8', marginBottom: '8px' }}>
              Aucun résultat
            </h3>
            <p style={{ color: '#555', fontSize: '0.875rem' }}>
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredEquipment.map((item) => (
              <Link
                key={item.id}
                href={`/rental/${item.id}`}
                className="k-card"
                style={{
                  overflow: 'hidden',
                  display: 'block',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#7C3AED';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1A1A1A';
                }}
              >
                {/* Image */}
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '16 / 9',
                    overflow: 'hidden',
                    background: '#0A0A0A',
                  }}
                >
                  <Image
                    src={
                      (isDemo
                        ? (item as any).image
                        : item.images?.[0]) ||
                      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'
                    }
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                    className="group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Unavailable overlay */}
                  {!item.available && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.78)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          color: '#FF0055',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Indisponible
                      </span>
                    </div>
                  )}

                  {/* Category badge */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span className="k-badge k-badge-violet">{item.category}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '16px' }}>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: '#E8E8E8',
                      marginBottom: '8px',
                      lineHeight: 1.25,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#888',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </p>

                  {/* Price + Owner row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid #1A1A1A',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 700,
                          color: '#00FF66',
                          lineHeight: 1,
                        }}
                      >
                        {item.daily_price || (item as any).dailyPrice}€
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          color: '#555',
                          marginTop: '2px',
                        }}
                      >
                        / jour
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.7rem',
                          color: '#555',
                          marginBottom: '2px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        Par
                      </span>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#E8E8E8',
                        }}
                      >
                        {item.owner?.organization_name ||
                          item.owner?.name ||
                          (item as any).owner}
                      </span>
                    </div>
                  </div>

                  {/* Location + Quantity */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: '#555',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{item.location}</span>
                    <span style={{ color: '#2A2A2A' }}>•</span>
                    <span>Qté : {item.quantity}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
