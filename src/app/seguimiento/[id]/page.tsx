import { Suspense } from "react";
import SeguimientoExpediente from "./SeguimientoExpediente";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function ExpedienteContent({
  params,
}: PageProps) {
  const { id } = await params;

  return <SeguimientoExpediente id={id} />;
}

export default function Page({
  params,
}: PageProps) {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 24 }}>
          Cargando expediente de seguimiento...
        </main>
      }
    >
      <ExpedienteContent params={params} />
    </Suspense>
  );
}
