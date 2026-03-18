import { useState } from 'react';

const FAVORITES_KEY = 'bronnoysund_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    // Avoid setState inside an effect; this initializer runs during client render.
    if (typeof window === 'undefined') return [];

    try {
      const stored = window.localStorage.getItem(FAVORITES_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch (e) {
      console.error('Error loading favorites:', e);
      return [];
    }
  });

  const addFavorite = (orgnr: string) => {
    if (!favorites.includes(orgnr)) {
      const newFavorites = [...favorites, orgnr];
      setFavorites(newFavorites);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    }
  };

  const removeFavorite = (orgnr: string) => {
    const newFavorites = favorites.filter(f => f !== orgnr);
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const isFavorite = (orgnr: string) => {
    return favorites.includes(orgnr);
  };

  const toggleFavorite = (orgnr: string) => {
    if (isFavorite(orgnr)) {
      removeFavorite(orgnr);
    } else {
      addFavorite(orgnr);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}

