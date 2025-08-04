import { FastifyInstance } from "fastify";

export default async function testRoutes(fastify: FastifyInstance) {
  // Ruta de prueba para verificar que el sistema funciona
  fastify.get("/test", async (request, reply) => {
    return {
      message: "Sistema funcionando correctamente",
      timestamp: new Date().toISOString(),
      status: "ok",
    };
  });

  // Ruta de prueba para verificar la conexión a la base de datos
  fastify.get("/test/db", async (request, reply) => {
    try {
      const { PersonaComunidadModel } = await import(
        "@/models/PersonaComunidad"
      );
      const count = await PersonaComunidadModel.countDocuments();

      return {
        status: "ok",
        message: "Conexión a base de datos exitosa",
        totalPersonas: count,
      };
    } catch (error: any) {
      return reply.code(500).send({
        status: "error",
        message: "Error de conexión a base de datos",
        error: error.message,
      });
    }
  });
}
