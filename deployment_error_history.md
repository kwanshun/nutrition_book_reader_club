# Docker to Google Cloud Run Deployment Error History

**Project**: Nutrition Book Reader Club  
**Date**: January 8, 2025  
**Platform**: Google Cloud Run  
**Project ID**: cknwebapp  

## Overview

This document details the complete journey from building a Docker image locally to successfully deploying it to Google Cloud Run, including all errors encountered and their solutions.

## Initial Setup

### Docker Image Details
- **Image Name**: `ckn-bookapp-image-for-test`
- **Base Image**: `node:20-alpine`
- **Architecture**: Initially ARM64 (Mac with Apple Silicon)
- **Final Architecture**: AMD64/Linux (Cloud Run compatible)

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`: https://bnkgdcbwkcervkmpuhqm.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- `GEMINI_API_KEY`: AIzaSyBlBtO5T1lvxL51821bRkAUC6Mxn7iePGk

## Error History & Solutions

### Error #1: Next.js Build Failure - Missing Environment Variables

**Error Message:**
```
Error occurred prerendering page "/login". Read more: https://nextjs.org/docs/messages/prerender-error
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**Root Cause:**
- Next.js tries to pre-render static pages during `npm run build`
- Supabase client initialization requires environment variables at build time
- Docker build context doesn't include `.env.local` files (they're in `.gitignore`)

**Solution:**
```bash
docker build -t ckn-bookapp-image-for-test \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://bnkgdcbwkcervkmpuhqm.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --build-arg GEMINI_API_KEY="AIzaSyBlBtO5T1lvxL51821bRkAUC6Mxn7iePGk" \
  .
```

**Key Learning:** Next.js static generation requires environment variables at build time, not just runtime.

---

### Error #2: Architecture Mismatch - ARM64 vs AMD64

**Error Message:**
```
Failed. Details: Cloud Run does not support image 'gcr.io/cknwebapp/ckn-bookapp@sha256:...': Container manifest type 'application/vnd.oci.image.index.v1+json' must support amd64/linux.
```

**Root Cause:**
- Docker image built on Mac with Apple Silicon (ARM64 architecture)
- Google Cloud Run requires AMD64/Linux architecture
- Architecture incompatibility prevents deployment

**Solution:**
```bash
# Rebuild with platform specification
docker build --platform linux/amd64 -t ckn-bookapp-image-for-test \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://bnkgdcbwkcervkmpuhqm.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --build-arg GEMINI_API_KEY="AIzaSyBlBtO5T1lvxL51821bRkAUC6Mxn7iePGk" \
  .
```

**Key Learning:** Always specify `--platform linux/amd64` when building Docker images for cloud deployment on Mac with Apple Silicon.

---

### Error #3: Project Configuration - Project Number vs Project ID

**Error Message:**
```
ERROR: (gcloud.run.deploy) The value of ``core/project'' property is set to project number.To use this command, set ``--project'' flag to PROJECT ID or set ``core/project'' property to PROJECT ID.
```

**Root Cause:**
- `gcloud config` was set to project number (e.g., `372012640887`)
- Cloud Run commands require project ID (e.g., `cknwebapp`)

**Solution:**
```bash
# Option 1: Set project in config
gcloud config set project cknwebapp

# Option 2: Use --project flag
gcloud run deploy ckn-nutrition-app --project cknwebapp ...
```

**Key Learning:** Always use project ID, not project number, for Cloud Run deployments.

---

### Error #4: Cloud Run Caching - Old Image Reference

**Error Message:**
```
Failed. Details: Cloud Run does not support image 'gcr.io/cknwebapp/ckn-bookapp@sha256:b2d5eac602cfd17938b1c253f9d36500fe12734acca384d92b60ef7a600be7a8': Container manifest type 'application/vnd.oci.image.index.v1+json' must support amd64/linux.
```

**Root Cause:**
- Cloud Run was still referencing the old ARM64 image digest
- Even though `:latest` tag was updated, Cloud Run cached the old reference
- The old digest `b2d5eac602cfd17938b1c253f9d36500fe12734acca384d92b60ef7a600be7a8` was ARM64
- The new digest `c3b179756bca7f7e49acbe5fb8ba814286eb4a1b42b219a7bdf54517a92d79ad` was AMD64

**Solution:**
```bash
# Create a new tag to bypass caching
docker tag ckn-bookapp-image-for-test gcr.io/cknwebapp/ckn-bookapp:v2
docker push gcr.io/cknwebapp/ckn-bookapp:v2

# Deploy with new tag
gcloud run deploy ckn-nutrition-app \
  --project cknwebapp \
  --image gcr.io/cknwebapp/ckn-bookapp:v2 \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated
```

**Key Learning:** Cloud Run may cache image references. Use new tag names to bypass caching issues.

---

## Complete Successful Deployment Process

### Step 1: Build Docker Image with Correct Architecture
```bash
docker build --platform linux/amd64 -t ckn-bookapp-image-for-test \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://bnkgdcbwkcervkmpuhqm.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --build-arg GEMINI_API_KEY="AIzaSyBlBtO5T1lvxL51821bRkAUC6Mxn7iePGk" \
  .
```

### Step 2: Tag for Google Container Registry
```bash
docker tag ckn-bookapp-image-for-test gcr.io/cknwebapp/ckn-bookapp:v2
```

### Step 3: Authenticate Docker with Google Cloud
```bash
gcloud auth configure-docker
```

### Step 4: Push to Google Container Registry
```bash
docker push gcr.io/cknwebapp/ckn-bookapp:v2
```

### Step 5: Deploy to Cloud Run
```bash
gcloud run deploy ckn-nutrition-app \
  --project cknwebapp \
  --image gcr.io/cknwebapp/ckn-bookapp:v2 \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated
```

## Key Lessons Learned

### 1. Architecture Compatibility
- **Always specify platform**: Use `--platform linux/amd64` when building for cloud deployment
- **Check your system**: Mac with Apple Silicon builds ARM64 by default
- **Cloud platforms**: Most cloud services require AMD64/Linux

### 2. Environment Variables in Docker
- **Build-time vs Runtime**: Next.js static generation needs env vars at build time
- **Security trade-off**: Build args embed secrets in image (not ideal for production)
- **Alternative approaches**: Use runtime environment variables for production

### 3. Google Cloud Configuration
- **Project ID vs Number**: Always use project ID for Cloud Run commands
- **Authentication**: Ensure Docker is authenticated with GCR
- **Caching issues**: Use new tag names to bypass Cloud Run caching

### 4. Docker Best Practices
- **Multi-stage builds**: Use for production optimization
- **Layer caching**: Docker reuses layers when possible
- **Tag management**: Use semantic versioning for production

## Security Considerations

### Current Approach (Testing)
- ✅ **Keys embedded in image**: Works for testing and development
- ⚠️ **Security risk**: Keys visible in image layers
- ⚠️ **Not shareable**: Image contains sensitive data

### Production Approach (Recommended)
- ✅ **Build without keys**: Remove ARG/ENV lines from Dockerfile
- ✅ **Runtime environment variables**: Pass keys at deployment time
- ✅ **Secret management**: Use Google Secret Manager for production

## Troubleshooting Commands

### Check Docker Images
```bash
docker images | grep ckn-bookapp
```

### Check GCR Repository
```bash
gcloud container images list-tags gcr.io/cknwebapp/ckn-bookapp --project cknwebapp
```

### Check Project Configuration
```bash
gcloud config get-value project
```

### View Cloud Run Logs
```bash
gcloud run services logs read ckn-nutrition-app --project cknwebapp
```

## Final Result

**Successfully deployed to**: `https://ckn-nutrition-app-xxxxx-uc.a.run.app`

**Total deployment time**: ~15 minutes (including troubleshooting)

**Key takeaway**: Always build with `--platform linux/amd64` for cloud deployment and use new tag names to avoid caching issues.

---

*This document serves as a reference for future deployments and helps other developers avoid similar issues when deploying Docker images to Google Cloud Run.*
