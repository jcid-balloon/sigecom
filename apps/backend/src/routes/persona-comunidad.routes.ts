import { FastifyInstance } from "fastify";
import { personaComunidadController } from "@/controllers/persona-comunidad.controller";
import { authenticate } from "@/middlewares/auth";

export default async function personaComunidadConHistorialRoutes(
  fastify: FastifyInstance
) {
  // Rutas para carga masiva
  fastify.post("/upload-excel", {
    preHandler: [authenticate],
    handler: personaComunidadController.cargarExcel,
  });

  fastify.post("/upload-csv", {
    preHandler: [authenticate],
    handler: personaComunidadController.cargarCSV,
  });

  // Estado del trabajo de carga
  fastify.get("/job/:jobId", {
    preHandler: [authenticate],
    handler: personaComunidadController.obtenerEstadoTrabajo,
  });

  // CRUD con historial
  fastify.post("/", {
    preHandler: [authenticate],
    handler: personaComunidadController.crear,
  });

  fastify.get("/", {
    preHandler: [authenticate],
    handler: personaComunidadController.obtenerTodos,
  });

  fastify.get("/:id", {
    preHandler: [authenticate],
    handler: personaComunidadController.obtenerPorId,
  });

  fastify.put("/:id", {
    preHandler: [authenticate],
    handler: personaComunidadController.actualizar,
  });

  fastify.delete("/:id", {
    preHandler: [authenticate],
    handler: personaComunidadController.eliminar,
  });

  // Registrar historial de descarga
  fastify.post("/registrar-descarga", {
    preHandler: [authenticate],
    handler: personaComunidadController.registrarDescarga,
  });
}
