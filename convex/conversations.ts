import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function sortedParticipants(a: string, b: string) {
  return [a.trim(), b.trim()].sort();
}

export const getOrCreateDirectConversation = mutation({
  args: {
    currentUserClerkId: v.string(),
    otherUserClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const current = args.currentUserClerkId.trim();
    const other = args.otherUserClerkId.trim();

    if (!current || !other) {
      throw new Error("Both user IDs are required");
    }

    if (current === other) {
      throw new Error("Cannot start a direct conversation with yourself");
    }

    const participants = sortedParticipants(current, other);
    const now = Date.now();

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) => q.eq("participants", participants))
      .first();

    if (existing) {
      const currentMembership = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversationId_userId", (q) =>
          q.eq("conversationId", existing._id).eq("userId", current),
        )
        .first();

      if (!currentMembership) {
        await ctx.db.insert("conversationParticipants", {
          conversationId: existing._id,
          userId: current,
          unreadCount: 0,
          lastReadAt: now,
        });
      }

      const otherMembership = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversationId_userId", (q) =>
          q.eq("conversationId", existing._id).eq("userId", other),
        )
        .first();

      if (!otherMembership) {
        await ctx.db.insert("conversationParticipants", {
          conversationId: existing._id,
          userId: other,
          unreadCount: 0,
          lastReadAt: now,
        });
      }

      return existing._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      participants,
      createdAt: now,
      lastMessageAt: now,
      lastMessageText: "",
    });

    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: current,
      unreadCount: 0,
      lastReadAt: now,
    });

    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: other,
      unreadCount: 0,
      lastReadAt: now,
    });

    return conversationId;
  },
});

export const listConversations = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId.trim();
    if (!clerkId) {
      throw new Error("clerkId is required");
    }

    const memberships = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .collect();

    const result = [];

    for (const membership of memberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (!conversation) continue;

      const otherUserId = conversation.participants.find((id) => id !== clerkId);
      if (!otherUserId) continue;

      const otherUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", otherUserId))
        .first();

      result.push({
        conversationId: conversation._id,
        participantClerkId: otherUser?.clerkId ?? otherUserId,
        participantName: otherUser?.name ?? "Unknown user",
        participantEmail: otherUser?.email ?? otherUserId,
        participantAvatar: otherUser?.avatar,
        lastMessage: conversation.lastMessageText || "No messages yet",
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: membership.unreadCount,
        isOnline: otherUser ? Date.now() - otherUser.lastSeen < 60_000 : false,
      });
    }

    return result.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return messages
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((message) => ({
        id: message._id,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      }));
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const content = args.content.trim();
    const senderId = args.senderId.trim();

    if (!senderId) {
      throw new Error("senderId is required");
    }

    if (!content) {
      throw new Error("Message cannot be empty");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(senderId)) {
      throw new Error("Sender is not part of this conversation");
    }

    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId,
      content,
      createdAt: now,
      readBy: [senderId],
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
      lastMessageText: content,
    });

    const memberships = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const membership of memberships) {
      if (membership.userId === senderId) {
        await ctx.db.patch(membership._id, {
          unreadCount: 0,
          lastReadAt: now,
        });
      } else {
        await ctx.db.patch(membership._id, {
          unreadCount: membership.unreadCount + 1,
        });
      }
    }

    return messageId;
  },
});

export const markConversationRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId.trim();
    if (!userId) {
      throw new Error("userId is required");
    }

    const now = Date.now();

    const membership = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversationId_userId", (q) => q.eq("conversationId", args.conversationId).eq("userId", userId))
      .first();

    if (!membership) {
      await ctx.db.insert("conversationParticipants", {
        conversationId: args.conversationId,
        userId,
        unreadCount: 0,
        lastReadAt: now,
      });
      return;
    }

    await ctx.db.patch(membership._id, {
      unreadCount: 0,
      lastReadAt: now,
    });
  },
});

export const setTypingStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId.trim();
    if (!userId) {
      throw new Error("userId is required");
    }

    const existing = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversationId_userId", (q) => q.eq("conversationId", args.conversationId).eq("userId", userId))
      .first();

    if (!args.isTyping) {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
      return;
    }

    const expiresAt = Date.now() + 2000;

    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
      return;
    }

    await ctx.db.insert("typingStatus", {
      conversationId: args.conversationId,
      userId,
      expiresAt,
    });
  },
});

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = args.currentUserId.trim();
    const now = Date.now();

    const typingEntries = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const activeTypingEntries = typingEntries.filter(
      (entry) => entry.userId !== currentUserId && entry.expiresAt > now,
    );

    const users = [];

    for (const entry of activeTypingEntries) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", entry.userId))
        .first();

      if (!user) continue;

      users.push({
        userId: user.clerkId,
        name: user.name,
      });
    }

    return users;
  },
});
