'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  const ready =
    !!apiKey &&
    !!authDomain &&
    !!projectId &&
    !!storageBucket &&
    !!messagingSenderId &&
    !!appId;

  if (!ready) {
    // Viktig: ikke throw her, ellers kan `next build` feile ved prerender.
    // Du vil få en tydelig beskjed ved runtime når du faktisk prøver å bruke Firebase.
    console.warn(
      '[Firebase] Manglende NEXT_PUBLIC_FIREBASE_* env-variabler. Legg til `.env.local` (se `.env.example`).'
    );
  }

  // Bruk dummy-verdier i build/preview uten env. Dette gjør build mulig, men calls vil feile uten riktig config.
  return {
    apiKey: apiKey ?? 'DUMMY_API_KEY',
    authDomain: authDomain ?? 'DUMMY_AUTH_DOMAIN',
    projectId: projectId ?? 'DUMMY_PROJECT_ID',
    storageBucket: storageBucket ?? 'DUMMY_STORAGE_BUCKET',
    messagingSenderId: messagingSenderId ?? 'DUMMY_SENDER_ID',
    appId: appId ?? 'DUMMY_APP_ID',
    // measurementId er valgfritt og finnes ikke alltid i config
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? undefined,
  };
}

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(getFirebaseConfig());

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

