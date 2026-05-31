// Image generation route — uses Gemini Imagen 3
// GEMINI_API_KEY is set in Vercel → Project → Settings → Environment Variables

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, sampleCount = 4 } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      { status: res.status, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
