import type { WebSocket } from "ws";
import { framesFromUlaw, mediaMessage, clearMessage } from "../lib/call-engine/audio";
import { verifyStreamSignature } from "../lib/call-engine/pickup";
import { CallSession } from "../lib/call-engine/session";
import type { CallRepository } from "../lib/call-engine/persistence/types";
import type { CallContext } from "../lib/call-engine/types";

// Bridges one Twilio Media Streams WebSocket to a CallSession. Twilio sends
// JSON frames (start, media, stop); we translate those into session calls and
// translate the session's audio/clear hooks back into Twilio frames.

interface TwilioStart {
  streamSid: string;
  callSid: string;
  customParameters?: Record<string, string>;
}

interface TwilioMessage {
  event: string;
  start?: TwilioStart;
  media?: { payload: string; track?: string };
}

export function handleMediaConnection(ws: WebSocket, repo: CallRepository): void {
  let session: CallSession | null = null;
  let streamSid = "";
  let finalized = false;

  const finalize = async () => {
    if (!session || finalized) return;
    finalized = true;
    await session.finalize().catch((e) => console.error("[media] finalize", e));
  };

  ws.on("message", async (raw) => {
    let msg: TwilioMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.event) {
      case "start": {
        const start = msg.start;
        if (!start) return;
        streamSid = start.streamSid;
        const p = start.customParameters ?? {};
        const to = p.to ?? "";
        // The media WebSocket is a separate public connection from the signed
        // Twilio webhook, so verify the HMAC we put in the TwiML before doing
        // any work — this stops a stranger from opening a stream against a
        // callId and burning STT/LLM/TTS budget (or hijacking a real call).
        if (
          !verifyStreamSignature({
            callId: p.callId ?? "",
            to,
            ts: p.ts ?? "",
            sig: p.sig ?? "",
          })
        ) {
          console.error("[media] rejected unverified stream; closing", { to });
          ws.close();
          return;
        }
        const config = to ? await repo.resolveInboundNumber(to) : null;
        if (!config || !p.callId) {
          console.error("[media] unresolved call; closing", { to });
          ws.close();
          return;
        }
        const ctx: CallContext = {
          callId: p.callId,
          callSid: start.callSid,
          streamSid,
          from: p.from ?? "",
          to,
          config,
        };
        await repo
          .markInProgress(ctx.callId, streamSid)
          .catch((e) => console.error("[media] markInProgress", e));

        session = new CallSession(
          ctx,
          {
            sendAudio: (ulaw) => {
              for (const frame of framesFromUlaw(ulaw)) {
                ws.send(mediaMessage(streamSid, frame));
              }
            },
            clearAudio: () => ws.send(clearMessage(streamSid)),
            endCall: () => ws.close(),
          },
          { repo },
        );
        session.start();
        break;
      }
      case "media": {
        if (session && msg.media?.payload) {
          session.pushCallerAudio(Buffer.from(msg.media.payload, "base64"));
        }
        break;
      }
      case "stop":
        await finalize();
        break;
    }
  });

  ws.on("close", () => void finalize());
  ws.on("error", (err) => console.error("[media] ws error", err));
}
