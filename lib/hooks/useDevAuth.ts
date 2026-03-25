'use client';

/**
 * Dev mode bypass: checks localStorage for dev_authenticated before Supabase.
 * Returns { devUser, isDevMode } - use devUser when isDevMode is true.
 */
export function getDevAuth(): { isDevMode: boolean; devUser: any | null } {
  if (typeof window === 'undefined') return { isDevMode: false, devUser: null };
  const devAuth = localStorage.getItem('dev_authenticated');
  if (devAuth === 'true') {
    const devUser = JSON.parse(localStorage.getItem('dev_user') || '{}');
    return { isDevMode: true, devUser: devUser.id ? devUser : null };
  }
  return { isDevMode: false, devUser: null };
}
