# 🔧 KLUB - Guide de Dépannage

Ce document liste les problèmes courants et leurs solutions.

---

## 🗄️ Problèmes Supabase

### Erreur: "function round(double precision, integer) does not exist"

**Symptôme :**
```sql
ERROR: 42883: function round(double precision, integer) does not exist
HINT: No function matches the given name and argument types. You might need to add explicit type casts.
```

**Cause :**
PostgreSQL ne trouve pas automatiquement la fonction `ROUND()` pour les résultats de `LN()` qui retourne un `double precision`.

**Solution :**
Utiliser un cast explicite vers `numeric` :
```sql
-- ❌ Incorrect
ROUND(AVG(r.global_rating) * LN(COUNT(r.id) + 1), 2)

-- ✅ Correct
ROUND((AVG(r.global_rating) * LN(COUNT(r.id) + 1))::numeric, 2)
```

**État :** ✅ Corrigé dans [supabase-schema.sql](supabase-schema.sql) (lignes 307 et 632)

---

### Erreur: "Your project's URL and API key are required"

**Symptôme :**
```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**Cause :**
Les variables d'environnement ne sont pas configurées ou sont incorrectes.

**Solution :**
1. Vérifiez que `.env.local` existe à la racine du projet
2. Vérifiez qu'il contient :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```
3. Redémarrez le serveur de développement :
```bash
npm run dev
```

---

### Erreur: "relation 'profiles' does not exist"

**Symptôme :**
```
ERROR: relation "public.profiles" does not exist
```

**Cause :**
Le schéma SQL n'a pas été exécuté dans Supabase.

**Solution :**
1. Allez dans Supabase Dashboard > SQL Editor
2. Copiez le contenu de `supabase-schema.sql`
3. Collez et exécutez le script complet
4. Vérifiez dans Table Editor que toutes les tables sont créées

---

### Erreur: "new row violates row-level security policy"

**Symptôme :**
```
ERROR: new row violates row-level security policy for table "projects"
```

**Cause :**
La politique RLS empêche l'opération. Causes possibles :
- Un BDE essaie de poster un projet sans avoir donné de feedback
- Un ORGA essaie de poster un projet (interdit)
- L'utilisateur n'est pas authentifié

**Solution :**
1. Vérifiez que l'utilisateur est connecté
2. Pour un BDE, vérifiez qu'il n'y a pas de feedback en attente :
```sql
SELECT * FROM projects
WHERE bde_id = 'votre-uuid'
  AND status = 'completed'
  AND feedback_given = FALSE;
```
3. Si un feedback est en attente, complétez-le avant de créer un nouveau projet

---

## 🖥️ Problèmes Next.js

### Erreur: "middleware" file convention is deprecated

**Symptôme :**
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Cause :**
Warning de Next.js 16.x concernant la convention de nommage.

**Impact :**
Aucun impact fonctionnel, juste un warning.

**Solution future :**
Attendez la stabilisation de Next.js 16+ ou ignorez le warning pour le moment.

---

### Build échoue: "Minified React error #418"

**Symptôme :**
Le build échoue avec une erreur React cryptique.

**Cause :**
Probablement un hook React utilisé conditionnellement.

**Solution :**
1. Vérifiez que tous les hooks (`useState`, `useEffect`, etc.) sont appelés inconditionnellement
2. Vérifiez qu'aucun composant client n'est importé dans un Server Component sans `'use client'`

---

### Erreur: "Cannot read properties of undefined (reading 'role')"

**Symptôme :**
```
TypeError: Cannot read properties of undefined (reading 'role')
```

**Cause :**
Le profil utilisateur n'existe pas dans la base de données.

**Solution :**
1. Vérifiez que le profil a été créé lors de l'inscription
2. Dans Supabase, vérifiez la table `profiles` :
```sql
SELECT * FROM profiles WHERE id = 'votre-user-id';
```
3. Si le profil n'existe pas, recréez le compte

---

## 🎨 Problèmes de Style

### Les classes Tailwind ne s'appliquent pas

**Symptôme :**
Les styles définis en CSS ne sont pas appliqués.

**Cause :**
Le cache de Tailwind ou du navigateur.

**Solution :**
1. Supprimez le cache Next.js :
```bash
rm -rf .next
```
2. Redémarrez le serveur :
```bash
npm run dev
```
3. Videz le cache du navigateur (Ctrl+Shift+R)

---

### Les variables CSS (--bg-primary, etc.) ne fonctionnent pas

**Symptôme :**
Les couleurs du design system ne s'appliquent pas.

**Cause :**
Les variables CSS sont définies dans `globals.css` mais peut-être pas importées.

**Solution :**
Vérifiez que `globals.css` est bien importé dans `app/layout.tsx` :
```tsx
import "./globals.css";
```

---

## 🔐 Problèmes d'Authentification

### "Auth session missing"

**Symptôme :**
L'utilisateur est redirigé vers la page de connexion en permanence.

**Cause :**
La session n'est pas persistée ou le middleware ne fonctionne pas.

**Solution :**
1. Vérifiez que `middleware.ts` existe à la racine
2. Videz les cookies du navigateur
3. Reconnectez-vous

---

### "Email already registered"

**Symptôme :**
Impossible de créer un compte avec un email déjà utilisé.

**Cause :**
L'email est déjà dans Supabase Auth.

**Solution :**
1. Utilisez un autre email, OU
2. Supprimez l'ancien compte dans Supabase Dashboard > Authentication > Users

---

## 📦 Problèmes npm

### "Cannot find module '@supabase/ssr'"

**Symptôme :**
```
Error: Cannot find module '@supabase/ssr'
```

**Cause :**
Les dépendances ne sont pas installées.

**Solution :**
```bash
npm install
```

---

### "npm ERR! code ERESOLVE"

**Symptôme :**
Conflit de dépendances lors de l'installation.

**Solution :**
```bash
npm install --legacy-peer-deps
```

---

## 🚀 Problèmes de Déploiement

### Build Vercel échoue

**Symptôme :**
Le déploiement Vercel échoue au moment du build.

**Cause :**
Variables d'environnement manquantes ou erreur de build.

**Solution :**
1. Ajoutez les variables d'environnement dans Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Vérifiez que le build passe localement :
```bash
npm run build
```

---

### Les pages ne se chargent pas en production

**Symptôme :**
L'application fonctionne localement mais pas en production.

**Cause :**
Potentiellement un problème de RLS ou de variables d'environnement.

**Solution :**
1. Vérifiez les logs Vercel
2. Vérifiez que les variables d'environnement sont configurées
3. Testez les requêtes Supabase dans la console du navigateur

---

## 📝 Logs Utiles

### Vérifier les logs Supabase

Dans Supabase Dashboard :
1. Allez dans **Logs**
2. Sélectionnez **Postgres Logs**
3. Cherchez les erreurs liées à vos requêtes

### Vérifier les logs Next.js

En développement :
```bash
npm run dev
# Les logs apparaissent dans le terminal
```

En production (Vercel) :
1. Allez dans votre projet Vercel
2. Cliquez sur **Deployments**
3. Cliquez sur le déploiement
4. Allez dans **Functions** > Sélectionnez une fonction > **Logs**

---

## 🆘 Support

Si votre problème n'est pas listé ici :

1. **Vérifiez la documentation :**
   - [README.md](README.md)
   - [QUICKSTART.md](QUICKSTART.md)
   - [claude.md](claude.md)

2. **Cherchez dans les issues GitHub :**
   - Supabase: https://github.com/supabase/supabase/issues
   - Next.js: https://github.com/vercel/next.js/issues

3. **Créez une issue** avec :
   - La description du problème
   - Les messages d'erreur complets
   - Les étapes pour reproduire
   - Votre environnement (OS, Node version, etc.)

---

**Dernière mise à jour :** 2026-01-22
