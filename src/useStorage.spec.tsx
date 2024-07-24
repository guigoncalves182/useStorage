import { renderHook, act } from "@testing-library/react";
import { useStorage } from "./useStorage";

function mockStorage(storage: string) {
  const storageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, storage, { value: storageMock });
}

describe("useStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe("localStorage", () => {
    beforeAll(() => {
      mockStorage("localStorage");
    });

    test("deve definir e obter um item do localStorage", () => {
      const { result } = renderHook(() => useStorage({ key: "testKey" }));

      act(() => {
        result.current.setItem("testValue");
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        JSON.stringify("testValue")
      );

      let storedValue;
      act(() => {
        storedValue = result.current.getItem();
      });

      expect(localStorage.getItem).toHaveBeenCalledWith("testKey");
      expect(storedValue).toBe("testValue");
    });

    test("deve remover um item do localStorage", () => {
      const { result } = renderHook(() => useStorage({ key: "testKey" }));

      act(() => {
        result.current.setItem("testValue");
      });

      act(() => {
        result.current.removeItem();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith("testKey");

      let storedValue;
      act(() => {
        storedValue = result.current.getItem();
      });

      expect(storedValue).toBeNull();
    });
  });

  describe("sessionStorage", () => {
    beforeAll(() => {
      mockStorage("sessionStorage");
    });

    test("deve definir e obter um item do sessionStorage", () => {
      const { result } = renderHook(() =>
        useStorage({ key: "testKey", storage: "sessionStorage" })
      );

      act(() => {
        result.current.setItem("testValue");
      });

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        JSON.stringify("testValue")
      );

      let storedValue;
      act(() => {
        storedValue = result.current.getItem();
      });

      expect(sessionStorage.getItem).toHaveBeenCalledWith("testKey");
      expect(storedValue).toBe("testValue");
    });

    test("deve remover um item do sessionStorage", () => {
      const { result } = renderHook(() =>
        useStorage({ key: "testKey", storage: "sessionStorage" })
      );

      act(() => {
        result.current.setItem("testValue");
      });

      act(() => {
        result.current.removeItem();
      });

      expect(sessionStorage.removeItem).toHaveBeenCalledWith("testKey");

      let storedValue;
      act(() => {
        storedValue = result.current.getItem();
      });

      expect(storedValue).toBeNull();
    });
  });
});
