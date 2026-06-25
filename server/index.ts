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

server.listen(env.MEDIA_WS_PORT, () => {
  console.log(`[media] listening on :${env.MEDIA_WS_PORT} (ws path /media)`);
});
