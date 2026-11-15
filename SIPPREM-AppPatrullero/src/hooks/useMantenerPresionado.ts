import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';

interface OpcionesMantenerPresionado {
  duracionMs: number;
  deshabilitado?: boolean;
  onCompletado: () => void;
  onCanceladoTemprano?: () => void;
}

/**
 * Hook que controla una pulsación continua durante `duracionMs` milisegundos
 * (por defecto pensada para acciones críticas como el botón de pánico),
 * entregando el progreso porcentual y la cuenta regresiva en segundos.
 */
export const useMantenerPresionado = ({
  duracionMs,
  deshabilitado = false,
  onCompletado,
  onCanceladoTemprano
}: OpcionesMantenerPresionado) => {
  const [presionando, setPresionando] = useState<boolean>(false);
  const [progreso, setProgreso] = useState<number>(0);
  const [segundosRestantes, setSegundosRestantes] = useState<number>(
    Math.ceil(duracionMs / 1000)
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inicioRef = useRef<number>(0);
  const completadoRef = useRef<boolean>(false);
  const onCompletadoRef = useRef(onCompletado);
  const onCanceladoTempranoRef = useRef(onCanceladoTemprano);

  // Mantiene actualizados los callbacks sin reiniciar un conteo en curso (ej. si cambia el GPS)
  useEffect(() => {
    onCompletadoRef.current = onCompletado;
  }, [onCompletado]);

  useEffect(() => {
    onCanceladoTempranoRef.current = onCanceladoTemprano;
  }, [onCanceladoTemprano]);

  const detenerTemporizador = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancelarPresion = useCallback(
    (notificarSiFueTemprano: boolean) => {
      const estabaEnCurso = intervalRef.current !== null && !completadoRef.current;
      detenerTemporizador();
      setPresionando(false);
      setProgreso(0);
      setSegundosRestantes(Math.ceil(duracionMs / 1000));

      if (estabaEnCurso && notificarSiFueTemprano) {
        onCanceladoTempranoRef.current?.();
      }
    },
    [detenerTemporizador, duracionMs]
  );

  // Si el botón pasa a deshabilitado o se desmonta la vista, abortamos cualquier conteo activo
  useEffect(() => {
    if (deshabilitado) {
      cancelarPresion(false);
    }
  }, [deshabilitado, cancelarPresion]);

  useEffect(() => {
    return () => {
      detenerTemporizador();
    };
  }, [detenerTemporizador]);

  const onPointerDown = useCallback(
    (evento: React.PointerEvent<HTMLElement>) => {
      if (deshabilitado || intervalRef.current !== null) return;
      if (evento.pointerType === 'mouse' && evento.button !== 0) return;

      completadoRef.current = false;
      inicioRef.current = Date.now();
      setPresionando(true);
      setProgreso(0);
      setSegundosRestantes(Math.ceil(duracionMs / 1000));

      intervalRef.current = setInterval(() => {
        const transcurrido = Date.now() - inicioRef.current;
        const porcentaje = Math.min(100, (transcurrido / duracionMs) * 100);
        const restanteSeg = Math.max(1, Math.ceil((duracionMs - transcurrido) / 1000));

        if (transcurrido >= duracionMs) {
          completadoRef.current = true;
          detenerTemporizador();
          setPresionando(false);
          setProgreso(0);
          setSegundosRestantes(Math.ceil(duracionMs / 1000));
          onCompletadoRef.current();
          return;
        }

        setProgreso(porcentaje);
        setSegundosRestantes(restanteSeg);
      }, 50);
    },
    [deshabilitado, duracionMs, detenerTemporizador]
  );

  const onCancelar = useCallback(() => {
    cancelarPresion(true);
  }, [cancelarPresion]);

  const onContextMenu = useCallback((evento: React.MouseEvent<HTMLElement>) => {
    evento.preventDefault();
  }, []);

  return {
    presionando,
    progreso,
    segundosRestantes,
    handlers: {
      onPointerDown,
      onPointerUp: onCancelar,
      onPointerLeave: onCancelar,
      onPointerCancel: onCancelar,
      onContextMenu
    }
  };
};
