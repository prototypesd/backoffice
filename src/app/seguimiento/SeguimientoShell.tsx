import Header from "@/components/Header";

import base from "@/app/nuevas-solicitudes/solicitudes.module.scss";

export default function SeguimientoShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={base.shell}>
      <div className={base.main}>
        <Header />
        {children}
      </div>
    </div>
  );
}
