import type { LlmTool } from "./types";

// Tools the receptionist can call mid-conversation. The model decides when to
// use them; the session wires the actual execution to integrations + storage.
// Declared provider-neutral (see types.ts) so the same set works whether the
// brain is Gemini or Claude — each adapter maps `parameters` to its own schema.

export const TOOL_BOOK = "book_appointment";
export const TOOL_MESSAGE = "take_message";
export const TOOL_TRANSFER = "transfer_call";
export const TOOL_END = "end_call";

export const receptionistTools: LlmTool[] = [
  {
    name: TOOL_BOOK,
    description:
      "Book an appointment on the business calendar. Only call after confirming the date, time, and the caller's name out loud.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string", description: "Short title for the appointment" },
        start_time: { type: "string", description: "ISO 8601 start (date-time)" },
        end_time: { type: "string", description: "ISO 8601 end (date-time)" },
        attendee_name: { type: "string", description: "Caller's name" },
        attendee_phone: { type: "string", description: "Callback number" },
        notes: { type: "string", description: "Reason / context for the visit" },
      },
      required: ["title", "start_time", "end_time"],
    },
  },
  {
    name: TOOL_MESSAGE,
    description:
      "Take a message when you cannot resolve the request or the caller asks to leave one.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        caller_name: { type: "string" },
        callback_number: { type: "string" },
        message: { type: "string", description: "What the caller wants relayed" },
        urgency: { type: "string", enum: ["low", "normal", "high"] },
      },
      required: ["message"],
    },
  },
  {
    name: TOOL_TRANSFER,
    description:
      "Transfer the call to a human when the routing rules call for it or the caller insists.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        reason: { type: "string" },
        target: { type: "string", description: "Named transfer target, if known" },
      },
      required: ["reason"],
    },
  },
  {
    name: TOOL_END,
    description:
      "End the call once the caller's needs are met and goodbyes are exchanged.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        reason: { type: "string" },
      },
      required: [],
    },
  },
];
