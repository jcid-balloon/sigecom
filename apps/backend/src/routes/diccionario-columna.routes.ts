import { FastifyInstance } from "fastify";
import {
  getColumnas,
  getColumnasParaFrontend,
  getColumnaById,
  createColumna,
  updateColumna,
  deleteColumna,
} from "@/controllers/diccionario-columna.controller";
import { authenticate, checkRole, ROLES } from "@/middlewares/auth";

export default async function diccionarioColumnaRoutes(app: FastifyInstance) {
  // Rutas para el diccionario de columnas
  app.get("/", { preHandler: [authenticate] }, getColumnas);
  app.get("/frontend", { preHandler: [authenticate] }, getColumnasParaFrontend);
  app.get("/:id", { preHandler: [authenticate] }, getColumnaById);

  // Rutas que requieren rol de administrador para crear y eliminar
  app.post(
    "/",
    {
      preHandler: [authenticate, checkRole([ROLES.ADMIN])],
    },
    createColumna
  );

  // Rutas que requieren rol de administrador o editor para editar
  app.put(
    "/:id",
    {
      preHandler: [authenticate, checkRole([ROLES.ADMIN, ROLES.EDITOR])],
    },
    updateColumna
  );

  app.delete(
    "/:id",
    {
      preHandler: [authenticate, checkRole([ROLES.ADMIN])],
    },
    deleteColumna
  );
}
