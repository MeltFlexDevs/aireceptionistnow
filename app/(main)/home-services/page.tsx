import { IndustryHome } from "@/app/_home/IndustryHome";
import { industryMetadata } from "@/app/_home/industry-content";

export const metadata = industryMetadata("home-services");

export default function Page() {
  return <IndustryHome slug="home-services" />;
}
