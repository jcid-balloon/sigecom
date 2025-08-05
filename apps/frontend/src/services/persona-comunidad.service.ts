import api from "./api";

export interface PersonaComunidad {
  _id?: string;
  datosAdicionales: Record<string, string>;
}

export interface CargaMasivaResponse {
  success: boolean;
  message: string;
  jobId: string;
}

export interface ProgresoCarga {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progreso: {
    total: number;
    procesados: number;
    porcentaje: number;
  };
  errores: string[];
  historialCargaId?: string;
}

export const personaComunidadService = {
  // Obtener todas las personas con filtros opcionales
  async obtenerPersonas(filtros?: {
    rut?: string;
    nombre?: string;
    apellido?: string;
  }) {
    const params = new URLSearchParams();
    if (filtros?.rut) params.append("rut", filtros.rut);
    if (filtros?.nombre) params.append("nombre", filtros.nombre);
    if (filtros?.apellido) params.append("apellido", filtros.apellido);

    const response = await api.get(
      `/personas?${params.toString()}`
    );
    return response.data;
  },

  // Obtener persona por ID
  async obtenerPersonaPorId(id: string) {
    const response = await api.get(`/personas/${id}`);
    return response.data;
  },

  // Obtener persona por RUT
  async obtenerPersonaPorRut(rut: string) {
    const response = await api.get(`/personas/rut/${rut}`);
    return response.data;
  },

  // Crear nueva persona (con historial automático)
  async crearPersona(persona: Omit<PersonaComunidad, "_id">) {
    const response = await api.post("/personas", persona);
    return response.data;
  },

  // Actualizar persona (con historial automático)
  async actualizarPersona(id: string, updates: Partial<PersonaComunidad>) {
    const response = await api.put(`/personas/${id}`, updates);
    return response.data;
  },

  // Eliminar persona (con historial automático)
  async eliminarPersona(id: string) {
    const response = await api.delete(`/personas/${id}`);
    return response.data;
  },

  // Subir archivo para carga masiva
  async subirArchivoCargaMasiva(file: File): Promise<CargaMasivaResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "/personas/upload-excel",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Consultar progreso de carga masiva
  async consultarProgresoCarga(jobId: string): Promise<ProgresoCarga> {
    const response = await api.get(`/personas/job/${jobId}`);
    return response.data.data; // Extraer la data anidada del backend
  },

  // Registrar descarga en el historial
  async registrarDescarga(
    formato: "CSV" | "Excel" | "PDF",
    cantidadRegistros: number,
    filtros?: any
  ) {
    const response = await api.post(`/personas/registrar-descarga`, {
      formato,
      cantidadRegistros,
      filtros: filtros || {},
    });
    return response.data;
  },
};
