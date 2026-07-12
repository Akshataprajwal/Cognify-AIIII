"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Code, 
  Eye, 
  Columns, 
  Download,
  Settings,
  Sparkles,
  Save,
  RotateCw,
  Copy,
  Trash2,
  Lock,
  Wand2,
  History,
  MessageSquare
} from "lucide-react";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { PromptPanel } from "./PromptPanel";
import { CodeEditor } from "./CodeEditor";
import { LivePreview } from "./LivePreview";
import { ExportPanel } from "./ExportPanel";
import { SuggestionsPanel } from "./SuggestionsPanel";
import { useProjectStore, Project, GeneratedCode } from "@/store/projectStore";
import { aiService } from "@/services/aiService";
import { templateService } from "@/services/templateService";
import { toast } from "sonner";
import { ChatPanel } from "./ChatPanel";
import { CommandPalette } from "../common/CommandPalette";
import { NotificationCenter } from "../common/NotificationCenter";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useNotificationStore } from "@/store/notificationStore";

export function WorkspaceLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("template");
  const urlProjectId = searchParams.get("project");

  const {
    projects,
    currentProject,
    isGenerating,
    activeTab,
    rightTab,
    setCurrentProject,
    setCurrentProjectById,
    updateProjectCode,
    createProject,
    saveProject,
    deleteProject,
    duplicateProject,
    addPromptToHistory,
    setGenerating,
    setTabs,
    setSuggestions,
    suggestions,
    addProjectVersion,
    restoreProjectVersion
  } = useProjectStore();

  const [projectNameInput, setProjectNameInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showVersionsDropdown, setShowVersionsDropdown] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const { addNotification } = useNotificationStore();

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onSave: () => {
      if (currentProject) {
        saveProject(currentProject);
        addNotification("success", "Saved Project", `Successfully saved ${currentProject.name}`);
        toast.success("Project saved successfully!");
      }
    },
    onCommandPalette: () => {
      setIsCommandPaletteOpen((prev) => !prev);
    },
    onEscape: () => {
      setShowVersionsDropdown(false);
      setIsCommandPaletteOpen(false);
      setIsChatOpen(false);
    },
    onFocusSearch: () => {
      document.getElementById("prompt-textarea")?.focus();
    }
  });

  // 1. Initial Load: load by URL project query, selected template query, or start clean
  useEffect(() => {
    if (urlProjectId) {
      const match = projects.find(p => p.id === urlProjectId);
      if (match) {
        setCurrentProject(match);
        setProjectNameInput(match.name);
        toast.info(`Loaded project: ${match.name}`);
      } else {
        // Fallback if URL contains deleted project ID
        const first = projects[0];
        if (first) {
          setCurrentProject(first);
          setProjectNameInput(first.name);
        } else {
          const fresh = createProject("New Design Project");
          setProjectNameInput(fresh.name);
        }
      }
    } else if (templateId) {
      const tpl = templateService.getById(templateId);
      if (tpl) {
        const fresh = createProject(tpl.name, tpl.prompt, tpl.code);
        setProjectNameInput(fresh.name);
        toast.success(`Loaded template: ${tpl.name}`);
        // Clear template query parameter
        router.replace("/ai-workspace");
      }
    } else if (!currentProject) {
      const first = projects[0];
      if (first) {
        setCurrentProject(first);
        setProjectNameInput(first.name);
      } else {
        const fresh = createProject("New Design Project");
        setProjectNameInput(fresh.name);
      }
    } else {
      setProjectNameInput(currentProject.name);
    }
  }, [urlProjectId, templateId]);

  // Sync input name when current project changes
  useEffect(() => {
    if (currentProject) {
      setProjectNameInput(currentProject.name);
    }
  }, [currentProject]);

  // 2. Trigger Code Generation
  const handleGenerate = async (promptText: string) => {
    if (!promptText.trim()) return;
    if (isGenerating) return; // Prevent double-fire

    // Create current project if none active
    let activeProj = currentProject;
    if (!activeProj) {
      activeProj = createProject("Generated UI Page", promptText);
    } else {
      // Update prompt in active project
      activeProj = {
        ...activeProj,
        prompt: promptText,
        updatedAt: new Date().toISOString()
      };
      saveProject(activeProj);
    }

    addPromptToHistory(promptText);
    setLastPrompt(promptText);
    setGenerationError(null);
    setShowSuggestions(false);

    // Clear previous generated code files to start the new streaming on a clean canvas
    updateProjectCode({
      files: {},
      entryPath: "src/App.tsx",
      projectType: "react",
      react: "",
      html: "",
      css: "",
      js: "",
      ts: ""
    });

    const controller = new AbortController();
    setGenerating(true, controller);
    toast.info("AI design compiler started streaming...");
    let providerFailureMessage: string | null = null;

    try {
      await aiService.generateStream({
        prompt: promptText,
        onProgress: (partialCode) => {
          updateProjectCode(partialCode);
        },
        onProviderError: (providerError) => {
          const providerLabel = providerError.provider || "AI provider";
          providerFailureMessage =
            `${providerLabel} generation failed: ${providerError.message} ` +
            "A complete standalone index.html was generated instead.";
          setGenerationError(providerFailureMessage);
        },
        signal: controller.signal
      });

      // Add project version after generation
      const finalProj = useProjectStore.getState().currentProject;
      if (finalProj) {
        addProjectVersion(finalProj.id, promptText, finalProj.code);
      }

      setShowSuggestions(true);
      if (providerFailureMessage) {
        addNotification("warning", "Gemini Fallback Generated", providerFailureMessage);
        toast.warning(providerFailureMessage, { duration: 9000 });
      } else {
        setGenerationError(null);
        addNotification("success", "UI Generation Complete", `Successfully generated layout for prompt: "${promptText.slice(0, 30)}..."`);
        toast.success("UI generation completed successfully!");
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.message === "AI generation canceled by user") {
        addNotification("warning", "Generation Canceled", "AI layout compilation was stopped by user.");
        toast.warning("UI generation canceled by user");
        setGenerationError(null);
      } else {
        const msg: string = err?.message || "Failed to generate frontend code.";
        // Detect provider configuration errors and give actionable guidance
        const isProviderError =
          msg.toLowerCase().includes("no ai provider") ||
          msg.toLowerCase().includes("api key") ||
          msg.toLowerCase().includes("not configured");
        const legacyFriendlyMsg = isProviderError
          ? `${msg} — Add an API key (e.g. GROQ_API_KEY) to backend/.env and restart the server.`
          : msg;
        const friendlyMsg = isProviderError
          ? `${msg} Add GEMINI_API_KEY to backend/.env, set DEFAULT_AI_PROVIDER=gemini, and restart the server.`
          : legacyFriendlyMsg;
        setGenerationError(friendlyMsg);
        addNotification("error", "Generation Failed", friendlyMsg);
        toast.error(friendlyMsg, { duration: 8000 });
      }
    } finally {
      setGenerating(false, null);
    }
  };

  // 3. Auto-save triggers on project updates
  const handleCodeChange = (updated: Partial<GeneratedCode>) => {
    updateProjectCode(updated);
  };

  // 4. Auto-Fix handler: re-generate with error context
  const handleAutoFix = async (errorMessage: string) => {
    if (!currentProject) return;
    const fixPrompt = `The following runtime error occurred in the generated code:\n\n${errorMessage}\n\nPlease fix the error and regenerate the complete corrected code.`;
    toast.info("AI Auto-Fix initiated…");
    await handleGenerate(fixPrompt);
  };

  const handleRename = () => {
    if (currentProject && projectNameInput.trim()) {
      const updated = {
        ...currentProject,
        name: projectNameInput.trim(),
        updatedAt: new Date().toISOString()
      };
      saveProject(updated);
      toast.success("Project renamed successfully");
    }
  };

  const handleDuplicate = () => {
    if (currentProject) {
      duplicateProject(currentProject.id);
      toast.success("Project duplicated!");
    }
  };

  const handleSelectSuggestion = (directive: string) => {
    if (currentProject) {
      const revisedPrompt = `${currentProject.prompt || ""}\n[Suggestion Directive]: ${directive}`;
      handleGenerate(revisedPrompt);
    }
  };

  const handleNewProject = () => {
    const fresh = createProject("New Design Project");
    setProjectNameInput(fresh.name);
    toast.success("Started new clean design sandbox!");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d14] text-white select-none">
      {/* Sidebar navigation */}
      <WorkspaceSidebar onSelectPrompt={handleGenerate} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header bar */}
        <header className="h-16 border-b border-white/[0.06] bg-[#0a0a0f] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Code className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="text"
                value={projectNameInput}
                onChange={(e) => setProjectNameInput(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                className="bg-transparent border-none outline-none font-semibold text-sm text-white truncate focus:bg-white/[0.03] px-2 py-1 rounded"
              />
              <span className="text-[10px] text-white/20 hidden sm:inline">Auto-saved</span>

              {/* Version History Toggle */}
              {currentProject && currentProject.versions && currentProject.versions.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowVersionsDropdown(!showVersionsDropdown)}
                    className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20"
                    title="View Version History"
                  >
                    <History className="h-3 w-3" />
                    <span>v{currentProject.versions.length}</span>
                  </button>

                  {showVersionsDropdown && (
                    <div className="absolute left-0 mt-2 w-64 rounded-xl border border-white/[0.08] bg-[#0d0d14] p-2 shadow-2xl z-50 max-h-60 overflow-y-auto">
                      <div className="px-2 py-1.5 border-b border-white/[0.06] text-[10px] uppercase font-bold text-white/40">
                        Version History
                      </div>
                      <div className="mt-1 space-y-1">
                        {currentProject.versions.map((ver, idx) => (
                          <button
                            key={ver.id}
                            onClick={() => {
                              restoreProjectVersion(currentProject.id, ver.id);
                              setShowVersionsDropdown(false);
                              toast.success(`Restored version from ${new Date(ver.timestamp).toLocaleTimeString()}`);
                            }}
                            className="w-full text-left rounded-lg p-2 hover:bg-white/[0.04] transition-all flex flex-col gap-1 text-xs"
                          >
                            <span className="font-semibold text-white/80">
                              Version {currentProject.versions!.length - idx}
                            </span>
                            <span className="text-[10px] text-white/40 truncate">
                              {ver.prompt || "Initial Template state"}
                            </span>
                            <span className="text-[9px] text-indigo-450/70">
                              {new Date(ver.timestamp).toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger Hint */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all"
              title="Open Command Palette (Ctrl+K)"
            >
              <span>Command Menu</span>
              <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-mono text-white/30">Ctrl+K</kbd>
            </button>

            <button
              onClick={handleDuplicate}
              className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/50 hover:text-white/80 transition-all text-xs flex items-center gap-1 font-semibold"
              title="Duplicate project workspace"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Duplicate</span>
            </button>

            {/* AI Assistant Chat Panel Toggle */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 font-semibold transition-all ${
                isChatOpen
                  ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-400"
                  : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.06] hover:text-white/80"
              }`}
              title="Toggle AI Chat Assistant"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Assistant</span>
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* View selectors */}
            <div className="flex gap-0.5 bg-white/[0.03] border border-white/[0.06] p-0.5 rounded-xl text-xs">
              {[
                { id: "preview", label: "Preview", icon: Eye },
                { id: "code", label: "Code", icon: Code },
                { id: "split", label: "Split", icon: Columns },
                { id: "export", label: "Export", icon: Download },
              ].map((item) => {
                const active = rightTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTabs(activeTab, item.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold tracking-wide transition-all ${
                      active
                        ? "bg-indigo-650 text-white shadow"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Content workspace panels */}
        <div className="flex-1 flex min-h-0">
          {/* Left prompter panel */}
          <div className="w-96 flex flex-col border-r border-white/[0.06] shrink-0 bg-[#08080c] overflow-y-auto">
            <PromptPanel onGenerate={handleGenerate} />

            {/* AI Suggestion Panel integration */}
            <SuggestionsPanel
              onSelectSuggestion={handleSelectSuggestion}
              visible={showSuggestions || !!(currentProject && (
                (currentProject.code.react?.trim().length ?? 0) > 0 ||
                Object.keys(currentProject.code.files ?? {}).length > 0
              ))}
            />

            {/* Guide Tips */}
            <div className="flex-1 p-6 space-y-4">
              {/* Retry Banner — shown after generation failure */}
              {generationError && !isGenerating && (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex flex-col gap-2">
                  <p className="text-[11px] text-rose-300/90 leading-relaxed">
                    <span className="font-semibold">Generation failed:</span> {generationError}
                  </p>
                  {lastPrompt && (
                    <button
                      onClick={() => handleGenerate(lastPrompt)}
                      className="self-start flex items-center gap-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-all"
                    >
                      <RotateCw className="h-3 w-3" />
                      Retry Last Prompt
                    </button>
                  )}
                </div>
              )}

              <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                <h3 className="font-semibold text-white/80 text-xs">Tips for prompt generation</h3>
                <ul className="mt-3 space-y-2 text-[11px] text-white/40 list-disc list-inside leading-relaxed">
                  <li>Specify structural sections (e.g. Hero, grid views).</li>
                  <li>Incorporate palette preferences (e.g. glassmorphism, gradients).</li>
                  <li>Request interactions (e.g. state switchers, faq tabs).</li>
                  <li>Gemini outputs clean React UI code instantly.</li>
                </ul>
              </div>

              {/* Sandbox Notice */}
              <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-[11px] text-indigo-300/80 leading-relaxed flex gap-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                <p>
                  Cognify AI generates responsive React pages. Server integrations (Express, Prisma, Databases) are omitted for purity.
                </p>
              </div>
            </div>
          </div>

          {/* Right workspace panels (Code, Preview, Split, Export) */}
          <div className="flex-1 min-w-0">
            {currentProject ? (
              <>
                {rightTab === "preview" && (
                  <LivePreview code={currentProject.code} activeTab={activeTab} onAutoFix={handleAutoFix} />
                )}

                {rightTab === "code" && (
                  <CodeEditor
                    code={currentProject.code}
                    onCodeChange={handleCodeChange}
                  />
                )}

                {rightTab === "split" && (
                  <div className="grid grid-cols-2 h-full min-h-0 divide-x divide-white/[0.06]">
                    <CodeEditor
                      code={currentProject.code}
                      onCodeChange={handleCodeChange}
                    />
                    <LivePreview code={currentProject.code} activeTab={activeTab} onAutoFix={handleAutoFix} />
                  </div>
                )}

                {rightTab === "export" && (
                  <div className="p-6 h-full overflow-y-auto bg-[#0a0a0f]">
                    <div className="max-w-3xl mx-auto">
                      <ExportPanel code={currentProject.code} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
                <RotateCw className="h-6 w-6 animate-spin text-indigo-500" />
                <span>Loading Project workspace…</span>
              </div>
            )}
          </div>

          {/* AI Chat Assistant Side Panel */}
          <ChatPanel
            projectId={currentProject?.id || null}
            contextCode={currentProject?.code?.react || ""}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onApplyCode={(newReactCode) => handleCodeChange({ react: newReactCode })}
          />
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewProject={handleNewProject}
        onSave={() => {
          if (currentProject) {
            saveProject(currentProject);
            addNotification("success", "Saved Project", `Successfully saved ${currentProject.name}`);
            toast.success("Project saved successfully!");
          }
        }}
        onExport={() => {
          if (currentProject) {
            setTabs(activeTab, "export");
            toast.info("Switched to Export tab");
          }
        }}
        onClearCode={() => {
          if (currentProject) {
            handleCodeChange({ files: {}, entryPath: "src/App.tsx", projectType: "react", react: "", html: "", css: "", js: "", ts: "" });
            toast.info("Cleared workspace code editor");
          }
        }}
        onRefreshPreview={() => {
          toast.success("Refreshing preview sandbox...");
          window.postMessage({ source: "cognify-preview", type: "ready" }, "*");
        }}
        onFocusPrompt={() => {
          document.getElementById("prompt-textarea")?.focus();
        }}
      />
    </div>
  );
}
