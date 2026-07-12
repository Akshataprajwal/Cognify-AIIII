import { Zap } from "lucide-react";
import Link from "next/link";

interface CreditMeterProps {
  used: number;
  total: number;
  planName: string;
}

export function CreditMeter({ used, total, planName }: CreditMeterProps) {
  const pct = Math.min(100, (used / total) * 100);
  const remaining = total - used;
  const isLow = pct >= 80;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80">AI Credits</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
            planName === "Pro"
              ? "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20"
              : "bg-white/5 text-white/30 ring-white/10"
          }`}
        >
          {planName}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-white">{remaining.toLocaleString()}</span>
          <span className="mb-0.5 text-xs text-white/30">/ {total.toLocaleString()} credits</span>
        </div>
        <p className="mt-0.5 text-xs text-white/30">{used.toLocaleString()} used this month</p>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all ${
            isLow
              ? "bg-gradient-to-r from-amber-500 to-red-500"
              : "bg-gradient-to-r from-indigo-500 to-violet-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isLow && (
        <p className="mt-2 text-xs text-amber-400/80">
          Running low!{" "}
          <Link href="/billing" className="underline hover:text-amber-300">
            Upgrade for more
          </Link>
        </p>
      )}

      {!isLow && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-white/25">
          <Zap className="h-3 w-3 text-indigo-400" />
          Resets on the 1st of next month
        </div>
      )}
    </div>
  );
}
