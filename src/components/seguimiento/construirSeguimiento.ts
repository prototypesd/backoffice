// Convierte el historial de transiciones FLU en el estado de cada paso y subpaso.
import { PASOS, CODIGOS_RECHAZO, type FluEvento, type PasoDef, type SubpasoDef } from './seguimiento.config';

export type EstadoVisual = 'hecho' | 'actual' | 'pendiente' | 'rechazado';

export interface SubpasoVista extends SubpasoDef {
  estado: EstadoVisual;
  eventos: FluEvento[];
  tuvoObservacion: boolean;
}

export interface PasoVista extends Omit<PasoDef, 'subpasos'> {
  estado: EstadoVisual;
  subpasos: SubpasoVista[];
  subpasoActual?: SubpasoVista;
  responsable?: string;
  ultimaFecha?: string;
}

const esObservacion = (e: FluEvento) => e.estado.startsWith('OBSERVADO');

export function construirSeguimiento(historial: FluEvento[]): PasoVista[] {
  const eventos = [...historial].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ultimo = eventos.at(-1);

  // Índice global de cada subpaso para saber qué quedó atrás.
  const orden = PASOS.flatMap((p) => p.subpasos.map((s) => s.id));
  const subpasoDe = (codigo: string) =>
    PASOS.flatMap((p) => p.subpasos).find((s) => s.codigos.includes(codigo as never));
  const idActual = ultimo ? subpasoDe(ultimo.codigo)?.id : undefined;
  const posActual = idActual ? orden.indexOf(idActual) : -1;
  const rechazado = !!ultimo && CODIGOS_RECHAZO.includes(ultimo.codigo);

  return PASOS.map((paso) => {
    const subpasos: SubpasoVista[] = paso.subpasos.map((s) => {
      const propios = eventos.filter((e) => s.codigos.includes(e.codigo));
      const pos = orden.indexOf(s.id);
      let estado: EstadoVisual = 'pendiente';
      if (pos < posActual) estado = 'hecho';
      else if (pos === posActual) estado = rechazado ? 'rechazado' : 'actual';
      return { ...s, estado, eventos: propios, tuvoObservacion: propios.some(esObservacion) };
    });

    const estado: EstadoVisual = subpasos.some((s) => s.estado === 'rechazado')
      ? 'rechazado'
      : subpasos.every((s) => s.estado === 'hecho')
        ? 'hecho'
        : subpasos.some((s) => s.estado !== 'pendiente')
          ? 'actual'
          : 'pendiente';

    const delPaso = subpasos.flatMap((s) => s.eventos);
    const ultimoDelPaso = delPaso.at(-1);
    const subpasoActual = subpasos.find((s) => s.estado === 'actual' || s.estado === 'rechazado');

    return {
      numero: paso.numero,
      titulo: paso.titulo,
      descripcion: paso.descripcion,
      estado,
      subpasos,
      subpasoActual,
      responsable: ultimoDelPaso
        ? [ultimoDelPaso.rol, ultimoDelPaso.actorNombre].filter(Boolean).join(' · ')
        : undefined,
      ultimaFecha: ultimoDelPaso?.fecha,
    };
  });
}
