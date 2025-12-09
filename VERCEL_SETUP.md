# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] All route handlers using server secrets configured with `export const runtime = 'nodejs'`
  - `/api/library/save` - Uses `SUPABASE_SERVICE_ROLE_KEY`
  - `/api/generate` - Uses `OPENAI_API_KEY` or `GEMINI_API_KEY` (if configured)

- [x] Environment variables documented in `.env.example`
- [x] README includes deployment instructions
- [x] `vercel.json` configuration file created
- [x] Middleware configured for auth and redirects

## Environment Variables Required in Vercel

### Required (All Environments)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Optional (All Environments)
```
AI_PROVIDER=mock
OPENAI_API_KEY (if AI_PROVIDER=openai)
GEMINI_API_KEY (if AI_PROVIDER=gemini)
NEXT_PUBLIC_APP_URL
```

## Post-Deployment Steps

1. ✅ Configure Supabase redirect URLs
2. ✅ Test authentication flow
3. ✅ Test content generation
4. ✅ Test library save (verify 20/month limit enforcement)
5. ✅ Monitor Vercel function logs

## Runtime Configuration

Route handlers are configured as follows:

- **Node.js Runtime** (for server secrets):
  - `/api/library/save` - Uses service role key
  - `/api/generate` - Uses AI provider API keys

- **Edge Runtime** (default, for public APIs):
  - `/api/usage`
  - `/api/library`
  - `/api/feedback`
  - `/api/attempts`
  - `/api/flashcards/progress`

This ensures optimal performance while maintaining security for server secrets.

