import {
  DiccionarioColumnaModel,
  DiccionarioColumna,
  TipoColumna,
} from "@/models/DiccionarioColumna";
import {
  formatearRut,
  validarRut,
  pareceRut,
  limpiarRut,
} from "@/utils/rutUtils";

export interface ValidacionError {
  campo: string;
  valor: any;
  mensaje: string;
  codigo: string;
}

export interface ValidacionResult {
  valido: boolean;
  errores: ValidacionError[];
  datosLimpios: Record<string, any>;
}

export class ValidacionService {
  /**
   * Validar datos contra el diccionario de columnas
   */
  static async validarDatos(
    datos: Record<string, any>
  ): Promise<ValidacionResult> {
    const columnas = await DiccionarioColumnaModel.find({});
    const errores: ValidacionError[] = [];
    const datosLimpios: Record<string, any> = {};

    // Crear un mapa de columnas por nombre para acceso rápido
    const mapaColumnas = new Map<string, DiccionarioColumna>();
    columnas.forEach((col) => {
      mapaColumnas.set(col.nombre.toLowerCase(), col);
    });

    // Validar cada campo en los datos
    for (const [campo, valor] of Object.entries(datos)) {
      const campoNormalizado = campo.toLowerCase();
      const columna = mapaColumnas.get(campoNormalizado);

      if (!columna) {
        // Campo no está definido en el diccionario - simplemente lo omitimos
        // console.log(`Campo '${campo}' no encontrado en diccionario, omitiendo...`);
        continue;
      }

      // Validar campo requerido
      if (
        columna.requerido &&
        (valor === null || valor === undefined || valor === "")
      ) {
        errores.push({
          campo,
          valor,
          mensaje: `El campo '${campo}' es requerido`,
          codigo: "CAMPO_REQUERIDO",
        });
        continue;
      }

      // Si el valor está vacío y no es requerido, usar valor por defecto
      if (
        (valor === null || valor === undefined || valor === "") &&
        !columna.requerido
      ) {
        datosLimpios[campo] = columna.valorPorDefecto || null;
        continue;
      }

      // Validar tipo de dato
      const valorLimpio = this.convertirTipo(valor, columna.tipo);
      if (valorLimpio === null && valor !== null && valor !== "") {
        errores.push({
          campo,
          valor,
          mensaje: `El valor '${valor}' no es válido para el tipo '${columna.tipo}'`,
          codigo: "TIPO_INVALIDO",
        });
        continue;
      }

      // Validaciones específicas por tipo
      const errorTipo = this.validarTipo(valorLimpio, columna);
      if (errorTipo) {
        errores.push({
          campo,
          valor,
          mensaje: errorTipo,
          codigo: "VALIDACION_TIPO",
        });
        continue;
      }

      // Validaciones adicionales
      const errorValidacion = this.validarReglas(valorLimpio, columna);
      if (errorValidacion) {
        errores.push({
          campo,
          valor,
          mensaje: errorValidacion,
          codigo: "VALIDACION_REGLA",
        });
        continue;
      }

      // Aplicar formateo automático si es RUT
      const valorFinalFormateado = this.formatearValorSiEsRut(
        String(valorLimpio),
        columna
      );

      datosLimpios[campo] = valorFinalFormateado;
    }

    // Validar campos requeridos que no están en los datos
    for (const columna of columnas) {
      if (columna.requerido && !datos.hasOwnProperty(columna.nombre)) {
        errores.push({
          campo: columna.nombre,
          valor: undefined,
          mensaje: `El campo requerido '${columna.nombre}' no está presente`,
          codigo: "CAMPO_FALTANTE",
        });
      }
    }

    return {
      valido: errores.length === 0,
      errores,
      datosLimpios,
    };
  }

  /**
   * Convertir valor al tipo especificado
   */
  private static convertirTipo(valor: any, tipo: TipoColumna): any {
    if (valor === null || valor === undefined || valor === "") {
      return null;
    }

    try {
      switch (tipo) {
        case "string":
        case "email":
        case "url":
        case "phone":
        case "textarea":
          return String(valor);

        case "number":
          const num = Number(valor);
          return isNaN(num) ? null : num;

        case "boolean":
          if (typeof valor === "boolean") return valor;
          if (typeof valor === "string") {
            const lower = valor.toLowerCase();
            if (
              lower === "true" ||
              lower === "1" ||
              lower === "sí" ||
              lower === "si"
            )
              return true;
            if (lower === "false" || lower === "0" || lower === "no")
              return false;
          }
          return null;

        case "date":
          const fecha = new Date(valor);
          return isNaN(fecha.getTime()) ? null : fecha.toISOString();

        case "select":
          return String(valor);

        default:
          return String(valor);
      }
    } catch {
      return null;
    }
  }

  /**
   * Validar valor según el tipo específico
   */
  static validarTipo(valor: any, columna: DiccionarioColumna): string | null {
    if (valor === null) return null;

    // Validaciones por tipo específico
    switch (columna.tipo) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor)) {
          return `'${valor}' no es un email válido`;
        }
        break;

      case "url":
        try {
          new URL(valor);
        } catch {
          return `'${valor}' no es una URL válida`;
        }
        break;

      case "phone":
        const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/;
        if (!phoneRegex.test(valor)) {
          return `'${valor}' no es un número de teléfono válido`;
        }
        break;

      case "number":
        if (columna.valorMinimo !== undefined && valor < columna.valorMinimo) {
          return `El valor debe ser mayor o igual a ${columna.valorMinimo}`;
        }
        if (columna.valorMaximo !== undefined && valor > columna.valorMaximo) {
          return `El valor debe ser menor o igual a ${columna.valorMaximo}`;
        }
        break;

      case "string":
      case "textarea":
        if (columna.longitudMinima && valor.length < columna.longitudMinima) {
          return `El texto debe tener al menos ${columna.longitudMinima} caracteres`;
        }
        if (columna.longitudMaxima && valor.length > columna.longitudMaxima) {
          return `El texto no puede exceder ${columna.longitudMaxima} caracteres`;
        }
        break;
    }

    // Validar reglas adicionales (regex, lista, rango)
    const errorReglas = this.validarReglas(valor, columna);
    if (errorReglas) {
      return errorReglas;
    }

    return null;
  }

  /**
   * Validar reglas adicionales (regex, lista, rango)
   */
  private static validarReglas(
    valor: any,
    columna: DiccionarioColumna
  ): string | null {
    if (valor === null || !columna.tipoValidacion || !columna.validacion) {
      return null;
    }

    try {
      switch (columna.tipoValidacion) {
        case "lista":
          // Manejar tanto JSON como valores separados por comas
          let opciones: string[] = [];
          try {
            // Intentar parsear como JSON primero
            const parsed = JSON.parse(columna.validacion);
            if (Array.isArray(parsed)) {
              opciones = parsed.map((o) => String(o).trim());
            } else {
              throw new Error("No es array");
            }
          } catch {
            // Si falla, tratar como valores separados por comas
            opciones = columna.validacion
              .split(",")
              .map((o) => o.trim())
              .filter((o) => o.length > 0);
          }

          if (opciones.length === 0) {
            return `Configuración de lista inválida`;
          }

          // Comparar el valor (normalizando a string y eliminando espacios)
          const valorNormalizado = String(valor).trim();
          const valorValido = opciones.some(
            (opcion) => opcion.toLowerCase() === valorNormalizado.toLowerCase()
          );

          if (!valorValido) {
            return `El valor debe ser uno de: ${opciones.join(", ")}`;
          }
          break;

        case "regex":
          const regex = new RegExp(columna.validacion);
          if (!regex.test(String(valor))) {
            return `El valor no cumple con el patrón requerido`;
          }
          break;

        case "rango":
          const rango = JSON.parse(columna.validacion);
          if (
            typeof valor === "number" &&
            (valor < rango.min || valor > rango.max)
          ) {
            return `El valor debe estar entre ${rango.min} y ${rango.max}`;
          }
          break;
      }
    } catch (error) {
      return `Error en la validación: configuración inválida`;
    }

    return null;
  }

  /**
   * Obtener todas las columnas para el frontend
   */
  static async obtenerColumnasParaFrontend(): Promise<any[]> {
    const columnas = await DiccionarioColumnaModel.find({});

    return columnas.map((col) => ({
      _id: col._id,
      nombre: col.nombre,
      tipo: col.tipo,
      requerido: col.requerido,
      valorPorDefecto: col.valorPorDefecto,
      descripcion: col.descripcion,
      tipoValidacion: col.tipoValidacion,
      validacion: col.validacion,
      longitudMaxima: col.longitudMaxima,
      longitudMinima: col.longitudMinima,
      valorMinimo: col.valorMinimo,
      valorMaximo: col.valorMaximo,
      patron: col.patron,
      placeholder: col.placeholder,
    }));
  }

  /**
   * Determinar si un campo debe formatear RUT automáticamente
   */
  static debeFormatearRut(columna: DiccionarioColumna): boolean {
    // Verificar si la columna tiene validación de RUT
    if (columna.tipoValidacion === "regex" && columna.validacion) {
      // Buscar patrones comunes de RUT en el regex
      const rutPatterns = [
        /rut/i,
        /\d+\.\d+\.\d+-[\dkK]/,
        /^\d{7,8}-[\dkK]$/,
        /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
      ];

      return rutPatterns.some(
        (pattern) =>
          pattern.test(columna.validacion!) ||
          pattern.test(columna.nombre) ||
          pattern.test(columna.descripcion || "")
      );
    }

    // También verificar por nombre de columna
    return /rut/i.test(columna.nombre);
  }

  /**
   * Formatear valor automáticamente si es RUT
   */
  static formatearValorSiEsRut(
    valor: string,
    columna: DiccionarioColumna
  ): string {
    if (!valor || typeof valor !== "string") {
      return valor;
    }

    // Verificar si debe formatear RUT
    if (this.debeFormatearRut(columna) && pareceRut(valor)) {
      return formatearRut(valor);
    }

    return valor;
  }

  /**
   * Procesar y formatear datos durante el preview
   */
  static async procesarDatosParaPreview(
    datos: Record<string, any>
  ): Promise<Record<string, any>> {
    const columnas = await DiccionarioColumnaModel.find({});
    const datosFormateados: Record<string, any> = {};

    // Crear un mapa de columnas por nombre para acceso rápido
    const mapaColumnas = new Map<string, DiccionarioColumna>();
    columnas.forEach((col) => {
      mapaColumnas.set(col.nombre.toLowerCase(), col);
    });

    // Procesar cada campo
    for (const [campo, valor] of Object.entries(datos)) {
      const campoNormalizado = campo.toLowerCase();
      const columna = mapaColumnas.get(campoNormalizado);

      if (columna && valor) {
        // Aplicar formateo automático si corresponde
        datosFormateados[campo] = this.formatearValorSiEsRut(
          String(valor).trim(),
          columna
        );
      } else {
        datosFormateados[campo] = valor;
      }
    }

    return datosFormateados;
  }
}
