import { FastifyInstance } from "fastify";
import {
  getHistorialesCarga,
  getHistorialCargaById,
  getHistorialesDescarga,
  getHistorialDescargaById,
  getHistorialesModificacion,
  getHistorialModificacionById,
  getHistorialCompleto,
  getEstadisticasHistorial,
} from "@/controllers/historial.controller";
import { authenticate, checkRole, ROLES } from "@/middlewares/auth";

export default async function historialRoutes(app: FastifyInstance) {
  // Rutas para Historial de Carga
  app.get("/carga", { preHandler: [authenticate] }, getHistorialesCarga);
  app.get("/carga/:id", { preHandler: [authenticate] }, getHistorialCargaById);

  // Rutas para Historial de Descarga
  app.get("/descarga", { preHandler: [authenticate] }, getHistorialesDescarga);
  app.get(
    "/descarga/:id",
    { preHandler: [authenticate] },
    getHistorialDescargaById
  );

  // Rutas para Historial de Modificación
  app.get(
    "/modificacion",
    { preHandler: [authenticate] },
    getHistorialesModificacion
  );
  app.get(
    "/modificacion/:id",
    { preHandler: [authenticate] },
    getHistorialModificacionById
  );

  // Rutas adicionales
  app.get("/completo", { preHandler: [authenticate] }, getHistorialCompleto);
  app.get(
    "/estadisticas",
    { preHandler: [authenticate] },
    getEstadisticasHistorial
  );
}
