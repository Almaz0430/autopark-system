import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import ClientLayout from "./ClientLayout";
import { LanguageProvider } from "./contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Fleetly - Умное управление автопарком",
  description: "Современная система управления автопарком с передовыми технологиями",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <LanguageProvider>
        <ClientLayout 
          inter={inter.className} 
          poppins={poppins.variable}
        >
          {children}
        </ClientLayout>
      </LanguageProvider>
    </html>
  );
}
