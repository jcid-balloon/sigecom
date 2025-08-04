import { FastifyRequest, FastifyReply } from "fastify";
import { HistorialCargaModel } from "@/models/historial/HistorialCarga";
import { HistorialDescargaModel } from "@/models/historial/HistorialDescarga";
import { HistorialModificacionModel } from "@/models/historial/HistorialModificacion";

//  HISTORIAL DE CARGA 

export const getHistorialesCarga = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as {
      estado?: string;
      limit?: number;
      offset?: number;
    };

    const filtros: any = {};
    if (query.estado) filtros.estado = query.estado;

    const limit = query.limit ? parseInt(String(query.limit)) : 50;
    const offset = query.offset ? parseInt(String(query.offset)) : 0;

    const historiales = await HistorialCargaModel.find(filtros)
      .populate("usuario", "nombre email")
      .sort({ fechaYHora: -1 })
      .limit(limit)
      .skip(offset);

    const total = await HistorialCargaModel.countDocuments(filtros);

    return reply.send({
      success: true,
      data: historiales,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener historiales de carga",
      detail: err.message,
    });
  }
};

export const getHistorialCargaById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params as { id: string };
    const historial = await HistorialCargaModel.findById(id).populate(
      "usuario",
      "nombre email"
    );

    if (!historial) {
      return reply
        .code(404)
        .send({ error: "Historial de carga no encontrado" });
    }

    return reply.send({
      success: true,
      data: historial,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener historial de carga",
      detail: err.message,
    });
  }
};

//  HISTORIAL DE MODIFICACIÓN 

export const getHistorialesModificacion = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as {
      tipoModificacion?: string;
      documentoModificado?: string;
      limit?: number;
      offset?: number;
    };

    const filtros: any = {};
    if (query.tipoModificacion)
      filtros.tipoModificacion = query.tipoModificacion;
    if (query.documentoModificado)
      filtros.documentoModificado = query.documentoModificado;

    const limit = query.limit ? parseInt(String(query.limit)) : 50;
    const offset = query.offset ? parseInt(String(query.offset)) : 0;

    const historiales = await HistorialModificacionModel.find(filtros)
      .populate("usuario", "nombre email")
      .populate("documentoModificado", "rut nombre apellido")
      .sort({ fechaYHora: -1 })
      .limit(limit)
      .skip(offset);

    const total = await HistorialModificacionModel.countDocuments(filtros);

    return reply.send({
      success: true,
      data: historiales,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener historiales de modificación",
      detail: err.message,
    });
  }
};

export const getHistorialModificacionById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params as { id: string };
    const historial = await HistorialModificacionModel.findById(id)
      .populate("usuario", "nombre email")
      .populate("documentoModificado", "rut nombre apellido");

    if (!historial) {
      return reply
        .code(404)
        .send({ error: "Historial de modificación no encontrado" });
    }

    return reply.send({
      success: true,
      data: historial,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener historial de modificación",
      detail: err.message,
    });
  }
};

//  HISTORIAL DE DESCARGA 

export const getHistorialesDescarga = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as {
      formato?: string;
      limit?: number;
      offset?: number;
    };

    const filtros: any = {};
    if (query.formato) filtros.formato = query.formato;

    const limit = query.limit ? parseInt(String(query.limit)) : 50;
    const offset = query.offset ? parseInt(String(query.offset)) : 0;

    const historiales = await HistorialDescargaModel.find(filtros)
      .populate("usuario", "nombre email")
      .sort({ fechaYHora: -1 })
      .limit(limit)
      .skip(offset);

    const total = await HistorialDescargaModel.countDocuments(filtros);

    return reply.send({
      success: true,
      data: historiales,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener historiales de descarga",
      detail: err.message,
    });
  }
};

export const getHistorialDescargaById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params as { id: string };
    const historial = await HistorialDescargaModel.findById(id).populate(
      "usuario",
      "nombre email"
    );

    if (!historial) {
      return reply
        .code(404)
        .send({ error: "Historial de descarga no encontrado" });
    }

    return reply.send({
      success: true,
      data: historial,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener historial de descarga",
      detail: err.message,
    });
  }
};

//  HISTORIAL COMPLETO 

export const getHistorialCompleto = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = req.query as {
      tipo?: "carga" | "modificacion" | "descarga";
      estado?: string;
      limit?: number;
      limite?: number;
      offset?: number;
      fechaDesde?: string;
      fechaHasta?: string;
    };

    const limite =
      query.limit || query.limite
        ? parseInt(String(query.limit || query.limite))
        : 50;
    const offset = query.offset ? parseInt(String(query.offset)) : 0;

    let historialCompleto: any[] = [];

    // Preparar filtros de fecha si existen
    const filtrosFecha: any = {};
    if (query.fechaDesde || query.fechaHasta) {
      filtrosFecha.fechaYHora = {};
      if (query.fechaDesde) {
        filtrosFecha.fechaYHora.$gte = new Date(query.fechaDesde);
      }
      if (query.fechaHasta) {
        filtrosFecha.fechaYHora.$lte = new Date(query.fechaHasta);
      }
    }

    // Si no se especifica tipo, obtener todos
    if (!query.tipo || query.tipo === "carga") {
      const filtrosCarga: any = { ...filtrosFecha };
      if (query.estado) filtrosCarga.estado = query.estado;

      const historialesCarga = await HistorialCargaModel.find(filtrosCarga)
        .populate("usuario", "nombre email")
        .sort({ fechaYHora: -1 })
        .limit(limite)
        .skip(offset)
        .lean();

      historialCompleto.push(
        ...historialesCarga.map((h) => ({ ...h, tipoHistorial: "carga" }))
      );
    }

    if (!query.tipo || query.tipo === "modificacion") {
      const filtrosModificacion: any = { ...filtrosFecha };

      const historialesModificacion = await HistorialModificacionModel.find(
        filtrosModificacion
      )
        .populate("usuario", "nombre email")
        .populate("documentoModificado", "rut nombre apellido")
        .sort({ fechaYHora: -1 })
        .limit(limite)
        .skip(offset)
        .lean();

      historialCompleto.push(
        ...historialesModificacion.map((h) => ({
          ...h,
          tipoHistorial: "modificacion",
        }))
      );
    }

    if (!query.tipo || query.tipo === "descarga") {
      const filtrosDescarga: any = { ...filtrosFecha };
      if (query.estado) filtrosDescarga.estado = query.estado;

      const historialesDescarga = await HistorialDescargaModel.find(
        filtrosDescarga
      )
        .populate("usuario", "nombre email")
        .sort({ fechaYHora: -1 })
        .limit(limite)
        .skip(offset)
        .lean();

      historialCompleto.push(
        ...historialesDescarga.map((h) => ({ ...h, tipoHistorial: "descarga" }))
      );
    }

    // Ordenar por fecha más reciente
    historialCompleto.sort(
      (a, b) =>
        new Date(b.fechaYHora).getTime() - new Date(a.fechaYHora).getTime()
    );

    // Aplicar límite final
    historialCompleto = historialCompleto.slice(0, limite);

    console.log(
      `Historial completo obtenido: ${historialCompleto.length} registros`
    );

    return reply.send({
      success: true,
      data: historialCompleto,
      pagination: {
        limit: limite,
        offset: offset,
        total: historialCompleto.length,
      },
    });
  } catch (error) {
    console.error("Error al obtener historial completo:", error);
    return reply.code(500).send({
      success: false,
      error: "Error interno del servidor al obtener el historial completo",
    });
  }
};

//  ESTADÍSTICAS 

export const getEstadisticasHistorial = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const [
      totalCargas,
      cargasCompletadas,
      cargasFallidas,
      totalModificaciones,
      totalDescargas,
      descargasCompletadas,
    ] = await Promise.all([
      HistorialCargaModel.countDocuments({}),
      HistorialCargaModel.countDocuments({ estado: "completado" }),
      HistorialCargaModel.countDocuments({ estado: "fallido" }),
      HistorialModificacionModel.countDocuments({}),
      HistorialDescargaModel.countDocuments({}),
      HistorialDescargaModel.countDocuments({ estado: "completado" }),
    ]);

    const estadisticas = {
      cargas: {
        total: totalCargas,
        completadas: cargasCompletadas,
        fallidas: cargasFallidas,
        enProceso: totalCargas - cargasCompletadas - cargasFallidas,
      },
      modificaciones: {
        total: totalModificaciones,
      },
      descargas: {
        total: totalDescargas,
        completadas: descargasCompletadas,
      },
    };

    return reply.send({
      success: true,
      data: estadisticas,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return reply.code(500).send({
      success: false,
      error: "Error interno del servidor al obtener estadísticas",
    });
  }
};
