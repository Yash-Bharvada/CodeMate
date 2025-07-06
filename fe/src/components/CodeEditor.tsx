import React, { useEffect, useRef, useState } from "react";
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

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onRunCode: (input?: string) => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  onRunCode,
  onToggleTerminal,
  isTerminalOpen,
}) => {
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const [inlineSuggestEnabled, setInlineSuggestEnabled] = useState(true);

  const languages = [
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(""); // ✅ Clear code when language changes
  };

  const codeNeedsInput = (code: string, lang: string) => {
    const lower = code.toLowerCase();
    if (lang === "python") return lower.includes("input(");
    if (lang === "cpp" || lang === "c") return lower.includes("cin") || lower.includes("scanf");
    if (lang === "java") return lower.includes("scanner");
    return false;
  };

  useEffect(() => {
    if (!monaco) return;
    // Python keywords and built-ins
    const pythonKeywords = [
      "print", "input", "for", "while", "if", "elif", "else", "def", "return", "import", "from", "as", "class",
      "try", "except", "finally", "with", "lambda", "pass", "break", "continue", "global", "nonlocal", "assert",
      "yield", "raise", "del", "not", "and", "or", "is", "in", "True", "False", "None", "self", "range", "len",
      "str", "int", "float", "list", "dict", "set", "tuple", "open", "close", "read", "write", "append", "sum",
      "min", "max", "abs", "map", "filter", "zip", "enumerate", "sorted", "reversed", "type", "dir", "help"
    ];
    // C keywords and built-ins
    const cKeywords = [
      "printf", "scanf", "int", "float", "double", "char", "void", "main", "return", "if", "else", "for", "while", "do",
      "switch", "case", "break", "continue", "default", "struct", "typedef", "enum", "union", "const", "static", "extern",
      "sizeof", "goto", "unsigned", "signed", "long", "short", "volatile", "register", "auto", "include", "define", "NULL"
    ];
    // C++ keywords and built-ins
    const cppKeywords = [
      "cout", "cin", "endl", "string", "vector", "map", "set", "unordered_map", "unordered_set", "int", "float", "double", "char",
      "void", "main", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "default", "struct",
      "class", "public", "private", "protected", "virtual", "override", "const", "static", "namespace", "using", "template",
      "typename", "auto", "new", "delete", "try", "catch", "throw", "this", "nullptr", "true", "false", "operator", "friend",
      "include", "define", "NULL"
    ];
    // Java keywords and built-ins
    const javaKeywords = [
      "System.out.println", "System.in", "Scanner", "public", "private", "protected", "class", "static", "void", "main",
      "String", "int", "float", "double", "char", "boolean", "if", "else", "for", "while", "do", "switch", "case", "break",
      "continue", "default", "try", "catch", "finally", "throw", "throws", "import", "package", "return", "new", "this",
      "super", "extends", "implements", "interface", "abstract", "final", "synchronized", "volatile", "transient", "instanceof",
      "enum", "assert", "true", "false", "null"
    ];
    // Register providers
    const providers = [
      monaco.languages.registerCompletionItemProvider("python", {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: pythonKeywords.map(keyword => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range,
            })),
          };
        },
      }),
      monaco.languages.registerCompletionItemProvider("c", {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: cKeywords.map(keyword => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range,
            })),
          };
        },
      }),
      monaco.languages.registerCompletionItemProvider("cpp", {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: cppKeywords.map(keyword => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range,
            })),
          };
        },
      }),
      monaco.languages.registerCompletionItemProvider("java", {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: javaKeywords.map(keyword => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range,
            })),
          };
        },
      }),
    ];
    return () => providers.forEach(p => p.dispose());
  }, [monaco]);

  useEffect(() => {
    if (!monaco || !inlineSuggestEnabled) return;
    
          // Enhanced completion patterns for all syntax
      const getCompletions = (language: string, model: any, position: any) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const word = model.getWordUntilPosition(position);
        const prefix = word.word;
        const beforeCursor = lineContent.substring(0, position.column - 1);
        const afterCursor = lineContent.substring(position.column - 1);
        
        // Language-specific patterns (all keys unique)
        const languagePatterns = {
          python: {
            'print': '()',
            'input': '()',
            'range': '()',
            'len': '()',
            'str': '()',
            'int_func': '()',
            'int_var': ' = 0',
            'float_func': '()',
            'float_var': ' = 0.0',
            'list_func': '()',
            'list_var': ' = []',
            'dict_func': '()',
            'dict_var': ' = {}',
            'set_func': '()',
            'set_var': ' = set()',
            'tuple_func': '()',
            'tuple_var': ' = ()',
            // ... rest unchanged ...
          },
          c: {
            'printf': '("", )',
            'scanf': '("", &)',
            'sizeof': '()',
            'int_func': ' () {\n\treturn 0;\n}',
            'int_var': ' ;',
            'float_func': ' () {\n\treturn 0.0;\n}',
            'float_var': ' ;',
            'double_func': ' () {\n\treturn 0.0;\n}',
            'double_var': ' ;',
            'char_func': ' () {\n\treturn \'\';\n}',
            'char_var': ' ;',
            // ... rest unchanged ...
          },
          cpp: {
            'cout': ' << "" << endl;',
            'cin': ' >> ;',
            'endl': '',
            'int_func': ' () {\n\treturn 0;\n}',
            'int_var': ' ;',
            'float_func': ' () {\n\treturn 0.0;\n}',
            'float_var': ' ;',
            'double_func': ' () {\n\treturn 0.0;\n}',
            'double_var': ' ;',
            'char_func': ' () {\n\treturn \'\';\n}',
            'char_var': ' ;',
            'string_var': ' ;',
            // ... rest unchanged ...
          },
          java: {
            'System.out.println': '("");',
            'System.out.print': '("");',
            'Scanner': ' = new Scanner(System.in);',
            'int_func': ' () {\n\treturn 0;\n}',
            'int_var': ' ;',
            'float_func': ' () {\n\treturn 0.0f;\n}',
            'float_var': ' ;',
            'double_func': ' () {\n\treturn 0.0;\n}',
            'double_var': ' ;',
            'char_func': ' () {\n\treturn \'\';\n}',
            'char_var': ' ;',
            'String_var': ' ;',
            'boolean_var': ' ;',
            // ... rest unchanged ...
          }
        };
        
        const patterns = languagePatterns[language];
        let completion = null;
        // Context-aware: function vs variable
        if (["int", "float", "double", "char", "String", "boolean"].includes(prefix)) {
          // If at start of line or after function keyword, suggest function pattern
          const trimmed = beforeCursor.trim();
          if (trimmed === "" || /void|public|static|def|class|return|main|\=$/.test(trimmed)) {
            completion = patterns[`${prefix}_func`];
          } else {
            completion = patterns[`${prefix}_var`];
          }
        } else {
          completion = patterns[prefix];
        }
        if (completion) return completion;
        // Context-aware completions
        const contextCompletions = getContextCompletions(language, beforeCursor, afterCursor, prefix);
        if (contextCompletions) return contextCompletions;
        return null;
    };
    
    const getContextCompletions = (language: string, beforeCursor: string, afterCursor: string, prefix: string) => {
      // Function call completions
      if (beforeCursor.includes('(') && !beforeCursor.includes(')')) {
        if (language === 'python') {
          if (prefix === '') return ')';
          if (prefix === 'se') return 'lf)';
          if (prefix === 'ra') return 'nge)';
          if (prefix === 'le') return 'n)';
        }
        if (language === 'c' || language === 'cpp') {
          if (prefix === '') return ')';
          if (prefix === 'si') return 'zeof)';
          if (prefix === 'pr') return 'intf)';
          if (prefix === 'sc') return 'anf)';
        }
        if (language === 'java') {
          if (prefix === '') return ')';
          if (prefix === 'Sy') return 'stem.out.println)';
          if (prefix === 'Sc') return 'anner)';
        }
      }
      
      // String completions
      if (beforeCursor.includes('"') && !beforeCursor.includes('"', beforeCursor.lastIndexOf('"'))) {
        return '"';
      }
      
      // Array/vector access
      if (beforeCursor.includes('[') && !beforeCursor.includes(']')) {
        return ']';
      }
      
      // Block completions
      if (beforeCursor.includes('{') && !beforeCursor.includes('}')) {
        return '\n\t\n}';
      }
      
      // Parentheses completions
      if (beforeCursor.includes('(') && !beforeCursor.includes(')')) {
        return ')';
      }
      
      return null;
    };
    // Enhanced inline completion providers for all syntax patterns
    const inlineProviders = [
      monaco.languages.registerInlineCompletionsProvider("python", {
        provideInlineCompletions: (model, position) => {
          const completion = getCompletions("python", model, position);
          if (completion) {
            return {
              items: [
                {
                  insertText: completion,
                  range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                  ),
                },
              ],
            };
          }
          return { items: [] };
        },
        handleItemDidShow: () => {},
        freeInlineCompletions: () => {},
      }),
      monaco.languages.registerInlineCompletionsProvider("c", {
        provideInlineCompletions: (model, position) => {
          const completion = getCompletions("c", model, position);
          if (completion) {
            return {
              items: [
                {
                  insertText: completion,
                  range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                  ),
                },
              ],
            };
          }
          return { items: [] };
        },
        handleItemDidShow: () => {},
        freeInlineCompletions: () => {},
      }),
      monaco.languages.registerInlineCompletionsProvider("cpp", {
        provideInlineCompletions: (model, position) => {
          const completion = getCompletions("cpp", model, position);
          if (completion) {
          return {
              items: [
                  {
                  insertText: completion,
                    range: new monaco.Range(
                      position.lineNumber,
                      position.column,
                      position.lineNumber,
                      position.column
                    ),
                  },
              ],
          };
          }
          return { items: [] };
        },
        handleItemDidShow: () => {},
        freeInlineCompletions: () => {},
      }),
      monaco.languages.registerInlineCompletionsProvider("java", {
        provideInlineCompletions: (model, position) => {
          const completion = getCompletions("java", model, position);
          if (completion) {
            return {
              items: [
                {
                  insertText: completion,
                  range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                  ),
                },
              ],
            };
          }
          return { items: [] };
      },
      handleItemDidShow: () => {},
      freeInlineCompletions: () => {},
      }),
    ];
    return () => inlineProviders.forEach(p => p.dispose());
  }, [monaco, inlineSuggestEnabled]);

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ position: "relative" }}>
      {/* Toolbar */}
      <div className="h-12 px-4 flex items-center justify-between border-b bg-muted">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
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

          <Button
            onClick={() => {
              const needsInput = codeNeedsInput(code, language);
              onRunCode(needsInput ? undefined : "");
            }}
            className="h-8 px-3 text-xs"
          >
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>

        <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-xs" onClick={onToggleTerminal}>
          {isTerminalOpen ? "Hide Output" : "Show Output"}
        </Button>
          <Button
            variant={inlineSuggestEnabled ? "default" : "ghost"}
            size="sm"
            className={`text-xs px-3 rounded-full border ${inlineSuggestEnabled ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-400 bg-gray-100 text-gray-500'}`}
            onClick={() => setInlineSuggestEnabled((v) => !v)}
            aria-pressed={inlineSuggestEnabled}
          >
            Inline Suggestion: {inlineSuggestEnabled ? "On" : "Off"}
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div
        style={{
          height: 500,
          background: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: "0 0 0.375rem 0.375rem",
          overflow: "auto",
          position: "relative",
        }}
      >
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
            inlineSuggest: { enabled: inlineSuggestEnabled },
            acceptSuggestionOnEnter: "on",
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            suggestOnTriggerCharacters: true,
            tabCompletion: "on",
          }}
          onMount={(editor, monaco) => {
            editor.focus();
            editorRef.current = editor;
            
            // Add Tab key binding to accept inline suggestions
            editor.addCommand(monaco.KeyCode.Tab, () => {
              const action = editor.getAction('editor.action.inlineSuggest.commit');
              if (action) {
                action.run();
              }
            });
            
            // Trigger suggestions automatically as user types
            editor.onDidChangeModelContent(() => {
              if (inlineSuggestEnabled) {
                editor.trigger('anyString', 'editor.action.triggerSuggest', {});
              }
            });
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 text-xs px-4 bg-muted border-t flex items-center gap-4 text-muted-foreground">
        <span>{language.toUpperCase()}</span>
        <span>UTF-8</span>
        <span>LF</span>
      </div>
    </div>
  );
};

export default CodeEditor;
