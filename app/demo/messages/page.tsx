"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Send, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUserConversations } from "@/lib/utils/messaging";

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: "BDE" | "ORGA";
  participantAvatar: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// Mock data - Utilisé si pas d'authentification
const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participantId: "orga-1",
    participantName: "EventPro Solutions",
    participantRole: "ORGA",
    participantAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=EventPro",
    lastMessage: "Parfait ! Je confirme notre disponibilité pour le 15 mars.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    unreadCount: 2,
  },
  {
    id: "conv-2",
    participantId: "bde-1",
    participantName: "BDE Polytech Paris",
    participantRole: "BDE",
    participantAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=BDE+Polytech",
    lastMessage: "Avez-vous du matériel de sonorisation disponible ?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
    unreadCount: 0,
  },
  {
    id: "conv-3",
    participantId: "orga-2",
    participantName: "SoundTech Pro",
    participantRole: "ORGA",
    participantAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=SoundTech",
    lastMessage: "Nous pouvons vous proposer un devis pour votre gala.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unreadCount: 1,
  },
  {
    id: "conv-4",
    participantId: "bde-2",
    participantName: "BDE ESSEC",
    participantRole: "BDE",
    participantAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=ESSEC",
    lastMessage: "Merci pour votre retour ! À bientôt.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    unreadCount: 0,
  },
];

export default function MessagesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  // Charger les conversations depuis Supabase
  useEffect(() => {
    async function loadConversations() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setIsDemo(false);
          const supabaseConversations = await getUserConversations(supabase, user.id);

          if (supabaseConversations.length > 0) {
            setConversations(supabaseConversations as Conversation[]);
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [supabase]);

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-[#7C3AED]" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
                <p className="text-sm text-[#A0A0A0] mt-1">
                  {filteredConversations.length} conversation
                  {filteredConversations.length > 1 ? "s" : ""}
                  {isDemo && <span className="ml-2 text-[#7C3AED]">(Mode Démo)</span>}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/demo/bde/dashboard")}
              className="px-4 py-2 bg-[#0A0A0A] border border-[#1A1A1A] text-white text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
            >
              Retour Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#1A1A1A] text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#A0A0A0]">Chargement des conversations...</p>
          </div>
        ) : (
          <>
            {/* Conversations List */}
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-[#A0A0A0] mx-auto mb-4" />
                  <p className="text-[#A0A0A0]">
                    {searchQuery
                      ? "Aucune conversation trouvée"
                      : "Aucune conversation"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => router.push(`/demo/messages/${conv.id}`)}
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] p-4 hover:bg-[#1A1A1A] transition-all duration-200 group text-left"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={conv.participantAvatar}
                          alt={conv.participantName}
                          className="w-12 h-12 rounded-sm border border-[#1A1A1A]"
                        />
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-[#7C3AED] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-[#7C3AED] transition-colors">
                              {conv.participantName}
                            </h3>
                            <span
                              className={`inline-block text-xs px-2 py-0.5 mt-1 border ${
                                conv.participantRole === "BDE"
                                  ? "bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED]"
                                  : "bg-[#00FF66]/10 border-[#00FF66] text-[#00FF66]"
                              }`}
                            >
                              {conv.participantRole}
                            </span>
                          </div>
                          <span className="text-xs text-[#A0A0A0] whitespace-nowrap">
                            {formatLastMessageTime(conv.lastMessageAt)}
                          </span>
                        </div>

                        <p
                          className={`text-sm ${
                            conv.unreadCount > 0
                              ? "text-white font-medium"
                              : "text-[#A0A0A0]"
                          } line-clamp-2`}
                        >
                          {conv.lastMessage}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <Send className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#7C3AED] transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Stats Footer */}
            <div className="mt-8 p-4 bg-[#0A0A0A] border border-[#1A1A1A]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A0A0A0]">Messages non lus</span>
                <span className="text-[#7C3AED] font-semibold">
                  {conversations.reduce(
                    (acc, conv) => acc + conv.unreadCount,
                    0
                  )}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
