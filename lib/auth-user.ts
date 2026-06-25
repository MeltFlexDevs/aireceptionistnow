/**
 * Display-facing user info derived from the validated Supabase JWT claims.
 */
export interface AppUser {
  id: string;
  email: string;
  name: string;
  initials: string;
}

type Claims = Record<string, unknown> & {
  sub?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email;
  const words = source.split(/[\s@.]+/).filter(Boolean);
  const letters =
    words.length >= 2 ? words[0][0] + words[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export function toAppUser(claims: Claims): AppUser {
  const email = claims.email ?? "";
  const meta = claims.user_metadata ?? {};
  const name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    email.split("@")[0] ||
    "Account";
  return {
    id: claims.sub ?? "",
    email,
    name,
    initials: initialsFrom(name, email),
  };
}
