# 🚀 KLUB - Guide de Démarrage Rapide

## Étape 1 : Configuration de Supabase (15 min)

### 1.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Remplissez :
   - **Name:** KLUB
   - **Database Password:** (Notez-le quelque part !)
   - **Region:** Choisissez le plus proche
4. Cliquez sur "Create new project" et attendez 2-3 minutes

### 1.2 Exécuter le schéma SQL

1. Dans votre projet Supabase, cliquez sur l'icône **SQL Editor** (dans la sidebar gauche)
2. Cliquez sur "+ New query"
3. Ouvrez le fichier `supabase-schema.sql` de ce projet
4. **Copiez TOUT le contenu** et collez-le dans l'éditeur SQL
5. Cliquez sur "Run" (ou Ctrl+Enter)
6. ✅ Vous devriez voir "Success. No rows returned"

### 1.3 Vérifier les tables

1. Cliquez sur **Table Editor** dans la sidebar
2. Vous devriez voir ces tables :
   - ✅ profiles
   - ✅ projects
   - ✅ inventory
   - ✅ rentals
   - ✅ reviews
   - ✅ conversations
   - ✅ messages
   - ✅ project_applications

Si toutes les tables sont là, c'est bon ! ✅

### 1.4 Récupérer vos clés API

1. Cliquez sur **Settings** (icône engrenage en bas de la sidebar)
2. Allez dans **API**
3. Copiez ces deux valeurs :
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public** (la clé qui commence par `eyJ...`)

## Étape 2 : Configuration du Projet (5 min)

### 2.1 Configurer les variables d'environnement

1. Ouvrez le fichier `.env.local` à la racine du projet
2. Remplacez les placeholders :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-vraie-cle-anon-ici
```

3. **Sauvegardez le fichier**

### 2.2 Installer les dépendances (si pas déjà fait)

```bash
npm install
```

## Étape 3 : Lancer l'Application (1 min)

```bash
npm run dev
```

Ouvrez votre navigateur sur [http://localhost:3000](http://localhost:3000)

## 🎉 Tester l'Application

### Test 1 : Créer un compte BDE

1. Cliquez sur "Créer un compte"
2. Sélectionnez **BDE**
3. Remplissez le formulaire :
   - Nom : "Jean Dupont"
   - Organisation : "BDE Polytechnique"
   - Localisation : "Paris"
   - Email : "jean@test.fr"
   - Mot de passe : "test123"
4. Cliquez sur "Créer mon compte"

### Test 2 : Créer un compte ORGA

1. Déconnectez-vous (ou utilisez un autre navigateur)
2. Créez un nouveau compte
3. Sélectionnez **ORGA**
4. Remplissez :
   - Nom : "Marie Martin"
   - Organisation : "SoundPro Events"
   - Localisation : "Lyon"
   - Email : "marie@test.fr"
   - Mot de passe : "test123"

### Test 3 : Vérifier dans Supabase

1. Retournez sur Supabase
2. Allez dans **Table Editor > profiles**
3. Vous devriez voir vos 2 profils créés !

## 🔥 Prochaines Étapes

Maintenant que l'application fonctionne, vous pouvez :

1. **Développer le Dashboard BDE** (voir [claude.md](claude.md))
2. **Créer le Rental Hub** pour le matériel
3. **Implémenter le système de feedback**

## 🐛 Problèmes Courants

### Erreur "Invalid API key"

➡️ Vérifiez que vous avez bien copié la clé `anon public` (pas la `service_role`)

### Les pages ne se chargent pas

➡️ Vérifiez que `npm run dev` tourne sans erreur

### "Auth session missing"

➡️ Normal si vous n'êtes pas connecté, allez sur `/signup`

### Le build échoue

➡️ Assurez-vous que `.env.local` contient vos vraies clés Supabase

## 📚 Ressources

- [claude.md](claude.md) - Roadmap complète du projet
- [README.md](README.md) - Documentation détaillée
- [Supabase Docs](https://supabase.com/docs) - Documentation Supabase

---

**Besoin d'aide ?** Consultez le fichier [claude.md](claude.md) pour plus de détails sur l'architecture du projet.
