'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type UserProfile = {
  id: string;
  role: 'BDE' | 'ORGA';
  name: string;
  organization_name: string | null;
  avatar_url: string | null;
};

export default function Header() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Pages sans header (auth + homepage)
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname === '/';

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, name, organization_name, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile as UserProfile);
      }
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Ne pas afficher le header sur les pages d'authentification
  if (isAuthPage || !user) return null;

  // Navigation contextuelle selon le rôle
  const navigation = user.role === 'BDE' ? [
    { name: 'Dashboard', href: '/bde/dashboard' },
    { name: 'Mes Projets', href: '/bde/projects' },
    { name: 'Location', href: '/rental' },
  ] : [
    { name: 'Dashboard', href: '/orga/dashboard' },
    { name: 'Projets', href: '/projects' },
    { name: 'Location', href: '/rental' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Rôle */}
          <div className="flex items-center gap-4">
            <Link href={user.role === 'BDE' ? '/bde/dashboard' : '/orga/dashboard'} className="flex items-center gap-3">
              <div className="text-2xl font-bold">
                <span className="text-white">K</span>
                <span className="text-[#7C3AED]">L</span>
                <span className="text-white">U</span>
                <span className="text-[#00FF66]">B</span>
              </div>
            </Link>

            {/* Badge de rôle */}
            <span className={`px-3 py-1 text-xs font-bold border ${
              user.role === 'BDE'
                ? 'border-[#7C3AED] text-[#7C3AED] bg-[#7C3AED]/10'
                : 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10'
            }`}>
              {user.role}
            </span>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Menu Profil */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 brutalist-card px-4 py-2 hover:border-[#7C3AED] transition-all"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#00FF66] flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Nom */}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-white">{user.name}</div>
                {user.organization_name && (
                  <div className="text-xs text-[#A0A0A0]">{user.organization_name}</div>
                )}
              </div>

              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-[#A0A0A0] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 brutalist-card overflow-hidden">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-sm text-white hover:bg-[#0A0A0A] transition-colors border-b border-[#1A1A1A]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Mon Profil
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-3 text-sm text-white hover:bg-[#0A0A0A] transition-colors border-b border-[#1A1A1A]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ⚙️ Paramètres
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-[#FF0055] hover:bg-[#FF0055]/10 transition-colors"
                  >
                    🚪 Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Mobile */}
        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                pathname === item.href
                  ? 'text-[#7C3AED] border border-[#7C3AED] bg-[#7C3AED]/10'
                  : 'text-[#A0A0A0] border border-[#1A1A1A] hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
