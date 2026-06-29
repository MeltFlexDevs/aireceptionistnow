import type { ComponentType } from "react";
import type { FaqItem } from "../_components/prose";
import { defaultAuthorKey, type AuthorKey } from "@/lib/site";

import CanAiReplaceReceptionist, {
  meta as canAiReplaceReceptionistMeta,
} from "./can-an-ai-receptionist-replace-a-human-receptionist";
import HowToChooseAiReceptionist, {
  meta as howToChooseAiReceptionistMeta,
} from "./how-to-choose-an-ai-receptionist";
import RealEstateAnsweringService, {
  meta as realEstateAnsweringServiceMeta,
} from "./real-estate-answering-service";
import AiReceptionistPricing, {
  meta as aiReceptionistPricingMeta,
} from "./ai-receptionist-pricing";
import DoAiVoicesSoundHuman, {
  meta as doAiVoicesSoundHumanMeta,
} from "./do-ai-voices-sound-human-on-the-phone";
import HvacAnsweringService, {
  meta as hvacAnsweringServiceMeta,
} from "./hvac-answering-service";

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  readingTime: string;
  tag: string;
  hero: string;
  heroAlt: string;
  heroWidth: number;
  heroHeight: number;
  heroCredit?: string;
  heroCreditUrl?: string;
  keywords: string[];
  sections: { id: string; title: string }[];
  faqs: FaqItem[];
};

export type Post = PostMeta & { Body: ComponentType; author: AuthorKey };

/** Which author is credited on each post. */
const postAuthors: Record<string, AuthorKey> = {
  "can-an-ai-receptionist-replace-a-human-receptionist": "matus",
  "how-to-choose-an-ai-receptionist": "brano",
  "real-estate-answering-service": "matus",
  "ai-receptionist-pricing": "brano",
  "do-ai-voices-sound-human-on-the-phone": "matus",
  "hvac-answering-service": "brano",
};

export const posts: Post[] = [
  { ...canAiReplaceReceptionistMeta, Body: CanAiReplaceReceptionist },
  { ...howToChooseAiReceptionistMeta, Body: HowToChooseAiReceptionist },
  { ...realEstateAnsweringServiceMeta, Body: RealEstateAnsweringService },
  { ...aiReceptionistPricingMeta, Body: AiReceptionistPricing },
  { ...doAiVoicesSoundHumanMeta, Body: DoAiVoicesSoundHuman },
  { ...hvacAnsweringServiceMeta, Body: HvacAnsweringService },
]
  .map((p) => ({ ...p, author: postAuthors[p.slug] ?? defaultAuthorKey }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
