import { FastifyRequest, FastifyReply } from "fastify";
import { UsuarioModel } from "@/models/Usuario";
import bcrypt from "bcrypt";

export const getUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await UsuarioModel.find().select("-passwordHash");
    return reply.send(users);
  } catch (err) {
    return reply
      .code(500)
      .send({ error: "Error al obtener usuarios", detail: err });
  }
};

export const createUser = async (req: FastifyRequest, reply: FastifyReply) => {
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

    // Excluir passwordHash de la respuesta
    const userResponse = {
      _id: newUser._id.toString(),
      nombre: newUser.nombre,
      email: newUser.email,
      rol: newUser.rol,
      fechaCreacion: newUser.fechaCreacion,
      ultimoAcceso: newUser.ultimoAcceso,
    };

    return reply.code(201).send(userResponse);
  } catch (err) {
    return reply
      .code(400)
      .send({ error: "Error al crear usuario", detail: err });
  }
};

export const getUserById = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const user = await UsuarioModel.findById(id).select("-passwordHash");

    if (!user) {
      return reply.code(404).send({ error: "Usuario no encontrado" });
    }

    return reply.send(user);
  } catch (err) {
    return reply
      .code(500)
      .send({ error: "Error al obtener usuario", detail: err });
  }
};

export const updateUser = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const userData = req.body as any;
    const updateData: any = {};

    // Campos que se pueden actualizar
    if (userData.nombre) updateData.nombre = userData.nombre;
    if (userData.email) updateData.email = userData.email;
    if (userData.rol) updateData.rol = userData.rol;

    // Si se proporciona una nueva contraseña, hashearla
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(userData.password, salt);
    }

    const updatedUser = await UsuarioModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-passwordHash");

    if (!updatedUser) {
      return reply.code(404).send({ error: "Usuario no encontrado" });
    }

    return reply.send(updatedUser);
  } catch (err) {
    return reply
      .code(400)
      .send({ error: "Error al actualizar usuario", detail: err });
  }
};

export const deleteUser = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const deletedUser = await UsuarioModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return reply.code(404).send({ error: "Usuario no encontrado" });
    }

    return reply.code(200).send({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    return reply
      .code(500)
      .send({ error: "Error al eliminar usuario", detail: err });
  }
};

export const changePassword = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params as { id: string };
    const { password } = req.body as { password: string };

    if (!password) {
      return reply.code(400).send({ error: "La contraseña es requerida" });
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const updatedUser = await UsuarioModel.findByIdAndUpdate(
      id,
      { passwordHash },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return reply.code(404).send({ error: "Usuario no encontrado" });
    }

    return reply
      .code(200)
      .send({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    return reply
      .code(500)
      .send({ error: "Error al cambiar contraseña", detail: err });
  }
};
