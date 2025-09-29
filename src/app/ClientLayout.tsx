'use client';

import { usePathname } from 'next/navigation';
import { FirebaseProvider } from "./FirebaseProvider";
import { useLanguage } from "./contexts/LanguageContext";
import LayoutContent from './components/LayoutContent';

interface ClientLayoutProps {
  children: React.ReactNode;
  inter: string;
  poppins: string;
}

export default function ClientLayout({ children, inter, poppins }: ClientLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isFullWidthPage = pathname === '/auth';
  const showSidebar = pathname.includes('/dispatcher') || pathname.includes('/admin') || pathname.includes('/driver');
  const { t } = useLanguage();

  return (
    <body className={`${inter} ${poppins} ${isLandingPage ? 'bg-white' : isFullWidthPage ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50' : 'bg-slate-50'} text-slate-900 min-h-screen`}>
      <FirebaseProvider>
        <LayoutContent 
          isLandingPage={isLandingPage} 
          isFullWidthPage={isFullWidthPage} 
          showSidebar={showSidebar}
          t={t}
        >
          {children}
        </LayoutContent>
      </FirebaseProvider>
    </body>
  );
}