import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";
import { findAgentPhoneNumberId, importTwilioNumber } from "../elevenlabs";
import {
  listNumbersMissingElevenLabsId,
  setNumberElevenLabsId,
} from "../../dashboard/db";

export interface WorkspaceSetupResult {
  conversationInitiationWebhook: string;
  postCallWebhookId: string | null;
}

export async function configureWorkspaceWebhooks(): Promise<WorkspaceSetupResult> {
  const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  if (!base) throw new Error("APP_BASE_URL is not set.");
  const secret = process.env.AGENT_WEBHOOK_SECRET;
  if (!secret) throw new Error("AGENT_WEBHOOK_SECRET is not set.");
  const initUrl = `${base}/api/agent/init`;

  const request: ElevenLabs.conversationalAi.PatchConvAiSettingsRequest = {
    conversationInitiationClientDataWebhook: {
      url: initUrl,
      requestHeaders: { "x-agent-secret": secret },
    },
  };

  const postCallId = process.env.ELEVENLABS_POST_CALL_WEBHOOK_ID;
  if (postCallId) {
    request.webhooks = { postCallWebhookId: postCallId, events: ["transcript"] };
  }

  await elevenClient().conversationalAi.settings.update(request);
  return { conversationInitiationWebhook: initUrl, postCallWebhookId: postCallId ?? null };
}

let ensured: Promise<void> | null = null;

export function ensureInitWebhook(): Promise<void> {
  ensured ??= wireInitWebhookOnce().catch((err) => {
    console.warn("[workspace] could not verify the conversation-init webhook", err);
    ensured = null;
  });
  return ensured;
}

async function wireInitWebhookOnce(): Promise<void> {
  const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  const secret = process.env.AGENT_WEBHOOK_SECRET;
  if (!base || !secret) return;
  const want = `${base}/api/agent/init`;

  const settings = (await elevenClient().conversationalAi.settings.get()) as unknown as {
    conversationInitiationClientDataWebhook?: { url?: string };
  };
  const current = settings.conversationInitiationClientDataWebhook?.url ?? "";
  if (current === want) return;

  if (current) {
    console.warn(
      `[workspace] conversation-init webhook points at ${current}, not ${want} - leaving it. ` +
        `Callers get this deployment's default greeting, not one in their language. ` +
        `POST /api/agent/setup from the deployment that should own it.`,
    );
    return;
  }

  await elevenClient().conversationalAi.settings.update({
    conversationInitiationClientDataWebhook: {
      url: want,
      requestHeaders: { "x-agent-secret": secret },
    },
  });
  console.log(`[workspace] conversation-init webhook was unset - wired it to ${want}`);
}

export async function importPoolNumbersToElevenLabs(): Promise<{
  imported: number;
  failed: number;
}> {
  const rows = await listNumbersMissingElevenLabsId();
  let imported = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      const id =
        (await findAgentPhoneNumberId(row.e164)) ??
        (await importTwilioNumber(row.e164));
      if (!id) throw new Error("ElevenLabs returned no phone_number_id");
      await setNumberElevenLabsId(row.id, id);
      imported++;
    } catch (err) {
      failed++;
      console.error("[agent/setup] number import failed", row.e164, err);
    }
  }
  return { imported, failed };
}
