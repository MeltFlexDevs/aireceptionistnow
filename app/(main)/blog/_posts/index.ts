import type { ComponentType } from "react";
import type { FaqItem } from "../_components/prose";
import { defaultAuthorKey, type AuthorKey } from "@/lib/site";
import type { IndustrySlug } from "@/lib/marketing/industries";
import { isRetiredBlogPost } from "@/lib/marketing/retired-posts";

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
import BestAiReceptionist, {
  meta as bestAiReceptionistMeta,
} from "./best-ai-receptionist";
import AiReceptionistForItCompanies, {
  meta as aiReceptionistForItCompaniesMeta,
} from "./ai-receptionist-for-it-companies";
import AiReceptionistAppointmentBooking, {
  meta as aiReceptionistAppointmentBookingMeta,
} from "./ai-receptionist-appointment-booking";
import AnsweringServiceForSmallBusiness, {
  meta as answeringServiceForSmallBusinessMeta,
} from "./answering-service-for-small-business";
import AnsweringServiceCost, {
  meta as answeringServiceCostMeta,
} from "./answering-service-cost";
import VirtualReceptionistPricing, {
  meta as virtualReceptionistPricingMeta,
} from "./virtual-receptionist-pricing";
import PropertyManagementAnsweringService, {
  meta as propertyManagementAnsweringServiceMeta,
} from "./property-management-answering-service";
import TwentyFourHourAnsweringService, {
  meta as twentyFourHourAnsweringServiceMeta,
} from "./24-hour-answering-service";
import PlumbingAnsweringService, {
  meta as plumbingAnsweringServiceMeta,
} from "./plumbing-answering-service";
import TelephoneAnsweringService, {
  meta as telephoneAnsweringServiceMeta,
} from "./telephone-answering-service";
import RoofingAnsweringService, {
  meta as roofingAnsweringServiceMeta,
} from "./roofing-answering-service";
import ContractorAnsweringService, {
  meta as contractorAnsweringServiceMeta,
} from "./contractor-answering-service";
import ElectricianAnsweringService, {
  meta as electricianAnsweringServiceMeta,
} from "./electrician-answering-service";
import VeterinaryAnsweringService, {
  meta as veterinaryAnsweringServiceMeta,
} from "./veterinary-answering-service";
import TowingAnsweringService, {
  meta as towingAnsweringServiceMeta,
} from "./towing-answering-service";
import HowToForwardCallsToAnAnsweringService, {
  meta as howToForwardCallsToAnAnsweringServiceMeta,
} from "./how-to-forward-calls-to-an-answering-service";
import ApartmentAnsweringService, {
  meta as apartmentAnsweringServiceMeta,
} from "./apartment-answering-service";
import HowToSetUpEmergencyCallEscalation, {
  meta as howToSetUpEmergencyCallEscalationMeta,
} from "./how-to-set-up-emergency-call-escalation";
import HomeCareAnsweringService, {
  meta as homeCareAnsweringServiceMeta,
} from "./home-care-answering-service";
import MissedCallTextBack, {
  meta as missedCallTextBackMeta,
} from "./missed-call-text-back";

import SalonAnsweringService, {
  meta as salonAnsweringServiceMeta,
} from "./salon-answering-service";
import FuneralHomeAnsweringService, {
  meta as funeralHomeAnsweringServiceMeta,
} from "./funeral-home-answering-service";
import AiVoiceAgentVsChatbotVsIvr, {
  meta as aiVoiceAgentVsChatbotVsIvrMeta,
} from "./ai-voice-agent-vs-chatbot-vs-ivr";
import TwilioVsDialpadVsFreshworksVsEliseai, {
  meta as twilioVsDialpadVsFreshworksVsEliseaiMeta,
} from "./twilio-vs-dialpad-vs-freshworks-vs-eliseai";
import BestAiReceptionistForDentalPractices, {
  meta as bestAiReceptionistForDentalPracticesMeta,
} from "./best-ai-receptionist-for-dental-practices";
import BestAiPhoneAnsweringForRestaurants, {
  meta as bestAiPhoneAnsweringForRestaurantsMeta,
} from "./best-ai-phone-answering-for-restaurants";
import BestAiReceptionistForHomeServices, {
  meta as bestAiReceptionistForHomeServicesMeta,
} from "./best-ai-receptionist-for-home-services";
import MedicalAnsweringServicePricing, {
  meta as medicalAnsweringServicePricingMeta,
} from "./medical-answering-service-pricing";
import BilingualAnsweringService, {
  meta as bilingualAnsweringServiceMeta,
} from "./bilingual-answering-service";
import ChiropracticAnsweringService, {
  meta as chiropracticAnsweringServiceMeta,
} from "./chiropractic-answering-service";
import HomeServicesAnsweringService, {
  meta as homeServicesAnsweringServiceMeta,
} from "./home-services-answering-service";
import LiveAnsweringService, {
  meta as liveAnsweringServiceMeta,
} from "./live-answering-service";
import AccountingAnsweringService, {
  meta as accountingAnsweringServiceMeta,
} from "./accounting-answering-service";
import InsuranceAnsweringService, {
  meta as insuranceAnsweringServiceMeta,
} from "./insurance-answering-service";

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
  /**
   * Ranking posts only: the ordered shortlist the article evaluates, emitted as
   * ItemList JSON-LD alongside BlogPosting. Position is meaningful - index 0 is
   * the article's first pick - so only set this where the prose actually ranks.
   */
  itemList?: { name: string; description: string; url?: string }[];
};

export type Post = PostMeta & {
  Body: ComponentType;
  author: AuthorKey;
  /** Industry landing page this post is the topical twin of, if any. */
  industry?: IndustrySlug;
};

// Posts that map onto an industry landing page. Rendered as an inbound
// "Built for {industry}?" link in the post template - the industry pages'
// only editorial inbound links, which they otherwise lack entirely.
const postIndustry: Record<string, IndustrySlug> = {
  "dental-answering-service": "dentists",
  "medical-answering-service": "medical",
  "hvac-answering-service": "home-services",
  "ai-receptionist-for-home-services": "home-services",
  "law-firm-answering-service": "law-firms",
  "real-estate-answering-service": "real-estate",
  "property-management-answering-service": "property-management",
  "plumbing-answering-service": "home-services",
  "roofing-answering-service": "home-services",
  "contractor-answering-service": "home-services",
  "electrician-answering-service": "home-services",
  "apartment-answering-service": "property-management",
  "best-ai-receptionist-for-dental-practices": "dentists",
  "best-ai-phone-answering-for-restaurants": "restaurants",
  "best-ai-receptionist-for-home-services": "home-services",
  "medical-answering-service-pricing": "medical",
  "chiropractic-answering-service": "medical",
  "home-services-answering-service": "home-services",
};

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
  "best-ai-receptionist": "matus",
  "ai-receptionist-for-it-companies": "brano",
  "ai-receptionist-appointment-booking": "brano",
  "answering-service-for-small-business": "brano",
  "answering-service-cost": "matus",
  "virtual-receptionist-pricing": "brano",
  "property-management-answering-service": "matus",
  "24-hour-answering-service": "brano",
  "plumbing-answering-service": "matus",
  "telephone-answering-service": "brano",
  "roofing-answering-service": "matus",
  "contractor-answering-service": "brano",
  "electrician-answering-service": "matus",
  "veterinary-answering-service": "brano",
  "towing-answering-service": "matus",
  "how-to-forward-calls-to-an-answering-service": "brano",
  "apartment-answering-service": "matus",
  "how-to-set-up-emergency-call-escalation": "brano",
  "home-care-answering-service": "brano",
  "missed-call-text-back": "brano",
  "salon-answering-service": "matus",
  "funeral-home-answering-service": "brano",
  "ai-voice-agent-vs-chatbot-vs-ivr": "matus",
  "twilio-vs-dialpad-vs-freshworks-vs-eliseai": "brano",
  "best-ai-receptionist-for-dental-practices": "brano",
  "best-ai-phone-answering-for-restaurants": "matus",
  "best-ai-receptionist-for-home-services": "brano",
  "medical-answering-service-pricing": "brano",
  "bilingual-answering-service": "matus",
  "chiropractic-answering-service": "matus",
  "home-services-answering-service": "matus",
  "live-answering-service": "matus",
  "accounting-answering-service": "brano",
  "insurance-answering-service": "matus",
};

// Every module, retired ones included. Retired posts stay registered only so
// their translations can read their facts; nothing public lists them (the
// sitemap reads this list only to emit those translations' rows).
export const allPosts: Post[] = [
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
  { ...bestAiReceptionistMeta, Body: BestAiReceptionist },
  {
    ...aiReceptionistForItCompaniesMeta,
    Body: AiReceptionistForItCompanies,
  },
  {
    ...aiReceptionistAppointmentBookingMeta,
    Body: AiReceptionistAppointmentBooking,
  },
  {
    ...answeringServiceForSmallBusinessMeta,
    Body: AnsweringServiceForSmallBusiness,
  },
  { ...answeringServiceCostMeta, Body: AnsweringServiceCost },
  { ...virtualReceptionistPricingMeta, Body: VirtualReceptionistPricing },
  {
    ...propertyManagementAnsweringServiceMeta,
    Body: PropertyManagementAnsweringService,
  },
  {
    ...twentyFourHourAnsweringServiceMeta,
    Body: TwentyFourHourAnsweringService,
  },
  { ...plumbingAnsweringServiceMeta, Body: PlumbingAnsweringService },
  { ...telephoneAnsweringServiceMeta, Body: TelephoneAnsweringService },
  { ...roofingAnsweringServiceMeta, Body: RoofingAnsweringService },
  { ...contractorAnsweringServiceMeta, Body: ContractorAnsweringService },
  { ...electricianAnsweringServiceMeta, Body: ElectricianAnsweringService },
  { ...veterinaryAnsweringServiceMeta, Body: VeterinaryAnsweringService },
  { ...towingAnsweringServiceMeta, Body: TowingAnsweringService },
  {
    ...howToForwardCallsToAnAnsweringServiceMeta,
    Body: HowToForwardCallsToAnAnsweringService,
  },
  { ...apartmentAnsweringServiceMeta, Body: ApartmentAnsweringService },
  {
    ...howToSetUpEmergencyCallEscalationMeta,
    Body: HowToSetUpEmergencyCallEscalation,
  },
  { ...homeCareAnsweringServiceMeta, Body: HomeCareAnsweringService },
  { ...missedCallTextBackMeta, Body: MissedCallTextBack },
  { ...salonAnsweringServiceMeta, Body: SalonAnsweringService },
  { ...funeralHomeAnsweringServiceMeta, Body: FuneralHomeAnsweringService },
  {
    ...aiVoiceAgentVsChatbotVsIvrMeta,
    Body: AiVoiceAgentVsChatbotVsIvr,
  },
  {
    ...twilioVsDialpadVsFreshworksVsEliseaiMeta,
    Body: TwilioVsDialpadVsFreshworksVsEliseai,
  },
  {
    ...bestAiReceptionistForDentalPracticesMeta,
    Body: BestAiReceptionistForDentalPractices,
  },
  {
    ...bestAiPhoneAnsweringForRestaurantsMeta,
    Body: BestAiPhoneAnsweringForRestaurants,
  },
  {
    ...bestAiReceptionistForHomeServicesMeta,
    Body: BestAiReceptionistForHomeServices,
  },
  {
    ...medicalAnsweringServicePricingMeta,
    Body: MedicalAnsweringServicePricing,
  },
  { ...bilingualAnsweringServiceMeta, Body: BilingualAnsweringService },
  { ...chiropracticAnsweringServiceMeta, Body: ChiropracticAnsweringService },
  {
    ...homeServicesAnsweringServiceMeta,
    Body: HomeServicesAnsweringService,
  },
  { ...liveAnsweringServiceMeta, Body: LiveAnsweringService },
  { ...accountingAnsweringServiceMeta, Body: AccountingAnsweringService },
  { ...insuranceAnsweringServiceMeta, Body: InsuranceAnsweringService },
]
  .map((p) => ({
    ...p,
    author: postAuthors[p.slug] ?? defaultAuthorKey,
    industry: postIndustry[p.slug],
  }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

/** Live English posts: what the index, sitemap, llms.txt and related links show. */
export const posts: Post[] = allPosts.filter((p) => !isRetiredBlogPost(p.slug));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

/**
 * Any post, retired or not. Only for code that needs a translation's English
 * source (posts-registry); an English page must use getPost so a retired post
 * can never render on its old URL.
 */
export function getSourcePost(slug: string): Post | undefined {
  return allPosts.find((p) => p.slug === slug);
}

// Words too generic to signal topical similarity between posts.
const RELATED_STOPWORDS = new Set([
  "ai",
  "receptionist",
  "receptionists",
  "virtual",
  "answering",
  "service",
  "services",
  "phone",
  "call",
  "calls",
  "business",
  "small",
  "guide",
  "2026",
  "how",
  "what",
  "much",
  "does",
  "cost",
  "for",
  "with",
  "the",
  "and",
]);

function topicWords(p: PostMeta): Set<string> {
  const words = [...p.keywords, p.title, p.slug.replace(/-/g, " ")]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9/]+/)
    .filter((w) => w.length > 2 && !RELATED_STOPWORDS.has(w));
  return new Set(words);
}

/**
 * Topically closest posts (shared tag + keyword overlap), newest first on ties.
 * `includeRetired` is for translations: a retired post's localized version is
 * still live in its locale, so it may both ask for and be offered as related.
 */
export function relatedPosts(
  slug: string,
  n = 3,
  { includeRetired = false }: { includeRetired?: boolean } = {},
): Post[] {
  const pool = includeRetired ? allPosts : posts;
  const current = pool.find((p) => p.slug === slug);
  if (!current) return pool.slice(0, n);
  const currentWords = topicWords(current);
  return pool
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let overlap = 0;
      for (const w of topicWords(p)) if (currentWords.has(w)) overlap++;
      return { p, score: (p.tag === current.tag ? 2 : 0) + overlap };
    })
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, n)
    .map((x) => x.p);
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
