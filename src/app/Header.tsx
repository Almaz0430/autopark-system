'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from './FirebaseProvider';
import { useRouter } from 'next/navigation';
import { useLanguage } from './contexts/LanguageContext';

export default function Header() {
  const firebase = useFirebase();
  const auth = firebase?.auth;
  const firestore = firebase?.firestore;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email || '');
        
        // Получаем роль пользователя
        try {
          const docRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const { role } = docSnap.data();
            setUserRole(role || 'driver');
          } else {
            setUserRole('driver');
          }
        } catch (error) {
          console.error('Ошибка получения роли пользователя:', error);
          setUserRole('driver');
        }
      } else {
        setIsAuthenticated(false);
        setUserEmail('');
        setUserRole('');
      }
    });
    return () => unsubscribe();
  }, [auth, firestore]);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push('/auth');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const handleLogoClick = () => {
    if (isAuthenticated && userRole) {
      // Если пользователь авторизован, перенаправляем на его дашборд
      router.push(`/${userRole}/dashboard`);
    } else {
      // Если не авторизован, перенаправляем на главную страницу
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <button
            onClick={handleLogoClick}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-poppins">Fleetly</h1>
              <p className="text-xs text-slate-500 -mt-1">Smart Fleet Management</p>
            </div>
          </button>

          {/* Навигация */}
          <div className="flex items-center gap-6">
            {/* Переключатель языков */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('ru')}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  language === 'ru' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  language === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                EN
              </button>
            </div>

            {isAuthenticated && (
              <>
                <nav className="hidden md:flex items-center gap-1">
                  <a
                    href="/driver"
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    {t('header.driver')}
                  </a>
                  <a
                    href="/dispatcher"
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    {t('header.dispatcher')}
                  </a>
                  <a
                    href="/admin"
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    {t('header.admin')}
                  </a>
                </nav>

                {/* Профиль пользователя */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-slate-900">{t('header.user')}</p>
                    <p className="text-xs text-slate-500">{userEmail}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-9 h-9 bg-slate-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200"
                    title={t('header.logout')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


