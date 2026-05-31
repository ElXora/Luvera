// Voice transcription route — uses Groq Whisper (whisper-large-v3-turbo)
// Fast, accurate, free tier is generous
// GROQ_API_KEY is set in Vercel → Project → Settings → Environment Variables

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not set." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Audio arrives as multipart/form-data with field name "audio"
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;

  if (!audioFile) {
    return new Response(JSON.stringify({ error: "No audio file provided" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  // Forward to Groq Whisper
  const groqForm = new FormData();
  groqForm.append("file", audioFile, audioFile.name || "recording.webm");
  groqForm.append("model", "whisper-large-v3-turbo");
  groqForm.append("response_format", "json");
  groqForm.append("language", "en");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: groqForm,
  });

  const data = await res.json();

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: data.error?.message || `Groq Whisper error ${res.status}` }),
      { status: res.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Returns { text: "transcribed text here" }
  return new Response(JSON.stringify({ text: data.text }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
