import { redirect } from "next/navigation";

// The business list and its create form are gone: one account, one business,
// and Knowledge creates the row on the first teach action. Knowledge is the
// single editable knowledge surface now.
export default function CompanyPage() {
  redirect("/dashboard/knowledge");
}
