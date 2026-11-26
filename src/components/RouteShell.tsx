"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AppShell from "./AppShell";

export default function RouteShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isAuthRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname?.startsWith("/login/");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
