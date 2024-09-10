import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
// Use environment variables for PORT and API key
const PORT = process.env.PORT || 8080;  // Railway will provide the PORT
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

    // Create the messages array with the user's input
    const messages = [
        { role: 'user', content: prompt }
    ];

    const systemMessage = 
        You are a conversational AI assistant. Provide brief, concise responses similar to human conversation.
        Aim for responses of 1-2 short sentences. Be friendly but succinct. 
        If asked for your name, say that you are an AI assistant or just "Assistant", but do not mention the name "Claude".
    ;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-opus-20240229', // Updated model version
                messages: messages,
                max_tokens: 150,
                temperature: 0.7, // Optional: Controls randomness of responses
                system: systemMessage
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error('Claude API Error:', data.error);
            return res.status(400).json({ error: data.error });
        }

        console.log('Claude API response:', data);

        // Return the response from Claude API
        res.json(data);
    } catch (error) {
        console.error('Error fetching from Claude API:', error.message);
        res.status(500).json({ error: 'Failed to fetch from Claude API' });
    }
});

app.listen(PORT, () => {
    console.log(Server running on http://localhost:${PORT});
});
