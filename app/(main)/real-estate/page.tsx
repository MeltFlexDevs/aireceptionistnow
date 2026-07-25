import { IndustryHome } from "@/app/_home/IndustryHome";
import { industryMetadata } from "@/app/_home/industry-content";

export const metadata = industryMetadata("real-estate");

export default function Page() {
  return <IndustryHome slug="real-estate" />;
}
