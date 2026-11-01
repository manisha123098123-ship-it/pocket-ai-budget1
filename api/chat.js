// Vercel serverless function. Keeps the Gemini key on the server and
// requires a valid Firebase ID token so only signed-in users can call it.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { GEMINI_API_KEY, FIREBASE_WEB_API_KEY, GEMINI_MODEL = 'gemini-2.0-flash' } = process.env;
  if (!GEMINI_API_KEY || !FIREBASE_WEB_API_KEY) return res.status(500).json({ error: 'Server is not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const check = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }),
  });
  if (!check.ok) return res.status(401).json({ error: 'Invalid token' });

  const { messages = [], summary = {}, lang = 'en' } = req.body || {};
  const system = `You are PocketWise AI, a friendly personal finance assistant for an Indian user (amounts in ₹). ` +
    `Reply in ${lang === 'ta' ? 'Tamil' : 'English'}. Be concise and practical. Base advice on this monthly summary: ${JSON.stringify(summary)}. ` +
    `You are not a licensed financial advisor; avoid specific investment picks.`;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.slice(-12).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: String(m.text).slice(0, 2000) }] })),
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data?.error?.message || 'Gemini error' });
    res.json({ reply: data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '…' });
  } catch (e) {
    res.status(500).json({ error: 'Request failed' });
  }
}
