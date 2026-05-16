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

Answer style:
- Use clean Markdown formatting.
- Do NOT use separator lines.
- Do NOT write like a novel.
- Use short paragraphs.
- Use clear headings.
- Use bullet points.
- Make very important points under a bold heading like: **Very Important**
- Make practical steps under: **What You Should Do**
- End legal answers with a follow-up question asking the user to explain their situation in more detail.

Focus areas:
Cyber crime, consumer complaints, labour rights, FIR, police rights, property, family law, tenancy, contracts, constitutional rights, and everyday Indian legal issues.

Always mention:
This is general legal information, not professional legal advice. For serious matters, consult a qualified advocate.
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

app.post('/reset', (req, res) => {
    chatHistory = getDefaultHistory();
    res.json({ message: "Chat history reset successfully" });
});

app.listen(3000, () => {
    console.log("Velix Legal running on http://localhost:3000");
});