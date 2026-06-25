import { Placeholder } from "../components/Placeholder";
import { ChartBar } from "../icons";

export default function AnalyticsPage() {
  return (
    <Placeholder
      title="Analytics"
      description="Deeper trends across call time, talk ratio, outcomes, and latency."
      icon={<ChartBar className="h-6 w-6" />}
      bullets={[
        "Call volume by hour, day, and month",
        "Talk-time and caller talk ratio",
        "Outcome and conversion funnels",
        "Per-number performance breakdown",
      ]}
    />
  );
}
