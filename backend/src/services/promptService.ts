export function buildSystemPrompt(): string {
  return `You are Cognify-AI's production frontend code generator.

PRIMARY CONTRACT:
- The user's prompt is the highest-priority product requirement.
- Generate exactly the requested frontend experience and no unrelated pages or features.
- Generate frontend code only.
- Never generate backend code, databases, API routes, authentication, JWT, Prisma, MongoDB, PostgreSQL, Express, Docker, CI/CD, server actions, server components that perform server work, or environment files.
- Use only React, Next.js App Router, TypeScript, Tailwind CSS, HTML, CSS, and JavaScript.
- Do not use Bootstrap, Material UI, Chakra UI, or unsupported packages unless the user explicitly asks.

OUTPUT CONTRACT:
1. Return a complete multi-file frontend project that can render in a live preview without extra setup.
2. Prefer Next.js App Router with TypeScript and Tailwind CSS unless the user's prompt clearly asks for plain React or static HTML.
3. Include every file required by imports: pages, layouts, components, data/constants, styles, and asset references.
4. Use functional components, valid TypeScript, accessible semantic markup, responsive Tailwind classes, and clean imports/exports.
5. Do not include TODO comments, placeholder implementations, unused imports, duplicate files, explanations, markdown prose, or backend-like filenames.
6. If the prompt is unclear, infer reasonable client-side UI behavior only.
7. If you cannot produce the requested framework perfectly, output a complete standalone index.html file with embedded CSS and JavaScript instead.
8. Never return an empty response, incomplete code, placeholder text, TODO comments, or instructions for the user to finish.

REQUIRED RESPONSE FORMAT:
Write each file's path and code inside custom tags:
   [FILE: src/components/Button.tsx]
   import React from 'react';
   export function Button({ label }: { label: string }) {
     return <button className="bg-indigo-600 px-4 py-2 rounded-xl text-white hover:bg-indigo-500">{label}</button>;
   }
   [END_FILE]

   [FILE: src/App.tsx]
   import React from 'react';
   import { Button } from './components/Button';
   export default function App() {
     return (
       <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
         <Button label="Hello World" />
       </div>
     );
   }
   [END_FILE]

Then output:
[ENTRY_PATH: src/app/page.tsx]
[PROJECT_TYPE: nextjs]

VALID PROJECT TYPES:
- nextjs
- react
- html

GUARANTEED FALLBACK:
At minimum, always generate:
[FILE: index.html]
<!doctype html>
<html lang="en">
...
</html>
[END_FILE]
[ENTRY_PATH: index.html]
[PROJECT_TYPE: html]

FINAL SELF-CHECK BEFORE ANSWERING:
- No backend/server/API/database/auth code.
- No environment files.
- No unsupported dependencies.
- All imports resolve to generated files or allowed framework packages.
- Every file compiles without syntax errors.
- index.html exists if framework generation is uncertain.
- The UI is modern, responsive, accessible, and tailored to the user's prompt.`;
}

export function enhanceUserPrompt(prompt: string): string {
  return [
    "Generate a complete frontend-only project for this exact user request:",
    prompt.trim(),
    "",
    "Hard constraints:",
    "- Do not add backend, API, database, authentication, server, Docker, CI/CD, or environment-file code.",
    "- Use only React, Next.js App Router, TypeScript, Tailwind CSS, HTML, CSS, and JavaScript.",
    "- Match the requested page/app type exactly; do not add unrelated pages.",
    "- Return only [FILE] blocks plus [ENTRY_PATH] and [PROJECT_TYPE] tags.",
    "- If Next.js/React output is uncertain, return a complete standalone index.html with embedded CSS and JavaScript.",
    "- Never return empty, partial, placeholder, TODO, or explanatory text instead of code.",
    "- Make the result production-ready, responsive, accessible, and live-preview compatible.",
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface FallbackCard {
  metric: string;
  title: string;
  body: string;
}

interface FallbackKind {
  brand: string;
  title: string;
  eyebrow: string;
  summary: string;
  primaryAction: string;
  secondaryAction: string;
  nav: string[];
  cards: FallbackCard[];
  visual: string;
}

function inferFallbackKind(prompt: string): FallbackKind {
  const lower = prompt.toLowerCase();

  if (lower.includes("login") || lower.includes("sign in") || lower.includes("signin")) {
    return {
      brand: "Northstar",
      title: "Welcome back",
      eyebrow: "Secure client portal",
      summary:
        "A focused login page with clear form labels, quick recovery access, and a calm visual hierarchy for returning users.",
      primaryAction: "Sign in",
      secondaryAction: "Create account",
      nav: ["Security", "Support", "Status"],
      cards: [
        { metric: "01", title: "Email-first flow", body: "Large fields, visible labels, and keyboard-friendly spacing keep the sign-in path direct." },
        { metric: "02", title: "Trust cues", body: "Session notes and support links sit near the form without competing with the main action." },
        { metric: "03", title: "Recovery access", body: "Forgot-password and account creation actions are available without clutter." },
      ],
      visual: `
        <form class="login-form" data-form="login">
          <h2>Sign in to Northstar</h2>
          <label for="email">Email address</label>
          <input id="email" type="email" value="alex@example.com" autocomplete="email">
          <label for="password">Password</label>
          <input id="password" type="password" value="password" autocomplete="current-password">
          <div class="form-row"><label><input type="checkbox" checked> Remember this device</label><a href="#">Forgot password?</a></div>
          <button type="submit">Sign in securely</button>
          <p>Protected session handoff for client-side demos.</p>
        </form>`,
    };
  }

  if (lower.includes("dashboard")) {
    return {
      brand: "PulseOps",
      title: "Operations dashboard",
      eyebrow: "Live performance view",
      summary:
        "A responsive dashboard surface with KPIs, trend bars, alerts, and a clean control strip for repeated daily monitoring.",
      primaryAction: "Refresh view",
      secondaryAction: "Export report",
      nav: ["Overview", "Revenue", "Activity"],
      cards: [
        { metric: "+18%", title: "Revenue lift", body: "Weekly revenue is trending above plan with a strong expansion signal." },
        { metric: "42k", title: "Active users", body: "Engagement remains stable across web and mobile product surfaces." },
        { metric: "97%", title: "Uptime", body: "Critical workflow health is visible at a glance for operators." },
      ],
      visual: `
        <div class="dashboard-panel">
          <div class="panel-top"><span>Q3 pipeline</span><strong>$842k</strong></div>
          <div class="bars" aria-label="Revenue bar chart">
            <span style="height: 42%"></span><span style="height: 68%"></span><span style="height: 54%"></span><span style="height: 88%"></span><span style="height: 74%"></span>
          </div>
          <div class="kpi-grid"><b>2.4x</b><b>16ms</b><b>8.7k</b></div>
        </div>`,
    };
  }

  if (lower.includes("portfolio")) {
    return {
      brand: "Ari Lane",
      title: "Ari Lane portfolio",
      eyebrow: "Product designer",
      summary:
        "A polished portfolio website with selected work, a concise personal pitch, case-study cards, and a direct contact path.",
      primaryAction: "View projects",
      secondaryAction: "Contact Ari",
      nav: ["Work", "About", "Contact"],
      cards: [
        { metric: "01", title: "Fintech redesign", body: "A conversion-focused dashboard system for high-volume finance teams." },
        { metric: "02", title: "Travel app", body: "Mobile booking flows shaped around speed, trust, and discoverability." },
        { metric: "03", title: "Brand system", body: "A practical design language with reusable UI patterns and launch assets." },
      ],
      visual: `
        <div class="portfolio-panel">
          <div class="avatar">AL</div>
          <h2>Ari Lane</h2>
          <p>Designing useful interfaces for teams that ship ambitious products.</p>
          <a href="#work">Open case studies</a>
        </div>`,
    };
  }

  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("bistro")) {
    return {
      brand: "Juniper Table",
      title: "Juniper Table",
      eyebrow: "Seasonal restaurant",
      summary:
        "A restaurant website with a reservation call to action, featured dishes, hours, and a warm menu preview for guests.",
      primaryAction: "Reserve a table",
      secondaryAction: "View menu",
      nav: ["Menu", "Hours", "Reservations"],
      cards: [
        { metric: "$24", title: "Charred carrot tartine", body: "Whipped feta, herb oil, toasted seed crumble, and sourdough." },
        { metric: "$31", title: "Citrus salmon", body: "Pan-roasted salmon with fennel, dill, and lemon beurre blanc." },
        { metric: "$14", title: "Pear pavlova", body: "Crisp meringue, poached pear, vanilla cream, and pistachio." },
      ],
      visual: `
        <div class="menu-panel">
          <h2>Tonight's table</h2>
          <p>Open 5:00 PM - 10:30 PM</p>
          <form data-form="reservation">
            <input aria-label="Party size" value="2 guests">
            <input aria-label="Reservation time" value="7:30 PM">
            <button type="submit">Book reservation</button>
          </form>
        </div>`,
    };
  }

  if (lower.includes("landing")) {
    return {
      brand: "LaunchPad",
      title: "LaunchPad CRM",
      eyebrow: "Customer growth suite",
      summary:
        "A conversion-ready landing page with a sharp value proposition, product proof points, social metrics, and a clear signup path.",
      primaryAction: "Start free trial",
      secondaryAction: "Watch demo",
      nav: ["Features", "Pricing", "Customers"],
      cards: [
        { metric: "3x", title: "Faster follow-up", body: "Prioritize the hottest accounts and automate client-ready summaries." },
        { metric: "28%", title: "Higher conversion", body: "Use unified pipeline views to remove friction from every handoff." },
        { metric: "14d", title: "Fast rollout", body: "Import contacts, invite teammates, and launch workflows in two weeks." },
      ],
      visual: `
        <div class="signup-panel">
          <h2>Grow the next 1,000 customers</h2>
          <p>Pipeline, outreach, and customer context in one focused workspace.</p>
          <form data-form="waitlist"><input type="email" value="team@company.com" aria-label="Work email"><button type="submit">Join trial</button></form>
        </div>`,
    };
  }

  if (lower.includes("shop") || lower.includes("commerce") || lower.includes("store")) {
    return {
      brand: "Luma Goods",
      title: "Modern storefront",
      eyebrow: "Curated collection",
      summary:
        "A storefront with clear product highlights, tactile merchandising, customer proof, and fast paths into the catalog.",
      primaryAction: "Shop new arrivals",
      secondaryAction: "Browse catalog",
      nav: ["New", "Bundles", "Reviews"],
      cards: [
        { metric: "$88", title: "Everyday carry kit", body: "Compact organizer, recycled shell, and modular storage for daily essentials." },
        { metric: "$42", title: "Desk light mini", body: "Warm LED task light with a low-profile base and dimmer controls." },
        { metric: "$64", title: "Travel pouch", body: "Weather-resistant textile, soft dividers, and quick-access compartments." },
      ],
      visual: `
        <div class="product-panel">
          <div class="product-art"></div>
          <h2>Carry kit pro</h2>
          <p>4.9 rating from 1,240 customers</p>
          <button type="button" data-action="Added to cart">Add to cart</button>
        </div>`,
    };
  }

  return {
    brand: "Cognify Studio",
    title: "Modern frontend experience",
    eyebrow: "Responsive interface",
    summary:
      "A complete standalone frontend with polished sections, accessible controls, responsive layout, and client-side interactions.",
    primaryAction: "Get started",
    secondaryAction: "Explore",
    nav: ["Overview", "Details", "Contact"],
    cards: [
      { metric: "01", title: "Clear structure", body: "Hero content, supporting details, and calls to action are arranged for quick scanning." },
      { metric: "02", title: "Responsive layout", body: "Grid and form elements adapt cleanly from desktop to mobile." },
      { metric: "03", title: "Interactive states", body: "Buttons and forms provide immediate visual feedback for preview testing." },
    ],
    visual: `
      <div class="signup-panel">
        <h2>Interface preview</h2>
        <p>Clean typography, balanced spacing, and practical controls are ready to inspect.</p>
        <button type="button" data-action="Preview action completed">Try interaction</button>
      </div>`,
  };
}

export function buildFallbackHtmlProject(prompt: string): ParsedProject {
  const kind = inferFallbackKind(prompt);
  const navItems = kind.nav
    .map((item) => `<a href="#${escapeHtml(item.toLowerCase())}">${escapeHtml(item)}</a>`)
    .join("");
  const cards = kind.cards
    .map(
      (card) => `
        <article class="feature-card">
          <span class="metric">${escapeHtml(card.metric)}</span>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.body)}</p>
        </article>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(kind.title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #070911;
      --surface: rgba(255, 255, 255, 0.075);
      --surface-strong: rgba(255, 255, 255, 0.13);
      --line: rgba(255, 255, 255, 0.12);
      --text: #f8fafc;
      --muted: #a8b3c7;
      --accent: #2dd4bf;
      --accent-strong: #60a5fa;
      --warm: #fbbf24;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(45, 212, 191, 0.18), transparent 28rem),
        linear-gradient(135deg, #070911 0%, #101522 54%, #10130f 100%);
      color: var(--text);
    }
    a { color: inherit; text-decoration: none; }
    main { min-height: 100vh; padding: 24px; }
    .shell { width: min(1120px, 100%); margin: 0 auto; }
    .nav {
      min-height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    .brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; letter-spacing: 0; }
    .mark { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--accent), var(--accent-strong)); }
    .links { display: flex; align-items: center; gap: 14px; color: var(--muted); font-size: 0.92rem; }
    .theme-button, .actions button, form button, .product-panel button {
      min-height: 42px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px 14px;
      background: var(--surface);
      color: var(--text);
      font-weight: 750;
      cursor: pointer;
      transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    .theme-button:hover, .actions button:hover, form button:hover, .product-panel button:hover, .feature-card:hover {
      transform: translateY(-2px);
      border-color: rgba(45, 212, 191, 0.48);
      background: var(--surface-strong);
    }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.04fr) minmax(300px, 0.96fr);
      gap: 22px;
      align-items: stretch;
    }
    .hero-copy, .visual-card, .feature-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.045));
      box-shadow: 0 24px 70px rgba(0,0,0,0.26);
    }
    .hero-copy { padding: clamp(24px, 5vw, 48px); }
    .eyebrow { margin: 0 0 14px; color: var(--accent); font-size: 0.78rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0; }
    h1 { margin: 0; font-size: clamp(2.45rem, 7vw, 5.4rem); line-height: 0.98; letter-spacing: 0; }
    .summary { max-width: 62ch; margin: 20px 0 0; color: var(--muted); font-size: clamp(1rem, 2vw, 1.14rem); line-height: 1.72; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
    .actions .primary, form button { background: linear-gradient(135deg, var(--accent), var(--accent-strong)); border-color: transparent; color: #031018; }
    .visual-card { min-height: 430px; padding: 22px; display: grid; place-items: center; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 22px; }
    .feature-card { min-height: 170px; padding: 20px; }
    .metric { color: var(--warm); font-weight: 900; }
    h2, h3 { letter-spacing: 0; }
    h3 { margin: 20px 0 9px; font-size: 1.05rem; }
    .feature-card p, .visual-card p { margin: 0; color: var(--muted); line-height: 1.62; }
    input {
      width: 100%;
      min-height: 42px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.13);
      background: rgba(4, 8, 16, 0.62);
      color: var(--text);
      padding: 10px 12px;
      outline: none;
    }
    input:focus { border-color: rgba(45, 212, 191, 0.62); }
    .login-form, .menu-panel, .signup-panel, .portfolio-panel, .dashboard-panel, .product-panel {
      width: min(390px, 100%);
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(4, 8, 16, 0.58);
      padding: 22px;
    }
    .login-form { display: grid; gap: 11px; }
    .login-form h2, .menu-panel h2, .signup-panel h2, .portfolio-panel h2, .product-panel h2 { margin: 0 0 8px; }
    .login-form label { color: #dbeafe; font-size: 0.88rem; font-weight: 720; }
    .form-row { display: flex; justify-content: space-between; gap: 12px; color: var(--muted); font-size: 0.84rem; }
    .form-row label { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-weight: 600; }
    .form-row input { width: auto; min-height: auto; }
    .dashboard-panel { min-height: 320px; display: grid; gap: 18px; align-content: space-between; }
    .panel-top { display: flex; justify-content: space-between; color: var(--muted); }
    .panel-top strong { color: var(--text); font-size: 2rem; }
    .bars { height: 180px; display: flex; align-items: end; gap: 12px; padding-top: 20px; }
    .bars span { flex: 1; min-height: 28px; border-radius: 8px 8px 0 0; background: linear-gradient(180deg, var(--accent), var(--accent-strong)); }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .kpi-grid b { border-radius: 8px; background: rgba(255,255,255,0.08); padding: 14px 10px; text-align: center; }
    .avatar { width: 78px; height: 78px; border-radius: 8px; display: grid; place-items: center; background: linear-gradient(135deg, var(--accent), var(--warm)); color: #071013; font-size: 1.35rem; font-weight: 900; margin-bottom: 16px; }
    .portfolio-panel a { display: inline-flex; margin-top: 18px; color: var(--accent); font-weight: 800; }
    .menu-panel form, .signup-panel form { display: grid; gap: 10px; margin-top: 18px; }
    .product-art { height: 180px; border-radius: 8px; background: linear-gradient(135deg, rgba(45,212,191,0.34), rgba(251,191,36,0.28)), repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 22px); margin-bottom: 18px; }
    .toast {
      position: fixed;
      right: 18px;
      bottom: 18px;
      max-width: 320px;
      border-radius: 8px;
      padding: 12px 14px;
      background: #f8fafc;
      color: #0f172a;
      box-shadow: 0 18px 70px rgba(0,0,0,0.35);
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 160ms ease, transform 160ms ease;
      font-weight: 760;
    }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 860px) {
      main { padding: 18px; }
      .hero { grid-template-columns: 1fr; }
      .grid { grid-template-columns: 1fr; }
      .links { display: none; }
    }
    @media (max-width: 560px) {
      .nav { align-items: flex-start; flex-direction: column; }
      .actions button, .theme-button { width: 100%; }
      .hero-copy, .visual-card { padding: 20px; }
      .form-row { flex-direction: column; }
    }
  </style>
</head>
<body>
  <main>
    <div class="shell">
      <nav class="nav" aria-label="Primary">
        <div class="brand"><span class="mark" aria-hidden="true"></span><span>${escapeHtml(kind.brand)}</span></div>
        <div class="links">${navItems}</div>
        <button type="button" class="theme-button" id="themeButton">Switch theme</button>
      </nav>
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(kind.eyebrow)}</p>
          <h1 id="page-title">${escapeHtml(kind.title)}</h1>
          <p class="summary">${escapeHtml(kind.summary)}</p>
          <div class="actions">
            <button type="button" class="primary" data-action="${escapeHtml(kind.primaryAction)}">${escapeHtml(kind.primaryAction)}</button>
            <button type="button" data-action="${escapeHtml(kind.secondaryAction)}">${escapeHtml(kind.secondaryAction)}</button>
          </div>
        </div>
        <aside class="visual-card" aria-label="${escapeHtml(kind.title)} preview">${kind.visual}</aside>
      </section>
      <section class="grid" aria-label="Highlights">${cards}
      </section>
    </div>
  </main>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script>
    const toast = document.getElementById("toast");
    const showToast = (message) => {
      toast.textContent = message;
      toast.classList.add("show");
      window.clearTimeout(window.__toastTimer);
      window.__toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
    };
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => showToast(button.dataset.action + " selected."));
    });
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        showToast(form.dataset.form === "login" ? "Signed-in preview ready." : "Request captured.");
      });
    });
    document.getElementById("themeButton").addEventListener("click", () => {
      const root = document.documentElement;
      const light = root.style.getPropertyValue("--bg") === "#f8fafc";
      root.style.setProperty("--bg", light ? "#070911" : "#f8fafc");
      root.style.setProperty("--text", light ? "#f8fafc" : "#0f172a");
      root.style.setProperty("--muted", light ? "#a8b3c7" : "#475569");
      showToast(light ? "Dark theme enabled." : "Light theme enabled.");
    });
  </script>
</body>
</html>`;

  return {
    files: { "index.html": html },
    entryPath: "index.html",
    projectType: "html",
  };
}

export function validateAIResponse(code: string): boolean {
  const lower = code.toLowerCase();
  const forbiddenPatterns = [
    /\bexpress\s*\(/i,
    /\bfastify\s*\(/i,
    /\bapp\.(get|post|put|patch|delete|listen)\s*\(/i,
    /\brouter\.(get|post|put|patch|delete)\s*\(/i,
    /\bcreateServer\s*\(/i,
    /\bmongoose\b/i,
    /\bprisma\b/i,
    /\bpostgres\b/i,
    /\bmongodb\b/i,
    /\bmysql\b/i,
    /\bsequelize\b/i,
    /\bknex\b/i,
    /\bjsonwebtoken\b/i,
    /\bjwt\b/i,
    /\bbcrypt\b/i,
    /\bnextauth\b/i,
    /\bapi route\b/i,
    /\bserver action\b/i,
    /\buse server\b/i,
    /\bfrom node:/i,
    /\bdockerfile\b/i,
    /\bdocker-compose\b/i,
    /\bprocess\.env\b/i,
  ];

  const forbiddenPaths = [
    /\[FILE:\s*\.?env/i,
    /\/\/ FILE:\s*\.?env/i,
    /\[FILE:\s*dockerfile/i,
    /\/\/ FILE:\s*dockerfile/i,
    /\[FILE:\s*docker-compose/i,
    /\/\/ FILE:\s*docker-compose/i,
    /\[FILE:\s*prisma\//i,
    /\/\/ FILE:\s*prisma\//i,
    /\[FILE:\s*server\./i,
    /\/\/ FILE:\s*server\./i,
    /\[FILE:\s*src\/server/i,
    /\/\/ FILE:\s*src\/server/i,
    /\[FILE:\s*src\/pages\/api\//i,
    /\/\/ FILE:\s*src\/pages\/api\//i,
    /\[FILE:\s*src\/app\/api\//i,
    /\/\/ FILE:\s*src\/app\/api\//i,
    /\[FILE:\s*app\/api\//i,
    /\/\/ FILE:\s*app\/api\//i,
    /\[FILE:\s*api\//i,
    /\/\/ FILE:\s*api\//i,
  ];

  return ![...forbiddenPatterns, ...forbiddenPaths].some((pattern) =>
    pattern.test(lower)
  );
}

export interface ParsedProject {
  files: Record<string, string>;
  entryPath: string;
  projectType: "react" | "nextjs" | "html";
}

export function parseProjectResponse(text: string): ParsedProject {
  const files: Record<string, string> = {};
  
  const cleanContent = (code: string) => {
    let cleaned = code.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\n/, "");
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return cleaned.trim();
  };

  const isAllowedPath = (path: string): boolean => {
    const normalized = path.replace(/\\/g, "/").replace(/^\.?\//, "");
    if (!normalized || normalized.includes("..")) return false;
    if (/^\.?env/i.test(normalized)) return false;
    if (/^(dockerfile|docker-compose|prisma|server\.|api\/)/i.test(normalized)) {
      return false;
    }
    if (/^(src\/)?(app|pages)\/api\//i.test(normalized)) return false;
    if (/^(src\/)?server\//i.test(normalized)) return false;
    return /\.(tsx|ts|jsx|js|css|html|json|mjs|cjs|svg|png|jpg|jpeg|webp|gif|ico|txt|md)$/i.test(
      normalized
    );
  };

  const fileRegex = /\[FILE:\s*([^\s\]]+)\]([\s\S]*?)(?:\[END_FILE\]|$)/g;
  let match;
  while ((match = fileRegex.exec(text)) !== null) {
    const path = match[1].replace(/\\/g, "/").replace(/^\.?\//, "");
    const content = match[2];
    if (isAllowedPath(path)) {
      files[path] = cleanContent(content);
    }
  }

  const entryMatch = text.match(/\[ENTRY_PATH:\s*([^\s\]]+)\]/);
  const requestedEntryPath = entryMatch
    ? entryMatch[1].trim().replace(/\\/g, "/").replace(/^\.?\//, "")
    : "";
  const entryPath =
    requestedEntryPath && files[requestedEntryPath]
      ? requestedEntryPath
      : files["src/app/page.tsx"]
        ? "src/app/page.tsx"
        : files["src/App.tsx"]
          ? "src/App.tsx"
          : files["index.html"]
            ? "index.html"
            : Object.keys(files)[0] || "src/app/page.tsx";

  const typeMatch = text.match(/\[PROJECT_TYPE:\s*([^\s\]]+)\]/);
  const parsedProjectType = typeMatch ? typeMatch[1].trim().toLowerCase() : "";
  const projectType = (
    parsedProjectType === "react" ||
    parsedProjectType === "nextjs" ||
    parsedProjectType === "html"
      ? parsedProjectType
      : entryPath.includes("app/") || entryPath.includes("pages/")
        ? "nextjs"
        : entryPath.endsWith(".html")
          ? "html"
          : "react"
  ) as "react" | "nextjs" | "html";

  // Fallback for legacy single-file code blocks
  if (Object.keys(files).length === 0) {
    const reactMatch = text.match(/```(?:tsx|jsx|javascript|react)\s*([\s\S]*?)```/) || text.match(/```js\s*([\s\S]*?)```/);
    const htmlMatch = text.match(/```html\s*([\s\S]*?)```/);
    const cssMatch = text.match(/```css\s*([\s\S]*?)```/);
    const jsMatch = text.match(/```javascript\s*([\s\S]*?)```/) || text.match(/```js\s*([\s\S]*?)```/);

    if (reactMatch) {
      files["src/App.tsx"] = cleanContent(reactMatch[1]);
      if (cssMatch) files["src/index.css"] = cleanContent(cssMatch[1]);
      return {
        files,
        entryPath: "src/App.tsx",
        projectType: "react"
      };
    } else if (htmlMatch) {
      files["index.html"] = cleanContent(htmlMatch[1]);
      if (cssMatch) files["style.css"] = cleanContent(cssMatch[1]);
      if (jsMatch) files["script.js"] = cleanContent(jsMatch[1]);
      return {
        files,
        entryPath: "index.html",
        projectType: "html"
      };
    }
  }

  return { files, entryPath, projectType };
}
