// Streaming text-to-speech boundary. The default is ElevenLabs (see
// `elevenlabs.ts`) configured to emit 8 kHz μ-law, which Twilio plays directly.
// onAudio always receives 8 kHz μ-law mono so the session can frame it without
// knowing which provider produced it.

export interface TtsCallbacks {
  onAudio: (ulaw: Buffer) => void;
  onDone?: () => void;
}

export interface TtsOptions extends TtsCallbacks {
  voiceId: string;
  /** Optional ISO language to enforce pronunciation (e.g. "es", "de"). When set,
   *  the multilingual model speaks the text in this language. */
  languageCode?: string;
}

export interface TtsSession {
  /** Stream text to synthesize. Safe to call repeatedly with deltas. */
  speak(text: string): void;
  /** Signal the end of an utterance so the provider finishes the audio. */
  flush(): void;
  /** Barge-in: stop synthesis and drop anything still buffered. */
  stop(): void;
  close(): void;
}

export type TtsProvider = (opts: TtsOptions) => TtsSession;
