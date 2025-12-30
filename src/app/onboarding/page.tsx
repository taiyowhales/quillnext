import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBlueprintProgress } from "@/server/actions/blueprint";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { organizationId } = await getCurrentUserOrg(session);
  const progress = await getBlueprintProgress(organizationId);

  return (
    <div className="min-h-screen bg-qc-parchment">
      <OnboardingWizard initialStep={progress.step} initialData={progress.data} />
    </div>
  );
}

