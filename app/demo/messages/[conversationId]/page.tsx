"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, MoreVertical, Paperclip, Smile } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getConversationMessages,
  getConversationParticipant,
  sendMessage,
  markMessagesAsRead,
} from "@/lib/utils/messaging";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Participant {
  id: string;
  name: string;
  role: "BDE" | "ORGA";
  avatar: string;
  organization_name: string;
}

// Mock data pour la démo (si pas authentifié)
const mockParticipants: Record<string, Participant> = {
  "conv-1": {
    id: "orga-1",
    name: "EventPro Solutions",
    role: "ORGA",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EventPro",
    organization_name: "EventPro Solutions",
  },
  "conv-2": {
    id: "bde-1",
    name: "BDE Polytech Paris",
    role: "BDE",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BDE+Polytech",
    organization_name: "Polytech Paris",
  },
  "conv-3": {
    id: "orga-2",
    name: "SoundTech Pro",
    role: "ORGA",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SoundTech",
    organization_name: "SoundTech Pro",
  },
  "conv-4": {
    id: "bde-2",
    name: "BDE ESSEC",
    role: "BDE",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ESSEC",
    organization_name: "ESSEC Business School",
  },
};

const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversation_id: "conv-1",
      sender_id: "current-user",
      content: "Bonjour ! Seriez-vous disponible pour notre gala le 15 mars ?",
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "msg-2",
      conversation_id: "conv-1",
      sender_id: "orga-1",
      content:
        "Bonjour ! Oui, nous sommes disponibles. Quel type de prestation recherchez-vous ?",
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: "msg-3",
      conversation_id: "conv-1",
      sender_id: "current-user",
      content:
        "Nous aurions besoin d'une sonorisation complète pour 500 personnes, ainsi que de l'éclairage scénique.",
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    },
    {
      id: "msg-4",
      conversation_id: "conv-1",
      sender_id: "orga-1",
      content:
        "Parfait ! Nous avons exactement ce qu'il vous faut. Je vous envoie un devis détaillé d'ici demain.",
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: "msg-5",
      conversation_id: "conv-1",
      sender_id: "orga-1",
      content: "Parfait ! Je confirme notre disponibilité pour le 15 mars.",
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("current-user");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation data from Supabase
  useEffect(() => {
    async function loadConversationData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setIsDemo(false);
          setCurrentUserId(user.id);

          // Load participant info
          const participantData = await getConversationParticipant(
            supabase,
            conversationId,
            user.id
          );

          if (participantData) {
            setParticipant(participantData);
          }

          // Load messages
          const messagesData = await getConversationMessages(supabase, conversationId);
          if (messagesData.length > 0) {
            setMessages(messagesData);
          }

          // Mark messages as read
          await markMessagesAsRead(supabase, conversationId, user.id);
        } else {
          // Mode démo : utiliser les mock data
          setParticipant(mockParticipants[conversationId] || null);
          setMessages(mockMessages[conversationId] || []);
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        // Fallback vers mode démo en cas d'erreur
        setParticipant(mockParticipants[conversationId] || null);
        setMessages(mockMessages[conversationId] || []);
      } finally {
        setLoading(false);
      }
    }

    loadConversationData();
  }, [conversationId, supabase]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (isDemo) return; // Pas de Realtime en mode démo

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
          setMessages((prev) => {
            // Éviter les doublons
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });

          // Marquer comme lu si ce n'est pas notre message
          if (newMsg.sender_id !== currentUserId) {
            markMessagesAsRead(supabase, conversationId, currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, isDemo, supabase]);

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

    // Envoyer le message à Supabase (si authentifié)
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

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-[#7C3AED] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#A0A0A0]">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A0A0A0] mb-4">Conversation introuvable</p>
          <button
            onClick={() => router.push("/demo/messages")}
            className="px-4 py-2 bg-[#7C3AED] text-white hover:bg-[#6C2BD9] transition-colors"
          >
            Retour aux messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/demo/messages")}
                className="p-2 hover:bg-[#1A1A1A] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-10 h-10 rounded-sm border border-[#1A1A1A]"
              />

              <div>
                <h2 className="font-semibold">{participant.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs px-2 py-0.5 border ${
                      participant.role === "BDE"
                        ? "bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED]"
                        : "bg-[#00FF66]/10 border-[#00FF66] text-[#00FF66]"
                    }`}
                  >
                    {participant.role}
                  </span>
                  {isDemo && (
                    <span className="text-xs text-[#A0A0A0]">(Mode Démo)</span>
                  )}
                  {isTyping && (
                    <span className="text-xs text-[#A0A0A0]">
                      En train d'écrire...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button className="p-2 hover:bg-[#1A1A1A] transition-colors">
              <MoreVertical className="w-5 h-5 text-[#A0A0A0]" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? "bg-[#7C3AED] text-white"
                      : "bg-[#0A0A0A] border border-[#1A1A1A] text-white"
                  } px-4 py-3 rounded-sm`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <div
                    className={`flex items-center gap-2 mt-2 text-xs ${
                      isOwnMessage
                        ? "text-purple-200 justify-end"
                        : "text-[#A0A0A0]"
                    }`}
                  >
                    <span>{formatMessageTime(message.created_at)}</span>
                    {isOwnMessage && (
                      <span>{message.read ? "✓✓" : "✓"}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-end gap-3">
            <button className="p-2 text-[#A0A0A0] hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Écrivez votre message..."
                rows={1}
                className="w-full px-4 py-3 bg-black border border-[#1A1A1A] text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#7C3AED] transition-colors resize-none"
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
                }}
              />
            </div>

            <button className="p-2 text-[#A0A0A0] hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-3 transition-all ${
                newMessage.trim()
                  ? "bg-[#7C3AED] text-white hover:bg-[#6C2BD9]"
                  : "bg-[#1A1A1A] text-[#A0A0A0] cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#A0A0A0] mt-2">
            Appuyez sur Entrée pour envoyer, Shift+Entrée pour un saut de ligne
          </p>
        </div>
      </div>
    </div>
  );
}
