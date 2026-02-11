import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'bronnoysund_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

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

