import { getEnv } from "./env";
import { buildSystemPrompt } from "./llm/prompt";
import { runClaudeTurn } from "./llm/claude";
import {
  receptionistTools,
  TOOL_BOOK,
  TOOL_END,
  TOOL_MESSAGE,
  TOOL_TRANSFER,
} from "./llm/tools";
import type { LlmMessage } from "./llm/types";
import { selectStt } from "./stt";
import type { SttProvider, SttSession } from "./stt/types";
import { openElevenLabsTts } from "./tts/elevenlabs";
import type { TtsProvider, TtsSession } from "./tts/types";
import { baseLanguage, bestVoiceForLanguage, isAutoLanguage } from "./voice/catalog";
import { resolveCalendarById, resolveCalendarProvider } from "./integrations/registry";
import { redirectCall, sendSms } from "./telephony";
import { runPostCall } from "./summary/dispatch";
import type { CallRepository } from "./persistence/types";
import type { BookingRequest, CallContext } from "./types";

export interface SessionHooks {
  /** Send synthesized μ-law audio back into the call. */
  sendAudio: (ulaw: Buffer) => void;
  /** Tell the carrier to drop buffered audio (barge-in). */
  clearAudio: () => void;
  /** Hang up the call. */
  endCall: () => void;
}

export interface SessionDeps {
  repo: CallRepository;
  stt?: SttProvider;
  tts?: TtsProvider;
}

function median(xs: number[]): number | undefined {
  if (xs.length === 0) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

/**
 * Owns one live call: feeds caller audio to STT, runs Claude turns, streams
 * ElevenLabs audio back, persists the transcript, executes tools, and handles
 * barge-in. Transport-agnostic — it talks to the carrier only through hooks.
 */
export class CallSession {
  private readonly system: string;
  private readonly stt: SttSession;
  private readonly ttsProvider: TtsProvider;
  private readonly startedAt = Date.now();

  private messages: LlmMessage[] = [];
  private tts: TtsSession | null = null;
  // Voice + language can change mid-call when auto-detecting the caller's
  // language; both start from the assistant's configured values.
  private currentVoiceId: string;
  private detectedLanguage: string | null = null;
  private readonly autoLanguage: boolean;
  private abort: AbortController | null = null;
  private speaking = false;
  private shouldEnd = false;
  private finalized = false;
  private turnStartedAt = 0;
  private firstAudioCaptured = false;
  private readonly latencies: number[] = [];

  constructor(
    private readonly ctx: CallContext,
    private readonly hooks: SessionHooks,
    private readonly deps: SessionDeps,
  ) {
    this.system = buildSystemPrompt(ctx.config);
    this.currentVoiceId = ctx.config.voiceId;
    this.autoLanguage = isAutoLanguage(ctx.config.language);
    const sttName =
      (ctx.config.routing.sttProvider as string | undefined) ?? getEnv().STT_PROVIDER;
    const sttProvider: SttProvider = deps.stt ?? selectStt(sttName);
    this.ttsProvider = deps.tts ?? openElevenLabsTts;
    this.stt = sttProvider({
      language: ctx.config.language,
      onSpeechStarted: () => this.onSpeechStarted(),
      onTranscript: () => {},
      onUtterance: (text) => void this.onUtterance(text),
      onLanguageDetected: (lang) => this.onLanguageDetected(lang),
    });
  }

  /** Caller's language was detected (auto mode only). Match the TTS voice and
   *  pronunciation to it for the rest of the call; the LLM already replies in the
   *  caller's language because it sees their transcribed words. */
  private onLanguageDetected(language: string): void {
    if (!this.autoLanguage) return;
    const base = baseLanguage(language);
    if (!base || base === this.detectedLanguage) return;
    this.detectedLanguage = base;
    this.currentVoiceId = bestVoiceForLanguage(base, this.ctx.config.voiceId);
  }

  /** Greet the caller as soon as the media stream is live. */
  start(): void {
    void this.speakText(this.ctx.config.greeting, "assistant");
  }

  /** Raw μ-law from the caller (forwarded to STT). */
  pushCallerAudio(ulaw: Buffer): void {
    this.stt.send(ulaw);
  }

  private onSpeechStarted(): void {
    if (this.speaking) this.bargeIn();
  }

  private bargeIn(): void {
    this.abort?.abort();
    this.tts?.stop();
    this.hooks.clearAudio();
    this.speaking = false;
  }

  private async onUtterance(text: string): Promise<void> {
    await this.deps.repo
      .appendTurn(this.ctx.callId, { role: "caller", text, tsMs: this.elapsed() })
      .catch((e) => console.error("[session] persist caller turn", e));
    this.messages.push({ role: "user", content: text });
    await this.runAssistantTurn();
    if (this.shouldEnd) this.hooks.endCall();
  }

  private async runAssistantTurn(): Promise<void> {
    this.abort = new AbortController();
    this.turnStartedAt = Date.now();
    this.firstAudioCaptured = false;
    let reply = "";

    const tts = this.openTts();
    this.speaking = true;

    this.messages = await runClaudeTurn({
      model: getEnv().CLAUDE_MODEL,
      system: this.system,
      messages: this.messages,
      tools: receptionistTools,
      runTool: (name, input) => this.runTool(name, input),
      callbacks: {
        onTextDelta: (delta) => {
          reply += delta;
          tts.speak(delta);
        },
      },
      signal: this.abort.signal,
    });

    tts.flush();
    if (!this.abort.signal.aborted && reply.trim()) {
      await this.deps.repo
        .appendTurn(this.ctx.callId, {
          role: "assistant",
          text: reply.trim(),
          tsMs: this.elapsed(),
        })
        .catch((e) => console.error("[session] persist assistant turn", e));
    }
  }

  /** Speak a fixed line (greeting) without invoking the LLM. */
  private async speakText(text: string, role: "assistant"): Promise<void> {
    this.turnStartedAt = Date.now();
    this.firstAudioCaptured = false;
    const tts = this.openTts();
    this.speaking = true;
    tts.speak(text);
    tts.flush();
    await this.deps.repo
      .appendTurn(this.ctx.callId, { role, text, tsMs: this.elapsed() })
      .catch((e) => console.error("[session] persist greeting", e));
  }

  private openTts(): TtsSession {
    this.tts?.close();
    const tts = this.ttsProvider({
      voiceId: this.currentVoiceId,
      // Only hint a language once we've auto-detected one; fixed-language
      // assistants keep the provider default (their STT is already pinned).
      languageCode: this.autoLanguage ? this.detectedLanguage ?? undefined : undefined,
      onAudio: (ulaw) => {
        if (!this.firstAudioCaptured) {
          this.firstAudioCaptured = true;
          this.latencies.push(Date.now() - this.turnStartedAt);
        }
        this.hooks.sendAudio(ulaw);
      },
      onDone: () => {
        this.speaking = false;
      },
    });
    this.tts = tts;
    return tts;
  }

  private async runTool(
    name: string,
    input: Record<string, unknown>,
  ): Promise<string> {
    switch (name) {
      case TOOL_BOOK:
        return this.bookAppointment(input);
      case TOOL_MESSAGE: {
        await this.deps.repo.recordAction(this.ctx.callId, {
          type: "message",
          status: "done",
          payload: input,
        });
        await this.alertOwner(input);
        return "Got it — I've saved your message.";
      }
      case TOOL_TRANSFER: {
        const to = String(
          (this.ctx.config.routing as { transferTo?: string }).transferTo ?? "",
        );
        await this.deps.repo.recordAction(this.ctx.callId, {
          type: "transfer",
          status: to ? "done" : "failed",
          payload: input,
          error: to ? undefined : "no personal number set",
        });
        if (!to) return "I can't transfer right now, but I'll take a message.";
        this.shouldEnd = true;
        try {
          await redirectCall(this.ctx.callSid, to, this.ctx.to);
        } catch (err) {
          console.error("[session] transfer redirect", err);
        }
        return "Connecting you now, please hold.";
      }
      case TOOL_END:
        this.shouldEnd = true;
        return "Wrapping up the call.";
      default:
        return `Unknown tool: ${name}`;
    }
  }

  private async bookAppointment(input: Record<string, unknown>): Promise<string> {
    const access =
      (
        this.ctx.config.routing.calendar as {
          access?: Array<{ integrationId: string; level: string }>;
        }
      )?.access ?? [];
    const writeEntry = access.find((a) => a.level === "write");

    const req: BookingRequest = {
      title: String(input.title ?? "Appointment"),
      startTime: String(input.start_time ?? ""),
      endTime: String(input.end_time ?? ""),
      attendeeName: input.attendee_name ? String(input.attendee_name) : undefined,
      attendeePhone: input.attendee_phone
        ? String(input.attendee_phone)
        : this.ctx.from,
      notes: input.notes ? String(input.notes) : undefined,
    };

    let resolved = writeEntry
      ? resolveCalendarById(this.ctx.config.integrations, writeEntry.integrationId)
      : null;
    if (!resolved) resolved = resolveCalendarProvider(this.ctx.config.integrations);
    if (!resolved) {
      await this.deps.repo.recordAction(this.ctx.callId, {
        type: "booking",
        status: "pending",
        payload: input,
      });
      return "Saved the appointment request; the team will confirm shortly.";
    }
    const result = await resolved.provider.createEvent(req);
    await this.deps.repo.recordAction(
      this.ctx.callId,
      {
        type: "booking",
        status: result.ok ? "done" : "failed",
        externalId: result.externalId,
        payload: input,
        error: result.error,
      },
      resolved.integrationId,
    );
    return result.ok
      ? "The appointment is booked and confirmed."
      : "I couldn't reach the calendar, so I've saved it as a request to confirm.";
  }

  /** Text the owner's personal number when a message is taken (if enabled). */
  private async alertOwner(input: Record<string, unknown>): Promise<void> {
    const r = this.ctx.config.routing as {
      transferTo?: string;
      smsAlerts?: boolean;
    };
    if (!r.transferTo || r.smsAlerts === false) return;
    const who = input.caller_name ? String(input.caller_name) : this.ctx.from;
    const cb = input.callback_number ? ` (${String(input.callback_number)})` : "";
    const body = `New message for ${this.ctx.config.businessName}: ${String(
      input.message ?? "",
    )} — from ${who}${cb}`;
    try {
      await sendSms(r.transferTo, this.ctx.to, body);
    } catch (err) {
      console.error("[session] sms alert", err);
    }
  }

  /** Stop everything, finalize the call record, and trigger summarization. */
  async finalize(): Promise<void> {
    if (this.finalized) return;
    this.finalized = true;
    this.abort?.abort();
    this.tts?.close();
    this.stt.close();
    await this.deps.repo
      .finalizeCall(this.ctx.callId, {
        status: "completed",
        durationSeconds: Math.round(this.elapsed() / 1000),
        medianLatencyMs: median(this.latencies),
      })
      .catch((e) => console.error("[session] finalize", e));
    await runPostCall(this.ctx.callId, this.deps.repo);
  }

  private elapsed(): number {
    return Date.now() - this.startedAt;
  }
}
