import { Sparkles, FolderPlus, Download, Star, Zap } from "lucide-react";

interface Activity {
  id: string;
  type: "generate" | "create" | "export" | "star" | "upgrade";
  message: string;
  time: string;
}

const ICONS: Record<Activity["type"], React.ReactNode> = {
  generate: <Sparkles className="h-3.5 w-3.5 text-indigo-400" />,
  create: <FolderPlus className="h-3.5 w-3.5 text-violet-400" />,
  export: <Download className="h-3.5 w-3.5 text-cyan-400" />,
  star: <Star className="h-3.5 w-3.5 text-amber-400" />,
  upgrade: <Zap className="h-3.5 w-3.5 text-emerald-400" />,
};

const ICON_BG: Record<Activity["type"], string> = {
  generate: "bg-indigo-500/10",
  create: "bg-violet-500/10",
  export: "bg-cyan-500/10",
  star: "bg-amber-500/10",
  upgrade: "bg-emerald-500/10",
};

// Demo data — will be replaced with real API data in Phase 7
const DEMO_ACTIVITIES: Activity[] = [
  { id: "1", type: "generate", message: "Generated \"Dashboard UI\" component", time: "2 min ago" },
  { id: "2", type: "create", message: "Created project \"E-commerce Landing Page\"", time: "1 hr ago" },
  { id: "3", type: "export", message: "Exported \"Marketing Hero\" as React", time: "3 hrs ago" },
  { id: "4", type: "star", message: "Starred template \"SaaS Pricing\"", time: "Yesterday" },
  { id: "5", type: "generate", message: "Generated \"Auth Login Form\" component", time: "Yesterday" },
  { id: "6", type: "upgrade", message: "Upgraded to Pro plan", time: "2 days ago" },
];

export function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <h2 className="mb-4 text-sm font-semibold text-white/80">Recent Activity</h2>
      <ul className="space-y-3">
        {DEMO_ACTIVITIES.map((activity) => (
          <li key={activity.id} className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${ICON_BG[activity.type]}`}
            >
              {ICONS[activity.type]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60 leading-relaxed">{activity.message}</p>
              <time className="text-[10px] text-white/25">{activity.time}</time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
