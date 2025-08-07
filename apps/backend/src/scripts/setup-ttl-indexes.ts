import mongoose from "mongoose";
import { HistorialCargaModel } from "../models/historial/HistorialCarga";
import { HistorialDescargaModel } from "../models/historial/HistorialDescarga";
import { HistorialModificacionModel } from "../models/historial/HistorialModificacion";

/**
 * Script para configurar índices TTL en las colecciones de historial
 * Los documentos se eliminarán automáticamente después de 7 días
 */
async function setupTTLIndexes() {
  try {
    console.log("🔄 Configurando índices TTL para historial...");

    // Conectar a la base de datos
    const mongoUri = process.env.MONGO_URI!;
    await mongoose.connect(mongoUri);
    console.log("Conectado a MongoDB");

    // Configurar TTL para HistorialCarga
    console.log("Configurando TTL para HistorialCarga...");
    await HistorialCargaModel.collection.createIndex(
      { fechaYHora: 1 },
      { expireAfterSeconds: 604800 } // 7 días
    );

    // Configurar TTL para HistorialDescarga
    console.log("Configurando TTL para HistorialDescarga...");
    await HistorialDescargaModel.collection.createIndex(
      { fechaYHora: 1 },
      { expireAfterSeconds: 604800 } // 7 días
    );

    // Configurar TTL para HistorialModificacion
    console.log("Configurando TTL para HistorialModificacion...");
    await HistorialModificacionModel.collection.createIndex(
      { fechaYHora: 1 },
      { expireAfterSeconds: 604800 } // 7 días
    );

    console.log("Índices TTL configurados correctamente");
    console.log("Los documentos de historial se eliminarán automáticamente después de 7 días");

    // Verificar índices creados
    console.log("Índices actuales:");
    const collections = [
      { name: "HistorialCarga", model: HistorialCargaModel },
      { name: "HistorialDescarga", model: HistorialDescargaModel },
      { name: "HistorialModificacion", model: HistorialModificacionModel },
    ];

    for (const collection of collections) {
      const indexes = await collection.model.collection.listIndexes().toArray();
      console.log(`${collection.name}:`);
      indexes.forEach((index) => {
        console.log(`  - ${JSON.stringify(index.key)}`);
        if (index.expireAfterSeconds) {
          console.log(`    TTL: ${index.expireAfterSeconds} segundos (${index.expireAfterSeconds / 86400} días)`);
        }
      });
    }

  } catch (error) {
    console.error("Error configurando índices TTL:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
  }
}

// Ejecucion individual
if (require.main === module) {
  setupTTLIndexes().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error("Error ejecutando script:", error);
    process.exit(1);
  });
}

export { setupTTLIndexes };
