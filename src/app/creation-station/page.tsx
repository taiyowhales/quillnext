import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import GeneratorsClient from "./GeneratorsClient";

export default async function GeneratorsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { organizationId } = await getCurrentUserOrg();
  if (!organizationId) {
    redirect("/onboarding");
  }

  return <GeneratorsClient organizationId={organizationId} />;
}
