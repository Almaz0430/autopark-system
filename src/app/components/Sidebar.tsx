'use client';

import { useLanguage } from "../contexts/LanguageContext";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 z-10">
      <div className="p-4 h-full bg-white">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
          {t('sidebar.navigation')}
        </h2>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => router.push('/driver')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-left ${
              pathname === '/driver' || pathname.startsWith('/driver/') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {t('sidebar.driver')}
          </button>
          <button
            onClick={() => router.push('/dispatcher')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-left ${
              pathname === '/dispatcher' || pathname.startsWith('/dispatcher/') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {t('sidebar.dispatcher')}
          </button>
          <button
            onClick={() => router.push('/admin')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-left ${
              pathname === '/admin' || pathname.startsWith('/admin/') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {t('sidebar.admin')}
          </button>
        </nav>
      </div>
    </aside>
  );
}