"use client";

import { useMemo, useState } from "react";
import {
  Search,
  RotateCcw,
  FolderOpen,
  X,
  Inbox,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import base from "../solicitudes/solicitudes.module.scss";
import styles from "./seguimiento.module.scss";
import Header from "@/components/Header";

type Solicitud = {
  id: string;
  cliente: string;
  email: string;
  ciudad: string;
  monto: number;
  estado: string;
  paso: string;
  responsable: string;
  fecha: string;
  tipo: string;
  observadaPorMi: boolean;
  desembolsada: boolean;
};

const initialData: Solicitud[] = [
  {
    id: "KIVO-WEB-001-2026-LP",
    cliente: "Gabriel Iglesias",
    email: "cliente_1@example.com",
    ciudad: "La Paz",
    monto: 7000,
    estado: "En revisión",
    paso: "2. Revisión financiera del gestor de préstamos",
    responsable: "Gestor de Préstamos",
    fecha: "21/11/2026 09:51",
    tipo: "Nuevo",
    observadaPorMi: false,
    desembolsada: false,
  },
  {
    id: "KIVO-WEB-002-2026-LP",
    cliente: "María Fernández",
    email: "cliente_2@example.com",
    ciudad: "La Paz",
    monto: 15000,
    estado: "En revisión",
    paso: "3. Evaluación crediticia",
    responsable: "Asesor",
    fecha: "21/11/2026 10:15",
    tipo: "Nuevo",
    observadaPorMi: false,
    desembolsada: false,
  },
  {
    id: "KIVO-OFI-003-2026-CB",
    cliente: "Carlos Mendoza",
    email: "cliente_3@example.com",
    ciudad: "Cochabamba",
    monto: 10000,
    estado: "Observada",
    paso: "2. Corrección de documentación",
    responsable: "Legal",
    fecha: "20/11/2026 16:42",
    tipo: "Recurrente",
    observadaPorMi: true,
    desembolsada: false,
  },
  {
    id: "KIVO-WEB-004-2026-SC",
    cliente: "Ana Rodríguez",
    email: "cliente_4@example.com",
    ciudad: "Santa Cruz",
    monto: 25000,
    estado: "Aprobada",
    paso: "4. Formalización del préstamo",
    responsable: "Supervisor",
    fecha: "19/11/2026 14:30",
    tipo: "Nuevo",
    observadaPorMi: false,
    desembolsada: false,
  },
  {
    id: "KIVO-OFI-005-2026-LP",
    cliente: "Pedro Vargas",
    email: "cliente_5@example.com",
    ciudad: "La Paz",
    monto: 5000,
    estado: "Rechazada",
    paso: "3. Evaluación crediticia",
    responsable: "Legal",
    fecha: "18/11/2026 11:20",
    tipo: "Nuevo",
    observadaPorMi: false,
    desembolsada: false,
  },
  {
    id: "KIVO-WEB-006-2026-CB",
    cliente: "Lucía Morales",
    email: "cliente_6@example.com",
    ciudad: "Cochabamba",
    monto: 30000,
    estado: "Desembolsada",
    paso: "6. Desembolso completado",
    responsable: "Gestor de Préstamos",
    fecha: "17/11/2026 09:00",
    tipo: "Recurrente",
    observadaPorMi: false,
    desembolsada: true,
  },
  {
    id: "KIVO-WEB-007-2026-SC",
    cliente: "Roberto Flores",
    email: "cliente_7@example.com",
    ciudad: "Santa Cruz",
    monto: 12000,
    estado: "En revisión",
    paso: "1. Verificación de identidad",
    responsable: "Asesor",
    fecha: "21/11/2026 08:30",
    tipo: "Nuevo",
    observadaPorMi: false,
    desembolsada: false,
  },
  {
    id: "KIVO-OFI-008-2026-LP",
    cliente: "Patricia López",
    email: "cliente_8@example.com",
    ciudad: "La Paz",
    monto: 8000,
    estado: "Observada",
    paso: "2. Validación de ingresos",
    responsable: "Supervisor",
    fecha: "20/11/2026 13:10",
    tipo: "Recurrente",
    observadaPorMi: true,
    desembolsada: false,
  },
];

const currency = (n: number) =>
  `Bs ${n.toLocaleString("es-BO")}`;

const ESTADO_TINTA: Record<string, { bg: string; fg: string; dot: string }> = {
  "En revisión": { bg: "#E6F7FF", fg: "#0077B3", dot: "#00AEFF" },
  "Observada": { bg: "#FFF4E0", fg: "#8A5A00", dot: "#FF9900" },
  "Aprobada": { bg: "#E7F6EC", fg: "#1E7A43", dot: "#1FA855" },
  "Rechazada": { bg: "#FDECEA", fg: "#B3261E", dot: "#E5484D" },
  "Desembolsada": { bg: "#EEF0F3", fg: "#3D4450", dot: "#5B616E" },
};

const CARDS_SEG: {
  key: string;
  label: string;
  desc: string;
  tone: string;
  icon: typeof Inbox;
}[] = [
  { key: "", label: "Todas", desc: "Según los filtros actuales", tone: "#00AEFF", icon: Inbox },
  { key: "En revisión", label: "En revisión", desc: "En proceso", tone: "#00AEFF", icon: Clock },
  { key: "Observada", label: "Observadas", desc: "Requieren atención", tone: "#FF9900", icon: AlertTriangle },
  { key: "Aprobada", label: "Aprobadas", desc: "Listas para formalizar", tone: "#1FA855", icon: CheckCircle2 },
  { key: "Desembolsada", label: "Desembolsadas", desc: "Préstamos completados", tone: "#5B616E", icon: Banknote },
];

function dateToISO(value: string) {
  const [date] = value.split(" ");
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}

export default function SeguimientoPage() {
  const [data] = useState(initialData);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [ciudad, setCiudad] = useState("Todas");
  const [tipo, setTipo] = useState("Todos");
  const [desde, setDesde] = useState("2026-11-01");
  const [hasta, setHasta] = useState("2026-11-30");

  const [tab, setTab] = useState<"todas" | "observadas">("todas");
  const [desembolsadas, setDesembolsadas] = useState(false);
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const term = query.trim().toLowerCase();
      const fecha = dateToISO(item.fecha);

      const matchesQuery =
        !term ||
        [
          item.id,
          item.cliente,
          item.email,
          item.ciudad,
        ].some((value) =>
          value.toLowerCase().includes(term)
        );

      return (
        matchesQuery &&
        (estado === "Todos" || item.estado === estado) &&
        (ciudad === "Todas" || item.ciudad === ciudad) &&
        (tipo === "Todos" || item.tipo === tipo) &&
        (!desde || fecha >= desde) &&
        (!hasta || fecha <= hasta) &&
        (tab === "todas" || item.observadaPorMi) &&
        (desembolsadas || !item.desembolsada)
      );
    });
  }, [
    data, query, estado, ciudad, tipo,
    desde, hasta, tab, desembolsadas
  ]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const observedCount = data.filter(
    (item) => item.observadaPorMi && !item.desembolsada
  ).length;

  function clearFilters() {
    setSearch("");
    setQuery("");
    setEstado("Todos");
    setCiudad("Todas");
    setTipo("Todos");
    setDesde("2026-11-01");
    setHasta("2026-11-30");
    setPage(1);
  }

  return (
    <div className={base.shell}>
      <main className={base.main}>
        <Header />

        <div className={base.content}>
          <h1 className={base.pageTitle}>Seguimiento de solicitudes</h1>
          <p className={base.pageSub}>
            Consulta el estado, avance y responsable de las solicitudes de préstamo.
          </p>

          <div className={base.cards} role="group" aria-label="Filtrar por estado">
            {CARDS_SEG.map((c) => {
              const Icon = c.icon;
              const pressed = c.key !== "" && estado === c.key;
              const num =
                c.key === ""
                  ? data.filter((r) => desembolsadas || !r.desembolsada).length
                  : data.filter(
                      (r) =>
                        r.estado === c.key && (desembolsadas || !r.desembolsada)
                    ).length;

              return (
                <button
                  type="button"
                  key={c.label}
                  className={base.card}
                  aria-pressed={pressed}
                  style={{ "--card-tone": c.tone } as Record<string, string>}
                  onClick={() => {
                    setEstado(c.key === "" || estado === c.key ? "Todos" : c.key);
                    setPage(1);
                  }}
                >
                  <span className={base.cardLabel}>{c.label}</span>
                  <span className={base.cardNum}>{num}</span>
                  <span className={base.cardDesc}>{c.desc}</span>
                  <span className={base.cardBlob} aria-hidden="true" />
                  <span className={base.cardIcon} aria-hidden="true">
                    <Icon size={40} strokeWidth={2.1} />
                  </span>
                </button>
              );
            })}
          </div>

          <section className={`${base.panel} ${styles.panel}`}>
            <div className={styles.filters}>
              <form
                className={styles.searchForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  setQuery(search);
                  setPage(1);
                }}
              >
                <Search size={19} />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por carnet de identidad, nombre o celular..."
                />

                <button type="submit">Buscar</button>
              </form>

              <div className={styles.filterGrid}>
                <label>
                  Estado
                  <select
                    value={estado}
                    onChange={(e) => { setEstado(e.target.value); setPage(1); }}
                  >
                    <option value="Todos">Todos los estados</option>
                    <option>En revisión</option>
                    <option>Observada</option>
                    <option>Aprobada</option>
                    <option>Rechazada</option>
                    <option>Desembolsada</option>
                  </select>
                </label>

                <label>
                  Ciudad
                  <select
                    value={ciudad}
                    onChange={(e) => { setCiudad(e.target.value); setPage(1); }}
                  >
                    <option>Todas</option>
                    <option>La Paz</option>
                    <option>Cochabamba</option>
                    <option>Santa Cruz</option>
                  </select>
                </label>

                <label>
                  Tipo de cliente
                  <select
                    value={tipo}
                    onChange={(e) => { setTipo(e.target.value); setPage(1); }}
                  >
                    <option>Todos</option>
                    <option>Nuevo</option>
                    <option>Recurrente</option>
                  </select>
                </label>

                <label>
                  Fecha desde
                  <input
                    type="date"
                    value={desde}
                    onChange={(e) => { setDesde(e.target.value); setPage(1); }}
                  />
                </label>

                <label>
                  Fecha hasta
                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => { setHasta(e.target.value); setPage(1); }}
                  />
                </label>

                <button
                  type="button"
                  className={styles.clear}
                  onClick={clearFilters}
                ><RotateCcw size={14} aria-hidden="true" />Limpiar filtros
                </button>
              </div>

              <div className={styles.count}>
                {filtered.length} solicitudes
              </div>
            </div>

            <div className={styles.tabs}>
              <button
                className={tab === "todas" ? styles.activeTab : ""}
                onClick={() => { setTab("todas"); setPage(1); }}
              >
                Todas · {data.filter((r) => desembolsadas || !r.desembolsada).length}
              </button>

              

              <button
                className={desembolsadas ? styles.activeTab : ""}
                onClick={() => {
                  setDesembolsadas(!desembolsadas);
                  setPage(1);
                }}
              >
                {desembolsadas
                  ? "Ocultar desembolsadas"
                  : "Mostrar desembolsadas"}
              </button>
            </div>

            <div className={base.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Solicitud</th>
                    <th>Cliente</th>
                    <th>Ciudad</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Paso actual</th>
                    <th>Gestor de préstamos</th>
                    <th>Actualización</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {visible.map((item) => (
                    <tr key={item.id}>
                      <td className={base.requestId}>
                        {item.id}
                      </td>

                      <td>
                        <div className={styles.clienteCell}>
                          <span className={styles.clienteAvatar} aria-hidden="true">
                            {item.cliente.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </span>
                          <span>
                            <b>{item.cliente}</b>
                            <small>{item.email}</small>
                          </span>
                        </div>
                      </td>

                      <td>{item.ciudad}</td>
                      <td className={styles.monto}>{currency(item.monto)}</td>

                      <td>
                        <span
                          className={styles.stChip}
                          style={ESTADO_TINTA[item.estado] ? { background: ESTADO_TINTA[item.estado].bg, color: ESTADO_TINTA[item.estado].fg } : undefined}
                        >
                          <i
                            className={styles.stDot}
                            style={ESTADO_TINTA[item.estado] ? { background: ESTADO_TINTA[item.estado].dot } : undefined}
                            aria-hidden="true"
                          />
                          {item.estado}
                        </span><div className={base.segs}><span className={base.segBar}>{Array.from({ length: 6 }, (_, i) => { const n = Number(item.paso.split(".")[0]) || 0; const cur = !item.desembolsada && i === n - 1; const done = item.desembolsada || i < n - 1; return <span key={i} className={cur ? base.segCur : done ? base.segDone : base.segPend} style={cur && ESTADO_TINTA[item.estado] ? { background: ESTADO_TINTA[item.estado].dot } : undefined} />; })}</span>Paso {Number(item.paso.split(".")[0]) || 0} de 6</div>
                      </td>

                      <td className={styles.step}>
                        <span className={styles.pasoRow}>
                          <span className={styles.pasoNum} aria-hidden="true">
                            {item.paso.split(".")[0]}
                          </span>
                          <span>{item.paso.split(". ").slice(1).join(". ")}</span>
                        </span>
                      </td>

                      <td>
                        {item.responsable || (
                          <span className={base.unassigned}>
                            Gestor de Préstamos
                          </span>
                        )}
                      </td>

                      <td>{item.fecha}</td>

                      <td>
                        <div className={base.actions}>
                          <button
                            className={styles.acc}
                            onClick={() =>
                              window.location.assign(
                                `/seguimiento/${encodeURIComponent(item.id)}`
                              )
                            }
                          >
                            <FolderOpen size={17} />
                            Ver expediente
                          </button>

                          
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={9} className={base.empty}>
                        No se encontraron solicitudes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={base.foot}>
              <span>Mostrando {visible.length} de {filtered.length} solicitudes</span>
              <nav className={base.pager} aria-label="Paginación">
                <button type="button" className={base.pg} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
                  <button type="button" key={i} className={`${base.pg} ${i === currentPage ? base.pgCurrent : ""}`} aria-current={i === currentPage ? "page" : undefined} onClick={() => setPage(i)}>{i}</button>
                ))}
                <button type="button" className={base.pg} disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Siguiente</button>
              </nav>
            </div>
          </section>
        </div>
      </main>

      {selected && (
        <div className={base.overlay}>
          <div className={base.dialog} role="dialog" aria-modal="true">
            <div className={base.dialogHeader}>
              <h2>Expediente de solicitud</h2>
              <button onClick={() => setSelected(null)} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>

            <div className={base.dialogBody}>
              <p><b>Solicitud:</b> {selected.id}</p>
              <p><b>Cliente:</b> {selected.cliente}</p>
              <p><b>Correo:</b> {selected.email}</p>
              <p><b>Ciudad:</b> {selected.ciudad}</p>
              <p><b>Monto:</b> {currency(selected.monto)}</p>
              <p><b>Estado:</b> {selected.estado}</p>
              <p><b>Paso actual:</b> {selected.paso}</p>
              <p><b>Responsable:</b> {selected.responsable || "Sin tomar"}</p>
              <p><b>Actualización:</b> {selected.fecha}</p>

              <div className={base.hint}>
                Expediente de demostración. Documentos y acciones
                pendientes de integración.
              </div>
            </div>

            <div className={base.dialogFooter}>
              <button onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={base.toast} role="status">
          {toast}
          <button onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
