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

Your job:
- Give simple legal guidance for Indian law.
- Help with cyber crime, consumer complaints, labour rights, FIR, police rights, property, family law, tenancy, contracts, constitutional rights, and everyday legal issues.
- You can also answer normal conversations politely.

LEGAL ANSWER FORMAT RULES:
For legal questions, ALWAYS use this format exactly:

### Brief Understanding
Shortly explain what the issue seems to be.

---SECTION---

### ✅ Immediate Steps
Give practical first steps.

---SECTION---

### ⚠️ Very Important Legal Points
Mention important law, authority, portal, complaint forum, or deadline if useful.

---SECTION---

### 📄 Documents / Proof Needed
List evidence user should collect.

---SECTION---

### ❌ Things To Avoid
Mention risky mistakes.

---SECTION---

### 👨‍⚖️ When To Consult A Lawyer
Mention when professional legal help is needed.

---SECTION---

### Next Question
End with this exact question:
Could you tell me more about your situation in detail, so I can guide you more specifically?

IMPORTANT:
- Do not write like a novel.
- Use short bullets.
- Use simple language.
- Mark important points clearly.
- Do not pretend to be a licensed lawyer.
- Always say it is general legal information, not professional legal advice.
- If the user gives more details later, guide them specifically.
- For normal non-legal chat, reply normally.
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