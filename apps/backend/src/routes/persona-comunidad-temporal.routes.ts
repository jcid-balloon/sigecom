import { FastifyInstance, FastifyRequest } from "fastify";
import { PersonaComunidadTemporalService } from "../services/PersonaComunidadTemporalService";
import { authenticate } from "../middlewares/auth";

export async function personaComunidadTemporalRoutes(fastify: FastifyInstance) {
  // Procesar archivo para previsualización
  fastify.post("/personas-temporal/procesar", async (request, reply) => {
    try {
      const { datosArchivo, sesionCarga } = request.body as {
        datosArchivo: any[];
        sesionCarga?: string;
      };

      if (!datosArchivo || !Array.isArray(datosArchivo)) {
        return reply.status(400).send({
          success: false,
          message: "Datos del archivo requeridos",
        });
      }

      const resultado =
        await PersonaComunidadTemporalService.procesarDatosParaPreview(
          datosArchivo,
          sesionCarga
        );

      reply.send({
        success: true,
        data: resultado,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });

  // Obtener previsualización por sesión
  fastify.get("/personas-temporal/:sesionId", async (request, reply) => {
    try {
      const { sesionId } = request.params as { sesionId: string };

      const preview =
        await PersonaComunidadTemporalService.obtenerPreviewPorSesion(sesionId);

      reply.send({
        success: true,
        data: preview,
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });

  // Actualizar registro temporal
  fastify.put("/personas-temporal/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { datosAdicionales } = request.body as {
        datosAdicionales: Record<string, string>;
      };

      const registro =
        await PersonaComunidadTemporalService.actualizarRegistroTemporal(
          id,
          datosAdicionales
        );

      reply.send({
        success: true,
        data: {
          _id: registro._id?.toString(),
          datosAdicionales: Object.fromEntries(registro.datosAdicionales),
          datosAnteriores: registro.datosAnteriores
            ? Object.fromEntries(registro.datosAnteriores)
            : undefined,
          estado: registro.estado,
          errores: registro.errores,
          personaExistenteId: registro.personaExistenteId,
          numeroFila: registro.numeroFila,
        },
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });

  // Confirmar carga definitiva
  fastify.post(
    "/personas-temporal/:sesionId/confirmar",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const { sesionId } = request.params as { sesionId: string };
        const userId = (request as any).user.id;

        const resultado =
          await PersonaComunidadTemporalService.confirmarCargaDefinitiva(
            sesionId,
            userId
          );

        reply.send({
          success: true,
          data: resultado,
        });
      } catch (error: any) {
        reply.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Cancelar previsualización
  fastify.delete("/personas-temporal/:sesionId", async (request, reply) => {
    try {
      const { sesionId } = request.params as { sesionId: string };

      await PersonaComunidadTemporalService.cancelarPreview(sesionId);

      reply.send({
        success: true,
        message: "Previsualización cancelada",
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });

  // Eliminar registro temporal específico
  fastify.delete("/personas-temporal/registro/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      await PersonaComunidadTemporalService.eliminarRegistroTemporal(id);

      reply.send({
        success: true,
        message: "Registro eliminado",
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });
}
