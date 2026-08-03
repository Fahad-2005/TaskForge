# TaskForge deployment

## Architecture

| Part | Host | Why |
|------|------|-----|
| Frontend (React/Vite) | **Vercel** | Perfect for static SPA |
| Backend (Express + Socket.IO + Groq chat) | **Render** or **Railway** | Needs a real Node server (WebSockets) |
| Database | **MongoDB Atlas** | Already in use |

> Socket.IO does **not** work reliably on Vercel serverless. Deploy the backend elsewhere.

## 1) Backend on Render (recommended)

1. Push your code to GitHub.
2. Go to [https://render.com](https://render.com) → **New → Web Service**.
3. Connect the TaskForge repo.
4. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Environment variables:
   - `MONGO_URI` = your Atlas URI
   - `JWT_SECRET` = long random string
   - `CLIENT_URL` = `https://YOUR-APP.vercel.app` (add local later if needed)
   - `GROQ_API_KEY` = your Groq key
6. Deploy → copy the service URL, e.g. `https://taskforge-api.onrender.com`

## 2) Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Add New Project**.
2. Import the TaskForge repo.
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment variable:
   - `VITE_API_URL` = `https://taskforge-api.onrender.com` (no trailing slash)
5. Deploy.

## 3) Wire them together

1. In Render, set `CLIENT_URL` to your Vercel URL (and restart).
2. In Vercel, confirm `VITE_API_URL` points at Render, then **Redeploy** (Vite bakes env at build time).
3. Open the Vercel site → login → test board + AI Chat.

## Local still works

```bash
# backend/.env
MONGO_URI=...
JWT_SECRET=...
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=gsk_...

# frontend/.env
VITE_API_URL=http://localhost:5000
```

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Free-tier note

Render free web services **sleep** after idle time (~50s cold start). Railway paid/hobby is snappier. MongoDB Atlas free tier is fine.
