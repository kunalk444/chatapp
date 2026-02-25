"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Search, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ConversationSidebar } from "@/app/components/chat/ConversationSidebar";
import { ChatWindow, type ChatMessage } from "@/app/components/chat/ChatWindow";

type ConversationItem = {
  conversationId: Id<"conversations">;
  participantClerkId: string;
  participantName: string;
  participantEmail: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
  isOnline: boolean;
};

type MemberSearchResult = {
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
};

type MessageRow = {
  id: Id<"messages">;
  senderId: string;
  content: string;
  createdAt: number;
};

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStartConversationAtRef = useRef(0);
  const lastSentMessageAtRef = useRef(0);
  const lastTypingMutationAtRef = useRef(0);
  const lastMarkReadAtRef = useRef(0);

  const conversations = useQuery(
    api.conversations.listConversations,
    user?.id ? { clerkId: user.id } : "skip",
  ) as ConversationItem[] | undefined;

  const effectiveConversationId =
    selectedConversationId || (conversations && conversations.length > 0
      ? String(conversations[0].conversationId)
      : undefined);

  const messages = useQuery(
    api.conversations.getConversationMessages,
    effectiveConversationId
      ? { conversationId: effectiveConversationId as Id<"conversations"> }
      : "skip",
  ) as MessageRow[] | undefined;

  const searchedMembers = useQuery(
    api.users.searchUsersByEmail,
    user?.id && debouncedSearchTerm.trim().length > 0
      ? { clerkId: user.id, emailQuery: debouncedSearchTerm.trim() }
      : "skip",
  ) as MemberSearchResult[] | undefined;

  const typingUsers = useQuery(
    api.conversations.getTypingUsers,
    user?.id && effectiveConversationId
      ? {
          conversationId: effectiveConversationId as Id<"conversations">,
          currentUserId: user.id,
        }
      : "skip",
  ) as { userId: string; name: string }[] | undefined;

  const getOrCreateDirectConversation = useMutation(api.conversations.getOrCreateDirectConversation);
  const sendMessage = useMutation(api.conversations.sendMessage);
  const markConversationRead = useMutation(api.conversations.markConversationRead);
  const setTypingStatus = useMutation(api.conversations.setTypingStatus);

  const sidebarConversations = useMemo(() => {
    return (conversations || []).map((conversation) => ({
      id: String(conversation.conversationId),
      participantName: conversation.participantName,
      lastMessage: conversation.lastMessage,
      lastMessageTime: new Date(conversation.lastMessageAt),
      unreadCount: conversation.unreadCount,
      isActive: String(conversation.conversationId) === effectiveConversationId,
      isOnline: conversation.isOnline,
    }));
  }, [conversations, effectiveConversationId]);

  const chatMessages = useMemo<ChatMessage[]>(() => {
    return (messages || []).map((message) => ({
      id: String(message.id),
      content: message.content,
      isSender: message.senderId === user?.id,
      timestamp: new Date(message.createdAt),
    }));
  }, [messages, user?.id]);

  const selectedConversation = useMemo(() => {
    return (conversations || []).find(
      (conversation) => String(conversation.conversationId) === effectiveConversationId,
    );
  }, [conversations, effectiveConversationId]);

  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !effectiveConversationId) return;
    const now = Date.now();
    if (now - lastMarkReadAtRef.current < 300) return;
    lastMarkReadAtRef.current = now;

    void markConversationRead({
      conversationId: effectiveConversationId as Id<"conversations">,
      userId: user.id,
    });
  }, [effectiveConversationId, messages?.length, markConversationRead, user?.id]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setSearchOpen(false);
    setSidebarOpen(false);
  };

  const handleStartConversation = async (member: MemberSearchResult) => {
    if (!user?.id) return;
    const now = Date.now();

    // Throttle rapid clicks to avoid duplicate create/open calls.
    if (isStartingConversation || now - lastStartConversationAtRef.current < 800) {
      return;
    }

    lastStartConversationAtRef.current = now;
    setIsStartingConversation(true);

    try {
      const conversationId = await getOrCreateDirectConversation({
        currentUserClerkId: user.id,
        otherUserClerkId: member.clerkId,
      });

      setSelectedConversationId(String(conversationId));
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setSearchOpen(false);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsStartingConversation(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user?.id || !effectiveConversationId) return;
    const now = Date.now();
    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    // Throttle message mutation calls to protect backend on rapid key bursts.
    if (now - lastSentMessageAtRef.current < 350) {
      return;
    }

    lastSentMessageAtRef.current = now;

    try {
      await sendMessage({
        conversationId: effectiveConversationId as Id<"conversations">,
        senderId: user.id,
        content: trimmedContent,
      });
      await setTypingStatus({
        conversationId: effectiveConversationId as Id<"conversations">,
        userId: user.id,
        isTyping: false,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTypingActivity = async () => {
    if (!user?.id || !effectiveConversationId) return;

    const now = Date.now();
    if (now - lastTypingMutationAtRef.current < 350) {
      return;
    }
    lastTypingMutationAtRef.current = now;

    try {
      await setTypingStatus({
        conversationId: effectiveConversationId as Id<"conversations">,
        userId: user.id,
        isTyping: true,
      });
    } catch (error) {
      console.error("Failed to set typing status:", error);
    }
  };

  const handleStopTyping = async () => {
    if (!user?.id || !effectiveConversationId) return;

    try {
      await setTypingStatus({
        conversationId: effectiveConversationId as Id<"conversations">,
        userId: user.id,
        isTyping: false,
      });
    } catch (error) {
      console.error("Failed to clear typing status:", error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-slate-600">Please sign in to continue.</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0">
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="absolute left-3 top-3 z-30 rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"
        aria-label="Toggle conversation panel"
      >
        {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
      </button>

      <aside className={`absolute inset-y-0 left-0 z-20 flex min-h-0 w-[86%] max-w-80 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:w-80 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="border-b border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800">Add Member by Email</h2>
          </div>

          <div className="relative">
            <input
              value={searchTerm}
              onChange={(e) => {
                const nextValue = e.target.value;
                setSearchTerm(nextValue);
                setSearchOpen(true);

                if (searchDebounceTimerRef.current) {
                  clearTimeout(searchDebounceTimerRef.current);
                }

                if (!nextValue.trim()) {
                  setDebouncedSearchTerm("");
                  return;
                }

                searchDebounceTimerRef.current = setTimeout(() => {
                  setDebouncedSearchTerm(nextValue);
                }, 300);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search email (e.g. alex@company.com)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"
            />

            {searchOpen && debouncedSearchTerm.trim().length > 0 && (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                {(searchedMembers || []).length === 0 ? (
                  <div className="px-3 py-3 text-xs text-slate-500">No member found with that email.</div>
                ) : (
                  (searchedMembers || []).map((member) => (
                    <button
                      key={member.clerkId}
                      onClick={() => handleStartConversation(member)}
                      disabled={isStartingConversation}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left last:border-b-0 hover:bg-amber-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        <Plus className="h-3 w-3" />
                        Add
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <ConversationSidebar
            conversations={sidebarConversations}
            onSelectConversation={handleSelectConversation}
            isLoading={conversations === undefined}
          />
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="absolute inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
          aria-label="Close conversation panel"
        />
      )}

      <section className="min-w-0 flex-1 bg-slate-50/60 md:bg-transparent">
        <ChatWindow
          conversationId={effectiveConversationId}
          participantName={selectedConversation?.participantName || "Select a conversation"}
          messages={chatMessages}
          isLoading={effectiveConversationId ? messages === undefined : false}
          isTyping={Boolean(typingUsers && typingUsers.length > 0)}
          typingLabel={typingUsers?.[0]?.name ? `${typingUsers[0].name} is typing...` : undefined}
          onSendMessage={handleSendMessage}
          onTypingActivity={handleTypingActivity}
          onStopTyping={handleStopTyping}
        />
      </section>
    </div>
  );
}
