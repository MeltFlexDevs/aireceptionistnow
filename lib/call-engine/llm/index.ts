import { getEnv } from "../env";
import { runClaudeTurn } from "./claude";
import { runGeminiTurn } from "./gemini";
import type { LlmProvider } from "./types";

// Picks the LLM brain. Gemini is the default (understands the caller from the
// transcript and generates the response); Claude is the alternate. The choice
// comes from LLM_PROVIDER, overridable per number via routing.llmProvider so a
// single deployment can A/B brains or pin a number to one.

export type LlmProviderName = "gemini" | "claude";

export interface SelectedLlm {
  provider: LlmProvider;
  model: string;
}

export function selectLlm(name?: string): SelectedLlm {
  const env = getEnv();
  const which = (name ?? env.LLM_PROVIDER) as LlmProviderName;
  if (which === "claude") return { provider: runClaudeTurn, model: env.CLAUDE_MODEL };
  return { provider: runGeminiTurn, model: env.GEMINI_MODEL };
}

export type {
  LlmMessage,
  LlmProvider,
  LlmTool,
  LlmToolCall,
  LlmToolResult,
  LlmTurnCallbacks,
  LlmTurnOptions,
  RunTool,
} from "./types";
