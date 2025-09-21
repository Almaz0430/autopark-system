'use client';

import { usePathname } from 'next/navigation';
import { FirebaseProvider } from "./FirebaseProvider";
import Header from "./Header";
import { useLanguage } from "./contexts/LanguageContext";

interface ClientLayoutProps {
  children: React.ReactNode;
  inter: string;
  poppins: string;
}

export default function ClientLayout({ children, inter, poppins }: ClientLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isFullWidthPage = pathname === '/dispatcher' || pathname === '/admin' || pathname === '/driver' || pathname === '/auth';
  const { t } = useLanguage();

  return (
    <body className={`${inter} ${poppins} ${isLandingPage ? 'bg-white' : isFullWidthPage && pathname === '/auth' ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50' : 'bg-slate-50'} text-slate-900 min-h-screen`}>
      <FirebaseProvider>
        <Header />
        {isLandingPage ? (
          <main className="w-full">
            {children}
          </main>
        ) : isFullWidthPage ? (
          <main className="w-full">
            {children}
          </main>
        ) : (
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        )}
        <footer className={isLandingPage || isFullWidthPage ? "w-full py-8 border-t border-slate-200 mt-16" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 mt-16"}>
          <div className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} <span className="font-poppins font-semibold">Fleetly</span>. {t('footer.copyright')}
          </div>
        </footer>
      </FirebaseProvider>
    </body>
  );
}