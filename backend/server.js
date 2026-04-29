require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

function getDefaultHistory() {
    return [
        {
            role: "system",
            content: `
You are Velix Legal, an AI legal guidance assistant focused on Indian law.

Your role:
- Help users understand legal issues in simple, human language.
- Focus mainly on Indian legal topics.
- Cover consumer complaints, cyber crime, labour rights, property disputes, family law basics, tenancy issues, police rights, FIR process, constitutional rights, contracts, and everyday legal problems.
- Give practical steps where possible.
- Mention relevant Indian laws or authorities when useful, but avoid pretending to be a licensed lawyer.
- Always remind users that this is general legal information, not professional legal advice.
- For serious cases, advise consulting a qualified advocate.
- You can also answer normal non-legal conversation politely.

Tone:
- Simple
- Calm
- Helpful
- Step-by-step
- Beginner friendly
`
        }
    ];
}

let chatHistory = getDefaultHistory();

app.get('/', (req, res) => {
    res.send('Velix Legal backend is running!');
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    chatHistory.push({
        role: "user",
        content: userMessage
    });

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: chatHistory
        });

        const botReply = response.choices[0].message.content;

        chatHistory.push({
            role: "assistant",
            content: botReply
        });

        res.json({ reply: botReply });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error with Velix Legal");
    }
});

// Reset chat memory
app.post('/reset', (req, res) => {
    chatHistory = getDefaultHistory();
    res.json({ message: "Chat history reset successfully" });
});

app.listen(3000, () => {
    console.log("Velix Legal running on http://localhost:3000");
});