import { useRef, useCallback } from 'react';
import { formatearRutEnInput, limpiarRut } from '@/utils/rutUtils';

/**
 * Hook para manejar inputs de RUT con formateo automático
 */
export const useRutInput = (
  onChange: (valor: string) => void,
  formatearAlTypear: boolean = true
) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    const nuevoValor = inputElement.value;
    const posicionCursor = inputElement.selectionStart || 0;

    if (formatearAlTypear) {
      // Formatear mientras escribe
      const { valorFormateado, nuevaPosicion } = formatearRutEnInput(nuevoValor, posicionCursor);
      
      // Actualizar el valor
      onChange(valorFormateado);
      
      // Restaurar la posición del cursor en el próximo tick
      requestAnimationFrame(() => {
        if (inputElement && document.activeElement === inputElement) {
          inputElement.setSelectionRange(nuevaPosicion, nuevaPosicion);
        }
      });
    } else {
      // Solo limpiar caracteres inválidos pero mantener el formato original
      const valorLimpio = nuevoValor.replace(/[^\d\.\-kK]/g, '');
      onChange(valorLimpio);
    }
  }, [onChange, formatearAlTypear]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!formatearAlTypear) {
      // Si no se formatea al escribir, formatear al perder el foco
      const valorLimpio = limpiarRut(e.target.value);
      if (valorLimpio) {
        // Solo formatear si parece ser un RUT válido
        if (valorLimpio.length >= 7) {
          const valorFormateado = valorLimpio.replace(/(\d)(\d{3})(\d{3})([\dkK])$/, '$1.$2.$3-$4');
          onChange(valorFormateado.toUpperCase());
        }
      }
    }
  }, [onChange, formatearAlTypear]);

  return {
    inputRef,
    handleChange,
    handleBlur,
    props: {
      ref: inputRef,
      onChange: handleChange,
      onBlur: handleBlur,
    }
  };
};
