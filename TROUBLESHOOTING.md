# Troubleshooting White Screen on Vercel

## Quick Diagnosis

Visit `/health.html` on your deployed site (e.g., `https://your-app.vercel.app/health.html`)

- ✅ **If you see the health check page**: Deployment works, issue is with the React app
- ❌ **If you get 404**: Deployment configuration issue

## Most Common Cause: Missing Environment Variables

### The Problem

The app shows a **white screen** because Supabase environment variables are not set in Vercel.

### The Solution

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/dashboard

2. **Navigate to your project** → **Settings** → **Environment Variables**

3. **Add these two variables:**

   **Variable 1:**
   ```
   Name:  VITE_SUPABASE_URL
   Value: https://xsunvprugcgisrsjmyfe.supabase.co
   ```

   **Variable 2:**
   ```
   Name:  VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdW52cHJ1Z2NnaXNyc2pteWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTI4MzYsImV4cCI6MjA3NzE4ODgzNn0.HWzE0yRADcQk9UTYn2BSC81-FEKuXNbL6FiFRHMZxRE
   ```

4. **Important**: Select **All** for environments (Production, Preview, Development)

5. **Redeploy** your app:
   - Go to **Deployments** tab
   - Click the three dots (•••) on the latest deployment
   - Click **Redeploy**

## Check for Errors

### Open Browser Console

1. Press **F12** (or Cmd+Option+I on Mac)
2. Go to **Console** tab
3. Look for error messages

### Common Error Messages & Solutions

#### Error: "Missing Supabase environment variables"

**Cause**: Environment variables not set in Vercel

**Solution**: Follow steps above to add environment variables

#### Error: "createClient is not a function"

**Cause**: Supabase package issue

**Solution**: Should not occur with current build, but if it does, contact support

#### Blank console with no errors

**Cause**: JavaScript not loading

**Solution**:
- Check Network tab in dev tools
- Look for failed requests (red items)
- Verify all assets are loading from correct paths

## Vercel Configuration

The project includes `vercel.json` with proper routing configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures all routes work correctly with React Router.

## Testing Locally

To verify everything works before deploying:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

If it works locally but not on Vercel, the issue is environment variables.

## Checklist

- [ ] Environment variables added to Vercel
- [ ] Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set
- [ ] Variables set for all environments (Production, Preview, Development)
- [ ] Redeployed after adding variables
- [ ] Cleared browser cache
- [ ] Checked browser console for errors
- [ ] Verified `/health.html` loads

## Still Not Working?

### Step 1: Verify Variable Names

Variable names **must** start with `VITE_` exactly as shown:
- ✅ `VITE_SUPABASE_URL`
- ❌ `SUPABASE_URL`
- ❌ `REACT_APP_SUPABASE_URL`

### Step 2: Check for Typos

- No extra spaces before/after variable names or values
- No quotes around values in Vercel dashboard
- Copy-paste values directly (don't type them)

### Step 3: Force Redeploy

Sometimes Vercel caches old builds:

1. Go to Settings → Environment Variables
2. Delete the variables
3. Add them again
4. Trigger a new deployment (push a commit or manual redeploy)

### Step 4: Check Build Logs

In Vercel dashboard:
1. Go to Deployments
2. Click on latest deployment
3. Check build logs for errors
4. Look for "Missing Supabase environment variables" error

## Error Boundary

The app now includes an error boundary that will show detailed error messages instead of a white screen. If you see a red error page, it will include:

- Error message
- Stack trace
- Reload button

This makes debugging much easier!

## Support

If you're still seeing a white screen after following all steps:

1. Take a screenshot of your Vercel environment variables settings
2. Take a screenshot of browser console (F12)
3. Share the deployment URL
4. Share the error messages from both sources

## Quick Reference

**Your Supabase Project:**
```
URL: https://xsunvprugcgisrsjmyfe.supabase.co
Project ID: xsunvprugcgisrsjmyfe
```

**Required Environment Variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Files Included:**
- ✅ `vercel.json` - Routing configuration
- ✅ `_redirects` - Fallback routing
- ✅ `ErrorBoundary.tsx` - Error display
- ✅ `health.html` - Deployment test page
- ✅ Environment variable validation in code
