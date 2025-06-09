import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  // DEBUG LOG
  console.log('Received message:', userMessage);

  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant like ChatGPT.' },
        { role: 'user', content: userMessage },
      ],
    });

    const reply = chatResponse.choices[0].message.content;
    console.log('AI reply:', reply);
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI API Error:', error);

    // Handle quota exceeded
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return res.status(429).json({
        reply: `You said: "${userMessage}". But the real chatbot is currently unavailable due to quota limits.`,
      });
    }

    res.status(500).json({ reply: 'Oops! Something went wrong with AI model.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
