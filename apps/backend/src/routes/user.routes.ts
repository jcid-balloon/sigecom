import { FastifyInstance } from "fastify";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
} from "@/controllers/user.controller";
import { authenticate, checkRole, ROLES } from "@/middlewares/auth";

export default async function userRoutes(app: FastifyInstance) {
  // Rutas que requieren autenticación y rol de administrador
  app.get(
    "/",
    { preHandler: [authenticate, checkRole([ROLES.ADMIN])] },
    getUsers
  );
  app.post(
    "/",
    { preHandler: [authenticate, checkRole([ROLES.ADMIN])] },
    createUser
  );
  app.get(
    "/:id",
    { preHandler: [authenticate, checkRole([ROLES.ADMIN, ROLES.EDITOR])] },
    getUserById
  );
  app.put(
    "/:id",
    { preHandler: [authenticate, checkRole([ROLES.ADMIN])] },
    updateUser
  );
  app.delete(
    "/:id",
    { preHandler: [authenticate, checkRole([ROLES.ADMIN])] },
    deleteUser
  );
  app.patch(
    "/:id/password",
    { preHandler: [authenticate, checkRole([ROLES.ADMIN])] },
    changePassword
  );
}
