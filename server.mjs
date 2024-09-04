import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

// Use environment variables for PORT and API key
const PORT = process.env.PORT || 4000;  // Railway will provide the PORT
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;  // Set this in Railway's environment variables

app.use(cors());
app.use(express.json());

app.post('/api/claude', async (req, res) => {
    console.log('Request body:', req.body);

    const prompt = req.body.prompt || req.body.question;

    if (!prompt) {
        console.error('Missing prompt or question in request body');
        return res.status(400).json({ error: 'Missing prompt or question in request body' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-1.3',
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error('Claude API Error:', data.error);
            return res.status(400).json({ error: data.error });
        }

        console.log('Claude API response:', data);

        res.json(data);
    } catch (error) {
        console.error('Error fetching from Claude API:', error.message);
        res.status(500).json({ error: 'Failed to fetch from Claude API' });
    }
});

// Use '0.0.0.0' as the host to bind to all interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
