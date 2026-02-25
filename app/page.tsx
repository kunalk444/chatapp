"use client";

import Link from "next/link";
import { Zap, MessageSquare, Lock, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black text-slate-900">Chat</div>
          <div className="flex gap-3">
            <Link href="/sign-in" className="px-5 py-2.5 rounded-lg text-slate-900 font-semibold hover:bg-slate-100 transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-lg transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-semibold text-sm">
            <span className="text-base">*</span>
            Introducing Premium Messaging
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Communication
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">that matters</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Experience messaging built with intention. Lightning-fast, beautifully designed, and truly secure. For teams that refuse to compromise.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/sign-up"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg transition-all hover:shadow-2xl hover:shadow-amber-500/30 active:scale-95 flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 font-bold text-lg transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
            >
              Sign In
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white" />
              </div>
              <span>
                <span className="font-bold text-slate-900">2,000+</span> teams communicating
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 bg-white/50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900">Why choose Chat?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need for seamless team communication</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Zap className="text-amber-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Lightning Fast</h3>
              <p className="text-slate-600 leading-relaxed">Real-time messaging with zero lag. Responses that feel instant, because they are.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <MessageSquare className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Beautifully Designed</h3>
              <p className="text-slate-600 leading-relaxed">Every pixel crafted with care. Premium design that makes communication a joy.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                <Lock className="text-emerald-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Truly Secure</h3>
              <p className="text-slate-600 leading-relaxed">Enterprise-grade encryption. Your conversations are yours alone.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-black text-slate-900">Ready to transform your team&apos;s communication?</h2>
          <p className="text-xl text-slate-600">Join thousands of teams already using Chat to collaborate effortlessly.</p>
          <Link
            href="/sign-up"
            className="inline-flex px-10 py-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg transition-all hover:shadow-2xl hover:shadow-amber-500/30 active:scale-95"
          >
            Start For Free Today
          </Link>
        </div>
      </div>

      <footer className="border-t border-slate-200 py-8 px-6 text-slate-600 text-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>Copyright 2026 Chat. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
