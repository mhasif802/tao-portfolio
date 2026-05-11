# τ Portfolio — Bittensor Subnet Staking Dashboard

A clean portfolio dashboard for your Bittensor subnet stake positions.
Credentials are secured **server-side** — your API key and coldkey never touch the browser.

```
tao-portfolio/
├── backend/     → Express proxy (deploy to Railway)
└── frontend/    → React app (deploy to Vercel)
```

---

## Deployment Guide

### Step 1 — Push to GitHub

Create a new GitHub repository and push this folder:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tao-portfolio.git
git push -u origin main
```

---

### Step 2 — Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your repo and choose the **`backend`** folder as the root directory
4. Once deployed, go to your service → **Variables** tab and add:

   | Variable | Value |
   |---|---|
   | `TAOSTATS_API_KEY` | Your TaoStats API key |
   | `COLDKEY` | Your SS58 coldkey address |
   | `FRONTEND_URL` | *(leave blank for now, fill in after Step 3)* |

5. Railway will auto-deploy. Copy your backend URL (e.g. `https://tao-portfolio-backend.up.railway.app`)

---

### Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project** and import your repo
3. Set **Root Directory** to `frontend`
4. Under **Environment Variables**, add:

   | Variable | Value |
   |---|---|
   | `VITE_BACKEND_URL` | Your Railway backend URL from Step 2 |

5. Click **Deploy**. Copy your Vercel URL (e.g. `https://tao-portfolio.vercel.app`)

---

### Step 4 — Connect Frontend URL to Backend (CORS)

Go back to Railway → your backend service → **Variables** and update:

| Variable | Value |
|---|---|
| `FRONTEND_URL` | Your Vercel URL from Step 3 |

Railway will redeploy automatically. Your dashboard is now live and secure! 🎉

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env          # fill in your values
npm install
npm run dev                   # runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
cp .env.example .env.local    # VITE_BACKEND_URL=http://localhost:3001
npm install
npm run dev                   # runs on http://localhost:5173
```

---

## Security Model

- Your `TAOSTATS_API_KEY` and `COLDKEY` live **only** in Railway environment variables
- The browser calls your backend (`/api/portfolio`) — never TaoStats directly
- The backend makes the authenticated request to TaoStats and returns only the data
- CORS is locked to your Vercel frontend URL
- No private keys are ever used — this is **read-only** data

---

## Getting a TaoStats API Key

Sign up for free at [taostats.io](https://taostats.io) → Account → API Keys.
