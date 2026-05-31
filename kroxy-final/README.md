# Kroxy AI

## 🔑 API Keys — Vercel setup

Go to your Vercel project → **Settings → Environment Variables** and add:

| Variable | Used for | Get it at |
|---|---|---|
| `GROQ_API_KEY` | Chat (llama-3.3-70b) + Voice STT (Whisper) | https://console.groq.com |
| `GEMINI_API_KEY` | Image generation (Imagen 3) | https://aistudio.google.com/apikey |

Keys are **server-side only** — never exposed to the browser.

## 🧠 How AI is routed

| Feature | Model | Provider |
|---|---|---|
| 💬 Chat & coding | `llama-3.3-70b-versatile` | Groq |
| 🎤 Voice → text | `whisper-large-v3-turbo` | Groq |
| 🎨 Image generation | `imagen-3.0-generate-002` | Gemini |

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Kroxy AI"
git remote add origin https://github.com/YOUR_USERNAME/kroxy-ai.git
git push -u origin main

# 2. Import on Vercel
# Go to vercel.com → New Project → Import your repo
# Framework: Next.js (auto-detected)
# Add the 2 env vars above → Deploy
```

## 💻 Local dev

```bash
cp .env.example .env.local
# Fill in your keys in .env.local
npm install
npm run dev
```

## 📁 API Routes

```
app/api/chat/route.ts         ← Groq llama-3.3-70b (streaming chat)
app/api/transcribe/route.ts   ← Groq Whisper STT (audio → text)
app/api/image/route.ts        ← Gemini Imagen 3 (image generation)
```
