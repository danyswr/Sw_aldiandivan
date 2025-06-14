# Vercel Deployment Guide

## Current Issue
Your project has a mixed architecture - the package.json is configured for Vite+Express but you have Next.js App Router files. This causes conflicts during Vercel deployment.

## Solution Options

### Option 1: Deploy as Next.js App (Recommended)
1. Create a new repository for deployment with proper Next.js structure
2. Copy only the Next.js App Router files from `src/app/` directory
3. Use the provided `package-production.json` as your new `package.json`
4. Deploy to Vercel normally

### Option 2: Fix Current Repository
1. You need to modify package.json scripts to use Next.js commands:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build", 
     "start": "next start"
   }
   ```
2. Remove `"type": "module"` from package.json
3. Rename config files back to .js extensions

## Environment Variables Required
- `GOOGLE_APPS_SCRIPT_URL`: Your Google Apps Script web app URL

## Files Ready for Next.js Deployment
- All API routes in `src/app/api/`
- All pages in `src/app/`
- Configuration files: `next.config.mjs`, `tailwind.config.mjs`, `postcss.config.mjs`