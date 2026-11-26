'use client';

import { createPortal } from 'react-dom';

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


export default function ExpedienteAvance({
  historial,
  requisitos = [],
}: Props) {
  const pasos = construirSeguimiento(historial);

  return (
    <>
      <AvanceMinimal pasos={pasos} historial={historial} />

      <Bitacora
        pasos={pasos}
        historial={historial}
        requisitos={requisitos}
      />
    </>
  );
}

function AvanceMinimal({
  pasos,
  historial,
}: {
  pasos: PasoVista[];
  historial: FluEvento[];
}) {
  const [visibleHasta, setVisibleHasta] = useState(-1);

  const ultimo = ordenarEventos(historial).at(-1);
  const cerrado = ultimo ? esRechazo(ultimo) : false;

  const actual = pasos.find(
    p => p.estado === 'actual'
      || p.estado === 'rechazado'
  );

  const limite = pasos.reduce(
    (maximo, p, i) =>
      p.estado !== 'pendiente'
        ? Math.max(maximo, i)
        : maximo,
    -1
  );

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (media.matches) {
      setVisibleHasta(limite);
      return;
    }

    setVisibleHasta(-1);

    if (limite < 0) return;

    let indice = -1;

    const timer = window.setInterval(() => {
      indice += 1;
      setVisibleHasta(indice);

      if (indice >= limite) {
        window.clearInterval(timer);
      }
    }, 380);

    return () => window.clearInterval(timer);
  }, [limite]);

  return (
    <section
      className={styles.amCard}
      aria-label="Avance del trámite"
    >
      <header className={styles.amHeader}>
        <h2>Avance del trámite</h2>

        {cerrado && (
          <span className={styles.amClosed}>
            {ultimo?.codigo === 'FLU-042'
              || /CANCELAD/i.test(ultimo?.estado ?? '')
              ? 'Expediente cancelado'
              : 'Expediente rechazado'}
          </span>
        )}
      </header>

      <div className={styles.amScroll}>
        <ol
          className={styles.amSteps}
          style={{
            gridTemplateColumns:
              `repeat(${pasos.length}, minmax(0, 1fr))`,
          }}
        >
          {pasos.map((p, i) => {
            const revelado = i <= visibleHasta;

            const estado = revelado
              ? p.estado
              : 'pendiente';

            const subpaso = p.subpasoActual;

            const indiceSub = subpaso
              ? p.subpasos.findIndex(s => s.id === subpaso.id)
              : -1;

            const enlaceCompletado =
              i < visibleHasta && p.estado === 'hecho';

            const fechaPaso = p.ultimaFecha
              ? fechaCorta(p.ultimaFecha)
              : '';

            return (
              <li key={p.numero} className={styles.amItem}>

                {i < pasos.length - 1 && (
                  <span
                    className={[
                      styles.amLine,
                      enlaceCompletado
                        ? styles.amLineDone
                        : '',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <i />
                  </span>
                )}

                <div
                  className={[
                    styles.amStep,
                    styles['am_' + estado],
                  ].join(' ')}
                  aria-current={
                    p === actual && !cerrado
                      ? 'step'
                      : undefined
                  }
                >

                  <span
                    className={styles.amDot}
                    aria-hidden="true"
                  >
                    {estado === 'hecho'
                      ? <Check size={19} strokeWidth={2.7} />
                      : estado === 'rechazado'
                        ? <X size={19} strokeWidth={2.7} />
                        : p.numero}
                  </span>

                  <span className={styles.amLabel}>
                    <strong>{p.titulo}</strong>

                    {estado === 'hecho' && fechaPaso && (
                      <small>{fechaPaso}</small>
                    )}

                    {estado === 'actual'
                      && !cerrado
                      && indiceSub >= 0 && (
                        <small>
                          Paso {indiceSub + 1} de {p.subpasos.length}
                        </small>
                    )}

                    {estado === 'rechazado' && (
                      <small>Rechazado</small>
                    )}

                    {estado === 'actual' && cerrado && (
                      <small>Interrumpido</small>
                    )}

                    <span className={styles.amSrOnly}>
                      {cerrado && p.estado === 'actual'
                        ? 'Interrumpido'
                        : ESTADOS_PASO[p.estado]}
                    </span>
                  </span>

                </div>

              </li>
            );
          })}
        </ol>
      </div>
    </section>
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

  const [inlineCollapsed, setInlineCollapsed] =
    useState(false);

  useEffect(() => {
    setInlineCollapsed(false);
  }, [numeroPaso, subpasoId]);



  // Microinteracción de ubicuidad.
  // El recorrido visual no modifica los datos ni el historial.

  const etapaObjetivo = !cerrado ? actual?.numero : undefined;

  const [hwAnimatedStage, setHwAnimatedStage] =
    useState<number | null>(null);

  const [hwAnimating, setHwAnimating] = useState(false);
  const [hwArrived, setHwArrived] = useState(false);
  const [hwCancelled, setHwCancelled] = useState(false);

  const etapasRecorrido = pasos
    .filter(p =>
      etapaObjetivo !== undefined
      && p.numero <= etapaObjetivo
    )
    .map(p => p.numero)
    .join(',');

  useEffect(() => {
    if (
      etapaObjetivo === undefined
      || hwCancelled
      || !etapasRecorrido
    ) {
      setHwAnimating(false);
      setHwAnimatedStage(null);
      setHwArrived(false);
      return;
    }

    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (media.matches) {
      setHwAnimating(false);
      setHwAnimatedStage(null);
      return;
    }

    const recorrido = etapasRecorrido.split(',').map(Number);
    const timers: number[] = [];

    setHwAnimating(true);
    setHwAnimatedStage(null);
    setHwArrived(false);

    recorrido.forEach((numero, indice) => {
      timers.push(
        window.setTimeout(() => {
          setHwAnimatedStage(numero);

          if (numero === etapaObjetivo) {
            setHwArrived(true);
            setHwAnimating(false);
          }
        }, 180 + indice * 350)
      );
    });

    timers.push(
      window.setTimeout(() => {
        setHwArrived(false);
        setHwAnimatedStage(null);
      }, 180 + (recorrido.length - 1) * 350 + 650)
    );

    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, [etapaObjetivo, etapasRecorrido, hwCancelled]);


  const [hwAnimatedSub, setHwAnimatedSub] =
    useState<string | null>(null);

  const [hwSubAnimating, setHwSubAnimating] =
    useState(false);

  const [hwSubArrived, setHwSubArrived] =
    useState(false);

  const objetivoSubpaso = actual?.subpasoActual?.id;

  const recorridoSubpasos = actual && objetivoSubpaso
    ? actual.subpasos
        .slice(
          0,
          actual.subpasos.findIndex(
            s => s.id === objetivoSubpaso
          ) + 1
        )
        .map(s => s.id)
        .join(',')
    : '';

  const cancelarRecorrido = () => {
    setHwCancelled(true);
    setHwAnimating(false);
    setHwAnimatedStage(null);
    setHwArrived(false);
    setHwSubAnimating(false);
    setHwAnimatedSub(null);
    setHwSubArrived(false);
  };

  useEffect(() => {
    if (
      cerrado
      || hwCancelled
      || etapaObjetivo === undefined
      || !recorridoSubpasos
      || !objetivoSubpaso
    ) {
      setHwSubAnimating(false);
      setHwAnimatedSub(null);
      setHwSubArrived(false);
      return;
    }

    if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
    ) {
      return;
    }

    const recorrido = recorridoSubpasos.split(',');
    const cantidadEtapas =
      etapasRecorrido.split(',').filter(Boolean).length;

    const espera =
      180 + Math.max(0, cantidadEtapas - 1) * 350 + 680;

    const timers: number[] = [];

    setHwSubAnimating(true);
    setHwAnimatedSub(null);
    setHwSubArrived(false);

    recorrido.forEach((id, indice) => {
      timers.push(
        window.setTimeout(() => {
          setHwAnimatedSub(id);

          if (id === objetivoSubpaso) {
            setHwSubAnimating(false);
            setHwSubArrived(true);
          }
        }, espera + indice * 230)
      );
    });

    timers.push(
      window.setTimeout(() => {
        setHwAnimatedSub(null);
        setHwSubArrived(false);
        setHwSubAnimating(false);
      }, espera + (recorrido.length - 1) * 230 + 500)
    );

    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, [
    cerrado,
    hwCancelled,
    etapaObjetivo,
    etapasRecorrido,
    recorridoSubpasos,
    objetivoSubpaso,
  ]);

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




  const seleccionarPaso = (p: PasoVista) => {
    cancelarRecorrido();

    setNumeroPaso(p.numero);

    setSubpasoId(
      p.subpasoActual?.id
        ?? p.subpasos[0]?.id
        ?? ''
    );
  };

  const navegar = (direccion: number) => {
    cancelarRecorrido();
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
                  !hwAnimating && numeroPaso === p.numero
                    ? styles.hwTabSelected
                    : '',
                  hwAnimating && hwAnimatedStage === p.numero
                    ? styles.hwTabTravel
                    : '',
                  hwArrived
                    && !hwCancelled
                    && p.numero === etapaObjetivo
                    && numeroPaso === p.numero
                    ? styles.hwTabArrived
                    : '',
                ].join(' ')}
              >

                <span className={styles.hwTabNumber}>
                  {String(p.numero).padStart(2, '0')}
                </span>

                {p.estado === 'actual' && !cerrado && (
                  <span className={styles.hwNow}>Ahora</span>
                )}

                <span
                  className={[
                    styles.hwCardBlob,
                    styles['hwCardBlob_' + p.estado],
                  ].join(' ')}
                  aria-hidden="true"
                />

                <span className={styles.hwStageIcon}>
                  <WorkflowIcon nombre={p.titulo} size={38} />
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

            <div className={styles.hwStageHeader}>
              <div>
                <h3>{paso.titulo}</h3>
              </div>

              <div className={styles.hwStageTools}>

              {actual && !cerrado && (
                numeroPaso !== actual.numero
                || subpaso?.id !== (
                  actual.subpasoActual?.id
                  ?? actual.subpasos[0]?.id
                )
              ) && (
                <button
                  type="button"
                  className={styles.hwReturn}
                  onClick={() => seleccionarPaso(actual)}
                >
                  Ir al paso actual
                </button>
              )}

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
                      aria-expanded={
                        subpaso?.id === s.id && !inlineCollapsed
                      }
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
                        !hwSubAnimating
                          && subpaso?.id === s.id
                          ? styles.hwStepSelected
                          : '',
                        hwSubAnimating
                          && hwAnimatedSub === s.id
                          ? styles.hwSubTravel
                          : '',
                        hwSubArrived
                          && s.id === objetivoSubpaso
                          && subpaso?.id === s.id
                          ? styles.hwSubArrived
                          : '',
                      ].join(' ')}
                      onClick={() => {
                        cancelarRecorrido();
                        if (subpaso?.id === s.id) {
                          setInlineCollapsed(value => !value);
                        } else {
                          setInlineCollapsed(false);
                          setSubpasoId(s.id);
                        }
                      }}
                    >
                      <span className={styles.hwSubTop}>

                      <span className={styles.hwSubNumber}>
                        {String(i + 1).padStart(2, '0')}
                      </span>

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
                      </span>

                      <span className={styles.hwStepTitle}>
                        {s.titulo}
                      </span>

                      <small className={
                        styles['hwText_' + s.estado]
                      }>
                        <span
                          className={styles.hwSubStatusDot}
                          aria-hidden="true"
                        />
                        {s.estado === 'actual' && !cerrado
                          ? 'Ahora'
                          : etiquetaEstado(s.estado)}
                      </small>

                      <span
                        className={styles.hwSubLine}
                        aria-hidden="true"
                      />

                      <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className={[
                          styles.hwInlineChevron,
                          subpaso?.id === s.id && !inlineCollapsed
                            ? styles.hwInlineChevronOpen
                            : '',
                        ].join(' ')}
                      />
                    </button>

                    {subpaso?.id === s.id && !inlineCollapsed && (
                      <div className={styles.hwInlineDetail}>
                        <div
                          className={styles.hwInlineConnector}
                          aria-hidden="true"
                        />
                        <div className={styles.hwInlineContent}>
{subpaso && paso && (
          <section
            id="kivo-hw-detail"
            className={styles.hwDetail}
            aria-label={subpaso.titulo}
          >


            <div className={styles.adOverview}>

              <div className={styles.adFact}>
                <span className={styles.adFactIcon}>
                  <UserRoundCheck size={23} aria-hidden="true" />
                </span>

                <div>
                  <small>Responsables de la gestión</small>
                  <strong>{subpaso.responsable}</strong>
                </div>
              </div>

              <div className={styles.adFact}>
                <span className={
                  styles.adFactIcon + ' ' + styles.adFactDark
                }>
                  <Clock3 size={23} aria-hidden="true" />
                </span>

                <div>
                  <small>Último movimiento</small>
                  <strong>
                    {ultimoSubpaso
                      ? fecha(ultimoSubpaso.fecha)
                      : 'Sin movimientos registrados'}
                  </strong>
                </div>
              </div>

              <span className={[
                styles.adStatus,
                styles['adStatus_' + (
                  cerrado && subpaso.estado === 'actual'
                    ? 'rechazado'
                    : subpaso.estado
                )],
              ].join(' ')}>
                {etiquetaEstado(subpaso.estado)}
              </span>

            </div>

            <section
              className={styles.adActivity}
              aria-label="Historial de actividades"
            >

              <div className={styles.adSectionHeader}>
                <h4>Historial de actividades</h4>

                <span>
                  {eventos.length} movimiento
                  {eventos.length !== 1 ? 's' : ''}
                </span>
              </div>

              {eventos.length > 0 ? (
                <div className={styles.adTimeline}>
                  <HistorialBitacora eventos={
                    eventos.map(evento => ({
                      evento,
                      subpaso,
                    }))
                  } />
                </div>
              ) : (
                <div className={styles.adEmpty}>
                  <Clock3 size={20} aria-hidden="true" />
                  <span>No hay movimientos registrados.</span>
                </div>
              )}

            </section>

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
                <DocumentManager
                  requisitos={requisitos}
                  enCurso={enCurso}
                />
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
                      </div>
                    )}

                  </li>
                ))}
              </ol>
            </nav>
          </>
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

function DocumentManager({
  requisitos,
  enCurso,
}: {
  requisitos: Requisito[];
  enCurso: boolean;
}) {
  type Filtro = 'todos' | 'atencion' | Requisito['estado'];

  const [filtro, setFiltro] = useState<Filtro>('todos');

  const [demoObservacion, setDemoObservacion] = useState<null | {
    nombre: string;
    observacion: string;
    presentadoPor: string;
  }>(null);

  useEffect(() => {
    if (!demoObservacion) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDemoObservacion(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [demoObservacion]);

  const etiquetas = {
    aceptado: 'Aceptado',
    recibido: 'Recibido',
    observado: 'Observado',
    pendiente: 'Pendiente',
  } as const;

  const total = requisitos.length;

  const contar = (estado: Requisito['estado']) =>
    requisitos.filter(r => r.estado === estado).length;

  const aceptados = contar('aceptado');
  const recibidos = contar('recibido');
  const observados = contar('observado');
  const pendientes = contar('pendiente');
  const faltantes = observados + pendientes;

  const porcentaje = total
    ? Math.round(aceptados / total * 100)
    : 0;

  const filtros: {
    id: Filtro;
    nombre: string;
    cantidad: number;
  }[] = [
    { id: 'todos', nombre: 'Todos', cantidad: total },
    {
      id: 'aceptado',
      nombre: 'Aceptados',
      cantidad: aceptados,
    },
    {
      id: 'observado',
      nombre: 'Observados',
      cantidad: observados,
    },
    {
      id: 'pendiente',
      nombre: 'Pendientes',
      cantidad: pendientes,
    },
    ...(recibidos > 0 ? [{
      id: 'recibido' as const,
      nombre: 'Recibidos',
      cantidad: recibidos,
    }] : []),
  ];

  const visibles = requisitos.filter(r => {
    if (filtro === 'todos') return true;

    if (filtro === 'atencion') {
      return r.estado === 'observado'
        || r.estado === 'pendiente';
    }

    return r.estado === filtro;
  });

  return (
    <section
      className={styles.dmPanel}
      aria-label="Documentación requerida"
    >

      {/* ENCABEZADO */}

      <div className={styles.dmHeader}>

        <div className={styles.dmHeading}>
          <span className={styles.dmHeadingIcon}>
            <ClipboardList size={24} aria-hidden="true" />
          </span>

          <div>
            <h4>Documentación requerida</h4>
            <p>
              {aceptados} de {total} documentos aceptados
            </p>
          </div>
        </div>

        <div
          className={styles.dmProgress}
          role="progressbar"
          aria-label="Documentos aceptados"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcentaje}
        >
          <svg
            viewBox="0 0 64 64"
            width="64"
            height="64"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#e3e8ef"
              strokeWidth="4"
            />

            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#008c45"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={
                porcentaje + ' ' + (100 - porcentaje)
              }
              transform="rotate(-90 32 32)"
              className={styles.dmProgressRing}
            />

            <text
              x="32"
              y="33"
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.dmProgressText}
            >
              {porcentaje}%
            </text>
          </svg>
        </div>

      </div>

      {/* FILTROS DE CONSULTA */}

      <div
        className={styles.dmFilters}
        role="group"
        aria-label="Filtrar documentos por estado"
      >
        {filtros.map(f => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            className={[
              styles.dmFilter,
              filtro === f.id
                ? styles.dmFilterSelected
                : '',
            ].join(' ')}
            onClick={() => setFiltro(f.id)}
          >
            <span>{f.nombre}</span>

            <span className={styles.dmFilterCount}>
              {f.cantidad}
            </span>
          </button>
        ))}
      </div>

      {/* TABLA ÚNICA DE DOCUMENTOS */}

      <div className={styles.dmTableWrap}>

        <table className={styles.dmTable}>
          <thead>
            <tr>
              <th scope="col">Documento</th>
              <th scope="col">Presentado por</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>

          <tbody>

            {visibles.map((r, i) => (
              <tr
                key={r.nombre + i}
                className={
                  r.estado === 'observado'
                    ? styles.dmObservedRow
                    : undefined
                }
                onClick={
                  r.estado === 'observado'
                    ? () => setDemoObservacion({
                        nombre: r.nombre,
                        observacion: r.observacion
                          ?? 'Sin motivo registrado.',
                        presentadoPor:
                          r.subidoPor === 'cliente'
                            ? 'Cliente'
                            : r.subidoPor === 'asesor'
                              ? 'Asesor'
                              : 'No registrado',
                      })
                    : undefined
                }
              >

                <td>
                  <div className={styles.dmDocument}>

                    <span className={styles.dmDocumentIcon}>
                      <ClipboardList
                        size={21}
                        aria-hidden="true"
                      />
                    </span>

                    <div className={styles.dmDocumentName}>
                      <strong>{r.nombre}</strong>

                      {r.observacion && (
                        <button
                          type="button"
                          className={styles.dmObservationButton}
                          onClick={() => setDemoObservacion({
                            nombre: r.nombre,
                            observacion: r.observacion ?? 'Documento ilegible.',
                            presentadoPor: r.subidoPor === 'cliente'
                              ? 'Cliente'
                              : r.subidoPor === 'asesor'
                                ? 'Asesor'
                                : 'No registrado',
                          })}
                        >
                          <span aria-hidden="true">!</span>
                          {r.observacion}
                        </button>
                      )}

                      {r.estado === 'pendiente'
                        && !r.observacion
                        && !r.subidoPor && (
                          <small>
                            Pendiente de presentación
                          </small>
                      )}
                    </div>

                  </div>
                </td>

                <td>
                  <span className={styles.dmPresented}>
                    {r.subidoPor === 'cliente'
                      ? 'Cliente'
                      : r.subidoPor === 'asesor'
                        ? 'Asesor'
                        : '—'}
                  </span>
                </td>

                <td>
                  {r.estado === 'observado' ? (
                    <button
                      type="button"
                      className={[
                        styles.dmStatus,
                        styles.dmStatusButton,
                        styles.dmStatus_observado,
                      ].join(' ')}
                      onClick={() => setDemoObservacion({
                        nombre: r.nombre,
                        observacion: r.observacion ?? 'Documento ilegible.',
                        presentadoPor: r.subidoPor === 'cliente'
                          ? 'Cliente'
                          : r.subidoPor === 'asesor'
                            ? 'Asesor'
                            : 'No registrado',
                      })}
                    >
                      <span className={styles.dmStatusIcon}>
                        <span aria-hidden="true">!</span>
                      </span>

                      {etiquetas[r.estado]}
                    </button>
                  ) : (
                    <span className={[
                      styles.dmStatus,
                      styles['dmStatus_' + r.estado],
                    ].join(' ')}>

                      <span className={styles.dmStatusIcon}>
                        {r.estado === 'aceptado'
                          ? <Check size={13} aria-hidden="true" />
                          : r.estado === 'recibido'
                            ? <ClipboardCheck
                                size={13}
                                aria-hidden="true"
                              />
                            : <Clock3
                                size={16}
                                aria-hidden="true"
                              />}
                      </span>

                      {etiquetas[r.estado]}

                    </span>
                  )}
                </td>

              </tr>
            ))}

            {visibles.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className={styles.dmEmpty}
                >
                  No hay documentos en este estado.
                </td>
              </tr>
            )}

          </tbody>
        </table>

      </div>

      {/* RESUMEN INFERIOR */}

      <div className={styles.dmFooter}>

        {enCurso && faltantes > 0 ? (
          <>
            <span className={styles.dmFooterIcon}>
              <span aria-hidden="true">i</span>
            </span>

            <div className={styles.dmFooterText}>
              <strong>
                {faltantes} documento
                {faltantes !== 1 ? 's requieren' : ' requiere'}
                {' '}atención
              </strong>

              <small>
                {observados} observado
                {observados !== 1 ? 's' : ''}
                {' · '}
                {pendientes} pendiente
                {pendientes !== 1 ? 's' : ''}
              </small>
            </div>

            <button
              type="button"
              className={styles.dmAttentionLink}
              aria-pressed={filtro === 'atencion'}
              onClick={() => setFiltro(
                filtro === 'atencion'
                  ? 'todos'
                  : 'atencion'
              )}
            >
              {filtro === 'atencion'
                ? 'Ver todos'
                : 'Ver pendientes y observados'}
            </button>
          </>
        ) : (
          <span className={styles.dmResultCount}>
            {visibles.length} de {total} documentos
          </span>
        )}

      </div>


      {demoObservacion && typeof document !== 'undefined' && createPortal(
        <div
          className={styles.dmModalBackdrop}
          role="presentation"
          onClick={() => setDemoObservacion(null)}
        >
          <div
            className={styles.dmSimpleModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dm-modal-title"
            onClick={event => event.stopPropagation()}
          >

            <div className={styles.dmSimpleModalTop}>

              <span className={styles.dmSimpleModalIcon}>
                <ClipboardList
                  size={25}
                  aria-hidden="true"
                />
              </span>

              <button
                type="button"
                autoFocus
                className={styles.dmSimpleClose}
                onClick={() => setDemoObservacion(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>

            </div>

            <h5 id="dm-modal-title">
              {/ilegible/i.test(demoObservacion.observacion)
                ? 'Documento ilegible'
                : 'Documento observado'}
            </h5>

            <span className={styles.dmSimpleDocName}>
              {demoObservacion.nombre}
            </span>


            {/ilegible/i.test(demoObservacion.observacion) && (
              <div className={styles.dmDemoImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/demo/ejemplo.jpeg"
                  alt="Ejemplo de documento ilegible"
                />
                <small>Documento de ejemplo</small>
              </div>
            )}

            <div className={styles.dmSimpleDescription}>

              {/ilegible/i.test(
                demoObservacion.observacion
              ) ? (
                <>
                  <p>
                    No se puede verificar la información
                    del documento debido a su baja calidad.
                  </p>

                  <p>
                    Se requiere una nueva copia legible.
                  </p>
                </>
              ) : (
                <p>{demoObservacion.observacion}</p>
              )}

            </div>


            <button
              type="button"
              className={styles.dmSimplePrimary}
              onClick={() => setDemoObservacion(null)}
            >
              Entendido
            </button>

          </div>
        </div>,
          document.body
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
