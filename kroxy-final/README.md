# Kroxy AI

Smart AI assistant built on `assistant-ui` + Next.js + Gemini, deployed on **Cloudflare Pages**.

## ✨ Features
- 🔍 **Real web search** — Gemini's built-in Google Search grounding (live results, cited sources)
- 💻 **Code** — any language, syntax-highlighted code blocks with copy button
- 🎬 **YouTube content** — thumbnail ideas, banners, channel art for Minecraft, Roblox, Fortnite & more
- **Bold**, *italic*, __underline__ formatting + emojis in every response
- 🔐 Content policy — refuses harmful, illegal, or NSFW requests
- 🧵 Multi-thread chat with sidebar
- 🔒 Temp login/register (localStorage)

## 🔑 How API keys are kept secret

`GOOGLE_GENERATIVE_AI_API_KEY` lives **only** in Cloudflare Pages env vars.
The browser never sees it — it only calls your `/api/chat` Next.js server route.

## 🚀 Deploy to Cloudflare Pages

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Kroxy AI"
git remote add origin https://github.com/YOUR_USERNAME/kroxy-ai.git
git push -u origin main
```

### 2. Connect Cloudflare Pages
1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect to Git
2. Pick your repo
3. Build settings:
   - **Framework**: Next.js
   - **Build command**: `npm run build`
   - **Output directory**: `.next`

### 3. Add your secret key
Pages → your project → **Settings → Environment variables**:

| Variable | Value |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `your_gemini_key_here` |

Set for **Production** (and Preview if you want).

### 4. Done — redeploy and it's live 🎉

## 💻 Local dev
```bash
cp .env.example .env.local
# Paste your Gemini key into .env.local
npm install
npm run dev
```

## 📁 Key files
```
app/api/chat/route.ts          ← Server-side: Gemini + web search grounding + system prompt
app/assistant.tsx              ← Auth gate + sidebar layout  
app/globals.css                ← Kroxy purple theme
components/auth/               ← Login + register screens (localStorage)
components/assistant-ui/       ← Chat UI (Kroxy-branded, thread list, markdown)
```
