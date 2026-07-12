"use client";

import React, { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, Lock, Unlock, Code2 } from "lucide-react";
import { toast } from "sonner";
import { GeneratedCode } from "@/store/projectStore";
import { useProjectStore } from "@/store/projectStore";
import { FileExplorer } from "./FileExplorer";

interface CodeEditorProps {
  code: GeneratedCode;
  onCodeChange: (updated: Partial<GeneratedCode>) => void;
}

function getMonacoLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "tsx":
    case "jsx":
      return "typescript";
    case "ts":
      return "typescript";
    case "js":
      return "javascript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
    case "mdx":
      return "markdown";
    default:
      return "plaintext";
  }
}

function getShortLabel(filePath: string): string {
  return filePath.split("/").pop() || filePath;
}

export function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const { activeTab, setTabs } = useProjectStore();
  const [readOnly, setReadOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);

  // Build file map: use multi-file tree or fallback to legacy fields
  const files: Record<string, string> = useMemo(() => {
    if (code.files && Object.keys(code.files).length > 0) {
      return code.files;
    }
    // Legacy fallback
    const legacy: Record<string, string> = {};
    if (code.react?.trim()) legacy["src/App.tsx"] = code.react;
    if (code.html?.trim()) legacy["index.html"] = code.html;
    if (code.css?.trim()) legacy["src/index.css"] = code.css;
    if (code.js?.trim()) legacy["script.js"] = code.js;
    if (code.ts?.trim()) legacy["types.ts"] = code.ts;
    return legacy;
  }, [code]);

  // Determine active file path
  const activeFilePath = useMemo(() => {
    if (files[activeTab]) return activeTab;
    // Try to use entry path
    if (code.entryPath && files[code.entryPath]) return code.entryPath;
    return Object.keys(files)[0] || "src/App.tsx";
  }, [files, activeTab, code.entryPath]);

  const activeContent = files[activeFilePath] || "";
  const language = getMonacoLanguage(activeFilePath);
  const shortLabel = getShortLabel(activeFilePath);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      toast.success(`${shortLabel} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code.");
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && !readOnly) {
      const updatedFiles = { ...files, [activeFilePath]: value };
      onCodeChange({ files: updatedFiles });
    }
  };

  const handleFileSelect = (path: string) => {
    setTabs(path);
  };

  return (
    <div className="flex h-full bg-[#030712] overflow-hidden select-none">
      {/* File Explorer Panel */}
      {showExplorer && Object.keys(files).length > 0 && (
        <div className="w-52 shrink-0 border-r border-white/[0.06]">
          <FileExplorer
            files={files}
            activeFile={activeFilePath}
            onFileSelect={handleFileSelect}
          />
        </div>
      )}

      {/* Editor Panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Editor top bar */}
        <div className="h-12 border-b border-white/[0.06] bg-[#0a0a0f] flex items-center justify-between px-4 shrink-0">
          {/* Active file tab */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Explorer toggle */}
            <button
              onClick={() => setShowExplorer((s) => !s)}
              className={`p-1.5 rounded-lg border text-xs transition-all shrink-0 ${
                showExplorer
                  ? "bg-indigo-500/15 border-indigo-500/20 text-indigo-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/70"
              }`}
              title={showExplorer ? "Hide file explorer" : "Show file explorer"}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="2" width="5" height="12" rx="1" />
                <path d="M9 2h5M9 6h5M9 10h5M9 14h5" />
              </svg>
            </button>

            {Object.keys(files).length === 0 ? (
              <span className="text-[10px] text-white/20 italic">
                No generated files yet
              </span>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {/* Active file tab */}
                <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shrink-0">
                  <Code2 className="h-3 w-3" />
                  <span className="max-w-[180px] truncate" title={activeFilePath}>
                    {shortLabel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Editor controls */}
          {Object.keys(files).length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {/* Read Only Toggle */}
              <button
                onClick={() => setReadOnly((r) => !r)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  readOnly
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                }`}
                title={readOnly ? "Lock state: Read-Only" : "Lock state: Editable"}
              >
                {readOnly ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Read-Only</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Editable</span>
                  </>
                )}
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-white/50 hover:text-white/80 transition-all"
                title="Copy code to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Monaco Editor Frame */}
        <div className="flex-1 min-h-0 relative select-text">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={activeContent}
            onChange={handleEditorChange}
            path={activeFilePath} // critical: keeps separate undo histories per file
            loading={
              <div className="absolute inset-0 flex items-center justify-center bg-[#030712] text-white/40 text-xs gap-2">
                <span className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Loading Code Editor…
              </div>
            }
            options={{
              minimap: { enabled: false },
              readOnly: readOnly,
              fontSize: 13,
              fontFamily: "var(--font-mono), 'Fira Code', monospace",
              fontLigatures: true,
              lineHeight: 20,
              lineNumbers: "on",
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12 },
              bracketPairColorization: { enabled: true },
              smoothScrolling: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
