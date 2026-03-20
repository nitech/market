import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;

function tryInit(): App | null {
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  let parsed: { project_id?: string; client_email?: string; private_key?: string };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    console.error('[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON er ugyldig JSON');
    return null;
  }

  if (!parsed.private_key || !parsed.client_email) {
    console.error('[firebaseAdmin] Mangler private_key eller client_email i service account');
    return null;
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, '\n'),
    }),
  });
  return adminApp;
}

export function getFirebaseAdminApp(): App | null {
  if (adminApp) return adminApp;
  return tryInit();
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAuth(app);
}

export function getAdminFirestore() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getFirestore(app);
}
