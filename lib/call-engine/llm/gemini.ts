import {
  GoogleGenAI,
  type Content,
  type FunctionDeclaration,
  type Part,
} from "@google/genai";
import { getEnv } from "../env";
import type {
  LlmMessage,
  LlmProvider,
  LlmTool,
  LlmToolResult,
} from "./types";

// Streams one assistant turn from Gemini: forwards text deltas to TTS as they
// arrive, runs any tools the model calls, and loops until it produces a final
// spoken reply. This is the default brain — Gemini both understands the caller
// (it reads the transcribed words) and generates the response.
//
// Latency is king on a live call, so thinking is disabled (thinkingBudget: 0)
// and max tokens are capped — we trade reasoning depth for time-to-first-token.
// Gemini speaks the provider-neutral contract in ../types.ts; the mapping below
// converts to/from Gemini's wire format (Content/Part, roles "user"|"model",
// functionResponse parts sent back under the "user" role).

const MAX_TOOL_ROUNDS = 5;
const MAX_TOKENS = 400;

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: getEnv().GEMINI_API_KEY ?? "" });
  return client;
}

/** Neutral history → Gemini Content[]. Assistant turns become role "model";
 *  tool results become functionResponse parts under role "user". */
function toContents(messages: LlmMessage[]): Content[] {
  return messages.map((m): Content => {
    if (m.role === "user") {
      return { role: "user", parts: [{ text: m.text ?? "" }] };
    }
    if (m.role === "tool") {
      return {
        role: "user",
        parts: (m.toolResults ?? []).map(
          (r): Part => ({
            functionResponse: {
              ...(r.id ? { id: r.id } : {}),
              name: r.name,
              response: { result: r.output },
            },
          }),
        ),
      };
    }
    const parts: Part[] = [];
    if (m.text) parts.push({ text: m.text });
    for (const c of m.toolCalls ?? []) {
      parts.push({
        functionCall: { ...(c.id ? { id: c.id } : {}), name: c.name, args: c.input },
      });
    }
    return { role: "model", parts };
  });
}

/** Neutral tools → Gemini functionDeclarations. We use parametersJsonSchema
 *  (standard JSON Schema) rather than parameters (Gemini's OpenAPI Schema), so
 *  the exact same declaration that Claude uses works unchanged. */
function toGeminiTools(tools: LlmTool[]): { functionDeclarations: FunctionDeclaration[] }[] {
  if (tools.length === 0) return [];
  return [
    {
      functionDeclarations: tools.map(
        (t): FunctionDeclaration => ({
          name: t.name,
          description: t.description,
          parametersJsonSchema: t.parameters,
        }),
      ),
    },
  ];
}

function isAbort(err: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  return (
    err instanceof Error &&
    (err.name === "AbortError" || /abort/i.test(err.message))
  );
}

/** Returns the conversation history with this turn's messages appended. */
export const runGeminiTurn: LlmProvider = async (opts) => {
  const ai = getGemini();
  const history: LlmMessage[] = [...opts.messages];
  const contents = toContents(history);
  const tools = toGeminiTools(opts.tools);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (opts.signal?.aborted) break;

    let text = "";
    const rawCalls: { id?: string; name: string; args: Record<string, unknown> }[] = [];

    try {
      const stream = await ai.models.generateContentStream({
        model: opts.model,
        contents,
        config: {
          systemInstruction: opts.system,
          maxOutputTokens: MAX_TOKENS,
          temperature: 0.4,
          // Off for lowest time-to-first-token on a live call.
          thinkingConfig: { thinkingBudget: 0 },
          tools,
          abortSignal: opts.signal,
        },
      });

      for await (const chunk of stream) {
        if (opts.signal?.aborted) break;
        const delta = chunk.text;
        if (delta) {
          text += delta;
          opts.callbacks.onTextDelta(delta);
        }
        for (const fc of chunk.functionCalls ?? []) {
          rawCalls.push({
            id: fc.id,
            name: fc.name ?? "",
            args: (fc.args ?? {}) as Record<string, unknown>,
          });
        }
      }
    } catch (err) {
      if (isAbort(err, opts.signal)) break;
      throw err;
    }

    const assistantParts: Part[] = [];
    if (text) assistantParts.push({ text });
    for (const c of rawCalls) {
      assistantParts.push({
        functionCall: { ...(c.id ? { id: c.id } : {}), name: c.name, args: c.args },
      });
    }
    contents.push({ role: "model", parts: assistantParts });
    history.push({
      role: "assistant",
      text: text || undefined,
      toolCalls: rawCalls.length
        ? rawCalls.map((c) => ({ id: c.id ?? "", name: c.name, input: c.args }))
        : undefined,
    });

    if (rawCalls.length === 0) break;

    const responseParts: Part[] = [];
    const neutralResults: LlmToolResult[] = [];
    for (const c of rawCalls) {
      opts.callbacks.onToolUse?.(c.name, c.args);
      let output: string;
      try {
        output = await opts.runTool(c.name, c.args);
      } catch (err) {
        output = `Error running ${c.name}: ${(err as Error).message}`;
      }
      responseParts.push({
        functionResponse: {
          ...(c.id ? { id: c.id } : {}),
          name: c.name,
          response: { result: output },
        },
      });
      neutralResults.push({ id: c.id ?? "", name: c.name, output });
    }
    contents.push({ role: "user", parts: responseParts });
    history.push({ role: "tool", toolResults: neutralResults });
  }

  return history;
};
