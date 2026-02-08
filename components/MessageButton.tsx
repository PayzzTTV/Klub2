"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createOrGetConversation } from "@/lib/utils/messaging";

interface MessageButtonProps {
  targetUserId: string;
  targetUserName: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export default function MessageButton({
  targetUserId,
  targetUserName,
  className = "",
  variant = "secondary",
}: MessageButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Mode démo : rediriger vers une conversation mock
        router.push("/demo/messages/conv-1");
        return;
      }

      // Créer ou récupérer la conversation
      const conversationId = await createOrGetConversation(
        supabase,
        user.id,
        targetUserId
      );

      if (conversationId) {
        router.push(`/demo/messages/${conversationId}`);
      } else {
        console.error("Impossible de créer la conversation");
        // Fallback vers mode démo
        router.push("/demo/messages/conv-1");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Fallback vers mode démo
      router.push("/demo/messages/conv-1");
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses =
    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "primary"
      ? "bg-[#7C3AED] text-white hover:bg-[#6C2BD9]"
      : "bg-[#0A0A0A] border border-[#1A1A1A] text-white hover:bg-[#1A1A1A]";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
      title={`Envoyer un message à ${targetUserName}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Chargement...</span>
        </>
      ) : (
        <>
          <MessageCircle className="w-4 h-4" />
          <span>Message</span>
        </>
      )}
    </button>
  );
}
