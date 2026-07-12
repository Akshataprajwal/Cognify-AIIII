"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Copy,
  Wand2,
  Loader2,
  MessageSquare,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";

interface ChatPanelProps {
  projectId: string | null;
  contextCode?: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyCode?: (code: string) => void;
}

/** Extract code block from assistant message */
function extractCode(content: string): string | null {
  const m = content.match(/```(?:tsx|jsx|ts|js|html|css)?\s*([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}

/** Render message content: split on code blocks */
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const code = part.replace(/^```[\w]*\n?/, "").replace(/```$/, "").trim();
          return (
            <pre
              key={i}
              className="mt-2 rounded-xl bg-black/40 border border-white/[0.07] p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed"
            >
              {code}
            </pre>
          );
        }
        return (
          <span key={i} className="leading-relaxed">
            {part}
          </span>
        );
      })}
    </>
  );
}

export function ChatPanel({
  projectId,
  contextCode,
  isOpen,
  onClose,
  onApplyCode,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { getThread, addMessage, appendToLastAssistant, clearThread } = useChatStore();
  const thread = useMemo(() => (projectId ? getThread(projectId) : []), [projectId, getThread]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !projectId) return;

    const userText = input.trim();
    setInput("");

    // Add user message
    addMessage(projectId, { role: "user", content: userText });

    // Add placeholder assistant message
    addMessage(projectId, { role: "assistant", content: "" });

    setIsStreaming(true);
    abortRef.current = new AbortController();

    const history = thread.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await aiService.chatStream({
        message: userText,
        history,
        contextCode: contextCode || "",
        onChunk: (text) => {
          appendToLastAssistant(projectId, text);
        },
        onDone: () => {
          setIsStreaming(false);
        },
        signal: abortRef.current.signal,
      });
    } catch (err: any) {
      if (abortRef.current?.signal.aborted) {
        // User-initiated cancel — no error toast
      } else {
        toast.error(err?.message || "Chat failed. Please try again.");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const handleApplyCode = (code: string) => {
    onApplyCode?.(code);
    toast.success("Code applied to editor");
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-[320px] border-l border-white/[0.06] bg-[#09090f] shrink-0">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">AI Assistant</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-[10px] text-indigo-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking…
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {projectId && thread.length > 0 && (
            <button
              onClick={() => clearThread(projectId)}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {thread.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/70">Chat with AI</p>
              <p className="text-xs text-white/30 mt-1 max-w-[220px]">
                Ask about your code, request edits, or get suggestions for improvements.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full max-w-[240px]">
              {[
                "Add dark mode toggle",
                "Make it more responsive",
                "Add smooth animations",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-xs text-white/50 hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-white/80 transition-all"
                >
                  <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          thread.map((msg) => {
            const code = msg.role === "assistant" ? extractCode(msg.content) : null;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center border ${
                    msg.role === "user"
                      ? "bg-indigo-600/20 border-indigo-500/30"
                      : "bg-white/[0.04] border-white/[0.08]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                  ) : (
                    <Bot className="h-3.5 w-3.5 text-white/50" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[240px] rounded-2xl px-3 py-2.5 text-xs ${
                    msg.role === "user"
                      ? "bg-indigo-600/30 border border-indigo-500/20 text-white"
                      : "bg-white/[0.04] border border-white/[0.06] text-white/80"
                  }`}
                >
                  {msg.content ? (
                    <MessageContent content={msg.content} />
                  ) : (
                    <span className="flex items-center gap-1.5 text-white/40">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking…
                    </span>
                  )}

                  {/* Code action buttons */}
                  {code && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleApplyCode(code)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2 py-1 text-[10px] font-semibold text-white transition-all"
                      >
                        <Wand2 className="h-2.5 w-2.5" />
                        Apply
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied!"); }}
                        className="flex items-center gap-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.07] px-2 py-1 text-[10px] text-white/50 transition-all"
                      >
                        <Copy className="h-2.5 w-2.5" />
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 focus-within:border-indigo-500/40 focus-within:bg-white/[0.05] transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              projectId ? "Ask about this code…" : "Select a project to chat"
            }
            disabled={!projectId || isStreaming}
            rows={1}
            className="flex-1 bg-transparent text-xs text-white placeholder-white/25 resize-none outline-none leading-relaxed max-h-24 overflow-y-auto"
            style={{ minHeight: "20px" }}
          />
          {isStreaming ? (
            <button
              onClick={handleCancel}
              className="shrink-0 p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || !projectId}
              className="shrink-0 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Send (Enter)"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[10px] text-white/20 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
