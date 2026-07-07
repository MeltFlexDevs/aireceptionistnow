import { NextResponse } from "next/server";

/**
 * ISO 3166-1 alpha-2 country → E.164 dial code, limited to the countries the
 * landing phone picker offers. Vercel injects `x-vercel-ip-country` on every
 * request from its edge network; anything we don't offer (or an unknown/local
 * request with no header) falls back to the US default so the picker always
 * shows a valid flag.
 */
const DIAL_BY_COUNTRY: Record<string, string> = {
  US: "+1",
  CA: "+1",
  GB: "+44",
  DE: "+49",
  FR: "+33",
  NL: "+31",
  SK: "+421",
  CZ: "+420",
  AT: "+43",
  CH: "+41",
  PL: "+48",
  IT: "+39",
  ES: "+34",
};

// Read the per-request geo header — never cache this route.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const country = (request.headers.get("x-vercel-ip-country") ?? "").toUpperCase();
  const dialCode = DIAL_BY_COUNTRY[country] ?? "+1";
  return NextResponse.json({ country: country || null, dialCode });
}
