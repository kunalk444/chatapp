# Development Setup Guide

This is the **correct and long-term** way to run the development environment.

## ⚠️ Important: You MUST Run Convex Dev

The Convex backend MUST be running at all times during development. This is not optional.

### Why?
- Convex dev watches your `convex/` folder for changes
- It auto-generates `convex/_generated/api.ts` with proper TypeScript types
- Without it, the app can't access your database functions

## Proper Development Setup

### Option 1: Single Command (Recommended)
Run both servers with one command:
```bash
npm run dev
```

This runs:
- ✅ `convex dev` in the background (auto-generates types)
- ✅ `npm run next:dev` (your Next.js app)

### Option 2: Two Terminals (If you need to see both outputs clearly)
**Terminal 1:**
```bash
npm run convex:dev
```
Wait for it to say "Convex functions ready!"

**Terminal 2:**
```bash
npm run next:dev
```

## Build for Production
```bash
npm run build
```

This runs:
1. `convex deploy` - deploys your functions to Convex cloud
2. `next build` - builds your Next.js app

Then start the production server:
```bash
npm start
```

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'syncUser')"
- **Cause**: `convex dev` is not running
- **Fix**: Make sure `npm run convex:dev` is running in a terminal

### Error: "PORT 3000 is in use"
- Kill the old process and run `npm run dev` again
- Or use: `npm run next:dev -- -p 3001` to use a different port

### TypeScript errors about `_generated/api.ts`
- **Cause**: `convex dev` hasn't generated the types yet
- **Fix**: Wait 5-10 seconds for Convex to generate files, then refresh browser

### Changes to `convex/users.ts` not appearing
- Convex dev watches for changes and auto-deploys
- Check the terminal running `convex dev` for confirmation
- Refresh your browser to reload types

## Summary

| Task | Command |
|------|---------|
| Development (both servers) | `npm run dev` |
| Just Convex | `npm run convex:dev` |
| Just Next.js | `npm run next:dev` |
| Production build | `npm run build` |
| Start production | `npm start` |

**This is the long-term solution.** Once you run `npm run dev`, everything should work without temporary fixes.
