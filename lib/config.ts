/**
 * Configuration publique de KLUB — importable depuis n'importe quel composant.
 *
 * KLB-18 : ce module exportait auparavant `serviceRoleKey` et `API_SECRET_TOKEN`
 * dans le même objet que la configuration publique. Next.js remplace les
 * variables non préfixées `NEXT_PUBLIC_` par `undefined` dans le bundle client,
 * il n'y avait donc pas de fuite réelle — mais le motif brouillait la frontière
 * client/serveur et invitait à la faute.
 *
 * Les secrets serveur vivent désormais dans `lib/config.server.ts`, qui refuse
 * d'être chargé côté navigateur.
 */

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  vercel: {
    env: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development', // production | preview | development
    analyticsId: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || '',
  },
  app: {
    name: 'KLUB',
    version: '0.3.0',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const;

// Validation des variables publiques, côté serveur uniquement
if (typeof window === 'undefined') {
  if (!config.supabase.url) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!config.supabase.anonKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

export const isProduction = () => config.app.isProduction;
export const isDevelopment = () => config.app.isDevelopment;

export default config;
