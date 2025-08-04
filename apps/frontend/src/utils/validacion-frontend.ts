import type {
  DiccionarioColumna,
  TipoColumna,
  ValidacionError,
} from "../types/columnas";

export class ValidacionFrontend {
  /**
   * Validar un valor según la configuración de columna
   */
  static validarCampo(
    valor: any,
    columna: DiccionarioColumna
  ): ValidacionError | null {
    // Campo requerido
    if (
      columna.requerido &&
      (valor === null || valor === undefined || valor === "")
    ) {
      return {
        campo: columna.nombre,
        valor,
        mensaje: `El campo '${columna.nombre}' es requerido`,
        codigo: "CAMPO_REQUERIDO",
      };
    }

    // Si está vacío y no es requerido, es válido
    if (valor === null || valor === undefined || valor === "") {
      return null;
    }

    // Validar por tipo
    const errorTipo = this.validarTipo(valor, columna.tipo);
    if (errorTipo) {
      return {
        campo: columna.nombre,
        valor,
        mensaje: errorTipo,
        codigo: "TIPO_INVALIDO",
      };
    }

    // Validaciones específicas
    const errorValidacion = this.validarReglas(valor, columna);
    if (errorValidacion) {
      return {
        campo: columna.nombre,
        valor,
        mensaje: errorValidacion,
        codigo: "VALIDACION_REGLA",
      };
    }

    return null;
  }

  /**
   * Validar todos los campos de un formulario
   */
  static validarFormulario(
    datos: Record<string, any>,
    columnas: DiccionarioColumna[]
  ): ValidacionError[] {
    const errores: ValidacionError[] = [];

    for (const columna of columnas) {
      const valor = datos[columna.nombre];
      const error = this.validarCampo(valor, columna);
      if (error) {
        errores.push(error);
      }
    }

    return errores;
  }

  /**
   * Validar tipo de dato
   */
  private static validarTipo(valor: any, tipo: TipoColumna): string | null {
    switch (tipo) {
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
        if (isNaN(Number(valor))) {
          return `'${valor}' no es un número válido`;
        }
        break;

      case "boolean":
        if (
          typeof valor !== "boolean" &&
          valor !== "true" &&
          valor !== "false" &&
          valor !== "1" &&
          valor !== "0"
        ) {
          return `'${valor}' no es un valor booleano válido`;
        }
        break;

      case "date":
        if (isNaN(Date.parse(valor))) {
          return `'${valor}' no es una fecha válida`;
        }
        break;
    }

    return null;
  }

  /**
   * Validar reglas específicas
   */
  private static validarReglas(
    valor: any,
    columna: DiccionarioColumna
  ): string | null {
    // Longitud de texto
    if (
      (columna.tipo === "string" || columna.tipo === "textarea") &&
      typeof valor === "string"
    ) {
      if (columna.longitudMinima && valor.length < columna.longitudMinima) {
        return `El texto debe tener al menos ${columna.longitudMinima} caracteres`;
      }
      if (columna.longitudMaxima && valor.length > columna.longitudMaxima) {
        return `El texto no puede exceder ${columna.longitudMaxima} caracteres`;
      }
    }

    // Rangos numéricos
    if (columna.tipo === "number") {
      const num = Number(valor);
      if (columna.valorMinimo !== undefined && num < columna.valorMinimo) {
        return `El valor debe ser mayor o igual a ${columna.valorMinimo}`;
      }
      if (columna.valorMaximo !== undefined && num > columna.valorMaximo) {
        return `El valor debe ser menor o igual a ${columna.valorMaximo}`;
      }
    }

    // Validaciones personalizadas
    if (columna.tipoValidacion && columna.validacion) {
      try {
        switch (columna.tipoValidacion) {
          case "lista":
            const lista = JSON.parse(columna.validacion);
            if (!Array.isArray(lista) || !lista.includes(valor)) {
              return `El valor debe ser uno de: ${lista.join(", ")}`;
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
    }

    return null;
  }

  /**
   * Formatear valor según el tipo
   */
  static formatearValor(valor: any, tipo: TipoColumna): any {
    if (valor === null || valor === undefined || valor === "") {
      return "";
    }

    switch (tipo) {
      case "number":
        return Number(valor);
      case "boolean":
        return Boolean(valor);
      case "date":
        return new Date(valor).toISOString().split("T")[0]; // Formato YYYY-MM-DD
      default:
        return String(valor);
    }
  }

  /**
   * Obtener configuración de input para el tipo
   */
  static obtenerConfiguracionInput(columna: DiccionarioColumna) {
    const config: any = {
      type: "text",
      placeholder: columna.placeholder || "",
      required: columna.requerido,
    };

    switch (columna.tipo) {
      case "number":
        config.type = "number";
        if (columna.valorMinimo !== undefined) config.min = columna.valorMinimo;
        if (columna.valorMaximo !== undefined) config.max = columna.valorMaximo;
        break;

      case "email":
        config.type = "email";
        break;

      case "url":
        config.type = "url";
        break;

      case "phone":
        config.type = "tel";
        break;

      case "date":
        config.type = "date";
        break;

      case "boolean":
        config.type = "checkbox";
        break;

      case "textarea":
        config.type = "textarea";
        if (columna.longitudMaxima) config.maxLength = columna.longitudMaxima;
        break;

      default:
        if (columna.longitudMaxima) config.maxLength = columna.longitudMaxima;
        break;
    }

    return config;
  }
}
