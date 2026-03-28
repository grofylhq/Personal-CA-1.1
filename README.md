# Personal CA — AI Financial Assistant

An advanced AI-powered financial, compliance, and business-intelligence assistant for entrepreneurs and finance teams in India. Built with React, TypeScript, and OpenRouter-powered models.

## Features

- **OpenRouter AI Chat (Default for All Users)** — Curated free-tier model set
- **16 Financial Calculators** — GST, Income Tax, Capital Gains, SIP, NPS, FD, and more
- **Document Drafting** — Legal, Tax, and Corporate document generation
- **Real-time News** — AI-powered financial intelligence stream
- **Financial Dashboard** — Net worth, asset allocation, cash flow visualisation
- **Supabase Backend** — Auth (email/password, Google OAuth) and Postgres database
- **Offline Fallback** — Works with localStorage when Supabase is not configured

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your keys:
   ```env
   # Required for AI chat (used only in server-side Vite proxy, never exposed in client bundle)
   OPENROUTER_API_KEY=your_openrouter_api_key

   # Optional: Supabase backend (falls back to localStorage if not set)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   # Optional alias used by newer Supabase dashboard terminology
   SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Supabase Setup (Production)

1. Create a new [Supabase](https://supabase.com) project.
2. Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # File: supabase/schema.sql
   ```
3. Enable **Google OAuth** in Supabase → Authentication → Providers (optional).
4. Copy your project URL and anon key into `.env.local`.

## Build for Production

```bash
npm run build      # Outputs to dist/
npm run preview    # Preview the production build
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key (injected by dev proxy only, hidden from browser code) |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `SUPABASE_PUBLISHABLE_KEY` | No | Supabase publishable key (alias for anon key) |
