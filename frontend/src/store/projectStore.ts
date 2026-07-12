import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
export interface GeneratedCode {
  // Multi-file tree (new format)
  files?: Record<string, string>;
  entryPath?: string;
  projectType?: "react" | "nextjs" | "html";
  // Backward compatibility fields (legacy format)
  react?: string;
  html?: string;
  css?: string;
  js?: string;
  ts?: string;
}

export interface ProjectVersion {
  id: string;
  prompt: string;
  code: GeneratedCode;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  code: GeneratedCode;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  versions?: ProjectVersion[];
  previewMetadata?: {
    theme?: "dark" | "light";
    viewport?: "desktop" | "tablet" | "mobile";
  };
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  promptHistory: string[];
  isGenerating: boolean;
  activeTab: string; // Dynamic file path
  rightTab: "preview" | "code" | "split" | "export";
  abortController: AbortController | null;
  suggestions: string[];

  // Actions
  loadProjects: () => void;
  createProject: (name?: string, prompt?: string, templateCode?: Partial<GeneratedCode>) => Project;
  setCurrentProject: (project: Project | null) => void;
  setCurrentProjectById: (id: string) => void;
  updateProjectCode: (code: Partial<GeneratedCode>) => void;
  updateProjectMetadata: (metadata: Partial<NonNullable<Project["previewMetadata"]>>) => void;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addPromptToHistory: (prompt: string) => void;
  setGenerating: (isGenerating: boolean, controller?: AbortController | null) => void;
  cancelGeneration: () => void;
  setTabs: (activeTab: string, rightTab?: "preview" | "code" | "split" | "export") => void;
  setSuggestions: (suggestions: string[]) => void;
  addProjectVersion: (projectId: string, prompt: string, code: GeneratedCode) => void;
  restoreProjectVersion: (projectId: string, versionId: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      promptHistory: [
        "Create a modern travel booking landing page with Tailwind",
        "SaaS Dashboard UI with analytics graphs",
      ],
      isGenerating: false,
      activeTab: "src/App.tsx",
      rightTab: "split",
      abortController: null,
      suggestions: [],

      loadProjects: () => {
        // Initial setup if empty, loaded automatically by persist middleware
      },

      createProject: (name, prompt, templateCode) => {
        const id = crypto.randomUUID();
        const initialCode: GeneratedCode = templateCode || {
          files: {},
          entryPath: "src/App.tsx",
          projectType: "react",
          react: "",
          html: "",
          css: "",
          js: "",
          ts: "",
        };

        const initialVersion: ProjectVersion = {
          id: crypto.randomUUID(),
          prompt: prompt || "",
          code: initialCode,
          timestamp: new Date().toISOString(),
        };

        const newProj: Project = {
          id,
          name: name || `Project ${get().projects.length + 1}`,
          prompt: prompt || "",
          code: initialCode,
          tags: name ? [name.split(" ")[0]] : ["Design"],
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versions: [initialVersion],
          previewMetadata: {
            theme: "dark",
            viewport: "desktop",
          },
        };

        set((state) => ({
          projects: [newProj, ...state.projects],
          currentProject: newProj,
        }));

        return newProj;
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      setCurrentProjectById: (id) => {
        const proj = get().projects.find((p) => p.id === id);
        if (proj) {
          set({ currentProject: proj });
        }
      },

      updateProjectCode: (updatedCode) => {
        const current = get().currentProject;
        if (!current) return;

        const updatedProj = {
          ...current,
          code: { ...current.code, ...updatedCode },
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          currentProject: updatedProj,
          projects: state.projects.map((p) => (p.id === current.id ? updatedProj : p)),
        }));
      },

      updateProjectMetadata: (metadata) => {
        const current = get().currentProject;
        if (!current) return;

        const updatedProj = {
          ...current,
          previewMetadata: {
            ...(current.previewMetadata || { theme: "dark", viewport: "desktop" }),
            ...metadata,
          },
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          currentProject: updatedProj,
          projects: state.projects.map((p) => (p.id === current.id ? updatedProj : p)),
        }));
      },

      saveProject: (projToSave) => {
        set((state) => {
          const exists = state.projects.some((p) => p.id === projToSave.id);
          const updatedProj = {
            ...projToSave,
            updatedAt: new Date().toISOString(),
          };
          const nextProjects = exists
            ? state.projects.map((p) => (p.id === projToSave.id ? updatedProj : p))
            : [updatedProj, ...state.projects];

          return {
            projects: nextProjects,
            currentProject: state.currentProject?.id === projToSave.id ? updatedProj : state.currentProject,
          };
        });
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }));
      },

      renameProject: (id, name) => {
        set((state) => {
          const updatedProjects = state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
          );
          const current = state.currentProject;
          const updatedCurrent = current?.id === id ? { ...current, name, updatedAt: new Date().toISOString() } : current;
          return {
            projects: updatedProjects,
            currentProject: updatedCurrent,
          };
        });
      },

      duplicateProject: (id) => {
        const original = get().projects.find((p) => p.id === id);
        if (!original) return;

        const copy: Project = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (Copy)`,
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [copy, ...state.projects],
        }));
      },

      toggleFavorite: (id) => {
        set((state) => {
          const updatedProjects = state.projects.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          );
          const current = state.currentProject;
          const updatedCurrent =
            current?.id === id ? { ...current, isFavorite: !current.isFavorite } : current;
          return {
            projects: updatedProjects,
            currentProject: updatedCurrent,
          };
        });
      },

      addPromptToHistory: (prompt) => {
        if (!prompt.trim()) return;
        set((state) => ({
          promptHistory: [prompt, ...state.promptHistory.filter((p) => p !== prompt)].slice(0, 15),
        }));
      },

      setGenerating: (isGenerating, controller) => {
        set({ isGenerating, abortController: controller || null });
      },

      cancelGeneration: () => {
        const controller = get().abortController;
        if (controller) {
          controller.abort();
        }
        set({ isGenerating: false, abortController: null });
      },

      setTabs: (activeTab, rightTab) => {
        set((state) => ({
          activeTab,
          rightTab: rightTab || state.rightTab,
        }));
      },

      setSuggestions: (suggestions) => {
        set({ suggestions });
      },

      addProjectVersion: (projectId, prompt, code) => {
        set((state) => {
          const project = state.projects.find((p) => p.id === projectId);
          if (!project) return {};

          const versionEntry: ProjectVersion = {
            id: crypto.randomUUID(),
            prompt,
            code,
            timestamp: new Date().toISOString(),
          };

          const updatedProj = {
            ...project,
            versions: [versionEntry, ...(project.versions || [])].slice(0, 20),
            updatedAt: new Date().toISOString(),
          };

          return {
            projects: state.projects.map((p) => (p.id === projectId ? updatedProj : p)),
            currentProject: state.currentProject?.id === projectId ? updatedProj : state.currentProject,
          };
        });
      },

      restoreProjectVersion: (projectId, versionId) => {
        set((state) => {
          const project = state.projects.find((p) => p.id === projectId);
          if (!project) return {};

          const version = project.versions?.find((v) => v.id === versionId);
          if (!version) return {};

          const restoredProj = {
            ...project,
            prompt: version.prompt,
            code: version.code,
            updatedAt: new Date().toISOString(),
          };

          return {
            projects: state.projects.map((p) => (p.id === projectId ? restoredProj : p)),
            currentProject: state.currentProject?.id === projectId ? restoredProj : state.currentProject,
          };
        });
      },
    }),
    {
      name: "cognify-projects",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        promptHistory: state.promptHistory,
        activeTab: state.activeTab,
        rightTab: state.rightTab,
      }),
    }
  )
);
