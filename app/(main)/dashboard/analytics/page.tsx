import { redirect } from "next/navigation";

// The separate analytics screen is gone: its KPI tiles, call-volume chart and
// sentiment donut are now Home's This-month view. The data functions
// (getAnalyticsCached, getAssistantStatsCached) stay in lib/dashboard/analytics.
export default function AnalyticsPage() {
  redirect("/dashboard?range=month");
}
