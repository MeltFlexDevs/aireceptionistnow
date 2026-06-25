// CNAM (caller ID name) display-name rules per Twilio Trust Hub: max 15
// characters, must start with a letter, only letters / numbers / periods /
// commas / spaces. Kept SDK-free so server components can import it.
export const CNAM_POLICY_SID = "RNf3db3cd1fe25fcfd3c3ded065c8fea53";
export const CNAM_MAX = 15;

export function sanitizeCnam(name: string): string {
  return (name || "")
    .replace(/[^A-Za-z0-9.,\s]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[^A-Za-z]+/, "")
    .trim()
    .slice(0, CNAM_MAX)
    .trim();
}
