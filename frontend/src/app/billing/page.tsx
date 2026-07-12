import type { Metadata } from "next";
import { Check, Zap, Users, Building2, ArrowRight, CreditCard, Receipt, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Billing — Cognify AI",
  description: "Manage your Cognify AI subscription, usage, and invoices.",
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal experiments.",
    credits: 100,
    icon: <Zap className="h-5 w-5 text-white/40" />,
    features: [
      "100 credits / month",
      "3 active projects",
      "Community templates",
      "Monaco code editor",
      "HTML export",
    ],
    cta: "Current plan",
    current: false,
    gradient: "from-white/[0.04] to-white/[0.02]",
    ring: "ring-white/[0.08]",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/ month",
    description: "For individuals who build regularly.",
    credits: 2000,
    icon: <Zap className="h-5 w-5 text-indigo-400" />,
    features: [
      "2,000 credits / month",
      "Unlimited projects",
      "All templates",
      "React + Tailwind export",
      "Priority generation",
      "API access",
    ],
    cta: "Upgrade to Pro",
    current: true,
    gradient: "from-indigo-500/15 to-violet-500/10",
    ring: "ring-indigo-500/30",
  },
  {
    id: "team",
    name: "Team",
    price: "$49",
    period: "/ month",
    description: "For teams shipping products fast.",
    credits: 10000,
    icon: <Users className="h-5 w-5 text-violet-400" />,
    features: [
      "10,000 credits / month",
      "Up to 10 seats",
      "Shared project workspace",
      "All Pro features",
      "Admin panel",
      "Priority support",
    ],
    cta: "Upgrade to Team",
    current: false,
    gradient: "from-violet-500/10 to-purple-500/5",
    ring: "ring-violet-500/20",
  },
];

const INVOICES = [
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: "$19.00", status: "Paid" },
  { id: "INV-2026-005", date: "May 1, 2026", amount: "$19.00", status: "Paid" },
  { id: "INV-2026-004", date: "Apr 1, 2026", amount: "$19.00", status: "Paid" },
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$19.00", status: "Paid" },
];

export default function BillingPage() {
  const creditsUsed = 358;
  const creditsTotal = 2000;
  const pct = Math.round((creditsUsed / creditsTotal) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
        <p className="mt-1 text-sm text-white/40">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Current plan summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Current Plan</p>
              <h2 className="mt-1 text-xl font-bold text-white">Pro · $19/mo</h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
              Active
            </span>
          </div>

          {/* Credit meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Credits used this month</span>
              <span className="font-medium text-white/70">
                {creditsUsed.toLocaleString()} / {creditsTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all ${
                  pct > 80
                    ? "bg-gradient-to-r from-amber-500 to-red-500"
                    : "bg-gradient-to-r from-indigo-500 to-violet-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-white/25">
              Resets on Jul 1, 2026 · {creditsTotal - creditsUsed} credits remaining
            </p>
          </div>

          <div className="flex gap-3">
            <button
              id="manage-subscription-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/[0.1] hover:text-white"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Manage subscription
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-indigo-400 transition-colors hover:text-indigo-300">
              Cancel plan
            </button>
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Payment</p>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
            <div className="flex h-8 w-12 items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-violet-700 text-[10px] font-bold text-white">
              VISA
            </div>
            <div>
              <p className="text-xs font-medium text-white/70">•••• •••• •••• 4242</p>
              <p className="text-[10px] text-white/30">Expires 12/27</p>
            </div>
          </div>
          <button
            id="add-payment-method-btn"
            className="w-full rounded-xl border border-dashed border-white/[0.08] py-2.5 text-xs text-white/30 transition-colors hover:border-white/[0.15] hover:text-white/50"
          >
            + Add payment method
          </button>
        </div>
      </div>

      {/* Plans comparison */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-white/60">All Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl bg-gradient-to-br ${plan.gradient} ring-1 ${plan.ring} p-5`}
            >
              {plan.current && (
                <span className="absolute right-4 top-4 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-indigo-500/30">
                  Current
                </span>
              )}
              <div className="flex items-center gap-2 mb-3">
                {plan.icon}
                <span className="text-sm font-bold text-white">{plan.name}</span>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-white">{plan.price}</span>
                <span className="text-xs text-white/30"> {plan.period}</span>
              </div>
              <p className="mb-4 text-xs text-white/40">{plan.description}</p>
              <ul className="mb-5 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/50">
                    <Check className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                id={`plan-cta-${plan.id}`}
                disabled={plan.current}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  plan.current
                    ? "cursor-default bg-white/[0.04] text-white/25"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice history */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-white/60">Invoice History</h2>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                <th className="px-5 py-3.5 text-xs font-medium text-white/30">Invoice</th>
                <th className="px-5 py-3.5 text-xs font-medium text-white/30">Date</th>
                <th className="px-5 py-3.5 text-xs font-medium text-white/30">Amount</th>
                <th className="px-5 py-3.5 text-xs font-medium text-white/30">Status</th>
                <th className="px-5 py-3.5 text-xs font-medium text-white/30 text-right">PDF</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr
                  key={inv.id}
                  className={`transition-colors hover:bg-white/[0.02] ${
                    i !== INVOICES.length - 1 ? "border-b border-white/[0.04]" : ""
                  }`}
                >
                  <td className="px-5 py-3.5 text-xs font-mono text-white/60">{inv.id}</td>
                  <td className="px-5 py-3.5 text-xs text-white/40">{inv.date}</td>
                  <td className="px-5 py-3.5 text-xs font-medium text-white/70">{inv.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                      <Check className="h-2.5 w-2.5" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      aria-label={`Download ${inv.id}`}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400/60 transition-colors hover:text-indigo-400"
                    >
                      <Receipt className="h-3 w-3" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
