import { NextResponse } from "next/server";

const DIAL_BY_COUNTRY: Record<string, string> = {
  US: "+1",
  CA: "+1",
  GB: "+44",
  IE: "+353",
  DE: "+49",
  FR: "+33",
  BE: "+32",
  NL: "+31",
  LU: "+352",
  SK: "+421",
  CZ: "+420",
  AT: "+43",
  CH: "+41",
  PL: "+48",
  HU: "+36",
  IT: "+39",
  ES: "+34",
  PT: "+351",
  DK: "+45",
  SE: "+46",
  NO: "+47",
  FI: "+358",
  RO: "+40",
  HR: "+385",
  SI: "+386",
  GR: "+30",
};

// Read the per-request geo header — never cache this route.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const country = (request.headers.get("x-vercel-ip-country") ?? "").toUpperCase();
  const match = DIAL_BY_COUNTRY[country];

  // `matched` lets the caller tell "the visitor really is in the US" apart from
  // "no idea". Both used to return "+1", so anyone whose country header was
  // missing or outside this map was shown a US flag - including visitors on a
  // German or Slovak page. When matched is false the client keeps its own
  // locale-derived default instead. dialCode stays populated for compatibility.
  return NextResponse.json({
    country: country || null,
    dialCode: match ?? "+1",
    matched: Boolean(match),
  });
}
