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

# Production
npm start
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
- Next.js 16.2.2 (App Router)
- Tailwind CSS + shadcn/ui
- Supabase (auth + database)
- OpenRouter API (Gemini Vision for AI analysis)
- Stripe (payments)
- Vercel deployment

## Architecture

### Pages
```
/                Landing page + pricing
/app             Upload screenshots (drag-and-drop, reorder)
/generate        AI-generated documentation preview
/print           Print-friendly view (Ctrl/Cmd+P)
/auth            Sign in / sign up
/dashboard        User's generated documents
```

### API Routes
```
POST /api/generate     AI document generation (OpenRouter/Gemini)
/api/stripe/checkout   Create Stripe checkout session
/api/stripe/webhook    Handle Stripe webhook events
/api/stripe/portal     Stripe customer portal
```

### Database (Supabase)
- `profiles` — extends auth.users with plan ('free' | 'pro')
- `documents` — user's generated docs with status
- `document_steps` — individual steps per document

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI (OpenRouter / Gemini Vision)
OPENROUTER_API_KEY=sk-or-v1-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## File Structure
```
src/
  app/                     # Next.js App Router
    page.tsx               # Landing page
    app/page.tsx           # Upload page
    generate/page.tsx      # Preview/generate page
    print/page.tsx         # Print-friendly view
    auth/page.tsx          # Auth page
    dashboard/page.tsx     # User dashboard
    api/
      generate/route.ts     # AI generation
      stripe/
        checkout/route.ts  # Stripe checkout
        webhook/route.ts   # Stripe webhook
        portal/route.ts    # Customer portal
  components/
    landing/               # Landing page UI
    upload/                # Upload interface
    preview/               # Generated doc preview
    auth/                  # Auth UI
    dashboard/             # Dashboard UI
    ui/                   # shadcn/ui components
  lib/
    supabase/             # Supabase client helpers
    utils.ts              # Utilities
  proxy.ts                # Route protection (Next.js 16)
```

## Next Steps
- [ ] Deploy to Vercel
- [ ] Set up Stripe webhook in dashboard
- [ ] Add more export formats
- [ ] Custom branding for Pro plan
