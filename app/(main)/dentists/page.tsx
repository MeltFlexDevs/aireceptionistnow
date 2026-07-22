import { IndustryHome } from "@/app/_home/IndustryHome";
import { industryMetadata } from "@/app/_home/industry-content";

export const metadata = industryMetadata("dentists");

export default function Page() {
  return <IndustryHome slug="dentists" />;
}
