// Formatos de fecha fijos (La Paz = UTC-4, sin horario de verano).
// Determinísticos: el servidor y el navegador renderizan lo mismo (sin errores de hidratación).

const dos = (n: number) => String(n).padStart(2, '0');
const laPaz = (iso: string) => new Date(new Date(iso).getTime() - 4 * 3600 * 1000);

/** 19/11/2026 09:10 */
export function fecha(iso?: string) {
  if (!iso) return '—';
  const d = laPaz(iso);
  return `${dos(d.getUTCDate())}/${dos(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`;
}

/** 19/11/2026 */
export function fechaDia(iso?: string) {
  if (!iso) return '—';
  const d = laPaz(iso);
  return `${dos(d.getUTCDate())}/${dos(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** 19/11 */
export function fechaCorta(iso?: string) {
  if (!iso) return '—';
  const d = laPaz(iso);
  return `${dos(d.getUTCDate())}/${dos(d.getUTCMonth() + 1)}`;
}

/** "2 días", "5 horas". Usar solo en el navegador (depende de la hora actual). */
export function haceCuanto(iso: string, ahora = Date.now()) {
  const h = Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / 36e5));
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d} ${d === 1 ? 'día' : 'días'}`;
  return `${Math.max(h, 1)} ${h <= 1 ? 'hora' : 'horas'}`;
}
