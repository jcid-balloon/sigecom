import { FastifyRequest, FastifyReply } from "fastify";

// Middleware para verificar autenticación
export const authenticate = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: "No autorizado" });
  }
};

// Middleware para verificar roles
export const checkRole = (roles: string[]) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Primero verificamos que el usuario esté autenticado
      await req.jwtVerify();

      // Verificamos si el rol del usuario está en la lista de roles permitidos
      const user = req.user as { rol: string };
      if (!roles.includes(user.rol)) {
        return reply.code(403).send({ error: "Acceso denegado" });
      }
    } catch (err) {
      return reply.code(401).send({ error: "No autorizado" });
    }
  };
};

// Roles predefinidos
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};
