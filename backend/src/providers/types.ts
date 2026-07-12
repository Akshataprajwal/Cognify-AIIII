export interface AIProviderResponse {
  react?: string;
  html?: string;
  css?: string;
  js?: string;
  ts?: string;
  files?: Record<string, string>;
  entryPath?: string;
  projectType?: "react" | "nextjs" | "html";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  text: string;
}

export interface ProviderOptions {
  model?: string;
}

export interface AIProvider {
  /** Non-streaming code generation */
  generate(prompt: string, signal?: AbortSignal): Promise<AIProviderResponse>;

  /** Streaming code generation (primary generation path) */
  streamGenerate(
    prompt: string,
    onChunk: (chunk: Partial<AIProviderResponse>) => void,
    signal?: AbortSignal
  ): Promise<void>;

  /** Non-streaming chat */
  chat(messages: ChatMessage[], signal?: AbortSignal): Promise<ChatResponse>;

  /** Streaming chat */
  streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: Partial<ChatResponse>) => void,
    signal?: AbortSignal
  ): Promise<void>;

  /** @deprecated Use streamGenerate — kept for backward compatibility */
  generateStream?(
    prompt: string,
    onChunk: (chunk: Partial<AIProviderResponse>) => void,
    signal?: AbortSignal
  ): Promise<void>;
}

export interface ProviderDefinition {
  id: string;
  name: string;
  description: string;
  envKey: string;
  freeTier: boolean;
  defaultModel: string;
  models: string[];
}

export interface ConfiguredProviderInfo {
  id: string;
  name: string;
  configured: boolean;
  freeTier: boolean;
  defaultModel: string;
  models: string[];
}
