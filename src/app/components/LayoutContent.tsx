'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '../FirebaseProvider';
import Header from '../Header';
import Sidebar from './Sidebar';

interface LayoutContentProps {
  children: React.ReactNode;
  isLandingPage: boolean;
  isFullWidthPage: boolean;
  showSidebar: boolean;
  t: (key: string) => string;
}

export default function LayoutContent({ 
  children, 
  isLandingPage, 
  isFullWidthPage, 
  showSidebar,
  t
}: LayoutContentProps) {
  const firebase = useFirebase();
  const [userRole, setUserRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (!firebase?.auth || !firebase?.firestore) return;

    const unsubscribe = onAuthStateChanged(firebase.auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        
        // Получаем роль пользователя
        try {
          const docRef = doc(firebase.firestore, 'users', user.uid);
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
        setUserRole('');
      }
    });
    return () => unsubscribe();
  }, [firebase]);

  return (
    <>
      <Header />
      {isAuthenticated && showSidebar && <Sidebar userRole={userRole} />}
      
      {isLandingPage ? (
        <main className="w-full">
          {children}
        </main>
      ) : isFullWidthPage ? (
        <main className="w-full">
          {children}
        </main>
      ) : showSidebar ? (
        <main className="ml-64 pt-4 px-6 min-h-[calc(100vh-4rem-4rem)]">
          {children}
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      )}
      
      <footer className={`${showSidebar ? 'ml-64' : ''} ${isLandingPage || isFullWidthPage ? "w-full py-8 border-t border-slate-200 mt-16" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 mt-16"}`}>
        <div className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()} <span className="font-poppins font-semibold">Fleetly</span>. {t('footer.copyright')}
        </div>
      </footer>
    </>
  );
}