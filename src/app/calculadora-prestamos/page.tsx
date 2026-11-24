"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator, RefreshCw, Wallet, CheckCircle2,
  AlertTriangle, Info, ChevronDown, BarChart3,
  FileText, Download
} from "lucide-react";
import SeguimientoShell from "../seguimiento/SeguimientoShell";
import styles from "./calculadora.module.scss";

type FormData = {
  monto: number;
  plazo: number;
  ingresos: number;
  deudas: number;
  edad: number;
  antiguedad: number;
  dependientes: number;
};

type Cuota = {
  numero: number;
  saldoInicial: number;
  capital: number;
  interes: number;
  seguro: number;
  gastos: number;
  cuota: number;
  saldoFinal: number;
};

type Resultado = {
  cuotaBase: number;
  cuotaKivo: number;
  cuotaMaxima: number;
  pde: number;
  interesTotal: number;
  seguroTotal: number;
  gastosTotal: number;
  totalPagar: number;
  viable: boolean;
  capacidad: "COMODA" | "AJUSTADA" | "AL_LIMITE";
  cronograma: Cuota[];
};

const CONFIG = {
  tasaMensual: 0.03,
  seguroMensual: 0.0007,
  gastosMensuales: 18,
  umbralPDE: 0.51,
  gastosPersonales: 0.40,
  ahorro: 0.10,
};

const inicial: FormData = {
  monto: 7000,
  plazo: 6,
  ingresos: 0,
  deudas: 0,
  edad: 0,
  antiguedad: 0,
  dependientes: 0,
};

function moneda(n: number) {
  return `Bs ${n.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function calcular(datos: FormData): Resultado {
  const { monto, plazo, ingresos, deudas } = datos;
  const i = CONFIG.tasaMensual;

  const cuotaBase =
    monto * i / (1 - Math.pow(1 + i, -plazo));

  // Capacidad referencial:
  // 60% del ingreso menos deudas,
  // reservando 10% del remanente.
  const disponible = Math.max(
    0,
    ingresos * (1 - CONFIG.gastosPersonales) - deudas
  );
  const cuotaMaxima = disponible * (1 - CONFIG.ahorro);

  const cronograma: Cuota[] = [];
  let saldo = monto;

  for (let numero = 1; numero <= plazo; numero++) {
    const saldoInicial = saldo;
    const interes = saldoInicial * i;
    const capital =
      numero === plazo
        ? saldoInicial
        : Math.min(saldoInicial, cuotaBase - interes);

    const seguro = saldoInicial * CONFIG.seguroMensual;
    const gastos = CONFIG.gastosMensuales;

    saldo = Math.max(0, saldoInicial - capital);

    cronograma.push({
      numero,
      saldoInicial,
      capital,
      interes,
      seguro,
      gastos,
      cuota: capital + interes + seguro + gastos,
      saldoFinal: saldo,
    });
  }

  const interesTotal = cronograma.reduce(
    (s, c) => s + c.interes, 0
  );
  const seguroTotal = cronograma.reduce(
    (s, c) => s + c.seguro, 0
  );
  const gastosTotal = cronograma.reduce(
    (s, c) => s + c.gastos, 0
  );
  const totalPagar = cronograma.reduce(
    (s, c) => s + c.cuota, 0
  );

  // Cuota inicial, con seguro calculado sobre saldo.
  const cuotaKivo = cronograma[0].cuota;

  // Porcentaje de endeudamiento estimado.
  const pde = (cuotaKivo + deudas) / ingresos;

  const viable =
    pde < CONFIG.umbralPDE &&
    cuotaKivo <= cuotaMaxima;

  const relacion = cuotaMaxima > 0
    ? cuotaKivo / cuotaMaxima
    : Infinity;

  const capacidad =
    relacion <= 0.7
      ? "COMODA"
      : relacion <= 0.9
      ? "AJUSTADA"
      : "AL_LIMITE";

  return {
    cuotaBase,
    cuotaKivo,
    cuotaMaxima,
    pde,
    interesTotal,
    seguroTotal,
    gastosTotal,
    totalPagar,
    viable,
    capacidad,
    cronograma,
  };
}

export default function CalculadoraPrestamosPage() {
  const [datos, setDatos] = useState<FormData>(inicial);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");
  const [mostrarCronograma, setMostrarCronograma] = useState(false);

  function actualizar(campo: keyof FormData, valor: string) {
    setDatos((prev) => ({
      ...prev,
      [campo]: valor === "" ? 0 : Number(valor),
    }));
    setResultado(null);
    setError("");
  }

  function ejecutar() {
    if (
      !Number.isFinite(datos.monto) ||
      datos.monto < 1000 ||
      datos.monto % 1000 !== 0
    ) {
      setError("El monto debe ser múltiplo de Bs 1.000.");
      return;
    }

    if (
      !Number.isInteger(datos.plazo) ||
      datos.plazo < 6 ||
      datos.plazo > 72 ||
      datos.plazo % 6 !== 0
    ) {
      setError("Selecciona un plazo entre 6 y 72 meses, en múltiplos de 6.");
      return;
    }

    if (
      datos.ingresos <= 0 ||
      datos.deudas < 0 ||
      datos.edad < 18 ||
      datos.edad > 100 ||
      datos.antiguedad < 0 ||
      !Number.isInteger(datos.dependientes) ||
      datos.dependientes < 0
    ) {
      setError("Completa los datos con valores válidos. La edad debe ser de 18 a 100 años.");
      return;
    }

    setError("");
    setResultado(calcular(datos));
  }

  function descargarCSV() {
    if (!resultado) return;

    const filas = [
      ["Mes", "Saldo inicial", "Capital", "Interés", "Seguro", "Gastos", "Cuota", "Saldo final"],
      ...resultado.cronograma.map((c) => [
        c.numero,
        c.saldoInicial.toFixed(2),
        c.capital.toFixed(2),
        c.interes.toFixed(2),
        c.seguro.toFixed(2),
        c.gastos.toFixed(2),
        c.cuota.toFixed(2),
        c.saldoFinal.toFixed(2),
      ]),
    ];

    const csv = "\uFEFF" + filas.map(
      (fila) => fila.join(";")
    ).join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "kivo-cronograma.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <SeguimientoShell>
      <main className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/solicitudes">Inicio</Link>
        <span>/</span>
        <span>Simulador de préstamos</span>
      </nav>

      <header className={styles.heading}>
        <div className={styles.headingInfo}>
          <span className={styles.headingIcon}>
            <Calculator size={21} />
          </span>
          <div>
            <h1>Préstamo personal KIVO</h1>
            <p>
              Usa las condiciones de demostración y compara la cuota
              antes de iniciar una solicitud.
            </p>
          </div>
        </div>

        <button
          className={styles.reload}
          onClick={() => {
            setDatos(inicial);
            setResultado(null);
            setError("");
            setMostrarCronograma(false);
          }}
        >
          <RefreshCw size={17} />
          Recargar configuración
        </button>
      </header>

      <div className={styles.layout}>
        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <h2>Datos para el cálculo</h2>
            <span className={styles.rate}>3 % mensual</span>
          </div>

          <div className={styles.formGrid}>
            {([
              ["monto", "Monto del préstamo", "Bs"],
              ["plazo", "Plazo", "meses"],
              ["ingresos", "Ingresos mensuales", "Bs"],
              ["deudas", "Deudas mensuales", "Bs"],
              ["edad", "Edad del solicitante", "años"],
              ["antiguedad", "Antigüedad laboral", "meses"],
              ["dependientes", "Número de dependientes", ""],
            ] as const).map(([campo, etiqueta, unidad]) => (
              <label key={campo} className={styles.field}>
                <span>{etiqueta} *</span>
                <div className={styles.fieldInput}>
                  {unidad === "Bs" && <b>Bs</b>}
                  <input
                    type="number"
                    min={0}
                    step={campo === "monto" ? 1000 : 1}
                    value={datos[campo] || ""}
                    placeholder={campo === "deudas" || campo === "dependientes" ? "0" : ""}
                    onChange={(e) => actualizar(campo, e.target.value)}
                  />
                  {unidad && unidad !== "Bs" && <b>{unidad}</b>}
                </div>
              </label>
            ))}
          </div>

          <p className={styles.helper}>
            Monto en múltiplos de Bs 1.000 y plazo en múltiplos
            de 6 meses (configuración del prototipo).
          </p>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button className={styles.calculate} onClick={ejecutar}>
            <Calculator size={17} />
            Calcular préstamo
          </button>

          <p className={styles.disclaimer}>
            Seguro y gastos son parámetros provisionales de simulación.
            No representan una oferta ni aprobación crediticia.
          </p>
        </section>

        <section className={styles.results}>
          {!resultado ? (
            <div className={styles.placeholder}>
              <Wallet size={22} />
              <h2>Tu resultado aparecerá aquí</h2>
              <p>
                Completa los datos y calcula para consultar
                las cuotas y la viabilidad estimada.
              </p>
            </div>
          ) : (
            <div className={styles.resultContent}>
              <div className={styles.resultHeading}>
                <div>
                  <span className={styles.eyebrow}>SIMULACIÓN FINANCIERA</span>
                  <h2>Resultado del préstamo</h2>
                  <p>{moneda(datos.monto)} durante {datos.plazo} meses</p>
                </div>
                <span className={styles.rate}>3 % mensual</span>
              </div>

              <div className={styles.heroResult}>
                <div>
                  <span>Primera cuota KIVO estimada</span>
                  <strong>{moneda(resultado.cuotaKivo)}</strong>
                  <small>
                    Incluye capital, interés, seguro y gastos.
                    Las cuotas siguientes pueden variar por el seguro.
                  </small>
                </div>
                <Wallet size={32} />
              </div>

              <div className={styles.kpis}>
                <div>
                  <span>Cuota base</span>
                  <strong>{moneda(resultado.cuotaBase)}</strong>
                </div>
                <div>
                  <span>Total a pagar</span>
                  <strong>{moneda(resultado.totalPagar)}</strong>
                </div>
                <div>
                  <span>Intereses totales</span>
                  <strong>{moneda(resultado.interesTotal)}</strong>
                </div>
                <div>
                  <span>Cuota máxima estimada</span>
                  <strong>{moneda(resultado.cuotaMaxima)}</strong>
                </div>
              </div>

              <div className={styles.sectionTitle}>
                <BarChart3 size={17} />
                <h3>Desglose de la primera cuota</h3>
              </div>

              <div className={styles.breakdown}>
                <div><span>Capital</span><b>{moneda(resultado.cronograma[0].capital)}</b></div>
                <div><span>Interés</span><b>{moneda(resultado.cronograma[0].interes)}</b></div>
                <div><span>Seguro de desgravamen</span><b>{moneda(resultado.cronograma[0].seguro)}</b></div>
                <div><span>Gastos administrativos</span><b>{moneda(resultado.cronograma[0].gastos)}</b></div>
                <div className={styles.breakdownTotal}>
                  <span>Total primera cuota</span>
                  <b>{moneda(resultado.cuotaKivo)}</b>
                </div>
              </div>

              <div className={styles.sectionTitle}>
                <CheckCircle2 size={17} />
                <h3>Evaluación de capacidad</h3>
              </div>

              <div className={`${styles.evaluation} ${
                resultado.viable ? styles.viable : styles.notViable
              }`}>
                {resultado.viable
                  ? <CheckCircle2 size={22} />
                  : <AlertTriangle size={22} />}
                <div>
                  <strong>
                    {resultado.viable
                      ? "Viabilidad preliminar favorable"
                      : "Viabilidad preliminar no favorable"}
                  </strong>
                  <p>
                    Capacidad: {resultado.capacidad.replaceAll("_", " ")}
                  </p>
                  <p>
                    PDE estimado: {(resultado.pde * 100).toFixed(2)} %
                  </p>
                  <small>
                    Criterio de simulación: PDE inferior al 51 % y
                    primera cuota dentro de la capacidad estimada.
                  </small>
                </div>
              </div>

              {!resultado.viable && (
                <p className={styles.suggestion}>
                  <Info size={16} />
                  Prueba reducir el monto o ampliar el plazo.
                  La evaluación es referencial y no constituye una decisión crediticia.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {resultado && (
        <section className={styles.schedule}>
          <button
            className={styles.scheduleToggle}
            onClick={() => setMostrarCronograma(!mostrarCronograma)}
          >
            <span><FileText size={19} /> Cronograma de amortización</span>
            <ChevronDown size={18} />
          </button>

          {mostrarCronograma && (
            <div className={styles.scheduleBody}>
              <div className={styles.scheduleActions}>
                <p>Detalle mensual del capital, intereses, seguro y saldo.</p>
                <button onClick={descargarCSV}>
                  <Download size={16} /> Exportar CSV
                </button>
              </div>

              <div className={styles.tableScroll}>
                <table>
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Saldo inicial</th>
                      <th>Capital</th>
                      <th>Interés</th>
                      <th>Seguro</th>
                      <th>Gastos</th>
                      <th>Cuota</th>
                      <th>Saldo final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.cronograma.map((c) => (
                      <tr key={c.numero}>
                        <td>{c.numero}</td>
                        <td>{moneda(c.saldoInicial)}</td>
                        <td>{moneda(c.capital)}</td>
                        <td>{moneda(c.interes)}</td>
                        <td>{moneda(c.seguro)}</td>
                        <td>{moneda(c.gastos)}</td>
                        <td><b>{moneda(c.cuota)}</b></td>
                        <td>{moneda(c.saldoFinal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
    </SeguimientoShell>
  );
}
