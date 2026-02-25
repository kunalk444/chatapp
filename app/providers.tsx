"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";

let convexClient: ConvexReactClient | null = null;

function getConvexClient(url: string) {
  if (!convexClient) {
    convexClient = new ConvexReactClient(url);
  }
  return convexClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return (
      <ClerkProvider>
        <div className="flex min-h-screen items-center justify-center bg-[#0f0f1e] px-6 text-center">
          <div>
            <h1 className="text-xl font-semibold text-white">Configuration Error</h1>
            <p className="mt-2 text-sm text-[#a0a0b0]">
              Missing <code>NEXT_PUBLIC_CONVEX_URL</code> in your environment.
            </p>
          </div>
        </div>
      </ClerkProvider>
    );
  }

  const convex = getConvexClient(convexUrl);

  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </ClerkProvider>
  );
}
