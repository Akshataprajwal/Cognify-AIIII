"use client";

import React, { useEffect, useState } from "react";
import { Cpu, ChevronDown, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/api";
import {
  FALLBACK_PROVIDERS,
  getStoredModel,
  getStoredProvider,
  ProviderInfo,
  setStoredModel,
  setStoredProvider,
} from "@/lib/providerConfig";

interface ProviderSelectorProps {
  compact?: boolean;
  onChange?: (provider: string, model: string) => void;
}

export function ProviderSelector({ compact = false, onChange }: ProviderSelectorProps) {
  const [providers, setProviders] = useState<ProviderInfo[]>(FALLBACK_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-2.5-flash");

  useEffect(() => {
    const storedProvider = getStoredProvider();
    if (storedProvider) {
      setProvider(storedProvider);
      setModel(getStoredModel(storedProvider));
    }
  }, []);

  useEffect(() => {
    if (!API_BASE) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/ai/providers`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.providers?.length) {
          const serverProviders = data.data.providers as ProviderInfo[];
          setProviders(serverProviders);
          const defaultId = data.data.defaultProvider;
          const storedProvider = getStoredProvider();
          const storedIsConfigured = serverProviders.some((p) => p.id === storedProvider);
          const nextProvider =
            defaultId && (!storedProvider || !storedIsConfigured)
              ? defaultId
              : storedProvider;
          const def =
            serverProviders.find((p) => p.id === nextProvider) ||
            serverProviders.find((p) => p.id === defaultId) ||
            serverProviders[0];
          if (def) {
            const storedModel = getStoredModel(def.id);
            const nextModel = def.models.includes(storedModel)
              ? storedModel
              : def.defaultModel;
            setProvider(def.id);
            setModel(nextModel);
            setStoredProvider(def.id, nextModel);
          }
        }
      })
      .catch(() => {
        // Use static fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const activeDef =
    providers.find((p) => p.id === provider) ??
    FALLBACK_PROVIDERS.find((p) => p.id === provider);

  const models = activeDef?.models ?? [model];

  const handleProviderChange = (nextProvider: string) => {
    const def = providers.find((p) => p.id === nextProvider);
    const nextModel = def?.defaultModel ?? "";
    setProvider(nextProvider);
    setModel(nextModel);
    setStoredProvider(nextProvider, nextModel);
    onChange?.(nextProvider, nextModel);
  };

  const handleModelChange = (nextModel: string) => {
    setModel(nextModel);
    setStoredModel(nextModel);
    onChange?.(provider, nextModel);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Cpu className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1 text-[11px] text-white/80 outline-none focus:border-indigo-500/50 max-w-[120px]"
          aria-label="AI provider"
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}{p.freeTier ? " ★" : ""}
            </option>
          ))}
          {providers.length === 0 && <option value="">No configured providers</option>}
        </select>
        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={loading || models.length <= 1}
          className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1 text-[11px] text-white/80 outline-none focus:border-indigo-500/50 max-w-[160px]"
          aria-label="AI model"
        >
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-white/30" />}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Cpu className="h-4 w-4 text-indigo-400" />
        <span className="text-xs font-semibold text-white/80">AI Provider</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-white/30 ml-auto" />}
      </div>

      <div className="relative">
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 pr-8 text-xs text-white/80 outline-none focus:border-indigo-500/50"
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.freeTier ? "(Free tier)" : ""}
            </option>
          ))}
          {providers.length === 0 && <option value="">No configured providers</option>}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
      </div>

      <div className="relative">
        <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={models.length <= 1}
          className="w-full appearance-none rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 pr-8 text-xs text-white/80 outline-none focus:border-indigo-500/50 disabled:opacity-50"
        >
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 bottom-2.5 h-3.5 w-3.5 text-white/30" />
      </div>

      {activeDef && !activeDef.configured && (
        <p className="text-[10px] text-amber-400/80 leading-snug">
          This provider is not configured on the server. Add its API key to{" "}
          <code className="text-amber-300">backend/.env</code> and restart the backend.
        </p>
      )}
    </div>
  );
}
