"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, ShoppingBag, User, Globe, BookOpen, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const templates = [
  {
    name: "SaaS Landing",
    tag: "Marketing",
    description: "Hero, features, pricing, testimonials, and footer.",
    icon: Globe,
    color: "primary",
    badgeColor: "default" as const,
    preview: [
      { w: "100%", h: 8, color: "bg-primary-500/30" },
      { w: "75%", h: 4, color: "bg-gray-200 dark:bg-gray-700" },
      { w: "55%", h: 4, color: "bg-gray-200 dark:bg-gray-700" },
      { w: "100%", h: 24, color: "bg-gradient-to-r from-primary-500/20 to-secondary-500/20" },
    ],
  },
  {
    name: "Analytics Dashboard",
    tag: "App UI",
    description: "Stats cards, charts, activity feed, and navigation.",
    icon: PieChart,
    color: "secondary",
    badgeColor: "secondary" as const,
    preview: [
      { w: "100%", h: 6, color: "bg-secondary-500/30" },
      { w: "100%", h: 16, color: "bg-gradient-to-r from-secondary-500/20 to-accent-500/20" },
      { w: "80%", h: 4, color: "bg-gray-200 dark:bg-gray-700" },
    ],
  },
  {
    name: "Developer Portfolio",
    tag: "Personal",
    description: "Bio, skills, projects showcase, and contact form.",
    icon: User,
    color: "accent",
    badgeColor: "accent" as const,
    preview: [
      { w: "60%", h: 6, color: "bg-accent-500/30" },
      { w: "40%", h: 4, color: "bg-gray-200 dark:bg-gray-700" },
      { w: "100%", h: 20, color: "bg-gradient-to-br from-accent-500/20 to-primary-500/15" },
    ],
  },
  {
    name: "E-Commerce",
    tag: "Shopping",
    description: "Product catalog, cart, filters, and checkout flow.",
    icon: ShoppingBag,
    color: "primary",
    badgeColor: "default" as const,
    preview: [
      { w: "100%", h: 8, color: "bg-primary-500/20" },
      { w: "100%", h: 20, color: "bg-gradient-to-r from-primary-500/15 to-secondary-500/15" },
    ],
  },
  {
    name: "Admin Panel",
    tag: "Management",
    description: "Users table, sidebar nav, forms, and data views.",
    icon: LayoutDashboard,
    color: "secondary",
    badgeColor: "secondary" as const,
    preview: [
      { w: "30%", h: 32, color: "bg-secondary-500/20" },
      { w: "68%", h: 32, color: "bg-gray-100 dark:bg-gray-800" },
    ],
  },
  {
    name: "Blog & Content",
    tag: "Publishing",
    description: "Article layout, tags, newsletter, and category filters.",
    icon: BookOpen,
    color: "accent",
    badgeColor: "accent" as const,
    preview: [
      { w: "100%", h: 6, color: "bg-accent-500/20" },
      { w: "65%", h: 4, color: "bg-gray-200 dark:bg-gray-700" },
      { w: "45%", h: 4, color: "bg-gray-200 dark:bg-gray-700" },
      { w: "100%", h: 14, color: "bg-gradient-to-r from-accent-500/10 to-secondary-500/10" },
    ],
  },
] as const;

const iconColorMap = {
  primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400",
  secondary: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-400",
  accent: "bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400",
};

export function TemplatesSection() {
  return (
    <section
      id="templates"
      className="section-container py-20 sm:py-28"
      aria-labelledby="templates-heading"
    >
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
            Templates
          </span>
          <h2
            id="templates-heading"
            className="mt-3 font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Start with a professional foundation
          </h2>
          <p className="mt-4 text-pretty text-lg text-gray-600 dark:text-gray-300">
            Choose a curated template and customize it with natural language prompts.
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, i) => (
          <motion.article
            key={template.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 shadow-card backdrop-blur-sm transition-shadow duration-300 hover:shadow-card-hover dark:border-gray-700/50 dark:bg-gray-900/70 card-glow"
          >
            {/* Preview area */}
            <div className="relative h-40 overflow-hidden bg-gray-50 p-4 dark:bg-gray-800/60">
              <div className="flex h-full flex-col gap-2">
                {template.preview.map((block, bi) => (
                  <div
                    key={bi}
                    className={`rounded-md ${block.color}`}
                    style={{ width: block.w, height: `${block.h * 4}px`, flexShrink: 0 }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              {/* Use Template overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                <Button size="sm" className="shadow-glow-sm">
                  Use Template
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[template.color]}`}
                >
                  <template.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <Badge variant={template.badgeColor}>{template.tag}</Badge>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {template.description}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Browse all CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 text-center"
      >
        <Button variant="secondary" size="lg">
          <Link href="/templates" className="flex items-center gap-2">
            Browse all templates
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
