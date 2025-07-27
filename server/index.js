const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { runDockerCodeWithInput } = require("./executor");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = 8000;
const GROQ_API_KEY = process.env.GROQ_API_KEY; //temporary fallback
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

app.use(cors());
app.use(bodyParser.json());

const processes = new Map();

// 🧠 Run Code
app.post("/run", async (req, res) => {
  const { code, language, input = "" } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  runDockerCodeWithInput(code, language, (err, execution) => {
    if (err) return res.status(500).json({ error: err });

    const { stdin, stdout, stderr, process, folder } = execution;
    let output = "", errorOutput = "";

    stdout.on("data", (data) => output += data.toString());
    stderr.on("data", (data) => errorOutput += data.toString());

    process.on("close", () => {
      // Send result to client
      res.json({
        output: errorOutput || output || "No output",
        status: "success"
      });

      // Cleanup folder AFTER response
      fs.rm(folder, { recursive: true, force: true }, (err) => {
        if (err) console.warn("⚠️ Failed to delete temp folder:", folder);
      });
    });

    if (input) stdin.write(input + "\n");
    stdin.end();
  });
});

// 📊 Analyze Code Complexity
app.post("/analyze", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  let time = "N/A", space = "N/A", summary = "", aiError = null;

  try {
    const analysisPrompt = `You're an expert. Analyze this ${language} code and respond strictly in this format:\nTime: O(...)\nSpace: O(...)\n\nCode:\n${code}`;

    const analysisRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    const analysisJson = await analysisRes.json();
    const analysisText = analysisJson.choices?.[0]?.message?.content || "";

    const allMatches = [...analysisText.matchAll(/O\(([^)]+)\)/gi)];
    if (allMatches.length > 0) time = `O(${allMatches[0][1]})`;
    if (allMatches.length > 1) space = `O(${allMatches[1][1]})`;
    else if (time !== "N/A") space = "O(1)";

    const summaryPrompt = `Briefly explain the time and space complexity of this ${language} code:\n\n${code}`;
    const summaryRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: summaryPrompt }],
        temperature: 0.3,
        max_tokens: 60
      })
    });

    const summaryJson = await summaryRes.json();
    summary = summaryJson.choices?.[0]?.message?.content?.trim() || "";

  } catch (err) {
    aiError = err.message;
    console.error("❌ AI Error:", aiError);
  }

  res.json({
    time,
    space,
    summary,
    ai_status: aiError ? "failed" : "success",
    ai_error: aiError
  });
});



// 🤖 Generate Code
app.post("/generate", async (req, res) => {
  const { prompt, content, task, language, context = "" } = req.body;
  const actualPrompt = prompt || content || "";

  if (!actualPrompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const generatePrompt = `Generate ${language} code for the following request. Respond with only valid code, no markdown or comments:\n\n${actualPrompt}${context ? `\n\nContext:\n${context}` : ""}`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: generatePrompt }],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const json = await response.json();
    const code = json.choices?.[0]?.message?.content || "";

    // Remove markdown backticks
    let cleanedCode = code.trim();

    // Prefer content inside triple backticks
    const match = cleanedCode.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
    if (match) {
      cleanedCode = match[1].trim();
    }

    res.json({ code: cleanedCode, status: "success" });
  } catch (err) {
    console.error("❌ Generate Error:", err.message);
    res.status(500).json({ error: "Code generation failed", details: err.message });
  }
});

// 📝 Explain Code
app.post("/explain", async (req, res) => {
  const { code, language } = req.body;

  if (!code) return res.status(400).json({ error: "Code is required" });

  try {
    const explainPrompt = `Explain this ${language} code in detail:\n\n${code}\n\nInclude:\n1. What it does\n2. How it works\n3. Time/space complexity\n4. Key concepts or patterns`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: explainPrompt }],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    const json = await response.json();
    const explanation = json.choices?.[0]?.message?.content || "";

    res.json({ explanation: explanation.trim(), status: "success" });
  } catch (err) {
    console.error("❌ Explain Error:", err.message);
    res.status(500).json({ error: "Code explanation failed", details: err.message });
  }
});

// 🔄 Stream Code Execution (Docker)
app.get("/run-stream", (req, res) => {
  const { code, language } = req.query;
  const sessionId = Date.now().toString();

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  // Setup SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });

  res.write(`data: __SESSION__${sessionId}\n\n`);

  runDockerCodeWithInput(code, language, (err, execution) => {
    if (err) {
      res.write(`data: Error: ${err}\n\n`);
      res.write(`data: __END__\n\n`);
      return res.end();
    }

    const { stdin, stdout, stderr, process, folder } = execution;

    // Store the process for input handling
    processes.set(sessionId, process);

    // Stream stdout
    stdout.on("data", (data) => {
      res.write(`data: ${data.toString()}\n\n`);
    });

    // Stream stderr
    stderr.on("data", (data) => {
      res.write(`data: ${data.toString()}\n\n`);
    });

    // Clean up after process ends
    process.on("close", () => {
      processes.delete(sessionId);

      // ✅ Cleanup folder AFTER streaming ends
      fs.rm(folder, { recursive: true, force: true }, (err) => {
        if (err) console.warn("⚠️ Failed to delete stream folder:", folder);
      });

      res.write(`data: __END__\n\n`);
      res.end();
    });

    // Handle process errors
    process.on("error", (err) => {
      res.write(`data: Error: ${err.message}\n\n`);
      res.write(`data: __END__\n\n`);
      res.end();
    });

    // ❗ No need to call stdin.end() here — only for interactive
  });
});



// 📥 Send Input to Running Process
app.post("/send-input", (req, res) => {
  const { sessionId, input } = req.body;

  if (!sessionId || !input) {
    return res.status(400).json({ error: "Session ID and input are required" });
  }

  const process = processes.get(sessionId);
  if (!process) {
    return res.status(404).json({ error: "Process not found" });
  }

  try {
    process.stdin.write(input + "\n");
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send input", details: err.message });
  }
});

// 🟢 Start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
