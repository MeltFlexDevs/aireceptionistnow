import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";

// One-time workspace wiring for the ElevenLabs Conversational AI integration.
// Agents are per-assistant (see sync.ts), but two settings are workspace-global:
//   • the conversation-initiation client-data webhook — lets every call fetch our
//     per-caller greeting/language/voice overrides from /api/agent/init.
//   • the post-call webhook — where transcripts are delivered after each call.
// This applies both from code so setup is a single API call, not dashboard
// clicking. Idempotent: re-running just re-asserts the same settings.

export interface WorkspaceSetupResult {
  conversationInitiationWebhook: string;
  postCallWebhookId: string | null;
}

/** Point the workspace's conversation-init webhook at our /api/agent/init, and
 *  (if ELEVENLABS_POST_CALL_WEBHOOK_ID is set) wire the post-call transcript
 *  webhook. ElevenLabs signs both with the workspace webhook secret — set that
 *  same value as ELEVENLABS_WEBHOOK_SECRET so our routes accept them. */
export async function configureWorkspaceWebhooks(): Promise<WorkspaceSetupResult> {
  const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  if (!base) throw new Error("APP_BASE_URL is not set.");
  const initUrl = `${base}/api/agent/init`;

  const request: ElevenLabs.conversationalAi.PatchConvAiSettingsRequest = {
    conversationInitiationClientDataWebhook: { url: initUrl, requestHeaders: {} },
  };

  // Post-call webhooks are referenced by a workspace webhook id (create the
  // webhook object once in the ElevenLabs dashboard, then set its id here).
  const postCallId = process.env.ELEVENLABS_POST_CALL_WEBHOOK_ID;
  if (postCallId) {
    request.webhooks = { postCallWebhookId: postCallId, events: ["transcript"] };
  }

  await elevenClient().conversationalAi.settings.update(request);
  return { conversationInitiationWebhook: initUrl, postCallWebhookId: postCallId ?? null };
}
