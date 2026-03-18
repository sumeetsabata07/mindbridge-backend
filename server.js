const express = require("express");
const cors = require("cors");
const https = require("https");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "*", methods: ["POST", "GET"] }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MindBridge AI Backend is running ✅");
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const payload = JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: "You are a compassionate and empathetic AI mental health companion for MindBridge AI. Listen actively, provide emotional support, suggest coping strategies, encourage professional help when needed, and keep responses warm and concise (2-4 sentences). Never diagnose. Always prioritize safety. For self-harm or suicide mentions, provide crisis resources immediately.",
      messages: messages,
    });

    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const data = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let body = "";
        response.on("data", (chunk) => { body += chunk; });
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });
      request.on("error", reject);
      request.write(payload);
      request.end();
    });

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json({ reply: data.content[0].text });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("MindBridge backend running on port " + PORT);
});