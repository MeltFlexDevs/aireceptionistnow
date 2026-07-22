import { IndustryHome } from "@/app/_home/IndustryHome";
import { industryMetadata } from "@/app/_home/industry-content";

export const metadata = industryMetadata("property-management");

export default function Page() {
  return <IndustryHome slug="property-management" />;
}
