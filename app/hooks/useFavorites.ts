// Favorites lagres i localStorage for ikke-innloggede brukere,
// men flyttes til Firestore når Firebase Auth er tilgjengelig.

'use client';

import { useEffect, useState } from 'react';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebaseClient';
import { useAuth } from '@/app/hooks/useAuth';

const FAVORITES_KEY = 'bronnoysund_favorites';

function readLocalFavorites() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch (e) {
    console.error('Error loading favorites:', e);
    return [];
  }
}

function writeLocalFavorites(favorites: string[]) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
}

export function useFavorites() {
  const { user, loading: authLoading } = useAuth();

  const [favorites, setFavorites] = useState<string[]>(() => readLocalFavorites());

  useEffect(() => {
    // Når auth ikke er ferdig, ikke bytt kilde enda.
    if (authLoading) return;

    if (!user) {
      // Unngå sync setState i effect-body (eslint react-hooks/set-state-in-effect)
      void (async () => {
        setFavorites(readLocalFavorites());
      })();
      return;
    }

    // Last favorites fra Firestore for innlogget bruker.
    const loadFromFirestore = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userDocRef);
        const stored = snap.exists() ? (snap.data()?.favorites as unknown) : null;
        const nextFavorites = Array.isArray(stored)
          ? stored.filter((x): x is string => typeof x === 'string')
          : [];
        setFavorites(nextFavorites);
      } catch (e) {
        console.error('Error loading favorites from Firestore:', e);
        // Fallback til localStorage hvis Firestore feiler.
        setFavorites(readLocalFavorites());
      }
    };

    void loadFromFirestore();
  }, [authLoading, user]);

  const isFavorite = (orgnr: string) => favorites.includes(orgnr);

  const toggleFavorite = async (orgnr: string) => {
    const prevFavorites = favorites;
    const nextFavorites = isFavorite(orgnr)
      ? favorites.filter((f) => f !== orgnr)
      : [...favorites, orgnr];

    // Optimistisk UI.
    setFavorites(nextFavorites);

    if (!user) {
      writeLocalFavorites(nextFavorites);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);

      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        await setDoc(userDocRef, { favorites: nextFavorites }, { merge: true });
        return;
      }

      // Bruk arrayUnion/arrayRemove for å unngå duplikater.
      if (isFavorite(orgnr)) {
        await updateDoc(userDocRef, { favorites: arrayRemove(orgnr) });
      } else {
        await updateDoc(userDocRef, { favorites: arrayUnion(orgnr) });
      }
    } catch (e) {
      console.error('Error toggling favorite:', e);
      // Revert ved feil.
      setFavorites(prevFavorites);
    }
  };

  return {
    favorites,
    addFavorite: (orgnr: string) => {
      if (!favorites.includes(orgnr)) void toggleFavorite(orgnr);
    },
    removeFavorite: (orgnr: string) => {
      if (favorites.includes(orgnr)) void toggleFavorite(orgnr);
    },
    isFavorite,
    toggleFavorite,
  };
}


