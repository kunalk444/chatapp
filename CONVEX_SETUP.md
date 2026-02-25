# Convex Setup Guide

This app uses Convex for backend, database, and realtime functionality. Follow these steps to fully set up Convex.

## Prerequisites
- Node.js 16+ installed
- Convex account (free at https://convex.dev)

## Setup Steps

### 1. Install Convex CLI
```bash
npm install -g convex
```

### 2. Initialize Convex Project
Run this command in the project root:
```bash
convex init
```

This will:
- Prompt you to sign in to Convex
- Create a new Convex deployment
- Generate `convex.json` and `.env.local` with your `NEXT_PUBLIC_CONVEX_URL`

### 3. Start Convex Development Server
In a separate terminal, run:
```bash
convex dev
```

This will:
- Start watching your `convex/` directory for changes
- Automatically deploy your functions
- Generate `convex/_generated/api.ts` with proper TypeScript types (this overwrites the placeholder file)

### 4. The Generated Files
After `convex dev` runs successfully, Convex will generate:
- `convex/_generated/api.ts` - TypeScript types for all your functions
- `convex/_generated/server.ts` - Server types and utilities

**Do not manually edit these files** - they're auto-generated and will be overwritten.

## Verify Setup

### Running Both Dev Servers
You now need to run two dev servers simultaneously:

**Terminal 1** (Convex):
```bash
convex dev
```

**Terminal 2** (Next.js):
```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Current Status

✅ Schema defined in `convex/schema.ts`
✅ Functions defined in `convex/users.ts`
✅ Placeholder generated files in `convex/_generated/` (will be auto-updated)
✅ Environment variables set in `.env.local`

⏳ After you run `convex dev`, the real generated files will replace the placeholders with proper TypeScript types.

## Troubleshooting

**"Cannot find module './_generated/server'"**
- Run `convex dev` - it generates these files

**"NEXT_PUBLIC_CONVEX_URL is not set"**
- Check `.env.local` has `NEXT_PUBLIC_CONVEX_URL` from step 2

**"Mutation/Query not found"**
- Make sure `convex dev` is running and has finished deployment
- Check the function is exported in `convex/users.ts`

## Next Steps

1. Run `convex dev` in a terminal
2. Run `npm run dev` in another terminal
3. Sign up with Clerk at http://localhost:3000
4. User data will auto-sync to Convex
5. Continue building features (#2: User List & Search)
