"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const WorkspaceLayout = dynamic(
  () => import("@/components/workspace/WorkspaceLayout").then((mod) => mod.WorkspaceLayout),
  { ssr: false }
);

export default function AiWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center text-white/40 text-sm gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Loading Workspace…</span>
        </div>
      }
    >
      <WorkspaceLayout />
    </Suspense>
  );
}
