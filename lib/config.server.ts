import 'server-only';

/**
 * Secrets serveur — KLB-18.
 *
 * L'import de `server-only` fait échouer le build si ce module est atteint
 * depuis un composant client, plutôt que de laisser passer silencieusement une
 * variable vidée par Next.js.
 *
 * ⚠️ `serviceRoleKey` ignore intégralement le RLS. Ne jamais l'utiliser depuis
 * une route accessible sans authentification vérifiée, et ne jamais la stocker
 * sur disque en dehors des variables d'environnement Vercel (cf. KLB-03).
 */
export const serverConfig = {
  supabase: {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  service: {
    api: {
      token: process.env.API_SECRET_TOKEN || '',
    },
  },
} as const;

export const getApiToken = () => serverConfig.service.api.token;

export default serverConfig;
