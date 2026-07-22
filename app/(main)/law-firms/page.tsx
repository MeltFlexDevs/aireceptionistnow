import { IndustryHome } from "@/app/_home/IndustryHome";
import { industryMetadata } from "@/app/_home/industry-content";

export const metadata = industryMetadata("law-firms");

export default function Page() {
  return <IndustryHome slug="law-firms" />;
}
