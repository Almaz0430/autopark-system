'use client';

import { createContext, useContext } from 'react';
import { app, auth, firestore, messaging } from '../lib/firebase';

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore, messaging }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
