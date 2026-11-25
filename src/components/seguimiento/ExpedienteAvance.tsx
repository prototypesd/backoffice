'use client';

import { useEffect, useState } from 'react';
import {
  Check, ChevronDown, ClipboardList, Route, ClipboardCheck, Clock3, FileSignature, UserRoundCheck, Wallet, X,
} from 'lucide-react';
import { construirSeguimiento, type PasoVista, type SubpasoVista } from './construirSeguimiento';
import type { FluEvento, Requisito } from './seguimiento.config';
import { fecha, fechaCorta, fechaDia, haceCuanto } from './formato';
import styles from './ExpedienteAvance.module.scss';

const ICONOS = [ClipboardCheck, UserRoundCheck, Clock3, FileSignature, Wallet];

interface Props {
  historial: FluEvento[];
  requisitos?: Requisito[];
}

export default function ExpedienteAvance({ historial, requisitos = [] }: Props) {
  const pasos = construirSeguimiento(historial);
  const iPaso = pasos.findIndex((p) => p.estado === 'actual' || p.estado === 'rechazado');
  const actual = iPaso >= 0 ? pasos[iPaso] : undefined;
  const sub = actual?.subpasoActual;
  const iSub = actual && sub ? actual.subpasos.indexOf(sub) : -1;
  const siguiente = actual
    ? actual.subpasos[iSub + 1] ?? pasos[iPaso + 1]?.subpasos[0]
    : undefined;
  const ultimo = sub?.eventos.at(-1);
  const desde = sub?.eventos[0]?.fecha;
  const rechazado = actual?.estado === 'rechazado';

  const faltan = requisitos.filter((r) => r.estado === 'pendiente' || r.estado === 'observado');
  const esperando = rechazado
    ? { titulo: 'Nada: expediente cerrado', detalle: ultimo?.motivo ?? 'Solicitud rechazada' }
    : sub?.id === 'requisitos' && faltan.length
      ? {
          titulo: `${faltan.length} documento${faltan.length === 1 ? '' : 's'} del cliente`,
          detalle: faltan.map((r) => `${r.nombre} ${r.estado}`).join(' · '),
        }
      : sub
        ? { titulo: 'Gestión interna', detalle: sub.responsable }
        : { titulo: '—', detalle: '' };

  // Avance de la línea del stepper (5 pasos: centros al 0, 25, 50, 75 y 100 % del riel).
  const tramo = 100 / (pasos.length - 1);
  const verde = iPaso < 0 ? 100 : iPaso * tramo;
  const azul = actual && iPaso < pasos.length - 1 ? ((iSub + 1) / actual.subpasos.length) * tramo : 0;

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}><Route size={18} aria-hidden="true" />Avance del trámite</h2>
          <span className={styles.pill}>
            {actual
              ? `Paso ${actual.numero} de ${pasos.length} · subpaso ${iSub + 1} de ${actual.subpasos.length}`
              : 'Trámite completado'}
          </span>
        </div>

        {actual && sub && (
          <div className={styles.aqui}>
            <div>
              <small>Dónde está</small>
              <b>{actual.titulo} · {sub.titulo}</b>
              <p>desde el {fechaCorta(desde)}{desde && <> · hace <Hace iso={desde} /></>}</p>
            </div>
            <div>
              <small>Con quién</small>
              <b>{ultimo?.actorNombre ?? sub.responsable}</b>
              <p>{ultimo?.rol ?? sub.responsable}</p>
            </div>
            <div className={rechazado ? styles.cerrado : styles.espera}>
              <small>Esperando</small>
              <b>{esperando.titulo}</b>
              <p>{esperando.detalle}</p>
            </div>
            <div>
              <small>Sigue</small>
              <b>{rechazado ? '—' : siguiente?.titulo ?? 'Cierre del trámite'}</b>
              <p>{rechazado ? '' : siguiente?.responsable}</p>
            </div>
          </div>
        )}

        <ol className={styles.stepper}>
          <span className={styles.track} aria-hidden>
            <span className={styles.trackDone} style={{ width: `${verde}%` }} />
            <span className={styles.trackNow} style={{ left: `${verde}%`, width: `${azul}%` }} />
          </span>
          {pasos.map((p, i) => {
            const Icono = ICONOS[i] ?? Clock3;
            return (
              <li
                key={p.numero}
                className={`${styles.step} ${styles[`step_${p.estado}`]}`}
                aria-current={p.estado === 'actual' ? 'step' : undefined}
              >
                <span className={styles.dot}>
                  {p.estado === 'hecho' ? <Check size={15} /> : p.estado === 'rechazado' ? <X size={15} /> : <Icono size={15} />}
                </span>
                <span className={styles.stepLabel}>{p.titulo}</span>
                {p === actual && sub && (
                  <>
                    <span className={styles.stepSub}>{sub.titulo}</span>
                    <span className={styles.mini} aria-label={`Subpaso ${iSub + 1} de ${p.subpasos.length}`}>
                      {p.subpasos.map((s, j) => (
                        <i key={s.id} className={j < iSub ? styles.miniDone : j === iSub ? styles.miniNow : ''} />
                      ))}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </section>


      <Bitacora
        pasos={pasos}
        historial={historial}
        requisitos={requisitos}
      />

    </>
  );
}

function Hace({ iso }: { iso: string }) {
  const [texto, setTexto] = useState('');
  useEffect(() => {
    setTexto(haceCuanto(iso));
  }, [iso]);
  return <span suppressHydrationWarning>{texto}</span>;
}


type FiltroBitacora =
  | 'Todos'
  | 'Personas'
  | 'Sistema'
  | 'Observaciones'
  | 'Subsanaciones'
  | 'Rechazos';

const FILTROS_BITACORA: FiltroBitacora[] = [
  'Todos',
  'Personas',
  'Sistema',
  'Observaciones',
  'Subsanaciones',
  'Rechazos',
];

const ESTADOS_PASO = {
  hecho: 'Completado',
  actual: 'En curso',
  pendiente: 'Pendiente',
  rechazado: 'Rechazado',
} as const;

function ordenarEventos(eventos: FluEvento[]) {
  return [...eventos].sort(
    (a, b) => Date.parse(a.fecha) - Date.parse(b.fecha)
  );
}

function esRechazo(e: FluEvento) {
  return ['FLU-007', 'FLU-030', 'FLU-042'].includes(e.codigo)
    || /RECHAZAD|CANCELAD/i.test(e.estado);
}

function esObservado(e: FluEvento) {
  return /OBSERVADO|OBSERVADA|OBSERVACION/i.test(e.estado);
}

function esSubsanado(e: FluEvento) {
  return /SUBSANAD|CORREGID|SUBSANACION/i.test(e.estado);
}

function esSistema(e: FluEvento) {
  return /SISTEMA|OCR|AUTOMATIC|AUTOMÁTIC/i.test(e.rol)
    || /CORREO|EMAIL|OCR|NOTIFICACION/i.test(e.estado);
}

function actorEvento(e: FluEvento) {
  return e.actorNombre?.trim()
    || e.rol?.trim()
    || 'Responsable no registrado';
}

function coincideFiltro(e: FluEvento, filtro: FiltroBitacora) {
  switch (filtro) {
    case 'Personas': return !esSistema(e);
    case 'Sistema': return esSistema(e);
    case 'Observaciones': return esObservado(e) || esSubsanado(e);
    case 'Subsanaciones': return esSubsanado(e);
    case 'Rechazos': return esRechazo(e);
    default: return true;
  }
}

function textoEstado(estado: string) {
  return estado.replace(/_/g, ' ').toLowerCase();
}

function accionEvento(e: FluEvento, subpaso?: SubpasoVista) {
  const estado = e.estado.toUpperCase();
  const contexto = subpaso?.titulo.toLowerCase() ?? 'el expediente';

  if (e.codigo === 'FLU-042' || estado.includes('CANCELAD'))
    return 'canceló la solicitud';

  if (esRechazo(e))
    return 'rechazó la solicitud';

  if (esSubsanado(e))
    return `subsanó una observación en ${contexto}`;

  if (esObservado(e))
    return `registró una observación en ${contexto}`;

  if (/CORREO|EMAIL/.test(estado)) {
    if (/ENVIAD|ENVIO/.test(estado))
      return 'envió un correo electrónico';

    return 'registró un evento de correo electrónico';
  }

  if (estado.includes('OCR'))
    return 'registró un resultado de reconocimiento documental';

  if (/DESEMBOLSADO|DESEMBOLSO_CONFIRMADO/.test(estado))
    return 'confirmó el desembolso';

  if (/PREAPROBADO|PREAPROBADA/.test(estado))
    return 'preaprobó la solicitud';

  if (/APROBADO|APROBADA/.test(estado))
    return `aprobó la revisión de ${contexto}`;

  if (/ASIGNADO|ASIGNADA/.test(estado))
    return 'asignó la solicitud';

  if (/DERIVADO|DERIVADA/.test(estado))
    return 'derivó la solicitud';

  if (/CONFIRMADO|CONFIRMADA/.test(estado))
    return `confirmó ${contexto}`;

  if (/VALIDADO|VALIDADA/.test(estado))
    return `validó ${contexto}`;

  if (/RECIBIDO|RECIBIDA/.test(estado))
    return `registró la recepción de ${contexto}`;

  if (/ENVIADO|ENVIADA/.test(estado))
    return `registró el envío de ${contexto}`;

  if (/FIRMADO|FIRMADA/.test(estado))
    return 'registró la firma del contrato';

  if (/PENDIENTE/.test(estado))
    return `dejó pendiente ${contexto}`;

  return `registró el estado «${textoEstado(e.estado)}»`;
}

interface EventoBitacora {
  evento: FluEvento;
  subpaso?: SubpasoVista;
}





function WorkflowIcon({
  nombre,
  size = 20,
}: {
  nombre: string;
  size?: number;
}) {
  const key = nombre.toLowerCase();

  let paths;

  if (/asign|asesor|confirmaci|contacto/.test(key)) {
    paths = (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 21a7 7 0 0 1 13 0" />
        <path d="m16 12 2 2 4-4" />
      </>
    );
  } else if (/solicitud|recibida/.test(key)) {
    paths = (
      <>
        <path d="M5 5h14l3 10v5H2v-5z" />
        <path d="M2 15h6l2 3h4l2-3h6" />
      </>
    );
  } else if (/visita|domiciliaria/.test(key)) {
    paths = (
      <>
        <path d="m3 10 9-7 9 7v11H3z" />
        <path d="M9 21v-7h6v7" />
      </>
    );
  } else if (/firma|contrato|notar/.test(key)) {
    paths = (
      <>
        <path d="m15 5 4 4M4 20l1-5L17 3l4 4L9 19z" />
        <path d="M12 21h9" />
      </>
    );
  } else if (/desembolso|depósito|pago/.test(key)) {
    paths = (
      <>
        <rect x="2" y="6" width="20" height="12" rx="3" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" />
      </>
    );
  } else if (/carpeta|socioecon|preparaci/.test(key)) {
    paths = (
      <path d="M3 6h7l2 3h9v11H3z" />
    );
  } else if (/legal|riesgo|escalonada|control/.test(key)) {
    paths = (
      <>
        <path d="m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5z" />
        <path d="m9 12 2 2 4-4" />
      </>
    );
  } else if (/comit/.test(key)) {
    paths = (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20a7 7 0 0 1 14 0" />
        <path d="M16 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6" />
      </>
    );
  } else if (/derivaci|preaprobaci/.test(key)) {
    paths = (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 21v-5h6v5M8 7h.01M16 7h.01M8 11h.01M16 11h.01" />
      </>
    );
  } else {
    paths = (
      <>
        <rect x="5" y="4" width="14" height="18" rx="2" />
        <rect x="9" y="2" width="6" height="4" rx="1" fill="currentColor" stroke="none" />
        <path d="m8 14 3 3 5-6" />
      </>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

function Bitacora({
  pasos,
  historial,
  requisitos,
}: {
  pasos: PasoVista[];
  historial: FluEvento[];
  requisitos: Requisito[];
}) {
  const actual = pasos.find(
    p => p.estado === 'actual' || p.estado === 'rechazado'
  );

  const ordenados = ordenarEventos(historial);
  const ultimo = ordenados.at(-1);
  const cerrado = ultimo ? esRechazo(ultimo) : false;

  const conocidos = new Set(
    pasos.flatMap(p => p.subpasos.flatMap(s => s.codigos))
  );

  const otros = ordenados.filter(
    e => !conocidos.has(e.codigo)
  );

  const [numeroPaso, setNumeroPaso] = useState(
    actual?.numero ?? pasos[0]?.numero ?? 1
  );

  const [subpasoId, setSubpasoId] = useState(
    actual?.subpasoActual?.id
      ?? actual?.subpasos[0]?.id
      ?? pasos[0]?.subpasos[0]?.id
      ?? ''
  );

  const paso = pasos.find(p => p.numero === numeroPaso);

  const subpaso = paso?.subpasos.find(
    s => s.id === subpasoId
  ) ?? paso?.subpasos[0];

  const indice = paso && subpaso
    ? paso.subpasos.findIndex(s => s.id === subpaso.id)
    : -1;

  const completados = paso?.subpasos.filter(
    s => s.estado === 'hecho'
  ).length ?? 0;

  const aceptados = requisitos.filter(
    r => r.estado === 'aceptado'
  ).length;

  const faltantes = requisitos.filter(
    r => r.estado === 'pendiente' || r.estado === 'observado'
  );

  const estadosDocumento = {
    aceptado: 'Aceptado',
    observado: 'Observado',
    recibido: 'Recibido',
    pendiente: 'Pendiente',
  } as const;

  const seleccionarPaso = (p: PasoVista) => {
    setNumeroPaso(p.numero);

    setSubpasoId(
      p.subpasoActual?.id
        ?? p.subpasos[0]?.id
        ?? ''
    );
  };

  const navegar = (direccion: number) => {
    if (!paso) return;

    const siguiente = paso.subpasos[indice + direccion];

    if (siguiente) {
      setSubpasoId(siguiente.id);
    }
  };

  const etiquetaEstado = (
    estado: SubpasoVista['estado']
  ) => {
    if (cerrado && estado === 'actual') {
      return 'Interrumpido';
    }

    return ESTADOS_PASO[estado];
  };

  const eventos = subpaso
    ? ordenarEventos(subpaso.eventos)
    : [];

  const ultimoSubpaso = eventos.at(-1);

  const enCurso = subpaso?.estado === 'actual' && !cerrado;

  return (
    <section className={`${styles.card} ${styles.hwCard}`}>

      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          <ClipboardList size={18} aria-hidden="true" />
          Detalle por paso
        </h2>
        <span className={styles.hwReadonly}>Solo lectura</span>
      </div>

      {cerrado && ultimo && (
        <div className={styles.hwClosed}>
          <strong>
            {ultimo.codigo === 'FLU-042'
              || /CANCELAD/i.test(ultimo.estado)
              ? 'Expediente cancelado'
              : 'Expediente rechazado'}
          </strong>

          <small>
            {fecha(ultimo.fecha)} · {actorEvento(ultimo)}
          </small>

          {ultimo.motivo && <p>{ultimo.motivo}</p>}
        </div>
      )}

      {/* NIVEL 1: ETAPAS HORIZONTALES */}

      <nav
        className={styles.hwNavigation}
        aria-label="Etapas del trámite"
      >
        <ol className={styles.hwTabs}>
          {pasos.map(p => (
            <li key={p.numero}>
              <button
                type="button"
                aria-pressed={numeroPaso === p.numero}
                aria-controls="kivo-hw-panel"
                onClick={() => seleccionarPaso(p)}
                className={[
                  styles.hwTab,
                  numeroPaso === p.numero
                    ? styles.hwTabSelected
                    : '',
                ].join(' ')}
              >

                <span className={styles.hwTabNumber}>
                  Etapa {String(p.numero).padStart(2, '0')}
                </span>

                {p.estado === 'actual' && !cerrado && (
                  <span className={styles.hwNow}>Ahora</span>
                )}

                <span className={[
                  styles.hwStageIcon,
                  styles['hwIcon_' + p.estado],
                ].join(' ')}>
                  <WorkflowIcon nombre={p.titulo} size={20} />
                </span>

                <span className={styles.hwTabTitle}>
                  {p.titulo}
                </span>

                <small className={
                  styles['hwText_' + p.estado]
                }>
                  {etiquetaEstado(p.estado)}
                </small>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div
        id="kivo-hw-panel"
        className={styles.hwBody}
      >

        {paso && (
          <>

            <div className={styles.hwLocation}>
              <div className={styles.hwLocationContent}>
                <small>Estás consultando</small>

                <div className={styles.hwBreadcrumb}>
                  <span>{paso.titulo}</span>

                  {subpaso && (
                    <>
                      <ChevronDown
                        size={13}
                        aria-hidden="true"
                        className={styles.hwNext}
                      />
                      <strong>{subpaso.titulo}</strong>
                    </>
                  )}
                </div>
              </div>

              {actual && !cerrado && (
                numeroPaso !== actual.numero
                || subpaso?.id !== actual.subpasoActual?.id
              ) && (
                <button
                  type="button"
                  className={styles.hwReturn}
                  onClick={() => seleccionarPaso(actual)}
                >
                  Ir al paso actual
                </button>
              )}
            </div>

            <div className={styles.hwStageHeader}>
              <div>
                <small>
                  Paso {paso.numero} de {pasos.length}
                </small>

                <h3>{paso.titulo}</h3>
              </div>

              <div className={styles.hwStageProgress}>
                <progress
                  value={completados}
                  max={Math.max(1, paso.subpasos.length)}
                  aria-label="Progreso de la etapa"
                />

                <span>
                  {completados} de {paso.subpasos.length}
                  {' completados'}
                </span>
              </div>
            </div>

            {/* NIVEL 2: SUBPASOS HORIZONTALES */}

            <nav className={styles.hwWorkflowPanel} aria-label="Subpasos de la etapa">
              <ol
                className={styles.hwStepper}
                style={{
                  gridTemplateColumns:
                    'repeat('
                    + paso.subpasos.length
                    + ', minmax(0, 1fr))',
                }}
              >
                {paso.subpasos.map((s, i) => (
                  <li
                    key={s.id}
                    className={[
                      styles.hwStepItem,
                      styles['hwStep_' + s.estado],
                    ].join(' ')}
                  >
                    <button
                      type="button"
                      aria-pressed={subpaso?.id === s.id}
                      aria-current={
                        s.estado === 'actual' && !cerrado
                          ? 'step'
                          : undefined
                      }
                      aria-controls="kivo-hw-detail"
                      className={[
                        styles.hwStepButton,
                        subpaso?.id === s.id
                          ? styles.hwStepSelected
                          : '',
                      ].join(' ')}
                      onClick={() => setSubpasoId(s.id)}
                    >
                      <span className={styles.hwDot}>
                        <WorkflowIcon nombre={s.titulo} size={20} />

                        {s.estado === 'hecho' && (
                          <span className={styles.hwDoneMark}>
                            <Check size={10} aria-hidden="true" />
                          </span>
                        )}

                        {s.estado === 'rechazado' && (
                          <span className={styles.hwRejectMark}>
                            <X size={10} aria-hidden="true" />
                          </span>
                        )}
                      </span>

                      <span className={styles.hwStepTitle}>
                        {s.titulo}
                      </span>

                      <small className={
                        styles['hwText_' + s.estado]
                      }>
                        {s.estado === 'actual' && !cerrado
                          ? 'Actual'
                          : etiquetaEstado(s.estado)}
                      </small>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </>
        )}

        {/* NIVEL 3: DETALLE DEL SUBPASO */}

        {subpaso && paso && (
          <section
            id="kivo-hw-detail"
            className={styles.hwDetail}
            aria-label={subpaso.titulo}
          >

            <header className={styles.hwDetailHeader}>
              <span className={[
                styles.hwDetailIcon,
                styles['hwIcon_' + subpaso.estado],
              ].join(' ')}>
                <WorkflowIcon nombre={subpaso.titulo} size={22} />
              </span>

              <div>
                <small>
                  Subpaso {indice + 1} de {paso.subpasos.length}
                </small>

                <h3>{subpaso.titulo}</h3>
              </div>

              <span className={
                styles['hwText_' + subpaso.estado]
              }>
                {etiquetaEstado(subpaso.estado)}
              </span>
            </header>


            <div className={styles.hwDetailColumns}>

              <aside
                className={styles.hwResponsible}
                aria-label="Información del subpaso"
              >
                <dl className={styles.hwMetadata}>
              <div>
                <dt>Responsable</dt>
                <dd>{subpaso.responsable}</dd>
              </div>

              <div>
                <dt>Último movimiento</dt>
                <dd>{fecha(ultimoSubpaso?.fecha)}</dd>
              </div>
            </dl>
              </aside>

              <div className={styles.hwActivity}>

                {eventos.length > 0 && (
              <div className={styles.hwHistory}>
                <h4>Historial de actividades</h4>

                <HistorialBitacora eventos={
                  eventos.map(evento => ({
                    evento,
                    subpaso,
                  }))
                } />
              </div>
            )}

                {eventos.length === 0 && (
                  <div className={styles.hwActivityEmpty}>
                    <Clock3 size={20} aria-hidden="true" />

                    <div>
                      <strong>Historial de actividades</strong>
                      <p>No hay movimientos registrados.</p>
                    </div>
                  </div>
                )}

              </div>

            </div>


            {subpaso.estado === 'pendiente'
              && eventos.length === 0 && (
                <div className={styles.hwPending}>
                  <Clock3 size={18} aria-hidden="true" />

                  <span>
                    {cerrado
                      ? 'Este subpaso no fue ejecutado.'
                      : 'Este subpaso todavía no ha iniciado.'}
                  </span>
                </div>
            )}

            {subpaso.id === 'requisitos'
              && requisitos.length > 0
              && subpaso.estado !== 'pendiente' && (
                <div className={styles.hwRequirements}>

                  <div className={styles.hwSectionHeader}>
                    <h4>Documentación requerida</h4>

                    <span>
                      {aceptados} de {requisitos.length} aceptados
                    </span>
                  </div>

                  <progress
                    className={styles.hwProgress}
                    value={aceptados}
                    max={requisitos.length}
                    aria-label="Documentos aceptados"
                  />

                  <ul className={styles.hwDocuments}>
                    {requisitos.map((r, i) => (
                      <li key={r.nombre + i}>

                        <span className={
                          styles['hwDoc_' + r.estado]
                        }>
                          {r.estado === 'aceptado'
                            ? <Check size={16} aria-hidden="true" />
                            : r.estado === 'observado'
                              ? <X size={16} aria-hidden="true" />
                              : <Clock3 size={16} aria-hidden="true" />}
                        </span>

                        <div className={styles.hwDocumentName}>
                          <span>{r.nombre}</span>

                          {r.subidoPor && (
                            <small>
                              Presentado por {r.subidoPor}
                            </small>
                          )}

                          {r.observacion && (
                            <small className={styles.hwDoc_observado}>
                              {r.observacion}
                            </small>
                          )}
                        </div>

                        <span className={
                          styles['hwDoc_' + r.estado]
                        }>
                          {estadosDocumento[r.estado]}
                        </span>

                      </li>
                    ))}
                  </ul>

                  {enCurso && faltantes.length > 0 && (
                    <div className={styles.hwMissing}>
                      <strong>Falta:</strong>

                      <ul>
                        {faltantes.map((r, i) => (
                          <li key={r.nombre + i}>
                            {r.nombre} · {estadosDocumento[r.estado]}
                            {r.observacion && (
                              <small>{r.observacion}</small>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
            )}

            {enCurso && subpaso.id !== 'requisitos' && (
              <div className={styles.hwCurrent}>
                <strong>Falta:</strong>{' '}
                completar la gestión de {subpaso.responsable}.
              </div>
            )}

            {subpaso.estado === 'hecho'
              && eventos.length === 0 && (
                <p className={styles.hwEmpty}>
                  Sin movimientos específicos registrados.
                </p>
            )}

          </section>
        )}

      </div>

      {/* NAVEGACIÓN EXCLUSIVAMENTE DE CONSULTA */}

      {paso && subpaso && (
        <footer className={styles.hwFooter}>

          <button
            type="button"
            disabled={indice <= 0}
            onClick={() => navegar(-1)}
          >
            <ChevronDown
              size={16}
              className={styles.hwPrevious}
              aria-hidden="true"
            />
            Anterior
          </button>

          <span>
            {indice + 1} de {paso.subpasos.length}
          </span>

          <button
            type="button"
            disabled={indice >= paso.subpasos.length - 1}
            onClick={() => navegar(1)}
          >
            Siguiente
            <ChevronDown
              size={16}
              className={styles.hwNext}
              aria-hidden="true"
            />
          </button>

        </footer>
      )}

      {/* CONSERVAR EVENTOS SIN SUBPASO ASOCIADO */}

      {otros.length > 0 && (
        <div className={styles.hwExtra}>
          <h4>Otros movimientos del expediente</h4>

          <HistorialBitacora eventos={
            otros.map(evento => ({ evento }))
          } />
        </div>
      )}

    </section>
  );
}

function HistorialBitacora({
  eventos,
}: {
  eventos: EventoBitacora[];
}) {
  if (!eventos.length) {
    return (
      <p className={styles.auditEmpty}>
        No hay movimientos para este filtro.
      </p>
    );
  }

  return (
    <ol className={styles.auditTimeline}>
      {eventos.map(({ evento: e, subpaso }, i) => {
        const anterior = eventos[i - 1]?.evento;

        const nuevoDia =
          !anterior || fechaDia(anterior.fecha) !== fechaDia(e.fecha);

        const rechazo = esRechazo(e);
        const observado = esObservado(e);
        const subsanado = esSubsanado(e);
        const sistema = esSistema(e);

        const clase = rechazo
          ? styles.auditRejected
          : subsanado
            ? styles.auditResolved
            : observado
              ? styles.auditObserved
              : sistema
                ? styles.auditSystem
                : '';

        return (
          <li key={e.codigo + e.fecha + i}>

            {nuevoDia && (
              <div className={styles.auditDay}>
                {fechaDia(e.fecha)}
              </div>
            )}

            <article className={styles.auditEvent + ' ' + clase}>

              <time
                dateTime={e.fecha}
                className={styles.auditTime}
                title={fecha(e.fecha)}
              >
                {fecha(e.fecha).slice(-5)}
              </time>

              <div className={styles.auditEventBody}>

                {rechazo && (
                  <div className={styles.auditEventLabel}>
                    {e.codigo === 'FLU-042' || /CANCELAD/i.test(e.estado)
                      ? 'Cancelación del expediente'
                      : 'Rechazo del expediente'}
                  </div>
                )}

                {!rechazo && subsanado && (
                  <div className={styles.auditEventLabel}>Subsanación</div>
                )}

                {!rechazo && !subsanado && observado && (
                  <div className={styles.auditEventLabel}>Observación</div>
                )}

                <p className={styles.auditSentence}>
                  <strong>{actorEvento(e)}</strong>{' '}
                  {accionEvento(e, subpaso)}{e.motivo ? ':' : '.'}
                </p>

                {e.motivo && (
                  <p className={styles.auditReason}>{e.motivo}</p>
                )}

                <div className={styles.auditEventMeta}>
                  {e.rol}
                  {subpaso && <> · {subpaso.titulo}</>}
                </div>

              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
