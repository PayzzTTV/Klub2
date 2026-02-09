# 🔧 Guide de Configuration Supabase pour KLUB

## 📋 Prérequis

- Un projet Supabase créé sur [supabase.com](https://supabase.com)
- Le schéma SQL exécuté (fichier `supabase-schema.sql`)

---

## 🔑 Étape 1 : Récupérer Vos Clés API

### 1.1 Accéder au Dashboard Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous avec votre compte
3. Sélectionnez le projet **KLUB** (ou créez-en un si ce n'est pas déjà fait)

### 1.2 Trouver les Clés API
1. Dans le menu de gauche, cliquez sur **⚙️ Settings**
2. Allez dans **API** dans le sous-menu
3. Vous verrez deux sections importantes :

#### Project URL
```
https://[votre-project-id].supabase.co
```
**Exemple:** `https://abcdefghijklmnop.supabase.co`

#### API Keys
Vous avez deux clés importantes :

**anon / public** (clé publique - safe pour le client)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
C'est une **très longue chaîne** qui commence par `eyJ` et fait plusieurs centaines de caractères.

**service_role** (clé secrète - NE PAS exposer au client)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
Encore une longue chaîne commençant par `eyJ`.

⚠️ **IMPORTANT:**
- Utilisez la clé `anon/public` dans votre fichier `.env.local` pour `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- NE PARTAGEZ JAMAIS la clé `service_role` publiquement

---

## 📝 Étape 2 : Configurer `.env.local`

### 2.1 Ouvrir le fichier `.env.local`
Le fichier se trouve à la racine du projet : `c:\projet\Klub\.env.local`

### 2.2 Remplacer les Valeurs
```bash
# Configuration Supabase - KLUB Platform
NEXT_PUBLIC_SUPABASE_URL=https://[VOTRE_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Exemple concret:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.3 Sauvegarder et Redémarrer
1. **Sauvegardez** le fichier `.env.local`
2. **Redémarrez** le serveur Next.js :
   ```bash
   # Arrêtez le serveur actuel (Ctrl+C)
   npm run dev
   ```

---

## 🗄️ Étape 3 : Exécuter le Schéma SQL

### 3.1 Aller dans SQL Editor
1. Dans votre Dashboard Supabase, cliquez sur **🔧 SQL Editor** dans le menu de gauche
2. Cliquez sur **+ New query**

### 3.2 Copier le Schéma
1. Ouvrez le fichier `supabase-schema.sql` à la racine du projet
2. **Copiez tout le contenu** (Ctrl+A puis Ctrl+C)
3. **Collez** dans l'éditeur SQL de Supabase (Ctrl+V)

### 3.3 Exécuter le Script
1. Cliquez sur **▶ Run** en bas à droite
2. Attendez quelques secondes
3. Vous devriez voir : **Success. No rows returned**

### 3.4 Vérifier les Tables
1. Allez dans **📊 Table Editor** (menu de gauche)
2. Vous devriez voir 8 nouvelles tables :
   - ✅ profiles
   - ✅ projects
   - ✅ inventory
   - ✅ rentals
   - ✅ reviews
   - ✅ conversations
   - ✅ messages
   - ✅ project_applications

---

## 🔐 Étape 4 : Configurer l'Authentification

### 4.1 Activer Email/Password Auth
1. Allez dans **🔑 Authentication** → **Providers**
2. Assurez-vous que **Email** est activé (toggle vert)
3. Configuration recommandée :
   - ✅ Enable email confirmations: **OFF** (pour le développement)
   - ✅ Enable phone confirmations: **OFF**
   - ✅ Double opt-in: **OFF**

### 4.2 Configurer l'URL du Site
1. Allez dans **Authentication** → **URL Configuration**
2. Site URL: `http://localhost:3000` (développement)
3. Redirect URLs: Ajoutez :
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`

---

## 📦 Étape 5 : Configurer Storage (Optionnel)

### 5.1 Créer les Buckets
1. Allez dans **🗂️ Storage** dans le menu de gauche
2. Cliquez sur **Create a new bucket**

#### Bucket 1 : avatars
- **Name:** `avatars`
- **Public:** ✅ Yes (les avatars sont publics)
- **File size limit:** 2MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

#### Bucket 2 : equipment-images
- **Name:** `equipment-images`
- **Public:** ✅ Yes
- **File size limit:** 5MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

### 5.2 Configurer les Politiques Storage
Pour chaque bucket, allez dans **Policies** et créez :

**Policy pour Upload (avatars):**
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy pour Lecture (avatars):**
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

---

## ✅ Étape 6 : Tester la Configuration

### 6.1 Vérifier la Connexion
1. Assurez-vous que votre serveur Next.js tourne : `npm run dev`
2. Ouvrez votre navigateur : `http://localhost:3000`
3. Ouvrez la **Console** du navigateur (F12)
4. Vérifiez qu'il n'y a pas d'erreur Supabase

### 6.2 Tester l'Inscription
1. Allez sur `http://localhost:3000/demo` (ou créez une vraie page de signup)
2. Essayez de créer un compte
3. Vérifiez dans **Authentication** → **Users** de Supabase que l'utilisateur est créé

### 6.3 Vérifier les Tables
1. Allez dans **Table Editor**
2. Ouvrez la table `profiles`
3. Vérifiez que des données peuvent être insérées

---

## 🐛 Dépannage

### Erreur : "Invalid API key"
- ✅ Vérifiez que vous avez copié la **clé complète** (elle est très longue)
- ✅ Assurez-vous d'utiliser la clé `anon` et non `service_role`
- ✅ Pas d'espaces avant/après la clé dans `.env.local`

### Erreur : "Failed to fetch"
- ✅ Vérifiez que l'URL Supabase est correcte (format: `https://xxx.supabase.co`)
- ✅ Vérifiez que le projet Supabase n'est pas en pause
- ✅ Redémarrez votre serveur Next.js après modification de `.env.local`

### Erreur : "Row Level Security"
- ✅ Vérifiez que vous avez bien exécuté **tout** le fichier `supabase-schema.sql`
- ✅ Les politiques RLS doivent être activées (elles le sont par défaut dans le schéma)

### Les Tables n'Apparaissent Pas
- ✅ Rafraîchissez la page du Dashboard Supabase
- ✅ Vérifiez qu'il n'y a pas d'erreur dans l'exécution du SQL (onglet "Results")
- ✅ Essayez d'exécuter le schéma morceau par morceau (types → tables → policies)

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Documentation Supabase:** [docs.supabase.com](https://docs.supabase.com)
2. **Discord Supabase:** [discord.supabase.com](https://discord.supabase.com)
3. **Stack Overflow:** Tag `supabase`

---

## 🎯 Checklist Finale

Avant de considérer la configuration comme terminée :

- [ ] URL Supabase configurée dans `.env.local`
- [ ] Clé `anon` configurée dans `.env.local`
- [ ] Serveur Next.js redémarré
- [ ] Schéma SQL exécuté avec succès
- [ ] 8 tables créées dans Supabase
- [ ] Email Auth activé
- [ ] Redirect URLs configurées
- [ ] Storage buckets créés (optionnel)
- [ ] Test de connexion réussi

---

**Dernière mise à jour:** 2 Février 2026
**Version:** 1.0
**Pour le projet:** KLUB v0.4.0
