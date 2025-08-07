/**
 * Utilidades para formateo y validación de RUT chileno en el backend
 */

/**
 * Limpia un RUT de caracteres especiales
 */
export function limpiarRut(rut: string): string {
  return rut.replace(/[^\dkK]/g, '');
}

/**
 * Formatea un RUT con puntos y guión
 * Ejemplo: "123456789" -> "12.345.678-9"
 */
export function formatearRut(rut: string): string {
  // Limpiar el RUT primero
  const rutLimpio = limpiarRut(rut);
  
  // Si está vacío, retornar vacío
  if (!rutLimpio) return '';
  
  // Convertir K a mayúscula
  const rutFormateado = rutLimpio.toUpperCase();
  
  // Si tiene menos de 2 dígitos, retornar tal como está
  if (rutFormateado.length < 2) return rutFormateado;
  
  // Separar el cuerpo del dígito verificador
  const cuerpo = rutFormateado.slice(0, -1);
  const dv = rutFormateado.slice(-1);
  
  // Formatear el cuerpo con puntos
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Retornar RUT formateado completo
  return `${cuerpoFormateado}-${dv}`;
}

/**
 * Verifica si un RUT es válido usando el algoritmo módulo 11
 */
export function validarRut(rut: string): boolean {
  // Limpiar el RUT
  const rutLimpio = limpiarRut(rut).toUpperCase();
  
  // Debe tener entre 7 y 9 caracteres (incluye el DV)
  if (rutLimpio.length < 7 || rutLimpio.length > 9) {
    return false;
  }
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Verificar que el cuerpo contenga solo números
  if (!/^\d+$/.test(cuerpo)) {
    return false;
  }
  
  // Verificar que el DV sea un número o K
  if (!/^[\dK]$/.test(dv)) {
    return false;
  }
  
  // Calcular dígito verificador esperado
  let suma = 0;
  let multiplicador = 2;
  
  // Recorrer de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  let dvCalculado: string;
  
  if (resto === 0) {
    dvCalculado = '0';
  } else if (resto === 1) {
    dvCalculado = 'K';
  } else {
    dvCalculado = (11 - resto).toString();
  }
  
  return dv === dvCalculado;
}

/**
 * Verifica si un texto parece ser un RUT (tiene formato de RUT)
 */
export function pareceRut(texto: string): boolean {
  // Limpiar y verificar que tenga el rango de caracteres apropiado
  const limpio = limpiarRut(texto);
  
  // Debe tener entre 7 y 9 caracteres
  if (limpio.length < 7 || limpio.length > 9) {
    return false;
  }
  
  // El último caracter debe ser número o K
  const ultimoChar = limpio.slice(-1).toUpperCase();
  if (!/^[\dK]$/.test(ultimoChar)) {
    return false;
  }
  
  // El resto deben ser números
  const cuerpo = limpio.slice(0, -1);
  return /^\d+$/.test(cuerpo);
}
