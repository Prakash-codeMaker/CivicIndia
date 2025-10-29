import express from 'express';
import rateLimit from 'express-rate-limit';

// Simple LLM proxy with rate limiting and moderation
const app = express();
app.use(express.json({ limit: '50kb' }));

// Rate limiter: 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' }
});
app.use(limiter);

// Simple moderation: block if prompt contains banned words
const BANNED = ['bomb', 'terror', 'kill', 'attack', 'illegal'];
const containsBanned = (text) => {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase();
  return BANNED.some(w => t.includes(w));
};

app.post('/llm', async (req, res) => {
  try {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const apiKey = auth.slice('Bearer '.length);
    const { model, prompt } = req.body || {};

    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    if (containsBanned(prompt)) {
      return res.status(400).json({ error: 'Prompt failed moderation' });
    }

    // If BACKEND_LLM_URL is configured, proxy to it. Otherwise, return a safe mocked response.
    const backend = process.env.BACKEND_LLM_URL;
    if (!backend) {
      // Mock response
      return res.json({ text: `Mock response for model=${model || 'unknown'}: ${prompt.slice(0,200)}` });
    }

    // Forward to backend provider
    const response = await fetch(backend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, prompt })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (e) {
    console.error('Proxy error', e);
    return res.status(500).json({ error: 'Proxy error' });
  }
});

const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`LLM proxy listening on http://localhost:${port}/llm`));
