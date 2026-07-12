"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  Save,
  Download,
  Settings,
  Moon,
  Sun,
  Trash2,
  RotateCw,
  Code,
  Sparkles,
  X,
} from "lucide-react";


interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewProject?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onClearCode?: () => void;
  onRefreshPreview?: () => void;
  onFocusPrompt?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNewProject,
  onSave,
  onExport,
  onClearCode,
  onRefreshPreview,
  onFocusPrompt,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
      setTheme(activeTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const commands: Command[] = [
    {
      id: "new-project",
      label: "New Project",
      description: "Create a blank workspace",
      icon: <Plus className="h-4 w-4 text-indigo-400" />,
      shortcut: "Ctrl+N",
      action: () => { onNewProject?.(); onClose(); },
      category: "Workspace",
    },
    {
      id: "save",
      label: "Save Project",
      description: "Save the current project state",
      icon: <Save className="h-4 w-4 text-emerald-400" />,
      shortcut: "Ctrl+S",
      action: () => { onSave?.(); onClose(); },
      category: "Workspace",
    },
    {
      id: "export",
      label: "Export Code",
      description: "Download generated code as a ZIP archive",
      icon: <Download className="h-4 w-4 text-violet-400" />,
      action: () => { onExport?.(); onClose(); },
      category: "Workspace",
    },
    {
      id: "focus-prompt",
      label: "Focus Prompt Input",
      description: "Jump to the AI prompt textarea",
      icon: <Sparkles className="h-4 w-4 text-amber-400" />,
      action: () => { onFocusPrompt?.(); onClose(); },
      category: "Workspace",
    },
    {
      id: "refresh-preview",
      label: "Refresh Preview",
      description: "Force reload the live preview iframe",
      icon: <RotateCw className="h-4 w-4 text-sky-400" />,
      action: () => { onRefreshPreview?.(); onClose(); },
      category: "Workspace",
    },
    {
      id: "clear-code",
      label: "Clear Generated Code",
      description: "Reset all generated code to empty state",
      icon: <Trash2 className="h-4 w-4 text-rose-400" />,
      action: () => { onClearCode?.(); onClose(); },
      category: "Workspace",
    },
    {
      id: "toggle-theme",
      label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      description: "Toggle the application colour scheme",
      icon:
        theme === "dark" ? (
          <Sun className="h-4 w-4 text-yellow-400" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-400" />
        ),
      action: () => {
        toggleTheme();
        onClose();
      },
      category: "Preferences",
    },
    {
      id: "settings",
      label: "Open Settings",
      description: "Configure API keys and provider preferences",
      icon: <Settings className="h-4 w-4 text-white/60" />,
      action: () => {
        window.location.href = "/settings";
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "monaco",
      label: "Open Code Editor",
      description: "Switch the right panel to code editor view",
      icon: <Code className="h-4 w-4 text-cyan-400" />,
      action: () => { onClose(); },
      category: "Navigation",
    },
  ];

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    acc[cmd.category] = acc[cmd.category] ? [...acc[cmd.category], cmd] : [cmd];
    return acc;
  }, {});

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selected when filter changes
  useEffect(() => setSelectedIndex(0), [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  // Track global index for keyboard navigation across groups
  let globalIdx = 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Palette Panel */}
      <div
        className="relative z-10 w-full max-w-xl mx-4 rounded-2xl border border-white/[0.10] bg-[#0d0d14] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
          <Search className="h-4 w-4 text-white/30 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-[380px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-white/30 py-8">
              No commands found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-[10px] uppercase font-bold text-white/30 tracking-widest">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const currentGlobalIdx = globalIdx++;
                  const isSelected = currentGlobalIdx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      onClick={cmd.action}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-indigo-600/20 text-white"
                          : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="shrink-0">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cmd.label}</p>
                        {cmd.description && (
                          <p className="text-[11px] text-white/35 truncate">{cmd.description}</p>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="shrink-0 rounded bg-white/[0.07] border border-white/[0.08] px-1.5 py-0.5 text-[10px] font-mono text-white/40">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-white/[0.06] px-4 py-2 flex items-center gap-4 text-[10px] text-white/25">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
