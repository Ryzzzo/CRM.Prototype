# Deployment Instructions

## Environment Variables Required

This application requires the following environment variables to be set:

```
VITE_SUPABASE_URL=https://xsunvprugcgisrsjmyfe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdW52cHJ1Z2NnaXNyc2pteWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTI4MzYsImV4cCI6MjA3NzE4ODgzNn0.HWzE0yRADcQk9UTYn2BSC81-FEKuXNbL6FiFRHMZxRE
```

## Deploying to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Add the environment variables:
   - Click on "Environment Variables"
   - Add `VITE_SUPABASE_URL` with the value above
   - Add `VITE_SUPABASE_ANON_KEY` with the value above
5. Click "Deploy"

## Important Notes

- **CRITICAL**: You MUST set the environment variables in your Vercel project settings
- Without environment variables, the app will show a white screen with an error
- The app uses Supabase for database operations
- All environment variable names must start with `VITE_` for Vite to expose them

## Troubleshooting

### White Screen Issue

If you see a white screen:

1. Open browser console (F12)
2. Check for error messages
3. Most common cause: Missing environment variables
4. Solution: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel

### Environment Variables Not Working

- Make sure variable names start with `VITE_`
- Redeploy after adding environment variables
- Check that values don't have extra spaces or quotes

## Local Development

```bash
npm install
npm run dev
```

Make sure `.env` file exists with the correct values.
