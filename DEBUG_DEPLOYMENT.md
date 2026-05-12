# Debugging the NEXT_PUBLIC_API_URL Issue

## Problem
Frontend still calls `http://localhost:3001` instead of `https://examroomedu.com/1/api`

## Verification Steps

### Step 1: Check GitHub Actions Build Log
1. Go to: https://github.com/5kozarskabrigada/sat-mock-front/actions
2. Click on the latest "Build and Push Docker Image" workflow run
3. Expand the "Build and push Docker image" step
4. Search for `NEXT_PUBLIC_API_URL` in the logs
5. Verify it shows: `Building with build arg: NEXT_PUBLIC_API_URL=https://examroomedu.com/1/api`

### Step 2: Verify Secret Value
1. Go to: https://github.com/5kozarskabrigada/sat-mock-front/settings/secrets/actions
2. Click on `NEXT_PUBLIC_API_URL` secret
3. Click "Update secret"
4. Verify the value is **exactly**: `https://examroomedu.com/1/api`
   - No trailing slash
   - No extra spaces
   - Correct protocol (https)
   - Correct path (/1/api)

### Step 3: SSH into VPS and Check Container
```bash
# SSH into your VPS
ssh <username>@91.99.144.x

# Check if container is running
docker ps | grep sat-web

# Check when container was created (should be recent)
docker inspect sat-web --format='{{.Created}}'

# Check container environment variables
docker exec sat-web printenv | grep NEXT_PUBLIC

# View container logs
docker logs sat-web --tail 50

# Check which image the container is using
docker inspect sat-web --format='{{.Image}}'
```

### Step 4: Manual Container Restart (If Needed)
```bash
# Pull the absolute latest image
docker pull ghcr.io/5kozarskabrigada/sat-mock-front:latest

# Stop and remove old container
docker stop sat-web
docker rm sat-web

# Run new container (without -e NEXT_PUBLIC_API_URL since it's baked into image)
docker run -d \
  --name sat-web \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  ghcr.io/5kozarskabrigada/sat-mock-front:latest

# Check logs
docker logs sat-web --tail 20
```

### Step 5: Test the Built Bundle
Once container is running, check what API URL is actually in the bundle:

```bash
# SSH into the running container
docker exec -it sat-web sh

# Search for the API URL in the built JavaScript
cd /app/.next
grep -r "localhost:3001" .
grep -r "examroomedu.com/1/api" .

# Exit container
exit
```

## Expected Results

### ✅ Success indicators:
- GitHub Actions logs show: `NEXT_PUBLIC_API_URL=https://examroomedu.com/1/api`
- Container created timestamp is after your recent push (less than 1 hour ago)
- `grep` in .next folder shows `examroomedu.com/1/api` and NOT `localhost:3001`
- Browser network tab shows: `POST https://examroomedu.com/1/api/auth/login`

### ❌ Failure indicators:
- GitHub Actions doesn't show the build arg (secret not set correctly)
- Container is old (created hours/days ago - didn't restart)
- `grep` still shows `localhost:3001` in bundle (build didn't embed the value)

## If Still Not Working

### Nuclear Option: Force Rebuild with Cache Busting
Add this to the Dockerfile temporarily before the build step:

```dockerfile
# Force cache invalidation
ARG CACHEBUST=1
RUN echo "Cache bust: $CACHEBUST"

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

Then trigger a new build with a different CACHEBUST value.

### Alternative: Hardcode the Value Temporarily
Edit `web/src/lib/api-client.ts`:

```typescript
// Temporary hardcode for testing
const RAW_API_URL = 'https://examroomedu.com/1/api';
```

This will confirm if the deployment process works, then revert and fix the proper env var approach.
