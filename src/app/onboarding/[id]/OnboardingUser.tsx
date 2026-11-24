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
  MessageCircle,
  Clock,
  ArrowDown,
} from "lucide-react";
import { BURO_DEMO, DOCS } from "@/app/nuevas-solicitudes/expediente/[id]/demoDocs";
import s from "./onboarding.module.scss";

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

type Row = { term: string; value: React.ReactNode; last?: boolean; hot?: boolean };

function pend() {
  return <span className={s.soft}>Pendiente de completar</span>;
}

const personal: Row[] = [
  { term: "Nombre completo", value: "Hugo Soliz López" },
  { term: "Carnet de identidad", value: "5125096" },
  { term: "Fecha de nacimiento", value: <>20/02/2000 <span className={s.soft}>(26 años)</span></> },
  { term: "Género", value: "Hombre" },
  { term: "Celular", value: "73080594" },
  { term: "Ciudad", value: (
      <>
        <span className={s.here}><span className={s.dot} aria-hidden="true" />Aquí se quedó</span>
        <span className={s.ago}>Última actividad hace 2 horas</span>
      </>
    ), hot: true },
  { term: "Dirección de domicilio", value: pend() },
  { term: "Estado civil", value: pend() },
  { term: "Dependientes", value: pend(), last: true },
];

const financial: Row[] = [
  { term: "Tipo de actividad", value: pend() },
  { term: "Ingreso mensual declarado", value: pend() },
  { term: "Otras fuentes de ingreso", value: pend() },
  { term: "Deudas actuales", value: pend() },
  { term: "¿Tiene deudas atrasadas?", value: pend() },
  { term: "¿Cuenta con extractos bancarios?", value: pend() },
  { term: "Entidad bancaria principal", value: pend(), last: true },
];

const loan: Row[] = [
  { term: "Monto solicitado", value: pend() },
  { term: "Plazo en meses", value: pend() },
  { term: "Cuota estimada", value: pend() },
  { term: "Tasa mensual", value: pend() },
  { term: "Destino del préstamo", value: pend(), last: true },
];

const additional: Row[] = [
  { term: "Empresa o negocio", value: pend() },
  { term: "Rubro", value: pend() },
  { term: "Ocupación", value: pend() },
  { term: "Dirección laboral", value: pend() },
  { term: "Antigüedad laboral", value: pend() },
  { term: "¿Cuenta con NIT?", value: pend() },
  { term: "Tipo de vivienda", value: pend() },
  { term: "¿Para qué necesita el préstamo?", value: pend(), last: true },
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
      ? { label: "Rechazada", bg: "#FBE4E4", color: "#8A1F1F" }
      : result === "enviada"
        ? { label: "Enviada a aprobación", bg: "#E3F4EA", color: "#14603A" }
        : readyCount === 3
          ? { label: "Lista para enviar", bg: "#0B1220", color: "#FFFFFF" }
          : { label: "Recopilando datos · Paso 1 de 6", bg: "#E6F6FF", color: "#005A8C" };

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
            </div>
            <dl className={s.dl}>
              {personal.map((r) => (
                <div className={`${s.dlRow}${r.hot ? ` ${s.dlRowCurrent}` : ""}`} key={r.term} id={r.hot ? "campo-actual" : undefined} tabIndex={r.hot ? -1 : undefined}>
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
                <div className={`${s.dlRow}${r.hot ? ` ${s.dlRowCurrent}` : ""}`} key={r.term} id={r.hot ? "campo-actual" : undefined} tabIndex={r.hot ? -1 : undefined}>
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
                <div className={`${s.dlRow}${r.hot ? ` ${s.dlRowCurrent}` : ""}`} key={r.term} id={r.hot ? "campo-actual" : undefined} tabIndex={r.hot ? -1 : undefined}>
                  <dt className={r.last ? s.termLast : undefined}>{r.term}</dt>
                  <dd className={r.last ? s.defLast : undefined}>{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className={s.loanTotals}>
              <div className={s.totalBox}>
                <span>Total a pagar</span>
                <strong>—</strong>
              </div>
              <div className={s.totalBox}>
                <span>Cuota / ingreso</span>
                <strong>—</strong>
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
              <span className={s.soft}>0 de 4 cargados</span>
            </div>

            <div className={s.cardBody}>
              <div className={s.docGrid}>
                {items.map((item) => (
                  <div className={s.doc} key={item.id}>
                    <div className={s.docBox} aria-hidden="true">
                      <span className={s.soft}>Pendiente de carga</span>
                    </div>
                    <span className={s.docName}>{item.title}</span>
                  </div>
                ))}
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
                <div className={`${s.dlRow}${r.hot ? ` ${s.dlRowCurrent}` : ""}`} key={r.term} id={r.hot ? "campo-actual" : undefined} tabIndex={r.hot ? -1 : undefined}>
                  <dt className={r.last ? s.termLast : undefined}>{r.term}</dt>
                  <dd className={r.last ? s.defLast : undefined}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>



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

            </div>
          </div>
        ) : null}

        {/* ───────── Retomar solicitud ───────── */}
        <section className={s.retomar} aria-label="Retomar solicitud">
          <div className={s.retTxtF}>
            <h4 className={s.retTitleF}>
              Hugo se quedó en <em className={s.retEm}>Ciudad</em>.
            </h4>
            <p className={s.retSubF}>
              Última actividad hace 2 horas · <b>+591 73080594</b>
            </p>
          </div>
          <a
            className={s.retWa}
            href="https://wa.me/59173080594?text=Hola%20Hugo%2C%20te%20escribimos%20de%20Kivo.%20Vimos%20que%20tu%20solicitud%20KIVO-OFI-002-2026%20qued%C3%B3%20pendiente%20en%20el%20dato%20%22Ciudad%22.%20%C2%BFTe%20ayudamos%20a%20completarla%3F"
            target="_blank"
            rel="noopener"
          >
            <span className={s.retWaIcon} aria-hidden="true">
              <MessageCircle size={12} strokeWidth={2.6} aria-hidden="true" />
            </span>
            Escribir por WhatsApp
            <span className={s.retArrow} aria-hidden="true">↗</span>
          </a>
        </section>

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
    const el =
      document.getElementById("campo-actual") ||
      (Array.from(document.querySelectorAll("dd, span")) as HTMLElement[]).find((n) =>
        (n.textContent || "").includes("Aquí se quedó")
      );
    const row = (el?.closest("div") as HTMLElement) || el;
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.focus({ preventScroll: true });
    }
  }
}
