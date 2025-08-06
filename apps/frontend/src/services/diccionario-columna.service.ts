import api from "./api";
import type {
  DiccionarioColumna,
  MetadatosFormulario,
} from "@/types/columnas";

export interface DiccionarioResponse {
  success: boolean;
  data: DiccionarioColumna[];
}

export const diccionarioColumnaService = {
  // Obtener todas las columnas
  async obtenerColumnas(): Promise<DiccionarioColumna[]> {
    const response = await api.get("/diccionario-columnas");
    return response.data.data;
  },

  // Obtener columnas optimizadas para el frontend con tipos y validaciones
  async obtenerColumnasParaFrontend(): Promise<DiccionarioColumna[]> {
    const response = await api.get("/diccionario-columnas/frontend");
    return response.data.data;
  },

  // Obtener metadatos completos para formularios
  async obtenerMetadatosFormulario(): Promise<MetadatosFormulario> {
    const columnas = await this.obtenerColumnasParaFrontend();

    return {
      columnas,
    };
  },

  // Obtener todas las columnas (mantenido por compatibilidad)
  async obtenerTodasLasColumnas(): Promise<DiccionarioColumna[]> {
    return this.obtenerColumnasParaFrontend();
  },

  // Crear nueva columna
  async crearColumna(
    columna: Omit<DiccionarioColumna, "_id">
  ): Promise<DiccionarioColumna> {
    const response = await api.post("/diccionario-columnas", columna);
    return response.data.data;
  },

  // Actualizar columna
  async actualizarColumna(
    id: string,
    columna: Partial<DiccionarioColumna>
  ): Promise<DiccionarioColumna> {
    const response = await api.put(`/diccionario-columnas/${id}`, columna);
    return response.data.data;
  },

  // Eliminar columna
  async eliminarColumna(id: string): Promise<void> {
    await api.delete(`/diccionario-columnas/${id}`);
  },
};
