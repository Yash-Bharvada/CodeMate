import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Code, FileText, TestTube, BarChart3,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ComplexityGraph from "./ComplexityGraph";

interface AISidebarProps {
  code: string;
  language: string;
  onCodeGenerated: (newCode: string) => void;
}

const AISidebar: React.FC<AISidebarProps> = ({ code, language, onCodeGenerated }) => {
  const [task, setTask] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [complexityTime, setComplexityTime] = useState("N/A");
  const [complexitySpace, setComplexitySpace] = useState("N/A");
  const [showComplexity, setShowComplexity] = useState(false);
  const [complexitySummary, setComplexitySummary] = useState("");

  const handleAIRequest = async () => {
    const content = task === "generate" ? prompt : code;
    if (!content.trim()) return;

    setIsLoading(true);
    setAiOutput("");

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, content, language }),
      });

      const data = await res.json();
      const cleanOutput = data.code?.replace(/\/\/.*|\/\*[\s\S]*?\*\/|#.*$/gm, ""); // remove comments
      setAiOutput(cleanOutput || "// No AI output.");

      if (task === "generate") onCodeGenerated(cleanOutput || "");
    } catch (err) {
      setAiOutput("// Error from AI server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeComplexity = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setShowComplexity(false);
    setComplexitySummary("");

    try {
      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();
      setComplexityTime(data.time || "N/A");
      setComplexitySpace(data.space || "N/A");
      setComplexitySummary(data.summary || "");
      setShowComplexity(true);
    } catch (error) {
      setComplexityTime("N/A");
      setComplexitySpace("N/A");
      setComplexitySummary("");
    } finally {
      setIsLoading(false);
    }
  };

  const TaskButton = ({ label, value, icon }: { label: string, value: string, icon: JSX.Element }) => (
    <Button
      variant={task === value ? "default" : "ghost"}
      size="sm"
      onClick={() => setTask(value)}
      className="text-xs h-6 px-2"
    >
      <span className="flex items-center gap-1">{icon} {label}</span>
    </Button>
  );

  return (
    <div className="flex flex-col h-full border-l-2 border-solid border-border bg-muted">
      <h2 className="text-xl font-bold flex items-center gap-2 text-foreground px-3 py-3 sticky top-0 bg-muted z-10">
        <Sparkles className="w-6 h-6 text-black-500 dark:text-white-500 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
        AI ASSISTANT
      </h2>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {task === "analyze" && showComplexity && (
          <div className="border rounded bg-background p-2">
            <ComplexityGraph
              isOpen={true}
              time={complexityTime}
              space={complexitySpace}
              summary={complexitySummary}
            />
          </div>
        )}

        {task !== "analyze" && aiOutput && (
          <div className="border rounded bg-black p-2 text-xs overflow-auto">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              wrapLongLines
              customStyle={{ backgroundColor: "transparent", fontSize: 12 }}
            >
              {aiOutput}
            </SyntaxHighlighter>
          </div>
        )}

        {task === "analyze" && showComplexity && (
          <div className="mt-3 text-xs text-foreground text-center font-medium">
            {complexitySummary}
          </div>
        )}
      </div>

      {/* Bottom Prompt + Buttons (Fixed) */}
      <div className="sticky bottom-0 bg-background border-t px-3 py-2 flex flex-col gap-2">
        {/* Task Buttons */}
        <div className="grid grid-cols-3 gap-1">
          <TaskButton label="Generate" value="generate" icon={<Sparkles className="w-3 h-3" />} />
          <TaskButton label="Optimize" value="optimize" icon={<Code className="w-3 h-3" />} />
          <TaskButton label="Explain" value="explain" icon={<FileText className="w-3 h-3" />} />
          <TaskButton label="Test" value="test" icon={<TestTube className="w-3 h-3" />} />
          <TaskButton label="Analyze" value="analyze" icon={<BarChart3 className="w-3 h-3" />} />
        </div>

        {/* Prompt Box only for Generate */}
        {task === "generate" && (
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here..."
            className="text-xs h-20"
          />
        )}

        {/* Submit Button */}
        <Button
          onClick={task === "analyze" ? handleAnalyzeComplexity : handleAIRequest}
          disabled={isLoading || (task === "generate" && !prompt.trim())}
          size="sm"
          className="text-xs h-6 px-3"
        >
          {isLoading ? "Working..." : task.charAt(0).toUpperCase() + task.slice(1)}
        </Button>
      </div>
    </div>
  );
};

export default AISidebar;
