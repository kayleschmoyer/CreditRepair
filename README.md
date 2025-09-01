# CreditCraft

AI-assisted credit repair & score coaching tool built with Next.js 14 and Supabase.

## 10-minute setup
1. Create a new Supabase project and enable Email and Google auth providers.
2. Create storage buckets: `reports` and `letters`.
3. Copy `.env.local.example` to `.env.local` and fill in values including `SUPABASE_DB_URL`. Optionally set `SENTRY_DSN`, `CRON_ALERT_WEBHOOK`, and `ADMIN_EMAILS` for monitoring features.
4. Install dependencies: `npm install`.
5. Prep a fresh demo database with sample data:
   ```bash
   npm run db:reseed
   ```
6. Start the dev server:
   ```bash
   npm run dev
   ```
7. Deploy edge functions in `edge-functions` and set a daily cron for `cron-due-reminders`.

## Features
- Upload credit reports, parse to tradelines.
- AI suggests dispute candidates.
- Generate dispute letters as PDFs.
- Cron reminders for due disputes via email and notifications.
- Optional Sentry error reporting and admin health dashboard.
- Strict RLS policies; storage via signed URLs.

## Testing
Run unit tests with:
```
npm test
```
