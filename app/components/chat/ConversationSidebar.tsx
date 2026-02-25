"use client";

import { Clock, ChevronRight } from "lucide-react";

interface Conversation {
  id: string;
  participantName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isActive: boolean;
  isOnline: boolean;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  isLoading?: boolean;
}

function isConversation(value: unknown): value is Conversation {
  if (!value || typeof value !== "object") return false;
  const conv = value as Partial<Conversation>;
  return (
    typeof conv.id === "string" &&
    typeof conv.participantName === "string" &&
    typeof conv.lastMessage === "string" &&
    conv.lastMessageTime instanceof Date &&
    typeof conv.unreadCount === "number" &&
    typeof conv.isActive === "boolean" &&
    typeof conv.isOnline === "boolean"
  );
}

export function ConversationSidebar({
  conversations,
  onSelectConversation,
  isLoading = false,
}: ConversationSidebarProps) {
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  const validatedConversations = safeConversations.filter((conv) => {
    if (!isConversation(conv)) {
      console.warn("ConversationSidebar: invalid conversation object");
      return false;
    }
    return true;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-0 flex-1 bg-white p-3">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Conversations</h2>
        <p className="text-xs text-slate-500">
          {validatedConversations.length} {validatedConversations.length === 1 ? "thread" : "threads"}
        </p>
      </div>

      <div className="h-full overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-slate-500">Loading conversations...</div>
        ) : validatedConversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-600">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {validatedConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative w-full rounded-2xl border p-4 text-left transition-all ${
                  conv.isActive
                    ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${conv.isOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <h3 className="truncate text-sm font-semibold text-slate-900">{conv.participantName}</h3>
                  </div>
                  <span className="text-xs text-slate-500">{formatTime(conv.lastMessageTime)}</span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-600">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && (
                    <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-0.5 text-[11px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                {conv.isActive && (
                  <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
