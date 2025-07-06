const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const TEMP_DIR = path.join(__dirname, "temp");

function getPublicClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

function runDockerCodeWithInput(code, lang, callback) {
  const id = Date.now().toString();
  const folder = path.join(TEMP_DIR, `${lang}-${id}`);
  fs.mkdirSync(folder, { recursive: true });

  let filename = "";
  if (lang === "java") {
    const className = getPublicClassName(code);
    if (!className) return callback("❌ Java code must contain a `public class`.");
    filename = `${className}.java`;
  } else if (lang === "cpp") {
    filename = "main.cpp";
  } else if (lang === "c") {
    filename = "main.c";
  } else if (lang === "python") {
    filename = "main.py";
  } else {
    return callback("❌ Unsupported language.");
  }

  const filePath = path.join(folder, filename);
  fs.writeFileSync(filePath, code);

  const imageMap = {
    java: "java-runner",
    cpp: "cpp-runner",
    c: "c-runner",
    python: "python-runner",
  };

  const dockerCommand = [
    "docker", "run", "--rm",
    "-i", // Required for interactive input
    "-v", `${folder}:/app`,
    imageMap[lang],
  ];

  const proc = spawn(dockerCommand[0], dockerCommand.slice(1), { stdio: "pipe" });

  callback(null, {
    stdin: proc.stdin,
    stdout: proc.stdout,
    stderr: proc.stderr,
    process: proc,
    sessionId: id,
  });
}

module.exports = { runDockerCodeWithInput };
