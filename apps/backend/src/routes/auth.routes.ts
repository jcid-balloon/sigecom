import { FastifyInstance } from "fastify";
import { login, register, getCurrentUser } from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/login", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
      },
    },
    handler: login,
  });
  app.post("/register", register);
  app.get("/me", { preHandler: [authenticate] }, getCurrentUser);
}
