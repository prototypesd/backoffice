import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import RouteShell from "@/components/RouteShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kivo | Backoffice",
  description: "Prototipos y flujos de navegación de Kivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <Suspense fallback={null}>
          <RouteShell>{children}</RouteShell>
        </Suspense>
      </body>
    </html>
  );
}
