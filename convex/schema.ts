import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    lastSeen: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  conversations: defineTable({
    participants: v.array(v.string()),
    createdAt: v.number(),
    lastMessageAt: v.number(),
    lastMessageText: v.optional(v.string()),
  })
    .index("by_participants", ["participants"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  conversationParticipants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    unreadCount: v.number(),
    lastReadAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_userId", ["conversationId", "userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    createdAt: v.number(),
    readBy: v.array(v.string()),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_createdAt", ["conversationId", "createdAt"])
    .index("by_senderId", ["senderId"]),

  typingStatus: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    expiresAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_userId", ["conversationId", "userId"])
    .index("by_expiresAt", ["expiresAt"]),
});
