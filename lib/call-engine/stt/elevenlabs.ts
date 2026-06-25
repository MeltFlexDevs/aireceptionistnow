import WebSocket from "ws";
import { getEnv } from "../env";
import { ulawToPcm16k } from "../audio";
import type { SttOptions, SttSession } from "./types";

// ElevenLabs Scribe v2 Realtime STT over WebSocket. Scribe wants PCM16 16 kHz,
// so we transcode the μ-law 8 kHz Twilio audio first. There's no dedicated
// voice-activity event, so barge-in is driven off the first partial transcript
// of each utterance.

interface ScribeMessage {
  message_type?: string;
  text?: string;
  words?: { text?: string }[];
}

export function openElevenLabsStt(opts: SttOptions): SttSession {
  const env = getEnv();
  const ws = new WebSocket(
    "wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime",
    { headers: { "xi-api-key": env.ELEVENLABS_API_KEY } },
  );

  let open = false;
  let inUtterance = false;
  const queue: string[] = [];

  const send = (msg: object) => {
    const json = JSON.stringify(msg);
    if (open) ws.send(json);
    else queue.push(json);
  };

  ws.on("open", () => {
    open = true;
    for (const json of queue) ws.send(json);
    queue.length = 0;
  });

  ws.on("message", (raw: WebSocket.RawData) => {
    let msg: ScribeMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    const text =
      msg.text?.trim() ??
      (msg.words ?? []).map((w) => w.text ?? "").join(" ").trim();

    switch (msg.message_type) {
      case "partial_transcript":
        if (text) {
          if (!inUtterance) {
            inUtterance = true;
            opts.onSpeechStarted(); // proxy VAD: caller started talking
          }
          opts.onTranscript({ text, isFinal: false });
        }
        break;
      case "committed_transcript":
      case "committed_transcript_with_timestamps":
        inUtterance = false;
        if (text) {
          opts.onTranscript({ text, isFinal: true });
          opts.onUtterance(text);
        }
        break;
      case "input_error":
        console.error("[stt] elevenlabs", msg);
        break;
    }
  });

  ws.on("error", (err) => console.error("[stt] elevenlabs error", err));

  return {
    send(ulaw: Buffer) {
      const pcm = ulawToPcm16k(ulaw);
      send({
        message_type: "input_audio_chunk",
        audio_base_64: pcm.toString("base64"),
        commit: false,
        sample_rate: 16000,
      });
    },
    close() {
      try {
        if (open) {
          ws.send(
            JSON.stringify({
              message_type: "input_audio_chunk",
              audio_base_64: "",
              commit: true,
            }),
          );
        }
      } catch {
        // socket already closing
      }
      ws.close();
    },
  };
}
