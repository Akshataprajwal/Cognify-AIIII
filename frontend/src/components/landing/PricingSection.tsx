"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    description: "Perfect for exploring and personal projects.",
    highlight: false,
    cta: "Start for free",
    ctaHref: "/register",
    features: [
      { label: "50 AI generations / month", included: true },
      { label: "3 active projects", included: true },
      { label: "Basic templates library", included: true },
      { label: "Live preview", included: true },
      { label: "HTML + CSS export", included: true },
      { label: "React export", included: false },
      { label: "ZIP export", included: false },
      { label: "Version history", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "$19",
    yearlyPrice: "$15",
    description: "For professional developers who ship frequently.",
    highlight: true,
    badge: "Most Popular",
    cta: "Upgrade to Pro",
    ctaHref: "/register?plan=pro",
    features: [
      { label: "Unlimited AI generations", included: true },
      { label: "Unlimited projects", included: true },
      { label: "Full template library", included: true },
      { label: "Live preview + responsive modes", included: true },
      { label: "HTML, React & Next.js export", included: true },
      { label: "ZIP export", included: true },
      { label: "Version history (30 days)", included: true },
      { label: "Priority support", included: false },
      { label: "Team workspace", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: "$99",
    yearlyPrice: "$79",
    description: "For agencies and teams building at scale.",
    highlight: false,
    cta: "Contact sales",
    ctaHref: "/contact",
    features: [
      { label: "Unlimited AI generations", included: true },
      { label: "Unlimited projects", included: true },
      { label: "Full template library", included: true },
      { label: "Live preview + responsive modes", included: true },
      { label: "All export formats", included: true },
      { label: "ZIP export", included: true },
      { label: "Version history (unlimited)", included: true },
      { label: "Priority support", included: true },
      { label: "Team workspace + SSO", included: true },
    ],
  },
] as const;

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-20 sm:py-28"
      aria-labelledby="pricing-heading"
    >
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/40 to-transparent dark:via-primary-950/15"
        aria-hidden="true"
      />

      <div className="section-container relative">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
              Pricing
            </span>
            <h2
              id="pricing-heading"
              className="mt-3 font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Start free. Scale when you&apos;re ready.
            </h2>
            <p className="mt-4 text-pretty text-lg text-gray-600 dark:text-gray-300">
              No credit card required. Upgrade any time as your team grows.
            </p>
          </motion.div>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <span
              className={cn(
                "text-sm font-medium",
                !yearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
              )}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly((v) => !v)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70",
                yearly ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
              )}
              aria-label="Toggle yearly billing"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                  yearly ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                yearly ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
              )}
            >
              Yearly
              <Badge variant="success" className="text-[10px]">Save 20%</Badge>
            </span>
          </motion.div>
        </div>

        {/* Plans */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl border p-8 shadow-card transition-shadow duration-300 hover:shadow-card-hover",
                plan.highlight
                  ? "border-primary-400/70 bg-gradient-to-b from-primary-50 to-white shadow-glow-sm dark:border-primary-600/50 dark:from-primary-950/40 dark:to-gray-900"
                  : "border-gray-200/70 bg-white/80 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/70"
              )}
            >
              {/* Popular badge */}
              {"badge" in plan && plan.badge && (
                <div className="absolute right-6 top-6">
                  <Badge variant="default">{plan.badge}</Badge>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/ month</span>
                </div>
                {yearly && plan.name !== "Free" && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Billed annually
                  </p>
                )}
              </div>

              <Button
                className={cn("mt-6 w-full", plan.highlight && "shadow-glow-sm")}
                variant={plan.highlight ? "default" : "secondary"}
              >
                <Link href={plan.ctaHref} className="flex items-center justify-center gap-2 w-full h-full">
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>

              {/* Divider */}
              <div className="my-6 h-px bg-gray-200 dark:bg-gray-700" />

              {/* Features */}
              <ul className="space-y-3" aria-label={`${plan.name} plan features`}>
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2.5">
                    {feature.included ? (
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <X
                        className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        feature.included
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-600"
                      )}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
