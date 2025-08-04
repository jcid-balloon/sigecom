import api from "./api";

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
}

export interface HistorialCarga {
  _id: string;
  usuario: Usuario;
  fechaYHora: string;
  nombreArchivo: string;
  cantidadRegistros: number;
  estado: "procesando" | "completado" | "fallido";
  errorMessage?: string;
  jobId?: string;
}

export interface HistorialModificacion {
  _id: string;
  usuario: Usuario;
  fechaYHora: string;
  documentoModificado?: {
    _id: string;
    rut: string;
    nombre: string;
    apellido: string;
  };
  resumenCambios: string;
  contextoOperacion?: string; // Información contextual sobre la operación
  tipoModificacion: "individual" | "masiva" | "creacion" | "eliminacion";
  referenciaOperacion?: string;

  // Para modificaciones individuales: lista de campos modificados
  camposModificados?: Array<{
    campo: string;
    valorAnterior: string;
    valorNuevo: string;
  }>;

  // Para operaciones masivas: estadísticas
  estadisticas?: {
    elementosCreados?: number;
    elementosModificados?: number;
    elementosEliminados?: number;
    totalProcesados?: number;
    errores?: number;
  };

  // Campos deprecados (mantenidos por compatibilidad)
  campoModificado?: string;
  valorAnterior?: string;
  valorNuevo?: string;
}

export interface HistorialDescarga {
  _id: string;
  usuario: Usuario;
  fechaYHora: string;
  formato: "CSV" | "Excel" | "PDF";
  cantidadRegistros: number;
  filtrosAplicados?: string;
  nombreArchivo?: string;
}

export type HistorialCompleto = (
  | HistorialCarga
  | HistorialModificacion
  | HistorialDescarga
) & {
  tipoHistorial: "carga" | "modificacion" | "descarga";
};

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface EstadisticasHistorial {
  cargas: {
    total: number;
    completadas: number;
    fallidas: number;
    tasaExito: number;
  };
  modificaciones: {
    total: number;
    individuales: number;
    masivas: number;
  };
  descargas: {
    total: number;
  };
}

export const historialService = {
  // Historiales de Carga
  async obtenerHistorialesCarga(params?: {
    estado?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.estado) searchParams.append("estado", params.estado);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const response = await api.get(
      `/historiales/carga?${searchParams.toString()}`
    );
    return response.data as {
      success: boolean;
      data: HistorialCarga[];
      pagination: PaginationInfo;
    };
  },

  async obtenerHistorialCargaPorId(id: string) {
    const response = await api.get(`/historiales/carga/${id}`);
    return response.data as {
      success: boolean;
      data: HistorialCarga;
    };
  },

  // Historiales de Modificación
  async obtenerHistorialesModificacion(params?: {
    tipoModificacion?: string;
    documentoModificado?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.tipoModificacion)
      searchParams.append("tipoModificacion", params.tipoModificacion);
    if (params?.documentoModificado)
      searchParams.append("documentoModificado", params.documentoModificado);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const response = await api.get(
      `/historiales/modificacion?${searchParams.toString()}`
    );
    return response.data as {
      success: boolean;
      data: HistorialModificacion[];
      pagination: PaginationInfo;
    };
  },

  async obtenerHistorialModificacionPorId(id: string) {
    const response = await api.get(`/historiales/modificacion/${id}`);
    return response.data as {
      success: boolean;
      data: HistorialModificacion;
    };
  },

  // Historiales de Descarga
  async obtenerHistorialesDescarga(params?: {
    formato?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.formato) searchParams.append("formato", params.formato);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const response = await api.get(
      `/historiales/descarga?${searchParams.toString()}`
    );
    return response.data as {
      success: boolean;
      data: HistorialDescarga[];
      pagination: PaginationInfo;
    };
  },

  async obtenerHistorialDescargaPorId(id: string) {
    const response = await api.get(`/historiales/descarga/${id}`);
    return response.data as {
      success: boolean;
      data: HistorialDescarga;
    };
  },

  // Historial Completo
  async obtenerTodoElHistorial(params?: {
    limit?: number;
    offset?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.fechaDesde)
      searchParams.append("fechaDesde", params.fechaDesde);
    if (params?.fechaHasta)
      searchParams.append("fechaHasta", params.fechaHasta);

    const response = await api.get(
      `/historiales/completo?${searchParams.toString()}`
    );
    return response.data as {
      success: boolean;
      data: HistorialCompleto[];
      pagination: PaginationInfo;
    };
  },

  // Estadísticas
  async obtenerEstadisticasHistorial() {
    const response = await api.get("/historiales/estadisticas");
    return response.data as {
      success: boolean;
      data: EstadisticasHistorial;
    };
  },
};
