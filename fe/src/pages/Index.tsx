// pages/Index.tsx

import React, { useEffect, useState, useRef } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import CodeEditor from "../components/CodeEditor";
import AISidebar from "../components/AISidebar";
import OutputTerminal from "../components/OutputTerminal";

const Index = () => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState<string[]>([]);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const toggleTerminal = () => setIsTerminalOpen(!isTerminalOpen);

  const handleRunCode = async () => {
    setOutput(["Running code..."]);
    setAwaitingInput(false);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    await fetch("http://localhost:8000/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });

    const params = new URLSearchParams({ code, language });
    const es = new EventSource(`http://localhost:8000/run-stream?${params.toString()}`);

    es.onmessage = (event) => {
      const msg = event.data;

      // Detect session ID
      if (/^__SESSION__\d+$/.test(msg)) {
        const id = msg.replace("__SESSION__", "").trim();
        setSessionId(id);
        return;
      }

      // Detect process end
      if (msg === "__END__" || msg === "__PROCESS_END__") {
        es.close();
        eventSourceRef.current = null;
        setAwaitingInput(false);
        setSessionId(null);
        setOutput((prev) => prev.filter(line => line !== "[Waiting for input...]"));
        return;
      }

      // Detect special signal or likely prompt
      if (
        msg === "__WAIT_FOR_INPUT__" ||
        /[:>]\s*$/.test(msg) ||
        /enter|input|scan|cin/i.test(msg)
      ) {
        setAwaitingInput(true);
        setOutput((prev) => {
          // Only append [Waiting for input...] if not already present
          if (msg === "__WAIT_FOR_INPUT__") {
            if (prev[prev.length - 1] !== "[Waiting for input...]") {
              return [...prev, "[Waiting for input...]"];
            }
            return prev;
          }
          return [...prev, msg];
        });
        return;
      }

      // If awaiting input and new output arrives, hide input box and remove [Waiting for input...]
      setAwaitingInput(false);
      setOutput((prev) => {
        if (prev[prev.length - 1] === "[Waiting for input...]") {
          return [...prev.slice(0, -1), msg];
        }
        return [...prev, msg];
      });
    };

    es.onerror = (err) => {
      console.error("SSE error:", err);
      es.close();
    };

    eventSourceRef.current = es;
    setIsTerminalOpen(true);
  };

  const handleSubmitInput = async (input: string) => {
    setAwaitingInput(false);
    setOutput((prev) => [...prev, `$ ${input}`]);
    if (!sessionId) return;
    await fetch("http://localhost:8000/send-input", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, input }),
    });
  };

  const handleCodeGenerated = (newCode: string) => setCode(newCode);

  // Clear code when language changes
  useEffect(() => {
    setCode("");
  }, [language]);

  const detectInputStatement = (code: string, language: string) => {
    if (language === "python") {
      return /input\s*\(/.test(code);
    } else if (language === "cpp" || language === "c++") {
      return /cin\s*>>|cin\.getline|std::getline/.test(code);
    } else if (language === "c") {
      return /scanf\s*\(|gets\s*\(|fgets\s*\(/.test(code);
    } else if (language === "java") {
      return /Scanner|System\.in|\.next(Line|Int|Double|Float|Long|Byte|Short|Boolean)\s*\(/.test(code);
    }
    return false;
  };

  return (
    <ThemeProvider>
      <div className="h-screen w-full flex flex-col bg-background">
        <Header />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Code + Terminal */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <CodeEditor
                onToggleTerminal={toggleTerminal}
                isTerminalOpen={isTerminalOpen}
                code={code}
                setCode={setCode}
                onRunCode={handleRunCode}
                language={language}
                setLanguage={setLanguage}
              />
              {isTerminalOpen && (
                <div className="h-64 border-t border-border">
                  <OutputTerminal
                    isOpen={isTerminalOpen}
                    onToggle={toggleTerminal}
                    output={output}
                    awaitingInput={awaitingInput}
                    onSubmitInput={handleSubmitInput}
                    expectsInput={detectInputStatement(code, language)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="w-96 border-l border-border overflow-hidden">
            <AISidebar
              code={code}
              language={language}
              onCodeGenerated={handleCodeGenerated}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
