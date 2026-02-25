"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Sync Clerk user to Convex on login and refresh lastSeen periodically.
 */
export function useUserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!user.id || !email) {
      console.error("Cannot sync user: missing Clerk user id or email");
      return;
    }

    const sync = async () => {
      try {
        await syncUser({
          clerkId: user.id,
          email,
          name: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "User",
          avatar: user.imageUrl || undefined,
        });
      } catch (error) {
        // Keep UI usable even if sync fails temporarily.
        console.error("Failed to sync user to Convex:", error);
      }
    };

    sync();
    const interval = setInterval(sync, 30000);
    return () => clearInterval(interval);
  }, [isLoaded, user, syncUser]);
}
