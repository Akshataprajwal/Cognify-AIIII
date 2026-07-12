import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Templates", href: "/templates" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Community", href: "/community" },
    { label: "Status", href: "/status" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socials = [
  { label: "Twitter / X", shortLabel: "𝕏", href: "#" },
  { label: "GitHub", shortLabel: "GH", href: "#" },
  { label: "LinkedIn", shortLabel: "in", href: "#" },
  { label: "Discord", shortLabel: "DC", href: "#" },
];

export function FooterSection() {
  return (
    <footer
      className="border-t border-gray-200/70 bg-white/60 backdrop-blur-md dark:border-gray-800/50 dark:bg-gray-950/50"
      aria-label="Site footer"
    >
      <div className="section-container py-16">
        {/* Top: Brand + Links */}
        <div className="grid gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70"
              aria-label="Cognify-AI home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-glow-sm">
                <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Cognify<span className="text-primary-600">-AI</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              AI-powered frontend code generation. From prompt to production-ready UI in seconds.
            </p>
            {/* Socials */}
            <div className="mt-5 flex gap-2" aria-label="Social media links">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/70 text-xs font-bold text-gray-600 shadow-sm backdrop-blur transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400 dark:hover:border-primary-700 dark:hover:bg-primary-950 dark:hover:text-primary-400"
                >
                  {s.shortLabel}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="md:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                {group}
              </h3>
              <ul className="mt-4 space-y-2.5" aria-label={`${group} links`}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-gray-200/70 pt-8 dark:border-gray-800/50 sm:flex-row sm:items-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Cognify-AI. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Built with{" "}
            <span className="text-red-500" aria-label="love">
              ♥
            </span>{" "}
            using Next.js, Tailwind CSS &amp; Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
}
