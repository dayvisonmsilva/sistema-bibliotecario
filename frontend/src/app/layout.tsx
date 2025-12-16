"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const noNavbarRoutes = ["/", "/login"];
  const showNavbar = !noNavbarRoutes.includes(pathname);

  return (
    <html lang="pt-BR">
      <head>
        <title>Sistema de Biblioteca</title>
        <meta name="description" content="Gerenciado com Next.js e Django" />
      </head>
      <body className="bg-gray-100 text-gray-900">
        <AuthProvider>
          {showNavbar && <Navbar />}
          <main className={showNavbar ? "container mx-auto p-4" : ""}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
