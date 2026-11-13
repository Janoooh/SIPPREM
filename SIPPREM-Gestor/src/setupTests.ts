// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Mock matchmedia
window.matchMedia = window.matchMedia || function() {
  return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
  };
};

// Mock localStorage para entornos de prueba donde jsdom/Node no lo habilita
if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
  const almacen = new Map<string, string>();

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (clave: string) => almacen.get(clave) ?? null,
      setItem: (clave: string, valor: string) => {
        almacen.set(clave, String(valor));
      },
      removeItem: (clave: string) => {
        almacen.delete(clave);
      },
      clear: () => {
        almacen.clear();
      },
      key: (indice: number) => Array.from(almacen.keys())[indice] ?? null,
      get length() {
        return almacen.size;
      }
    }
  });
}
