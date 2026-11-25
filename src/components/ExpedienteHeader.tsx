"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarDays,
  ChevronLeft,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Users,
} from "lucide-react";
import s from "./ExpedienteHeader.module.scss";

export type EstadoChip = { label: string; bg: string; color: string };

type Props = {
  nombre: string;
  codigo: string;
  estado: EstadoChip;
  ci?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  recibida?: string;
  canal?: string;
  /** Breadcrumb: "< Solicitudes / KIVO-…" */
  volver?: { href: string; label: string };
  /** Reemplaza el botón Actualizar. */
  accion?: ReactNode;
};

const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function ExpedienteHeader({
  nombre, codigo, estado, ci, telefono, email, ciudad, recibida, canal, volver, accion,
}: Props) {
  return (
    <header className={s.stack}>
      {volver && (
        <nav className={s.crumb} aria-label="Ruta">
          <ChevronLeft size={18} aria-hidden="true" />
          <Link href={volver.href}>{volver.label}</Link>
          <span className={s.soft}>/ {codigo}</span>
        </nav>
      )}

      <div className={s.hero}>
        <div className={s.heroLeft}>
          <div className={s.heroAvatar} aria-hidden="true">{iniciales(nombre)}</div>
          <div className={s.heroData}>
            <div className={s.heroNameRow}>
              <h1 className={s.heroName}>{nombre}</h1>
              <span role="status" className={s.hdrChip} style={{ background: estado.bg, color: estado.color }}>
                <CalendarDays size={14} aria-hidden="true" />
                {estado.label}
              </span>
            </div>
            <div className={s.metaRow}>
              <span className={s.metaStrong}>Solicitud {codigo}</span>
              {ci && <span className={s.meta}><FileText size={15} aria-hidden="true" />CI {ci}</span>}
              {telefono && <span className={s.meta}><Phone size={15} aria-hidden="true" />{telefono}</span>}
              {email && <span className={s.meta}><Mail size={15} aria-hidden="true" />{email}</span>}
              {ciudad && <span className={s.meta}><MapPin size={15} aria-hidden="true" />{ciudad}</span>}
              {recibida && <span className={s.meta}><CalendarDays size={15} aria-hidden="true" />Recibida el {recibida}</span>}
              {canal && <span className={s.meta}><Users size={15} aria-hidden="true" />Canal: {canal}</span>}
            </div>
          </div>
        </div>
        {accion ?? (
          <button type="button" className={s.btn} onClick={() => window.location.reload()}>
            <RefreshCw size={18} aria-hidden="true" />
            Actualizar
          </button>
        )}
      </div>
    </header>
  );
}
