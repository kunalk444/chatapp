"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-slate-900">
            Chat
          </Link>
          <Link
            href="/sign-in"
            className="px-5 py-2.5 rounded-lg text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main className="min-h-screen pt-28 pb-10 px-6 flex items-center justify-center">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-semibold text-sm">
              Join ChatApp
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1]">
              Create your
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                messaging account
              </span>
            </h1>
            <p className="text-lg text-slate-600">
              Start private real-time conversations with a premium, clean experience.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur-sm shadow-2xl shadow-amber-100/40 p-4 md:p-6">
            <SignUp />
          </div>
        </div>
      </main>
    </div>
  );
}
