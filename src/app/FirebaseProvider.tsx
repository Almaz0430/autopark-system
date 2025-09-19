'use client';

import { createContext, useContext, ReactNode } from 'react';
import { app, auth, firestore, messaging } from '../lib/firebase';

interface FirebaseContextType {
  app: typeof app;
  auth: typeof auth;
  firestore: typeof firestore;
  messaging: typeof messaging;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider = ({ children }: FirebaseProviderProps) => {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore, messaging }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
