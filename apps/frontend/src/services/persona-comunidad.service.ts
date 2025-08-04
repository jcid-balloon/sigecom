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

export interface DescargaResponse {
  success: boolean;
  message: string;
  nombreArchivo: string;
  datos: PersonaComunidad[];
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
      `/personas-con-historial?${params.toString()}`
    );
    return response.data;
  },

  // Obtener persona por ID
  async obtenerPersonaPorId(id: string) {
    const response = await api.get(`/personas-con-historial/${id}`);
    return response.data;
  },

  // Obtener persona por RUT
  async obtenerPersonaPorRut(rut: string) {
    const response = await api.get(`/personas-con-historial/rut/${rut}`);
    return response.data;
  },

  // Crear nueva persona (con historial automático)
  async crearPersona(persona: Omit<PersonaComunidad, "_id">) {
    const response = await api.post("/personas-con-historial", persona);
    return response.data;
  },

  // Actualizar persona (con historial automático)
  async actualizarPersona(id: string, updates: Partial<PersonaComunidad>) {
    const response = await api.put(`/personas-con-historial/${id}`, updates);
    return response.data;
  },

  // Eliminar persona (con historial automático)
  async eliminarPersona(id: string) {
    const response = await api.delete(`/personas-con-historial/${id}`);
    return response.data;
  },

  // Subir archivo para carga masiva
  async subirArchivoCargaMasiva(file: File): Promise<CargaMasivaResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "/personas-con-historial/upload-excel",
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
    const response = await api.get(`/personas-con-historial/job/${jobId}`);
    return response.data.data; // Extraer la data anidada del backend
  },

  // Descargar datos con historial automático
  async descargarDatos(
    formato: "CSV" | "Excel" | "PDF",
    filtros?: any
  ): Promise<DescargaResponse> {
    const params = new URLSearchParams();
    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        if (filtros[key]) params.append(key, filtros[key]);
      });
    }

    const response = await api.get(
      `/personas-con-historial/download/${formato.toLowerCase()}?${params.toString()}`
    );
    return response.data;
  },
};
