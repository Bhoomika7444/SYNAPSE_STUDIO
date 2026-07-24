# Synapse Studio — MERN Stack

An AI-powered creative studio: sketch a rough idea on a canvas, describe what
you want, pick a style (Logo / Enhance / 3D / Animation), and get a
professionally generated image back. Every project and every generated image
is saved to your account so you can reopen and keep working on it later.

This is a full conversion of the original Supabase/Lovable project to a
classic **MERN** stack:

- **M**ongoDB — projects, generated images, users
- **E**xpress — REST API
- **R**eact (Vite + TypeScript + Tailwind + shadcn/ui) — unchanged UI/UX
- **N**ode.js — backend runtime

No Supabase, no Lovable-specific tooling — everything runs on your own
Node server and MongoDB database.

## What was kept

Every feature from the original app works exactly the same way from the
user's point of view:

- Landing page → Sign up / Log in
- Dashboard listing all your projects, with "New Project"
- Studio: draw on the canvas (pencil, eraser, shapes, colors, brush size,
  undo/redo, upload a reference image)
- Enter a prompt, pick a tool (Logo / Enhance / 3D / Animation / Generate),
  and the AI turns your rough sketch + description into a polished image
- Generated images are listed per-project; you can download them or apply
  a result back onto the canvas to keep iterating
- "Save" persists the canvas and project name so you can come back later

## What changed under the hood

| Piece            | Before (Supabase)                 | Now (MERN)                               |
|-------------------|-----------------------------------|-------------------------------------------|
| Auth              | Supabase Auth                     | Express + JWT + bcrypt password hashing   |
| Database          | Supabase (Postgres)                | MongoDB (Mongoose)                        |
| Image generation  | Supabase Edge Function → Lovable AI Gateway | Express route → Google Gemini image-generation API |
| Data access       | `@supabase/supabase-js` in the browser | REST API called via `axios`          |

## Project structure

```
synapsestudio-mern/
├── backend/     Express API + MongoDB models
└── frontend/    React app (Vite)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

- `MONGODB_URI` — a local MongoDB (`mongodb://127.0.0.1:27017/synapse-studio`)
  or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.
- `JWT_SECRET` — any long random string (used to sign login sessions).
- `GEMINI_API_KEY` — a free key from [Google AI Studio](https://aistudio.google.com/apikey).
  This powers the actual image generation (Logo/Enhance/3D/Animation/Generate
  buttons). Without it, everything else in the app works — you just won't be
  able to generate images.
- `CLIENT_URL` — the frontend's URL, for CORS (`http://localhost:8080` for
  local dev).

Then run it:

```bash
npm run dev      # auto-restarts on changes (nodemon)
# or
npm start
```

The API starts on `http://localhost:5000` (health check: `GET /api/health`).

## 2. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`frontend/.env` just needs to point at your backend:

```
VITE_API_URL=http://localhost:5000/api
```

Then run it:

```bash
npm run dev
```

Open `http://localhost:8080`. Sign up for an account, create a project, and
start sketching.

## 3. Building for production

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
```

Deploy `frontend/dist` to any static host (Vercel, Netlify, etc.) and deploy
`backend/` to any Node host (Render, Railway, Fly.io, a VPS, etc.) with a
MongoDB Atlas database. Set `VITE_API_URL` (frontend) and `CLIENT_URL`
(backend) to your deployed URLs.

## Notes

- Generated images and canvas snapshots are stored as base64 data URLs
  directly in MongoDB documents (matching how the original app stored them).
  This is simple and works well for a personal/portfolio project; if you
  later have many users, consider moving image storage to something like
  S3/Cloudinary and storing just the URL.
- The AI provider call lives entirely in `backend/src/utils/generateImage.js`.
  If you want to use a different image-generation API (OpenAI, Stability,
  Replicate, etc.) instead of Gemini, that's the only file you need to change.
