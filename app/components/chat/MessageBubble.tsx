"use client";

interface MessageBubbleProps {
  content: string;
  isSender: boolean;
  timestamp: Date;
  senderName?: string;
}

export function MessageBubble({ content, isSender, timestamp }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isSameYear = date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      ...(isSameYear ? {} : { year: "numeric" }),
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isSender) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-xs md:max-w-md">
          <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-white shadow-md shadow-amber-200/70">
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
          <p className="mt-1 text-right text-[11px] text-slate-500">{formatTime(timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex justify-start">
      <div className="max-w-xs md:max-w-md">
        <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm">
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{formatTime(timestamp)}</p>
      </div>
    </div>
  );
}
