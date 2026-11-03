// Home status band. No receptionist or no number means nobody is answering,
// whatever the enabled flag says (same extended rule as the shell).
export type StatusBandState = "offline" | "live" | "paused";

export function statusBandState(
  hasAssistant: boolean,
  hasNumber: boolean,
  enabled: boolean,
): StatusBandState {
  if (!hasAssistant || !hasNumber) return "offline";
  return enabled ? "live" : "paused";
}
