"use client";

import {
  ArrowDown,
  RotateCcw,
  ChevronDown,
  Clock3,
  FileText,
  FolderOpen,
  Loader2,
  MessageSquareWarning,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Header from "@/components/Header";
import styles from "./solicitudes.module.scss";

type Estado = "Recopilando datos" | "Para asignación" | "Observada" | "Rechazada";
type Tipo = "Dependiente" | "Independiente";

type Solicitud = {
  name: string;
  email: string;
  code: string;
  ci: string;
  cel: string;
  ciudad: "" | "La Paz" | "El Alto";
  monto: number | null;
  tipo: Tipo | "";
  estado: Estado;
  step: number;
  resp: string;
  upd: string;
};

const ALL: Solicitud[] = [
  { name: "Hugo Soliz", email: "hugo@soydigital.tech", code: "KIVO-OFI-001-2026-TEMP", ci: "", cel: "", ciudad: "", monto: null, tipo: "", estado: "Recopilando datos", step: 1, resp: "", upd: "2026-11-20T19:26" },
  { name: "Carla Mamani", email: "carla.mamani@example.com", code: "KIVO-OFI-002-2026", ci: "6841230 LP", cel: "71234567", ciudad: "La Paz", monto: 8500, tipo: "Dependiente", estado: "Para asignación", step: 6, resp: "", upd: "2026-11-22T09:12" },
  { name: "Juan Pérez", email: "juan.perez@example.com", code: "KIVO-OFI-003-2026", ci: "5129874 LP", cel: "72345678", ciudad: "El Alto", monto: 15000, tipo: "Independiente", estado: "Para asignación", step: 6, resp: "", upd: "2026-11-22T08:40" },
  { name: "María Quispe", email: "maria.quispe@example.com", code: "KIVO-OFI-004-2026", ci: "7412365 LP", cel: "73456789", ciudad: "La Paz", monto: 22000, tipo: "Dependiente", estado: "Observada", step: 6, resp: "Carolina R.", upd: "2026-11-21T17:05" },
  { name: "Luis Condori", email: "luis.condori@example.com", code: "KIVO-OFI-005-2026", ci: "4587123 LP", cel: "74567890", ciudad: "El Alto", monto: 12000, tipo: "Independiente", estado: "Observada", step: 6, resp: "Marco T.", upd: "2026-11-21T11:30" },
  { name: "Rosa Choque", email: "rosa.choque@example.com", code: "KIVO-OFI-006-2026", ci: "8123456 LP", cel: "75678901", ciudad: "La Paz", monto: 30000, tipo: "Dependiente", estado: "Rechazada", step: 6, resp: "Carolina R.", upd: "2026-11-19T15:20" },
  { name: "Pedro Villca", email: "pedro.villca@example.com", code: "KIVO-OFI-007-2026", ci: "3698521 LP", cel: "76789012", ciudad: "La Paz", monto: 18000, tipo: "Independiente", estado: "Recopilando datos", step: 3, resp: "", upd: "2026-11-20T10:15" },
  { name: "Ana Flores", email: "ana.flores@example.com", code: "KIVO-OFI-008-2026", ci: "9514782 LP", cel: "77890123", ciudad: "El Alto", monto: 9000, tipo: "Dependiente", estado: "Para asignación", step: 6, resp: "", upd: "2026-11-18T13:45" },
  { name: "Diego Callisaya", email: "diego.callisaya@example.com", code: "KIVO-OFI-009-2026", ci: "2587413 LP", cel: "78901234", ciudad: "La Paz", monto: 25000, tipo: "Dependiente", estado: "Observada", step: 6, resp: "Marco T.", upd: "2026-11-17T16:10" },
  { name: "Lucía Apaza", email: "lucia.apaza@example.com", code: "KIVO-OFI-010-2026", ci: "6321478 LP", cel: "79012345", ciudad: "El Alto", monto: 6500, tipo: "Independiente", estado: "Recopilando datos", step: 5, resp: "", upd: "2026-11-16T12:00" },
  { name: "Mario Huanca", email: "mario.huanca@example.com", code: "KIVO-OFI-011-2026", ci: "1478523 LP", cel: "60123456", ciudad: "La Paz", monto: 35000, tipo: "Independiente", estado: "Rechazada", step: 6, resp: "Marco T.", upd: "2026-11-15T09:30" },
  { name: "Elena Torrez", email: "elena.torrez@example.com", code: "KIVO-OFI-012-2026", ci: "7896541 LP", cel: "61234567", ciudad: "La Paz", monto: 14000, tipo: "Dependiente", estado: "Para asignación", step: 6, resp: "", upd: "2026-11-14T14:25" },
];

/* Solicitudes recibidas: solo las que aún no pasan a Seguimiento */
const DATA = ALL.filter((r) => r.estado === "Recopilando datos" || r.estado === "Para asignación");

const PAGE = 8;

const CARDS = [
  { key: "", label: "Todas", desc: "Según los filtros actuales", icon: FileText, tone: "#D4F1FF", off: false },
  { key: "Recopilando datos", label: "Recopilando datos", desc: "Completando el onboarding", icon: FolderOpen, tone: "#D4F1FF", off: false },
  { key: "Para asignación", label: "Para asignación", desc: "Sin responsable", icon: Clock3, tone: "#FFEED4", off: false },
] as const;

const CHIP_ESTADO: Record<Estado, string> = {
  "Recopilando datos": styles.chipInfo,
  "Para asignación": styles.chipNeutral,
  Observada: styles.chipWarn,
  Rechazada: styles.chipDark,
};

function norm(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function money(n: number) {
  return "Bs " + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function fmtDate(iso: string) {
  return iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(0, 4);
}

function fmtDateTime(iso: string) {
  return fmtDate(iso) + " " + iso.slice(11, 16);
}

export default function SolicitudesPage() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [moreOpen, setMoreOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [toolbarH, setToolbarH] = useState(0);
  const [loading, setLoading] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ───────── Lectura de la URL al montar (filtros compartibles + botón atrás) ───────── */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const qs = p.get("q") || "";
    setSearch(qs);
    setQ(qs);
    if (p.get("estado")) setEstado(p.get("estado") || "");
    if (p.get("ciudad")) setCiudad(p.get("ciudad") || "");
    if (p.get("tipo")) setTipo(p.get("tipo") || "");
    if (p.get("desde")) setDesde(p.get("desde") || "");
    if (p.get("hasta")) setHasta(p.get("hasta") || "");
    if (p.get("page")) setPage(parseInt(p.get("page") || "1", 10) || 1);
    if (p.get("sort") === "asc") setSort("asc");
    if (p.get("tipo") || p.get("desde") || p.get("hasta")) setMoreOpen(true);
  }, []);

  /* ───────── Sincronizar estado hacia la URL ───────── */
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (estado) p.set("estado", estado);
    if (ciudad) p.set("ciudad", ciudad);
    if (tipo) p.set("tipo", tipo);
    if (desde) p.set("desde", desde);
    if (hasta) p.set("hasta", hasta);
    if (page > 1) p.set("page", String(page));
    if (sort === "asc") p.set("sort", "asc");
    const qs = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
  }, [q, estado, ciudad, tipo, desde, hasta, page, sort]);

  /* ───────── Búsqueda con debounce ───────── */
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 150);
    return () => clearTimeout(t);
  }, [search]);

  /* ───────── Medir el toolbar (para el encabezado pegado) + sombra al stuck ───────── */
  useEffect(() => {
    function measure() {
      if (toolbarRef.current) setToolbarH(toolbarRef.current.offsetHeight);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (toolbarRef.current) ro.observe(toolbarRef.current);

    function onScroll() {
      const el = toolbarRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const shouldStick = top <= 64 && window.innerWidth > 900;
      setStuck((prev) => (prev === shouldStick ? prev : shouldStick));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ───────── Atajo: "/" enfoca la búsqueda ───────── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (e.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(tag) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const input = document.getElementById("q") as HTMLInputElement | null;
        if (input) {
          input.focus();
          input.select();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ───────── Simular carga de datos al filtrar (con API real: setLoading en el fetch) ───────── */
  function runFilter() {
    setLoading(true);
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => setLoading(false), 550);
  }

  /* ───────── Filtros ───────── */
  function match(r: Solicitud, skipEstado: boolean) {
    if (q) {
      const hay = norm([r.name, r.email, r.code, r.ci, r.cel].join(" "));
      if (!hay.includes(norm(q))) return false;
    }
    if (!skipEstado && estado && r.estado !== estado) return false;
    if (ciudad && r.ciudad !== ciudad) return false;
    if (tipo && r.tipo !== tipo) return false;
    const d = r.upd.slice(0, 10);
    if (desde && d < desde) return false;
    if (hasta && d > hasta) return false;
    return true;
  }

  const filtered = useMemo(() => {
    const rows = DATA.filter((r) => match(r, false));
    rows.sort((a, b) => (sort === "desc" ? (a.upd < b.upd ? 1 : -1) : a.upd > b.upd ? 1 : -1));
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estado, ciudad, tipo, desde, hasta, sort]);

  const base = DATA.filter((r) => match(r, true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const currentPage = Math.min(page, pages);
  const slice = filtered.slice((currentPage - 1) * PAGE, currentPage * PAGE);

  function go(code: string) {
    window.location.assign(`/expediente/${encodeURIComponent(code)}`);
  }

  function clearAll() {
    setSearch("");
    setQ("");
    setEstado("");
    setCiudad("");
    setTipo("");
    setDesde("");
    setHasta("");
    setPage(1);
    runFilter();
  }

  const moreCount = [tipo, desde, hasta].filter(Boolean).length;

  const chips = [
    q && { key: "q", label: "Búsqueda", value: `\u201C${q}\u201D` },
    estado && { key: "estado", label: "Estado", value: estado },
    ciudad && { key: "ciudad", label: "Ciudad", value: ciudad },
    tipo && { key: "tipo", label: "Tipo", value: tipo },
    desde && { key: "desde", label: "Desde", value: fmtDate(desde) },
    hasta && { key: "hasta", label: "Hasta", value: fmtDate(hasta) },
  ].filter(Boolean) as { key: string; label: string; value: string }[];

  function removeChip(key: string) {
    if (key === "q") {
      setSearch("");
      setQ("");
    }
    if (key === "estado") setEstado("");
    if (key === "ciudad") setCiudad("");
    if (key === "tipo") setTipo("");
    if (key === "desde") setDesde("");
    if (key === "hasta") setHasta("");
    setPage(1);
    runFilter();
  }

  const from = filtered.length ? (currentPage - 1) * PAGE + 1 : 0;
  const to = Math.min(currentPage * PAGE, filtered.length);
  const summary = !filtered.length
    ? "Sin resultados"
    : filtered.length === 1
      ? "Mostrando 1 de 1 solicitud"
      : `Mostrando ${from}\u2013${to} de ${filtered.length} ${filtered.length === 1 ? "solicitud" : "solicitudes"}`;

  return (
    <main className={styles.main}>
        <Header title="Solicitudes recibidas" />
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>Solicitudes recibidas</h1>
          <p className={styles.pageSub}>Solicitudes de préstamo enviadas por los clientes desde el onboarding.</p>

          {/* ───────── Cards = filtros de estado ───────── */}
          <div className={styles.cards} role="group" aria-label="Filtrar por estado">
            {CARDS.map((c) => {
              const Icon = c.icon;
              const pressed = c.key !== "" && estado === c.key;
              const num = c.off
                ? "\u2014"
                : c.key === ""
                  ? filtered.length
                  : base.filter((r) => r.estado === c.key).length;

              return (
                <button
                  type="button"
                  key={c.label}
                  className={styles.card}
                  aria-pressed={pressed}
                  disabled={c.off}
                  style={{ "--card-tone": c.tone } as CSSProperties}
                  onClick={() => {
                    setEstado(c.key === "" || estado === c.key ? "" : c.key);
                    setPage(1);
                    runFilter();
                  }}
                >
                  <span className={styles.cardLabel}>{c.label}</span>
                  <span className={styles.cardNum}>{num}</span>
                  <span className={styles.sr}>
                    {c.key === "" ? "Muestra todas las solicitudes" : `Filtra solicitudes por estado ${c.label}`}
                  </span>
                  <span className={styles.cardDesc}>{c.desc}</span>
                  <span className={styles.cardBlob} aria-hidden="true" />
                  <span className={styles.cardIcon} aria-hidden="true">
                    <Icon size={40} strokeWidth={2.1} />
                  </span>
                </button>
              );
            })}
          </div>

          <section
            className={styles.panel}
            aria-label="Solicitudes de préstamo"
            aria-busy={loading}
            ref={panelRef}
            style={{ "--toolbar-h": `${toolbarH}px` } as CSSProperties}
          >
            {/* ───────── Toolbar de filtros (pegado arriba) ───────── */}
            <div className={`${styles.toolbar} ${stuck ? styles.toolbarStuck : ""}`} ref={toolbarRef}>
              <form
                className={styles.search}
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setQ(search.trim());
                  setPage(1);
                  runFilter();
                }}
              >
                <Search size={20} className={styles.searchIcon} aria-hidden="true" />
                <input
                  id="q"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Escape") return;
                    if (search) {
                      setSearch("");
                      setQ("");
                      setPage(1);
                    } else {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  aria-label="Buscar solicitudes"
                  placeholder="Buscar por carnet de identidad, nombre o celular…"
                />
                <span className={styles.kbd} aria-hidden="true">/</span>
                <button className={styles.btnCta} type="submit">Buscar</button>
              </form>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    className={styles.select}
                    value={estado}
                    onChange={(e) => {
                      setEstado(e.target.value);
                      setPage(1);
                      runFilter();
                    }}
                  >
                    <option value="">Todos los estados</option>
                    <option>Recopilando datos</option>
                    <option>Para asignación</option>
                    
                    
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="ciudad">Ciudad</label>
                  <select
                    id="ciudad"
                    className={styles.select}
                    value={ciudad}
                    onChange={(e) => {
                      setCiudad(e.target.value);
                      setPage(1);
                      runFilter();
                    }}
                  >
                    <option value="">Todas</option>
                    <option>La Paz</option>
                    <option>El Alto</option>
                  </select>
                </div>

                
                  <div className={styles.field}>
                    <label htmlFor="tipo">Tipo de cliente</label>
                    <select
                      id="tipo"
                      className={styles.select}
                      value={tipo}
                      onChange={(e) => {
                        setTipo(e.target.value);
                        setPage(1);
                        runFilter();
                      }}
                    >
                      <option value="">Todos</option>
                      <option>Dependiente</option>
                      <option>Independiente</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="desde">Actualizada desde</label>
                    <input
                      id="desde"
                      type="date"
                      className={styles.date}
                      value={desde}
                      onChange={(e) => {
                        setDesde(e.target.value);
                        setPage(1);
                        runFilter();
                      }}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="hasta">Actualizada hasta</label>
                    <input
                      id="hasta"
                      type="date"
                      className={styles.date}
                      value={hasta}
                      onChange={(e) => {
                        setHasta(e.target.value);
                        setPage(1);
                        runFilter();
                      }}
                    />
                  </div>
                <button type="button" className={styles.clearBtn} onClick={clearAll}><RotateCcw size={14} aria-hidden="true" />Limpiar filtros</button>
              </div>

              {chips.length > 0 ? (
                <div className={styles.chips} aria-label="Filtros activos">
                  {chips.map((chip) => (
                    <button
                      type="button"
                      key={chip.key}
                      className={styles.fchip}
                      aria-label={`Quitar filtro ${chip.label}: ${chip.value}`}
                      onClick={() => removeChip(chip.key)}
                    >
                      {chip.label}: {chip.value}
                      <X size={14} aria-hidden="true" />
                    </button>
                  ))}
                  <button type="button" className={styles.link} onClick={clearAll}>
                    Limpiar todo
                  </button>
                </div>
              ) : null}
            </div>

            {/* ───────── Tabla o skeleton de carga ───────── */}
            {loading ? (
              <div>
                <p className={styles.loadingPi} role="status" aria-live="polite">
                  <Loader2 size={15} aria-hidden="true" />
                  Filtrando solicitudes…
                </p>
                <div className={styles.skeletonWrap} aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div className={styles.skeletonRow} key={i}>
                      <span className={`${styles.sk} ${styles.skLg}`} />
                      <span className={styles.sk} style={{ width: "72%" }} />
                      <span className={`${styles.sk} ${styles.skSm}`} />
                      <span className={`${styles.sk} ${styles.skSm}`} />
                      <span className={styles.sk} />
                      <span className={`${styles.sk} ${styles.skSm}`} style={{ width: "80%" }} />
                      <span className={styles.sk} style={{ width: "60%" }} />
                      <span className={styles.sk} style={{ width: "22%" }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <table>
                <caption className={styles.sr}>Lista de solicitudes de préstamo</caption>
                <thead>
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Solicitud</th>
                    <th scope="col">Ciudad</th>
                    <th scope="col">Monto</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Responsable</th>
                    <th scope="col" aria-sort={sort === "desc" ? "descending" : "ascending"}>
                      <button
                        type="button"
                        className={styles.sortBtn}
                        onClick={() => {
                          setSort((s) => (s === "desc" ? "asc" : "desc"));
                          setPage(1);
                          runFilter();
                        }}
                      >
                        Actualización
                        <ArrowDown size={14} className={sort === "asc" ? styles.sortAsc : ""} aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col"><span className={styles.sr}>Acción</span></th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((r) => (
                    <tr key={r.code} onClick={() => go(r.code)} className={styles.rowLink}>
                      <td className={styles.clientCol}>
                        <strong>{r.name}</strong>
                        <span>{r.email}</span>
                      </td>
                      <td data-label="Solicitud"><span className={styles.codeCol}>{r.code}</span></td>
                      <td data-label="Ciudad">
                        {r.ciudad ? r.ciudad : <span className={styles.empty} aria-label="Sin dato">—</span>}
                      </td>
                      <td data-label="Monto" className={styles.nowrap}>
                        {r.monto ? money(r.monto) : <span className={styles.empty} aria-label="Sin dato">—</span>}
                      </td>
                      <td data-label="Estado">
                        <div>
                          <span className={`${styles.chip} ${CHIP_ESTADO[r.estado]}`}>{r.estado}</span>
                          {r.estado === "Recopilando datos" ? (
                            <div className={styles.segs}><span className={styles.segBar}>{Array.from({ length: 6 }, (_, i) => (<span key={i} className={i < r.step - 1 ? styles.segDone : i === r.step - 1 ? styles.segCur : styles.segPend} />))}</span>Paso {r.step} de 6</div>
                          ) : null}
                        </div>
                      </td>
                      <td data-label="Responsable">
                        {r.resp ? (
                          r.resp
                        ) : (
                          <span className={`${styles.chip} ${styles.chipNeutral}`}>Sin tomar</span>
                        )}
                      </td>
                      <td data-label="Actualización" className={styles.nowrap}>{fmtDateTime(r.upd)}</td>
                      <td className={styles.act}>
                        <button
                          type="button"
                          className={styles.open}
                          aria-label={`Ver expediente de ${r.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            go(r.code);
                          }}
                        >
                          <FolderOpen size={16} aria-hidden="true" />
                          Ver expediente
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 ? (
                    <tr className={styles.none}>
                      <td colSpan={8}>
                        <strong>No hay solicitudes con estos filtros</strong>
                        Prueba quitando algún filtro o buscando por otro dato.
                        <button type="button" className={styles.link} onClick={clearAll}>
                          Limpiar filtros
                        </button>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}

            {/* ───────── Pie: resumen + paginación ───────── */}
            <div className={styles.foot}>
              <span aria-live="polite">{loading ? "Cargando…" : summary}</span>
              <nav className={styles.pager} aria-label="Paginación">
                <button
                  type="button"
                  className={styles.pg}
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setPage(currentPage - 1);
                    if (panelRef.current) window.scrollTo({ top: panelRef.current.offsetTop - 16 });
                  }}
                >
                  Anterior
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((i) => (
                  <button
                    type="button"
                    key={i}
                    className={`${styles.pg} ${i === currentPage ? styles.pgCurrent : ""}`}
                    aria-label={`Página ${i}`}
                    aria-current={i === currentPage ? "page" : undefined}
                    onClick={() => {
                      setPage(i);
                      if (panelRef.current) window.scrollTo({ top: panelRef.current.offsetTop - 16 });
                    }}
                  >
                    {i}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.pg}
                  disabled={currentPage >= pages}
                  onClick={() => {
                    setPage(currentPage + 1);
                    if (panelRef.current) window.scrollTo({ top: panelRef.current.offsetTop - 16 });
                  }}
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </section>
        </div>
    </main>
  );
}
