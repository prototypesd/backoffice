"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Inbox,
  UserRoundCheck,
  FileText,
  Clock3,
  Flag,
  Wallet,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import s from "./login.module.scss";

type View = "login" | "otp" | "forgot" | "success";

const etapas = [
  "Recibida",
  "Asesor",
  "Evaluación",
  "Contrato",
  "Desembolso",
];

const subpasos = [
  { name: "Confirmación de datos", status: "Completado" },
  { name: "Requisitos", status: "Ahora" },
  { name: "Carpeta socioeconómica", status: "Pendiente" },
  { name: "Visita domiciliaria", status: "Pendiente" },
];

const actividad = [
  { icon: Inbox, count: 10, label: "Nuevas solicitudes", tone: "blue" },
  { icon: Flag, count: 4, label: "Observaciones", tone: "amber" },
  { icon: Wallet, count: 2, label: "Desembolsos", tone: "green" },
  { icon: Check, count: 6, label: "Solicitudes aprobadas", tone: "green" },
  { icon: FileText, count: 8, label: "Documentos recibidos", tone: "blue" },
  { icon: Clock3, count: 3, label: "En evaluación", tone: "blue" },
];

const notificaciones = [
  {
    icon: Check,
    title: "Comité aprobó",
    detail: "KIVO-WEB-004 · hace 5 min",
    tone: "blue",
  },
  {
    icon: Flag,
    title: "Nueva observación",
    detail: "Documento pendiente de revisión",
    tone: "amber",
  },
  {
    icon: UserRoundCheck,
    title: "Asesor asignado",
    detail: "KIVO-WEB-008 · ahora",
    tone: "blue",
  },
  {
    icon: Wallet,
    title: "Desembolso realizado",
    detail: "Operación completada",
    tone: "green",
  },
  {
    icon: Inbox,
    title: "Nueva solicitud",
    detail: "Onboarding web · ahora",
    tone: "blue",
  },
];

function BrandPanel() {
  const scene = useRef<HTMLDivElement>(null);
  const [notificationIndex, setNotificationIndex] = useState(0);

  const notification = notificaciones[notificationIndex];
  const NotificationIcon = notification.icon;

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let timer: ReturnType<typeof setInterval> | undefined;

    function syncMotion() {
      if (timer) clearInterval(timer);

      if (!media.matches) {
        timer = setInterval(() => {
          setNotificationIndex(previous =>
            (previous + 1) % notificaciones.length
          );
        }, 5000);
      }
    }

    syncMotion();

    media.addEventListener("change", syncMotion);

    return () => {
      if (timer) clearInterval(timer);
      media.removeEventListener("change", syncMotion);
    };
  }, []);

  function move(event: PointerEvent<HTMLElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    scene.current?.style.setProperty("--ry", `${-14 + x * 14}deg`);
    scene.current?.style.setProperty("--rx", `${7 - y * 12}deg`);
  }

  function reset() {
    scene.current?.style.setProperty("--ry", "-14deg");
    scene.current?.style.setProperty("--rx", "7deg");
  }

  return (
    <aside
      className={s.brand}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <div className={s.brandTop}>
        <div className={s.logo}>
          <Image
            src="/Kivo-2.svg"
            alt="Kivo"
            width={64}
            height={40}
            priority
          />
        </div>

        <span className={s.brandDivider} />
        <span>Backoffice</span>
      </div>

      <div className={s.stage} aria-hidden="true">
        <div className={s.scene} ref={scene}>

          <div className={s.approval}>
            <div
              key={notificationIndex}
              className={s.notificationMotion}
            >
              <span
                className={s.approvalIcon}
                data-tone={notification.tone}
              >
                <NotificationIcon size={17} />
              </span>

              <div className={s.notificationCopy}>
                <strong>{notification.title}</strong>
                <small>{notification.detail}</small>
              </div>
            </div>
          </div>

          <div className={s.mock}>
            <div className={s.browser}>
              <i /><i /><i />
            </div>

            <div className={s.mockBody}>
              <div className={s.mockNav}>
                <Image
                  src="/Kivo.svg"
                  alt="Kivo"
                  width={44}
                  height={44}
                  className={s.mockLogo}
                />
                <i /><i /><i className={s.navActive} />
                <i /><i /><i />
              </div>

              <div className={s.mockContent}>
                <small className={s.mockBreadcrumb}>
                  Seguimiento / Expediente
                </small>

                <div className={s.mockClient}>
                  <div className={s.clientAvatar}>GI</div>
                  <div>
                    <strong>Gabriel Iglesias</strong>
                    <small>KIVO-WEB-001-2026-LP</small>
                  </div>
                </div>

                <div className={s.mockHeading}>
                  Avance del trámite
                </div>

                <div className={s.mockSteps}>
                  {etapas.map((nombre, index) => (
                    <div
                      key={nombre}
                      className={`${s.motionStep} ${
                        index < 3 ? s.mockActive : ""
                      }`}
                      data-step={index + 1}
                    >
                      <span className={s.mockDot}>
                        <span className={s.stepNumber}>
                          {index + 1}
                        </span>

                        {index < 2 && (
                          <span className={s.stepCheck}>
                            <Check size={12} />
                          </span>
                        )}
                      </span>

                      <small>{nombre}</small>
                    </div>
                  ))}
                </div>

                <div className={s.mockTabs}>
                  <span>Solicitud</span>
                  <span>Asesor</span>
                  <span className={s.mockTabActive}>Evaluación</span>
                  <span>Contrato</span>
                </div>

                <div className={s.mockHeading}>En evaluación</div>

                {subpasos.map((paso, index) => (
                  <div
                    key={paso.name}
                    className={`${s.mockRow} ${
                      index === 1 ? s.mockRowActive : ""
                    }`}
                  >
                    <span className={s.rowDot}>
                      {index === 0 ? <Check size={9} /> : null}
                    </span>
                    <span>{paso.name}</span>
                    <small>{paso.status}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={s.activity}>
            <div className={s.activityHeading}>
              <strong>Actividad</strong>
              <small>Hoy</small>
            </div>

            <div className={s.activityViewport}>
              <div className={s.activityTrack}>
                {[...actividad, ...actividad].map(
                  ({ icon: Icon, count, label, tone }, index) => (
                    <div
                      className={s.activityRow}
                      key={`${label}-${index}`}
                      aria-hidden={index >= actividad.length}
                    >
                      <span
                        className={s.activityIcon}
                        data-tone={tone}
                      >
                        <Icon size={15} />
                      </span>

                      <strong>{count}</strong>
                      <span>{label}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className={s.brandCopy}>
        <h2>Cada solicitud, de la recepción al desembolso.</h2>

        <p>
          Revisa, asigna y sigue los préstamos de Kivo
          desde un solo lugar.
        </p>
      </div>

      <div className={s.brandFoot}>
        Kivo · Plataforma de gestión de préstamos
      </div>
    </aside>
  );
}

export default function LoginPage() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [caps, setCaps] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeOk, setNoticeOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fails, setFails] = useState(0);
  const [locked, setLocked] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [seconds, setSeconds] = useState(30);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (view !== "otp" || seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds(value => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [view, seconds]);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  function go(next: View) {
    if (timeout.current) clearTimeout(timeout.current);
    setBusy(false);
    setNotice("");
    setNoticeOk(false);
    setView(next);
  }

  function startOtp() {
    setDigits(Array(6).fill(""));
    setSeconds(30);
    go("otp");
  }

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy || locked) return;

    setNoticeOk(false);

    if (!validEmail.test(email.trim())) {
      setNotice("Introduce un correo electrónico válido.");
      return;
    }

    if (!password) {
      setNotice("Introduce tu contraseña.");
      return;
    }

    setBusy(true);
    setNotice("");

    timeout.current = setTimeout(() => {
      setBusy(false);

      // Simulación exclusiva del prototipo.
      // No representa una autenticación real.
      if (
        email.trim().toLowerCase().endsWith("@kivo.bo") &&
        password === "kivo2026"
      ) {
        setFails(0);
        setPassword("");
        startOtp();
        return;
      }

      const nextFails = fails + 1;

      setFails(nextFails);
      setPassword("");

      if (nextFails >= 5) {
        setLocked(true);
        setNotice("Cuenta bloqueada en esta simulación.");
      } else {
        setNotice(
          `Correo o contraseña incorrectos. Quedan ${5 - nextFails} intentos.`
        );
      }
    }, 650);
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setNoticeOk(false);

    if (digits.join("").length !== 6) {
      setNotice("Introduce los seis dígitos del código.");
      return;
    }

    setBusy(true);

    timeout.current = setTimeout(() => {
      setBusy(false);

      if (digits.join("") === "123456") {
        setDigits(Array(6).fill(""));
        go("success");
      } else {
        setNotice("El código introducido no es correcto.");
        setDigits(Array(6).fill(""));
        otpRefs.current[0]?.focus();
      }
    }, 500);
  }

  function recover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validEmail.test(email.trim())) {
      setNoticeOk(false);
      setNotice("Introduce un correo electrónico válido.");
      return;
    }

    setNoticeOk(true);
    setNotice(
      "Simulación completada. No se ha enviado ningún correo."
    );
  }

  return (
    <div className={s.layout}>
      <BrandPanel />

      <main className={s.formSide}>
        <div className={s.formCard}>

          <div className={s.mobileLogo}>
            <Image
              src="/Kivo-2.svg"
              alt="Kivo"
              width={86}
              height={42}
            />
          </div>

          {view === "login" && (
            <>
              <h1>Ingresa al backoffice</h1>
              <p className={s.lead}>Usa tu correo de trabajo.</p>
            </>
          )}

          {view === "otp" && (
            <>
              <span className={s.viewIcon}><Mail size={25} /></span>
              <h1>Revisa tu correo</h1>
              <p className={s.lead}>
                Simula la verificación con un código de seis dígitos.
              </p>
              <span className={s.emailChip}>{email}</span>
            </>
          )}

          {view === "forgot" && (
            <>
              <span className={s.viewIcon}><LockKeyhole size={25} /></span>
              <h1>Recupera tu contraseña</h1>
              <p className={s.lead}>
                Introduce tu correo de trabajo.
              </p>
            </>
          )}

          {view === "success" && (
            <>
              <span className={s.successIcon}><Check size={28} /></span>
              <h1>Bienvenido a Kivo</h1>
              <p className={s.lead}>
                Has completado el ingreso de demostración.
              </p>
            </>
          )}

          {notice && (
            <div
              role="alert"
              className={`${s.notice} ${
                noticeOk ? s.noticeOk : s.noticeError
              }`}
            >
              {noticeOk
                ? <Check size={18} />
                : <AlertCircle size={18} />}
              <span>{notice}</span>
            </div>
          )}

          {view === "login" && (
            <form className={s.form} onSubmit={submitLogin}>
              <div className={s.field}>
                <label htmlFor="email">Correo electrónico</label>

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="nombre@kivo.bo"
                  value={email}
                  disabled={locked}
                  onChange={event => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className={s.field}>
                <label htmlFor="password">Contraseña</label>

                <div className={s.passwordField}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Introduce tu contraseña"
                    value={password}
                    disabled={locked}
                    onChange={event => setPassword(event.target.value)}
                    onKeyDown={event =>
                      setCaps(event.getModifierState("CapsLock"))
                    }
                    onKeyUp={event =>
                      setCaps(event.getModifierState("CapsLock"))
                    }
                    onBlur={() => setCaps(false)}
                    required
                  />

                  <button
                    type="button"
                    className={s.eye}
                    aria-label={showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(value => !value)}
                  >
                    {showPassword
                      ? <EyeOff size={19} />
                      : <Eye size={19} />}
                  </button>
                </div>

                {caps && (
                  <small className={s.caps}>
                    Bloq Mayús está activado.
                  </small>
                )}
              </div>

              <div className={s.options}>
                <label className={s.check}>
                  <input
                    type="checkbox"
                    checked={remember}
                    disabled={locked}
                    onChange={event => setRemember(event.target.checked)}
                  />
                  Recordarme
                </label>

                <button
                  type="button"
                  className={s.textButton}
                  onClick={() => go("forgot")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                className={s.primary}
                disabled={busy || locked}
                type="submit"
              >
                {busy ? (
                  <>
                    <LoaderCircle className={s.spinner} size={19} />
                    Ingresando…
                  </>
                ) : (
                  <>Ingresar <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}

          {view === "otp" && (
            <form className={s.form} onSubmit={verifyOtp}>
              <div className={s.otp} role="group" aria-label="Código OTP">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={node => { otpRefs.current[index] = node; }}
                    value={digit}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    aria-label={`Dígito ${index + 1}`}
                    onChange={event => {
                      const value = event.target.value.replace(/\D/g, "");
                      setDigits(previous =>
                        previous.map((d, i) => i === index ? value : d)
                      );

                      if (value) otpRefs.current[index + 1]?.focus();
                    }}
                    onKeyDown={event => {
                      if (event.key === "Backspace" && !digit) {
                        otpRefs.current[index - 1]?.focus();
                      }
                    }}
                    onPaste={event => {
                      event.preventDefault();

                      const code = event.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, 6);

                      setDigits(Array.from(
                        { length: 6 },
                        (_, i) => code[i] || ""
                      ));

                      otpRefs.current[Math.min(code.length, 5)]?.focus();
                    }}
                  />
                ))}
              </div>

              <button className={s.primary} disabled={busy} type="submit">
                {busy ? "Confirmando…" : "Confirmar"}
              </button>

              <p className={s.resend}>
                ¿No te llegó el código?{" "}
                <button
                  type="button"
                  className={s.textButton}
                  disabled={seconds > 0}
                  onClick={() => {
                    setSeconds(30);
                    setDigits(Array(6).fill(""));
                    setNoticeOk(true);
                    setNotice("Reenvío simulado.");
                  }}
                >
                  {seconds > 0 ? `Reenviar en ${seconds}s` : "Reenviar"}
                </button>
              </p>

              <button
                className={s.secondary}
                type="button"
                onClick={() => go("login")}
              >
                Usar otra cuenta
              </button>
            </form>
          )}

          {view === "forgot" && (
            <form className={s.form} onSubmit={recover}>
              <div className={s.field}>
                <label htmlFor="recovery">Correo electrónico</label>
                <input
                  id="recovery"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="nombre@kivo.bo"
                  required
                />
              </div>

              <button className={s.primary} type="submit">
                Enviar enlace
              </button>

              <button
                className={s.secondary}
                type="button"
                onClick={() => go("login")}
              >
                Volver a ingresar
              </button>
            </form>
          )}

          {view === "success" && (
            <div className={s.form}>
              <Link className={s.primary} href="/seguimiento">
                Ir al backoffice <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
