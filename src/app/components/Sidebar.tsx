'use client';

import { useLanguage } from "../contexts/LanguageContext";
import { useRouter } from "next/navigation";

interface SidebarProps {
  userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 shadow-sm z-10">
      <div className="p-4 h-full bg-white">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
          {t('sidebar.navigation')}
        </h2>
        <nav className="flex flex-col gap-1">
          <a
            href="/driver"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              userRole === 'driver' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {t('header.driver')}
          </a>
          <a
            href="/dispatcher"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              userRole === 'dispatcher' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {t('header.dispatcher')}
          </a>
          <a
            href="/admin"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              userRole === 'admin' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {t('header.admin')}
          </a>
        </nav>
      </div>
    </aside>
  );
}