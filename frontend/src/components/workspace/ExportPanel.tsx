"use client";

import React, { useState } from "react";
import { Download, Copy, Check, FileCode, Code, Terminal, Archive } from "lucide-react";
import { toast } from "sonner";
import { GeneratedCode } from "@/store/projectStore";
import { exportService } from "@/services/exportService";
import { useProjectStore } from "@/store/projectStore";

interface ExportPanelProps {
  code: GeneratedCode;
}

export function ExportPanel({ code }: ExportPanelProps) {
  const { currentProject } = useProjectStore();
  const [copied, setCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const projectName = currentProject?.name || "Cognify-UI-Project";

  const handleCopy = async (key: keyof GeneratedCode, label: string) => {
    const value = code[key];
    const text = typeof value === "string" ? value : (value ? JSON.stringify(value, null, 2) : "");
    const success = await exportService.copyToClipboard(text);
    if (success) {
      setCopied(key);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(null), 2000);
    } else {
      toast.error("Failed to copy code.");
    }
  };

  const handleNextJsExport = async () => {
    setIsExporting("nextjs");
    try {
      await exportService.downloadNextJsProject(code, projectName);
      toast.success("Next.js project zipped and downloaded!");
    } catch (err) {
      toast.error("Exporting Next.js project failed.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleFullZipExport = async () => {
    setIsExporting("zip");
    try {
      await exportService.downloadFullZipProject(code, projectName);
      toast.success("Workspace ZIP archive downloaded!");
    } catch (err) {
      toast.error("Exporting ZIP archive failed.");
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    {
      id: "react",
      label: "React Component File",
      desc: "Self-contained React component styled with Tailwind CSS utility mappings.",
      icon: Code,
      action: () => {
        exportService.downloadReactFile(code, projectName);
        toast.success("React component App.tsx downloaded!");
      },
      copyKey: "react" as keyof GeneratedCode,
    },
    {
      id: "html",
      label: "Static HTML File",
      desc: "Full HTML template containing linked scripts for Tailwind CSS & Lucide icons.",
      icon: FileCode,
      action: () => {
        exportService.downloadHTMLProject(code, projectName);
        toast.success("HTML template downloaded!");
      },
      copyKey: "html" as keyof GeneratedCode,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm space-y-6 select-none text-white">
      <div>
        <h2 className="text-lg font-bold text-white">Export Sandbox Output</h2>
        <p className="text-xs text-white/40 mt-1">
          Export the generated client-side elements into standalone formats ready for production integration.
        </p>
      </div>

      {/* Grid for React and HTML single-file exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((opt) => {
          const isCopied = copied === opt.copyKey;
          return (
            <div 
              key={opt.id}
              className="group p-5 rounded-2xl border border-white/[0.06] bg-slate-900/20 hover:bg-slate-900/40 hover:border-indigo-500/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <opt.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white/90 text-sm">{opt.label}</h3>
                <p className="text-[11px] text-white/30 mt-1 leading-relaxed">{opt.desc}</p>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={opt.action}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleCopy(opt.copyKey, opt.label)}
                  className="px-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:text-white text-white/50 transition-all flex items-center justify-center"
                  title="Copy to clipboard"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Framework ZIP Bundles */}
      <div className="border-t border-white/[0.06] pt-6 space-y-4">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Advanced Framework Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Next.js Box */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-slate-900/20 hover:bg-slate-900/40 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-white/90 text-sm">Next.js 15 Tailwind Boilerplate</h4>
              <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
                Generates a standard folder hierarchy containing next.config, tsconfig, app layout, Tailwind setup, and the React component.
              </p>
            </div>
            <button
              onClick={handleNextJsExport}
              disabled={isExporting !== null}
              className="mt-6 w-full flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-white/20 py-2.5 text-xs font-semibold text-white transition-all"
            >
              {isExporting === "nextjs" ? "Zipping..." : "Download Next.js Starter ZIP"}
            </button>
          </div>

          {/* Full ZIP Box */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-slate-900/20 hover:bg-slate-900/40 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Archive className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-white/90 text-sm">Full Workspace ZIP Bundle</h4>
              <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
                Archive containing separate clean assets: App.tsx, index.html, style.css, and script.js files in a single download.
              </p>
            </div>
            <button
              onClick={handleFullZipExport}
              disabled={isExporting !== null}
              className="mt-6 w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-white/20 py-2.5 text-xs font-semibold text-white transition-all"
            >
              {isExporting === "zip" ? "Zipping..." : "Download Clean ZIP Archive"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
