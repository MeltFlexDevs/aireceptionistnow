import { redirect } from "next/navigation";

// Per-number settings moved into the Receptionist hero.
export default function NumberDetailPage() {
  redirect("/dashboard/assistant");
}
