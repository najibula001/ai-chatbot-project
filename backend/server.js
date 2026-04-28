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

let chatHistory = [
    {
        role: "system",
        content: "You are a helpful chatbot. Remember previous conversation."
    }
];

app.get('/', (req, res) => {
    res.send('Server running with Groq!');
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
        res.status(500).send("Error with Groq API");
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});