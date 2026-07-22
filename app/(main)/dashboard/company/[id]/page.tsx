import { redirect } from "next/navigation";

// Website import, PDF upload, notes and source removal all moved to
// /dashboard/knowledge. Kept as a shim so old links still land.
export default function CompanyDetailPage() {
  redirect("/dashboard/knowledge");
}
