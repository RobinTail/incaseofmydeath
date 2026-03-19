# Next.js Migration Plan

## Overview

Revive the "In Case of My Death" application by migrating from a self-hosted Express backend + PM2 deployment to a serverless Next.js architecture on Vercel.

## Technology Stack

| Component       | Technology                   |
| --------------- | ---------------------------- |
| App             | Next.js 15 (App Router)      |
| Package Manager | PNPM                         |
| Database        | Neon (Postgres via Prisma)   |
| Auth            | GitHub App OAuth             |
| Telegram        | Webhook with secret token    |
| Scheduler       | GitHub Workflow (daily cron) |
| Hosting         | Vercel Free Tier             |

## Architecture Comparison

### Before (Current)

| Component    | Technology                | Hosted On         |
| ------------ | ------------------------- | ----------------- |
| API          | Express + express-zod-api | Self-hosted (VPS) |
| Disposer     | Node.js process (PM2)     | Self-hosted (VPS) |
| Telegram Bot | Telegraf (long-polling)   | Self-hosted (VPS) |
| Frontend     | React + Vite              | Vercel            |
| Database     | MongoDB                   | Self-hosted       |

### After (Target)

| Component    | Technology                   | Hosted On          |
| ------------ | ---------------------------- | ------------------ |
| Full App     | Next.js (App Router)         | Vercel Free        |
| Database     | Neon Postgres + Prisma       | Vercel (free tier) |
| Scheduler    | GitHub Workflow (daily cron) | This repo          |
| Telegram Bot | Webhook (Next.js API Route)  | Same Vercel        |
| Frontend     | Next.js pages/components     | Same Vercel        |

## Project Structure

```
incaseofmydeath/
├── app/
│   ├── api/
│   │   ├── auth/begin/route.ts
│   │   ├── auth/finish/route.ts
│   │   ├── registration/check/route.ts
│   │   ├── registration/remove/route.ts
│   │   ├── registration/public/route.ts
│   │   ├── channels/telegram/connect/route.ts
│   │   ├── channels/telegram/disconnect/route.ts
│   │   ├── installation/find/route.ts
│   │   ├── repos/list/route.ts
│   │   ├── workflows/list/route.ts
│   │   ├── workflows/register/route.ts
│   │   ├── time/route.ts
│   │   ├── v2/status/[login]/route.ts
│   │   └── telegram/route.ts
│   ├── personal/page.tsx
│   ├── status/[login]/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── prisma/
│   └── schema.prisma
├── lib/
│   ├── db.ts              # Prisma client
│   ├── github.ts          # GitHub App helpers
│   ├── telegram.ts        # Telegram bot helpers
│   └── auth.ts            # Auth utilities
├── .github/
│   └── workflows/
│       └── scheduler.yml  # Daily check workflow
├── next.config.ts
└── package.json
```

## Implementation Phases

### Phase 1: Project Setup

1. Initialize new Next.js app with PNPM
   ```bash
   pnpm create next-app@latest incaseofmydeath --typescript --app --no-tailwind --eslint --src-dir=false --import-alias="@/*"
   ```
2. Install dependencies:
   - `prisma` + `@prisma/client` (database)
   - `@octokit/core` + `@octokit/auth-app` (GitHub API)
   - `zod` (validation)
   - `telegraf` (Telegram types, webhook handling)
3. Set up Prisma with Neon Postgres
4. Configure environment variables in Vercel dashboard
5. Delete old `backend/` and `frontend/` directories

### Phase 2: Database Schema Migration

Migrate from MongoDB Mongoose schema to Prisma schema:

```prisma
model User {
  id              Int      @id  // GitHub user ID
  installationId  Int
  repoOwner       String
  repoName        String
  repoBranch      String   @default("main")
  workflowId      Int
  isAlive         Boolean  @default(true)
  isPublic        Boolean  @default(false)
  isCountdown     Boolean  @default(false)
  checkFreq       String   @default("month")  // day|week|month|quarter|year
  deadlineDays    Int      @default(5)
  attemptsCount   Int      @default(3)
  nextCheck       DateTime
  lastConfirmation DateTime
  telegramChatId  String?

  @@index([isAlive, nextCheck])
  @@index([telegramChatId])
}
```

### Phase 3: API Routes

Implement all endpoints as Next.js Route Handlers:

| Old Endpoint                              | New Location                                    | Purpose                           |
| ----------------------------------------- | ----------------------------------------------- | --------------------------------- |
| `GET /v1/auth/begin`                      | `app/api/auth/begin/route.ts`                   | Start GitHub OAuth                |
| `POST /v1/auth/finish`                    | `app/api/auth/finish/route.ts`                  | Complete OAuth, return user token |
| `GET /v1/registration/check`              | `app/api/registration/check/route.ts`           | Check registration status         |
| `DELETE /v1/registration/remove`          | `app/api/registration/remove/route.ts`          | Delete registration               |
| `PATCH /v1/registration/public`           | `app/api/registration/public/route.ts`          | Toggle public status              |
| `POST /v1/installation/find`              | `app/api/installation/find/route.ts`            | Find GitHub App installation      |
| `GET /v1/repos/list`                      | `app/api/repos/list/route.ts`                   | List user repositories            |
| `GET /v1/workflows/list`                  | `app/api/workflows/list/route.ts`               | List repo workflows               |
| `POST /v1/workflows/register`             | `app/api/workflows/register/route.ts`           | Register workflow                 |
| `PATCH /v1/time/update`                   | `app/api/time/route.ts`                         | Update timing settings            |
| `GET /v2/status/:login`                   | `app/api/v2/status/[login]/route.ts`            | Get public status                 |
| `POST /v1/channels/telegram/connect`      | `app/api/channels/telegram/connect/route.ts`    | Connect Telegram                  |
| `DELETE /v1/channels/telegram/disconnect` | `app/api/channels/telegram/disconnect/route.ts` | Disconnect Telegram               |

### Phase 4: Telegram Webhook

Create `app/api/telegram/route.ts`:

1. Handle `POST` requests from Telegram
2. Validate `X-Telegram-Bot-Api-Secret-Token` header
3. Parse update types: `message`, `edited_message`, `callback_query`
4. Handle commands: `/start`, `/help`
5. On any message from registered user: mark as alive
6. Use in-memory debounce cache to prevent spam

**Webhook Protection:**

```typescript
// Validate secret token
const token = request.headers.get("x-telegram-bot-api-secret-token");
if (token !== process.env.TELEGRAM_SECRET_TOKEN) {
  return new Response("Unauthorized", { status: 401 });
}
```

### Phase 5: Scheduler Workflow

Create `.github/workflows/scheduler.yml`:

```yaml
name: Daily Scheduler
on:
  schedule:
    - cron: "0 12 * * *" # Daily at noon UTC
  workflow_dispatch: {}

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Get API Token
        uses: actions/checkout@v4
        with:
          repository: ${{ vars.SCHEDULER_REPO }}
          token: ${{ secrets.SCHEDULER_TOKEN }}

      - name: Run check cycle
        run: |
          curl -X POST https://${{ vars.VERCEL_URL }}/api/internal/scheduler \
            -H "Authorization: Bearer ${{ secrets.SCHEDULER_API_KEY }}"
```

**Note**: For a simpler approach, the workflow can directly query the database and send Telegram messages using the Bot API, bypassing the need for internal API calls.

### Phase 6: Frontend Migration

| Old Location                           | New Location                      | Purpose                 |
| -------------------------------------- | --------------------------------- | ----------------------- |
| `frontend/src/App.tsx`                 | `app/layout.tsx` + `app/page.tsx` | Root layout and landing |
| `frontend/src/pages/Intro.tsx`         | `app/page.tsx`                    | Landing page            |
| `frontend/src/pages/PersonalArea.tsx`  | `app/personal/page.tsx`           | User dashboard          |
| `frontend/src/pages/PublicStatus.tsx`  | `app/status/[login]/page.tsx`     | Public status page      |
| `frontend/src/components/`             | `app/_components/`                | Shared components       |
| `frontend/src/generated/api-client.ts` | Server Actions or direct fetch    | API client              |

### Phase 7: Deployment

1. Push new codebase to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel:
   - `DATABASE_URL` (Neon connection string)
   - `GITHUB_APP_ID`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_PRIVATE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_SECRET_TOKEN`
   - `FRONTEND_URL`
4. Run database migration: `prisma db push`
5. Set webhook URL via Telegram Bot API:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/api/telegram&secret_token=SECRET
   ```
6. Test end-to-end flow

## Environment Variables

| Variable                | Description                         |
| ----------------------- | ----------------------------------- |
| `DATABASE_URL`          | Neon Postgres connection string     |
| `GITHUB_APP_ID`         | GitHub App ID                       |
| `GITHUB_CLIENT_ID`      | GitHub OAuth client ID              |
| `GITHUB_CLIENT_SECRET`  | GitHub OAuth client secret          |
| `GITHUB_PRIVATE_KEY`    | GitHub App private key (PEM)        |
| `TELEGRAM_BOT_TOKEN`    | Telegram bot token                  |
| `TELEGRAM_SECRET_TOKEN` | Secret token for webhook validation |
| `FRONTEND_URL`          | Frontend URL (for OAuth redirect)   |

## Key Differences from Original

1. **No PM2**: Serverless functions handle API requests
2. **No long-polling Telegram**: Webhook-based updates
3. **No self-hosted MongoDB**: Neon Postgres with Prisma
4. **GitHub Workflow instead of Disposer process**: Daily cron workflow
5. **Monorepo simplified**: Single Next.js app instead of workspace

## Migration Notes

- Minimum check frequency is daily (GitHub Actions cron limit)
- Users are programmers comfortable with OAuth install flow
- GitHub App approach provides better UX than PATs
- Neon free tier is sufficient (daily scheduler keeps DB active)
