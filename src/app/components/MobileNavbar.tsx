'use client';

import { useLanguage } from "../contexts/LanguageContext";
import { useRouter, usePathname } from "next/navigation";
import { FaHome, FaTruck, FaUserTie, FaCog } from 'react-icons/fa';

interface MobileNavbarProps {
  userRole: string;
}

export default function MobileNavbar({ userRole }: MobileNavbarProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // Показываем все основные разделы
  const navigationItems = [
    {
      key: 'driver',
      label: t('sidebar.driver'),
      icon: FaTruck,
      href: '/driver'
    },
    {
      key: 'dispatcher',
      label: t('sidebar.dispatcher'),
      icon: FaUserTie,
      href: '/dispatcher'
    },
    {
      key: 'admin',
      label: t('sidebar.admin'),
      icon: FaCog,
      href: '/admin'
    }
  ];

  const visibleItems = navigationItems;

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-area-pb">
      <div className="flex items-center justify-around py-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <button
              key={item.key}
              onClick={() => handleNavigation(item.href)}
              className={`flex flex-col items-center gap-1 p-2 min-w-0 flex-1 transition-all duration-200 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-blue-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}