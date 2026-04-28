import type { Metadata } from "next";
import { SetupWizard } from "@/components/setup-wizard";

export const metadata: Metadata = {
  title: "Create a Surprise — BirthdayDrop",
  description:
    "Set up your birthday surprise in minutes. Collect wishes and reveal them on the big day.",
};

export default function SetupPage() {
  return <SetupWizard />;
}
