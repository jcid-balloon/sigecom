export interface FiltroModular {
  id: string;
  columna: string;
  operador: string;
  valor: any;
  logica: "AND" | "OR";
}

/**
 * Evalúa un filtro individual contra un valor
 */
export const evaluarFiltro = (
  valorPersona: any,
  operador: string,
  valorFiltro: any,
  tipoColumna: string
): boolean => {
  // Manejar operadores de nulidad primero
  if (operador === "es_nulo") {
    return (
      valorPersona == null || valorPersona === "" || valorPersona === undefined
    );
  }

  if (operador === "no_es_nulo") {
    return (
      valorPersona != null && valorPersona !== "" && valorPersona !== undefined
    );
  }

  // Para otros operadores, si no hay valor de filtro, no filtrar
  if (!valorFiltro && valorFiltro !== 0 && valorFiltro !== false) return true;

  switch (tipoColumna) {
    case "select":
      return operador === "es"
        ? String(valorPersona).toLowerCase() ===
            String(valorFiltro).toLowerCase()
        : true;

    case "boolean":
      return operador === "es"
        ? String(valorPersona) === String(valorFiltro)
        : true;

    case "date":
      const fechaPersona = new Date(valorPersona);
      switch (operador) {
        case "es":
          const fechaFiltro = new Date(valorFiltro);
          return fechaPersona.toDateString() === fechaFiltro.toDateString();
        case "antes":
          return fechaPersona < new Date(valorFiltro);
        case "despues":
          return fechaPersona > new Date(valorFiltro);
        case "entre":
          if (!valorFiltro.desde || !valorFiltro.hasta) return true;
          const fechaDesde = new Date(valorFiltro.desde);
          const fechaHasta = new Date(valorFiltro.hasta);
          return fechaPersona >= fechaDesde && fechaPersona <= fechaHasta;
        default:
          return true;
      }

    case "number":
      const numPersona = Number(valorPersona);
      if (isNaN(numPersona)) return false;

      switch (operador) {
        case "es":
          return numPersona === Number(valorFiltro);
        case "mayor":
          return numPersona > Number(valorFiltro);
        case "menor":
          return numPersona < Number(valorFiltro);
        case "entre":
          if (!valorFiltro.desde || !valorFiltro.hasta) return true;
          const numDesde = Number(valorFiltro.desde);
          const numHasta = Number(valorFiltro.hasta);
          return numPersona >= numDesde && numPersona <= numHasta;
        default:
          return true;
      }

    default: // string, email, phone, etc.
      const valorPersonaStr = String(valorPersona).toLowerCase();
      const valorFiltroStr = String(valorFiltro).toLowerCase();

      switch (operador) {
        case "contiene":
          return valorPersonaStr.includes(valorFiltroStr);
        case "es":
          return valorPersonaStr === valorFiltroStr;
        case "inicia":
          return valorPersonaStr.startsWith(valorFiltroStr);
        case "termina":
          return valorPersonaStr.endsWith(valorFiltroStr);
        case "no_contiene":
          return !valorPersonaStr.includes(valorFiltroStr);
        default:
          return true;
      }
  }
};

/**
 * Obtiene los operadores disponibles según el tipo de columna
 */
export const obtenerOperadores = (tipoColumna: string) => {
  const operadoresComunes = [
    { value: "es_nulo", label: "Está vacío/nulo" },
    { value: "no_es_nulo", label: "No está vacío" },
  ];

  switch (tipoColumna) {
    case "string":
    case "email":
    case "phone":
      return [
        { value: "contiene", label: "Contiene" },
        { value: "es", label: "Es exactamente" },
        { value: "inicia", label: "Inicia con" },
        { value: "termina", label: "Termina con" },
        { value: "no_contiene", label: "No contiene" },
        ...operadoresComunes,
      ];
    case "number":
      return [
        { value: "es", label: "Es igual a" },
        { value: "mayor", label: "Mayor que" },
        { value: "menor", label: "Menor que" },
        { value: "entre", label: "Entre" },
        ...operadoresComunes,
      ];
    case "date":
      return [
        { value: "es", label: "Es" },
        { value: "antes", label: "Antes de" },
        { value: "despues", label: "Después de" },
        { value: "entre", label: "Entre" },
        ...operadoresComunes,
      ];
    case "boolean":
      return [{ value: "es", label: "Es" }, ...operadoresComunes];
    case "select":
      return [{ value: "es", label: "Es" }, ...operadoresComunes];
    default:
      return [
        { value: "contiene", label: "Contiene" },
        { value: "es", label: "Es exactamente" },
        ...operadoresComunes,
      ];
  }
};
