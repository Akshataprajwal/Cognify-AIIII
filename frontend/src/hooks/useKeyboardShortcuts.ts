"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcutHandlers {
  onSave?: () => void;
  onCommandPalette?: () => void;
  onEscape?: () => void;
  onFocusSearch?: () => void;
}

/**
 * Registers workspace-level keyboard shortcuts.
 * Binds to the window and cleans up on unmount.
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S → Save
      if (ctrl && e.key === "s") {
        e.preventDefault();
        handlers.onSave?.();
        return;
      }

      // Ctrl/Cmd + K → Command palette
      if (ctrl && e.key === "k") {
        e.preventDefault();
        handlers.onCommandPalette?.();
        return;
      }

      // Ctrl/Cmd + F → Focus search
      if (ctrl && e.key === "f") {
        e.preventDefault();
        handlers.onFocusSearch?.();
        return;
      }

      // Escape → Close overlays
      if (e.key === "Escape") {
        handlers.onEscape?.();
        return;
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
