# AI Coding Agent Instructions for ChatApp

## Project Overview
**ChatApp** is a Next.js 16 application using React 19, TypeScript, and Tailwind CSS. Currently in early development (v0.1.0) with a baseline template structure. The project name suggests a chat application, though the core functionality is not yet implemented beyond the default Next.js template.

## Tech Stack & Configuration

- **Framework**: Next.js 16.1.6 (App Router)
- **Runtime**: React 19.2.3, TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **Linting**: ESLint 9 with Next.js config
- **Dev Port**: 3000 (standard Next.js)

**Key TypeScript Settings**:
- Strict mode enabled (`"strict": true`)
- Path alias configured: `@/*` maps to root directory
- Target: ES2017

## Directory Structure

```
app/              # Next.js App Router - all pages and layouts
  layout.tsx      # Root layout with Geist font setup and metadata
  page.tsx        # Home page (currently default template)
  globals.css     # Global styles (Tailwind directives)
public/           # Static assets
```

## Development Workflows

### Local Development
```bash
npm run dev        # Start dev server (port 3000, with hot reload)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

## Code Patterns & Conventions

### File-Based Routing (App Router)
- Add new pages as `app/[route]/page.tsx`
- Shared layouts go in `app/[route]/layout.tsx`
- Use dynamic routes: `app/[id]/page.tsx` for parameterized pages
- **Reference**: [app/page.tsx](app/page.tsx) (home page), [app/layout.tsx](app/layout.tsx) (root layout)

### Styling Approach
- Use Tailwind CSS utility classes (not CSS modules)
- Example from [app/page.tsx](app/page.tsx): `className="flex min-h-screen items-center justify-center"`
- Global styles in [app/globals.css](app/globals.css) use Tailwind directives (@apply, @layer)
- Font variables injected via Geist setup: `--font-geist-sans`, `--font-geist-mono`

### React Components
- Use React 19 functional components with hooks
- Server Components by default; add `"use client"` only when needed (state, events)
- Export as `export default` for page components
- Example: [app/layout.tsx](app/layout.tsx) uses `Readonly<{ children: React.ReactNode }>` for type safety

### Metadata & SEO
- Define page metadata in `export const metadata` (server-side only)
- Root metadata set in [app/layout.tsx](app/layout.tsx)
- Update title/description per route as needed

## Import Aliases & Paths
- Use `@/*` for root-level imports (configured in tsconfig.json)
- Example: `import { Component } from "@/app/components"` (if components directory exists)

## Type Safety
- Strict TypeScript enabled; always type function parameters and return values
- Use `React.ReactNode` for children, `Metadata` from `next` for page metadata
- Avoid `any` type

## Authentication Setup
- **Clerk** is used for authentication via `@clerk/nextjs`
- User flows: `SignUp` component in `app/sign-up/[[...sign-up]]/page.tsx`, `SignIn` component in `app/sign-in/[[...sign-in]]/page.tsx`
- `ClerkProvider` wraps app in root layout at [app/layout.tsx](app/layout.tsx)
- Middleware protects routes: `app/chat/*` requires authentication via [middleware.ts](middleware.ts)
- After sign-in/sign-up, redirect to `/chat` (configured in `.env.local`)
- `UserButton` from `@clerk/nextjs` displays user avatar and provides logout

## Backend & Database
- **Convex** handles all backend operations, database, and realtime subscriptions
- Schema defined in [convex/schema.ts](convex/schema.ts) with tables: `users`, `conversations`, `messages`, `typingStatus`
- User mutations in [convex/users.ts](convex/users.ts): `syncUser`, `updateLastSeen`, search functions
- On first sign-in, call `syncUser` mutation to create Convex user record from Clerk
- All queries use Convex indexes (by_clerkId, by_conversationId, by_participants) for performance

## Realtime Strategy:
- All realtime updates are handled via Convex subscriptions using useQuery().
- No manual WebSocket setup.
- Mutations trigger reactive updates automatically.

## Database Design Principles:
- Users are synced from Clerk into Convex.
- Conversations are unique per user pair.
- Messages reference conversationId.
- Messages store readBy array for unread tracking.
- Online status is computed via lastSeen timestamp.

## Indexing Strategy:
- Index messages by conversationId
- Index conversations by participants
- Index users by clerkId

## Presence System:
- lastSeen timestamp updated periodically
- User considered online if lastSeen < 30 seconds ago
- Typing status stored with expiration timestamp

## Unread Logic:
- Messages include readBy array
- Unread count calculated by:
  senderId !== currentUserId AND readBy does not include currentUserId
- Cleared when conversation is opened

## Auto Scroll:
- Auto-scroll only if user is near bottom
- If user scrolled up, show "New Messages" button
- Do not force-scroll

## Routing Strategy:
- Desktop: /chat layout renders sidebar + selected conversation
- Mobile: /chat shows conversation list
- /chat/[conversationId] shows full-screen chat

## Error Handling:
- Mutations wrapped with try/catch
- Show toast notifications for failures
- Gracefully handle missing conversations
- Protect routes using Clerk middleware

## Testing Plan:
- Unit test Convex functions
- Test critical UI logic (unread count, formatting)
- Manual testing for realtime features add add all thse appropriately in instructions.md file
