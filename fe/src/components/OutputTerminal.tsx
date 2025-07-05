import React from "react";

interface OutputTerminalProps {
  isOpen: boolean;
  onToggle: () => void;
  output: string[];
}

const OutputTerminal: React.FC<OutputTerminalProps> = ({
  isOpen,
  onToggle,
  output,
}) => {
  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-black text-white p-3 font-mono overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold">Output</span>
        <button
          onClick={onToggle}
          className="text-xs text-gray-300 hover:text-red-400"
        >
          ✕
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm">
        {output.join("\n") || "No output"}
      </pre>
    </div>
  );
};

export default OutputTerminal;
