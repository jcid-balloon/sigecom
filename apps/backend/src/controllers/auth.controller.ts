import { FastifyRequest, FastifyReply } from "fastify";
import { UsuarioModel } from "@/models/Usuario";
import bcrypt from "bcrypt";

interface LoginRequest extends FastifyRequest {
  body: {
    email: string;
    password: string;
  };
}

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // Buscar usuario por email
    const user = await UsuarioModel.findOne({ email });
    if (!user) {
      return reply.code(401).send({ error: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return reply.code(401).send({ error: "Credenciales inválidas" });
    }

    // Actualizar último acceso
    await UsuarioModel.findByIdAndUpdate(user._id, {
      ultimoAcceso: new Date(),
    });

    // Generar token JWT
    const token = await reply.jwtSign(
      {
        id: user._id.toString(),
        email: user.email,
        rol: user.rol,
      },
      { expiresIn: "1d" }
    );

    return reply.code(200).send({
      token,
      user: {
        _id: user._id.toString(),
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        fechaCreacion: user.fechaCreacion,
        ultimoAcceso: new Date(), // Reflejar la actualización que acabamos de hacer
      },
    });
  } catch (err) {
    return reply.code(500).send({ error: "Error en el servidor", detail: err });
  }
};

export const register = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userData = req.body as any;

    // Verificar si el usuario ya existe
    const existingUser = await UsuarioModel.findOne({ email: userData.email });
    if (existingUser) {
      return reply.code(400).send({ error: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    // Crear nuevo usuario
    const newUser = new UsuarioModel({
      nombre: userData.nombre,
      email: userData.email,
      passwordHash,
      rol: userData.rol || "editor", // Rol por defecto si no se especifica
    });

    await newUser.save();

    // Generar token JWT
    const token = await reply.jwtSign(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        rol: newUser.rol,
      },
      { expiresIn: "1d" }
    );

    return reply.code(201).send({
      token,
      user: {
        _id: newUser._id.toString(),
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        fechaCreacion: newUser.fechaCreacion,
        ultimoAcceso: newUser.ultimoAcceso,
      },
    });
  } catch (err) {
    return reply
      .code(400)
      .send({ error: "Error al registrar usuario", detail: err });
  }
};

export const getCurrentUser = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const user = await UsuarioModel.findById((req.user as { id: string }).id);
    if (!user) {
      return reply.code(404).send({ error: "Usuario no encontrado" });
    }

    return reply.code(200).send({
      user: {
        _id: user._id.toString(),
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        fechaCreacion: user.fechaCreacion,
        ultimoAcceso: user.ultimoAcceso,
      },
    });
  } catch (err) {
    return reply.code(500).send({ error: "Error en el servidor", detail: err });
  }
};
