import { useState, useCallback } from "react";
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("Bambeh_favorites") ?? "[]");
    } catch {
      return [];
    }
  });
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem("Bambeh_favorites", JSON.stringify(next));
      return next;
    });
  }, []);
  const addFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("Bambeh_favorites", JSON.stringify(next));
      return next;
    });
  }, []);
  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f !== id);
      localStorage.setItem("Bambeh_favorites", JSON.stringify(next));
      return next;
    });
  }, []);
  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );
  return { favorites, toggleFavorite, addFavorite, removeFavorite, isFavorite };
}
export default useFavorites;
