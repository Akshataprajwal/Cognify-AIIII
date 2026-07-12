"use client";

import React, { useMemo, useState } from "react";
import {
  FolderOpen,
  Folder,
  FileCode2,
  FileText,
  File,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface FileExplorerProps {
  files: Record<string, string>;
  activeFile: string;
  onFileSelect: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
}

function buildTree(files: Record<string, string>): TreeNode[] {
  const root: Record<string, TreeNode> = {};

  const getOrCreate = (parts: string[], parent: Record<string, TreeNode>, prefix: string): TreeNode => {
    const name = parts[0];
    const path = prefix ? `${prefix}/${name}` : name;

    if (!parent[name]) {
      parent[name] = {
        name,
        path,
        isDir: parts.length > 1,
        children: [],
      };
    }

    if (parts.length > 1) {
      parent[name].isDir = true;
      const childMap: Record<string, TreeNode> = {};
      parent[name].children.forEach((c) => (childMap[c.name] = c));
      getOrCreate(parts.slice(1), childMap, path);
      parent[name].children = Object.values(childMap).sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    }

    return parent[name];
  };

  for (const filePath of Object.keys(files)) {
    const parts = filePath.split("/");
    getOrCreate(parts, root, "");
  }

  return Object.values(root).sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function getFileIcon(name: string): React.ReactNode {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["tsx", "jsx"].includes(ext)) {
    return <FileCode2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />;
  }
  if (["ts", "js"].includes(ext)) {
    return <FileCode2 className="h-3.5 w-3.5 text-yellow-400 shrink-0" />;
  }
  if (ext === "css") {
    return <FileText className="h-3.5 w-3.5 text-pink-400 shrink-0" />;
  }
  if (ext === "html") {
    return <FileText className="h-3.5 w-3.5 text-orange-400 shrink-0" />;
  }
  if (ext === "json") {
    return <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
  }
  if (["md", "mdx"].includes(ext)) {
    return <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
  }
  return <File className="h-3.5 w-3.5 text-white/30 shrink-0" />;
}

interface TreeNodeRowProps {
  node: TreeNode;
  depth: number;
  activeFile: string;
  onFileSelect: (path: string) => void;
  expandedDirs: Set<string>;
  onToggleDir: (path: string) => void;
}

function TreeNodeRow({
  node,
  depth,
  activeFile,
  onFileSelect,
  expandedDirs,
  onToggleDir,
}: TreeNodeRowProps) {
  const isExpanded = expandedDirs.has(node.path);
  const isActive = activeFile === node.path;

  if (node.isDir) {
    return (
      <>
        <button
          onClick={() => onToggleDir(node.path)}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          className="flex w-full items-center gap-1.5 py-1 pr-3 text-left hover:bg-white/[0.03] rounded-md transition-colors group"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-white/30 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5 text-indigo-400/80 shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-indigo-400/60 shrink-0" />
          )}
          <span className="text-xs text-white/60 group-hover:text-white/80 font-medium truncate">
            {node.name}
          </span>
        </button>
        {isExpanded &&
          node.children.map((child) => (
            <TreeNodeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              expandedDirs={expandedDirs}
              onToggleDir={onToggleDir}
            />
          ))}
      </>
    );
  }

  return (
    <button
      onClick={() => onFileSelect(node.path)}
      style={{ paddingLeft: `${8 + depth * 12 + 16}px` }}
      className={`flex w-full items-center gap-1.5 py-1 pr-3 text-left rounded-md transition-all ${
        isActive
          ? "bg-indigo-500/15 text-indigo-300"
          : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
      }`}
    >
      {getFileIcon(node.name)}
      <span className="text-xs font-medium truncate" title={node.path}>
        {node.name}
      </span>
    </button>
  );
}

export function FileExplorer({ files, activeFile, onFileSelect }: FileExplorerProps) {
  const tree = useMemo(() => buildTree(files), [files]);

  const initialExpanded = useMemo(() => {
    const dirs = new Set<string>();
    // Auto-expand root-level directories
    tree.forEach((node) => {
      if (node.isDir) dirs.add(node.path);
    });
    return dirs;
  }, [tree]);

  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(initialExpanded);

  const handleToggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const fileCount = Object.keys(files).length;

  return (
    <div className="flex flex-col h-full bg-[#07070b] border-r border-white/[0.06] overflow-hidden">
      {/* Explorer header */}
      <div className="h-9 border-b border-white/[0.05] flex items-center justify-between px-3 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/25 select-none">
          Files
        </span>
        <span className="text-[9px] font-mono text-white/20">
          {fileCount} {fileCount === 1 ? "file" : "files"}
        </span>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-1 px-1 space-y-0.5">
        {fileCount === 0 ? (
          <p className="text-[11px] text-white/20 italic px-3 py-3">
            No files generated yet
          </p>
        ) : (
          tree.map((node) => (
            <TreeNodeRow
              key={node.path}
              node={node}
              depth={0}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              expandedDirs={expandedDirs}
              onToggleDir={handleToggleDir}
            />
          ))
        )}
      </div>
    </div>
  );
}
