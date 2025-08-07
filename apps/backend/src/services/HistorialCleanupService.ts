import { HistorialCargaModel } from "../models/historial/HistorialCarga";
import { HistorialDescargaModel } from "../models/historial/HistorialDescarga";
import { HistorialModificacionModel } from "../models/historial/HistorialModificacion";

export class HistorialCleanupService {
  /**
   * Elimina documentos de historial más antiguos que el número de días especificado
   * @param days Número de días hacia atrás para mantener los documentos
   */
  static async cleanupOlderThan(days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    try {
      console.log(`🧹 Limpiando historial anterior a: ${cutoffDate.toISOString()}`);

      // Limpiar HistorialCarga
      const deletedCarga = await HistorialCargaModel.deleteMany({
        fechaYHora: { $lt: cutoffDate }
      });

      // Limpiar HistorialDescarga
      const deletedDescarga = await HistorialDescargaModel.deleteMany({
        fechaYHora: { $lt: cutoffDate }
      });

      // Limpiar HistorialModificacion
      const deletedModificacion = await HistorialModificacionModel.deleteMany({
        fechaYHora: { $lt: cutoffDate }
      });

      const result = {
        historialCarga: deletedCarga.deletedCount,
        historialDescarga: deletedDescarga.deletedCount,
        historialModificacion: deletedModificacion.deletedCount,
        total: deletedCarga.deletedCount + deletedDescarga.deletedCount + deletedModificacion.deletedCount
      };

      console.log("✅ Limpieza completada:", result);
      return result;

    } catch (error) {
      console.error("❌ Error durante la limpieza del historial:", error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del historial por antigüedad
   */
  static async getHistorialStats() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      // Estadísticas de HistorialCarga
      const cargaStats = {
        total: await HistorialCargaModel.countDocuments(),
        lastWeek: await HistorialCargaModel.countDocuments({
          fechaYHora: { $gte: oneWeekAgo }
        }),
        olderThanWeek: await HistorialCargaModel.countDocuments({
          fechaYHora: { $lt: oneWeekAgo }
        }),
        olderThanMonth: await HistorialCargaModel.countDocuments({
          fechaYHora: { $lt: oneMonthAgo }
        })
      };

      // Estadísticas de HistorialDescarga
      const descargaStats = {
        total: await HistorialDescargaModel.countDocuments(),
        lastWeek: await HistorialDescargaModel.countDocuments({
          fechaYHora: { $gte: oneWeekAgo }
        }),
        olderThanWeek: await HistorialDescargaModel.countDocuments({
          fechaYHora: { $lt: oneWeekAgo }
        }),
        olderThanMonth: await HistorialDescargaModel.countDocuments({
          fechaYHora: { $lt: oneMonthAgo }
        })
      };

      // Estadísticas de HistorialModificacion
      const modificacionStats = {
        total: await HistorialModificacionModel.countDocuments(),
        lastWeek: await HistorialModificacionModel.countDocuments({
          fechaYHora: { $gte: oneWeekAgo }
        }),
        olderThanWeek: await HistorialModificacionModel.countDocuments({
          fechaYHora: { $lt: oneWeekAgo }
        }),
        olderThanMonth: await HistorialModificacionModel.countDocuments({
          fechaYHora: { $lt: oneMonthAgo }
        })
      };

      return {
        historialCarga: cargaStats,
        historialDescarga: descargaStats,
        historialModificacion: modificacionStats,
        summary: {
          totalDocuments: cargaStats.total + descargaStats.total + modificacionStats.total,
          documentsLastWeek: cargaStats.lastWeek + descargaStats.lastWeek + modificacionStats.lastWeek,
          documentsToCleanup: cargaStats.olderThanWeek + descargaStats.olderThanWeek + modificacionStats.olderThanWeek
        }
      };

    } catch (error) {
      console.error("❌ Error obteniendo estadísticas del historial:", error);
      throw error;
    }
  }

  /**
   * Verifica el estado de los índices TTL
   */
  static async checkTTLIndexes() {
    try {
      const models = [
        { name: "HistorialCarga", model: HistorialCargaModel },
        { name: "HistorialDescarga", model: HistorialDescargaModel },
        { name: "HistorialModificacion", model: HistorialModificacionModel }
      ];

      const indexStatus = [];

      for (const { name, model } of models) {
        const indexes = await model.collection.listIndexes().toArray();
        const ttlIndex = indexes.find(index => 
          index.expireAfterSeconds !== undefined && 
          index.key.fechaYHora === 1
        );

        indexStatus.push({
          collection: name,
          hasTTL: !!ttlIndex,
          ttlSeconds: ttlIndex?.expireAfterSeconds,
          ttlDays: ttlIndex ? Math.round(ttlIndex.expireAfterSeconds / 86400) : null
        });
      }

      return indexStatus;

    } catch (error) {
      console.error("❌ Error verificando índices TTL:", error);
      throw error;
    }
  }
}
