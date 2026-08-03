# TaskForge

**TaskForge** is a collaborative MERN workspace app for planning and tracking work across teams — with Kanban, calendar, timeline, realtime updates, notifications, and a streaming AI task planner (Groq).

**Live demo:** [https://task-forge-gray.vercel.app](https://task-forge-gray.vercel.app)

---

## Features

### Workspaces & auth
- Register / login with JWT
- Create owned workspaces and join shared ones via invite
- Invite flow with Accept / Decline (not auto-add)
- Profile settings (name, email) with persist API

### Task management
- Workspace-scoped tasks (priority, status, assignee, start/due dates)
- **Kanban board** with drag-and-drop between columns
- **List**, **Calendar** (drag deadlines), and **Timeline / Gantt** views
- Task drawer with comments, activity, and `@mentions`

### Collaboration & realtime
- Socket.IO live updates (tasks, comments, activity, notifications)
- Notification center (invites, assignments, mentions, comments)
- Click notification → open related task in the right workspace

### Personal productivity
- **Home Hub** — personal workload stats/charts (your assigned tasks)
- **My Tasks** — everything assigned to you across all workspaces
- Dark / light appearance toggle

### AI Chat 
- Streaming TaskForge AI assistant (Groq)
- Natural language task planning help
- Stop mid-stream, smart auto-scroll, Jump to latest
- Chat history kept for the browser **session** while logged in

### UX
- Modern design system (Plus Jakarta Sans, motion, dark mode)
- Responsive layout for desktop and mobile

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite, Socket.IO Client, Vercel AI SDK (`ai` / `@ai-sdk/react`) |
| Backend | Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT, bcrypt |
| AI | Groq (`@ai-sdk/groq`) via `POST /api/chat` |
| Hosting | Frontend → **Vercel** · Backend → **Render** · DB → **MongoDB Atlas** |

---

## Project structure

```text
TaskForge/
├── frontend/                 # Vite + React SPA
│   ├── src/
│   │   ├── components/       # UI screens & widgets
│   │   ├── context/          # Theme
│   │   ├── hooks/            # Socket hooks
│   │   ├── services/api.js   # API + chat/socket base URLs
│   │   ├── app/api/chat/     # route module (Vite middleware / docs)
│   │   └── lib/ai-config.ts  # AI model + system prompt
│   ├── vercel.json
│   └── .env.example
├── backend/                  # Express API + Socket.IO
│   ├── routes/               # auth, workspaces, tasks, comments, …
│   ├── models/
│   ├── middleware/
│   ├── socket.js
│   ├── server.js
│   └── .env.example
├── DEPLOY.md                 # Detailed deploy guide
└── README.md
```

---

## Quick start (local)

### Requirements
- Node.js 18+ (22+ recommended)
- MongoDB Atlas connection string
- Free Groq API key: [https://console.groq.com/keys](https://console.groq.com/keys)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (see `backend/.env.example`):

```env
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/taskforge
JWT_SECRET=change-me-to-a-long-random-secret
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=gsk_your-key-here
PORT=5000
```

```bash
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` (see `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`

> Use **two terminals**: backend `npm run dev` + frontend `npm run dev`.

---

## Main screens

| Screen | What it does |
|--------|----------------|
| Home Hub | Personal workload overview |
| My Tasks | All tasks assigned to you |
| AI Chat | Streaming Groq assistant |
| Workspace board | Kanban / List / Calendar / Timeline |
| Settings | Profile + appearance |

---

## API overview

| Area | Base path |
|------|-----------|
| Auth | `/api/auth` |
| Workspaces | `/api/workspaces` |
| Tasks | `/api/tasks` |
| Comments | `/api/comments` |
| Activity | `/api/activities` |
| Notifications | `/api/notifications` |
| AI Chat (SSE) | `/api/chat` |
| Health | `/health` |

Protected routes expect:

```http
Authorization: Bearer <jwt>
```

---

## Environment variables

### Backend (`backend/.env` or Render)

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB Atlas connection |
| `JWT_SECRET` | JWT signing secret |
| `CLIENT_URL` | Frontend origin(s) for CORS + Socket.IO (comma-separated OK) |
| `GROQ_API_KEY` | Groq key for AI Chat |
| `GROQ_MODEL` | Optional (default `llama-3.1-8b-instant`) |
| `PORT` | Set by host in production |

### Frontend (`frontend/.env` or Vercel)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend origin, e.g. `http://localhost:5000` or `https://your-api.onrender.com` |

Do **not** put secrets in `VITE_` vars — they are exposed to the browser.

---

## Deployment

| Part | Platform | Notes |
|------|----------|--------|
| Frontend | [Vercel](https://vercel.com) | Root directory: `frontend` · Env: `VITE_API_URL` |
| Backend | [Render](https://render.com) | Root directory: `backend` · Start: `npm start` |
| Database | MongoDB Atlas | Free tier works |

**Important:** Socket.IO needs a long-lived Node process → deploy backend on Render/Railway, **not** Vercel serverless.

Full step-by-step: see [`DEPLOY.md`](./DEPLOY.md).

### After deploy checklist
1. Render has `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `CLIENT_URL=https://your-app.vercel.app`
2. Vercel has `VITE_API_URL=https://your-api.onrender.com` (then **redeploy**)
3. Test login, board, notifications, and AI Chat

---

## Scripts

### Backend
```bash
npm run dev    # nodemon
npm start      # production
```

### Frontend
```bash
npm run dev      # Vite dev server
npm run build    # production build → dist/
npm run preview  # preview build
npm run lint
```

---

## Notes

- Render free tier may **sleep**; first request after idle can take ~30–60s.
- AI Chat history is stored in **sessionStorage** for the logged-in browser session (cleared on logout / Clear chat).
- Keep `.env` files out of git (already covered by `.gitignore`).

---

## License

ISC
