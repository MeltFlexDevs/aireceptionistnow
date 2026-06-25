# Media server

Standalone Node WebSocket server that bridges **Twilio Media Streams** to the
call engine (Deepgram → Claude → ElevenLabs). It holds one long-lived
bidirectional socket per call, so it **cannot run on Vercel serverless** — run
it as its own process.

## Run locally

```bash
# 1. Fill in .env (see ../.env.example)
# 2. Start the media server
npm run server:dev          # tsx watch server/index.ts

# 3. Expose it so Twilio can reach it
ngrok http 8080             # → wss://<id>.ngrok.app/media
# set MEDIA_WS_URL=wss://<id>.ngrok.app/media
```

Run the Next app (`npm run dev`) and expose it too (`APP_BASE_URL`), then point
your Twilio number's Voice webhook at `${APP_BASE_URL}/api/twilio/voice`.

## Deploy

Deploy `server/` to any Node host (Railway, Fly.io, Render, a VM). It needs the
same env as the Next app plus `MEDIA_WS_PORT`. Put it behind TLS so Twilio can
reach `wss://…/media`, and set `MEDIA_WS_URL` to that public URL.

`GET /health` returns `ok` for liveness checks.

See [../docs/CALL-ENGINE.md](../docs/CALL-ENGINE.md) for the full architecture.
