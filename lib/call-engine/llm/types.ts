import type Anthropic from "@anthropic-ai/sdk";

export type LlmMessage = Anthropic.MessageParam;

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
