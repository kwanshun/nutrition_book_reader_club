# Docker Build Guide - Nutrition Book Reader Club

This guide will help you build and run the Docker image for the nutrition book reader club application.

## Prerequisites

1. **Docker installed** on your system
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify installation: `docker --version`

2. **Environment variables** ready
   - Supabase URL and keys
   - Gemini API key

## Step-by-Step Guide

### 1. Prepare Environment Variables

Create a `.env.local` file in the `frontend/` directory with your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Build the Docker Image

Navigate to the `frontend/` directory and build the image:

```bash
cd frontend
docker build -t nutrition-book-reader:latest .
```

**Build time:** Approximately 3-5 minutes depending on your system.

### 3. Run the Docker Container

Run the container with environment variables:

```bash
docker run -d \
  --name nutrition-app \
  -p 3000:3000 \
  --env-file .env.local \
  nutrition-book-reader:latest
```

**Or run with individual environment variables:**

```bash
docker run -d \
  --name nutrition-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your_url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your_key" \
  -e GEMINI_API_KEY="your_key" \
  nutrition-book-reader:latest
```

### 4. Verify the Container is Running

Check container status:

```bash
docker ps
```

View container logs:

```bash
docker logs nutrition-app
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Docker Management Commands

### Stop the container
```bash
docker stop nutrition-app
```

### Start the container
```bash
docker start nutrition-app
```

### Remove the container
```bash
docker rm -f nutrition-app
```

### View container logs (live)
```bash
docker logs -f nutrition-app
```

### Access container shell
```bash
docker exec -it nutrition-app sh
```

## Troubleshooting

### Issue 1: Build fails with "npm ci" error
**Solution:** Delete `node_modules` and `package-lock.json`, then rebuild:
```bash
rm -rf node_modules package-lock.json
npm install
docker build -t nutrition-book-reader:latest .
```

### Issue 2: Container exits immediately
**Solution:** Check logs for errors:
```bash
docker logs nutrition-app
```

Common causes:
- Missing environment variables
- Port 3000 already in use
- Build errors

### Issue 3: Port 3000 already in use
**Solution:** Use a different port:
```bash
docker run -d --name nutrition-app -p 8080:3000 --env-file .env.local nutrition-book-reader:latest
```
Then access at: http://localhost:8080

### Issue 4: Image is too large
**Solution:** The multi-stage build should already optimize size. Current image size should be ~200-300MB.

Check image size:
```bash
docker images nutrition-book-reader
```

## Advanced: Docker Compose (Optional)

Create a `docker-compose.yml` file in the `frontend/` directory:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Run with Docker Compose:

```bash
docker-compose up -d
```

Stop with Docker Compose:

```bash
docker-compose down
```

## Deployment to Cloud Platforms

### Google Cloud Run

1. **Build and tag the image:**
```bash
docker build -t gcr.io/YOUR_PROJECT_ID/nutrition-book-reader:latest .
```

2. **Push to Google Container Registry:**
```bash
docker push gcr.io/YOUR_PROJECT_ID/nutrition-book-reader:latest
```

3. **Deploy to Cloud Run:**
```bash
gcloud run deploy nutrition-app \
  --image gcr.io/YOUR_PROJECT_ID/nutrition-book-reader:latest \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=your_url,NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
```

### Docker Hub (for sharing)

1. **Tag the image:**
```bash
docker tag nutrition-book-reader:latest YOUR_DOCKERHUB_USERNAME/nutrition-book-reader:latest
```

2. **Login to Docker Hub:**
```bash
docker login
```

3. **Push to Docker Hub:**
```bash
docker push YOUR_DOCKERHUB_USERNAME/nutrition-book-reader:latest
```

## Image Details

- **Base Image:** `node:20-alpine` (lightweight)
- **Build Stage:** Compiles Next.js application
- **Production Stage:** Runs standalone Next.js server
- **User:** Non-root user (nextjs:nodejs) for security
- **Port:** 3000
- **Size:** ~200-300MB (optimized)

## Security Best Practices

1. **Never commit `.env.local`** to git (already in `.gitignore`)
2. **Use Docker secrets** for sensitive data in production
3. **Run as non-root user** (already configured in Dockerfile)
4. **Scan image for vulnerabilities:**
```bash
docker scan nutrition-book-reader:latest
```

## Performance Tips

1. **Enable BuildKit** for faster builds:
```bash
DOCKER_BUILDKIT=1 docker build -t nutrition-book-reader:latest .
```

2. **Use layer caching** - rebuild only when dependencies change
3. **Multi-stage build** already minimizes final image size

## Next Steps

After successful Docker deployment:
1. ✅ Test all features (login, quiz, food recognition, chat)
2. ✅ Monitor container logs for errors
3. ✅ Set up automatic restarts with `--restart unless-stopped`
4. ✅ Consider using Docker Compose for easier management
5. ✅ Deploy to cloud platform (Google Cloud Run, AWS ECS, etc.)

---

**Need Help?** 
- Docker documentation: https://docs.docker.com
- Next.js Docker guide: https://nextjs.org/docs/deployment
- Project README: `docs/MASTER_PLAN.md`


