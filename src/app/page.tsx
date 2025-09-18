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

  return <div>Loading...</div>;
}
