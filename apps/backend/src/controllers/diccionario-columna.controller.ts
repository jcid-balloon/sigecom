import { FastifyRequest, FastifyReply } from "fastify";
import { DiccionarioColumnaModel } from "@/models/DiccionarioColumna";
import { PersonaComunidadModel } from "@/models/PersonaComunidad";
import { ValidacionService } from "@/services/ValidacionService";

export const getColumnas = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const columnas = await DiccionarioColumnaModel.find({});
    return reply.send({ success: true, data: columnas });
  } catch (err) {
    return reply
      .code(500)
      .send({
        success: false,
        error: "Error al obtener columnas",
        detail: err,
      });
  }
};

export const getColumnasParaFrontend = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const columnas = await ValidacionService.obtenerColumnasParaFrontend();
    return reply.send({ success: true, data: columnas });
  } catch (err) {
    return reply
      .code(500)
      .send({
        success: false,
        error: "Error al obtener columnas para frontend",
        detail: err,
      });
  }
};

export const getColumnaById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params as { id: string };
    const columna = await DiccionarioColumnaModel.findById(id);

    if (!columna) {
      return reply
        .code(404)
        .send({ success: false, error: "Columna no encontrada" });
    }

    return reply.send({ success: true, data: columna });
  } catch (err) {
    return reply
      .code(500)
      .send({ success: false, error: "Error al obtener columna", detail: err });
  }
};

export const createColumna = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Verificar que el usuario es admin
    const user = req.user as { rol: string };
    if (user.rol !== "admin") {
      return reply.code(403).send({
        success: false,
        error: "Solo los administradores pueden crear columnas",
      });
    }

    const data = req.body as any;

    // Normalizar el nombre a minúsculas
    const nombreNormalizado = data.nombre
      ? data.nombre.toLowerCase().trim()
      : "";

    // Verificar si ya existe una columna con el mismo nombre
    const existingColumna = await DiccionarioColumnaModel.findOne({
      nombre: nombreNormalizado,
    });
    if (existingColumna) {
      return reply
        .code(400)
        .send({
          success: false,
          error: "Ya existe una columna con ese nombre",
        });
    }

    const columna = new DiccionarioColumnaModel({
      nombre: nombreNormalizado,
      tipo: data.tipo || "texto",
      requerido: data.requerido || false,
      valorPorDefecto: data.valorPorDefecto,
      descripcion: data.descripcion,
      activo: data.activo !== undefined ? data.activo : true,
      expresionRegular: data.expresionRegular,
      longitudMaxima: data.longitudMaxima,
    });

    await columna.save();

    return reply.code(201).send({ success: true, data: columna });
  } catch (err) {
    return reply
      .code(400)
      .send({ success: false, error: "Error al crear columna", detail: err });
  }
};

export const updateColumna = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Verificar que el usuario es admin o editor
    const user = req.user as { rol: string };
    if (!["admin", "editor"].includes(user.rol)) {
      return reply.code(403).send({
        success: false,
        error: "Solo los administradores y editores pueden modificar columnas",
      });
    }

    const { id } = req.params as { id: string };
    const data = req.body as any;

    // Obtener la columna original para ver si cambió el nombre
    const columnaOriginal = await DiccionarioColumnaModel.findById(id);
    if (!columnaOriginal) {
      return reply
        .code(404)
        .send({ success: false, error: "Columna no encontrada" });
    }

    // Normalizar el nombre a minúsculas si se proporciona
    if (data.nombre) {
      data.nombre = data.nombre.toLowerCase().trim();
    }

    // Verificar si existe otra columna con el mismo nombre (excepto la actual)
    if (data.nombre) {
      const existingColumna = await DiccionarioColumnaModel.findOne({
        nombre: data.nombre,
        _id: { $ne: id },
      });

      if (existingColumna) {
        return reply
          .code(400)
          .send({
            success: false,
            error: "Ya existe otra columna con ese nombre",
          });
      }
    }

    // Actualizar la columna
    const columna = await DiccionarioColumnaModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!columna) {
      return reply
        .code(404)
        .send({ success: false, error: "Columna no encontrada" });
    }

    // Si cambió el nombre de la columna, actualizar todos los registros de PersonaComunidad
    if (data.nombre && columnaOriginal.nombre !== data.nombre) {
      console.log(
        `Actualizando registros: ${columnaOriginal.nombre} -> ${data.nombre}`
      );

      // Obtener todos los registros que tienen la columna con el nombre anterior
      const registrosConCampo = await PersonaComunidadModel.find({
        [`datosAdicionales.${columnaOriginal.nombre}`]: { $exists: true },
      });

      console.log(
        `Encontrados ${registrosConCampo.length} registros para actualizar`
      );

      // Actualizar cada registro
      for (const registro of registrosConCampo) {
        const valorAnterior =
          registro.datosAdicionales?.[columnaOriginal.nombre];

        if (valorAnterior !== undefined) {
          // Crear una copia de datosAdicionales
          const nuevosAdicionales = { ...registro.datosAdicionales };

          // Agregar el nuevo campo y eliminar el anterior
          nuevosAdicionales[data.nombre] = valorAnterior;
          delete nuevosAdicionales[columnaOriginal.nombre];

          // Actualizar el registro
          await PersonaComunidadModel.findByIdAndUpdate(registro._id, {
            datosAdicionales: nuevosAdicionales,
          });
        }
      }

      console.log(
        `Actualizados ${registrosConCampo.length} registros exitosamente`
      );
    }

    console.log("Columna actualizada:", columna);

    return reply.send({ success: true, data: columna });
  } catch (err) {
    return reply
      .code(400)
      .send({
        success: false,
        error: "Error al actualizar columna",
        detail: err,
      });
  }
};

export const deleteColumna = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Verificar que el usuario es admin
    const user = req.user as { rol: string };
    if (user.rol !== "admin") {
      return reply.code(403).send({
        success: false,
        error: "Solo los administradores pueden eliminar columnas",
      });
    }

    const { id } = req.params as { id: string };

    // Eliminar la columna directamente
    const columna = await DiccionarioColumnaModel.findByIdAndDelete(id);

    if (!columna) {
      return reply
        .code(404)
        .send({ success: false, error: "Columna no encontrada" });
    }

    return reply.code(200).send({
      success: true,
      message: "Columna eliminada correctamente",
    });
  } catch (err) {
    return reply
      .code(500)
      .send({
        success: false,
        error: "Error al eliminar columna",
        detail: err,
      });
  }
};
