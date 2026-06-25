import type Anthropic from "@anthropic-ai/sdk";

// Tools the receptionist can call mid-conversation. The model decides when to
// use them; the session wires the actual execution to integrations + storage.
// `strict: true` guarantees the arguments (especially booking times) validate.

export const TOOL_BOOK = "book_appointment";
export const TOOL_MESSAGE = "take_message";
export const TOOL_TRANSFER = "transfer_call";
export const TOOL_END = "end_call";

export const receptionistTools: Anthropic.Tool[] = [
  {
    name: TOOL_BOOK,
    description:
      "Book an appointment on the business calendar. Only call after confirming the date, time, and the caller's name out loud.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string", description: "Short title for the appointment" },
        start_time: { type: "string", format: "date-time", description: "ISO 8601 start" },
        end_time: { type: "string", format: "date-time", description: "ISO 8601 end" },
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
    strict: true,
    input_schema: {
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
    strict: true,
    input_schema: {
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
    description: "End the call once the caller's needs are met and goodbyes are exchanged.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        reason: { type: "string" },
      },
      required: [],
    },
  },
];
