# DocSnap 📋

Turn screenshots into step-by-step documentation with AI.

## Setup

```bash
# Install
npm install

# Dev
npm run dev

# Build
npm run build
```

## Day 1 Status (April 2 — Project kickoff)
- ✅ Next.js 14 + Tailwind + shadcn/ui initialized
- ✅ Landing page with pricing
- ✅ Upload page with drag-and-drop, reorder, preview
- ✅ Generate/preview page skeleton
- ✅ API route structure (mock output → real AI Day 3)
- 🔄 Supabase integration (Day 2)
- 🔄 Stripe payments (Day 5)

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- Supabase (post-auth setup)
- Claude Vision API (Day 3)
- Stripe (Day 5)
- Vercel deployment

## Structure
```
src/
  app/                     # Next.js app router
    page.tsx               # Landing page
    app/page.tsx           # Upload page
    generate/page.tsx      # Preview/generate page
    api/generate/route.ts  # AI generation API
  components/
    landing/               # Landing page UI
    upload/                # Upload interface
    preview/               # Generated doc preview
  lib/                     # Utilities
```
