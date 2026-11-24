"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChartNoAxesColumn,
  X,
} from "lucide-react";

import base from "../solicitudes/solicitudes.module.scss";
import styles from "./cobros-reportes.module.scss";
import Header from "@/components/Header";

type Movimiento = {
  id: string;
  fecha: string;
  gestor: string;
  tipo: "Cobro" | "Devolución";
  comprobante: string;
  prestamo: string;
  importe: number;
};

type Filtros = {
  desde: string;
  hasta: string;
  gestor: string;
};

const movimientos: Movimiento[] = [];

const hoy = "2026-11-21";

function formatoFecha(value: string) {
  if (!value) return "—";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function fechaLarga(value: string) {
  if (!value) return "—";

  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function dinero(value: number) {
  return `Bs ${value.toLocaleString("es-BO", {
    maximumFractionDigits: 2,
  })}`;
}

export default function CobrosReportesPage() {
  const [periodo, setPeriodo] = useState("personalizado");
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [gestor, setGestor] = useState("todos");

  const [aplicados, setAplicados] = useState<Filtros>({
    desde: hoy,
    hasta: hoy,
    gestor: "todos",
  });

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const gestores = [
    "Gestor de Clientes Prueba 1",
    "Gestor de Clientes Prueba 2",
    "Supervisor de Oficina",
  ];

  function cambiarPeriodo(value: string) {
    setPeriodo(value);

    if (value === "hoy") {
      setDesde(hoy);
      setHasta(hoy);
    }

    if (value === "semana") {
      setDesde("2026-11-15");
      setHasta(hoy);
    }

    if (value === "mes") {
      setDesde("2026-11-01");
      setHasta("2026-11-30");
    }
  }

  function consultar() {
    if (!desde || !hasta) {
      setError("Selecciona ambas fechas.");
      return;
    }

    if (desde > hasta) {
      setError("La fecha desde no puede ser mayor que la fecha hasta.");
      return;
    }

    setError("");
    setAplicados({ desde, hasta, gestor });
  }

  const resultados = useMemo(() => {
    return movimientos.filter((item) => {
      const coincideFecha =
        item.fecha >= aplicados.desde &&
        item.fecha <= aplicados.hasta;

      const coincideGestor =
        aplicados.gestor === "todos" ||
        item.gestor === aplicados.gestor;

      return coincideFecha && coincideGestor;
    });
  }, [aplicados]);

  const resumen = useMemo(() => {
    const cobrado = resultados
      .filter((item) => item.tipo === "Cobro")
      .reduce((sum, item) => sum + item.importe, 0);

    const devuelto = resultados
      .filter((item) => item.tipo === "Devolución")
      .reduce((sum, item) => sum + item.importe, 0);

    return {
      cobrado,
      devuelto,
      neto: cobrado - devuelto,
      cantidad: resultados.filter((item) => item.tipo === "Cobro").length,
    };
  }, [resultados]);

  const porGestor = useMemo(() => {
    const nombres = [...new Set(resultados.map((item) => item.gestor))];

    return nombres.map((nombre) => {
      const registros = resultados.filter((item) => item.gestor === nombre);

      const cobrado = registros
        .filter((item) => item.tipo === "Cobro")
        .reduce((sum, item) => sum + item.importe, 0);

      const devuelto = registros
        .filter((item) => item.tipo === "Devolución")
        .reduce((sum, item) => sum + item.importe, 0);

      return {
        nombre,
        cantidad: registros.filter((item) => item.tipo === "Cobro").length,
        cobrado,
        devuelto,
        neto: cobrado - devuelto,
      };
    });
  }, [resultados]);

  return (
    <div className={base.shell}>
      <main className={base.main}>
        <Header />

        <div className={styles.content}>
          <div className={styles.breadcrumb}>
            <Link href="/solicitudes">Inicio</Link>
            <span>/</span>
            <span>Cobros y reportes</span>
          </div>

          <section className={styles.report}>
            <div className={styles.reportTitle}>
              <ChartNoAxesColumn size={20} />
              <h1>Recaudación en efectivo</h1>
            </div>

            <p className={styles.description}>
              Los importes corresponden al dinero aplicado a los préstamos.
              El cambio no se contabiliza como cobro.
            </p>

            <div className={styles.filters}>
              <label>
                Período
                <select
                  value={periodo}
                  onChange={(e) => cambiarPeriodo(e.target.value)}
                >
                  <option value="personalizado">Personalizado</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta semana</option>
                  <option value="mes">Este mes</option>
                </select>
              </label>

              <label>
                Gestor
                <select
                  value={gestor}
                  onChange={(e) => setGestor(e.target.value)}
                >
                  <option value="todos">Todos los gestores</option>
                  {gestores.map((nombre) => (
                    <option key={nombre} value={nombre}>
                      {nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Desde
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => {
                    setDesde(e.target.value);
                    setPeriodo("personalizado");
                  }}
                />
              </label>

              <label>
                Hasta
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => {
                    setHasta(e.target.value);
                    setPeriodo("personalizado");
                  }}
                />
              </label>
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <div className={styles.actions}>
              <button onClick={consultar}>
                Consultar reporte
              </button>
            </div>

            <div className={styles.periodLabel}>
              {fechaLarga(aplicados.desde)} –{" "}
              {fechaLarga(aplicados.hasta)}
              <span> · America/La_Paz</span>
            </div>

            <div className={styles.metrics}>
              <div>
                <span>Cobrado</span>
                <strong>{dinero(resumen.cobrado)}</strong>
              </div>

              <div>
                <span>Devuelto</span>
                <strong>{dinero(resumen.devuelto)}</strong>
              </div>

              <div>
                <span>Neto</span>
                <strong>{dinero(resumen.neto)}</strong>
              </div>

              <div>
                <span>Cantidad de cobros</span>
                <strong>{resumen.cantidad}</strong>
              </div>
            </div>

            <div className={styles.section}>
              <h2>Por gestor</h2>

              <div className={styles.tableScroll}>
                <table>
                  <thead>
                    <tr>
                      <th>Gestor</th>
                      <th>Cobros</th>
                      <th>Importe cobrado</th>
                      <th>Devoluciones</th>
                      <th>Neto</th>
                    </tr>
                  </thead>

                  <tbody>
                    {porGestor.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.empty}>
                          No hubo movimientos de efectivo en este período.
                        </td>
                      </tr>
                    ) : (
                      porGestor.map((item) => (
                        <tr key={item.nombre}>
                          <td>{item.nombre}</td>
                          <td>{item.cantidad}</td>
                          <td>{dinero(item.cobrado)}</td>
                          <td>{dinero(item.devuelto)}</td>
                          <td>{dinero(item.neto)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.section}>
              <h2>Movimientos</h2>

              <div className={styles.tableScroll}>
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Movimiento</th>
                      <th>Comprobante</th>
                      <th>Préstamo</th>
                      <th>Importe</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resultados.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.emptyMovements}>
                          No hay movimientos registrados.
                        </td>
                      </tr>
                    ) : (
                      resultados.map((item) => (
                        <tr key={item.id}>
                          <td>{formatoFecha(item.fecha)}</td>
                          <td>{item.tipo}</td>
                          <td>{item.comprobante}</td>
                          <td>{item.prestamo}</td>
                          <td>{dinero(item.importe)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {toast && (
        <div className={base.toast} role="status">
          {toast}
          <button onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
