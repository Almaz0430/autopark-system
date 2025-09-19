import { getApps } from 'firebase-admin/app';
import * as admin from 'firebase-admin';

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export { admin };


