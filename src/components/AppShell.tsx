"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Sidebar, { SidebarView } from "./Sidebar";
import styles from "./app-shell.module.scss";

const STORAGE_KEY = "kivo-sidebar-collapsed";
const TOGGLE_EVENT = "kivo:toggle-sidebar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "true") {
        setCollapsed(true);
      }
    } catch {
      // localStorage no disponible: se mantiene el estado expandido.
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;

      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Sin persistencia, el estado vive solo en memoria.
      }

      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener(TOGGLE_EVENT, toggle);
    return () => window.removeEventListener(TOGGLE_EVENT, toggle);
  }, [toggle]);

  return (
    <div className={styles.appShell} data-collapsed={collapsed ? "true" : "false"}>
      <Suspense
        fallback={
          <SidebarView collapsed={false} pathname={null} onToggle={toggle} />
        }
      >
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </Suspense>
      <div className={styles.appContent}>{children}</div>
    </div>
  );
}
