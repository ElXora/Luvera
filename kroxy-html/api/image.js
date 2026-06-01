// Vercel Serverless Function — /api/image
// Gemini Imagen 3 — text → image
// GEMINI_API_KEY lives in Vercel env vars

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 });
  }

  const { prompt, sampleCount = 4 } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'prompt is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: data.error?.message || `Gemini error ${res.status}` }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export const config = { runtime: 'edge' };
