# Deploying the live demo

The app runs entirely on a **cached data snapshot** (`src/lib/*-snapshot.json`), so it
needs **no environment variables or database access** to run. That makes it trivial to
stand up a shareable demo.

> Note: the snapshot contains real advocate names/emails and there is **no login yet**
> (by design for this phase). Keep the link internal.

---

## Recommended: Vercel (≈2 minutes, free)

Vercel auto-detects Next.js — no config needed.

1. Go to **https://vercel.com** and sign in with GitHub (use an account that can see
   `meghanmarkham-creator/nestapp`).
2. **Add New… → Project** → import `meghanmarkham-creator/nestapp`.
3. When it asks for the branch, pick **`claude/new-session-bj0kjp`** (or merge that
   branch to `main` first and deploy `main`).
4. Framework preset: **Next.js** (auto-filled). Leave Build/Output settings at defaults.
   No environment variables required.
5. Click **Deploy**. In ~1–2 min you get a URL like
   `https://nestapp-xxxx.vercel.app` — share that with your team.

Every push to that branch redeploys automatically. Preview URLs are created per branch/PR.

### (Optional) later, to go live against Snowflake
Add the `SNOWFLAKE_*` env vars in Vercel → Project → Settings → Environment Variables,
set `NEST_DATA_SOURCE=snowflake`, and add `snowflake-sdk` to dependencies. Until then it
serves the snapshot.

---

## Alternative: run it anywhere with Node 18+

```bash
npm ci
npm run build
npm start          # serves on http://localhost:3000
```

Share over your network, or put it behind your internal proxy/SSO.

---

## Alternative: container (for internal platforms — ECS/K8s)

A minimal production image:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t nest-readiness .
docker run -p 3000:3000 nest-readiness
```
