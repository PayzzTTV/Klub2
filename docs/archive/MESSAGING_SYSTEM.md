# 💬 Système de Messagerie Temps Réel - KLUB

## 📋 Vue d'ensemble

Le système de messagerie de KLUB permet aux BDE et aux Orgas de communiquer en temps réel. Il utilise Supabase Realtime pour des mises à jour instantanées sans rechargement de page.

---

## 🎯 Fonctionnalités

### ✅ Actuellement Implémentées (Mode Démo)

1. **Liste des Conversations** (`/demo/messages`)
   - Affichage de toutes les conversations
   - Aperçu du dernier message
   - Badge de comptage des messages non lus
   - Recherche par nom de participant
   - Horodatage dynamique (il y a X min/h/j)
   - Avatar et badge de rôle (BDE/ORGA)

2. **Chat Individuel** (`/demo/messages/[conversationId]`)
   - Interface de chat en temps réel
   - Messages alignés selon l'émetteur
   - Input multi-lignes avec support Shift+Enter
   - Bouton d'envoi désactivé si message vide
   - Auto-scroll vers le dernier message
   - Horodatage des messages
   - Indicateur de lecture (✓ / ✓✓)
   - Header avec profil du participant

3. **Intégrations**
   - Bouton "💬 Message" dans les candidatures de projets
   - Lien "Messages" dans la navigation du Dashboard BDE
   - Carte de présentation sur la page démo principale

### 🔄 Supabase Realtime (Prêt pour Production)

Le code inclut déjà la configuration pour Supabase Realtime :

```typescript
// Subscription aux nouveaux messages
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      const newMsg = payload.new as Message;
      setMessages((prev) => [...prev, newMsg]);
    }
  )
  .subscribe();
```

---

## 🗄️ Structure de Données

### Table `conversations`

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES profiles(id) NOT NULL,
  participant2_id UUID REFERENCES profiles(id) NOT NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table `messages`

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Transition vers Production

### Étape 1: Remplacer les Mock Data

**Dans `/demo/messages/page.tsx`:**

```typescript
// ❌ Avant (Mock)
const mockConversations: Conversation[] = [...];

// ✅ Après (Production)
const { data: conversations, error } = await supabase
  .from('conversations')
  .select(`
    id,
    last_message_at,
    participant1:profiles!participant1_id(id, name, role, avatar_url, organization_name),
    participant2:profiles!participant2_id(id, name, role, avatar_url, organization_name),
    messages(content, created_at, read)
  `)
  .order('last_message_at', { ascending: false });
```

**Dans `/demo/messages/[conversationId]/page.tsx`:**

```typescript
// ❌ Avant (Mock)
const mockMessages: Record<string, Message[]> = {...};

// ✅ Après (Production)
const { data: messages } = await supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true });
```

### Étape 2: Activer l'Envoi de Messages

Décommenter et configurer la fonction `handleSendMessage`:

```typescript
const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

  const { data, error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: currentUserId, // Récupéré depuis le contexte d'authentification
    content: newMessage.trim(),
  }).select();

  if (error) {
    console.error('Erreur envoi message:', error);
    return;
  }

  // L'optimistic UI est déjà en place
  setNewMessage("");
};
```

### Étape 3: Gestion des Conversations

Créer une fonction pour démarrer une nouvelle conversation :

```typescript
// lib/utils/messaging.ts
export async function createOrGetConversation(
  userId: string,
  otherUserId: string,
  supabase: SupabaseClient
) {
  // Vérifier si une conversation existe déjà
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .or(`participant1_id.eq.${otherUserId},participant2_id.eq.${otherUserId}`)
    .single();

  if (existing) return existing.id;

  // Créer une nouvelle conversation
  const { data: newConv } = await supabase
    .from('conversations')
    .insert({
      participant1_id: userId,
      participant2_id: otherUserId,
    })
    .select('id')
    .single();

  return newConv.id;
}
```

---

## 🔐 Row Level Security (RLS)

Les politiques RLS sont déjà configurées dans `supabase-schema.sql`:

### Conversations

```sql
-- Lecture: Seulement si participant
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Création: Utilisateur authentifié peut créer
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = participant1_id);
```

### Messages

```sql
-- Lecture: Seulement si participant de la conversation
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  )
);

-- Création: Seulement si participant et sender correspond
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

## 🎨 Design System (Dark Brutalism)

### Couleurs Utilisées

- **Fond principal**: `#000000` (noir pur)
- **Fond secondaire**: `#0A0A0A`
- **Bordures**: `#1A1A1A`
- **Texte principal**: `#FFFFFF`
- **Texte secondaire**: `#A0A0A0`
- **Accent BDE**: `#7C3AED` (violet électrique)
- **Accent ORGA**: `#00FF66` (vert acide)
- **Alerte/Erreur**: `#FF0055`

### Composants Stylisés

```css
/* Message de l'utilisateur */
bg-[#7C3AED] text-white

/* Message reçu */
bg-[#0A0A0A] border border-[#1A1A1A] text-white

/* Badge non lu */
bg-[#7C3AED] text-white (cercle avec count)

/* Input focus */
focus:border-[#7C3AED]
```

---

## 📊 Fonctionnalités Avancées (Post-MVP)

### 🔮 À Implémenter Plus Tard

1. **Indicateur "En train d'écrire..."**
   - Utiliser Supabase Presence API
   - Afficher en temps réel si l'interlocuteur écrit

2. **Envoi de Fichiers**
   - Upload vers Supabase Storage
   - Prévisualisation des images
   - Support PDF, documents

3. **Réactions aux Messages**
   - Emojis rapides (👍, ❤️, 😂)
   - Stockage dans une table `message_reactions`

4. **Recherche dans les Messages**
   - Full-text search PostgreSQL
   - Filtres par date, participant

5. **Notifications Push**
   - Service Worker pour notifications browser
   - Intégration avec Supabase Edge Functions

6. **Messages Vocaux**
   - Enregistrement audio dans le browser
   - Stockage dans Supabase Storage
   - Lecteur audio intégré

7. **Statut En Ligne / Hors Ligne**
   - Supabase Presence API
   - Affichage du statut dans le header

8. **Archivage de Conversations**
   - Masquer sans supprimer
   - Filtres "Actives" / "Archivées"

9. **Matching IA (Roadmap Phase 8)**
   - Analyse des mots-clés dans le chat
   - Détection d'objets demandés (matériel)
   - Suggestions automatiques d'annonces du rental hub
   - Intégration OpenAI API ou Claude API

---

## 🧪 Testing

### Mode Démo

Le mode démo utilise des données mock pour tester l'interface sans backend :

```typescript
// 4 conversations préchargées
mockConversations = [
  { id: "conv-1", participantName: "EventPro Solutions", ... },
  { id: "conv-2", participantName: "BDE Polytech Paris", ... },
  // ...
];

// Messages pour conv-1
mockMessages["conv-1"] = [
  { content: "Bonjour ! Seriez-vous disponible...", ... },
  // ...
];
```

### Tests à Effectuer

- [ ] Affichage de la liste des conversations
- [ ] Recherche de conversations
- [ ] Ouverture d'un chat individuel
- [ ] Envoi d'un message
- [ ] Réception d'un message en temps réel (via Realtime)
- [ ] Marquage des messages comme lus
- [ ] Navigation retour vers la liste
- [ ] Responsive mobile
- [ ] Scroll automatique vers le bas

---

## 📁 Fichiers Créés

```
app/demo/messages/
├── page.tsx                          # Liste des conversations
└── [conversationId]/
    └── page.tsx                      # Chat individuel

components/ui/
└── (Réutilisation des composants existants)

lib/supabase/
└── client.ts                         # Client Supabase (déjà existant)

MESSAGING_SYSTEM.md                   # Cette documentation
```

---

## 🚦 Statut Actuel

| Fonctionnalité | Statut | Notes |
|----------------|--------|-------|
| Liste des conversations | ✅ Complet | Mock data, recherche fonctionnelle |
| Chat individuel | ✅ Complet | UI complète, input multi-lignes |
| Supabase Realtime | ✅ Intégré | Code prêt, à tester en production |
| Envoi de messages | ⚠️ Partiellement | UI complète, backend commenté |
| Notifications | ❌ À faire | Post-MVP |
| Matching IA | ❌ À faire | Phase 8 de la roadmap |

---

## 🔗 Navigation

- **Page d'accueil**: [/demo](/demo)
- **Dashboard BDE**: [/demo/bde/dashboard](/demo/bde/dashboard)
- **Liste des messages**: [/demo/messages](/demo/messages)
- **Conversation démo**: [/demo/messages/conv-1](/demo/messages/conv-1)

---

## 📝 Prochaines Étapes

1. **Tester le mode démo** - Vérifier que tout fonctionne visuellement
2. **Configurer l'authentification** - Nécessaire pour obtenir `currentUserId`
3. **Remplacer les mock data** - Connecter aux vraies tables Supabase
4. **Tester Supabase Realtime** - Vérifier les mises à jour en temps réel
5. **Ajouter la création de conversations** - Depuis profil ORGA, candidatures
6. **Implémenter les notifications** - Badge count dans le menu

---

**Dernière mise à jour:** 2026-02-02
**Version:** 1.0.0
**Statut:** ✅ Mode Démo Complet
