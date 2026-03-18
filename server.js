const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["POST", "GET"],
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("MindBridge AI Backend is running ✅");
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are a compassionate and empathetic AI mental health companion for MindBridge AI. Your role is to: Listen actively and with empathy, Provide emotional support and validation, Suggest practical coping strategies when appropriate, Encourage professional help when needed, Keep responses warm, concise, and supportive (2-4 sentences usually), Never diagnose or replace professional mental health care, Always prioritize the user's safety and wellbeing. If someone expresses thoughts of self-harm or suicide, immediately provide crisis resources and encourage them to seek help.",
        messages: messages,
      }),
    });

    const data = await response.json();

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