# CreditCraft

AI-assisted credit repair & score coaching tool built with Next.js 14 and Supabase.

## Quick start

```bash
git clone <repo-url>
cd <repo>
./setup.sh   # or run setup.ps1 on Windows
```

The script installs Node, Git, Docker, and the Supabase CLI if needed, starts all services, and opens the app at http://localhost:3000 automatically.

### Troubleshooting
- If it says Docker not running, open Docker Desktop first.
- Allow any install prompts or password requests so tools can be installed.
- If the browser doesn't open, visit http://localhost:3000 manually.

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
