import { ExternalLink, MoreHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";

export interface Project {
  id: string;
  name: string;
  prompt?: string;
  updatedAt: string;
  status: "ready" | "generating" | "draft";
  preview?: string;
}

const STATUS_STYLES: Record<Project["status"], string> = {
  ready: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  generating: "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20",
  draft: "bg-white/5 text-white/30 ring-white/10",
};

const STATUS_LABEL: Record<Project["status"], string> = {
  ready: "Ready",
  generating: "Generating…",
  draft: "Draft",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all hover:border-indigo-500/25 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-indigo-500/5">
      {/* Preview area */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-indigo-950 to-violet-950">
        {project.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.preview}
            alt={`Preview of ${project.name}`}
            className="h-full w-full object-cover opacity-70 transition-all group-hover:scale-105 group-hover:opacity-90"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
              <Sparkles className="h-5 w-5 text-indigo-400/60" />
            </div>
          </div>
        )}

        {/* Status badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${STATUS_STYLES[project.status]}`}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-white/90">{project.name}</h3>
          <button
            aria-label="Project options"
            className="shrink-0 rounded-lg p-1 text-white/20 transition-colors hover:bg-white/[0.06] hover:text-white/60"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        {project.prompt && (
          <p className="mt-1 line-clamp-2 text-xs text-white/35">{project.prompt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <time className="text-[10px] text-white/25">{project.updatedAt}</time>
          <Link
            href={`/ai-workspace?project=${project.id}`}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/50 transition-all hover:border-indigo-500/30 hover:text-indigo-400"
          >
            Open <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
