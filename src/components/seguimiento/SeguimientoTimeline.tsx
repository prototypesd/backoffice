'use client';

import { useState } from 'react';
import {
  AlertCircle, Check, ChevronDown, CircleCheck, Clock, Eye, FileUp, X,
} from 'lucide-react';
import { construirSeguimiento, type PasoVista, type SubpasoVista } from './construirSeguimiento';
import type { FluEvento, Requisito } from './seguimiento.config';
import styles from './SeguimientoTimeline.module.scss';

interface Props {
  historial: FluEvento[];
  requisitos?: Requisito[];
}

// Formato fijo (La Paz = UTC-4, sin horario de verano) para que servidor y navegador rendericen lo mismo.
const dos = (n: number) => String(n).padStart(2, '0');
const fecha = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(new Date(iso).getTime() - 4 * 3600 * 1000);
  return `${dos(d.getUTCDate())}/${dos(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`;
};

export default function SeguimientoTimeline({ historial, requisitos = [] }: Props) {
  const pasos = construirSeguimiento(historial);
  const [abiertos, setAbiertos] = useState<number[]>(
    pasos.filter((p) => p.estado === 'actual' || p.estado === 'rechazado').map((p) => p.numero),
  );
  const toggle = (n: number) =>
    setAbiertos((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));

  return (
    <section className={styles.card} aria-label="Detalle por paso">
      <header className={styles.cardHeader}>
        <h2>Detalle por paso</h2>
        <span className={styles.readonly}><Eye size={14} aria-hidden /> Solo lectura</span>
      </header>

      <ol className={styles.pasos}>
        {pasos.map((paso) => {
          const abierto = abiertos.includes(paso.numero);
          return (
            <li key={paso.numero} className={`${styles.paso} ${styles[paso.estado]}`}>
              <button
                type="button"
                className={styles.pasoHeader}
                aria-expanded={abierto}
                aria-controls={`paso-${paso.numero}`}
                onClick={() => toggle(paso.numero)}
              >
                <Marcador estado={paso.estado} numero={paso.numero} />
                <span className={styles.pasoTitulo}>
                  <strong>
                    {paso.numero}. {paso.titulo}
                    {paso.subpasoActual && (
                      <ChipActual subpaso={paso.subpasoActual} requisitos={requisitos} />
                    )}
                  </strong>
                  <small>{resumen(paso)}</small>
                </span>
                <Dato etiqueta="Responsable" valor={paso.responsable ?? '—'} />
                <Dato
                  etiqueta={paso.estado === 'hecho' ? 'Fecha' : 'Última actividad'}
                  valor={fecha(paso.ultimaFecha)}
                />
                <ChevronDown size={18} className={styles.chevron} aria-hidden />
              </button>

              {abierto && (
                <ol id={`paso-${paso.numero}`} className={styles.timeline}>
                  {paso.subpasos.map((s) => (
                    <Subpaso key={s.id} subpaso={s} requisitos={requisitos} />
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function resumen(paso: PasoVista) {
  const total = paso.subpasos.length;
  if (paso.estado === 'pendiente') return `${total} subpasos · pendiente`;
  if (paso.estado === 'hecho') return paso.descripcion;
  const pos = paso.subpasos.findIndex((s) => s === paso.subpasoActual) + 1;
  const desde = paso.subpasos.flatMap((s) => s.eventos)[0]?.fecha;
  return `Subpaso ${pos} de ${total}${desde ? ` · en curso desde ${fecha(desde).slice(0, 10)}` : ''}`;
}

function ChipActual({ subpaso, requisitos }: { subpaso: SubpasoVista; requisitos: Requisito[] }) {
  const extra =
    subpaso.id === 'requisitos' && requisitos.length
      ? ` · ${requisitos.filter((r) => r.estado === 'aceptado').length}/${requisitos.length}`
      : '';
  return (
    <span className={`${styles.chip} ${subpaso.estado === 'rechazado' ? styles.chipDanger : styles.chipAccent}`}>
      {subpaso.titulo}{extra}
    </span>
  );
}

function Subpaso({ subpaso, requisitos }: { subpaso: SubpasoVista; requisitos: Requisito[] }) {
  const { estado, eventos } = subpaso;
  const ultimo = eventos.at(-1);
  return (
    <li className={`${styles.evento} ${styles[`ev_${estado}`]} ${subpaso.tuvoObservacion ? styles.ev_observado : ''}`}>
      <span className={styles.punto} aria-hidden />
      <p className={styles.eventoTitulo}>
        {subpaso.titulo}
        {estado === 'actual' && <span className={`${styles.chip} ${styles.chipAccent}`}>En curso</span>}
        {estado === 'rechazado' && <span className={`${styles.chip} ${styles.chipDanger}`}>Rechazado</span>}
        {subpaso.tuvoObservacion && estado !== 'rechazado' && (
          <span className={`${styles.chip} ${styles.chipWarning}`}>
            {estado === 'hecho' ? 'Observado → subsanado' : 'Con observación'}
          </span>
        )}
      </p>

      {estado === 'pendiente' ? (
        <p className={styles.meta}>{subpaso.responsable}</p>
      ) : (
        <>
          <p className={styles.meta}>
            {[ultimo?.rol ?? subpaso.responsable, ultimo?.actorNombre].filter(Boolean).join(' · ')}
            {ultimo && ` · ${fecha(ultimo.fecha)}`}
          </p>
          {eventos.filter((e) => e.motivo).map((e) => (
            <p key={`${e.codigo}-${e.fecha}`} className={styles.motivo}>
              <span>{fecha(e.fecha)}</span> {e.motivo}
            </p>
          ))}
        </>
      )}

      {subpaso.id === 'requisitos' && estado !== 'pendiente' && requisitos.length > 0 && (
        <ul className={styles.requisitos}>
          {requisitos.map((r) => (
            <li key={r.nombre} className={styles[`req_${r.estado}`]}>
              <IconoRequisito estado={r.estado} />
              <span>
                {r.nombre} · {r.estado}
                {r.subidoPor && ` · subió el ${r.subidoPor}`}
                {r.observacion && ` — "${r.observacion}"`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function IconoRequisito({ estado }: { estado: Requisito['estado'] }) {
  if (estado === 'aceptado') return <CircleCheck size={15} aria-hidden />;
  if (estado === 'observado') return <AlertCircle size={15} aria-hidden />;
  if (estado === 'recibido') return <FileUp size={15} aria-hidden />;
  return <Clock size={15} aria-hidden />;
}

function Marcador({ estado, numero }: { estado: PasoVista['estado']; numero: number }) {
  return (
    <span className={`${styles.marcador} ${styles[`m_${estado}`]}`} aria-hidden>
      {estado === 'hecho' ? <Check size={14} /> : estado === 'rechazado' ? <X size={14} /> : numero}
    </span>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <span className={styles.dato}>
      <small>{etiqueta}</small>
      <strong>{valor}</strong>
    </span>
  );
}
