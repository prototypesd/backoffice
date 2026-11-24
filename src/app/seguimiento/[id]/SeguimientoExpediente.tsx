"use client";

import Link from "next/link";
import SeguimientoShell from "../SeguimientoShell";
import {
  Check,
  Clock3,
  FileSignature,
  Wallet,
  UserRoundCheck,
  ClipboardCheck,
  MapPin,
  Phone,
  Mail,
  UserRound,
  ArrowLeft,
} from "lucide-react";

import styles from "./seguimiento-expediente.module.scss";

type Estado = "completado" | "actual" | "pendiente";

type Paso = {
  titulo: string;
  descripcion: string;
  responsable: string;
  fecha: string;
};

type Expediente = {
  id: string;
  nombre: string;
  ci: string;
  telefono: string;
  email: string;
  ciudad: string;
  estado: string;
  pasoActual: number;
  fechas: string[];
};

const etapas: Paso[] = [
  {
    titulo: "Solicitud recibida",
    descripcion:
      "Solicitud validada y derivada por el Gestor de Clientes.",
    responsable: "Gestor de Clientes 1",
    fecha: "",
  },
  {
    titulo: "Asignación de asesor",
    descripcion: "Asignada al asesor responsable.",
    responsable: "Gestor de Préstamos",
    fecha: "",
  },
  {
    titulo: "En evaluación",
    descripcion:
      "Requisitos, carpeta, visita al cliente y comité en proceso.",
    responsable: "Asesor 1",
    fecha: "",
  },
  {
    titulo: "Firma de contrato",
    descripcion: "Pendiente de formalización.",
    responsable: "Legal",
    fecha: "",
  },
  {
    titulo: "Desembolso",
    descripcion: "Pendiente de desembolso.",
    responsable: "Gestor de Préstamos",
    fecha: "",
  },
];

// Registros ficticios exclusivos del prototipo.
// No están conectados a la API de Kivo.
const expedientes: Record<string, Expediente> = {
  "KIVO-ZF12EF": {
    id: "KIVO-ZF12EF",
    nombre: "Carla Torres",
    ci: "6677885",
    telefono: "70887654",
    email: "carla.torres@example.com",
    ciudad: "La Paz",
    estado: "En trámite · En evaluación",
    pasoActual: 3,
    fechas: [
      "02/09/2026 09:10",
      "03/09/2026 11:30",
      "04/09/2026",
    ],
  },

  "KIVO-WEB-001-2026-LP": {
    id: "KIVO-WEB-001-2026-LP",
    nombre: "Gabriel Iglesias",
    ci: "No disponible",
    telefono: "No disponible",
    email: "cliente_1@example.com",
    ciudad: "La Paz",
    estado: "En trámite · En evaluación",
    pasoActual: 3,
    fechas: [
      "19/11/2026 09:10",
      "20/11/2026 11:30",
      "21/11/2026 09:51",
    ],
  },
  "KIVO-WEB-002-2026-LP": {
    id: "KIVO-WEB-002-2026-LP",
    nombre: "María Fernández",
    ci: "No disponible",
    telefono: "No disponible",
    email: "cliente_2@example.com",
    ciudad: "La Paz",
    estado: "En trámite · En evaluación",
    pasoActual: 3,
    fechas: [
      "19/11/2026 09:10",
      "20/11/2026 11:30",
      "21/11/2026 10:15",
    ],
  },
  "KIVO-OFI-003-2026-CB": {
    id: "KIVO-OFI-003-2026-CB",
    nombre: "Carlos Mendoza",
    ci: "No disponible",
    telefono: "No disponible",
    email: "cliente_3@example.com",
    ciudad: "Cochabamba",
    estado: "Observada · En evaluación",
    pasoActual: 3,
    fechas: [
      "18/11/2026 09:10",
      "19/11/2026 11:30",
      "20/11/2026 16:42",
    ],
  },
  "KIVO-WEB-004-2026-SC": {
    id: "KIVO-WEB-004-2026-SC",
    nombre: "Ana Rodríguez",
    ci: "No disponible",
    telefono: "No disponible",
    email: "cliente_4@example.com",
    ciudad: "Santa Cruz",
    estado: "Aprobada · Formalización",
    pasoActual: 4,
    fechas: [
      "15/11/2026 09:10",
      "16/11/2026 11:30",
      "18/11/2026 10:00",
      "19/11/2026 14:30",
    ],
  },
  "KIVO-OFI-005-2026-LP": {
    id: "KIVO-OFI-005-2026-LP",
    nombre: "Pedro Vargas",
    ci: "No disponible",
    telefono: "No disponible",
    email: "cliente_5@example.com",
    ciudad: "La Paz",
    estado: "Rechazada · Evaluación",
    pasoActual: 3,
    fechas: [
      "16/11/2026 09:10",
      "17/11/2026 11:30",
      "18/11/2026 11:20",
    ],
  },
  "KIVO-WEB-006-2026-CB": {
    id: "KIVO-WEB-006-2026-CB",
    nombre: "Lucía Morales",
    ci: "No disponible",
    telefono: "No disponible",
    email: "cliente_6@example.com",
    ciudad: "Cochabamba",
    estado: "Desembolsada",
    pasoActual: 5,
    fechas: [
      "10/11/2026 09:10",
      "11/11/2026 11:30",
      "13/11/2026 10:00",
      "16/11/2026 14:30",
      "17/11/2026 09:00",
    ],
  },
  "KIVO-WEB-007-2026-SC": {
    id: "KIVO-WEB-007-2026-SC",
    nombre: "Roberto Flores",
    ci: "No disponible",
    telefono: "No disponible",
    email: "cliente_7@example.com",
    ciudad: "Santa Cruz",
    estado: "En trámite · Solicitud recibida",
    pasoActual: 1,
    fechas: ["21/11/2026 08:30"],
  },
  "KIVO-OFI-008-2026-LP": {
    id: "KIVO-OFI-008-2026-LP",
    nombre: "Patricia López",
    ci: "No disponible",
    telefono: "No disponible",
    email: "cliente_8@example.com",
    ciudad: "La Paz",
    estado: "Observada · En evaluación",
    pasoActual: 3,
    fechas: [
      "18/11/2026 09:10",
      "19/11/2026 11:30",
      "20/11/2026 13:10",
    ],
  },
};

const iconos = [
  ClipboardCheck,
  UserRoundCheck,
  Clock3,
  FileSignature,
  Wallet,
];

function getEstado(
  index: number,
  actual: number,
  finalizado: boolean
): Estado {
  if (finalizado || index + 1 < actual) return "completado";
  if (index + 1 === actual) return "actual";
  return "pendiente";
}

const ESTADO_TINTA: Record<string, { bg: string; fg: string; dot: string }> = {
  "En trámite": { bg: "#E6F7FF", fg: "#0077B3", dot: "#00AEFF" },
  Observada: { bg: "#FFF4E0", fg: "#8A5A00", dot: "#FF9900" },
  Aprobada: { bg: "#E7F6EC", fg: "#1E7A43", dot: "#1FA855" },
  Rechazada: { bg: "#FDECEA", fg: "#B3261E", dot: "#E5484D" },
  Desembolsada: { bg: "#EEF0F3", fg: "#3D4450", dot: "#5B616E" },
};

function tintaEstado(estado: string) {
  return ESTADO_TINTA[estado.split(" ·")[0]] ?? ESTADO_TINTA["En trámite"];
}

export default function SeguimientoExpediente({
  id,
}: {
  id: string;
}) {
  const expediente = expedientes[id];

  if (!expediente) {
    return (
      <main className={styles.page}>
        <Link href="/seguimiento" className={styles.back}>
          <ArrowLeft size={16} />
          Volver a Seguimiento
        </Link>
        <div className={styles.notFound}>
          <h1>Expediente no disponible</h1>
          <p>
            No existen datos de demostración para la solicitud {id}.
          </p>
        </div>
      </main>
    );
  }

  const finalizado = expediente.estado === "Desembolsada";

  const tinta = tintaEstado(expediente.estado);

  return (
    <SeguimientoShell>
      <main className={styles.page}>
      <header className={styles.heading}>
        <div className={styles.titleGroup}>
          <span
            className={styles.chip}
            style={{ background: tinta.bg, color: tinta.fg }}
          >
            <i
              className={styles.chipDot}
              style={{ background: tinta.dot }}
              aria-hidden="true"
            />
            {expediente.estado}
          </span>
          <h1>Solicitud {expediente.id}</h1>
        </div>

        <Link href="/seguimiento" className={styles.back}>
          Volver a Seguimiento
        </Link>
      </header>

      <section className={styles.clientCard}>
        <div className={styles.avatar}>
          {expediente.nombre
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
        </div>

        <div className={styles.clientInformation}>
          <h2>{expediente.nombre}</h2>

          <div className={styles.meta}>
            <span>
              <UserRound size={13} />
              CI {expediente.ci}
            </span>
            <span>
              <Phone size={13} />
              {expediente.telefono}
            </span>
            <span>
              <Mail size={13} />
              {expediente.email}
            </span>
            <span>
              <MapPin size={13} />
              {expediente.ciudad}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <strong>Avance del trámite</strong>
          <span>Paso {expediente.pasoActual} de 5</span>
        </div>

        <div className={styles.progress}>
          {etapas.map((etapa, index) => {
            const estado = getEstado(
              index,
              expediente.pasoActual,
              finalizado
            );

            const Icon = iconos[index];

            return (
              <div
                className={styles.progressItem}
                key={etapa.titulo}
              >
                <div
                  className={`${styles.progressIcon} ${
                    styles[estado]
                  }`}
                >
                  {estado === "completado" ? (
                    <Check size={15} />
                  ) : (
                    <Icon size={15} />
                  )}
                </div>

                <span
                  className={
                    estado === "actual"
                      ? styles.currentLabel
                      : ""
                  }
                >
                  {estado === "actual" && !finalizado ? (
                    <i className={styles.pulseDot} aria-hidden="true" />
                  ) : null}
                  {etapa.titulo}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <strong>Detalle por paso</strong>
        </div>

        <div className={styles.details}>
          {etapas.map((etapa, index) => {
            const estado = getEstado(
              index,
              expediente.pasoActual,
              finalizado
            );

            const fecha = expediente.fechas[index];

            return (
              <div
                key={etapa.titulo}
                className={`${styles.detailRow} ${
                  estado === "actual"
                    ? styles.activeRow
                    : ""
                }`}
              >
                <div className={styles.stepDescription}>
                  <span
                    className={`${styles.smallCircle} ${
                      styles[estado]
                    }`}
                  >
                    {estado === "completado" ? (
                      <Check size={12} />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <div>
                    <strong>
                      {index + 1}. {etapa.titulo}
                    </strong>
                    <small>{etapa.descripcion}</small>
                  </div>
                </div>

                <div className={styles.detailField}>
                  <span>Responsable</span>
                  <strong>
                    {estado === "pendiente"
                      ? "—"
                      : etapa.responsable}
                  </strong>
                </div>

                <div className={styles.detailField}>
                  <span>Fecha</span>
                  <strong>
                    {estado === "pendiente"
                      ? "—"
                      : estado === "actual" && !finalizado
                        ? `En curso desde ${fecha ?? "fecha no disponible"}`
                        : fecha ?? "No disponible"}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <p className={styles.disclaimer}>
        Datos y secuencia de demostración. Las fechas,
        responsables y etapas deben validarse con la API de Kivo.
      </p>
    </main>
    </SeguimientoShell>
  );
}
