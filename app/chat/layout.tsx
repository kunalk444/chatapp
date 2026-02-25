"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useUserSync } from "@/app/hooks/useUserSync";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  useUserSync();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50 px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-2 text-slate-600">Please sign in to access chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-3 md:p-6">
      <div className="mx-auto flex h-[calc(100vh-1.5rem)] max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-amber-100/40 md:h-[calc(100vh-3rem)]">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <Link href="/" className="text-lg font-black text-slate-900">
            Chat
          </Link>
          <UserButton />
        </header>
        <main className="min-h-0 flex-1" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
