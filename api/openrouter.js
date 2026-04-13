export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const fallbackApiKey = process.env.OPENROUTER_API_KEY_FALLBACK;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on server.' });
  }

  try {
    let body;
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (req.body && typeof req.body === 'object') {
      body = JSON.stringify(req.body);
    } else {
      body = '';
    }

    if (!body) {
      return res.status(400).json({ error: 'Request body is empty.' });
    }
    if (body.length > 200_000) {
      return res.status(413).json({ error: 'Request body too large.' });
    }

    const parsedBody = JSON.parse(body);
    const allowedModels = new Set([
      'nvidia/nemotron-3-super-120b-a12b:free',
      'openai/gpt-oss-120b:free',
      'google/gemma-4-31b-it:free',
      'qwen/qwen3-next-80b-a3b-instruct:free',
    ]);
    const selectedModel = typeof parsedBody?.model === 'string' ? parsedBody.model : '';

    if (!allowedModels.has(selectedModel)) {
      return res.status(400).json({
        error: 'Invalid model selection.',
        detail: 'Requested model is not in the server allowlist.',
      });
    }

    const callOpenRouter = (key) => fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(60000),
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers?.origin || req.headers?.referer || 'https://personal-ca.local',
        'X-OpenRouter-Title': 'Personal CA',
      },
      body: JSON.stringify(parsedBody),
    });

    let upstream = await callOpenRouter(apiKey);

    // If primary key is rate-limited, retry once with fallback key (if configured).
    if (upstream.status === 429 && fallbackApiKey) {
      upstream = await callOpenRouter(fallbackApiKey);
    }

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    if (upstream.status === 429) {
      res.setHeader('Retry-After', upstream.headers.get('retry-after') || '8');
      return res.send(text || JSON.stringify({ error: 'OpenRouter rate limit exceeded. Please retry shortly.' }));
    }
    return res.send(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return res.status(504).json({ error: 'OpenRouter request timed out after 60s.' });
    }
    return res.status(502).json({
      error: 'OpenRouter upstream request failed',
      detail: error?.message || 'Unknown error',
    });
  }
}
