import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      rol: string;
      [key: string]: any;
    };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      rol: string;
      [key: string]: any;
    };
    user: {
      id: string;
      email: string;
      rol: string;
      [key: string]: any;
    };
  }
}
