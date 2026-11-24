"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  Eye,
  FileText,
  Info,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  TriangleAlert,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { BURO_DEMO, DOCS } from "./demoDocs";
import s from "./expediente.module.scss";

type DocStatus = "pendiente" | "validado" | "reemplazado" | "cargado";
type Mode = "docs" | "buro";
type Dialog = "" | "reject" | "send";
type Toast = { ok: boolean; iconBg: string; title: string; msg: string } | null;

const LABEL: Record<DocStatus, string> = {
  validado: "Validado",
  pendiente: "Pendiente de validar",
  reemplazado: "Nuevo archivo · por validar",
  cargado: "Por validar",
};

const REJECT_REASONS = [
  "Reporte del Buró no conforme",
  "Ingresos insuficientes",
  "Documentación inválida o ilegible",
  "Información inconsistente",
  "Fuera de zona de cobertura",
  "Otro",
];

type Row = { term: string; value: React.ReactNode; last?: boolean };

const personal: Row[] = [
  { term: "Nombre completo", value: "Hugo Soliz López" },
  { term: "Carnet de identidad", value: "5125096" },
  { term: "Fecha de nacimiento", value: <>20/02/2000 <span className={s.soft}>(26 años)</span></> },
  { term: "Género", value: "Hombre" },
  { term: "Celular", value: "73080594" },
  { term: "Ciudad", value: "La Paz" },
  { term: "Dirección de domicilio", value: "Av. Hector Ormachea 5362, La Paz" },
  { term: "Estado civil", value: "Soltero" },
  { term: "Dependientes", value: "4", last: true },
];

const financial: Row[] = [
  { term: "Tipo de actividad", value: "Asalariado" },
  { term: "Ingreso mensual declarado", value: "Bs 5.000" },
  { term: "Otras fuentes de ingreso", value: <>Sí · Bs 100 <span className={s.soft}>(Alquiler)</span></> },
  { term: "Deudas actuales", value: "Bs 200/mes · Banco Demo" },
  { term: "¿Tiene deudas atrasadas?", value: <span className={s.okChip}><Check size={13} /> No</span> },
  { term: "¿Cuenta con extractos bancarios?", value: "Sí" },
  { term: "Entidad bancaria principal", value: "BCP", last: true },
];

const loan: Row[] = [
  { term: "Monto solicitado", value: "Bs 30.000" },
  { term: "Plazo en meses", value: "18" },
  { term: "Cuota estimada", value: "Bs 2.262" },
  { term: "Tasa mensual", value: "3 %" },
  { term: "Destino del préstamo", value: "Capital de trabajo", last: true },
];

const additional: Row[] = [
  { term: "Empresa o negocio", value: "SoyDigitalPagos" },
  { term: "Rubro", value: "Industria" },
  { term: "Ocupación", value: "Control" },
  { term: "Dirección laboral", value: "Av. Hector Ormachea 5390, La Paz" },
  { term: "Antigüedad laboral", value: "34 meses" },
  { term: "¿Cuenta con NIT?", value: "No" },
  { term: "Tipo de vivienda", value: "Propia" },
  { term: "¿Para qué necesita el préstamo?", value: "Compra de mercadería", last: true },
];

const n = DOCS.length;

export default function ExpedienteClient() {
  const params = useParams<{ id: string }>();
  const code = params?.id ? decodeURIComponent(String(params.id)) : "KIVO-OFI-002-2026";

  const [status, setStatus] = useState<Record<string, DocStatus>>(() =>
    Object.fromEntries(DOCS.map((d) => [d.id, "pendiente" as DocStatus]))
  );
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("docs");
  const [idx, setIdx] = useState(0);
  const [buroState, setBuroState] = useState<DocStatus | "">("");
  const [buroFile, setBuroFile] = useState("");
  const [buroPreview, setBuroPreview] = useState("");
  const [buroDemo, setBuroDemo] = useState(false);
  const [result, setResult] = useState<"" | "enviada" | "rechazada">("");
  const [note, setNote] = useState("");
  const [dialog, setDialog] = useState<Dialog>("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const draft = useRef<{ motivo: string; detalle: string; obs: string }>({
    motivo: REJECT_REASONS[0],
    detalle: "",
    obs: "",
  });

  const closeRef = useRef<HTMLButtonElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const buroInputRef = useRef<HTMLInputElement>(null);

  /* ───────── Escape para cerrar popups + foco inicial ───────── */
  useEffect(() => {
    if (!open && !dialog) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        if (!sending) setDialog("");
      }
    }
    document.addEventListener("keydown", onKey);
    if (open) closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dialog, sending]);

  /* ───────── Toast: autodestrucción a los 5s ───────── */
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ───────── Derivados ───────── */
  const items = DOCS.map((d, i) => {
    const st = status[d.id];
    const ok = st === "validado";
    return {
      ...d,
      num: i + 1,
      ok,
      statusLabel: LABEL[st],
      preview: previews[d.id] || d.demo,
      fileName: files[d.id] || "",
      notLast: i !== n - 1,
    };
  });

  const hasReport = !!buroFile;
  const buroOk = buroState === "validado";
  const validated = items.filter((x) => x.ok).length;

  const identidadOk =
    status.anverso === "validado" && status.reverso === "validado" && status.selfie === "validado";
  const bicOk = status.bic === "validado";
  const readyCount = [identidadOk, bicOk, buroOk].filter(Boolean).length;

  const reqs = [
    { label: identidadOk ? "Identidad validada" : "Identidad por validar", ok: identidadOk },
    { label: bicOk ? "Autorización BIC validada" : "Autorización BIC por validar", ok: bicOk },
    { label: buroOk ? "Reporte del Buró validado" : "Reporte del Buró por validar", ok: buroOk },
  ];

  const hdr =
    result === "rechazada"
      ? { label: "Rechazada", bg: "#FDECEA", color: "#B3261E" }
      : result === "enviada"
        ? { label: "Enviada a aprobación", bg: "#E7F6EC", color: "#1E7A43" }
        : readyCount === 3
          ? { label: "Lista para enviar", bg: "#0B1220", color: "#FFFFFF" }
          : { label: "En revisión", bg: "#E6F7FF", color: "#0077B3" };

  const isBuro = mode === "buro";
  const cur = isBuro
    ? {
        title: "Reporte del Buró/BIC",
        short: "Reporte Buró",
        ok: buroOk,
        statusLabel: buroOk ? "Validado" : hasReport ? "Por validar" : "Sin reporte",
        preview: buroPreview,
        fileName: buroDemo ? "" : buroFile,
      }
    : items[idx];

  const resultMsg =
    result === "enviada"
      ? note
        ? "Enviada con observaciones"
        : "Solicitud enviada a aprobación"
      : "Solicitud rechazada";

  /* ───────── Acciones ───────── */
  function openDoc(i: number) {
    setMode("docs");
    setIdx(i);
    setOpen(true);
  }
  function openBuro() {
    setMode("buro");
    setOpen(true);
  }
  function consultBuro() {
    setBuroState("cargado");
    setBuroFile("reporte-buro-5125096.pdf");
    setBuroPreview(BURO_DEMO);
    setBuroDemo(true);
  }

  function validate() {
    if (isBuro) {
      setBuroState("validado");
      return;
    }
    const doc = DOCS[idx];
    setStatus((prev) => ({ ...prev, [doc.id]: "validado" }));
    // salta al siguiente pendiente
    for (let k = 1; k <= n; k++) {
      const j = (idx + k) % n;
      if (status[DOCS[j].id] !== "validado") {
        setIdx(j);
        break;
      }
    }
  }

  function onReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const f = input.files?.[0];
    if (!f) return;
    const url = f.type.startsWith("image/") ? URL.createObjectURL(f) : "";
    if (isBuro) {
      setBuroState("reemplazado");
      setBuroFile(f.name);
      setBuroPreview(url || BURO_DEMO);
      setBuroDemo(false);
    } else {
      const doc = DOCS[idx];
      setStatus((prev) => ({ ...prev, [doc.id]: "reemplazado" }));
      setPreviews((prev) => ({ ...prev, [doc.id]: url }));
      setFiles((prev) => ({ ...prev, [doc.id]: f.name }));
    }
    input.value = "";
  }

  function onBuroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const f = input.files?.[0];
    if (!f) return;
    const url = f.type.startsWith("image/") ? URL.createObjectURL(f) : "";
    setBuroState("reemplazado");
    setBuroFile(f.name);
    setBuroPreview(url || BURO_DEMO);
    setBuroDemo(false);
    input.value = "";
  }

  function undo() {
    setResult("");
    setNote("");
  }

  /* ───────── Rechazar / Enviar ───────── */
  function closeDialog() {
    if (sending) return;
    setDialog("");
  }

  function confirmReject() {
    const motivo = draft.current.motivo || REJECT_REASONS[0];
    const detalle = draft.current.detalle.trim();
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setDialog("");
      setResult("rechazada");
      setNote("Motivo: " + motivo + (detalle ? " · " + detalle : ""));
      setToast({
        ok: false,
        iconBg: "#B42318",
        title: "Solicitud rechazada",
        msg: `${code} · Se notificó al cliente: ${motivo}.`,
      });
    }, 900);
  }

  function confirmSend() {
    const obs = draft.current.obs.trim();
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setDialog("");
      setResult("enviada");
      setNote(obs ? "Observaciones: " + obs : "");
      setToast({
        ok: true,
        iconBg: "#1E7A46",
        title: obs ? "Solicitud enviada con observaciones" : "Solicitud enviada",
        msg: `${code} pasó a Para derivación y ya la ve el Gestor de Préstamo.`,
      });
    }, 900);
  }

  /* ───────── UI ───────── */
  return (
    <>
      <Header title="Expediente de solicitud" />

      <div className={s.page}>
        {/* ───────── Encabezado ───────── */}
        <header className={s.stack}>
          <nav className={s.crumb} aria-label="Ruta">
            <ChevronLeft size={18} aria-hidden="true" />
            <Link href="/nuevas-solicitudes">Solicitudes</Link>
            <span className={s.soft}>/ {code}</span>
          </nav>

          <div className={`${s.card} ${s.hero}`}>
            <div className={s.heroLeft}>
              <div className={s.heroAvatar} aria-hidden="true">HS</div>
              <div className={s.heroData}>
                <div className={s.heroNameRow}>
                  <h1 className={s.heroName}>Hugo Soliz López</h1>
                  <span
                    role="status"
                    className={s.hdrChip}
                    style={{ background: hdr.bg, color: hdr.color }}
                  >
                    <CalendarDays size={14} aria-hidden="true" />
                    {hdr.label}
                  </span>
                </div>
                <div className={s.metaRow}>
                  <span className={s.metaStrong}>Solicitud {code}</span>
                  <span className={s.meta}><FileText size={15} aria-hidden="true" />CI 5125096</span>
                  <span className={s.meta}><Phone size={15} aria-hidden="true" />73080594</span>
                  <span className={s.meta}><Mail size={15} aria-hidden="true" />hugo.soliz@example.com</span>
                  <span className={s.meta}><MapPin size={15} aria-hidden="true" />La Paz</span>
                  <span className={s.meta}><CalendarDays size={15} aria-hidden="true" />Recibida el 05/11/2026 09:12</span>
                  <span className={s.meta}><Users size={15} aria-hidden="true" />Canal: Onboarding web</span>
                </div>
              </div>
            </div>
            <button type="button" className={s.btn} onClick={() => window.location.reload()}>
              <RefreshCw size={18} aria-hidden="true" />
              Actualizar
            </button>
          </div>
        </header>

        {/* ───────── Fila 1 ───────── */}
        <div className={s.cardsRow}>
          <section className={s.card} aria-labelledby="t-personales">
            <div className={s.cardHead}>
              <h2 id="t-personales" className={s.cardTitle}>
                <UserRound size={18} aria-hidden="true" />
                Datos personales
              </h2>
              <button type="button" className={`${s.btn} ${s.btnSm}`} onClick={() => setFocusPending()}>
                <Pencil size={15} aria-hidden="true" />
                Corregir <span className={s.soft}>· 1 de 2</span>
              </button>
            </div>
            <dl className={s.dl}>
              {personal.map((r) => (
                <div className={s.dlRow} key={r.term}>
                  <dt className={r.last ? s.termLast : undefined}>{r.term}</dt>
                  <dd className={r.last ? s.defLast : undefined}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={s.card} aria-labelledby="t-financiera">
            <div className={s.cardHead}>
              <h2 id="t-financiera" className={s.cardTitle}>
                <BarChart3 size={18} aria-hidden="true" />
                Información financiera
              </h2>
            </div>
            <dl className={s.dl}>
              {financial.map((r) => (
                <div className={s.dlRow} key={r.term}>
                  <dt className={r.last ? s.termLast : undefined}>{r.term}</dt>
                  <dd className={r.last ? s.defLast : undefined}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={s.card} aria-labelledby="t-simulacion">
            <div className={s.cardHead}>
              <h2 id="t-simulacion" className={s.cardTitle}>
                <CreditCard size={18} aria-hidden="true" />
                Simulación del préstamo
              </h2>
            </div>
            <dl className={s.dl}>
              {loan.map((r) => (
                <div className={s.dlRow} key={r.term}>
                  <dt className={r.last ? s.termLast : undefined}>{r.term}</dt>
                  <dd className={r.last ? s.defLast : undefined}>{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className={s.loanTotals}>
              <div className={s.totalBox}>
                <span>Total a pagar</span>
                <strong>Bs 40.716</strong>
              </div>
              <div className={s.totalBox}>
                <span>Cuota / ingreso</span>
                <strong>44 %</strong>
              </div>
            </div>
          </section>
        </div>

        {/* ───────── Fila 2: Documentos + Más sobre el cliente ───────── */}
        <div className={s.row2}>
          <section className={`${s.card} ${s.cardWide}`} aria-labelledby="t-docs">
            <div className={s.cardHead}>
              <h2 id="t-docs" className={s.cardTitle}>
                <FileText size={18} aria-hidden="true" />
                Documentos del cliente
              </h2>
              <span className={s.okChip}><Check size={13} aria-hidden="true" />4 de 4 cargados · {validated} validados</span>
            </div>

            <div className={s.cardBody}>
              <div className={s.docGrid}>
                {items.map((item, i) => (
                  <div className={s.doc} key={item.id}>
                    <button
                      type="button"
                      className={s.docBox}
                      onClick={() => openDoc(i)}
                      aria-label={`Ver ${item.title}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.preview} alt="" className={s.docImg} />
                      <span className={`${s.badge} ${item.ok ? s.badgeOk : ""}`}>
                        {item.ok ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : "!"}
                      </span>
                      <span className={s.zoom} aria-hidden="true"><Eye size={16} /></span>
                    </button>
                    <span className={s.docName}>{item.title}</span>
                  </div>
                ))}
              </div>

              <div className={s.stepsBlock}>
                <h3 className={s.stepsTitle}>Validación paso a paso</h3>
                <ol className={s.stepsOl}>
                  {items.map((item, i) => (
                    <li className={`${s.stepLi} ${item.notLast ? s.stepLiFlex : ""}`} key={item.id}>
                      <button
                        type="button"
                        className={`${s.step} ${item.ok ? s.stepOk : ""}`}
                        onClick={() => openDoc(i)}
                        aria-label={`Paso ${item.num}: ${item.short}, ${item.statusLabel}`}
                      >
                        <span className={`${s.stepCircle} ${item.ok ? s.stepCircleOk : ""}`}>
                          {item.ok ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : item.num}
                        </span>
                        <span className={s.stepTxt}>
                          <span className={s.stepName}>{item.short}</span>
                          <span className={item.ok ? s.stepStatusOk : s.stepStatusPending}>
                            {item.statusLabel}
                          </span>
                        </span>
                      </button>
                      {item.notLast ? (
                        <span className={`${s.stepLine} ${item.ok ? s.stepLineOk : ""}`} aria-hidden="true" />
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section className={`${s.card} ${s.cardNarrow}`} aria-labelledby="t-mas">
            <div className={s.cardHead}>
              <h2 id="t-mas" className={s.cardTitle}>
                <BriefcaseBusiness size={18} aria-hidden="true" />
                Más sobre el cliente
              </h2>
            </div>
            <dl className={s.dl}>
              {additional.map((r) => (
                <div className={s.dlRow} key={r.term}>
                  <dt className={r.last ? s.termLast : undefined}>{r.term}</dt>
                  <dd className={r.last ? s.defLast : undefined}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* ───────── Resultado del Buró de Información ───────── */}
        <section className={s.card} aria-labelledby="t-buro">
          <div className={s.cardHead}>
            <h2 id="t-buro" className={s.cardTitle}>
              <BarChart3 size={18} aria-hidden="true" />
              Resultado del Buró de Información
            </h2>
            <span
              className={s.buroChip}
              style={buroOk ? { background: "#E3F4EA", color: "#14603A" } : { background: "#EEF0F3", color: "#3F4A5C" }}
            >
              {buroOk ? "Validado" : hasReport ? "Por validar" : "Pendiente de consulta"}
            </span>
          </div>

          <div className={s.cardBody}>
            {!hasReport ? (
              <div className={s.buroPending}>
                <div className={s.buroInfo}>
                  <Info size={24} aria-hidden="true" />
                  <div>
                    <strong>Pendiente de consulta</strong>
                    <span>Consulta al cliente en Buró/BIC y carga el reporte para continuar.</span>
                  </div>
                </div>
                <div className={s.buroActions}>
                  <button type="button" className={s.btn} onClick={consultBuro}>
                    <Eye size={18} aria-hidden="true" />
                    Consultar en Buró/BIC
                  </button>
                  <label className={s.btn}>
                    <input
                      ref={buroInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={onBuroUpload}
                      className={s.srInput}
                    />
                    <Upload size={18} aria-hidden="true" />
                    Cargar reporte
                  </label>
                </div>
              </div>
            ) : (
              <div className={s.buroReport}>
                <div className={s.doc}>
                  <button
                    type="button"
                    className={`${s.docBox} ${s.docBoxTall}`}
                    onClick={openBuro}
                    aria-label="Ver reporte del Buró en grande"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={buroPreview} alt="" className={s.docImg} />
                    <span className={`${s.badge} ${buroOk ? s.badgeOk : ""}`}>
                      {buroOk ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : "!"}
                    </span>
                    <span className={s.zoom} aria-hidden="true"><Eye size={16} /></span>
                  </button>
                  <span className={s.docName}>{buroDemo ? "reporte-buro-5125096.pdf" : buroFile}</span>
                </div>

                <div className={s.buroDetail}>
                  {buroDemo && (
                    <div className={s.buroMetrics}>
                      <div className={s.metricGrade}>
                        <span>Calificación</span>
                        <strong>A</strong>
                      </div>
                      <div className={s.metric}>
                        <span>Deudas vigentes</span>
                        <strong>1 · Banco Demo</strong>
                      </div>
                      <div className={s.metric}>
                        <span>Días de mora</span>
                        <strong>0</strong>
                      </div>
                      <div className={s.metric}>
                        <span>Fecha de consulta</span>
                        <strong>23/11/2026</strong>
                      </div>
                    </div>
                  )}
                  {!buroDemo && (
                    <p className={s.buroHint}>
                      Reporte cargado por el gestor. Ábrelo y revísalo antes de validarlo.
                    </p>
                  )}

                  <div className={s.buroActionsEnd}>
                    <button type="button" className={s.btn} onClick={openBuro}>
                      <Eye size={18} aria-hidden="true" />
                      Ver reporte
                    </button>
                    <button type="button" className={s.btn} onClick={() => buroInputRef.current?.click()}>
                      <Upload size={18} aria-hidden="true" />
                      Subir y reemplazar
                    </button>
                    {!buroOk && (
                      <button type="button" className={`${s.btn} ${s.btnCta}`} onClick={() => setBuroState("validado")}>
                        <Check size={18} aria-hidden="true" />
                        Validar reporte
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Paso a paso del Buró */}
            <div className={s.stepsBlock}>
              <h3 className={s.stepsTitle}>Validación paso a paso</h3>
              <ol className={s.stepsOl}>
                {[
                  {
                    short: "Consultar Buró/BIC",
                    ok: hasReport,
                    label: hasReport ? "Consulta realizada" : "Pendiente",
                    action: hasReport ? openBuro : consultBuro,
                  },
                  {
                    short: "Cargar reporte",
                    ok: hasReport,
                    label: hasReport ? "Reporte cargado" : "Pendiente",
                    action: hasReport ? openBuro : consultBuro,
                  },
                  {
                    short: "Validar reporte",
                    ok: buroOk,
                    label: buroOk ? "Validado" : "Pendiente de validar",
                    action: hasReport ? openBuro : consultBuro,
                  },
                ].map((d, i, arr) => (
                  <li className={`${s.stepLi} ${i !== arr.length - 1 ? s.stepLiFlex : ""}`} key={d.short}>
                    <button
                      type="button"
                      className={`${s.step} ${d.ok ? s.stepOk : ""}`}
                      onClick={d.action}
                      aria-label={`Paso ${i + 1}: ${d.short}, ${d.label}`}
                    >
                      <span className={`${s.stepCircle} ${d.ok ? s.stepCircleOk : ""}`}>
                        {d.ok ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : i + 1}
                      </span>
                      <span className={s.stepTxt}>
                        <span className={s.stepName}>{d.short}</span>
                        <span className={d.ok ? s.stepStatusOk : s.stepStatusPending}>{d.label}</span>
                      </span>
                    </button>
                    {i !== arr.length - 1 ? (
                      <span className={`${s.stepLine} ${d.ok ? s.stepLineOk : ""}`} aria-hidden="true" />
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ───────── Resultado de la revisión ───────── */}
        <section className={s.review} aria-labelledby="t-rev">
          <div className={s.reviewLeft}>
            <div className={s.reviewIcon} aria-hidden="true"><ClipboardList size={28} /></div>
            <div className={s.reviewData}>
              <div className={s.reviewHeadRow}>
                <h2 id="t-rev" className={s.reviewTitle}>Resultado de la revisión</h2>
                <span className={s.reviewReady}>{readyCount} de 3 requisitos listos</span>
              </div>
              <div
                role="progressbar"
                aria-label="Requisitos listos"
                aria-valuemin={0}
                aria-valuemax={3}
                aria-valuenow={readyCount}
                className={s.revTrack}
              >
                <div className={s.revFill} style={{ width: Math.round((readyCount / 3) * 100) + "%" }} />
              </div>
              <ul className={s.reqs}>
                {reqs.map((r) => (
                  <li className={`${s.req} ${r.ok ? s.reqOk : s.reqPending}`} key={r.label}>
                    {r.ok ? (
                      <Check size={14} aria-hidden="true" />
                    ) : (
                      <CalendarDays size={14} aria-hidden="true" />
                    )}
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {!result ? (
            <div className={s.reviewActions}>
              <div className={s.reviewBtnRow}>
                <button type="button" className={`${s.btn} ${s.btnBig} ${s.btnReject}`} onClick={() => { draft.current = { motivo: REJECT_REASONS[0], detalle: "", obs: "" }; setDialog("reject"); }}>
                  <X size={18} aria-hidden="true" />
                  Rechazar
                </button>
                <button type="button" className={`${s.btn} ${s.btnBig} ${s.btnCta}`} onClick={() => { draft.current = { motivo: REJECT_REASONS[0], detalle: "", obs: "" }; setDialog("send"); }}>
                  Para enviar
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div
              role="status"
              className={s.decided}
              style={{ background: hdr.bg, color: hdr.color }}
            >
              <div className={s.decidedTxt}>
                <strong>{resultMsg}</strong>
                {note ? <span className={s.decidedNote}>{note}</span> : null}
              </div>
              <button type="button" className={`${s.btn} ${s.btnSm}`} onClick={undo}>
                Deshacer
              </button>
            </div>
          )}
        </section>

        {/* ───────── Popup: Rechazar solicitud ───────── */}
        {dialog === "reject" ? (
          <div
            className={s.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDialog();
            }}
          >
            <div role="dialog" aria-modal="true" aria-labelledby="rj-t" className={s.mini}>
              <div className={s.miniHead}>
                <h2 id="rj-t" className={s.miniTitle}>Rechazar solicitud</h2>
                <button type="button" className={s.dlgClose} onClick={closeDialog} aria-label="Cerrar">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div className={s.miniBody}>
                <div className={s.fieldWrap}>
                  <label htmlFor="rj-motivo" className={s.lbl}>Motivo del rechazo</label>
                  <div className={s.selectWrap}>
                    <select
                      id="rj-motivo"
                      className={s.field}
                      defaultValue={REJECT_REASONS[0]}
                      onChange={(e) => { draft.current.motivo = e.target.value; }}
                    >
                      {REJECT_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className={s.chev} aria-hidden="true" />
                  </div>
                </div>
                <div className={s.fieldWrap}>
                  <label htmlFor="rj-detalle" className={s.lbl}>Detalle</label>
                  <textarea
                    id="rj-detalle"
                    className={`${s.field} ${s.fieldArea}`}
                    rows={4}
                    placeholder="Describe el motivo para el cliente"
                    onChange={(e) => { draft.current.detalle = e.target.value; }}
                  />
                </div>
                <p className={s.warn}>
                  <TriangleAlert size={18} aria-hidden="true" />
                  <span>Esta acción es definitiva. Se notificará al cliente con el motivo.</span>
                </p>
              </div>
              <div className={s.footEnd}>
                <button type="button" className={s.btn} onClick={closeDialog}>Cancelar</button>
                {sending ? (
                  <button type="button" className={`${s.btn} ${s.btnDanger}`} disabled aria-live="polite">
                    <Loader2 size={18} className={s.spin} aria-hidden="true" />
                    Rechazando…
                  </button>
                ) : (
                  <button type="button" className={`${s.btn} ${s.btnDanger}`} onClick={confirmReject}>
                    <X size={18} aria-hidden="true" />
                    Rechazar
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* ───────── Popup: Para enviar ───────── */}
        {dialog === "send" ? (
          <div
            className={s.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDialog();
            }}
          >
            <div role="dialog" aria-modal="true" aria-labelledby="sd-t" className={s.mini}>
              <div className={s.miniHead}>
                <h2 id="sd-t" className={s.miniTitle}>Para enviar</h2>
                <button type="button" className={s.dlgClose} onClick={closeDialog} aria-label="Cerrar">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div className={s.miniBody}>
                <ul className={s.sendList}>
                  {reqs.map((r) => (
                    <li key={r.label}>
                      <span className={`${s.dot} ${r.ok ? s.dotOk : ""}`}>
                        {r.ok ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <CalendarDays size={12} aria-hidden="true" />}
                      </span>
                      <span>{r.label}</span>
                    </li>
                  ))}
                  <li>
                    <span className={`${s.dot} ${s.dotNo}`}><Pencil size={12} aria-hidden="true" /></span>
                    <span>Correcciones de datos: 1 de 2</span>
                  </li>
                </ul>
                <p className={s.sendNote}>
                  <Info size={18} aria-hidden="true" />
                  <span>La solicitud pasará a <strong>Para derivación</strong>, lista para el Gestor de Préstamo.</span>
                </p>
                <div className={s.fieldWrap}>
                  <label htmlFor="sd-obs" className={s.lbl}>
                    Observaciones <span className={s.soft}>(opcional)</span>
                  </label>
                  <textarea
                    id="sd-obs"
                    className={`${s.field} ${s.fieldArea}`}
                    rows={4}
                    placeholder="Notas para el Gestor de Préstamo, por ejemplo: confirmar destino del préstamo"
                    onChange={(e) => { draft.current.obs = e.target.value; }}
                  />
                </div>
              </div>
              <div className={s.footEnd}>
                <button type="button" className={s.btn} onClick={closeDialog}>Cancelar</button>
                {sending ? (
                  <button type="button" className={`${s.btn} ${s.btnCta}`} disabled aria-live="polite">
                    <Loader2 size={18} className={s.spin} aria-hidden="true" />
                    Enviando…
                  </button>
                ) : (
                  <button type="button" className={`${s.btn} ${s.btnCta}`} onClick={confirmSend}>
                    Enviar
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* ───────── Popup de documentos ───────── */}
        {open ? (
          <div
            className={s.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div role="dialog" aria-modal="true" aria-labelledby="dlg-t" className={s.dialog}>
              <div className={s.dlgHead}>
                <div className={s.dlgHeadLeft}>
                  <h2 id="dlg-t" className={s.dlgTitle}>{cur.title}</h2>
                  <span
                    className={s.dlgChip}
                    style={cur.ok ? { background: "#E3F4EA", color: "#14603A" } : { background: "#EEF0F3", color: "#3F4A5C" }}
                  >
                    {cur.statusLabel}
                  </span>
                  <span className={s.dlgCounter}>
                    {isBuro ? "Buró de Información" : `${idx + 1} de ${n}`}
                  </span>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  className={s.dlgClose}
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <div className={s.viewer}>
                {cur.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cur.preview} alt={cur.title} className={s.viewerImg} />
                ) : (
                  <div role="img" aria-label={`Vista previa de ${cur.title}`} className={s.viewerPlaceholder}>
                    <FileText size={48} aria-hidden="true" />
                    <span className={s.viewerPhName}>{cur.title}</span>
                    <span>Imagen en tamaño completo</span>
                  </div>
                )}

                {!isBuro ? (
                  <>
                    <button
                      type="button"
                      className={`${s.navBtn} ${s.navPrev}`}
                      onClick={() => setIdx((idx + n - 1) % n)}
                      aria-label="Documento anterior"
                    >
                      <ChevronLeft size={22} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={`${s.navBtn} ${s.navNext}`}
                      onClick={() => setIdx((idx + 1) % n)}
                      aria-label="Documento siguiente"
                    >
                      <ChevronLeft size={22} className={s.flipIcon} aria-hidden="true" />
                    </button>
                  </>
                ) : null}
              </div>

              {!isBuro ? (
                <div className={s.thumbs}>
                  {items.map((item, i) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setIdx(i)}
                      aria-label={`Ver ${item.title}`}
                      className={`${s.thumb} ${i === idx ? s.thumbActive : ""}`}
                    >
                      <span className={s.thumbImgWrap}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.preview} alt="" className={s.thumbImg} />
                        <span className={`${s.thumbDot} ${item.ok ? s.thumbDotOk : ""}`} aria-hidden="true" />
                      </span>
                      <span className={s.thumbName}>{item.short}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className={s.dlgFoot}>
                <div className={s.dlgFootInfo}>
                  {cur.fileName ? (
                    <span>Archivo nuevo: <strong>{cur.fileName}</strong> · revisa y valida</span>
                  ) : (
                    <span>Si la imagen no es legible, sube otra para reemplazarla.</span>
                  )}
                </div>
                <div className={s.dlgFootBtns}>
                  <label className={s.btn}>
                    <input
                      ref={replaceInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={onReplace}
                      className={s.srInput}
                    />
                    <Upload size={18} aria-hidden="true" />
                    Subir y reemplazar
                  </label>
                  {!cur.ok ? (
                    <button type="button" className={`${s.btn} ${s.btnCta}`} onClick={validate}>
                      <Check size={18} aria-hidden="true" />
                      Validar documento
                    </button>
                  ) : (
                    <span className={s.validated}>
                      <Check size={18} aria-hidden="true" />
                      Documento validado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ───────── Notificación (toast) ───────── */}
        {toast ? (
          <div role="status" aria-live="polite" className={s.toast}>
            <span className={s.toastIcon} style={{ background: toast.iconBg }}>
              {toast.ok ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : <X size={16} strokeWidth={3} aria-hidden="true" />}
            </span>
            <span className={s.toastBody}>
              <strong className={s.toastTitle}>{toast.title}</strong>
              <span className={s.toastMsg}>{toast.msg}</span>
            </span>
            <button type="button" className={s.toastClose} onClick={() => setToast(null)} aria-label="Cerrar notificación">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </>
  );

  /* Botón Corregir del prototipo: enfoca documentos pendientes */
  function setFocusPending() {
    const i = items.findIndex((x) => !x.ok);
    if (i >= 0) openDoc(i);
  }
}
