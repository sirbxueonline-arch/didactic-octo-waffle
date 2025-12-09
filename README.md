# StudyPilot

A premium, production-ready Next.js study assistant application with AI-powered content generation.

## Features

- **AI Content Generation**: Explain, Flashcards, Quiz, Study Plan
- **Library Management**: Save, organize, and study your content
- **Spaced Repetition**: Leitner system for flashcards
- **Analytics**: Track your progress and weak topics
- **Monthly Limits**: 20 saved resources per month (enforced server-side)
- **Dark/Light/System Theme**: Full theme support with persistence
- **Progressive Disclosure**: Clean UI with advanced options hidden by default

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- Supabase (Auth + Postgres)
- Recharts

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Get your service role key from Project Settings > API

### 3. Run Database Migrations

1. Open Supabase SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the migration

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (for real AI):
- `AI_PROVIDER` (set to `openai` or `gemini` for real AI, or `mock` for testing)
- `OPENAI_API_KEY` or `GEMINI_API_KEY`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app                 # Next.js App Router pages
/components          # React components
/lib                 # Utilities and helpers
/supabase           # Supabase client and migrations
/public             # Static assets
```

## Key Features

### Generation Modes

- **Mock Mode** (default): No API keys required, generates sample content
- **Real Mode**: Set `AI_PROVIDER` to `openai` or `gemini` with API keys

### Monthly Limits

- 20 saved resources per user per month
- Enforced atomically via Postgres RPC function
- Generation is free; saving consumes 1 resource

### Theme System

- Dark mode: Cosmic purple theme
- Light mode: Clean white with purple accents
- System: Follows OS preference

## Deployment to Vercel

### Prerequisites

1. A GitHub account
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. A Supabase project with the database migrations applied

### Step 1: Push to GitHub

1. Initialize a git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/studypilot.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)

**Optional:**
- `AI_PROVIDER` - Set to `mock`, `openai`, or `gemini` (default: `mock`)
- `OPENAI_API_KEY` - Required if `AI_PROVIDER=openai`
- `GEMINI_API_KEY` - Required if `AI_PROVIDER=gemini`
- `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

**To add environment variables:**
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable for all environments (Production, Preview, Development)
4. Click "Save"

### Step 4: Deploy

1. After adding environment variables, Vercel will automatically trigger a new deployment
2. Or manually trigger a deployment from the "Deployments" tab
3. Wait for the build to complete
4. Your app will be live at `https://your-project.vercel.app`

### Step 5: Update Supabase Redirect URLs

1. Go to your Supabase project dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel URL to "Redirect URLs":
   - `https://your-project.vercel.app`
   - `https://your-project.vercel.app/auth/callback`
4. Save changes

### Auto-Deploy

Vercel will automatically deploy:
- **Production**: Every push to your main branch
- **Preview**: Every push to other branches or pull requests

### Troubleshooting

**Build fails:**
- Check that all environment variables are set correctly
- Verify Supabase migrations have been run
- Check build logs in Vercel dashboard

**Runtime errors:**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (required for `/api/library/save`)
- Verify database migrations are applied
- Check function logs in Vercel dashboard

**Authentication issues:**
- Verify redirect URLs are configured in Supabase
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

## License

MIT

