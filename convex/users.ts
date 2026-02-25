import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sync or create user from Clerk
 * Called when a user signs up or logs in
 */
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Validate input arguments
      if (!args.clerkId || !args.clerkId.trim()) {
        throw new Error("Validation: clerkId is required and cannot be empty");
      }
      if (!args.email || !args.email.trim()) {
        throw new Error("Validation: email is required and cannot be empty");
      }
      if (!args.name || !args.name.trim()) {
        throw new Error("Validation: name is required and cannot be empty");
      }

      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (existingUser) {
        // Update existing user
        const result = await ctx.db.patch(existingUser._id, {
          email: args.email.trim(),
          name: args.name.trim(),
          avatar: args.avatar?.trim(),
          lastSeen: Date.now(),
        });
        return result;
      }

      // Create new user
      const result = await ctx.db.insert("users", {
        clerkId: args.clerkId.trim(),
        email: args.email.trim(),
        name: args.name.trim(),
        avatar: args.avatar?.trim(),
        lastSeen: Date.now(),
      });
      return result;
    } catch (error) {
      console.error("❌ syncUser mutation failed:", error);
      throw error;
    }
  },
});

/**
 * Get user by Clerk ID
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate input
      if (!args.clerkId || !args.clerkId.trim()) {
        throw new Error("Validation: clerkId is required and cannot be empty");
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      return user || null;
    } catch (error) {
      console.error("❌ getUserByClerkId query failed:", error);
      throw error;
    }
  },
});

/**
 * Get all users except current user
 */
export const getAllUsers = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate input
      if (!args.clerkId || !args.clerkId.trim()) {
        throw new Error("Validation: clerkId is required and cannot be empty");
      }

      const users = await ctx.db.query("users").collect();
      
      if (!Array.isArray(users)) {
        throw new Error("Database returned non-array result for users");
      }

      return users.filter((user) => {
        if (!user || !user.clerkId) return false;
        return user.clerkId !== args.clerkId;
      });
    } catch (error) {
      console.error("❌ getAllUsers query failed:", error);
      throw error;
    }
  },
});

/**
 * Search users by name
 */
export const searchUsers = query({
  args: {
    clerkId: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate input
      if (!args.clerkId || !args.clerkId.trim()) {
        throw new Error("Validation: clerkId is required and cannot be empty");
      }
      if (typeof args.query !== "string") {
        throw new Error("Validation: query must be a string");
      }

      const users = await ctx.db.query("users").collect();
      
      if (!Array.isArray(users)) {
        throw new Error("Database returned non-array result for users");
      }

      const lowerQuery = args.query.toLowerCase().trim();
      
      return users
        .filter((user) => {
          if (!user || !user.name || !user.clerkId) return false;
          return (
            user.clerkId !== args.clerkId &&
            user.name.toLowerCase().includes(lowerQuery)
          );
        })
        .slice(0, 10); // limit to 10 results
    } catch (error) {
      console.error("❌ searchUsers query failed:", error);
      throw error;
    }
  },
});

/**
 * Update user's lastSeen timestamp (for online status)
 */
export const updateLastSeen = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate input
      if (!args.clerkId || !args.clerkId.trim()) {
        throw new Error("Validation: clerkId is required and cannot be empty");
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (!user) {
        throw new Error(`User with clerkId "${args.clerkId}" not found`);
      }

      const result = await ctx.db.patch(user._id, {
        lastSeen: Date.now(),
      });
      
      return result;
    } catch (error) {
      console.error("❌ updateLastSeen mutation failed:", error);
      throw error;
    }
  },
});

/**
 * Search users by email (case-insensitive, partial match)
 */
export const searchUsersByEmail = query({
  args: {
    clerkId: v.string(),
    emailQuery: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId.trim();
    const emailQuery = args.emailQuery.trim().toLowerCase();

    if (!clerkId) {
      throw new Error("Validation: clerkId is required and cannot be empty");
    }

    if (!emailQuery) {
      return [];
    }

    const users = await ctx.db.query("users").collect();

    return users
      .filter((user) => user.clerkId !== clerkId)
      .filter((user) => user.email.toLowerCase().includes(emailQuery))
      .slice(0, 10)
      .map((user) => ({
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isOnline: Date.now() - user.lastSeen < 60000,
      }));
  },
});
