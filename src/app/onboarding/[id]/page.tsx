import { Suspense } from "react";
import OnboardingUser from "./OnboardingUser";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Cargando onboarding...</div>}>
      <OnboardingUser />
    </Suspense>
  );
}
