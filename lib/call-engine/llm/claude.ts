import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "../env";
import type { LlmMessage, LlmProvider, LlmTool, LlmToolResult } from "./types";

// Streams one assistant turn from Claude, running any tools it calls and
// looping until it produces a final spoken reply. Text deltas are forwarded to
// TTS as they arrive; an AbortSignal lets the session cut a turn short for
// barge-in. effort is "low" and thinking is left off — latency is king on a
// live call, so we trade depth for time-to-first-token.
//
// Claude is the alternate brain (LLM_PROVIDER=claude); Gemini is the default.
// Both speak the provider-neutral contract in ./types.ts. The mapping below
// converts to/from Anthropic's wire format. getAnthropic() is also reused by the
// (non-latency-sensitive) post-call summarizer.

const MAX_TOOL_ROUNDS = 5;
const MAX_TOKENS = 400;

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: getEnv().ANTHROPIC_API_KEY ?? "" });
  return client;
}

function isAbort(err: unknown): boolean {
  return (
    err instanceof Anthropic.APIUserAbortError ||
    (err instanceof Error && err.name === "AbortError")
  );
}

/** Neutral history → Anthropic MessageParam[]. */
function toAnthropic(messages: LlmMessage[]): Anthropic.MessageParam[] {
  return messages.map((m): Anthropic.MessageParam => {
    if (m.role === "user") return { role: "user", content: m.text ?? "" };
    if (m.role === "tool") {
      return {
        role: "user",
        content: (m.toolResults ?? []).map(
          (r): Anthropic.ToolResultBlockParam => ({
            type: "tool_result",
            tool_use_id: r.id,
            content: r.output,
          }),
        ),
      };
    }
    const content: Anthropic.ContentBlockParam[] = [];
    if (m.text) content.push({ type: "text", text: m.text });
    for (const c of m.toolCalls ?? []) {
      content.push({ type: "tool_use", id: c.id, name: c.name, input: c.input });
    }
    return { role: "assistant", content };
  });
}

/** Neutral tools → Anthropic tools. */
function toAnthropicTools(tools: LlmTool[]): Anthropic.Tool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    strict: true,
    input_schema: t.parameters as Anthropic.Tool.InputSchema,
  }));
}

/** Returns the conversation history with this turn's messages appended. */
export const runClaudeTurn: LlmProvider = async (opts) => {
  const anthropic = getAnthropic();
  const history: LlmMessage[] = [...opts.messages];
  const wire = toAnthropic(history);
  const tools = toAnthropicTools(opts.tools);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (opts.signal?.aborted) break;

    let final: Anthropic.Message;
    try {
      const stream = anthropic.messages.stream(
        {
          model: opts.model,
          max_tokens: MAX_TOKENS,
          system: opts.system,
          messages: wire,
          tools,
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

    wire.push({ role: "assistant", content: final.content });

    const text = final.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const toolUses = final.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );
    history.push({
      role: "assistant",
      text: text || undefined,
      toolCalls: toolUses.length
        ? toolUses.map((t) => ({
            id: t.id,
            name: t.name,
            input: (t.input ?? {}) as Record<string, unknown>,
          }))
        : undefined,
    });

    if (final.stop_reason === "pause_turn") continue; // server tool paused
    if (final.stop_reason !== "tool_use" || toolUses.length === 0) break;

    const wireResults: Anthropic.ToolResultBlockParam[] = [];
    const neutralResults: LlmToolResult[] = [];
    for (const tu of toolUses) {
      const input = (tu.input ?? {}) as Record<string, unknown>;
      opts.callbacks.onToolUse?.(tu.name, input);
      let output: string;
      try {
        output = await opts.runTool(tu.name, input);
      } catch (err) {
        output = `Error running ${tu.name}: ${(err as Error).message}`;
      }
      wireResults.push({ type: "tool_result", tool_use_id: tu.id, content: output });
      neutralResults.push({ id: tu.id, name: tu.name, output });
    }
    wire.push({ role: "user", content: wireResults });
    history.push({ role: "tool", toolResults: neutralResults });
  }

  return history;
};
