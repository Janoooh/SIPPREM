/**
 * Lee una variable de entorno obligatoria de Vite sin aplicar valores por defecto.
 * Recibe la lectura estática `import.meta.env.VITE_*` para que Vite la resuelva en build.
 */
const requerirVariableEntorno = (valor: string | undefined, nombre: string): string => {
  const valorLimpio = valor?.trim();
  if (!valorLimpio) {
    throw new Error(`La variable de entorno ${nombre} no está configurada.`);
  }
  return valorLimpio;
};

export const BACKEND_URL = requerirVariableEntorno(
  import.meta.env.VITE_BACKEND_URL,
  'VITE_BACKEND_URL'
).replace(/\/+$/, '');

export const MAP_TILE_URL = requerirVariableEntorno(
  import.meta.env.VITE_MAP_TILE_URL,
  'VITE_MAP_TILE_URL'
);
