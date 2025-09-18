'use client';

import { useEffect } from 'react';
import { useFirebase } from './FirebaseProvider';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Page() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const { role } = docSnap.data();
          router.push(`/${role}`);
        } else {
          // Handle case where user exists in auth but not in firestore
          router.push('/auth');
        }
      } else {
        router.push('/auth');
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Логотип */}
        <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        {/* Анимация загрузки */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Текст */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Autopark System</h2>
          <p className="text-slate-600">Загружаем ваш профиль...</p>
        </div>
        
        {/* Прогресс бар */}
        <div className="w-64 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
}
