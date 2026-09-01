# FomoTrade Journal

A premium, AI-powered trading journal for Forex, Gold, Crypto, and Indices traders.

## Features

- Supabase email/password authentication
- Multiple trading accounts and strategy library
- Detailed trade logging with risk, psychology, notes, tags, and screenshots
- Monthly trading calendar with daily and weekly P/L
- Equity curve, win/loss, symbol, strategy, weekday, and direction analytics
- Journal search, filters, pagination, CSV export, and printable PDF report
- AI performance coach, weekly/monthly reviews, trade review, risk alerts, and pattern detection
- Dark responsive dashboard with desktop sidebar and mobile navigation
- Supabase Row Level Security on every user-owned table
- Private screenshot storage policies

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn-style components, Lucide, Recharts, Supabase, Zod, and the OpenAI Responses API.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6
NEXT_PUBLIC_DEMO_MODE=false
```

3. Apply the SQL migrations in `supabase/migrations` to your Supabase project.

4. Run:

```bash
npm run dev
```

Open http://localhost:3000. Without Supabase variables, the app uses deterministic demo data for preview.

## Security

- The browser only receives the Supabase project URL and publishable key.
- `OPENAI_API_KEY` is read only by server-side API routes.
- No service-role key is used by the frontend.
- Every database record is scoped to `auth.uid()` through RLS.
- AI routes verify the authenticated JWT before reading journal data.
- Screenshot files are private and stored under a user-ID folder.

The AI feature is a historical performance coach, not a market prediction or BUY/SELL signal service.

## Validation

The project is configured for:

```bash
npm run typecheck
npm run lint
npm run build
```

The initial implementation was verified with a successful production build before repository upload.
