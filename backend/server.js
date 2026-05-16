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

Rules:
- Never use "###".
- Never use "---SECTION---".
- Never use separator lines.
- Never use markdown section tags.
- Write like ChatGPT with clean headings and bullet points.
- Use simple language.
- Keep answers professional and readable.

For legal questions, use this structure:

Brief Understanding
Explain the issue in 1-2 lines.

What You Should Do
Give practical step-by-step points.

Very Important
Mention urgent warnings, deadlines, or serious legal points.

Documents You Should Keep
Mention proofs/screenshots/receipts/messages.

What To Avoid
Mention mistakes the user should avoid.

When To Consult A Lawyer
Mention when professional legal help is needed.

Next Question
Ask the user to explain their situation in more detail.

Always mention that this is general legal information, not professional legal advice.
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

        let botReply = response.choices[0].message.content;

        botReply = botReply
            .replaceAll("---SECTION---", "")
            .replaceAll("###", "")
            .replaceAll("---", "");

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

app.post('/reset', (req, res) => {
    chatHistory = getDefaultHistory();
    res.json({ message: "Chat history reset successfully" });
});

app.listen(3000, () => {
    console.log("Velix Legal running on http://localhost:3000");
});