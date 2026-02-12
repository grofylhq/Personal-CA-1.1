<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Personal CA App

This project runs as a Vite + React frontend with **Supabase** as the backend/database layer.

## 1) Configure Supabase

1. Open your Supabase SQL editor.
2. Run `supabase/schema.sql` to create the `user_accounts` table.
3. Configure Row Level Security policies for `public.user_accounts` (or temporary open policy for testing).

## 2) Frontend environment (`.env.local`)

```bash
GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3) Run locally

```bash
npm install
npm run dev
```

## Notes

- `services/database.ts` automatically uses Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
- If Supabase env vars are missing, it falls back to localStorage mode.
