"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  onTypingActivity?: () => void;
  onStopTyping?: () => void;
}

export function ChatInput({
  onSend,
  isLoading = false,
  onTypingActivity,
  onStopTyping,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    onSend(message.trim());
    setMessage("");
    onStopTyping?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur md:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTypingActivity?.();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write something remarkable..."
            rows={1}
            className="max-h-28 flex-1 resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-3 text-white shadow-sm transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500">Press Enter to send. Shift + Enter for a new line.</p>
    </div>
  );
}
