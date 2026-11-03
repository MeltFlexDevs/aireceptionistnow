// Step 1 of onboarding keeps its answers in React state until the last
// substep submits them, so a reload used to wipe them. This tab's
// sessionStorage holds a draft until that submit.
export const BASICS_DRAFT_KEY = "arn-onb-basics";

export interface BasicsDraft {
  email: string;
  step: number;
  business: string;
  website: string;
  name: string;
  countryCode: string;
  phoneCode: string;
  phoneLocal: string;
  voiceId: string;
  gender: "f" | "m";
}

const TEXT_FIELDS = [
  "email",
  "business",
  "website",
  "name",
  "countryCode",
  "phoneCode",
  "phoneLocal",
  "voiceId",
] as const;

export function encodeBasicsDraft(draft: BasicsDraft): string {
  return JSON.stringify(draft);
}

// The draft, or null when it is missing, malformed or saved for another
// account (a shared tab must not prefill someone else's answers). The step is
// capped like the step rail: without a business or website only the first
// substep opens, and the done beat (lastStep + 1) is never restored.
export function parseBasicsDraft(raw: string | null, email: string, lastStep: number): BasicsDraft | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (TEXT_FIELDS.some((k) => typeof d[k] !== "string")) return null;
  if (d.gender !== "f" && d.gender !== "m") return null;
  if (typeof d.step !== "number" || !Number.isInteger(d.step)) return null;
  const draft = d as unknown as BasicsDraft;
  if (draft.email !== email) return null;
  const hasBusiness = draft.business.trim().length > 0 || draft.website.trim().length > 0;
  const step = Math.max(0, Math.min(draft.step, hasBusiness ? lastStep : 0));
  return { ...draft, step };
}

// sessionStorage can throw (Safari private mode, storage disabled): a draft
// is a convenience, so every failure is ignored.
export function loadBasicsDraft(): string | null {
  try {
    return window.sessionStorage.getItem(BASICS_DRAFT_KEY);
  } catch {
    return null;
  }
}

export function saveBasicsDraft(draft: BasicsDraft): void {
  try {
    window.sessionStorage.setItem(BASICS_DRAFT_KEY, encodeBasicsDraft(draft));
  } catch { /* storage unavailable */ }
}

export function clearBasicsDraft(): void {
  try {
    window.sessionStorage.removeItem(BASICS_DRAFT_KEY);
  } catch { /* storage unavailable */ }
}
