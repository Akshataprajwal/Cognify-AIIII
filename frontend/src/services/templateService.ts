import { GeneratedCode } from "@/store/projectStore";

export interface StarterTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt: string;
  tags: string[];
  gradient: string;
  code: GeneratedCode;
}

export const starterTemplates: StarterTemplate[] = [
  {
    id: "saas-landing",
    name: "SaaS Landing Page",
    category: "landing",
    description: "Modern SaaS landing page with animated gradients, pricing, and FAQ sections.",
    prompt: "Create a modern SaaS landing page with a hero, interactive pricing switcher, FAQ, and footer using React and Tailwind CSS.",
    tags: ["SaaS", "Landing", "Marketing"],
    gradient: "from-indigo-600/20 via-violet-600/10 to-transparent",
    code: {
      react: `"use client";

import React, { useState } from "react";
import { Sparkles, Check, ChevronDown, ArrowRight, Zap, Play, Star, Shield } from "lucide-react";

export default function SaaSClientLanding() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activeFaq, setActiveFaq] = useState(null);

  const plans = [
    {
      name: "Starter",
      price: billingCycle === "monthly" ? "$9" : "$7",
      period: "/mo",
      desc: "Perfect for builders starting their journey.",
      features: ["100 generations per month", "Standard generation speed", "Community templates", "Discord support"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? "$29" : "$22",
      period: "/mo",
      desc: "Ideal for power users and design agencies.",
      features: ["Unlimited generations", "2x faster generation", "Advanced React export", "Priority live support", "Custom templates"],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      name: "Team",
      price: billingCycle === "monthly" ? "$79" : "$59",
      period: "/mo",
      desc: "Perfect for scaling startups and enterprise teams.",
      features: ["Everything in Pro", "Collaborative workspace", "Shared design systems", "SLA contract & custom terms", "Dedicated manager"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    { q: "How does the AI generate frontend code?", a: "Cognify AI analyzes your prompts and converts them to modular, styled React components and static HTML using our custom-tuned LLMs." },
    { q: "Can I export code to other framework libraries?", a: "Yes, you can copy React component files directly, export static HTML/CSS files, or download complete ZIP archives ready to run." },
    { q: "What is your refund policy?", a: "We offer a 14-day money-back guarantee for all new subscriptions if you are not fully satisfied." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-400 fill-indigo-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Cognify</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <button className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2 text-sm font-semibold transition-all">
          Launch App
        </button>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-16 text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" /> Next Gen AI Design Engine
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Ship UI Components <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            10x Faster
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Write prompt commands, get premium UI layouts instantly, edit code, and preview designs in real time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-4 font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </button>
          <button className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white px-7 py-4 font-bold transition-all flex items-center justify-center gap-2">
            <Play className="h-4 w-4 fill-white text-transparent" /> Watch Demo
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-slate-900/20 border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-sm">Cancel or switch your subscription plans at any time.</p>

            {/* Switch */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-full mt-4 text-xs font-semibold">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className={\`px-4 py-2 rounded-full transition-all \${billingCycle === "monthly" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}\`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle("yearly")}
                className={\`px-4 py-2 rounded-full transition-all \${billingCycle === "yearly" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}\`}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {plans.map((p, idx) => (
              <div 
                key={idx} 
                className={\`relative rounded-3xl p-8 border backdrop-blur-md flex flex-col justify-between transition-all hover:scale-[1.02] \${
                  p.popular 
                    ? "bg-indigo-950/20 border-indigo-500/40 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/20" 
                    : "bg-slate-900/40 border-white/5"
                }\`}
              >
                {p.popular && (
                  <span className="absolute right-4 top-4 bg-indigo-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-2">{p.desc}</p>
                  <div className="my-6">
                    <span className="text-4xl font-extrabold text-white">{p.price}</span>
                    <span className="text-slate-400 text-sm"> {p.period}</span>
                  </div>
                  <ul className="space-y-3.5 border-t border-white/5 pt-6 text-xs text-slate-350">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-indigo-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className={\`w-full rounded-2xl py-3.5 font-bold mt-8 transition-all \${
                  p.popular 
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }\`}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 space-y-12">
        <h2 className="text-3xl font-extrabold text-center text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div 
                key={i} 
                className="rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden"
              >
                <button 
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={\`h-4 w-4 text-slate-400 transition-transform \${isOpen ? "rotate-180" : ""}\`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/[0.02]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
`,
      html: `<!-- SaaS Landing Page -->`,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "admin-dashboard",
    name: "Admin Dashboard",
    category: "dashboard",
    description: "Robust analytics dashboard with sidebar navigation, stats grid, and data tables.",
    prompt: "Create an admin analytics dashboard with a stats panel, user table list, active server metrics, and responsive sidebar navigation.",
    tags: ["Dashboard", "Admin", "Analytics"],
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    code: {
      react: `"use client";

import React, { useState } from "react";
import { Users, BarChart3, TrendingUp, DollarSign, Search, Shield, Ban, MoreHorizontal, CheckCircle2 } from "lucide-react";

export default function AnalyticsDashboard() {
  const stats = [
    { label: "Total Users", value: "24,892", change: "+12% this month", icon: Users },
    { label: "Total Generations", value: "1,209,400", change: "+24% today", icon: CheckCircle2 },
    { label: "MRR", value: "$45,290", change: "+8% MoM", icon: DollarSign },
    { label: "Performance", value: "99.98%", change: "Healthy Gateway", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col justify-between shrink-0 p-5 hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span className="font-bold text-lg">Admin Pro</span>
          </div>
          <nav className="space-y-1 text-sm">
            <a href="#" className="flex items-center gap-3 bg-indigo-500/10 text-indigo-400 rounded-xl px-3 py-2.5 font-medium">Dashboard</a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/[0.02] rounded-xl px-3 py-2.5 transition-colors">Users</a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/[0.02] rounded-xl px-3 py-2.5 transition-colors">Analytics</a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/[0.02] rounded-xl px-3 py-2.5 transition-colors">Settings</a>
          </nav>
        </div>
        <div className="text-[10px] text-slate-500">v1.2.0 build beta</div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Platform overview and user activity metrics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{s.label}</span>
                <s.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.change}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "portfolio",
    name: "Developer Portfolio",
    category: "landing",
    description: "Clean responsive developer portfolio with bio, skills, and projects gallery.",
    prompt: "Create a modern, clean developer portfolio showcasing coding projects, programming skills, bio, and contact information.",
    tags: ["Portfolio", "Creative", "Profile"],
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    code: {
      react: `"use client";

import React from "react";
import { ArrowRight, Code, Cpu, ExternalLink, Github, Globe, Linkedin, Mail, Sparkles } from "lucide-react";

export default function MinimalPortfolio() {
  const projects = [
    {
      title: "Omni-SaaS Platform",
      desc: "AI-driven automated dashboard layout application using Next.js & Tailwind CSS.",
      tech: ["Next.js", "React", "Tailwind", "AI"],
      link: "#"
    },
    {
      title: "Decentralized Chat",
      desc: "Web3 messaging system styled with high fidelity dark mode design standards.",
      tech: ["TypeScript", "Solidity", "Tailwind"],
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8 max-w-5xl mx-auto space-y-16">
      {/* Intro */}
      <section className="space-y-6 pt-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <Sparkles className="h-3 w-3" /> Open to Opportunities
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight">
          Hi, I am <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Alex Johnson</span>.
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
          A software engineer passionate about crafting accessible, high-performance web applications and beautiful modern user experiences.
        </p>
        <div className="flex gap-4">
          <button className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 font-bold transition-all flex items-center gap-1.5 text-sm">
            Contact Me <Mail className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <a href="#" className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"><Github className="h-4 w-4" /></a>
            <a href="#" className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Featured Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map((p, idx) => (
            <div key={idx} className="bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl p-6 flex flex-col justify-between transition-all">
              <div>
                <h3 className="font-bold text-lg">{p.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t, i) => (
                    <span key={i} className="text-[10px] bg-white/5 text-slate-450 px-2 py-0.5 rounded-md border border-white/5">{t}</span>
                  ))}
                </div>
                <a href={p.link} className="flex items-center gap-1 text-xs text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                  View Project <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "ecommerce",
    name: "E-commerce Store",
    category: "ecommerce",
    description: "Product details layout page with selector grids, add-to-cart controls, and review tags.",
    prompt: "Create an e-commerce product details layout featuring product image showcases, rating metrics, size selector cards, and user reviews.",
    tags: ["E-commerce", "Store", "Shop"],
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    code: {
      react: `"use client";

import React, { useState } from "react";
import { Star, ShoppingCart, Heart, Shield, RefreshCcw, ArrowRight } from "lucide-react";

export default function ProductDetail() {
  const [selectedSize, setSelectedSize] = useState("M");
  const [cartCount, setCartCount] = useState(0);

  const product = {
    name: "Premium AeroTech Sneakers",
    price: "$149.99",
    rating: 4.8,
    reviews: 124,
    sizes: ["S", "M", "L", "XL"]
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-900 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
        {/* Left: Image Placeholder */}
        <div className="aspect-square bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center text-slate-650 relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-indigo-500 text-xs font-bold px-2.5 py-1 rounded-full">New Arrival</div>
          <span className="text-sm italic text-slate-500">Sneaker Image Showcase</span>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="text-sm font-bold">{product.rating}</span>
              </div>
              <span className="text-slate-500 text-xs">({product.reviews} reviews)</span>
            </div>
            <p className="text-2xl font-bold text-indigo-400">{product.price}</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Breathable engineered mesh upper with dynamic Flywire lockdown systems. Responsive Zoom-Air core unit for absolute comfort.
            </p>

            {/* Size Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Select Size</span>
              <div className="flex gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={\`h-10 w-12 rounded-xl border text-sm font-semibold transition-all \${
                      selectedSize === s 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow" 
                        : "border-white/5 bg-white/5 text-slate-350 hover:bg-white/10"
                    }\`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button 
              onClick={() => setCartCount(c => c + 1)}
              className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3.5 font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart ({cartCount})
            </button>
            <button className="p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "restaurant",
    name: "Gourmet Bistro",
    category: "landing",
    description: "Premium restaurant landing page featuring interactive food menu items and booking options.",
    prompt: "Create a luxury restaurant landing page featuring menu filters, dietary tags, chef bios, and reservation CTAs.",
    tags: ["Restaurant", "Food", "Menu"],
    gradient: "from-rose-500/20 via-red-500/10 to-transparent",
    code: {
      react: `"use client";

import React, { useState } from "react";
import { Star, Clock, UtensilsCrossed, Calendar } from "lucide-react";

export default function RestaurantMenu() {
  const [filter, setFilter] = useState("all");

  const menu = [
    { id: 1, name: "Truffle Ribeye", cat: "mains", price: "$42", desc: "Aged USDA prime ribeye with fresh black truffle butter." },
    { id: 2, name: "Calabrian Calamari", cat: "starters", price: "$16", desc: "Crisp squid tossed with hot honey and Calabrian peppers." },
    { id: 3, name: "Vanilla Crème Brûlée", cat: "desserts", price: "$12", desc: "Classic rich custard topped with caramelized sugar." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-4">
        <UtensilsCrossed className="h-6 w-6 text-rose-500 mx-auto" />
        <h1 className="text-4xl font-extrabold">L'Étoile Gourmet</h1>
        <p className="text-sm text-slate-400 leading-relaxed">Artisanal modern dishes crafted with sustainable, fresh local produce.</p>
      </div>

      {/* Menu controls */}
      <div className="flex justify-center gap-2 text-xs">
        {["all", "starters", "mains", "desserts"].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={\`px-4 py-2 rounded-full border transition-all capitalize \${
              filter === c 
                ? "bg-rose-600 border-rose-500 text-white" 
                : "border-white/5 bg-white/5 text-slate-400 hover:text-white"
            }\`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {menu
          .filter(m => filter === "all" || m.cat === filter)
          .map((m) => (
            <div key={m.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg">{m.name}</h3>
                  <span className="text-rose-400 font-bold">{m.price}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 15-20 mins</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" /> 4.9 Rating</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "healthcare",
    name: "Apex Healthcare",
    category: "landing",
    description: "Modern patient portal layout featuring appointment booking filters and practitioner directories.",
    prompt: "Create a medical patient dashboard featuring doctor booking directories, health statistics, and upcoming appointment cards.",
    tags: ["Healthcare", "Medical", "Portal"],
    gradient: "from-blue-500/20 via-sky-500/10 to-transparent",
    code: {
      react: `"use client";

import React, { useState } from "react";
import { Heart, Activity, Calendar, ShieldAlert } from "lucide-react";

export default function HealthcarePortal() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Health Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Monitor vitals and schedule doctor appointments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Activity className="h-5 w-5 animate-pulse" />
            <h2 className="text-sm font-semibold">Vital Records</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-450">Heart Rate</span><span className="font-bold">72 BPM</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-450">Blood Pressure</span><span className="font-bold">120/80</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-450">Blood Oxygen</span><span className="font-bold">98%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "education",
    name: "EduLearn Academy",
    category: "landing",
    description: "Online learning platform interface featuring course listings, status meters, and syllabus panels.",
    prompt: "Create an online academy landing page featuring course lists, progress counters, video players, and rating chips.",
    tags: ["Education", "Courses", "LMS"],
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    code: {
      react: `"use client";

import React from "react";
import { BookOpen, GraduationCap, PlayCircle, Star } from "lucide-react";

export default function EduLearn() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <h1 className="text-3xl font-extrabold">Online Courses</h1>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "travel",
    name: "Roamify Travels",
    category: "landing",
    description: "A comprehensive travel booking workspace containing destination cards, maps, and filters.",
    prompt: "Create a modern travel booking landing page featuring hero destination filters, price listings, rating indicators, and secure payments.",
    tags: ["Travel", "Hotels", "Search"],
    gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
    code: {
      react: `"use client";

import React, { useState } from "react";
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Heart, Shield, Compass, Sparkles } from "lucide-react";

export default function TravelBooking() {
  const [destination, setDestination] = useState("");
  const [favorites, setFavorites] = useState([]);

  const destinations = [
    {
      id: 1,
      name: "Santorini, Greece",
      price: "$1,299",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop&q=80",
      tag: "Relax",
    },
    {
      id: 2,
      name: "Kyoto, Japan",
      price: "$1,450",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80",
      tag: "Culture",
    }
  ];

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <h1 className="text-3xl font-extrabold">Find Your Next Adventure</h1>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "finance",
    name: "Apex Finance",
    category: "dashboard",
    description: "Finance platform with transaction charts, wallet balances, and invoice histories.",
    prompt: "Create a finance platform dashboard featuring bank card visuals, cash balances, transaction logs, and MRR charts.",
    tags: ["Finance", "Wallet", "Banking"],
    gradient: "from-pink-500/20 via-rose-500/10 to-transparent",
    code: {
      react: `"use client";

import React from "react";
import { CreditCard, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export default function FinanceDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <h1 className="text-3xl font-extrabold">Apex Wallet</h1>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  },
  {
    id: "blog",
    name: "Minimal Blog",
    category: "blog",
    description: "A clean markdown-inspired blog layout featuring posts list and read timers.",
    prompt: "Create a minimalist content blog page featuring editorial layouts, search tags, and articles list.",
    tags: ["Blog", "Content", "SEO"],
    gradient: "from-slate-500/20 via-gray-500/10 to-transparent",
    code: {
      react: `"use client";

import React from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export default function EditorialBlog() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <h1 className="text-3xl font-extrabold">Developer Insights</h1>
    </div>
  );
}
`,
      html: ``,
      css: ``,
      js: ``,
      ts: ``
    }
  }
];

export const templateService = {
  getAll: () => starterTemplates,
  getById: (id: string) => starterTemplates.find(t => t.id === id),
  getTemplateCode: (id: string) => starterTemplates.find(t => t.id === id)?.code
};
