import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: ReactNode;
  gradient: string;
}

export function StatsCard({
  label,
  value,
  change,
  positive = true,
  icon,
  gradient,
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:border-white/[0.1] hover:bg-white/[0.05]">
      {/* Gradient accent */}
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${gradient}`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/30">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
          {change && (
            <p
              className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
                positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <TrendingUp
                className={`h-3 w-3 ${positive ? "" : "rotate-180"}`}
              />
              {change} this month
            </p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${gradient} text-white opacity-80`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
