import { App, getApps } from 'firebase-admin/app';
import * as admin from 'firebase-admin';

let adminApp: App | undefined;

if (!getApps().length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
} else {
  adminApp = admin.app();
}

export { admin };


