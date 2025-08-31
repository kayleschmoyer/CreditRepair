# CreditCraft

AI-assisted credit repair & score coaching tool built with Next.js 14 and Supabase.

## Setup
1. Create a new Supabase project. Enable Email and Google auth providers.
2. Create storage buckets: `reports` and `letters`.
3. Run the SQL migration: `npm run db:apply`.
4. Deploy edge functions in `edge-functions` and set a daily cron for `cron-due-reminders`.
5. Copy `.env.local.example` to `.env.local` and fill in values.
6. Install dependencies and start dev server:
   ```bash
   npm install
   npm run dev
   ```
7. (Optional) seed demo data: `npm run db:seed`.

## Features
- Upload credit reports, parse to tradelines.
- AI suggests dispute candidates.
- Generate dispute letters as PDFs.
- Cron reminders for due disputes via email and notifications.
- Strict RLS policies; storage via signed URLs.

## Testing
Run unit tests with:
```
npm test
```
