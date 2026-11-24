"use client";

import { useMemo, useState } from "react";
import {
  Search,
  BarChart3,
  Calculator,
  Bell,
  ChevronDown,
  UserRound,
  FileText,
  CheckCircle2,
  Info,
  MessageCircle,
  X,
  RotateCcw,
  Menu,
  FolderOpen,
} from "lucide-react";

import Header from "@/components/Header";
import base from "@/app/nuevas-solicitudes/solicitudes.module.scss";
import styles from "./onboarding.module.scss";

const steps = [
  { title: "Tus datos", icon: UserRound, color: "blue" },
  { title: "Tus finanzas", icon: BarChart3, color: "purple" },
  { title: "Elige tu préstamo", icon: Calculator, color: "orange" },
  { title: "Más sobre ti", icon: Info, color: "pink" },
  { title: "Tus documentos", icon: FileText, color: "green" },
  { title: "Resumen", icon: CheckCircle2, color: "blue" },
];

type Client = {
  id: string;
  name: string;
  ci: string;
  phone: string;
  amount: string;
  term: string;
  channel: string;
  origin: string;
  city: string;
  type: string;
  currentStep: number;
  daysInStep: number;
  lastUpdate: string;
  inicioSolicitud?: string;
};

const initialClients: Client[] = [
  {
    id: "hugo-soliz",
    name: "Hugo Soliz",
    ci: "3452345435",
    phone: "73080594",
    amount: "—",
    term: "—",
    channel: "Oficina",
    origin: "—",
    city: "La Paz",
    type: "Asalariado",
    currentStep: 1,
    daysInStep: 0,
    lastUpdate: "Hace 1 día",
    inicioSolicitud: "20/11/2026 19:26",
  },
  {
    id: "lucia-flores",
    name: "Lucía Flores",
    ci: "4455667",
    phone: "72345678",
    amount: "Bs 5.000",
    term: "6 meses",
    channel: "Web",
    origin: "—",
    city: "La Paz",
    type: "Dependiente",
    currentStep: 1,
    daysInStep: 8,
    lastUpdate: "Hace 8 días",
    inicioSolicitud: "08/11/2026 09:15",
  },
  {
    id: "jorge-terrazas",
    name: "Jorge Terrazas",
    ci: "3322110",
    phone: "73456789",
    amount: "—",
    term: "—",
    channel: "Web",
    origin: "—",
    city: "La Paz",
    type: "Asalariado",
    currentStep: 2,
    daysInStep: 4,
    lastUpdate: "Hace 4 días",
    inicioSolicitud: "15/11/2026 16:20",
  },
  {
    id: "maria-quisbert",
    name: "María Quisbert",
    ci: "6781122",
    phone: "70123456",
    amount: "Bs 8.000",
    term: "12 meses",
    channel: "Web",
    origin: "—",
    city: "Cochabamba",
    type: "Dependiente",
    currentStep: 3,
    daysInStep: 2,
    lastUpdate: "Hace 2 días",
    inicioSolicitud: "18/11/2026 10:04",
  },
  {
    id: "pedro-mamani",
    name: "Pedro Mamani",
    ci: "9088776",
    phone: "71234567",
    amount: "Bs 15.000",
    term: "18 meses",
    channel: "App",
    origin: "—",
    city: "Santa Cruz",
    type: "Asalariado",
    currentStep: 5,
    daysInStep: 0,
    lastUpdate: "Hace 3 horas",
    inicioSolicitud: "23/11/2026 08:41",
  },
];

export default function OnboardingPage() {
  const [clients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("Todos");
  const [stepFilter, setStepFilter] = useState(0);
  const [duration, setDuration] = useState("Todos");
  const [city, setCity] = useState("Todas");
  const [clientType, setClientType] = useState("Todos");
  const [modal, setModal] = useState<Client | null>(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const q = query.trim().toLowerCase();

      const matchesSearch =
        !q ||
        [client.name, client.ci, client.phone]
          .some((value) => value.toLowerCase().includes(q));

      const matchesDuration =
        duration === "Todos" ||
        (duration === "0-1" && client.daysInStep <= 1) ||
        (duration === "2-3" &&
          client.daysInStep >= 2 &&
          client.daysInStep <= 3) ||
        (duration === "4-7" &&
          client.daysInStep >= 4 &&
          client.daysInStep <= 7) ||
        (duration === "8+" && client.daysInStep >= 8);

      return (
        matchesSearch &&
        (channel === "Todos" || client.channel === channel) &&
        (stepFilter === 0 || client.currentStep === stepFilter) &&
        matchesDuration &&
        (city === "Todas" || client.city === city) &&
        (clientType === "Todos" || client.type === clientType)
      );
    });
  }, [clients, query, channel, stepFilter, duration, city, clientType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function clearFilters() {
    setSearch("");
    setQuery("");
    setChannel("Todos");
    setStepFilter(0);
    setDuration("Todos");
    setCity("Todas");
    setClientType("Todos");
    setPage(1);
  }

  function selectStep(step: number) {
    setStepFilter(stepFilter === step ? 0 : step);
    setPage(1);
  }

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Header />

        <div className={styles.content}>
          <div className={styles.heading}>
            <div>
              <h1 className={base.pageTitle}>Onboarding</h1>
              <p className={base.pageSub}>
                Clientes que están completando su solicitud y todavía no la enviaron.
              </p>
            </div>

            <div className={styles.headingActions}>
              <span className={styles.totalBadge}>
                {filtered.length} registros consultados
              </span>

              <button
                className={styles.assistanceButton}
                onClick={() =>
                  setToast(
                    "Avance y asistencia: módulo de demostración"
                  )
                }
              >
                Avance y asistencia
              </button>
            </div>
          </div>

          <div className={styles.stepCards}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const number = index + 1;
              const count = clients.filter(
                (c) => c.currentStep === number
              ).length;

              return (
                <button
                  key={step.title}
                  className={`${styles.stepCard} ${
                    stepFilter === number ? styles.selected : ""
                  } ${stepFilter === 0 && count > 0
                    ? styles.hasClients : ""}`}
                  onClick={() => selectStep(number)}
                >
                  <strong>
                    {number}. {step.title}
                  </strong>

                  <b>{count}</b>
                  <small>en esta etapa</small>

                  <span
                    className={`${styles.stepIcon} ${
                      styles[step.color]
                    }`}
                  >
                    <Icon size={40} strokeWidth={2.1} />
                  </span>
                </button>
              );
            })}
          </div>

          <section className={styles.filters}>
            <form
              className={styles.searchBar}
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(search);
                setPage(1);
              }}
            >
              <Search size={19} />

              <input
                placeholder="Buscar por nombre, teléfono o carnet"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button type="submit">Buscar</button>
            </form>

            <div className={styles.filterGrid}>
              <label>
                Canal de llenado
                <select
                  value={channel}
                  onChange={(e) => {
                    setChannel(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>Todos</option>
                  <option>Oficina</option>
                  <option>Web</option>
                  <option>App</option>
                </select>
              </label>

              <label>
                Origen (red social)
                <select disabled defaultValue="Sin datos de API">
                  <option>Sin datos de API</option>
                </select>
              </label>

              <label>
                Paso actual
                <select
                  value={stepFilter}
                  onChange={(e) =>
                    selectStep(Number(e.target.value))
                  }
                >
                  <option value={0}>Todos los pasos</option>
                  {steps.map((s, i) => (
                    <option value={i + 1} key={s.title}>
                      {i + 1}. {s.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Días en el paso
                <select
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="Todos">Cualquier duración</option>
                  <option value="0-1">0 a 1 día</option>
                  <option value="2-3">2 a 3 días</option>
                  <option value="4-7">4 a 7 días</option>
                  <option value="8+">8 días o más</option>
                </select>
              </label>

              <label>
                Ciudad
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
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
                  value={clientType}
                  onChange={(e) => {
                    setClientType(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>Todos</option>
                  <option>Asalariado</option>
                  <option>Dependiente</option>
                </select>
              </label>

              <button
                className={styles.clearButton}
                onClick={clearFilters}
                type="button"
              >
                <RotateCcw size={14} />
                Limpiar filtros
              </button>
            </div>
          </section>

          <section className={styles.tablePanel}>
            <div className={styles.tableHeading}>
              <h2>Clientes en onboarding</h2>

              <div className={styles.legend}>
                <span><i className={styles.previous} />Anterior</span>
                <span><i className={styles.current} />Paso actual</span>
                <span><i className={styles.pending} />Pendiente</span>
              </div>
            </div>

            <div className={styles.tableScroll}>
<table>
  <thead>
    <tr>
      <th>Cliente</th>
      <th>Canal</th>
      <th>Origen</th>
      <th>Contacto</th>
      <th>Tipo de cliente</th>
      <th>Monto</th>
      <th>Inicio de solicitud</th>
      <th>Última actualización</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  </thead>

  <tbody>
    {visible.map((client) => (
      <tr key={client.id}>
        <td>
          <strong>{client.name}</strong>
          <small>CI {client.ci}</small>
        </td>

        <td>{client.channel}</td>

        <td>{client.origin}</td>

        <td>
          <strong>{client.phone}</strong>
        </td>

        <td>{client.type}</td>

        <td>
          <strong>{client.amount}</strong>
          <small>{client.term}</small>
        </td>

        <td>{client.inicioSolicitud ?? "—"}</td>

        <td>{client.lastUpdate}</td>

        <td>
          <div className={styles.onboardingStatus}>
            <span className={styles.statusLabel}>
              Recopilando datos
            </span>

            <div className={styles.statusProgress}>
              <div className={styles.statusSegments}>
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    className={
                      index < client.currentStep - 1 ? styles.segmentDone : index === client.currentStep - 1 ? styles.segmentCurrent : styles.segmentPending
                    }
                  />
                ))}
              </div>

              <span className={styles.statusCount}>
                Paso {client.currentStep} de 6
              </span>
            </div>
          </div>
        </td>

        <td>
                        <button
                          className={styles.expedienteButton}
                          onClick={() =>
                            window.location.assign(
                              `/onboarding/${encodeURIComponent(
                                client.id
                              )}`
                            )
                          }
                        >
                          <FolderOpen size={16} />
                          Ver expediente
                        </button>

                        <button
                          className={styles.whatsapp}
                          title="Contactar cliente"
                          aria-label={`Contactar a ${client.name}`}
                          onClick={() => setModal(client)}
                        >
                          <MessageCircle size={20} />
                        </button>
                      </td>
      </tr>
    ))}

    {visible.length === 0 && (
      <tr>
        <td colSpan={10} className={styles.empty}>
          No se encontraron clientes con los
          filtros seleccionados.
        </td>
      </tr>
    )}
  </tbody>
</table>
            </div>

            <div className={styles.pagination}>
              <span>
                Mostrando {visible.length} de{" "}
                {filtered.length} registros cargados
              </span>

              <div>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Anterior
                </button>

                <span>
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {modal && (
        <div className={styles.overlay}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.dialogHeader}>
              <h2>Asistencia al cliente</h2>

              <button onClick={() => setModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.dialogBody}>
              <strong>{modal.name}</strong>
              <p>Teléfono: {modal.phone}</p>
              <p>
                Paso actual: {modal.currentStep}.{" "}
                {steps[modal.currentStep - 1].title}
              </p>
              <p>
                Tiempo en el paso: {modal.daysInStep} días
              </p>

              <div className={styles.notice}>
                Prototipo de asistencia. No se enviarán
                mensajes reales.
              </div>
            </div>

            <div className={styles.dialogFooter}>
              <button onClick={() => setModal(null)}>
                Cerrar
              </button>

              <button
                className={styles.confirm}
                onClick={() => {
                  setModal(null);
                  setToast("Contacto simulado correctamente");
                }}
              >
                <MessageCircle size={17} />
                Simular contacto
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={styles.toast}>
          <span>{toast}</span>
          <button onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
