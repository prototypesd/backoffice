import { Suspense } from "react";
import ExpedienteClient from "./ExpedienteClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Cargando expediente...</div>}>
      <ExpedienteClient />
    </Suspense>
  );
}
