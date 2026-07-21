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
import DentalAnsweringService, {
  meta as dentalAnsweringServiceMeta,
} from "./dental-answering-service";
import LawFirmAnsweringService, {
  meta as lawFirmAnsweringServiceMeta,
} from "./law-firm-answering-service";
import AiReceptionistPrompts, {
  meta as aiReceptionistPromptsMeta,
} from "./ai-receptionist-prompts";
import AiReceptionistForHomeServices, {
  meta as aiReceptionistForHomeServicesMeta,
} from "./ai-receptionist-for-home-services";
import AiVsVirtualVsAnsweringService, {
  meta as aiVsVirtualVsAnsweringServiceMeta,
} from "./ai-receptionist-vs-virtual-receptionist-vs-answering-service";
import CostOfAMissedCall, {
  meta as costOfAMissedCallMeta,
} from "./cost-of-a-missed-call";
import AfterHoursAnsweringService, {
  meta as afterHoursAnsweringServiceMeta,
} from "./after-hours-answering-service";
import BilingualAiReceptionist, {
  meta as bilingualAiReceptionistMeta,
} from "./bilingual-ai-receptionist";
import TwentyFourSevenAiReceptionist, {
  meta as twentyFourSevenAiReceptionistMeta,
} from "./24-7-ai-receptionist";
import HowToReplaceFrontDeskReceptionist, {
  meta as howToReplaceFrontDeskReceptionistMeta,
} from "./how-to-replace-front-desk-receptionist-with-ai";
import MedicalAnsweringService, {
  meta as medicalAnsweringServiceMeta,
} from "./medical-answering-service";

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
  /** Raster (webp/png) image for og:image & schema - required when hero is an SVG, which social crawlers won't render. */
  ogImage?: string;
  keywords: string[];
  sections: { id: string; title: string }[];
  faqs: FaqItem[];
};

export type Post = PostMeta & { Body: ComponentType; author: AuthorKey };

const postAuthors: Record<string, AuthorKey> = {
  "can-an-ai-receptionist-replace-a-human-receptionist": "matus",
  "how-to-choose-an-ai-receptionist": "brano",
  "real-estate-answering-service": "matus",
  "ai-receptionist-pricing": "brano",
  "do-ai-voices-sound-human-on-the-phone": "matus",
  "hvac-answering-service": "brano",
  "dental-answering-service": "brano",
  "law-firm-answering-service": "matus",
  "ai-receptionist-prompts": "matus",
  "ai-receptionist-for-home-services": "brano",
  "ai-receptionist-vs-virtual-receptionist-vs-answering-service": "matus",
  "cost-of-a-missed-call": "brano",
  "after-hours-answering-service": "matus",
  "bilingual-ai-receptionist": "brano",
  "24-7-ai-receptionist": "matus",
  "how-to-replace-front-desk-receptionist-with-ai": "brano",
  "medical-answering-service": "matus",
};

export const posts: Post[] = [
  { ...canAiReplaceReceptionistMeta, Body: CanAiReplaceReceptionist },
  { ...howToChooseAiReceptionistMeta, Body: HowToChooseAiReceptionist },
  { ...realEstateAnsweringServiceMeta, Body: RealEstateAnsweringService },
  { ...aiReceptionistPricingMeta, Body: AiReceptionistPricing },
  { ...doAiVoicesSoundHumanMeta, Body: DoAiVoicesSoundHuman },
  { ...hvacAnsweringServiceMeta, Body: HvacAnsweringService },
  { ...dentalAnsweringServiceMeta, Body: DentalAnsweringService },
  { ...lawFirmAnsweringServiceMeta, Body: LawFirmAnsweringService },
  { ...aiReceptionistPromptsMeta, Body: AiReceptionistPrompts },
  { ...aiReceptionistForHomeServicesMeta, Body: AiReceptionistForHomeServices },
  { ...aiVsVirtualVsAnsweringServiceMeta, Body: AiVsVirtualVsAnsweringService },
  { ...costOfAMissedCallMeta, Body: CostOfAMissedCall },
  { ...afterHoursAnsweringServiceMeta, Body: AfterHoursAnsweringService },
  { ...bilingualAiReceptionistMeta, Body: BilingualAiReceptionist },
  {
    ...twentyFourSevenAiReceptionistMeta,
    Body: TwentyFourSevenAiReceptionist,
  },
  {
    ...howToReplaceFrontDeskReceptionistMeta,
    Body: HowToReplaceFrontDeskReceptionist,
  },
  { ...medicalAnsweringServiceMeta, Body: MedicalAnsweringService },
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
