import { redirect } from "next/navigation";

// The standalone tutorial is gone; the floating guide overlay explains each
// page in place. Kept as a shim so old links and bookmarks still land.
export default function TutorialPage() {
  redirect("/dashboard");
}
