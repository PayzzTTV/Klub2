'use client';

import { useEffect, useState, useRef } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname === '/';

  useEffect(() => {
    if (isAuthPage) return;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, name, organization_name, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (profile) setUser(profile as UserProfile);
    }

    loadUser();
  }, [isAuthPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('dev_authenticated');
    localStorage.removeItem('dev_user');
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  if (isAuthPage || !user) return null;

  const navigation = user.role === 'BDE' ? [
    { name: 'Dashboard', href: '/bde/dashboard' },
    { name: 'Mes Projets', href: '/bde/projects' },
    { name: 'Location', href: '/rental' },
  ] : [
    { name: 'Dashboard', href: '/orga/dashboard' },
    { name: 'Projets', href: '/projects' },
    { name: 'Location', href: '/rental' },
  ];

  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '56px',
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #111',
        fontFamily: 'Syne, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo */}
        <Link
          href={user.role === 'BDE' ? '/bde/dashboard' : '/orga/dashboard'}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
        >
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            <span style={{ color: '#FFFFFF' }}>KL</span>
            <span style={{ color: '#7C3AED' }}>U</span>
            <span style={{ color: '#FFFFFF' }}>B</span>
          </span>
        </Link>

        {/* Center: Nav links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: isActive ? '#FFFFFF' : '#555555',
                  borderBottom: isActive ? '2px solid #7C3AED' : '2px solid transparent',
                  transition: 'color 0.15s ease, border-color 0.15s ease',
                  display: 'inline-block',
                  lineHeight: 1.5,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = '#E8E8E8';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = '#555555';
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Role badge + avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Role badge */}
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              border: `1px solid ${user.role === 'BDE' ? '#7C3AED' : '#00FF66'}`,
              color: user.role === 'BDE' ? '#7C3AED' : '#00FF66',
              background: 'transparent',
              lineHeight: 1.4,
            }}
          >
            {user.role}
          </span>

          {/* Avatar + dropdown toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
            }}
            aria-label="Menu utilisateur"
          >
            {/* Avatar circle */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              {userInitial}
            </div>

            {/* Chevron */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                color: '#555555',
                transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dropdown panel */}
          {isMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                minWidth: '180px',
                background: '#050505',
                border: '1px solid #111',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '11px 16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  color: '#E8E8E8',
                  textDecoration: 'none',
                  borderBottom: '1px solid #111',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#0D0D0D'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
              >
                Mon Profil
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '11px 16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  color: '#E8E8E8',
                  textDecoration: 'none',
                  borderBottom: '1px solid #111',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#0D0D0D'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
              >
                Parametres
              </Link>
              {/* Separator */}
              <div style={{ height: '1px', background: '#111', margin: '0' }} />
              <button
                onClick={handleLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 16px',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  color: '#FF0055',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,0,85,0.08)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                Deconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
