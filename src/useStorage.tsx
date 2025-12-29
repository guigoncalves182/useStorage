import { useCallback, useEffect, useState, useMemo } from "react";

type TStorage = "localStorage" | "sessionStorage";

// Conditional type: syncAcrossTabs can only be true for localStorage
type SyncAcrossTabsConstraint<S extends TStorage> = S extends "sessionStorage"
  ? false
  : boolean;

interface IUseStorage<T, S extends TStorage = "localStorage"> {
  key: string;
  storage?: S;
  defaultValue?: T;
  prefix?: string;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  syncAcrossTabs?: SyncAcrossTabsConstraint<S>;
}

interface IStorageError {
  operation: "get" | "set" | "remove" | "clear";
  error: Error;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

export const useStorage = <T, S extends TStorage = "localStorage">({
  key,
  storage = "localStorage" as S,
  defaultValue,
  prefix = "",
  serializer = JSON.stringify,
  deserializer = JSON.parse,
  syncAcrossTabs = (storage === "localStorage"
    ? true
    : false) as SyncAcrossTabsConstraint<S>,
}: IUseStorage<T, S>) => {
  const prefixedKey = prefix ? `${prefix}_${key}` : key;

  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    if (!isBrowser) return defaultValue;

    try {
      const item = window[storage].getItem(prefixedKey);
      return item ? deserializer(item) : defaultValue;
    } catch (err) {
      console.error(`Error reading ${storage}:`, err);
      return defaultValue;
    }
  });

  const [error, setError] = useState<IStorageError | null>(null);

  // Get storage object reference
  const storageObject = useMemo(() => {
    return isBrowser ? window[storage] : null;
  }, [storage]);

  const setItem = useCallback(
    (value: T): void => {
      if (!isBrowser) return;

      try {
        const stringValue = serializer(value);
        storageObject?.setItem(prefixedKey, stringValue);
        setStoredValue(value);
        setError(null);
      } catch (err) {
        const storageError: IStorageError = {
          operation: "set",
          error: err instanceof Error ? err : new Error(String(err)),
        };
        setError(storageError);
        console.error(`Error setting item in ${storage}:`, err);
      }
    },
    [prefixedKey, storage, storageObject, serializer]
  );

  const getItem = useCallback((): T | undefined => {
    if (!isBrowser) return defaultValue;

    try {
      const stringValue = storageObject?.getItem(prefixedKey);

      if (!stringValue) {
        setError(null);
        return defaultValue;
      }

      const parsedValue = deserializer(stringValue);
      setError(null);
      return parsedValue;
    } catch (err) {
      const storageError: IStorageError = {
        operation: "get",
        error: err instanceof Error ? err : new Error(String(err)),
      };
      setError(storageError);
      console.error(`Error getting item from ${storage}:`, err);
      return defaultValue;
    }
  }, [prefixedKey, storage, storageObject, defaultValue, deserializer]);

  const removeItem = useCallback((): void => {
    if (!isBrowser) return;

    try {
      storageObject?.removeItem(prefixedKey);
      setStoredValue(defaultValue);
      setError(null);
    } catch (err) {
      const storageError: IStorageError = {
        operation: "remove",
        error: err instanceof Error ? err : new Error(String(err)),
      };
      setError(storageError);
      console.error(`Error removing item from ${storage}:`, err);
    }
  }, [prefixedKey, storage, storageObject, defaultValue]);

  const clearAll = useCallback((): void => {
    if (!isBrowser) return;

    try {
      storageObject?.clear();
      setStoredValue(defaultValue);
      setError(null);
    } catch (err) {
      const storageError: IStorageError = {
        operation: "clear",
        error: err instanceof Error ? err : new Error(String(err)),
      };
      setError(storageError);
      console.error(`Error clearing ${storage}:`, err);
    }
  }, [storage, storageObject, defaultValue]);

  // Sync across tabs
  useEffect(() => {
    if (!isBrowser || !syncAcrossTabs || storage === "sessionStorage") {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === prefixedKey && e.storageArea === window[storage]) {
        try {
          const newValue = e.newValue ? deserializer(e.newValue) : defaultValue;
          setStoredValue(newValue);
        } catch (err) {
          console.error("Error syncing storage across tabs:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [prefixedKey, storage, defaultValue, deserializer, syncAcrossTabs]);

  return {
    value: storedValue,
    setValue: setItem,
    getValue: getItem,
    removeValue: removeItem,
    clearAll,
    error,
    // Backwards compatibility
    getItem,
    setItem,
    removeItem,
  };
};
