// Vercel Serverless Function — /api/transcribe
// Groq Whisper large-v3-turbo — voice → text
// GROQ_API_KEY lives in Vercel env vars

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 });
  }

  const formData = await req.formData();
  const audioFile = formData.get('audio');

  if (!audioFile) {
    return new Response(JSON.stringify({ error: 'No audio file' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const groqForm = new FormData();
  groqForm.append('file', audioFile, audioFile.name || 'recording.webm');
  groqForm.append('model', 'whisper-large-v3-turbo');
  groqForm.append('response_format', 'json');
  groqForm.append('language', 'en');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: groqForm,
  });

  const data = await res.json();

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: data.error?.message || `Whisper error ${res.status}` }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ text: data.text }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export const config = { runtime: 'edge' };
