import { useCallback, useState } from "react";
import { storage } from "../utils/storage.js";

const KEY = "bk-recent-searches";

export function useRecentSearches(max = 5) {
  const [items, setItems] = useState(() => storage.get(KEY, []));

  const add = useCallback(
    (term) => {
      const t = term?.trim();
      if (!t || t.length < 2) return;
      setItems((prev) => {
        const next = [
          t,
          ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase()),
        ].slice(0, max);
        storage.set(KEY, next);
        return next;
      });
    },
    [max],
  );

  const clear = useCallback(() => {
    storage.remove(KEY);
    setItems([]);
  }, []);

  return { items, add, clear };
}
