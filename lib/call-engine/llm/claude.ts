import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "../env";
import type { LlmMessage, LlmTurnCallbacks, RunTool } from "./types";

// Streams one assistant turn from Claude, running any tools it calls and
// looping until it produces a final spoken reply. Text deltas are forwarded to
// TTS as they arrive; an AbortSignal lets the session cut a turn short for
// barge-in. effort is "low" and thinking is left off — latency is king on a
// live call, so we trade depth for time-to-first-token.

const MAX_TOOL_ROUNDS = 5;
const MAX_TOKENS = 400;

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: getEnv().ANTHROPIC_API_KEY });
  return client;
}

export interface ClaudeTurnOptions {
  model: string;
  system: string;
  messages: LlmMessage[];
  tools: Anthropic.Tool[];
  runTool: RunTool;
  callbacks: LlmTurnCallbacks;
  signal?: AbortSignal;
}

function isAbort(err: unknown): boolean {
  return (
    err instanceof Anthropic.APIUserAbortError ||
    (err instanceof Error && err.name === "AbortError")
  );
}

/** Returns the conversation history with this turn's messages appended. */
export async function runClaudeTurn(
  opts: ClaudeTurnOptions,
): Promise<LlmMessage[]> {
  const anthropic = getAnthropic();
  const history: LlmMessage[] = [...opts.messages];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (opts.signal?.aborted) break;

    let final: Anthropic.Message;
    try {
      const stream = anthropic.messages.stream(
        {
          model: opts.model,
          max_tokens: MAX_TOKENS,
          system: opts.system,
          messages: history,
          tools: opts.tools,
          output_config: { effort: "low" },
        },
        { signal: opts.signal },
      );
      stream.on("text", (delta) => opts.callbacks.onTextDelta(delta));
      final = await stream.finalMessage();
    } catch (err) {
      if (isAbort(err)) break;
      throw err;
    }

    history.push({ role: "assistant", content: final.content });

    if (final.stop_reason === "pause_turn") continue; // server tool paused
    const toolUses = final.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );
    if (final.stop_reason !== "tool_use" || toolUses.length === 0) break;

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const input = (tu.input ?? {}) as Record<string, unknown>;
      opts.callbacks.onToolUse?.(tu.name, input);
      let content: string;
      try {
        content = await opts.runTool(tu.name, input);
      } catch (err) {
        content = `Error running ${tu.name}: ${(err as Error).message}`;
      }
      results.push({ type: "tool_result", tool_use_id: tu.id, content });
    }
    history.push({ role: "user", content: results });
  }

  return history;
}
