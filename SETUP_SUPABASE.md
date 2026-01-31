# 🔧 Configuration Supabase - Guide Pas à Pas

**Problème actuel :** Le localhost ne fonctionne pas car les clés Supabase ne sont pas configurées correctement.

**Clé fournie :** `sb_publishable_ZTy998Kq3NSumdb6aNCoLA_Pfqn1JGL` semble être une clé Stripe, pas Supabase.

---

## 📝 Comment Récupérer vos Vraies Clés Supabase

### Étape 1 : Aller sur votre Projet Supabase

1. Ouvrez https://supabase.com
2. Connectez-vous à votre compte
3. Sélectionnez votre projet KLUB (ou créez-en un si besoin)

### Étape 2 : Accéder aux Clés API

1. Dans la sidebar gauche, cliquez sur l'icône **⚙️ Settings** (en bas)
2. Cliquez sur **API** dans le menu
3. Vous verrez cette page :

```
Configuration
  ├── Project URL
  │   └── https://xxxxxxxxx.supabase.co
  │
  └── API Keys
      ├── anon public (visible)
      │   └── eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
      │
      └── service_role (cachée, cliquez sur "Reveal")
          └── eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
```

### Étape 3 : Copier les Clés

**IMPORTANT:** Vous avez besoin de :
1. **Project URL** - ressemble à `https://xrpqwvkfgcbhmloznjta.supabase.co`
2. **anon public key** - commence par `eyJ...` (très longue, environ 150+ caractères)

⚠️ **NE PAS** utiliser la clé `service_role` (trop de permissions, dangereuse côté client)

---

## 🔐 Configuration du .env.local

### Méthode Manuelle

1. Ouvrez le fichier `.env.local` à la racine du projet
2. Remplacez les placeholders par vos vraies valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-vrai-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre-vraie-cle-ici
```

3. Sauvegardez le fichier
4. **Redémarrez le serveur** :
```bash
# Arrêtez le serveur (Ctrl+C dans le terminal)
# Relancez-le
npm run dev
```

---

## ✅ Vérification que ça Fonctionne

### Test 1 : Le serveur démarre

```bash
npm run dev
```

Vous devriez voir :
```
✓ Ready in 2s
  Local:   http://localhost:3000
```

### Test 2 : Page d'accueil

Ouvrez http://localhost:3000

Vous devriez voir la landing page KLUB avec :
- Logo KLUB (K violet)
- 3 cartes (Projets, Matériel, Réputation)
- Boutons "Se connecter" et "Créer un compte"

### Test 3 : Inscription

1. Cliquez sur "Créer un compte"
2. Remplissez le formulaire
3. Créez un compte BDE ou ORGA
4. Vous devriez être redirigé vers le dashboard

### Test 4 : Vérifier dans Supabase

1. Allez sur Supabase Dashboard
2. Cliquez sur **Table Editor**
3. Ouvrez la table `profiles`
4. Vous devriez voir votre profil !

---

## 🐛 Si ça ne Marche Toujours Pas

### Erreur : "Invalid API key"

**Cause :** La clé `anon` est incorrecte

**Solution :**
1. Vérifiez que vous avez copié la **bonne** clé (anon public, PAS service_role)
2. Vérifiez qu'il n'y a pas d'espaces avant/après la clé
3. La clé doit commencer par `eyJ`

### Erreur : "Project not found"

**Cause :** L'URL du projet est incorrecte

**Solution :**
1. Vérifiez l'URL dans Supabase Dashboard > Settings > API
2. Elle doit être de la forme `https://xxxxxxxxx.supabase.co`
3. **Pas** de `/` à la fin

### Erreur : "relation 'profiles' does not exist"

**Cause :** Le schéma SQL n'a pas été exécuté

**Solution :**
1. Allez sur Supabase Dashboard > SQL Editor
2. Copiez TOUT le contenu de `supabase-schema.sql`
3. Collez et exécutez
4. Vérifiez dans Table Editor que toutes les tables sont créées

---

## 📞 Besoin d'Aide Immédiate ?

Si vous voyez encore des erreurs, copiez-moi :

1. **L'URL de votre projet** (format `https://xxx.supabase.co`)
2. **Les 30 premiers caractères de votre clé anon** (pour vérifier le format)
3. **Le message d'erreur exact** que vous voyez dans le terminal

Je vous aiderai à diagnostiquer !

---

## 🎉 Une Fois que ça Marche

Vous pourrez accéder à :

- ✅ **Landing page** : http://localhost:3000
- ✅ **Connexion** : http://localhost:3000/login
- ✅ **Inscription** : http://localhost:3000/signup
- ✅ **Dashboard BDE** : http://localhost:3000/dashboard/bde
- ✅ **Dashboard ORGA** : http://localhost:3000/dashboard/orga
- ✅ **Créer un projet** : http://localhost:3000/projects/new
- ✅ **Liste des projets** : http://localhost:3000/projects

---

**Dernière mise à jour :** 2026-01-22
