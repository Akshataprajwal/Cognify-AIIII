"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  /** If the assistant response contains a code block, it is extracted here */
  codeBlock?: string;
}

interface ChatState {
  /** Map of projectId → message thread */
  threads: Record<string, ChatMessage[]>;
  /** Current active project ID for the open panel */
  activeProjectId: string | null;

  setActiveProject: (projectId: string | null) => void;
  addMessage: (projectId: string, message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  appendToLastAssistant: (projectId: string, delta: string) => void;
  clearThread: (projectId: string) => void;
  getThread: (projectId: string) => ChatMessage[];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: {},
      activeProjectId: null,

      setActiveProject: (projectId) => set({ activeProjectId: projectId }),

      addMessage: (projectId, message) => {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const fullMessage: ChatMessage = { ...message, id, timestamp };

        set((state) => ({
          threads: {
            ...state.threads,
            [projectId]: [...(state.threads[projectId] || []), fullMessage],
          },
        }));

        return fullMessage;
      },

      appendToLastAssistant: (projectId, delta) => {
        set((state) => {
          const thread = [...(state.threads[projectId] || [])];
          const lastIdx = thread.length - 1;
          if (lastIdx >= 0 && thread[lastIdx].role === "assistant") {
            const updated = { ...thread[lastIdx], content: thread[lastIdx].content + delta };
            thread[lastIdx] = updated;
          }
          return {
            threads: { ...state.threads, [projectId]: thread },
          };
        });
      },

      clearThread: (projectId) => {
        set((state) => ({
          threads: { ...state.threads, [projectId]: [] },
        }));
      },

      getThread: (projectId) => get().threads[projectId] || [],
    }),
    {
      name: "cognify-chat",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ threads: state.threads }),
    }
  )
);
