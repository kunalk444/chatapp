"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, ArrowLeft, MoreHorizontal } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

export interface ChatMessage {
  id: string;
  content: string;
  isSender: boolean;
  timestamp: Date;
  senderName?: string;
}

interface ChatWindowProps {
  conversationId?: string;
  participantName?: string;
  messages?: ChatMessage[];
  isLoading?: boolean;
  isTyping?: boolean;
  typingLabel?: string;
  onSendMessage?: (message: string) => void;
  onTypingActivity?: () => void;
  onStopTyping?: () => void;
  onBack?: () => void;
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const msg = value as Partial<ChatMessage>;
  return (
    typeof msg.id === "string" &&
    typeof msg.content === "string" &&
    typeof msg.isSender === "boolean" &&
    msg.timestamp instanceof Date
  );
}

export function ChatWindow({
  conversationId,
  participantName = "Unknown",
  messages = [],
  isLoading = false,
  isTyping = false,
  typingLabel,
  onSendMessage,
  onTypingActivity,
  onStopTyping,
  onBack,
}: ChatWindowProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const prevMessageCountRef = useRef(0);
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);

  const validatedMessages = useMemo(
    () =>
      Array.isArray(messages)
        ? messages.filter((msg) => {
            if (!isMessage(msg)) {
              console.warn("ChatWindow: invalid message object");
              return false;
            }
            return true;
          })
        : [],
    [messages],
  );

  const canRenderMessages = !isLoading && validatedMessages.length > 0;

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < 96;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const currentCount = validatedMessages.length;
    const previousCount = prevMessageCountRef.current;

    if (currentCount === 0) {
      prevMessageCountRef.current = 0;
      return;
    }

    if (previousCount === 0) {
      scrollToBottom("auto");
      prevMessageCountRef.current = currentCount;
      return;
    }

    if (currentCount > previousCount) {
      const latestMessage = validatedMessages[currentCount - 1];
      if (isNearBottom() || latestMessage?.isSender) {
        scrollToBottom();
        setShowNewMessagesButton(false);
      } else {
        setShowNewMessagesButton(true);
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [validatedMessages]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const typingText = useMemo(() => {
    if (!typingLabel) {
      return `${participantName} is typing...`;
    }
    return typingLabel;
  }, [participantName, typingLabel]);

  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white shadow-xl shadow-amber-200/60">
          <MessageCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Pick a conversation</h2>
        <p className="max-w-md text-sm text-slate-600">Choose anyone from the sidebar to start a premium, focused chat flow.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="rounded-lg border border-slate-200 bg-white p-2 lg:hidden">
                <ArrowLeft className="h-4 w-4 text-slate-700" />
              </button>
            )}

            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center shadow-sm">
              {participantName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 md:text-lg">{participantName}</h2>
              <p className="text-xs text-emerald-600">Active now</p>
            </div>
          </div>

          <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={() => {
          if (isNearBottom()) {
            setShowNewMessagesButton(false);
          }
        }}
        className="relative flex-1 space-y-2 overflow-y-auto bg-slate-50/40 px-4 py-6 md:px-6"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          </div>
        ) : !canRenderMessages ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-semibold text-slate-800">No messages yet</p>
            <p className="text-xs text-slate-500">Start the conversation with a great first message.</p>
          </div>
        ) : (
          <>
            {validatedMessages.map((msg) => (
              <MessageBubble key={msg.id} content={msg.content} isSender={msg.isSender} timestamp={msg.timestamp} />
            ))}
            {isTyping && <TypingIndicator label={typingText} />}
          </>
        )}

        {showNewMessagesButton && (
          <button
            onClick={() => {
              scrollToBottom();
              setShowNewMessagesButton(false);
            }}
            className="sticky bottom-2 mx-auto block rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-md"
          >
            ↓ New messages
          </button>
        )}
      </div>

      <ChatInput
        onSend={onSendMessage || (() => {})}
        isLoading={isLoading}
        onTypingActivity={onTypingActivity}
        onStopTyping={onStopTyping}
      />
    </div>
  );
}
