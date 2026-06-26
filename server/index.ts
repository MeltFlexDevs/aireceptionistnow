import "dotenv/config"; // load .env for the standalone server (Next loads it itself)
import http from "node:http";
import { WebSocketServer } from "ws";
import { getEnv } from "../lib/call-engine/env";
import { getRepository } from "../lib/call-engine/persistence/supabase";
import { handleMediaConnection } from "./mediaStream";

// Standalone Twilio Media Streams server. This CANNOT run on Vercel serverless —
// it holds a long-lived bidirectional WebSocket per call. Run it on a Node host
// (Railway, Fly, Render, a VM, or locally behind ngrok) and point MEDIA_WS_URL
// at wss://<host>/media.

const env = getEnv();
const repo = getRepository();

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server, path: "/media" });
wss.on("connection", (ws) => handleMediaConnection(ws, repo));

// Hosts like Railway/Render inject the port to bind on via PORT; fall back to
// MEDIA_WS_PORT (default 8080) for local runs.
const port = Number(process.env.PORT) || env.MEDIA_WS_PORT;
server.listen(port, () => {
  console.log(`[media] listening on :${port} (ws path /media)`);
});
