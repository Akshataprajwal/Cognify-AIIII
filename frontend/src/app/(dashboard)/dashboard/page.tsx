import type { Metadata } from "next";
import { Sparkles, FolderOpen, Zap, Users } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectCard, type Project } from "@/components/dashboard/ProjectCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CreditMeter } from "@/components/dashboard/CreditMeter";

export const metadata: Metadata = {
  title: "Dashboard — Cognify AI",
  description: "Your Cognify AI dashboard — manage projects, track usage, and launch the AI workspace.",
};

// Demo projects — will be replaced with real API data in Phase 7
const DEMO_PROJECTS: Project[] = [
  {
    id: "1",
    name: "SaaS Landing Page",
    prompt: "A modern SaaS landing page with hero, features, pricing, and testimonials sections",
    updatedAt: "2 hours ago",
    status: "ready",
  },
  {
    id: "2",
    name: "Dashboard UI Kit",
    prompt: "Admin dashboard with sidebar, topbar, stats cards, and data table",
    updatedAt: "1 day ago",
    status: "ready",
  },
  {
    id: "3",
    name: "E-commerce Product",
    prompt: "Product detail page with image gallery, reviews, and add to cart",
    updatedAt: "3 days ago",
    status: "draft",
  },
  {
    id: "4",
    name: "Auth Flow",
    prompt: "Login, register, and forgot password pages with glassmorphism design",
    updatedAt: "1 week ago",
    status: "ready",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/40">
            Here&apos;s an overview of your workspace
          </p>
        </div>
        <Link
          href="/ai-workspace"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500"
        >
          <Sparkles className="h-4 w-4" />
          New generation
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Total Projects"
          value="24"
          change="+4"
          positive
          icon={<FolderOpen className="h-5 w-5" />}
          gradient="bg-gradient-to-br from-indigo-500/20 to-indigo-600/5"
        />
        <StatsCard
          label="Generations"
          value="142"
          change="+28"
          positive
          icon={<Sparkles className="h-5 w-5" />}
          gradient="bg-gradient-to-br from-violet-500/20 to-violet-600/5"
        />
        <StatsCard
          label="Credits Used"
          value="358"
          change="+72"
          positive={false}
          icon={<Zap className="h-5 w-5" />}
          gradient="bg-gradient-to-br from-amber-500/20 to-amber-600/5"
        />
        <StatsCard
          label="Templates Saved"
          value="8"
          change="+2"
          positive
          icon={<Users className="h-5 w-5" />}
          gradient="bg-gradient-to-br from-cyan-500/20 to-cyan-600/5"
        />
      </div>

      {/* Main grid: projects + sidebar widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects — takes 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white/80">Recent Projects</h2>
            <Link
              href="/projects"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DEMO_PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Sidebar widgets — takes 1/3 */}
        <div className="space-y-4">
          <CreditMeter used={358} total={500} planName="Pro" />
          <ActivityFeed />
        </div>
      </div>

      {/* Quick-start banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-violet-900/40 to-indigo-900/60 p-6 ring-1 ring-indigo-500/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-white">
              Ready to build something amazing?
            </h3>
            <p className="mt-1 text-sm text-white/50">
              Describe any UI and Cognify AI will generate production-ready code in seconds.
            </p>
          </div>
          <Link
            href="/ai-workspace"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-white/15 hover:ring-white/30"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Open AI Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
