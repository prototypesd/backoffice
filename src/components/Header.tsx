"use client";

import {
  Bell,
  ChevronDown,
  ClipboardList,
  CircleCheck,
  LogOut,
  Menu,
  PlusCircle,
  UserRound,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import styles from "./header.module.scss";

type Notificacion = {
  id: number;
  icono: "solicitud" | "documento" | "aprobada";
  titulo: string;
  detalle: string;
  hora: string;
  leida: boolean;
};

const MAX_VISIBLES = 5;

const NOTIFICACIONES: Notificacion[] = [
  {
    id: 1,
    icono: "solicitud",
    titulo: "Nueva solicitud recibida",
    detalle: "Juan Pérez · Bs 15.000",
    hora: "hace 5 min",
    leida: false,
  },
  {
    id: 2,
    icono: "documento",
    titulo: "Documentos por revisar",
    detalle: "Solicitud #1042 · 3 archivos",
    hora: "hace 1 h",
    leida: false,
  },
  {
    id: 3,
    icono: "solicitud",
    titulo: "Nueva solicitud recibida",
    detalle: "Carla Mamani · Bs 8.500",
    hora: "hace 3 h",
    leida: false,
  },
  {
    id: 4,
    icono: "aprobada",
    titulo: "Solicitud aprobada",
    detalle: "María Quispe · Bs 22.000",
    hora: "ayer",
    leida: true,
  },
  {
    id: 5,
    icono: "documento",
    titulo: "Documentos por revisar",
    detalle: "Solicitud #1037 · 2 archivos",
    hora: "ayer",
    leida: true,
  },
  {
    id: 6,
    icono: "aprobada",
    titulo: "Solicitud aprobada",
    detalle: "Luis Condori · Bs 12.000",
    hora: "hace 2 días",
    leida: true,
  },
  {
    id: 7,
    icono: "solicitud",
    titulo: "Nueva solicitud recibida",
    detalle: "Rosa Choque · Bs 30.000",
    hora: "hace 3 días",
    leida: true,
  },
];

const ICONOS = {
  solicitud: PlusCircle,
  documento: ClipboardList,
  aprobada: CircleCheck,
} as const;

export default function Header({ title }: { title?: string }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(NOTIFICACIONES);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const sinLeer = notificaciones.filter((n) => !n.leida).length;
  const visibles = notificaciones.slice(0, MAX_VISIBLES);
  const hayNotificaciones = visibles.length > 0;

  function toggleNotif() {
    setUserOpen(false);
    setNotifOpen((open) => !open);
  }

  function toggleUser() {
    setNotifOpen(false);
    setUserOpen((open) => !open);
  }

  useEffect(() => {
    if (!notifOpen && !userOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (notifOpen && notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (userOpen && userRef.current && !userRef.current.contains(target)) {
        setUserOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotifOpen(false);
        setUserOpen(false);
        if (notifOpen) bellRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [notifOpen, userOpen]);

  function marcarTodas() {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => window.dispatchEvent(new CustomEvent("kivo:toggle-sidebar"))}
          aria-label="Menú"
        >
          <Menu size={20} />
        </button>
        {title ? <h1 className={styles.title}>{title}</h1> : null}
      </div>

      <div className={styles.right}>
        <div className={styles.notifWrap} ref={notifRef}>
          <button
            ref={bellRef}
            type="button"
            className={styles.iconBtn}
            aria-label={
              sinLeer > 0 ? `Notificaciones, ${sinLeer} sin leer` : "Notificaciones"
            }
            aria-expanded={notifOpen}
            onClick={toggleNotif}
          >
            <Bell size={20} />
            {sinLeer > 0 ? (
              <span className={styles.badge}>{sinLeer > 9 ? "9+" : sinLeer}</span>
            ) : null}
          </button>

          <section
            className={`${styles.notif} ${notifOpen ? styles.notifOpen : ""}`}
            aria-label="Notificaciones"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.notifHead}>
              <h2>Notificaciones</h2>
              {sinLeer > 0 ? (
                <button type="button" className={styles.linkBtn} onClick={marcarTodas}>
                  Marcar todas como leídas
                </button>
              ) : null}
            </div>

            {hayNotificaciones ? (
              <>
                <ul className={styles.notifList}>
                  {visibles.map((n) => {
                    const Icono = ICONOS[n.icono];
                    return (
                      <li key={n.id}>
                        <a
                          href="#"
                          className={`${styles.notifItem} ${n.leida ? styles.notifItemRead : ""}`}
                          onClick={(e) => e.preventDefault()}
                        >
                          <span className={styles.notifIco}>
                            <Icono size={18} />
                          </span>
                          <span className={styles.notifTxt}>
                            <strong>{n.titulo}</strong>
                            <span>{n.detalle}</span>
                            <time>{n.hora}</time>
                          </span>
                          <span className={styles.notifDot} aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>

                <div className={styles.notifFoot}>
                  <a
                    href="#"
                    className={styles.linkBtn}
                    onClick={(e) => e.preventDefault()}
                  >
                    Ver todas
                  </a>
                </div>
              </>
            ) : (
              <div className={styles.notifEmpty}>
                <span className={styles.notifEmptyIco}>
                  <CircleCheck size={20} />
                </span>
                <strong>Todo al día</strong>
                <span>No tienes notificaciones nuevas.</span>
              </div>
            )}
          </section>
        </div>

        <div className={styles.userWrap} ref={userRef}>
          <button
            type="button"
            className={styles.userBtn}
            aria-label="Menú de usuario"
            aria-expanded={userOpen}
            onClick={toggleUser}
          >
            <span className={styles.avatar} aria-hidden="true">
              GD
            </span>
            <span className={styles.who}>
              <strong>Gestor de Clientes Prueba 1</strong>
              <small>Gestor de clientes</small>
            </span>
            <ChevronDown size={16} className={userOpen ? styles.chevronUp : ""} />
          </button>

          <section
            className={`${styles.userMenu} ${userOpen ? styles.userMenuOpen : ""}`}
            aria-label="Opciones de usuario"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.userMenuHead}>
              <span>Sesión iniciada como</span>
              <strong>gestor_clientes_1@example.com</strong>
            </div>

            <div className={styles.userMenuSep} />

            <button
              type="button"
              className={styles.userMenuItem}
              onClick={() => setUserOpen(false)}
            >
              <UserRound size={20} />
              Editar perfil
            </button>
            <button
              type="button"
              className={`${styles.userMenuItem} ${styles.userMenuItemDanger}`}
              onClick={() => setUserOpen(false)}
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </section>
        </div>
      </div>
    </header>
  );
}
