import type { ContentLocale } from "@/lib/i18n/marketing/locales";
import type { BlogCopy } from "./_blog-copy";
import { enBlog } from "./en/pages/blog";
import { deBlog } from "./de/pages/blog";
import { esBlog } from "./es/pages/blog";
import { frBlog } from "./fr/pages/blog";
import { itBlog } from "./it/pages/blog";
import { nlBlog } from "./nl/pages/blog";
import { ptBlog } from "./pt/pages/blog";
import { skBlog } from "./sk/pages/blog";

// Blog chrome copy, keyed by locale. Total over ContentLocale like UI_COPY, so
// adding a locale without adding its blog.ts is a compile error rather than a
// localized article silently rendering "Keep reading" in English.
export const BLOG_COPY: Record<ContentLocale, BlogCopy> = {
  en: enBlog,
  es: esBlog,
  de: deBlog,
  fr: frBlog,
  sk: skBlog,
  it: itBlog,
  pt: ptBlog,
  nl: nlBlog,
};
