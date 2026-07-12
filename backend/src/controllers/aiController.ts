import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { ProviderFactory } from "../providers/providerFactory";
import { db } from "../config/db";
import {
  buildFallbackHtmlProject,
  enhanceUserPrompt,
  validateAIResponse,
} from "../services/promptService";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { logger } from "../logger";
import { ProviderError } from "../providers/errors";
import { AIProviderResponse, ChatMessage } from "../providers/types";

function providerDiagnostics(providerInstance: unknown) {
  const inst = providerInstance as {
    getActiveModel?: () => string;
    getKeySlot?: () => string;
    getProviderName?: () => string;
  };
  return {
    model: inst.getActiveModel?.(),
    keySlot: inst.getKeySlot?.(),
    providerName: inst.getProviderName?.(),
  };
}

function writeSseError(
  res: Response,
  error: unknown,
  provider: string
): void {
  const payload =
    error instanceof ProviderError
      ? error.toJSON()
      : {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          code: (error as any)?.code || "GENERATION_ERROR",
          provider,
        };
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
}

interface ProviderFailurePayload {
  success: false;
  error: string;
  code: string;
  provider: string;
  statusCode?: number;
  retryable: boolean;
}

function providerFailurePayload(error: unknown, provider: string): ProviderFailurePayload {
  if (error instanceof ProviderError) {
    return {
      ...error.toJSON(),
      success: false,
    };
  }
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown provider error",
    code: (error as any)?.code || "GENERATION_ERROR",
    provider,
    retryable: false,
  };
}

function writeFallbackProject(
  res: Response,
  prompt: string,
  reason: string,
  provider?: string,
  error?: unknown
): void {
  const fallback = buildFallbackHtmlProject(prompt);
  res.write(
    `data: ${JSON.stringify({
      ...fallback,
      react: fallback.files[fallback.entryPath],
      fallback: true,
      reason,
      provider,
      providerError: provider ? providerFailurePayload(error ?? new Error(reason), provider) : undefined,
    })}\n\n`
  );
}

function startSse(res: Response): void {
  if (res.headersSent) return;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
}

export class AIController {
  static listProviders(_req: Request, res: Response) {
    const providers = ProviderFactory.listConfiguredProviders();
    const defaultProvider = ProviderFactory.resolveProviderName();
    sendSuccess(res, { providers, defaultProvider });
  }

  static async verify(req: Request, res: Response) {
    const requestedProvider =
      typeof req.query.provider === "string" ? req.query.provider : undefined;
    const model = typeof req.query.model === "string" ? req.query.model : undefined;
    const activeProviderName = ProviderFactory.resolveProviderName(requestedProvider);

    if (!activeProviderName) {
      res.status(400).json({
        success: false,
        error: "No configured AI provider is available for verification.",
        code: "PROVIDER_CONFIG_ERROR",
      });
      return;
    }

    const initResult = ProviderFactory.tryGetProvider(activeProviderName, { model });
    if ("error" in initResult) {
      res.status(400).json(initResult.error.toJSON());
      return;
    }

    const providerInstance = initResult.provider;
    const diag = providerDiagnostics(providerInstance);
    const abortController = new AbortController();
    const startedAt = Date.now();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, Math.min(env.AI_REQUEST_TIMEOUT_MS, 30000));

    try {
      const response = await providerInstance.chat(
        [
          {
            role: "user",
            content: "Reply with exactly OK to verify provider connectivity.",
          },
        ],
        abortController.signal
      );

      if (!response.text.trim()) {
        throw new ProviderError(
          `[${activeProviderName}] Verification returned an empty response.`,
          {
            code: "PROVIDER_ERROR",
            provider: activeProviderName,
            retryable: true,
          }
        );
      }

      const durationMs = Date.now() - startedAt;
      logger.info(
        {
          event: "ai_provider_verify_success",
          provider: activeProviderName,
          model: diag.model,
          durationMs,
        },
        "AI provider verification succeeded"
      );

      sendSuccess(res, {
        connected: true,
        provider: activeProviderName,
        model: diag.model,
        durationMs,
        responsePreview: response.text.slice(0, 80),
      });
    } catch (error) {
      const normalizedError =
        abortController.signal.aborted
          ? new ProviderError(
              `[${activeProviderName}] Verification timed out after ${Math.min(
                env.AI_REQUEST_TIMEOUT_MS,
                30000
              )}ms.`,
              {
                code: "TIMEOUT",
                provider: activeProviderName,
                retryable: true,
              }
            )
          : error;
      const payload = providerFailurePayload(normalizedError, activeProviderName);
      logger.error(
        {
          event: "ai_provider_verify_failure",
          provider: activeProviderName,
          model: diag.model,
          durationMs: Date.now() - startedAt,
          error: payload.error,
          code: payload.code,
        },
        `AI provider verification failed: ${payload.error}`
      );
      res.status(payload.statusCode || 500).json(payload);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async generate(req: Request, res: Response, _next: NextFunction) {
    const { prompt, projectId, provider: clientProvider, model } = req.body;
    const userId = (req as any).userId;
    const promptText = String(prompt || "").trim() || "Create a modern responsive frontend interface.";

    const activeProviderName =
      clientProvider?.trim().toLowerCase() ||
      ProviderFactory.resolveProviderName();

    if (!activeProviderName) {
      startSse(res);
      writeFallbackProject(
        res,
        promptText,
        "No configured provider was available, so a standalone index.html fallback was generated."
      );
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const initResult = ProviderFactory.tryGetProvider(activeProviderName, { model });
    if ("error" in initResult) {
      startSse(res);
      writeFallbackProject(
        res,
        promptText,
        initResult.error.message,
        activeProviderName,
        initResult.error
      );
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }
    const providerInstance = initResult.provider;

    startSse(res);

    const abortController = new AbortController();
    let clientClosed = false;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      abortController.abort();
    }, env.AI_REQUEST_TIMEOUT_MS);
    const handleClientClose = () => {
      if (!res.writableEnded) {
        clientClosed = true;
        abortController.abort();
      }
    };
    req.on("close", handleClientClose);

    const enhancedPrompt = enhanceUserPrompt(promptText);
    const startTime = Date.now();
    let finalResponseCode = "";
    let accumulatedTextForValidation = "";
    let finalProject: AIProviderResponse = {};

    try {
      await providerInstance.streamGenerate(
        enhancedPrompt,
        (chunk) => {
          finalProject = { ...finalProject, ...chunk };
          if (chunk.react) finalResponseCode = chunk.react;
          if (chunk.files) {
            accumulatedTextForValidation = Object.entries(chunk.files)
              .map(([path, content]) => `// FILE: ${path}\n${content}`)
              .join("\n");
          } else if (chunk.react) {
            accumulatedTextForValidation = chunk.react;
          }
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
        abortController.signal
      );

      const isValid = validateAIResponse(
        accumulatedTextForValidation || finalResponseCode
      );
      const hasCompleteProject =
        finalProject.files &&
        Object.keys(finalProject.files).length > 0 &&
        finalProject.entryPath &&
        Boolean(finalProject.files[finalProject.entryPath]);

      if (!isValid || !hasCompleteProject) {
        writeFallbackProject(
          res,
          promptText,
          !isValid
            ? "Generated code violated frontend-only safety policies, so a standalone index.html fallback was generated."
            : "AI provider did not return a complete frontend project, so a standalone index.html fallback was generated.",
          activeProviderName
        );
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      const durationMs = Date.now() - startTime;
      const diag = providerDiagnostics(providerInstance);

      logger.info(
        {
          event: "ai_generation_success",
          provider: activeProviderName,
          model: diag.model,
          keySlot: diag.keySlot,
          durationMs,
        },
        `AI generation completed in ${durationMs}ms`
      );

      if (userId) {
        try {
          if (projectId) {
            const count = await db.projectVersion.count({ where: { projectId } });
            await db.project.update({
              where: { id: projectId },
              data: {
                prompt: promptText,
                code: finalResponseCode,
                aiProvider: activeProviderName,
              },
            });
            await db.projectVersion.create({
              data: {
                projectId,
                version: count + 1,
                prompt: promptText,
                code: finalResponseCode,
                aiProvider: activeProviderName,
              },
            });
          }
          await db.generation.create({
            data: {
              userId,
              projectId: projectId || null,
              provider: activeProviderName,
              durationMs,
              status: "SUCCESS",
            },
          });
          await db.promptHistory.create({
            data: {
              userId,
              projectId: projectId || null,
              prompt: promptText,
            },
          });
        } catch (dbError) {
          console.warn("[AIController] Database tracking failed:", dbError);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      if (clientClosed) {
        res.end();
        return;
      }
      const normalizedError =
        timedOut
          ? new ProviderError(
              `[${activeProviderName}] Generation timed out after ${env.AI_REQUEST_TIMEOUT_MS}ms.`,
              {
                code: "TIMEOUT",
                provider: activeProviderName,
                retryable: true,
              }
            )
          : error;
      const durationMs = Date.now() - startTime;
      const diag = providerDiagnostics(providerInstance);
      const payload = providerFailurePayload(normalizedError, activeProviderName);
      logger.error(
        {
          event: "ai_generation_failure",
          provider: activeProviderName,
          model: diag.model,
          keySlot: diag.keySlot,
          durationMs,
          error: payload.error,
          code: payload.code,
          statusCode: payload.statusCode,
          retryable: payload.retryable,
        },
        `AI generation failed after ${durationMs}ms: ${payload.error}`
      );
      writeFallbackProject(
        res,
        promptText,
        payload.error ||
          "Provider generation failed, so a standalone index.html fallback was generated.",
        activeProviderName,
        normalizedError
      );
      res.write("data: [DONE]\n\n");
      res.end();
    } finally {
      clearTimeout(timeoutId);
      req.off("close", handleClientClose);
    }
  }

  static async improve(req: Request, res: Response) {
    const { prompt } = req.body;
    if (!prompt || !String(prompt).trim()) {
      res.status(400).json({
        success: false,
        error: "Prompt is required",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    try {
      const improved = enhanceUserPrompt(prompt);
      sendSuccess(res, { prompt: improved });
    } catch (err: any) {
      sendError(res, err?.message || "Failed to improve prompt", "AI_IMPROVE_FAILED");
    }
  }

  static async chat(req: Request, res: Response) {
    const {
      message,
      contextCode,
      history,
      provider: clientProvider,
      model,
    } = req.body;

    if (!message || !String(message).trim()) {
      res.status(400).json({
        success: false,
        error: "Message is required",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    const activeProviderName =
      clientProvider?.trim().toLowerCase() ||
      ProviderFactory.resolveProviderName();

    if (!activeProviderName) {
      res.status(400).json({
        success: false,
        error: "No AI provider configured for chat.",
        code: "PROVIDER_CONFIG_ERROR",
        hint: "GET /api/ai/providers lists configured providers",
      });
      return;
    }

    const initResult = ProviderFactory.tryGetProvider(activeProviderName, { model });
    if ("error" in initResult) {
      res.status(400).json(initResult.error.toJSON());
      return;
    }
    const providerInstance = initResult.provider;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const abortController = new AbortController();
    req.on("close", () => abortController.abort());

    const messages: ChatMessage[] = [
      ...(Array.isArray(history)
        ? history.map((m: { role: string; content: string }) => ({
            role: m.role as ChatMessage["role"],
            content: m.content,
          }))
        : []),
      {
        role: "user",
        content: contextCode
          ? `Active code context:\n\`\`\`tsx\n${contextCode}\n\`\`\`\n\n${message}`
          : message,
      },
    ];

    const startTime = Date.now();

    try {
      await providerInstance.streamChat(
        messages,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ text: chunk.text || "" })}\n\n`);
        },
        abortController.signal
      );

      const durationMs = Date.now() - startTime;
      const diag = providerDiagnostics(providerInstance);
      logger.info(
        {
          event: "ai_chat_success",
          provider: activeProviderName,
          model: diag.model,
          durationMs,
        },
        `AI chat completed in ${durationMs}ms`
      );

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      if (abortController.signal.aborted) {
        res.end();
        return;
      }
      const durationMs = Date.now() - startTime;
      logger.error(
        {
          event: "ai_chat_failure",
          provider: activeProviderName,
          durationMs,
          error: error?.message,
        },
        `AI chat failed after ${durationMs}ms`
      );
      writeSseError(res, error, activeProviderName);
    }
  }
}
