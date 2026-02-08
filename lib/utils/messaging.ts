import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Crée une nouvelle conversation ou retourne l'ID d'une conversation existante
 * entre deux utilisateurs
 */
export async function createOrGetConversation(
  supabase: SupabaseClient,
  userId: string,
  otherUserId: string
): Promise<string | null> {
  try {
    // Vérifier si une conversation existe déjà entre ces deux utilisateurs
    const { data: existing, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${userId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${userId})`)
      .single();

    if (existing && !searchError) {
      return existing.id;
    }

    // Si aucune conversation n'existe, en créer une nouvelle
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId,
        participant2_id: otherUserId,
        last_message_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return null;
    }

    return newConv?.id || null;
  } catch (error) {
    console.error('Error in createOrGetConversation:', error);
    return null;
  }
}

/**
 * Récupère toutes les conversations d'un utilisateur avec les informations
 * du dernier message et du participant
 */
export async function getUserConversations(
  supabase: SupabaseClient,
  userId: string
) {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        last_message_at,
        participant1:profiles!conversations_participant1_id_fkey(
          id,
          name,
          role,
          avatar_url,
          organization_name
        ),
        participant2:profiles!conversations_participant2_id_fkey(
          id,
          name,
          role,
          avatar_url,
          organization_name
        )
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Récupérer le dernier message et le nombre de messages non lus pour chaque conversation
    const conversationsWithMessages = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Déterminer qui est l'autre participant
        const otherParticipant =
          conv.participant1_id === userId ? conv.participant2 : conv.participant1;

        // Récupérer le dernier message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Compter les messages non lus
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', userId);

        return {
          id: conv.id,
          participantId: otherParticipant?.id || '',
          participantName: otherParticipant?.name || 'Utilisateur inconnu',
          participantRole: otherParticipant?.role || 'ORGA',
          participantAvatar:
            otherParticipant?.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant?.name}`,
          participantOrganization: otherParticipant?.organization_name || '',
          lastMessage: lastMessage?.content || 'Aucun message',
          lastMessageAt: new Date(
            lastMessage?.created_at || conv.last_message_at
          ),
          unreadCount: unreadCount || 0,
        };
      })
    );

    return conversationsWithMessages;
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    return [];
  }
}

/**
 * Récupère tous les messages d'une conversation
 */
export async function getConversationMessages(
  supabase: SupabaseClient,
  conversationId: string
) {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return messages || [];
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
}

/**
 * Envoie un nouveau message dans une conversation
 */
export async function sendMessage(
  supabase: SupabaseClient,
  conversationId: string,
  senderId: string,
  content: string
) {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Mettre à jour le timestamp de la dernière activité de la conversation
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return message;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
}

/**
 * Marque tous les messages d'une conversation comme lus
 */
export async function markMessagesAsRead(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
  }
}

/**
 * Récupère les informations du participant d'une conversation
 */
export async function getConversationParticipant(
  supabase: SupabaseClient,
  conversationId: string,
  currentUserId: string
) {
  try {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        participant1:profiles!conversations_participant1_id_fkey(
          id,
          name,
          role,
          avatar_url,
          organization_name
        ),
        participant2:profiles!conversations_participant2_id_fkey(
          id,
          name,
          role,
          avatar_url,
          organization_name
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    // Déterminer qui est l'autre participant
    const otherParticipant =
      conversation.participant1_id === currentUserId
        ? conversation.participant2
        : conversation.participant1;

    if (!otherParticipant) {
      return null;
    }

    return {
      id: otherParticipant.id,
      name: otherParticipant.name,
      role: otherParticipant.role,
      avatar:
        otherParticipant.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.name}`,
      organization_name: otherParticipant.organization_name,
    };
  } catch (error) {
    console.error('Error in getConversationParticipant:', error);
    return null;
  }
}
