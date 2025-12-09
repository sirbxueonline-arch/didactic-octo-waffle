# Deployment Guide - Vercel

This guide will help you deploy StudyPilot to Vercel with GitHub auto-deploy.

## Prerequisites

- GitHub account
- Vercel account ([sign up here](https://vercel.com))
- Supabase project with database migrations applied

## Step 1: Push Code to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub (don't initialize with README)

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/studypilot.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js - click **"Deploy"**

## Step 3: Configure Environment Variables

After the initial deployment, configure environment variables:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable below for **all environments** (Production, Preview, Development):

### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Optional Variables (for real AI)

```
AI_PROVIDER=mock
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important Notes:**
- `SUPABASE_SERVICE_ROLE_KEY` is a server secret - never expose it to the client
- Set `AI_PROVIDER=mock` for testing (no API keys needed)
- Set `AI_PROVIDER=openai` or `gemini` for real AI (requires respective API key)
- `NEXT_PUBLIC_APP_URL` should be your Vercel deployment URL

4. Click **"Save"** after adding all variables

## Step 4: Redeploy

1. After adding environment variables, go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Wait for the build to complete

## Step 5: Configure Supabase Redirect URLs

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add these URLs to **"Redirect URLs"**:
   ```
   https://your-project.vercel.app
   https://your-project.vercel.app/auth/callback
   ```
4. Add to **"Site URL"**:
   ```
   https://your-project.vercel.app
   ```
5. Save changes

## Auto-Deploy Setup

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

No additional configuration needed!

## Troubleshooting

### Build Fails

- ✅ Verify all environment variables are set in Vercel
- ✅ Check that Supabase migrations have been run
- ✅ Review build logs in Vercel dashboard for specific errors

### Runtime Errors

- ✅ Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (required for `/api/library/save`)
- ✅ Verify database migrations are applied in Supabase
- ✅ Check function logs in Vercel dashboard

### Authentication Issues

- ✅ Verify redirect URLs are configured in Supabase
- ✅ Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- ✅ Ensure cookies are enabled in your browser

### API Routes Not Working

- ✅ Route handlers using server secrets (`/api/library/save`, `/api/generate`) are configured to use Node.js runtime
- ✅ Check that `SUPABASE_SERVICE_ROLE_KEY` is set for `/api/library/save`
- ✅ Verify API keys are set if using real AI providers

## Environment Variables Reference

Create a `.env.local` file for local development (copy from `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Provider
AI_PROVIDER=mock
# AI_PROVIDER=openai
# AI_PROVIDER=gemini

# OpenAI (if using)
OPENAI_API_KEY=your_openai_api_key

# Gemini (if using)
GEMINI_API_KEY=your_gemini_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps

After successful deployment:
1. Test authentication flow
2. Test content generation
3. Test saving to library (should enforce 20/month limit)
4. Monitor Vercel function logs for any issues

Your app is now live! 🚀

