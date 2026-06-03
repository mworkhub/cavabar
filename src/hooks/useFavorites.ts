import { useState, useEffect } from "react";

const STORAGE_KEY = "cava-favorites";

export function useFavorites() {
  const [ids,       setIds]       = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  /* load from localStorage only on client */
  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  function toggle(id: string) {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  function isFav(id: string) {
    return isMounted && ids.has(id);
  }

  return { ids, isFav, toggle, isMounted, count: isMounted ? ids.size : 0 };
}
