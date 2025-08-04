import api from "./api";
import type {
  PersonaComunidadTemporal,
  PreviewSesion,
  ResultadoProcesamiento,
  ResultadoCargaDefinitiva,
} from "../types/persona-comunidad-temporal";

export class PersonaComunidadTemporalService {
  /**
   * Procesar datos de archivo para previsualización
   */
  static async procesarDatosParaPreview(
    datosArchivo: any[],
    sesionCarga?: string
  ): Promise<{ success: boolean; data: ResultadoProcesamiento }> {
    const response = await api.post("/personas-temporal/procesar", {
      datosArchivo,
      sesionCarga,
    });
    return response.data;
  }

  /**
   * Obtener previsualización por sesión
   */
  static async obtenerPreviewPorSesion(
    sesionId: string
  ): Promise<{ success: boolean; data: PreviewSesion }> {
    const response = await api.get(`/personas-temporal/${sesionId}`);
    return response.data;
  }

  /**
   * Actualizar registro temporal
   */
  static async actualizarRegistroTemporal(
    id: string,
    datosAdicionales: Record<string, string>
  ): Promise<{ success: boolean; data: PersonaComunidadTemporal }> {
    const response = await api.put(`/personas-temporal/${id}`, {
      datosAdicionales,
    });
    return response.data;
  }

  /**
   * Confirmar carga definitiva
   */
  static async confirmarCargaDefinitiva(
    sesionId: string
  ): Promise<{ success: boolean; data: ResultadoCargaDefinitiva }> {
    const response = await api.post(`/personas-temporal/${sesionId}/confirmar`);
    return response.data;
  }

  /**
   * Cancelar previsualización
   */
  static async cancelarPreview(
    sesionId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/personas-temporal/${sesionId}`);
    return response.data;
  }

  /**
   * Eliminar registro temporal específico
   */
  static async eliminarRegistroTemporal(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/personas-temporal/registro/${id}`);
    return response.data;
  }
}
