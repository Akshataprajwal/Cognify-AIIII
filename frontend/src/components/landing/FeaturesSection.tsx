"use client";

import { motion } from "framer-motion";
import {
  Wand2,
  PlayCircle,
  Zap,
  Code2,
  PanelsTopLeft,
  Sparkles,
  Monitor,
  Download,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI Prompt to Code",
    description:
      "Describe your UI in natural language and receive production-ready React, HTML, and Tailwind code instantly.",
    color: "primary",
    gradient: "from-primary-500/20 to-primary-600/5",
    iconBg: "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400",
  },
  {
    icon: PlayCircle,
    title: "Instant Live Preview",
    description:
      "See your interface update in real time. No build step, no server — pure in-browser rendering.",
    color: "accent",
    gradient: "from-accent-500/20 to-accent-600/5",
    iconBg: "bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400",
  },
  {
    icon: Monitor,
    title: "Responsive by Default",
    description:
      "Switch between desktop, tablet, and mobile preview modes. Every layout is built to adapt.",
    color: "secondary",
    gradient: "from-secondary-500/20 to-secondary-600/5",
    iconBg: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-400",
  },
  {
    icon: Code2,
    title: "Monaco Code Editor",
    description:
      "Professional VS Code-grade editor built in. Edit, refine, and iterate on generated code directly.",
    color: "primary",
    gradient: "from-primary-500/20 to-primary-600/5",
    iconBg: "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400",
  },
  {
    icon: Download,
    title: "One-Click Export",
    description:
      "Download your project as React, Next.js, or plain HTML. Copy to clipboard or export as a ZIP.",
    color: "accent",
    gradient: "from-accent-500/20 to-accent-600/5",
    iconBg: "bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400",
  },
  {
    icon: Layers,
    title: "Template Library",
    description:
      "Start from curated templates: portfolios, SaaS pages, dashboards, e-commerce, and more.",
    color: "secondary",
    gradient: "from-secondary-500/20 to-secondary-600/5",
    iconBg: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-400",
  },
  {
    icon: PanelsTopLeft,
    title: "Component Library",
    description:
      "Consistent, reusable UI patterns ensure your generated interfaces are coherent and scalable.",
    color: "primary",
    gradient: "from-primary-500/20 to-primary-600/5",
    iconBg: "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized generation pipeline. From prompt submission to live preview in under two seconds.",
    color: "accent",
    gradient: "from-accent-500/20 to-accent-600/5",
    iconBg: "bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400",
  },
  {
    icon: Sparkles,
    title: "Version History",
    description:
      "Never lose your work. Every generation is saved, named, and searchable across all your projects.",
    color: "secondary",
    gradient: "from-secondary-500/20 to-secondary-600/5",
    iconBg: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-400",
  },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="section-container py-20 sm:py-28"
      aria-labelledby="features-heading"
    >
      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-semibold text-sm tracking-wide text-primary-600 dark:text-primary-400 uppercase">
            Features
          </span>
          <h2
            id="features-heading"
            className="mt-3 font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Everything you need to ship beautiful UIs
          </h2>
          <p className="mt-4 text-pretty text-lg text-gray-600 dark:text-gray-300">
            From prompt to production-ready code — Cognify-AI handles the complexity
            so you can focus on building great products.
          </p>
        </motion.div>
      </div>

      {/* Feature grid */}
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <motion.article
            key={feature.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-card backdrop-blur-sm transition-shadow duration-300 hover:shadow-card-hover dark:border-gray-700/50 dark:bg-gray-900/70 card-glow"
          >
            {/* Gradient blob */}
            <div
              className={`absolute inset-0 -z-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              aria-hidden="true"
            />

            <div className="relative z-10">
              {/* Icon */}
              <div className={`inline-flex rounded-xl p-3 ${feature.iconBg}`}>
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>

              {/* Text */}
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
