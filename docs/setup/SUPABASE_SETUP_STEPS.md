# 🚀 Guide Rapide - Configuration Supabase KLUB

## ⚠️ Erreur Rencontrée

Vous avez reçu cette erreur :
```
ERROR: 42710: type "user_role" already exists
```

Cela signifie que vous avez déjà exécuté une partie du schéma SQL précédemment.

---

## 🎯 Deux Solutions Possibles

### Option 1 : Nettoyage Complet + Recréation (Recommandé)

**Utilisez cette option si :**
- ✅ Vous êtes en développement (pas de données importantes)
- ✅ Vous voulez repartir sur une base propre
- ✅ Vous n'avez pas encore de vraies données utilisateur

**Étapes :**

1. **Ouvrir le Dashboard Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Sélectionnez votre projet KLUB
   - Cliquez sur **SQL Editor** (dans le menu de gauche)

2. **Exécuter le script de nettoyage**
   - Cliquez sur **+ New query**
   - Ouvrez le fichier `supabase-schema-clean.sql`
   - **Copiez TOUT le contenu** (Ctrl+A puis Ctrl+C)
   - **Collez** dans l'éditeur SQL de Supabase
   - Cliquez sur **▶ Run**
   - Attendez le message : **Success. No rows returned**

3. **Exécuter le schéma complet**
   - Créez une **nouvelle query** (+ New query)
   - Ouvrez le fichier `supabase-schema.sql`
   - **Copiez TOUT le contenu**
   - **Collez** dans l'éditeur SQL
   - Cliquez sur **▶ Run**
   - Attendez la confirmation

4. **Vérifier la création**
   - Allez dans **Table Editor** (menu de gauche)
   - Vous devriez voir 8 tables :
     - ✅ profiles
     - ✅ projects
     - ✅ inventory
     - ✅ rentals
     - ✅ reviews
     - ✅ conversations
     - ✅ messages
     - ✅ project_applications

---

### Option 2 : Migration Incrémentale (Plus sûr)

**Utilisez cette option si :**
- ✅ Vous avez déjà des données que vous voulez conserver
- ✅ Vous voulez juste ajouter ce qui manque
- ✅ Vous n'êtes pas sûr de l'état actuel de votre base

**Étapes :**

1. **Ouvrir le Dashboard Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - SQL Editor → + New query

2. **Exécuter le schéma sécurisé**
   - Ouvrez le fichier `supabase-schema-safe.sql`
   - **Copiez TOUT le contenu**
   - **Collez** dans l'éditeur SQL
   - Cliquez sur **▶ Run**
   - Le script créera uniquement ce qui n'existe pas déjà

3. **Vérifier**
   - Table Editor → Vérifier que toutes les tables sont présentes

---

## ✅ Après l'Exécution du Schéma

### 1. Activer l'Authentification Email

1. Allez dans **Authentication** → **Providers**
2. Assurez-vous que **Email** est activé (toggle vert)
3. Configuration recommandée pour le développement :
   - ❌ Enable email confirmations: **OFF**
   - ❌ Enable phone confirmations: **OFF**

### 2. Configurer les URLs

1. **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs:** Ajoutez :
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`

### 3. Tester la Configuration

Ouvrez votre navigateur et allez sur :
```
http://localhost:3000/demo
```

Vérifiez qu'il n'y a pas d'erreur dans la console (F12).

---

## 🐛 Dépannage

### Erreur : "relation already exists"
- ✅ Utilisez `supabase-schema-safe.sql` au lieu de `supabase-schema.sql`

### Erreur : "permission denied"
- ✅ Assurez-vous d'être connecté comme propriétaire du projet
- ✅ Vérifiez que vous êtes dans le bon projet Supabase

### Les politiques RLS ne fonctionnent pas
- ✅ Vérifiez que RLS est activé (c'est fait automatiquement dans le script)
- ✅ Testez avec un utilisateur authentifié

---

## 📊 Ordre des Fichiers SQL

**Pour un setup propre (Option 1) :**
```
1. supabase-schema-clean.sql   ← Nettoie tout
2. supabase-schema.sql          ← Crée tout de zéro
```

**Pour un setup sécurisé (Option 2) :**
```
1. supabase-schema-safe.sql     ← Crée uniquement ce qui manque
```

---

## 🎯 Checklist Finale

Avant de considérer Supabase comme configuré :

- [ ] Schéma SQL exécuté sans erreur
- [ ] 8 tables créées dans Table Editor
- [ ] Authentication Email activée
- [ ] Redirect URLs configurées
- [ ] Test de connexion à `http://localhost:3000/demo` OK
- [ ] Pas d'erreur dans la console du navigateur

---

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. **Vérifiez les logs SQL** - Dans SQL Editor, regardez l'onglet "Results" pour voir les erreurs détaillées
2. **Consultez la documentation** - [docs.supabase.com](https://docs.supabase.com)
3. **Créez un nouveau projet** - Si tout est cassé, le plus simple est parfois de repartir sur un nouveau projet Supabase

---

**Dernière mise à jour:** 2 Février 2026
**Version:** 1.0
**Pour le projet:** KLUB v0.4.0
