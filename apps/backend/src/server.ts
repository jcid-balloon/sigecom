import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import userRoutes from "@/routes/user.routes";
import authRoutes from "@/routes/auth.routes";
import historialRoutes from "@/routes/historial.routes";
import diccionarioColumnaRoutes from "@/routes/diccionario-columna.routes";
import personaComunidadRoutes from "@/routes/persona-comunidad.routes";
import personaComunidadConHistorialRoutes from "@/routes/persona-comunidad.routes";
import { personaComunidadTemporalRoutes } from "@/routes/persona-comunidad-temporal.routes";
import testRoutes from "@/routes/test.routes";

export function buildServer() {
  const app = Fastify({
    logger: true,
    bodyLimit: 50 * 1024 * 1024, // 50MB para archivos grandes
  });

  // Obtener orígenes CORS desde variables de entorno
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000", "http://localhost:5173"]; // valores por defecto

  // Registrar CORS, JWT y multipart
  app.register(cors, {
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
    ],
  });
  app.register(jwt, {
    secret: process.env.JWT_SECRET || "supersecret",
  });
  app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  // Registrar rutas
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(userRoutes, { prefix: "/api/users" });
  app.register(historialRoutes, { prefix: "/api/historiales" });
  app.register(diccionarioColumnaRoutes, {
    prefix: "/api/diccionario-columnas",
  });
  app.register(personaComunidadRoutes, { prefix: "/api/personas" });
  app.register(personaComunidadConHistorialRoutes, {
    prefix: "/api/personas-con-historial",
  });
  app.register(personaComunidadTemporalRoutes, { prefix: "/api" });
  app.register(testRoutes, { prefix: "/api/test" });

  // Ruta de prueba para verificar que el servidor está funcionando
  app.get("/", async () => {
    return { status: "ok" };
  });

  return app;
}
