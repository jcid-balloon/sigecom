import type { DiccionarioColumna } from '@/types/columnas';
import type { PersonaComunidad } from '@/services/persona-comunidad.service';

export interface ErrorValidacion {
  fila: number;
  columna: string;
  valor: any;
  mensaje: string;
}

/**
 * Valida un campo específico según su tipo
 */
export const validarCampo = (
  valor: any, 
  columna: DiccionarioColumna
): string | null => {
  // Si la columna es requerida y está vacía
  if (columna.requerido && (valor === null || valor === undefined || valor === '')) {
    return `El campo ${columna.nombre} es obligatorio`;
  }

  // Si no hay valor y no es obligatorio, es válido
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  switch (columna.tipo) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(valor))) {
        return `${columna.nombre} debe tener formato de email válido`;
      }
      break;

    case 'phone':
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(String(valor))) {
        return `${columna.nombre} debe tener formato de teléfono válido`;
      }
      break;

    case 'number':
      if (isNaN(Number(valor))) {
        return `${columna.nombre} debe ser un número válido`;
      }
      break;

    case 'date':
      const fecha = new Date(valor);
      if (isNaN(fecha.getTime())) {
        return `${columna.nombre} debe tener formato de fecha válido`;
      }
      break;

    case 'boolean':
      const validBooleans = ['true', 'false', '1', '0', 'sí', 'no', 'si', 'yes', 'no'];
      if (!validBooleans.includes(String(valor).toLowerCase())) {
        return `${columna.nombre} debe ser un valor booleano válido (sí/no, true/false, 1/0)`;
      }
      break;

    case 'select':
      // Validación de opciones debe ser implementada según el esquema real
      if (columna.validacion) {
        try {
          const opciones = JSON.parse(columna.validacion);
          if (Array.isArray(opciones) && !opciones.includes(String(valor))) {
            return `${columna.nombre} debe ser una de las opciones: ${opciones.join(', ')}`;
          }
        } catch (e) {
          // Si no se puede parsear la validación, skip
        }
      }
      break;

    case 'string':
      if (columna.longitudMaxima && String(valor).length > columna.longitudMaxima) {
        return `${columna.nombre} no puede tener más de ${columna.longitudMaxima} caracteres`;
      }
      break;
  }

  return null;
};

/**
 * Valida una persona completa contra el diccionario
 */
export const validarPersona = (
  persona: PersonaComunidad,
  diccionario: DiccionarioColumna[]
): ErrorValidacion[] => {
  const errores: ErrorValidacion[] = [];

  diccionario.forEach(columna => {
    const valor = persona.datosAdicionales?.[columna.nombre];
    const error = validarCampo(valor, columna);
    
    if (error) {
      errores.push({
        fila: 0, // Se actualiza desde fuera
        columna: columna.nombre,
        valor: valor,
        mensaje: error
      });
    }
  });

  return errores;
};

/**
 * Valida un array de personas y retorna todos los errores
 */
export const validarPersonas = (
  personas: PersonaComunidad[],
  diccionario: DiccionarioColumna[]
): ErrorValidacion[] => {
  const errores: ErrorValidacion[] = [];

  personas.forEach((persona, index) => {
    const erroresPersona = validarPersona(persona, diccionario);
    errores.push(...erroresPersona.map(error => ({
      ...error,
      fila: index + 1 // Fila basada en 1 para el usuario
    })));
  });

  return errores;
};

/**
 * Normaliza un valor booleano desde string
 */
export const normalizarBooleano = (valor: any): boolean => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor !== 0;
  
  const valorStr = String(valor).toLowerCase().trim();
  const valoresTrue = ['true', '1', 'sí', 'si', 'yes', 'verdadero'];
  const valoresFalse = ['false', '0', 'no', 'falso'];
  
  if (valoresTrue.includes(valorStr)) return true;
  if (valoresFalse.includes(valorStr)) return false;
  
  return Boolean(valor);
};

/**
 * Normaliza un valor según el tipo de columna
 */
export const normalizarValor = (valor: any, tipo: string): any => {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  switch (tipo) {
    case 'number':
      const num = Number(valor);
      return isNaN(num) ? null : num;
    
    case 'boolean':
      return normalizarBooleano(valor);
    
    case 'date':
      const fecha = new Date(valor);
      return isNaN(fecha.getTime()) ? null : fecha.toISOString().split('T')[0];
    
    default:
      return String(valor).trim();
  }
};
