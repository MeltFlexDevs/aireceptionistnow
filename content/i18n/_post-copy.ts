import type { ComponentType } from "react";
import type { FaqItem } from "@/app/(main)/blog/_components/prose";

// Shape of one translated blog article.
//
// Deliberately NOT the full PostMeta. A translation owns only the strings a
// translator can be wrong about; everything factual and structural - publish
// date, last-modified date, hero image and its geometry, author, industry
// pairing - is read from the English post at assembly time in posts-registry.ts.
//
// That split is what stops a German article from claiming a different published
// date than the English original it is a translation of, and it means a new
// hero image or a corrected date propagates to all seven locales in one edit.

export interface PostCopy {
  /**
   * English slug. The post's identity across locales and the join key back to
   * the English post - never a URL in a localized tree.
   */
  source: string;
  /**
   * Localized URL slug. Must equal BLOG_SLUGS[source][locale]; the registry
   * asserts it, because a slug that disagrees with the map is a page the router
   * builds at one URL and every link points at another.
   */
  slug: string;
  title: string;
  description: string;
  /** Localized, e.g. "12 Min. Lesezeit". */
  readingTime: string;
  /** Localized category label, e.g. "Branchen". */
  tag: string;
  heroAlt: string;
  keywords: string[];
  /** ids stay identical to the English post - they are anchor targets, not prose. */
  sections: { id: string; title: string }[];
  faqs: FaqItem[];
}

/** A generated per-post module: translated meta plus the rendered body. */
export interface PostModule {
  meta: PostCopy;
  default: ComponentType;
}
