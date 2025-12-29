import { renderHook, act } from "@testing-library/react";
import { useStorage } from "./useStorage";

function mockStorage(storage: string) {
  const storageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
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

      expect(storedValue).toBeUndefined();
    });

    test("deve usar valor padrão quando item não existe", () => {
      const { result } = renderHook(() =>
        useStorage({ key: "testKey", defaultValue: "default" })
      );

      expect(result.current.value).toBe("default");
    });

    test("deve retornar estado reativo", () => {
      const { result } = renderHook(() =>
        useStorage({ key: "testKey", defaultValue: "initial" })
      );

      expect(result.current.value).toBe("initial");

      act(() => {
        result.current.setValue("updated");
      });

      expect(result.current.value).toBe("updated");
    });

    test("deve aplicar prefixo à chave", () => {
      const { result } = renderHook(() =>
        useStorage({ key: "testKey", prefix: "app" })
      );

      act(() => {
        result.current.setItem("testValue");
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "app_testKey",
        JSON.stringify("testValue")
      );
    });

    test("deve usar serializer e deserializer customizados", () => {
      const customSerializer = jest.fn((value) => `custom:${value}`);
      const customDeserializer = jest.fn((value) =>
        value.replace("custom:", "")
      );

      const { result } = renderHook(() =>
        useStorage({
          key: "testKey",
          serializer: customSerializer,
          deserializer: customDeserializer,
        })
      );

      act(() => {
        result.current.setItem("testValue");
      });

      expect(customSerializer).toHaveBeenCalledWith("testValue");
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        "custom:testValue"
      );
    });

    test("deve limpar todo o storage", () => {
      const { result } = renderHook(() => useStorage({ key: "testKey" }));

      act(() => {
        result.current.setItem("testValue");
      });

      act(() => {
        result.current.clearAll();
      });

      expect(localStorage.clear).toHaveBeenCalled();
    });

    test("deve capturar erros de serialização", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const badSerializer = () => {
        throw new Error("Serialization error");
      };

      const { result } = renderHook(() =>
        useStorage({ key: "testKey", serializer: badSerializer })
      );

      act(() => {
        result.current.setItem("testValue");
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.operation).toBe("set");

      consoleErrorSpy.mockRestore();
    });

    test("deve manter compatibilidade com API antiga", () => {
      const { result } = renderHook(() => useStorage({ key: "testKey" }));

      // Deve ter os métodos antigos disponíveis
      expect(typeof result.current.getItem).toBe("function");
      expect(typeof result.current.setItem).toBe("function");
      expect(typeof result.current.removeItem).toBe("function");
    });

    test("deve capturar erros ao ler item no inicialização", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const badDeserializer = () => {
        throw new Error("Deserialization error");
      };

      // Mock storage com valor inválido
      (localStorage.getItem as jest.Mock).mockReturnValue("invalid-json");

      const { result } = renderHook(() =>
        useStorage({
          key: "testKey",
          deserializer: badDeserializer,
          defaultValue: "fallback",
        })
      );

      // Deve usar o valor padrão quando há erro na deserialização
      expect(result.current.value).toBe("fallback");
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    test("deve capturar erros de deserialização no getItem", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const badDeserializer = () => {
        throw new Error("Parse error");
      };

      (localStorage.getItem as jest.Mock).mockReturnValue("bad-data");

      const { result } = renderHook(() =>
        useStorage({
          key: "testKey",
          deserializer: badDeserializer,
          defaultValue: "default",
        })
      );

      let value;
      act(() => {
        value = result.current.getItem();
      });

      expect(value).toBe("default");
      expect(result.current.error?.operation).toBe("get");

      consoleErrorSpy.mockRestore();
    });

    test("deve capturar erros ao remover item", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (localStorage.removeItem as jest.Mock).mockImplementation(() => {
        throw new Error("Remove error");
      });

      const { result } = renderHook(() => useStorage({ key: "testKey" }));

      act(() => {
        result.current.removeItem();
      });

      expect(result.current.error?.operation).toBe("remove");

      consoleErrorSpy.mockRestore();
    });

    test("deve capturar erros ao limpar storage", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const originalClear = localStorage.clear;
      (localStorage.clear as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Clear error");
      });

      const { result } = renderHook(() => useStorage({ key: "testKey" }));

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.error?.operation).toBe("clear");

      localStorage.clear = originalClear;
      consoleErrorSpy.mockRestore();
    });

    test("deve capturar erros na sincronização entre abas", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const badDeserializer = () => {
        throw new Error("Sync error");
      };

      renderHook(() =>
        useStorage({
          key: "testKey",
          deserializer: badDeserializer,
          syncAcrossTabs: true,
        })
      );

      // Simular evento de storage com valor inválido
      const storageEvent = new Event("storage");
      Object.defineProperty(storageEvent, "key", {
        value: "testKey",
        writable: false,
      });
      Object.defineProperty(storageEvent, "newValue", {
        value: "invalid-data",
        writable: false,
      });
      Object.defineProperty(storageEvent, "storageArea", {
        value: localStorage,
        writable: false,
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error syncing storage across tabs:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
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

      expect(storedValue).toBeUndefined();
    });
  });

  describe("Sincronização entre abas", () => {
    beforeAll(() => {
      mockStorage("localStorage");
    });

    test("deve sincronizar mudanças de outras abas", () => {
      const { result } = renderHook(() =>
        useStorage({ key: "testKey", syncAcrossTabs: true })
      );

      act(() => {
        result.current.setItem("initial");
      });

      // Simular mudança de outra aba (sem passar storageArea pois JSDOM não suporta)
      const storageEvent = new Event("storage");
      Object.defineProperty(storageEvent, "key", {
        value: "testKey",
        writable: false,
      });
      Object.defineProperty(storageEvent, "newValue", {
        value: JSON.stringify("updated"),
        writable: false,
      });
      Object.defineProperty(storageEvent, "storageArea", {
        value: localStorage,
        writable: false,
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(result.current.value).toBe("updated");
    });
  });
});
