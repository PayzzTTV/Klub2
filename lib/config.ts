/**
 * Configuration centralisée pour KLUB
 * Pattern: $token = config('service.api.token')
 */

export const config = {
  service: {
    api: {
      token: process.env.API_SECRET_TOKEN || '',
      publicToken: process.env.NEXT_PUBLIC_API_TOKEN || '',
    },
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  vercel: {
    env: process.env.VERCEL_ENV || 'development', // production | preview | development
    url: process.env.VERCEL_URL || 'localhost:3000',
    analyticsId: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || '',
  },
  app: {
    name: 'KLUB',
    version: '0.3.0',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const;

// Validation des variables d'environnement critiques
if (typeof window === 'undefined') {
  // Server-side validation uniquement
  if (!config.supabase.url) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!config.supabase.anonKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (config.app.isProduction && !config.service.api.token) {
    console.warn('⚠️ Missing API_SECRET_TOKEN in production');
  }
}

// Helper functions
export const getApiToken = () => config.service.api.token;
export const getPublicApiToken = () => config.service.api.publicToken;
export const isProduction = () => config.vercel.env === 'production';
export const isDevelopment = () => config.app.isDevelopment;

export default config;
