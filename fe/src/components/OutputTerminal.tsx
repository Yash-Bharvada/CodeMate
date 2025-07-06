// components/OutputTerminal.tsx
import React, { useState } from "react";

interface OutputTerminalProps {
  isOpen: boolean;
  onToggle: () => void;
  output: string[];
  awaitingInput: boolean;
  onSubmitInput: (input: string) => void;
  expectsInput?: boolean;
}

const OutputTerminal: React.FC<OutputTerminalProps> = ({
  isOpen,
  onToggle,
  output,
  awaitingInput,
  onSubmitInput,
  expectsInput = false,
}) => {
  const [terminalInput, setTerminalInput] = useState("");

  if (!isOpen) return null;

  // Helper: is this line a session ID?
  const isSessionId = (line: string) => /^__SESSION__\d+$/.test(line.trim());
  // Helper: is this line a prompt?
  const isPrompt = (line: string) => /[:>]\s*$/.test(line) || /please enter/i.test(line);

  // Filter out session ID lines for display
  const filteredOutput = output.filter(line => !isSessionId(line));

  return (
    <div className="h-full w-full bg-black text-white p-3 font-mono overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold">Output</span>
        <button onClick={onToggle} className="text-xs text-gray-300 hover:text-red-400">
          ✕
        </button>
      </div>

      <div className="whitespace-pre-wrap text-sm mb-2">
        {filteredOutput.length === 0 && "No output"}
        {filteredOutput.map((line, idx) =>
          line.startsWith('[ERR]') ? (
            <div key={idx} style={{ color: '#ff5555' }}>{line}</div>
          ) : (
            <div key={idx}>{line}</div>
          )
        )}
        {/* Only show input field when awaitingInput is true */}
      {awaitingInput && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (terminalInput.trim()) {
                onSubmitInput(terminalInput.trim());
                setTerminalInput("");
              }
            }}
            style={{ display: 'inline' }}
          >
          <span className="text-green-400">$ </span>
            <textarea
            value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              className="bg-black text-white border-none focus:outline-none inline w-3/4 resize-y"
            autoFocus
              rows={2}
              style={{ display: 'inline', width: '80%', minWidth: 40, minHeight: 32 }}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  if (terminalInput.trim()) {
                    onSubmitInput(terminalInput.trim());
                    setTerminalInput("");
                  }
                }
              }}
              placeholder={"Paste or type input here. Ctrl+Enter to submit."}
          />
        </form>
      )}
      </div>
    </div>
  );
};

export default OutputTerminal;
