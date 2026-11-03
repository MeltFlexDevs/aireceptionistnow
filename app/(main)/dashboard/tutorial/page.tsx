import { redirect } from "next/navigation";

// The standalone tutorial is gone. Kept as a shim so old links and bookmarks
// still land on the dashboard.
export default function TutorialPage() {
  redirect("/dashboard");
}
