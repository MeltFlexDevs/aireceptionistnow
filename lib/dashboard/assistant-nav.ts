/**
 * Sidebar target for the receptionist item. With exactly one assistant the list
 * page only redirects to it, and that redirect runs after the loading shell has
 * streamed (a client-side hop), so link to the assistant directly. The redirect
 * in assistant/page.tsx stays as the fallback for old links.
 */
export function assistantsNavHref(count: number, assistant: { id: string } | null): string {
  return count === 1 && assistant ? `/dashboard/assistant/${assistant.id}` : "/dashboard/assistant";
}
