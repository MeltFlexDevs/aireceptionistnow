import { redirect } from "next/navigation";

// Calendar connect, set primary, disconnect and reconnect all live on
// Appointments now - one home for calendar state instead of a nav-less page
// users had to be told about.
export default function IntegrationsPage() {
  redirect("/dashboard/calendar");
}
