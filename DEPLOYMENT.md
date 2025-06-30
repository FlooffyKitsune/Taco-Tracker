# 🚀 Vercel Deployment Guide for Taco Tracker

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
Make sure you have these environment variables ready from your development setup:

**Database (Supabase):**
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `DIRECT_URL` - Your Supabase direct connection string

**Authentication (Auth.js + Discord):**
- `NEXTAUTH_URL` - Will be your Vercel app URL (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `DISCORD_CLIENT_ID` - From Discord Developer Portal
- `DISCORD_CLIENT_SECRET` - From Discord Developer Portal

**Supabase API:**
- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 2. Discord OAuth Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to OAuth2 > General
4. Add redirect URL: `https://your-app.vercel.app/auth/callback/discord`
5. Update your Discord app with the new production URL

### 3. Code Preparation
- ✅ Dev account filtering implemented (Floofy hidden from public leaderboards)
- ✅ All sensitive data in environment variables
- ✅ Database schema deployed to Supabase
- ✅ Vercel configuration added

## 🌐 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment with dev account filtering"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Vercel will auto-detect SvelteKit
5. **DO NOT DEPLOY YET** - Set environment variables first

### Step 3: Configure Environment Variables
In Vercel dashboard, before deploying:
1. Go to Project Settings > Environment Variables
2. Add all the environment variables from your `.env` file
3. Set the correct `NEXTAUTH_URL` to your Vercel app URL

### Step 4: Update Discord OAuth
1. Copy your Vercel app URL (e.g., `https://taco-tracker-abc123.vercel.app`)
2. Update `NEXTAUTH_URL` environment variable in Vercel
3. Add the redirect URL to Discord OAuth settings

### Step 5: Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Test the live application

## 🔧 Post-Deployment

### Database Migration
If this is the first deployment:
```bash
# Run this locally pointing to production database
npx prisma migrate deploy
```

### Test Checklist
- [ ] Authentication works (Discord login)
- [ ] Database connection successful
- [ ] Leaderboard loads (dev accounts hidden)
- [ ] Achievements system works
- [ ] Stats tracking functional
- [ ] All pages load correctly

## 🐛 Troubleshooting

### Common Issues:
1. **Auth errors**: Check `NEXTAUTH_URL` and Discord redirect URLs
2. **Database errors**: Verify `DATABASE_URL` and `DIRECT_URL`
3. **Build failures**: Check Node.js version (should be 18+)
4. **Function timeouts**: API routes have 30s timeout configured

### Environment Variable Format:
```bash
# Example for production
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 📝 Notes
- Dev accounts (Floofy) are automatically filtered from public leaderboards
- All admin debug features only show in development mode
- The app is production-ready with proper error handling and optimizations
