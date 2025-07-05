// components/CodeEditor.tsx

import React, { useState, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CodeEditorProps {
  onToggleTerminal: () => void;
  onToggleGraph: () => void;
  isTerminalOpen: boolean;
  isGraphOpen: boolean;
  code: string;
  setCode: (code: string) => void;
  onRunCode: (input?: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  onToggleTerminal,
  onToggleGraph,
  isTerminalOpen,
  isGraphOpen,
  code,
  setCode,
  onRunCode,
  language,
  setLanguage,
}) => {
  const [userInput, setUserInput] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);
  const [monacoFailed, setMonacoFailed] = useState(false);
  const monaco = useMonaco();
  const editorRef = useRef(null);

  const languages = [
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
  ];

  useEffect(() => {
    if (!monaco) return;
    let provider;
    provider = monaco.languages.registerInlineCompletionsProvider(language, {
      provideInlineCompletions: async (model, position) => {
        const codeSoFar = model.getValue();
        try {
          const res = await fetch("http://localhost:8000/suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: codeSoFar, language }),
          });
          const { suggestion } = await res.json();
          if (!suggestion) return { items: [] };
          return {
            items: [
              {
                insertText: suggestion,
                range: new monaco.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  position.column
                ),
                command: undefined,
              },
            ],
          };
        } catch {
          return { items: [] };
        }
      },
      handleItemDidShow: () => {},
      freeInlineCompletions: () => {},
    });
    return () => provider && provider.dispose();
  }, [monaco, language]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="h-12 px-4 flex items-center justify-between border-b bg-muted">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={(value) => setLanguage(value)}>
            <SelectTrigger className="w-32 text-xs h-8">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => onRunCode(userInput)} className="h-8 px-3 text-xs">
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-xs" onClick={onToggleTerminal}>
            {isTerminalOpen ? "Hide Output" : "Show Output"}
          </Button>
          
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ height: 500, background: '#1e1e1e', border: '1px solid #333', borderRadius: '0 0 0.375rem 0.375rem', overflow: 'auto' }}>
        {editorError && (
          <div style={{ color: 'white', padding: '2rem' }}>{editorError}</div>
        )}
        {monacoFailed || editorError ? (
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ width: '100%', height: '100%', minHeight: 300, background: '#222', color: '#fff', fontSize: 14, fontFamily: 'Fira Code, Consolas, Monaco, Courier New, monospace', border: 'none', padding: 12, borderRadius: 6 }}
            placeholder="Write your code here..."
          />
        ) : (
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
              automaticLayout: true,
              formatOnType: true,
              tabSize: 2,
              inlineSuggest: { enabled: true },
            }}
            onMount={(editor) => {
              try {
                editor.focus();
                editorRef.current = editor;
              } catch (e) {
                setEditorError('Failed to load code editor. Please check your browser console for errors.');
                setMonacoFailed(true);
              }
            }}
            loading={<div style={{ color: 'white', padding: '2rem' }}>Loading code editor...</div>}
            onValidate={markers => {
              // If Monaco fails to load, this will never be called
            }}
          />
        )}
      </div>

      {/* Input box (moved below editor) */}
      <div className="px-4 py-2 border-b bg-background">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter input for your code..."
          className="text-sm"
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 text-xs px-4 bg-muted border-t flex items-center gap-4 text-muted-foreground">
        <span>{language?.toUpperCase() || "LANG"}</span>
        <span>UTF-8</span>
        <span>LF</span>
      </div>
    </div>
  );
};

export default CodeEditor;
