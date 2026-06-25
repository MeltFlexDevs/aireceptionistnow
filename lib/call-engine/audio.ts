// Twilio Media Streams audio helpers.
//
// Both Twilio and ElevenLabs (with output_format=ulaw_8000) speak 8 kHz μ-law,
// so audio passes through with no resampling — the latency win that makes this
// transport viable. Twilio plays smoothest when fed ~20 ms frames (160 bytes of
// μ-law), so we re-frame ElevenLabs' larger chunks before sending.

export const ULAW_FRAME_BYTES = 160; // 20 ms @ 8 kHz μ-law

/** Split a μ-law buffer into 20 ms base64 frames ready for Twilio media events. */
export function framesFromUlaw(buf: Buffer): string[] {
  const frames: string[] = [];
  for (let i = 0; i < buf.length; i += ULAW_FRAME_BYTES) {
    frames.push(buf.subarray(i, i + ULAW_FRAME_BYTES).toString("base64"));
  }
  return frames;
}

/** Re-frame a base64 μ-law chunk (e.g. from ElevenLabs) into 20 ms frames. */
export function framesFromUlawBase64(b64: string): string[] {
  return framesFromUlaw(Buffer.from(b64, "base64"));
}

// ── Twilio outbound message builders (sent over the media WebSocket) ─────────

export function mediaMessage(streamSid: string, payloadB64: string): string {
  return JSON.stringify({
    event: "media",
    streamSid,
    media: { payload: payloadB64 },
  });
}

/** A mark Twilio echoes back once the preceding audio has finished playing. */
export function markMessage(streamSid: string, name: string): string {
  return JSON.stringify({ event: "mark", streamSid, mark: { name } });
}

/** Tell Twilio to drop any buffered outbound audio — used for barge-in. */
export function clearMessage(streamSid: string): string {
  return JSON.stringify({ event: "clear", streamSid });
}

// ── μ-law 8 kHz → PCM16 16 kHz ───────────────────────────────────────────────
// Twilio sends μ-law 8 kHz; some STT providers (ElevenLabs Scribe) want linear
// PCM16 16 kHz, so we decode + upsample before sending. Deepgram takes μ-law
// natively and skips this.

function ulawDecode(uVal: number): number {
  const u = ~uVal & 0xff;
  let t = ((u & 0x0f) << 3) + 0x84;
  t <<= (u & 0x70) >> 4;
  return u & 0x80 ? 0x84 - t : t - 0x84;
}

/** Decode μ-law 8 kHz and linearly upsample to PCM16 little-endian 16 kHz. */
export function ulawToPcm16k(ulaw: Buffer): Buffer {
  const out = Buffer.alloc(ulaw.length * 4); // 2× samples × 2 bytes
  let prev = 0;
  for (let i = 0; i < ulaw.length; i++) {
    const s = ulawDecode(ulaw[i]);
    out.writeInt16LE(i === 0 ? s : (prev + s) >> 1, i * 4);
    out.writeInt16LE(s, i * 4 + 2);
    prev = s;
  }
  return out;
}
