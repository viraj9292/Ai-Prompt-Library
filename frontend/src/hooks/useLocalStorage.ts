import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable — fail silently, app still works in-memory
    }
  }, [key, value]);

  const remove = useCallback(() => {
    window.localStorage.removeItem(key);
  }, [key]);

  return [value, setValue, remove] as const;
}
