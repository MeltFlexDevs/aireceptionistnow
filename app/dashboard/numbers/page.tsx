import { redirect } from "next/navigation";

// Number management lives in the Receptionist hero now: get/claim, unlink, and
// (with more than one receptionist) reassign. The modules in this folder -
// voices, voiceActions, VoiceSelect, languages, actions - are still imported by
// the receptionist page and by onboarding, so only the pages are shimmed.
export default function NumbersPage() {
  redirect("/dashboard/assistant");
}
