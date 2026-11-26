"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  Calculator,
  LogOut,
  X,
  ChartNoAxesColumn,
  ClipboardList,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";
import styles from "./sidebar.module.scss";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  highlighted?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAVIGATION: NavSection[] = [
  {
    title: "Principal",
    items: [
      { label: "Solicitudes recibidas", href: "/nuevas-solicitudes", icon: Home },
      { label: "Onboarding", href: "/onboarding", icon: ClipboardList },
      { label: "Seguimiento", href: "/seguimiento", icon: Search },
    ],
  },
  {
    title: "Gestión de clientes",
    items: [
      { label: "Clientes", href: "/cobros-reportes", icon: ChartNoAxesColumn },
    ],
  },
  {
    title: "Atención asistida",
    items: [
      { label: "Calculadora de préstamos", href: "/calculadora-prestamos", icon: Calculator },
    ],
  },
];

// Rutas que "pertenecen" a una sección aunque su path sea distinto.
const ACTIVE_ALIAS: Record<string, string> = {
  // El expediente de solicitud se abre desde "Solicitudes recibidas".
  "/nuevas-solicitudes/expediente": "/nuevas-solicitudes",
};

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  for (const [prefix, target] of Object.entries(ACTIVE_ALIAS)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return target === href;
    }
  }
  return false;
}


function LogoutAction() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function closeDialog() {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  }

  function confirmLogout() {
    dialogRef.current?.close();
    window.location.replace("/login");
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.item} ${styles.logout}`}
        aria-label="Cerrar sesión"
        aria-haspopup="dialog"
        data-tooltip="Cerrar sesión"
        onClick={() => dialogRef.current?.showModal()}
      >
        <LogOut
          size={18}
          className={styles.icon}
          aria-hidden="true"
        />
        <span className={styles.label}>Cerrar sesión</span>
      </button>

      {mounted && createPortal(
        <dialog
          ref={dialogRef}
          className={styles.logoutDialog}
          aria-labelledby="logout-title"
          aria-describedby="logout-description"
          onCancel={(event) => {
            event.preventDefault();
            closeDialog();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div className={styles.logoutDialogBody}>
            <div className={styles.logoutDialogTop}>
              <span className={styles.logoutDialogIcon}>
                <LogOut size={26} aria-hidden="true" />
              </span>

              <button
                type="button"
                className={styles.logoutDialogClose}
                aria-label="Cerrar ventana"
                onClick={closeDialog}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <h2 id="logout-title">¿Cerrar sesión?</h2>

            <p id="logout-description">
              Estás a punto de salir del backoffice de Kivo.
              ¿Deseas continuar?
            </p>

            <div className={styles.logoutDialogActions}>
              <button
                type="button"
                autoFocus
                className={styles.logoutCancel}
                onClick={closeDialog}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.logoutConfirm}
                onClick={confirmLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </dialog>,
        document.body
      )}
    </>
  );
}

export function SidebarView({
  collapsed,
  pathname,
  onToggle,
}: {
  collapsed: boolean;
  pathname: string | null;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      aria-label="Navegación principal"
    >
      <div className={styles.brandRow}>
        <Link href="/" className={styles.brand} aria-label="Kivo, ir al inicio">
          <Image
            src="/Kivo.svg"
            alt="Kivo"
            width={52}
            height={52}
            className={styles.logo}
            priority
          />
        </Link>

        <button
          type="button"
          className={styles.toggle}
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          data-tooltip={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className={styles.nav} aria-label="Secciones">
        {NAVIGATION.map((section) => (
          <div className={styles.section} key={section.title}>
            <span className={styles.sectionTitle}>{section.title}</span>

            {section.items.map((item) => {
              const Icon = item.icon;
              const active = !item.highlighted && isActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  data-tooltip={item.label}
                  className={`${styles.item} ${
                    active ? styles.active : ""
                  } ${item.highlighted ? styles.highlighted : ""}`}
                >
                  <Icon size={18} className={styles.icon} aria-hidden="true" />
                  <span className={styles.label}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.ctaWrap}>
        <Link href="/nuevas-solicitudes" className={styles.cta} aria-label="Nueva solicitud" data-tooltip="Nueva solicitud">
          <Plus size={18} className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>Nueva solicitud</span>
        </Link>

        <LogoutAction />
      </div>
    </aside>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <SidebarView
      collapsed={collapsed}
      pathname={pathname}
      onToggle={onToggle}
    />
  );
}
