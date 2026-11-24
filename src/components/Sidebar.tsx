"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
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
      { label: "Solicitudes recibidas", href: "/solicitudes", icon: Home },
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
      { label: "Nueva solicitud", href: "/solicitudes", icon: Plus, highlighted: true },
    ],
  },
];

// Rutas que "pertenecen" a una sección aunque su path sea distinto.
const ACTIVE_ALIAS: Record<string, string> = {
  // El expediente de solicitud se abre desde "Solicitudes recibidas".
  "/expediente": "/solicitudes",
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
