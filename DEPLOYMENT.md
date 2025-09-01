# Deployment Guide

This document explains how to promote the project from a local environment to staging and finally production.

## 1. Local Setup
1. Install dependencies and run the app:
   ```bash
   npm install
   npm run db:reseed
   npm run dev
   ```
2. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `SMTP_HOST`
   - `SMTP_USER`
   - `SMTP_PASS`
3. Use the Supabase CLI for a local instance:
   ```bash
   npx supabase start
   ```

## 2. Supabase Project Setup (Staging & Production)
1. Create separate Supabase projects for **staging** and **production**.
2. Enable Email and Google auth providers.
3. Create storage buckets `reports` and `letters`.
4. Apply database schema and RLS policies:
   ```bash
   supabase db push --project-ref <project-ref>
   psql "$SUPABASE_DB_URL" -f sql/migration.sql
   ```
5. Seed demo data if desired:
   ```bash
   npm run db:seed
   ```

## 3. Edge Function Deployment
Deploy each function to the appropriate Supabase project:
```bash
supabase functions deploy ai-suggest-disputes --project-ref <project-ref>
supabase functions deploy gen-dispute-letter --project-ref <project-ref>
supabase functions deploy parse-report --project-ref <project-ref>
supabase functions deploy cron-due-reminders --project-ref <project-ref>
```

## 4. Scheduler / Cron
Enable the daily reminder cron for the `cron-due-reminders` function:
```bash
supabase functions schedule cron-due-reminders "0 13 * * *" --project-ref <project-ref>
```
Adjust the schedule as needed.

## 5. Environment Variables
Set the variables above in both staging and production environments (Vercel or other host). Ensure service role keys are kept secret.

## 6. Vercel / Next.js Hosting
1. Create a Vercel project and link this repository.
2. Define `main` as the production branch and optionally `staging` for previews.
3. Add all environment variables for each environment (Preview/Production).
4. Vercel will build and deploy on push.

## 7. CI/CD Pipeline
The GitHub Actions workflow `.github/workflows/ci.yml` runs type checks, linting, unit tests, and end‑to‑end tests on every push/PR. Ensure the repository is connected to GitHub so the pipeline runs before deployments.

## 8. Rollback Plan
- **Code**: use `git revert` to undo faulty commits and redeploy. Vercel also allows rolling back to a previous deployment via the dashboard.
- **Database**: restore from Supabase point-in-time backups or run `supabase db reset` with a known good migration.
- **Edge Functions**: redeploy previous versions using `supabase functions deploy <name>@<tag>`.

With these steps you can move from local development to staging and production confidently.
