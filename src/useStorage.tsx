type TStorage = "localStorage" | "sessionStorage";

interface IUseStorage {
  key: string;
  storage?: TStorage;
}

const isWindowDefined = (): boolean => typeof window !== 'undefined';


export const useStorage = <T,>({
  key,
  storage = "localStorage",
}: IUseStorage) => {
  const setItem = (value: T): void => {
    if (!isWindowDefined) return;

    const stringValue = JSON.stringify(value);

    switch (storage) {
      case "sessionStorage":
        sessionStorage.setItem(key, stringValue);
        break;

      default:
        localStorage.setItem(key, stringValue);
        break;
    }
  };

  const getItem = (): T | null => {
    if (!isWindowDefined) return;

    let stringValue: string | null;

    switch (storage) {
      case "sessionStorage":
        stringValue = sessionStorage.getItem(key);
        break;

      default:
        stringValue = localStorage.getItem(key);
        break;
    }

    let parsedValue: T | null = null;

    if (stringValue) {
      return (parsedValue = JSON.parse(stringValue));
    }

    return parsedValue;
  };

  const removeItem = (): void => {
    if (!isWindowDefined) return;

    switch (storage) {
      case "sessionStorage":
        sessionStorage.removeItem(key);
        break;

      default:
        localStorage.removeItem(key);
        break;
    }
  };

  return { getItem, setItem, removeItem };
};
