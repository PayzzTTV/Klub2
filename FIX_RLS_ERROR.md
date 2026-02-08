# 🔧 Fix RLS Error - "new row violates row-level security policy"

## 🚨 Problème

Tu rencontres l'erreur : **"new row violates row-level security policy for table 'profiles'"**

Cela signifie que les politiques de sécurité Supabase (RLS - Row Level Security) bloquent les opérations sur les tables.

---

## ✅ Solution Rapide

### Option 1 : Désactiver RLS Temporairement (Mode Démo)

**⚠️ UNIQUEMENT POUR LE DÉVELOPPEMENT - NE JAMAIS FAIRE EN PRODUCTION**

Dans Supabase Dashboard :

1. Va dans **Database** > **Tables**
2. Pour chaque table (`profiles`, `conversations`, `messages`) :
   - Clique sur les 3 points ⋮
   - Clique sur **Edit Table**
   - Décoche **Enable Row Level Security (RLS)**
   - Clique sur **Save**

**Tables à désactiver pour le mode démo** :
- ✅ `profiles`
- ✅ `conversations`
- ✅ `messages`
- ✅ `projects`
- ✅ `inventory`

---

### Option 2 : Appliquer les Politiques RLS Correctes (Recommandé)

#### Étape 1 : Ouvrir SQL Editor

1. Va dans Supabase Dashboard
2. Clique sur **SQL Editor** dans le menu de gauche

#### Étape 2 : Exécuter le Script de Fix

Copie le contenu du fichier [supabase-rls-fix.sql](supabase-rls-fix.sql) et colle-le dans SQL Editor, puis clique sur **Run**.

**OU** exécute manuellement ces commandes essentielles :

```sql
-- PROFILES : Lecture publique des ORGA
DROP POLICY IF EXISTS "Public can view ORGA profiles" ON profiles;

CREATE POLICY "Public can view ORGA profiles"
ON profiles FOR SELECT
USING (role = 'ORGA' OR auth.uid() = id);

-- CONVERSATIONS : Création autorisée
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = participant1_id);

-- MESSAGES : Envoi autorisé dans ses conversations
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;

CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  )
);
```

---

## 🎯 Comprendre le Problème

### Pourquoi RLS Bloque ?

Les politiques RLS protègent tes données en s'assurant que :

1. **Profiles** : Seul le propriétaire peut voir/modifier son profil (sauf ORGA publics)
2. **Conversations** : Seuls les participants peuvent accéder
3. **Messages** : Seuls les participants de la conversation peuvent lire/écrire

### En Mode Démo (Sans Auth)

Quand tu n'es **pas authentifié**, `auth.uid()` retourne `null`, donc :
- ❌ Impossible de créer/lire des profils
- ❌ Impossible de créer/lire des conversations
- ❌ Impossible d'envoyer des messages

C'est pourquoi l'app utilise des **mock data** en mode démo !

---

## 🔄 Workflow Correct

### Mode Démo (Sans Auth) ✅
```
User (non authentifié)
  ↓
auth.uid() = null
  ↓
Utilise mockConversations
  ↓
Pas d'appel Supabase
  ↓
✅ Fonctionne
```

### Mode Production (Avec Auth) ✅
```
User authentifié
  ↓
auth.uid() = "uuid-123"
  ↓
Charge depuis Supabase
  ↓
RLS autorise (participant1_id = uuid-123)
  ↓
✅ Fonctionne
```

---

## 🧪 Tester après le Fix

### Test 1 : Mode Démo (Sans Auth)

```bash
# Ouvre http://localhost:3000/demo/messages
# Tu dois voir les 4 conversations mock
# Pas d'erreur RLS
```

### Test 2 : Profils Publics ORGA

```sql
-- Crée un profil ORGA de test
INSERT INTO profiles (id, email, name, role, organization_name)
VALUES (
  gen_random_uuid(),
  'test@orga.com',
  'Test ORGA',
  'ORGA',
  'Test Organization'
);

-- Vérifie que tu peux le lire sans auth
SELECT * FROM profiles WHERE role = 'ORGA';
-- ✅ Doit fonctionner
```

### Test 3 : Authentification + Conversations

```javascript
// 1. Se connecter
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// 2. Créer une conversation
const { data, error } = await supabase
  .from('conversations')
  .insert({
    participant1_id: user.id,
    participant2_id: 'other-user-id',
  })
  .select();

console.log(data, error);
// ✅ Doit fonctionner sans erreur RLS
```

---

## 🚀 Recommandations

### Pour le Développement

**Option A : RLS Désactivé (Plus Simple)**
- Désactive RLS sur toutes les tables
- ✅ Pas de blocages
- ✅ Développement rapide
- ⚠️ NE JAMAIS deployer comme ça

**Option B : RLS Activé (Plus Réaliste)**
- Garde RLS activé
- Utilise toujours l'authentification pour tester
- ✅ Teste les vraies conditions de production
- ⚠️ Plus complexe à développer

### Pour la Production

**TOUJOURS activer RLS !**
```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- rowsecurity doit être 't' (true) pour toutes les tables
```

---

## 📊 Politiques RLS Appliquées

### Résumé des Politiques

| Table | Lecture | Création | Modification |
|-------|---------|----------|--------------|
| **profiles** | ORGA publics, BDE privés | Utilisateur authentifié | Propriétaire |
| **conversations** | Participants | Participant1 authentifié | Participants |
| **messages** | Participants conv | Sender authentifié + participant | Participants |
| **projects** | Projets publiés + propriétaire | BDE uniquement | Créateur |
| **inventory** | Matériel dispo + propriétaire | Utilisateur authentifié | Propriétaire |
| **reviews** | Public | BDE après projet complété | Immutable |
| **rentals** | Locataire + propriétaire | Locataire authentifié | Les deux |
| **project_applications** | BDE + ORGA concerné | ORGA authentifié | BDE + ORGA |

---

## 🔍 Debug RLS

### Vérifier les Politiques Actives

```sql
-- Lister toutes les politiques
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Tester une Politique

```sql
-- Se mettre dans le contexte d'un utilisateur
SET LOCAL "request.jwt.claims" = '{"sub": "uuid-du-user"}';

-- Tester une requête
SELECT * FROM conversations;

-- Réinitialiser
RESET "request.jwt.claims";
```

### Logs d'Erreurs RLS

Dans la console browser (F12) :
```javascript
// Activer les logs détaillés
localStorage.setItem('supabase.auth.debug', true);

// Recharger la page et check les erreurs
```

---

## 📝 Checklist Post-Fix

- [ ] Script RLS exécuté dans SQL Editor
- [ ] Aucune erreur dans SQL Editor
- [ ] Test lecture profils ORGA (sans auth) → ✅
- [ ] Test création conversation (avec auth) → ✅
- [ ] Test envoi message (avec auth) → ✅
- [ ] Mode démo fonctionne (mock data) → ✅
- [ ] Pas d'erreur RLS dans console browser → ✅

---

## 🆘 Toujours des Erreurs ?

### Erreur : "insufficient_privilege"

**Cause** : L'utilisateur n'a pas les droits d'exécuter le SQL

**Solution** :
- Vérifie que tu es connecté avec le bon compte Supabase
- Utilise le SQL Editor (pas psql direct)
- Redemarre Supabase si nécessaire

### Erreur : "policy already exists"

**Cause** : La politique existe déjà

**Solution** :
```sql
-- Supprimer d'abord
DROP POLICY IF EXISTS "nom_de_la_politique" ON nom_table;

-- Puis recréer
CREATE POLICY ...
```

### Erreur persiste après fix

**Solution nucléaire** (dev uniquement) :
```sql
-- DÉSACTIVER RLS sur toutes les tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE rentals DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications DISABLE ROW LEVEL SECURITY;
```

---

## 🔗 Ressources

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [supabase-rls-fix.sql](supabase-rls-fix.sql) - Script de fix complet
- [SUPABASE_INTEGRATION_GUIDE.md](SUPABASE_INTEGRATION_GUIDE.md) - Guide d'intégration

---

**Dernière mise à jour:** 2 Février 2026 à 16:15
**Version:** 1.0.0
**Statut:** ✅ Fix Disponible
