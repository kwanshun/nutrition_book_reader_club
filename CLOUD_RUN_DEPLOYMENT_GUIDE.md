# Cloud Run Deployment Guide

This guide covers deploying the Nutrition Book Reader Club application to Google Cloud Run from a GitHub repository.

## 📋 Prerequisites

- Google Cloud Project: `cknwebapp`
- GitHub Repository: `nutrition_book_reader_club`
- Required API Keys:
  - Supabase URL and Anon Key
  - Google Gemini API Key

## 🚀 Deployment Methods

### Method 1: Deploy from Google Cloud Console (Recommended for First Time)

#### Step 1: Navigate to Cloud Run
1. Go to: https://console.cloud.google.com/run?project=cknwebapp
2. Click **"CREATE SERVICE"**

#### Step 2: Choose Source
1. Select **"Continuously deploy from a repository (source or function)"**
2. Click **"SET UP WITH CLOUD BUILD"**

#### Step 3: Connect Repository
1. **Connect GitHub** (if not already connected)
   - Authenticate with GitHub
   - Grant necessary permissions
2. **Select Repository**: `kwanshun/nutrition_book_reader_club`
3. **Select Branch**: `main`
4. **Build Type**: Dockerfile
5. **Source Location**: `/Dockerfile`

#### Step 4: Configure Build Settings
Cloud Build will use the `cloudbuild.yaml` file automatically.

**Set Substitution Variables** (in Cloud Build trigger settings):
- `_NEXT_PUBLIC_SUPABASE_URL`: `https://bnkgdcbwkcervkmpuhqm.supabase.co`
- `_NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJua2dkY2J3a2NlcnZrbXB1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2ODksImV4cCI6MjA3NTA1MzY4OX0.iwQmc37bIY8Fi8jiBsscLbbMeiLxUV6Pos_1kR7KVms`
- `_GEMINI_API_KEY`: `AIzaSyBlBtO5T1lvxL51821bRkAUC6Mxn7iePGk`

#### Step 5: Configure Service Settings
- **Service name**: `ckn-nutrition-app`
- **Region**: `asia-east1` (Taiwan)
- **CPU allocation**: CPU is only allocated during request processing
- **Minimum instances**: 0 (scale to zero)
- **Maximum instances**: 100
- **Authentication**: Allow unauthenticated invocations

#### Step 6: Set Environment Variables (Runtime)
Add these environment variables in the Cloud Run service configuration:
- `NEXT_PUBLIC_SUPABASE_URL`: `https://bnkgdcbwkcervkmpuhqm.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJua2dkY2J3a2NlcnZrbXB1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2ODksImV4cCI6MjA3NTA1MzY4OX0.iwQmc37bIY8Fi8jiBsscLbbMeiLxUV6Pos_1kR7KVms`
- `GEMINI_API_KEY`: `AIzaSyBlBtO5T1lvxL51821bRkAUC6Mxn7iePGk`

#### Step 7: Deploy
1. Click **"CREATE"**
2. Wait for build to complete (~5-10 minutes)
3. Get your service URL: `https://ckn-nutrition-app-xxxxx-uc.a.run.app`

---

### Method 2: Deploy via Command Line

#### Prerequisites
```bash
# Install Google Cloud SDK if not already installed
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project cknwebapp
```

#### Deploy Command
```bash
# Deploy from repository
gcloud run deploy ckn-nutrition-app \
  --source . \
  --region asia-east1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL=https://bnkgdcbwkcervkmpuhqm.supabase.co,NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJua2dkY2J3a2NlcnZrbXB1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2ODksImV4cCI6MjA3NTA1MzY4OX0.iwQmc37bIY8Fi8jiBsscLbbMeiLxUV6Pos_1kR7KVms,GEMINI_API_KEY=AIzaSyBlBtO5T1lvxL51821bRkAUC6Mxn7iePGk
```

---

## 🔄 Automatic Deployment

Once set up, every push to the `main` branch will trigger:
1. **Cloud Build** builds Docker image
2. **Push** to Google Container Registry
3. **Deploy** to Cloud Run automatically

## 🔍 Monitoring Deployment

### View Build Logs
1. Go to: https://console.cloud.google.com/cloud-build/builds?project=cknwebapp
2. Click on the latest build
3. View real-time logs

### View Service Logs
1. Go to: https://console.cloud.google.com/run?project=cknwebapp
2. Click on `ckn-nutrition-app`
3. Click **"LOGS"** tab

## 🛠️ Troubleshooting

### Build Fails with "Missing Environment Variables"
**Solution**: Ensure build arguments are set in Cloud Build trigger substitutions.

### "Container manifest type must support amd64/linux"
**Solution**: The `cloudbuild.yaml` includes `--platform linux/amd64` flag.

### Application Crashes on Startup
**Solution**: Check Cloud Run logs for errors. Verify environment variables are set correctly.

### Static Pages Fail to Generate
**Solution**: Ensure build arguments are passed during Docker build for Next.js static generation.

## 💰 Cost Estimation

### Cloud Build
- **Free tier**: 120 build-minutes/day
- **Paid**: $0.003/build-minute
- **Your usage**: ~3-5 minutes/build = **FREE** (under daily limit)

### Cloud Run
- **Free tier**: 
  - 2 million requests/month
  - 360,000 GB-seconds/month
  - 180,000 vCPU-seconds/month
- **Your usage**: Likely **FREE** for development/testing

## 🔐 Security Best Practices

### Current Setup (Production-Ready)
- ✅ Environment variables passed at runtime
- ✅ Keys not hardcoded in Dockerfile
- ✅ Build arguments used only during build
- ✅ `.env` files excluded from Git

### Recommended Enhancements
- Use **Secret Manager** for sensitive keys
- Rotate API keys regularly
- Use **Cloud Armor** for DDoS protection
- Enable **Cloud Run IAM** for authenticated access

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

## 🎯 Quick Reference

### Service URL
After deployment: `https://ckn-nutrition-app-xxxxx-uc.a.run.app`

### Project ID
`cknwebapp`

### Region
`asia-east1` (Taiwan)

### Container Registry
`gcr.io/cknwebapp/ckn-bookapp`

---

**Last Updated**: October 9, 2025
