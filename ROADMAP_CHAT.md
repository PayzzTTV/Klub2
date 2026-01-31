# 💬 Roadmap Système de Chat KLUB

## 📋 Vue d'ensemble

Système de messagerie temps réel permettant aux BDE et aux ORGA de communiquer directement dans le cadre de projets ou de locations de matériel.

---

## 🎯 Objectifs

1. **Communication directe** - Permettre aux BDE et ORGA d'échanger facilement
2. **Contexte projet** - Chat lié à une candidature ou une location
3. **Temps réel** - Messages instantanés avec Supabase Realtime
4. **Matching IA** - Suggestions automatiques de matériel basées sur les conversations
5. **UX fluide** - Interface moderne avec indicateurs de présence et lecture

---

## 🗄️ Structure Base de Données

### Table `conversations`
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bde_id UUID REFERENCES profiles(id) NOT NULL,
  orga_id UUID REFERENCES profiles(id) NOT NULL,
  project_id UUID REFERENCES projects(id), -- Optionnel: contexte projet
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(bde_id, orga_id, project_id)
);
```

### Table `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Index pour performance
  INDEX idx_conversation_messages (conversation_id, created_at DESC),
  INDEX idx_unread_messages (conversation_id, read) WHERE read = FALSE
);
```

### Table `typing_indicators` (Realtime)
```sql
CREATE TABLE typing_indicators (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  typing BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW(),

  PRIMARY KEY (conversation_id, user_id)
);
```

---

## 🚀 Phases de Développement

### Phase 7.1: Infrastructure Chat (3-4h)
- [x] Créer les tables Supabase (conversations, messages)
- [ ] Implémenter les politiques RLS
- [ ] Configurer Supabase Realtime subscriptions
- [ ] Créer les types TypeScript

### Phase 7.2: Interface Liste Conversations (3h)
- [ ] Page `/messages` avec liste des conversations
- [ ] Afficher preview du dernier message
- [ ] Badge de compteur de messages non lus
- [ ] Recherche de conversations
- [ ] Tri par date du dernier message

### Phase 7.3: Interface Chat (4-5h)
- [ ] Composant ChatWindow avec messages
- [ ] Input message avec auto-resize
- [ ] Affichage des messages (sender vs receiver)
- [ ] Scroll automatique vers le bas
- [ ] Timestamps formatés
- [ ] Indicateur "Message lu" (double check)

### Phase 7.4: Temps Réel (2-3h)
- [ ] Subscription Supabase Realtime pour nouveaux messages
- [ ] Update automatique de la liste des conversations
- [ ] Notifications sonores (optionnel)
- [ ] Indicateur "en train d'écrire..."
- [ ] Statut en ligne/hors ligne

### Phase 7.5: Intégration Projet/Candidature (2h)
- [ ] Bouton "Envoyer un message" depuis page détail candidature
- [ ] Création automatique de conversation avec contexte projet
- [ ] Affichage du projet dans l'en-tête du chat
- [ ] Lien rapide vers le projet depuis le chat

### Phase 7.6: Notifications (2h)
- [ ] Badge de compteur dans la navbar
- [ ] Marquer comme lu au clic
- [ ] Notification push navigateur (optionnel)
- [ ] Email pour messages non lus après 24h (optionnel)

### Phase 7.7: Matching IA dans Chat (4-5h) ⭐
- [ ] Analyser les mots-clés dans les messages
- [ ] Détecter les demandes de matériel ("j'ai besoin de...", "cherche...")
- [ ] Suggérer automatiquement du matériel de l'inventaire
- [ ] Afficher les suggestions en sidebar du chat
- [ ] Bouton rapide pour envoyer un lien vers l'annonce

---

## 🎨 Design & UX

### Liste des Conversations
```
┌─────────────────────────────────────────┐
│  💬 Messages                    [3]     │
├─────────────────────────────────────────┤
│  🔍 Rechercher...                       │
├─────────────────────────────────────────┤
│  🎵 SoundTech Events                [2] │
│  Gala de fin d'année 2026               │
│  "Ok parfait, on se..." • Il y a 5min   │
├─────────────────────────────────────────┤
│  💡 LightShow Pro                   [1] │
│  Festival Campus Summer                 │
│  "Voici notre devis..." • Il y a 2h     │
├─────────────────────────────────────────┤
│  🎪 EventPro                            │
│  Soirée d'intégration                   │
│  "Merci pour votre ret..." • Hier       │
└─────────────────────────────────────────┘
```

### Fenêtre de Chat
```
┌─────────────────────────────────────────┐
│  ← 🎵 SoundTech Events          [...] │
│  Gala de fin d'année 2026               │
├─────────────────────────────────────────┤
│                                         │
│  [Eux] Bonjour, j'ai consulté votre   │
│        projet. Nous sommes intéressés  │
│        15:23                           │
│                                         │
│                    [Vous] Parfait !    │
│                    Avez-vous du        │
│                    matériel son ?      │
│                    ✓✓ 15:25            │
│                                         │
│  [Eux] Oui, nous avons un système     │
│        professionnel 15kW              │
│        💬 En train d'écrire...         │
│                                         │
├─────────────────────────────────────────┤
│  💡 IA: Détecté "matériel son"         │
│  └─ Voir inventaire SoundTech →        │
├─────────────────────────────────────────┤
│  [Tapez votre message...]          [⬆] │
└─────────────────────────────────────────┘
```

---

## 🔧 Fonctionnalités Clés

### 1. Création de Conversation
**Depuis la page candidature** (`/demo/projects/1/applications/1`):
- Bouton "💬 Envoyer un message"
- Crée automatiquement une conversation avec contexte projet
- Redirige vers `/messages?conversation=<id>`

**Depuis le profil ORGA**:
- Bouton "💬 Contacter"
- Conversation générale (sans projet)

### 2. Messages Temps Réel
- **Envoyer:** INSERT dans `messages` → trigger update `conversations.last_message_at`
- **Recevoir:** Subscription Supabase Realtime `ON INSERT`
- **Marquer lu:** UPDATE `messages.read = true` quand conversation ouverte

### 3. Indicateur "En train d'écrire"
- **Typing start:** User commence à taper → INSERT/UPDATE `typing_indicators`
- **Typing stop:** User arrête → DELETE `typing_indicators` après 3 secondes
- **Display:** Subscription Realtime affiche "💬 En train d'écrire..."

### 4. Matching IA
**Déclenchement:**
- Analyse chaque message envoyé
- Recherche de patterns: "besoin de", "cherche", "louer", catégories (son, lumière, etc.)

**Suggestions:**
```typescript
// Exemple de détection
const keywords = extractKeywords(message.content);
// keywords: ['son', 'enceintes', '500 personnes']

const suggestions = await supabase
  .from('inventory')
  .select('*')
  .or(`title.ilike.%${keywords.join('%')},description.ilike.%${keywords.join('%')}`)
  .eq('available', true)
  .limit(3);
```

**Affichage:**
- Sidebar du chat avec mini-cartes matériel
- Bouton "Envoyer dans le chat" → Insère lien automatiquement

---

## 🔐 Politiques RLS

### Conversations
```sql
-- Lecture: Seulement BDE et ORGA participants
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (auth.uid() = bde_id OR auth.uid() = orga_id);

-- Création: BDE ou ORGA
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = bde_id OR auth.uid() = orga_id);
```

### Messages
```sql
-- Lecture: Seulement membres de la conversation
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (bde_id = auth.uid() OR orga_id = auth.uid())
  )
);

-- Création: Seulement membres de la conversation
CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (bde_id = auth.uid() OR orga_id = auth.uid())
  )
);

-- Update: Seulement pour marquer comme lu
CREATE POLICY "Users can mark messages as read"
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (bde_id = auth.uid() OR orga_id = auth.uid())
  )
);
```

---

## 📊 Métriques & Monitoring

### KPIs à suivre:
- Nombre de conversations actives
- Taux de réponse moyen (temps entre 1er et 2e message)
- Nombre de messages par conversation
- Taux de conversion candidature → message → acceptation
- Efficacité du matching IA (clics sur suggestions)

---

## 🎯 Prochaines Étapes (Post-MVP)

### Fonctionnalités Avancées
- [ ] Messages vocaux
- [ ] Partage de fichiers (PDF devis, images)
- [ ] Réactions emoji sur messages
- [ ] Messages épinglés
- [ ] Archivage de conversations
- [ ] Suppression de messages (avec historique)
- [ ] Templates de messages rapides
- [ ] Bot d'assistance automatique

### Intégrations
- [ ] Notifications email pour nouveaux messages
- [ ] Notifications push mobile (PWA)
- [ ] Export PDF de conversation (pour archives)
- [ ] Signature électronique de devis dans le chat

---

**Dernière mise à jour:** 2026-01-31 (22:15)
**Priorité:** 🔥 HAUTE - Feature clé pour l'engagement utilisateur
**Estimation totale:** 20-25 heures de développement
