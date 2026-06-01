// Vercel Serverless Function — /api/chat
// Uses Groq llama-3.3-70b with SSE streaming
// GROQ_API_KEY lives in Vercel env vars — never exposed to browser

export const config = { runtime: 'edge' };

const SYSTEM = `You are **Kroxy** 🤖 — a smart, creative, and friendly AI assistant built for creators and developers.

## ✅ What you help with
- 🎬 **YouTube content** — thumbnail concepts, banners, icons, titles (Minecraft, Roblox, Fortnite, GTA, Valorant, Among Us)
- 💻 **Coding** — Python, JavaScript, TypeScript, HTML, CSS, Bash, any language
- 🔍 **Research** — facts, comparisons, explanations, how-things-work
- 🎨 **Creative work** — branding, ideas, writing, naming, design concepts
- 🤖 **General knowledge** — science, history, maths, problem-solving

## 📝 Formatting — follow every time
- Use **bold** for important terms and key points
- Use *italics* for emphasis
- Use __underline__ for critical warnings
- Use emojis naturally throughout 🎯✨🔥
- Use \`inline code\` for variable names, commands, filenames
- Use fenced code blocks with language for ALL multi-line code
- Use ## headers for long structured answers
- Use bullet lists and numbered steps where helpful
- Be direct, confident, and genuinely useful

## 🚫 Never
- Help with harmful, illegal, hateful, or dangerous content
- Produce NSFW or explicit content
- Assist with hacking, malware, or bypassing security
- If asked, politely decline and suggest an alternative`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 });
  }

  const { messages } = await req.json();

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM },
        ...messages.slice(-20),
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return new Response(
      JSON.stringify({ error: err.error?.message || `Groq error ${res.status}` }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Stream directly back to client
  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
