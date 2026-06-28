// Streaming speech-to-text boundary. Deepgram is the default implementation
// (see `deepgram.ts`); any provider that can stream μ-law 8 kHz and emit
// partial + finalized transcripts can satisfy this interface.

export interface SttCallbacks {
  /** Caller started talking — used to trigger barge-in. */
  onSpeechStarted: () => void;
  /** Every transcript, interim or final (for live captions / echo). */
  onTranscript: (t: { text: string; isFinal: boolean }) => void;
  /** Caller finished an utterance — hand this to the LLM as a user turn. */
  onUtterance: (text: string) => void;
  /** Detected spoken language (BCP-47-ish code, e.g. "es"), when the provider
   *  reports one in multilingual/auto mode. Fired whenever it changes. */
  onLanguageDetected?: (language: string) => void;
}

export interface SttOptions extends SttCallbacks {
  language: string;
}

export interface SttSession {
  /** Feed raw μ-law (8 kHz, mono) audio from Twilio. */
  send(audio: Buffer): void;
  close(): void;
}

export type SttProvider = (opts: SttOptions) => SttSession;
