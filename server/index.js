const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 8000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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"; // fallback
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

app.use(cors());
app.use(bodyParser.json());

const processes = new Map();

// 🧠 Run Code + Analyze
app.post("/run", async (req, res) => {
  const { code, language, input = "" } = req.body;
  const id = Date.now();
  let filename, command;

  try {
    const inputFile = `${TEMP_DIR}/input-${id}.txt`;
    fs.writeFileSync(inputFile, input);

    if (language === "python") {
      filename = `${TEMP_DIR}/code-${id}.py`;
      fs.writeFileSync(filename, code);
      command = `python3 ${filename} < ${inputFile}`;
    } else if (language === "cpp") {
      filename = `${TEMP_DIR}/code-${id}.cpp`;
      const execFile = `${TEMP_DIR}/code-${id}.out`;
      fs.writeFileSync(filename, code);
      command = `g++ ${filename} -o ${execFile} && ${execFile} < ${inputFile}`;
    } else if (language === "c") {
      filename = `${TEMP_DIR}/code-${id}.c`;
      const execFile = `${TEMP_DIR}/code-${id}.out`;
      fs.writeFileSync(filename, code);
      command = `gcc ${filename} -o ${execFile} && ${execFile} < ${inputFile}`;
    } else if (language === "java") {
      const match = code.match(/public\s+class\s+(\w+)/);
      const className = match ? match[1] : `Main${id}`;
      filename = `${TEMP_DIR}/${className}.java`;
      fs.writeFileSync(filename, code);
      command = `javac ${filename} && java -cp ${TEMP_DIR} ${className} < ${inputFile}`;
    } else {
      return res.status(400).json({ error: "Unsupported language" });
    }

    exec(command, { timeout: 10000 }, async (err, stdout, stderr) => {
      const output = err ? (stderr || err.message) : stdout;
      let time = "N/A", space = "N/A", summary = "", aiError = null;

      try {
        const analysisPrompt = `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\nRespond:\nTime: O(...)\nSpace: O(...)`;

        const analysisRes = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [{ role: "user", content: analysisPrompt }],
            temperature: 0.3,
            max_tokens: 100,
          }),
        });

        const analysisJson = await analysisRes.json();
        if (!analysisRes.ok) throw new Error(analysisJson.error?.message || "Groq AI analysis failed");

        const analysisText = analysisJson.choices?.[0]?.message?.content || "";
        // Improved regex for time and space complexity extraction
        let timeMatch = analysisText.match(/Time(?:\s*complexity)?\s*:?\s*O\(([^)]+)\)/i) ||
                        analysisText.match(/O\(([^)]+)\).*time/i);
        // Fallback: use the first O(...) in the text if timeMatch is not found
        if (!timeMatch) {
          const allMatches = [...analysisText.matchAll(/O\(([^)]+)\)/gi)];
          if (allMatches.length > 0) {
            timeMatch = allMatches[0];
          }
        }
        let spaceMatch = analysisText.match(/Space(?:\s*complexity)?\s*:?\s*O\(([^)]+)\)/i) ||
                           analysisText.match(/O\(([^)]+)\).*space/i);
        // If no explicit space match, try to find any O(...) that's not the time complexity
        if (!spaceMatch) {
          const allMatches = [...analysisText.matchAll(/O\(([^)]+)\)/gi)];
          if (allMatches.length > 1) {
            // Use the second O(...) as space complexity
            spaceMatch = allMatches[1];
          } else if (allMatches.length === 1 && !timeMatch) {
            // If only one O(...) and no time match, use it for both
            spaceMatch = allMatches[0];
          }
        }
        // Fallback: if we have time complexity but no space, infer space complexity
        if (!spaceMatch && timeMatch) {
          const timeComplexity = timeMatch[1].toLowerCase();
          if (timeComplexity.includes('n')) {
            // Common patterns: if time is O(n), space is often O(n) or O(1)
            if (timeComplexity === 'n' || timeComplexity === 'n log n' || timeComplexity === 'n²' || timeComplexity === 'n^2') {
              space = 'O(n)'; // Default to O(n) for most algorithms
            } else if (timeComplexity === '1' || timeComplexity === 'log n') {
              space = 'O(1)'; // Constant time usually means constant space
            }
          }
        }
        if (timeMatch) time = `O(${timeMatch[1]})`;
        if (spaceMatch) space = `O(${spaceMatch[1]})`;

        const summaryPrompt = `Explain in 1 line the time and space complexity of the following ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``;

        const summaryRes = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [{ role: "user", content: summaryPrompt }],
            temperature: 0.3,
            max_tokens: 60,
          }),
        });

        const summaryJson = await summaryRes.json();
        if (!summaryRes.ok) throw new Error(summaryJson.error?.message || "Groq AI summary failed");

        summary = summaryJson.choices?.[0]?.message?.content || "";
      } catch (err) {
        aiError = err.message;
        console.error("❌ AI Error:", err.message);
      }

      res.json({
        output: output.trim(),
        time,
        space,
        summary: summary.trim(),
        ai_status: aiError ? "failed" : "success",
        ai_error: aiError,
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Execution failed", details: err.message });
  }
});

// 🤖 Generate Code
app.post("/generate", async (req, res) => {
  const { prompt, content, task, language, context = "" } = req.body;
  
  // Handle both frontend formats: { prompt, language } or { content, task, language }
  const actualPrompt = prompt || content || "";
  
  if (!actualPrompt) {
    return res.status(400).json({ error: "Prompt or content is required" });
  }

  try {
    const generatePrompt = `Generate ${language} code for the following request. Provide only the code without any explanations or comments:

Request: ${actualPrompt}
${context ? `Context: ${context}` : ''}

Requirements:
- Write clean, efficient ${language} code
- Include proper error handling where appropriate
- Follow ${language} best practices
- Return only the code, no explanations`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: generatePrompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message || "Groq AI generation failed");
    }

    const generatedCode = json.choices?.[0]?.message?.content || "";
    
    res.json({
      code: generatedCode.trim(),
      status: "success"
    });
  } catch (err) {
    console.error("❌ Generate Error:", err.message);
    res.status(500).json({ 
      error: "Code generation failed", 
      details: err.message,
      status: "failed"
    });
  }
});

// 📝 Explain Code
app.post("/explain", async (req, res) => {
  const { code, language } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    const explainPrompt = `Explain this ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive explanation including:
1. What the code does
2. How it works step by step
3. Key concepts and algorithms used
4. Time and space complexity analysis
5. Any important notes or considerations`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: explainPrompt }],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error?.message || "Groq AI explanation failed");
    }

    const explanation = json.choices?.[0]?.message?.content || "";
    
    res.json({
      explanation: explanation.trim(),
      status: "success"
    });
  } catch (err) {
    console.error("❌ Explain Error:", err.message);
    res.status(500).json({ 
      error: "Code explanation failed", 
      details: err.message,
      status: "failed"
    });
  }
});

// 🔄 Stream Code Execution (SSE)
app.get("/run-stream", (req, res) => {
  const { code, language } = req.query;
  const sessionId = Date.now().toString();
  
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control"
  });

  // Send session ID
  res.write(`data: __SESSION__${sessionId}\n\n`);

  let filename, command;
  const TEMP_DIR = path.join(__dirname, "temp");
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

  try {
    if (language === "python") {
      filename = `${TEMP_DIR}/code-${sessionId}.py`;
      fs.writeFileSync(filename, code);
      command = `python3 -u ${filename}`; // -u for unbuffered output
    } else if (language === "cpp") {
      filename = `${TEMP_DIR}/code-${sessionId}.cpp`;
      const execFile = `${TEMP_DIR}/code-${sessionId}.out`;
      fs.writeFileSync(filename, code);
      command = `g++ ${filename} -o ${execFile} && ${execFile}`;
    } else if (language === "c") {
      filename = `${TEMP_DIR}/code-${sessionId}.c`;
      const execFile = `${TEMP_DIR}/code-${sessionId}.out`;
      fs.writeFileSync(filename, code);
      command = `gcc ${filename} -o ${execFile} && ${execFile}`;
    } else if (language === "java") {
      const match = code.match(/public\s+class\s+(\w+)/);
      const className = match ? match[1] : `Main${sessionId}`;
      filename = `${TEMP_DIR}/${className}.java`;
      fs.writeFileSync(filename, code);
      command = `javac ${filename} && java -cp ${TEMP_DIR} ${className}`;
    } else {
      res.write(`data: Error: Unsupported language\n\n`);
      res.write(`data: __END__\n\n`);
      return res.end();
    }

    const process = spawn(command, [], { 
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Store process for input handling
    processes.set(sessionId, process);

    // Handle stdout
    process.stdout.on('data', (data) => {
      const output = data.toString();
      res.write(`data: ${output}\n\n`);
    });

    // Handle stderr
    process.stderr.on('data', (data) => {
      const error = data.toString();
      res.write(`data: ${error}\n\n`);
    });

    // Handle process end
    process.on('close', (code) => {
      processes.delete(sessionId);
      res.write(`data: __END__\n\n`);
      res.end();
    });

    // Handle process errors
    process.on('error', (err) => {
      res.write(`data: Error: ${err.message}\n\n`);
      res.write(`data: __END__\n\n`);
      res.end();
    });

  } catch (err) {
    res.write(`data: Error: ${err.message}\n\n`);
    res.write(`data: __END__\n\n`);
    res.end();
  }
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
    process.stdin.write(input + '\n');
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send input", details: err.message });
  }
});

// 🟢 Start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
