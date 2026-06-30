// Provider-neutral LLM boundary. The session speaks this shape; each provider
// adapter (claude.ts, gemini.ts) converts to/from its own wire format and
// returns the updated neutral history. Keeping the session provider-agnostic is
// what lets LLM_PROVIDER swap the brain (Gemini ⇄ Claude) without touching the
// call loop.

export type LlmRole = "user" | "assistant" | "tool";

/** A tool the model asked to run this turn. */
export interface LlmToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

/** The result of running a tool, fed back to the model on the next round. */
export interface LlmToolResult {
  id: string;
  name: string;
  output: string;
}

/**
 * One entry of conversation history:
 * - user:      `{ role: "user", text }`
 * - assistant: `{ role: "assistant", text }` and/or `{ toolCalls }`
 * - tool:      `{ role: "tool", toolResults }`
 */
export interface LlmMessage {
  role: LlmRole;
  text?: string;
  toolCalls?: LlmToolCall[];
  toolResults?: LlmToolResult[];
}

/** Provider-neutral tool declaration. `parameters` is a JSON Schema object. */
export interface LlmTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

/** Executes a tool the model requested; returns a string result for the model. */
export type RunTool = (
  name: string,
  input: Record<string, unknown>,
) => Promise<string>;

export interface LlmTurnCallbacks {
  /** Streamed assistant text — forward to TTS as it arrives. */
  onTextDelta: (text: string) => void;
  onToolUse?: (name: string, input: Record<string, unknown>) => void;
}

export interface LlmTurnOptions {
  model: string;
  system: string;
  messages: LlmMessage[];
  tools: LlmTool[];
  runTool: RunTool;
  callbacks: LlmTurnCallbacks;
  signal?: AbortSignal;
}

/**
 * A streaming, tool-calling brain. Streams text deltas through the callbacks,
 * runs any tools the model calls, loops until it produces a final spoken reply,
 * and returns the conversation history with this turn appended.
 */
export type LlmProvider = (opts: LlmTurnOptions) => Promise<LlmMessage[]>;
