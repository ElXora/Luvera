// ═══════════════════════════════════════════════════════
// KROXY AI — config.js
// All API calls go through Vercel serverless functions.
// Keys (GROQ_API_KEY, GEMINI_API_KEY) live in Vercel env vars — never in frontend code.
// ═══════════════════════════════════════════════════════

const API = {
  CHAT:        '/api/chat',        // Groq llama-3.3-70b  — chat & coding
  TRANSCRIBE:  '/api/transcribe',  // Groq Whisper        — voice → text
  IMAGE:       '/api/image',       // Gemini Imagen 3     — image generation
};
