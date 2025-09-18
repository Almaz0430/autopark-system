import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "./FirebaseProvider";
import 'leaflet/dist/leaflet.css';
import Header from "./Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Autopark System",
  description: "Система управления автопарком: водители, диспетчеры, админ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className + " bg-slate-50 text-slate-900 min-h-screen"}>
        <FirebaseProvider>
          <Header />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 mt-16">
            <div className="text-center text-sm text-slate-500">
              © {new Date().getFullYear()} Autopark System. Современная система управления автопарком.
            </div>
          </footer>
        </FirebaseProvider>
      </body>
    </html>
  );
}
