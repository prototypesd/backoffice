"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  Plus,
  RotateCcw,
  Trash2,
  Wallet,
} from "lucide-react";
import Header from "@/components/Header";
import base from "@/app/nuevas-solicitudes/solicitudes.module.scss";
import styles from "./calculadora.module.scss";

/* ───────── Tipos ───────── */
type Moneda = "BOB" | "USD";
type FormaPago = "CUOTA_FIJA" | "CAPITAL_FIJO";

type FormData = {
  tipoPrestamo: string;
  tipoPersona: string;
  monto: string;
  moneda: Moneda;
  tasaAnual: string;
  plazo: string;
  periodicidad: number;
  formaPago: FormaPago;
  destino: string;
  fechaDesembolso: string;
  diaPago: string;
  gracia: string;
  cuotaAdicional: boolean;
};

type Cargo = { id: number; descripcion: string; porcentaje: string };

type Fila = {
  numero: number;
  fecha: Date;
  dias: number;
  gracia: boolean;
  saldoInicial: number;
  capital: number;
  interes: number;
  cargosDet: number[];
  cargos: number;
  ahorro: number;
  total: number;
  saldoFinal: number;
};

type Resultado = {
  datos: FormData;
  cargos: { descripcion: string; pct: number }[];
  cuotaCI: number | null;
  filas: Fila[];
  ref: Fila;
  totalCapital: number;
  totalInteres: number;
  totalCargos: number;
  totalPagar: number;
  tea: number;
};

/* ───────── Catálogos de demostración ───────── */
const TIPOS_PRESTAMO = [
  "Préstamos amortizables asalariados",
  "Préstamos amortizables independientes",
  "Microcrédito",
];
const TIPOS_PERSONA = ["Persona natural", "Persona jurídica"];

const PERIODICIDADES = [
  { value: 1, label: "Mensual" },
  { value: 2, label: "Bimestral" },
  { value: 3, label: "Trimestral" },
  { value: 6, label: "Semestral" },
];

const FORMAS_PAGO: { value: FormaPago; label: string }[] = [
  { value: "CUOTA_FIJA", label: "Cuota fija" },
  { value: "CAPITAL_FIJO", label: "Capital fijo" },
];

const DESTINOS = ["Capital de trabajo", "Consumo", "Vivienda", "Vehículo", "Educación", "Salud"];

const CARGOS_INICIALES: Cargo[] = [
  { id: 20, descripcion: "Seguro de desgravamen", porcentaje: "0.077" },
  { id: 161, descripcion: "Cargo administrativo", porcentaje: "0.40" },
];

const INICIAL: FormData = {
  tipoPrestamo: TIPOS_PRESTAMO[0],
  tipoPersona: TIPOS_PERSONA[0],
  monto: "10000",
  moneda: "BOB",
  tasaAnual: "36",
  plazo: "12",
  periodicidad: 1,
  formaPago: "CUOTA_FIJA",
  destino: "Capital de trabajo",
  fechaDesembolso: "",
  diaPago: "",
  gracia: "0",
  cuotaAdicional: false,
};

/* ───────── Utilidades ───────── */
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));
const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
const DIA_MS = 86_400_000;

function hoyISO() {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseISO(s: string): Date | null {
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** N meses después del desembolso, en el día de pago (fin de mes si no existe). Domingo → lunes. */
function fechaCuota(desembolso: Date, meses: number, dia: number) {
  const y = desembolso.getFullYear();
  const m = desembolso.getMonth() + meses;
  const ultimo = new Date(y, m + 1, 0).getDate();
  const d = new Date(y, m, Math.min(dia, ultimo));
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d;
}

const diasEntre = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DIA_MS);

function fmtFecha(d: Date) {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function dinero(n: number, moneda: Moneda) {
  const s = n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${moneda === "USD" ? "US$" : "Bs"} ${s}`;
}

const pct = (n: number, dec = 2) => `${n.toLocaleString("es-BO", { minimumFractionDigits: dec, maximumFractionDigits: dec })} %`;

const etiquetaPeriodo = (p: number) => PERIODICIDADES.find((x) => x.value === p)?.label ?? `${p} meses`;

/* ───────── Validación ───────── */
function validar(f: FormData, cargos: Cargo[]): string {
  const monto = num(f.monto);
  const tasa = num(f.tasaAnual);
  const plazo = num(f.plazo);
  const gracia = num(f.gracia || "0");
  const dia = num(f.diaPago);

  if (!(monto > 0)) return "Ingresa un monto mayor a 0.";
  if (!(tasa > 0 && tasa <= 100)) return "La tasa anual debe estar entre 0 y 100 %.";
  if (!Number.isInteger(plazo) || plazo < 1 || plazo > 120) return "El plazo debe ser de 1 a 120 meses.";
  if (plazo % f.periodicidad !== 0)
    return `Con pago ${etiquetaPeriodo(f.periodicidad).toLowerCase()}, el plazo debe ser múltiplo de ${f.periodicidad} meses.`;
  if (!Number.isInteger(gracia) || gracia < 0) return "La gracia debe ser un número entero de meses.";
  if (Math.floor(gracia / f.periodicidad) >= plazo / f.periodicidad) return "La gracia debe ser menor al plazo.";
  if (!parseISO(f.fechaDesembolso)) return "Selecciona la fecha de desembolso.";
  if (!Number.isInteger(dia) || dia < 1 || dia > 31) return "El día de pago debe estar entre 1 y 31.";
  for (const c of cargos) {
    const p = num(c.porcentaje);
    if (!c.descripcion.trim()) return "Cada cargo necesita una descripción.";
    if (!(p >= 0 && p <= 100)) return `El porcentaje de “${c.descripcion}” debe estar entre 0 y 100.`;
  }
  return "";
}

/* ───────── Cálculo (convención del core: interés por días reales / 360) ───────── */
function calcular(f: FormData, cargosIn: Cargo[]): Resultado {
  const P = num(f.monto);
  const per = f.periodicidad;
  const n = num(f.plazo) / per;
  const g = Math.floor(num(f.gracia || "0") / per);
  const tasaDia = num(f.tasaAnual) / 100 / 360;
  const cargos = cargosIn.map((c) => ({ descripcion: c.descripcion.trim(), pct: num(c.porcentaje) }));

  const desembolso = parseISO(f.fechaDesembolso) as Date;
  const dia = num(f.diaPago);
  const fechas = Array.from({ length: n }, (_, k) => fechaCuota(desembolso, (k + 1) * per, dia));
  const dias = fechas.map((d, k) => diasEntre(k === 0 ? desembolso : fechas[k - 1], d));

  /* Cuota fija = capital + interés constante; se resuelve para que el saldo termine en 0 */
  let cuotaCI: number | null = null;
  if (f.formaPago === "CUOTA_FIJA") {
    const saldoAlFinal = (C: number) => {
      let s = P;
      for (let k = g; k < n; k++) s = s * (1 + tasaDia * dias[k]) - C;
      return s;
    };
    let lo = 0;
    let hi = P * 2;
    for (let it = 0; it < 80; it++) {
      const mid = (lo + hi) / 2;
      if (saldoAlFinal(mid) > 0) lo = mid;
      else hi = mid;
    }
    cuotaCI = r2((lo + hi) / 2);
  }
  const capitalFijo = r2(P / (n - g));

  const filas: Fila[] = [];
  let saldo = P;
  for (let k = 0; k < n; k++) {
    const saldoInicial = saldo;
    const interes = r2(saldoInicial * tasaDia * dias[k]);
    const enGracia = k < g;
    const ultima = k === n - 1;
    let capital = 0;
    if (!enGracia) {
      capital = ultima
        ? saldoInicial
        : Math.min(saldoInicial, cuotaCI !== null ? r2(cuotaCI - interes) : capitalFijo);
    }
    const cargosDet = cargos.map((c) => r2(saldoInicial * (c.pct / 100) * per));
    const totalCargos = r2(cargosDet.reduce((a, b) => a + b, 0));
    saldo = r2(saldoInicial - capital);
    filas.push({
      numero: k + 1,
      fecha: fechas[k],
      dias: dias[k],
      gracia: enGracia,
      saldoInicial,
      capital,
      interes,
      cargosDet,
      cargos: totalCargos,
      ahorro: 0,
      total: r2(capital + interes + totalCargos),
      saldoFinal: saldo,
    });
  }

  const suma = (sel: (x: Fila) => number) => r2(filas.reduce((s, x) => s + sel(x), 0));
  const iPeriodo = (num(f.tasaAnual) / 100 / 12) * per;
  const cPeriodo = (cargos.reduce((s, c) => s + c.pct, 0) / 100) * per;

  return {
    datos: f,
    cargos,
    cuotaCI,
    filas,
    ref: filas[g],
    totalCapital: suma((x) => x.capital),
    totalInteres: suma((x) => x.interes),
    totalCargos: suma((x) => x.cargos),
    totalPagar: suma((x) => x.total),
    tea: (Math.pow(1 + iPeriodo + cPeriodo, 12 / per) - 1) * 100,
  };
}

/* ───────── Página ───────── */
export default function CalculadoraPrestamosPage() {
  const [f, setF] = useState<FormData>(INICIAL);
  const [cargos, setCargos] = useState<Cargo[]>(CARGOS_INICIALES);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");
  const [verPlan, setVerPlan] = useState(true);

  /* Fecha de hoy al montar (evita diferencias de hidratación) */
  useEffect(() => {
    const hoy = hoyISO();
    setF((prev) =>
      prev.fechaDesembolso ? prev : { ...prev, fechaDesembolso: hoy, diaPago: String(Number(hoy.slice(8, 10))) }
    );
  }, []);

  function limpiarResultado() {
    setResultado(null);
    setError("");
  }

  function set<K extends keyof FormData>(campo: K, valor: FormData[K]) {
    setF((prev) => ({ ...prev, [campo]: valor }));
    limpiarResultado();
  }

  function editarCargo(id: number, campo: "descripcion" | "porcentaje", valor: string) {
    setCargos((prev) => prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)));
    limpiarResultado();
  }

  function quitarCargo(id: number) {
    setCargos((prev) => prev.filter((c) => c.id !== id));
    limpiarResultado();
  }

  function agregarCargo() {
    setCargos((prev) => [...prev, { id: Date.now(), descripcion: "Nuevo cargo", porcentaje: "0" }]);
    limpiarResultado();
  }

  const proximoPago = useMemo(() => {
    const d = parseISO(f.fechaDesembolso);
    const dia = num(f.diaPago);
    if (!d || !(dia >= 1 && dia <= 31)) return "—";
    return fmtFecha(fechaCuota(d, f.periodicidad, dia));
  }, [f.fechaDesembolso, f.diaPago, f.periodicidad]);

  const tasaMensual = num(f.tasaAnual) > 0 ? pct(num(f.tasaAnual) / 12) : "—";
  const cargosPct = cargos.reduce((s, c) => s + (num(c.porcentaje) || 0), 0);

  function ejecutar() {
    const e = validar(f, cargos);
    if (e) {
      setError(e);
      setResultado(null);
      return;
    }
    setError("");
    setResultado(calcular(f, cargos));
    setVerPlan(true);
  }

  function restablecer() {
    const hoy = hoyISO();
    setF({ ...INICIAL, fechaDesembolso: hoy, diaPago: String(Number(hoy.slice(8, 10))) });
    setCargos(CARGOS_INICIALES);
    setResultado(null);
    setError("");
  }

  function descargarCSV() {
    if (!resultado) return;
    const cab = ["N°", "Fecha", "Días", "Capital", "Interés", ...resultado.cargos.map((c) => c.descripcion), "Cargos", "Ahorro", "Total", "Saldo"];
    const filas = [
      cab,
      ...resultado.filas.map((x) => [
        x.numero,
        fmtFecha(x.fecha),
        x.dias,
        x.capital.toFixed(2),
        x.interes.toFixed(2),
        ...x.cargosDet.map((v) => v.toFixed(2)),
        x.cargos.toFixed(2),
        x.ahorro.toFixed(2),
        x.total.toFixed(2),
        x.saldoFinal.toFixed(2),
      ]),
    ];
    const csv = "﻿" + filas.map((row) => row.join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "kivo-plan-de-pagos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const r = resultado;
  const rm = r?.datos.moneda ?? "BOB";

  return (
    <main className={base.main}>
      <Header title="Calculadora de préstamos" />
      <div className={base.content}>
        <div className={styles.heading}>
          <div>
            <h1 className={base.pageTitle}>Calculadora de préstamos</h1>
            <p className={base.pageSub}>Simula el plan de pagos con las condiciones y cargos del préstamo.</p>
          </div>
          <button type="button" className={styles.btnGhost} onClick={restablecer}>
            <RotateCcw size={16} aria-hidden="true" />
            Restablecer
          </button>
        </div>

        <div className={styles.layout}>
          {/* ───────── Formulario ───────── */}
          <div className={styles.formCol}>
            <section className={styles.card} aria-labelledby="cond">
              <div className={styles.cardHead}>
                <h2 id="cond">Condiciones del préstamo</h2>
                <span className={styles.pill}>{tasaMensual} mensual</span>
              </div>

              <div className={styles.grid}>
                <p className={styles.groupTitle}>Producto</p>

                <label className={styles.field}>
                  <span className={styles.label}>Tipo de préstamo *</span>
                  <select className={styles.select} value={f.tipoPrestamo} onChange={(e) => set("tipoPrestamo", e.target.value)}>
                    {TIPOS_PRESTAMO.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Tipo de persona *</span>
                  <select className={styles.select} value={f.tipoPersona} onChange={(e) => set("tipoPersona", e.target.value)}>
                    {TIPOS_PERSONA.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>

                <p className={styles.groupTitle}>Monto y condiciones</p>

                <label className={styles.field}>
                  <span className={styles.label}>Monto *</span>
                  <div className={styles.control}>
                    <select
                      className={styles.affixSelect}
                      aria-label="Moneda"
                      value={f.moneda}
                      onChange={(e) => set("moneda", e.target.value as Moneda)}
                    >
                      <option value="BOB">Bs</option>
                      <option value="USD">US$</option>
                    </select>
                    <input type="number" inputMode="decimal" min={0} step={100} value={f.monto} onChange={(e) => set("monto", e.target.value)} />
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Tasa *</span>
                  <div className={styles.control}>
                    <input type="number" inputMode="decimal" min={0} step={0.01} value={f.tasaAnual} onChange={(e) => set("tasaAnual", e.target.value)} />
                    <b className={styles.affix}>% anual</b>
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Plazo *</span>
                  <div className={styles.control}>
                    <input type="number" inputMode="numeric" min={1} step={1} value={f.plazo} onChange={(e) => set("plazo", e.target.value)} />
                    <b className={styles.affix}>meses</b>
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Periodicidad de pago *</span>
                  <select className={styles.select} value={f.periodicidad} onChange={(e) => set("periodicidad", Number(e.target.value))}>
                    {PERIODICIDADES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label} · cada {p.value} {p.value === 1 ? "mes" : "meses"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Forma de pago *</span>
                  <select className={styles.select} value={f.formaPago} onChange={(e) => set("formaPago", e.target.value as FormaPago)}>
                    {FORMAS_PAGO.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Destino</span>
                  <select className={styles.select} value={f.destino} onChange={(e) => set("destino", e.target.value)}>
                    {DESTINOS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>

                <p className={styles.groupTitle}>Calendario de pagos</p>

                <label className={styles.field}>
                  <span className={styles.label}>Fecha de desembolso *</span>
                  <input type="date" className={styles.input} value={f.fechaDesembolso} onChange={(e) => set("fechaDesembolso", e.target.value)} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Día de pago *</span>
                  <div className={styles.control}>
                    <input type="number" inputMode="numeric" min={1} max={31} value={f.diaPago} onChange={(e) => set("diaPago", e.target.value)} />
                    <b className={styles.affix}>de cada mes</b>
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label} title="Durante la gracia solo se pagan intereses y cargos.">
                    Período de gracia
                  </span>
                  <div className={styles.control}>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={f.periodicidad}
                      placeholder="0"
                      value={f.gracia}
                      onChange={(e) => set("gracia", e.target.value)}
                    />
                    <b className={styles.affix}>meses</b>
                  </div>
                </label>

                <div className={styles.field}>
                  <span className={styles.label} id="cuotaAdicional">Cuota adicional</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={f.cuotaAdicional}
                    aria-labelledby="cuotaAdicional"
                    className={styles.switch}
                    onClick={() => set("cuotaAdicional", !f.cuotaAdicional)}
                  >
                    <span className={styles.switchTrack}>
                      <span className={styles.switchThumb} />
                    </span>
                    {f.cuotaAdicional ? "Sí" : "No"}
                  </button>
                </div>

                <div className={styles.nextPay} title="Según la fecha de desembolso, la periodicidad y el día de pago. Si cae domingo, pasa al lunes.">
                  <CalendarDays size={18} aria-hidden="true" />
                  <span>Primer pago</span>
                  <strong>{proximoPago}</strong>
                </div>
              </div>
            </section>

            {/* ───────── Cargos ───────── */}
            <section className={styles.card} aria-labelledby="cargos">
              <div className={styles.cardHead}>
                <h2 id="cargos">Cargos por cuota</h2>
                <span className={styles.pill}>{pct(cargosPct, 3)} del saldo</span>
              </div>

              {cargos.length > 0 ? (
                <div className={styles.cargos}>
                  <div className={styles.cargoHead}>
                    <span>Descripción</span>
                    <span>% sobre saldo</span>
                    <span />
                  </div>
                  {cargos.map((c) => (
                    <div className={styles.cargoRow} key={c.id}>
                      <input
                        className={styles.input}
                        aria-label="Descripción del cargo"
                        value={c.descripcion}
                        onChange={(e) => editarCargo(c.id, "descripcion", e.target.value)}
                      />
                      <div className={styles.control}>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.001}
                          aria-label={`Porcentaje de ${c.descripcion}`}
                          value={c.porcentaje}
                          onChange={(e) => editarCargo(c.id, "porcentaje", e.target.value)}
                        />
                        <b className={styles.affix}>%</b>
                      </div>
                      <button type="button" className={styles.iconBtn} aria-label={`Quitar ${c.descripcion}`} onClick={() => quitarCargo(c.id)}>
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyCargos}>Sin cargos: el plan solo tendrá capital e interés.</p>
              )}

              <button type="button" className={styles.addBtn} onClick={agregarCargo}>
                <Plus size={16} aria-hidden="true" />
                Agregar cargo
              </button>
            </section>

            {error ? (
              <p className={styles.error} role="alert">
                <AlertTriangle size={16} aria-hidden="true" />
                {error}
              </p>
            ) : null}

            <button type="button" className={styles.btnCta} onClick={ejecutar}>
              <Calculator size={17} aria-hidden="true" />
              Calcular plan de pagos
            </button>
          </div>

          {/* ───────── Resultado ───────── */}
          <section className={`${styles.card} ${styles.results}`} aria-live="polite">
            {!r ? (
              <div className={styles.placeholder}>
                <span className={styles.placeholderIcon}>
                  <Wallet size={22} aria-hidden="true" />
                </span>
                <h2>El resultado aparecerá aquí</h2>
                <p>Completa las condiciones y calcula para ver la cuota y el plan de pagos.</p>
              </div>
            ) : (
              <>
                <div className={styles.cardHead}>
                  <div>
                    <span className={styles.eyebrow}>Simulación</span>
                    <h2>Resultado del préstamo</h2>
                  </div>
                  <span className={styles.pill}>{pct(num(r.datos.tasaAnual))} anual</span>
                </div>

                <div className={styles.tags}>
                  <span>{dinero(num(r.datos.monto), rm)}</span>
                  <span>{r.datos.plazo} meses</span>
                  <span>{FORMAS_PAGO.find((x) => x.value === r.datos.formaPago)?.label}</span>
                  <span>{etiquetaPeriodo(r.datos.periodicidad)}</span>
                  <span>{r.datos.tipoPersona}</span>
                  <span>{r.datos.destino}</span>
                  {num(r.datos.gracia || "0") > 0 ? <span>Gracia {r.datos.gracia} meses</span> : null}
                  {r.datos.cuotaAdicional ? <span>Cuota adicional</span> : null}
                </div>

                <div className={styles.hero}>
                  <div>
                    <span>
                      {r.cuotaCI !== null ? "Cuota" : "Primera cuota"} con cargos
                      {r.ref.numero > 1 ? ` (desde la cuota ${r.ref.numero})` : ""}
                    </span>
                    <strong>{dinero(r.ref.total, rm)}</strong>
                    <small>
                      {r.cuotaCI !== null ? `Capital + interés fijo: ${dinero(r.cuotaCI, rm)}. ` : ""}
                      Los cargos bajan con el saldo. Primer pago: {fmtFecha(r.filas[0].fecha)}.
                    </small>
                  </div>
                  <Wallet size={30} aria-hidden="true" />
                </div>

                <div className={styles.kpis}>
                  <div>
                    <span>TEA</span>
                    <strong>{pct(r.tea, 5)}</strong>
                  </div>
                  <div>
                    <span>Cargos al desembolso</span>
                    <strong>{dinero(0, rm)}</strong>
                  </div>
                  <div>
                    <span>Intereses totales</span>
                    <strong>{dinero(r.totalInteres, rm)}</strong>
                  </div>
                  <div>
                    <span>Total a pagar</span>
                    <strong>{dinero(r.totalPagar, rm)}</strong>
                  </div>
                </div>

                <div className={styles.sectionTitle}>
                  <BarChart3 size={17} aria-hidden="true" />
                  <h3>Desglose de la cuota {r.ref.numero}</h3>
                </div>
                <div className={styles.breakdown}>
                  <div><span>Capital</span><b>{dinero(r.ref.capital, rm)}</b></div>
                  <div><span>Interés ({r.ref.dias} días)</span><b>{dinero(r.ref.interes, rm)}</b></div>
                  {r.cargos.map((c, i) => (
                    <div key={i}>
                      <span>{c.descripcion} ({pct(c.pct, 3)})</span>
                      <b>{dinero(r.ref.cargosDet[i], rm)}</b>
                    </div>
                  ))}
                  <div className={styles.breakdownTotal}>
                    <span>Total cuota</span>
                    <b>{dinero(r.ref.total, rm)}</b>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {/* ───────── Plan de pagos ───────── */}
        {r ? (
          <section className={`${base.panel} ${styles.schedule}`}>
            <button type="button" className={styles.scheduleToggle} aria-expanded={verPlan} onClick={() => setVerPlan((v) => !v)}>
              <span>
                <FileText size={18} aria-hidden="true" />
                Plan de pagos
                <small>
                  {r.filas.length} cuotas · {etiquetaPeriodo(r.datos.periodicidad).toLowerCase()}
                </small>
              </span>
              <ChevronDown size={18} className={verPlan ? base.chevUp : ""} aria-hidden="true" />
            </button>

            {verPlan ? (
              <>
                <div className={styles.scheduleActions}>
                  <p>Interés por días reales sobre base 360 · cargos sobre el saldo de cada cuota.</p>
                  <button type="button" className={base.open} onClick={descargarCSV}>
                    <Download size={16} aria-hidden="true" />
                    Exportar CSV
                  </button>
                </div>

                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Fecha</th>
                        <th>Días</th>
                        <th>Capital</th>
                        <th>Interés</th>
                        <th>Cargos</th>
                        <th>Ahorro</th>
                        <th>Total</th>
                        <th>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.filas.map((x) => (
                        <tr key={x.numero}>
                          <td>
                            {x.numero}
                            {x.gracia ? <span className={`${base.chip} ${base.chipInfo} ${styles.graceChip}`}>Gracia</span> : null}
                          </td>
                          <td>{fmtFecha(x.fecha)}</td>
                          <td>{x.dias}</td>
                          <td>{dinero(x.capital, rm)}</td>
                          <td>{dinero(x.interes, rm)}</td>
                          <td title={r.cargos.map((c, i) => `${c.descripcion}: ${dinero(x.cargosDet[i], rm)}`).join("\n")}>
                            {dinero(x.cargos, rm)}
                          </td>
                          <td>{dinero(x.ahorro, rm)}</td>
                          <td><b>{dinero(x.total, rm)}</b></td>
                          <td>{dinero(x.saldoFinal, rm)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}>Totales</td>
                        <td>{dinero(r.totalCapital, rm)}</td>
                        <td>{dinero(r.totalInteres, rm)}</td>
                        <td>{dinero(r.totalCargos, rm)}</td>
                        <td>{dinero(0, rm)}</td>
                        <td>{dinero(r.totalPagar, rm)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
