import { EN_NOT_FOUND_LINKS } from "@/app/components/en-not-found-links";

// Did-you-mean targets for the (main) 404, built once at build time. That 404
// fetches them: importing the list would pull the blog and answer registries'
// client parts into its entry, which every English page loads.
export const dynamic = "force-static";

export function GET(): Response {
  return Response.json(EN_NOT_FOUND_LINKS);
}
