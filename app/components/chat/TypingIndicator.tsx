"use client";

interface TypingIndicatorProps {
  label?: string;
}

export function TypingIndicator({ label = "Typing..." }: TypingIndicatorProps) {
  return (
    <div className="mb-4 flex justify-start">
      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="mb-1 text-xs text-slate-500">{label}</p>
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
