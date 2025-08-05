import { FastifyRequest, FastifyReply } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import { PersonaComunidadService } from "@/services/PersonaComunidadService";
import path from "path";
import fs from "fs";

// Crear nueva persona
const crear = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = req.body as {
      datosAdicionales: Record<string, string>;
    };
    const userId = (req.user as { id: string }).id;

    const persona = await PersonaComunidadService.crearPersona(data, userId);

    return reply.code(201).send({
      success: true,
      message: "Persona creada exitosamente",
      data: persona,
    });
  } catch (err: any) {
    return reply.code(400).send({
      error: "Error al crear persona",
      detail: err.message,
    });
  }
};

// Obtener todas las personas
const obtenerTodos = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const filtros = req.query as any;
    const personas = await PersonaComunidadService.obtenerPersonas(filtros);

    return reply.send({
      success: true,
      data: personas,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener personas",
      detail: err.message,
    });
  }
};

// Obtener persona por ID
const obtenerPorId = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const persona = await PersonaComunidadService.obtenerPersonaPorId(id);

    if (!persona) {
      return reply.code(404).send({
        error: "Persona no encontrada",
      });
    }

    return reply.send({
      success: true,
      data: persona,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener persona",
      detail: err.message,
    });
  }
};

// Actualizar
const actualizar = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const data = req.body as {
      datosAdicionales: Record<string, string>;
    };
    const userId = (req.user as { id: string }).id;

    const persona = await PersonaComunidadService.actualizarPersona(
      id,
      data,
      userId
    );

    return reply.send({
      success: true,
      message: "Persona actualizada exitosamente",
      data: persona, // Ahora persona ya tiene la estructura correcta directamente
    });
  } catch (err: any) {
    return reply.code(400).send({
      error: "Error al actualizar persona",
      detail: err.message,
    });
  }
};

// Eliminar persona
const eliminar = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req.user as { id: string }).id;

    await PersonaComunidadService.eliminarPersona(id, userId);

    return reply.send({
      success: true,
      message: "Persona eliminada exitosamente",
    });
  } catch (err: any) {
    return reply.code(400).send({
      error: "Error al eliminar persona",
      detail: err.message,
    });
  }
};

// Cargar archivo Excel
const cargarExcel = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await req.file();
    if (!data) {
      return reply.code(400).send({
        error: "No se encontró archivo",
      });
    }

    const userId = (req.user as { id: string }).id;
    const buffer = await data.toBuffer();

    const resultado = await PersonaComunidadService.procesarArchivoExcel(
      buffer,
      data.filename,
      userId
    );

    return reply.send({
      success: true,
      message: "Archivo Excel cargado exitosamente",
      jobId: resultado.jobId,
      totalRegistros: resultado.totalRegistros,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al cargar archivo Excel",
      detail: err.message,
    });
  }
};

// Cargar archivo CSV
const cargarCSV = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await req.file();
    if (!data) {
      return reply.code(400).send({
        error: "No se encontró archivo",
      });
    }

    const userId = (req.user as { id: string }).id;
    const buffer = await data.toBuffer();

    const resultado = await PersonaComunidadService.procesarArchivoCSV(
      buffer,
      data.filename,
      userId
    );

    return reply.send({
      success: true,
      message: "Archivo CSV cargado exitosamente",
      jobId: resultado.jobId,
      totalRegistros: resultado.totalRegistros,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al cargar archivo CSV",
      detail: err.message,
    });
  }
};

// Obtener estado del trabajo
const obtenerEstadoTrabajo = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { jobId } = req.params as { jobId: string };

    const estado = await PersonaComunidadService.obtenerEstadoTrabajo(jobId);

    if (!estado) {
      return reply.code(404).send({
        error: "Trabajo no encontrado",
      });
    }

    return reply.send({
      success: true,
      data: estado,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al obtener estado del trabajo",
      detail: err.message,
    });
  }
};

// Registrar descarga (solo historial, sin generar archivos)
const registrarDescarga = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { formato, cantidadRegistros, filtros } = req.body as {
      formato: "CSV" | "Excel" | "PDF";
      cantidadRegistros: number;
      filtros?: any;
    };
    const userId = (req.user as { id: string }).id;

    // Solo crear historial, sin generar archivos
    const nombreArchivo = `export_${Date.now()}.${formato.toLowerCase()}`;
    await PersonaComunidadService.registrarHistorialDescarga(
      userId,
      formato,
      cantidadRegistros,
      filtros || {},
      nombreArchivo
    );

    return reply.send({
      success: true,
      message: `Descarga registrada: ${cantidadRegistros} registros en formato ${formato}`,
    });
  } catch (err: any) {
    return reply.code(500).send({
      error: "Error al registrar descarga",
      detail: err.message,
    });
  }
};

// Exportar como objeto
export const personaComunidadController = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
  cargarExcel,
  cargarCSV,
  obtenerEstadoTrabajo,
  registrarDescarga,
};
