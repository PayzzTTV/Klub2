# 🔗 Guide d'Intégration Supabase - Système de Messagerie

## 📋 Vue d'ensemble

Le système de messagerie de KLUB est maintenant **entièrement connecté à Supabase** avec un fallback vers les données mock pour le mode démo. Cela permet de tester l'interface sans authentification tout en ayant un système production-ready.

---

## ✅ Ce qui a été fait

### 1. Fonctions Utilitaires (`lib/utils/messaging.ts`)

Toutes les fonctions nécessaires pour gérer la messagerie avec Supabase :

#### `createOrGetConversation(supabase, userId, otherUserId)`
- Crée une nouvelle conversation entre deux utilisateurs
- Ou retourne l'ID d'une conversation existante
- Gère les cas où la conversation existe dans les deux sens (participant1/participant2)

#### `getUserConversations(supabase, userId)`
- Récupère toutes les conversations d'un utilisateur
- Inclut les informations du participant (nom, rôle, avatar)
- Calcule le dernier message et le nombre de messages non lus
- Tri par date de dernière activité

#### `getConversationMessages(supabase, conversationId)`
- Récupère tous les messages d'une conversation
- Tri chronologique

#### `sendMessage(supabase, conversationId, senderId, content)`
- Envoie un nouveau message
- Met à jour le timestamp `last_message_at` de la conversation
- Retourne le message créé

#### `markMessagesAsRead(supabase, conversationId, userId)`
- Marque tous les messages non lus comme lus
- Seulement pour les messages reçus (pas les messages envoyés)

#### `getConversationParticipant(supabase, conversationId, currentUserId)`
- Récupère les infos de l'autre participant d'une conversation
- Utile pour afficher le header du chat

---

### 2. Page Liste des Conversations (`app/demo/messages/page.tsx`)

**Fonctionnalités Hybrid (Mock + Supabase):**

- ✅ **Mode Démo**: Utilise les mock data si pas authentifié
- ✅ **Mode Production**: Charge les conversations depuis Supabase si authentifié
- ✅ **Loading State**: Spinner pendant le chargement
- ✅ **Indicateur Mode**: Affiche "(Mode Démo)" dans le header
- ✅ **Recherche**: Fonctionne en mode démo ET production
- ✅ **Messages non lus**: Comptage dynamique

**Code clé:**
```typescript
useEffect(() => {
  async function loadConversations() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setIsDemo(false);
      const supabaseConversations = await getUserConversations(supabase, user.id);

      if (supabaseConversations.length > 0) {
        setConversations(supabaseConversations);
      }
    }
    // Sinon, utilise les mockConversations par défaut
  }

  loadConversations();
}, [supabase]);
```

---

### 3. Page Chat Individuel (`app/demo/messages/[conversationId]/page.tsx`)

**Fonctionnalités Hybrid (Mock + Supabase):**

- ✅ **Mode Démo**: Utilise les mock data si pas authentifié
- ✅ **Mode Production**: Charge les messages depuis Supabase
- ✅ **Supabase Realtime**: Écoute les nouveaux messages en temps réel
- ✅ **Envoi de messages**: Enregistre dans Supabase si authentifié
- ✅ **Optimistic UI**: Affiche instantanément les messages envoyés
- ✅ **Marquage auto**: Marque comme lus les messages reçus
- ✅ **Auto-scroll**: Scroll vers le bas sur nouveau message

**Code Supabase Realtime:**
```typescript
useEffect(() => {
  if (isDemo) return; // Pas de Realtime en mode démo

  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => {
      const newMsg = payload.new as Message;
      setMessages((prev) => {
        // Éviter les doublons
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Marquer comme lu si ce n'est pas notre message
      if (newMsg.sender_id !== currentUserId) {
        markMessagesAsRead(supabase, conversationId, currentUserId);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [conversationId, currentUserId, isDemo, supabase]);
```

**Code Envoi de Message:**
```typescript
const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

  const tempMessage: Message = {
    id: `temp-${Date.now()}`,
    conversation_id: conversationId,
    sender_id: currentUserId,
    content: newMessage.trim(),
    read: false,
    created_at: new Date().toISOString(),
  };

  // Optimistic UI update
  setMessages((prev) => [...prev, tempMessage]);
  setNewMessage("");

  // Envoyer à Supabase (si authentifié)
  if (!isDemo) {
    const sentMessage = await sendMessage(
      supabase,
      conversationId,
      currentUserId,
      newMessage.trim()
    );

    if (sentMessage) {
      // Remplacer le message temporaire par le vrai message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? sentMessage : m))
      );
    } else {
      // En cas d'erreur, retirer le message temporaire
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  }
};
```

---

### 4. Composant MessageButton (`components/MessageButton.tsx`)

Bouton réutilisable pour démarrer une conversation depuis n'importe où :

**Props:**
- `targetUserId`: ID de l'utilisateur à qui envoyer un message
- `targetUserName`: Nom de l'utilisateur (pour l'accessibilité)
- `className`: Classes CSS additionnelles
- `variant`: "primary" ou "secondary"

**Comportement:**
1. Si pas authentifié → Redirige vers `conv-1` (mode démo)
2. Si authentifié → Crée/récupère la conversation et redirige vers le chat

**Utilisation:**
```tsx
<MessageButton
  targetUserId="orga-123"
  targetUserName="EventPro Solutions"
  variant="secondary"
/>
```

---

## 🔄 Flux de Données

### Mode Démo (Sans Authentification)
```
User → Page → mockConversations → UI
          ↓
     mockMessages
```

### Mode Production (Avec Authentification)
```
User → Page → supabase.auth.getUser()
          ↓
     getUserConversations(userId)
          ↓
     Supabase Query → conversations + messages
          ↓
     UI Update
          ↓
     Realtime Subscription
          ↓
     Nouveaux messages en temps réel
```

---

## 📊 Structure de Données

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

### Politiques RLS

**Conversations:**
- ✅ Lecture: Seulement si participant
- ✅ Création: Utilisateur authentifié peut créer
- ✅ Modification: Seulement si participant (pour `last_message_at`)

**Messages:**
- ✅ Lecture: Seulement si participant de la conversation
- ✅ Création: Seulement si participant et sender correspond
- ✅ Modification: Seulement pour `read` par le destinataire

---

## 🧪 Tests à Effectuer

### Mode Démo (Sans Auth)
- [ ] Accéder à `/demo/messages` → Voir 4 conversations mock
- [ ] Cliquer sur une conversation → Ouvrir le chat
- [ ] Envoyer un message → Affichage instantané (UI uniquement)
- [ ] Rechercher "EventPro" → Filtrer la liste
- [ ] Vérifier l'indicateur "(Mode Démo)"

### Mode Production (Avec Auth)
- [ ] Se connecter avec un compte Supabase
- [ ] Accéder à `/demo/messages` → Charger les conversations depuis DB
- [ ] Vérifier que l'indicateur "(Mode Démo)" n'est pas affiché
- [ ] Cliquer sur une conversation → Charger les messages depuis DB
- [ ] Envoyer un message → Sauvegarder dans Supabase
- [ ] Ouvrir deux navigateurs avec deux comptes → Tester Realtime
- [ ] Envoyer un message depuis navigateur 1 → Apparaît dans navigateur 2
- [ ] Vérifier le marquage "lu" automatique

### Création de Conversations
- [ ] Utiliser `MessageButton` depuis une page de projet
- [ ] Vérifier la création de conversation
- [ ] Vérifier qu'une conversation existante n'est pas dupliquée

---

## 🚀 Prochaines Étapes

### Authentification
Pour activer le mode production, il faut implémenter l'authentification :

1. **Page de connexion** (`/auth/login`)
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password',
   });
   ```

2. **Page d'inscription** (`/auth/signup`)
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password',
     options: {
       data: {
         name: 'Jean Dupont',
         role: 'BDE',
       }
     }
   });
   ```

3. **Création du profil automatique** (Trigger Supabase)
   ```sql
   CREATE OR REPLACE FUNCTION create_profile_for_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO profiles (id, email, name, role)
     VALUES (
       NEW.id,
       NEW.email,
       NEW.raw_user_meta_data->>'name',
       NEW.raw_user_meta_data->>'role'
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW
     EXECUTE FUNCTION create_profile_for_user();
   ```

### Notifications
Ajouter des notifications de nouveaux messages :

1. **Badge count dans le menu**
   ```typescript
   const { data: unreadCount } = await supabase
     .from('messages')
     .select('*', { count: 'exact', head: true })
     .eq('read', false)
     .neq('sender_id', userId);
   ```

2. **Notifications browser** (Service Worker)
   ```typescript
   if ('Notification' in window && Notification.permission === 'granted') {
     new Notification('Nouveau message', {
       body: 'EventPro Solutions vous a envoyé un message',
       icon: '/icon.png',
     });
   }
   ```

### Fonctionnalités Avancées
Voir [MESSAGING_SYSTEM.md](MESSAGING_SYSTEM.md) pour la liste complète :
- Indicateur "en train d'écrire"
- Envoi de fichiers
- Réactions aux messages
- Recherche dans les messages
- Messages vocaux
- **Matching IA** (Phase 8)

---

## 🔧 Dépannage

### Problème: "Can't resolve '@/lib/utils/messaging'"
**Solution**: Vérifier que le fichier existe et que le tsconfig.json a le bon path mapping :
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Problème: Pas de messages en temps réel
**Solution**:
1. Vérifier que Realtime est activé dans Supabase Dashboard
2. Vérifier les logs du channel dans la console
3. S'assurer que les RLS policies autorisent la lecture

### Problème: "Conversation introuvable"
**Solution**:
1. Vérifier que l'utilisateur est participant de la conversation
2. Vérifier les RLS policies
3. Tester en mode démo pour isoler le problème

### Problème: Messages ne s'affichent pas
**Solution**:
1. Vérifier la console pour les erreurs
2. Tester la query manuellement dans SQL Editor
3. Vérifier que `conversation_id` correspond

---

## 📝 Checklist de Migration vers Production

- [ ] Activer l'authentification Supabase
- [ ] Tester la création de profils automatique
- [ ] Créer quelques utilisateurs de test (BDE et ORGA)
- [ ] Créer des conversations de test
- [ ] Envoyer des messages de test
- [ ] Tester Realtime avec deux navigateurs
- [ ] Vérifier les RLS policies
- [ ] Tester la création de conversations depuis `MessageButton`
- [ ] Vérifier le marquage "lu" automatique
- [ ] Tester la recherche de conversations
- [ ] Vérifier les performances (nombre de requêtes)
- [ ] Optimiser avec `select()` spécifique si nécessaire
- [ ] Ajouter la gestion d'erreurs UI
- [ ] Ajouter les notifications
- [ ] Tester sur mobile
- [ ] Déployer en production

---

## 📚 Ressources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [MESSAGING_SYSTEM.md](MESSAGING_SYSTEM.md) - Documentation complète du système
- [CLAUDE.md](CLAUDE.md) - Documentation principale du projet

---

**Dernière mise à jour:** 2 Février 2026
**Version:** 2.0.0 - Intégration Supabase Complète
**Statut:** ✅ Production-Ready (avec Auth)
