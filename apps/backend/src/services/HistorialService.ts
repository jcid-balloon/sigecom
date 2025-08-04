import mongoose from "mongoose";
import { HistorialCargaModel } from "@/models/historial/HistorialCarga";
import { HistorialModificacionModel } from "@/models/historial/HistorialModificacion";
import { HistorialDescargaModel } from "@/models/historial/HistorialDescarga";

export class HistorialService {
  /**
   * Generar contexto operacional a partir de los datos de una persona
   */
  static generarContextoOperacion(
    datosAdicionales: Record<string, string> | undefined
  ): string {
    if (!datosAdicionales) return "";

    const partes: string[] = [];

    // Priorizar campos más importantes
    if (datosAdicionales.rut) {
      partes.push(`RUT: ${datosAdicionales.rut}`);
    }

    if (datosAdicionales.nombre) {
      partes.push(`Nombre: ${datosAdicionales.nombre}`);
    }

    if (datosAdicionales.apellido) {
      partes.push(`Apellido: ${datosAdicionales.apellido}`);
    }

    // Agregar otros campos relevantes si no están los principales
    if (partes.length === 0) {
      // Tomar los primeros campos disponibles
      Object.entries(datosAdicionales)
        .slice(0, 2)
        .forEach(([campo, valor]) => {
          if (valor) partes.push(`${campo}: ${valor}`);
        });
    }

    return partes.join(", ");
  }

  /**
   * Crear historial de carga inicial (estado: procesando)
   */
  static async crearHistorialCarga(
    userId: string,
    nombreArchivo: string,
    jobId?: string,
    session?: mongoose.ClientSession
  ) {
    const historial = new HistorialCargaModel({
      usuario: userId,
      fechaYHora: new Date(),
      nombreArchivo,
      estado: "procesando",
      cantidadRegistros: 0,
      jobId,
    });

    if (session) {
      return await historial.save({ session });
    } else {
      return await historial.save();
    }
  }

  /**
   * Actualizar historial de carga cuando termine el procesamiento
   */
  static async actualizarHistorialCarga(
    historialId: string,
    cantidadRegistros: number,
    estado: "completado" | "fallido",
    errorMessage?: string,
    session?: mongoose.ClientSession
  ) {
    const updateData: any = {
      cantidadRegistros,
      estado,
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    if (session) {
      return await HistorialCargaModel.findByIdAndUpdate(
        historialId,
        updateData,
        { new: true, session }
      );
    } else {
      return await HistorialCargaModel.findByIdAndUpdate(
        historialId,
        updateData,
        { new: true }
      );
    }
  }

  /**
   * Crear historial de modificación individual consolidado
   */
  static async crearHistorialModificacionIndividual(
    userId: string,
    documentoModificadoId: string,
    tipoOperacion: "creacion" | "modificacion" | "eliminacion",
    resumenCambios: string,
    camposModificados?: Array<{
      campo: string;
      valorAnterior: string;
      valorNuevo: string;
    }>,
    contextoOperacion?: string,
    session?: mongoose.ClientSession
  ) {
    const historial = new HistorialModificacionModel({
      usuario: userId,
      fechaYHora: new Date(),
      documentoModificado: documentoModificadoId,
      resumenCambios,
      contextoOperacion,
      tipoModificacion: tipoOperacion,
      camposModificados: camposModificados || [],
    });

    if (session) {
      return await historial.save({ session });
    } else {
      return await historial.save();
    }
  }

  /**
   * Crear historial de modificación masiva (para cargas)
   */
  static async crearHistorialModificacionMasiva(
    userId: string,
    estadisticas: {
      elementosCreados?: number;
      elementosModificados?: number;
      elementosEliminados?: number;
      totalProcesados?: number;
      errores?: number;
    },
    referenciaOperacion: string,
    session?: mongoose.ClientSession
  ) {
    const totalProcesados =
      estadisticas.totalProcesados ||
      (estadisticas.elementosCreados || 0) +
        (estadisticas.elementosModificados || 0) +
        (estadisticas.elementosEliminados || 0);

    let resumen = `Operación masiva: ${totalProcesados} registros procesados`;
    if (estadisticas.elementosCreados)
      resumen += `, ${estadisticas.elementosCreados} creados`;
    if (estadisticas.elementosModificados)
      resumen += `, ${estadisticas.elementosModificados} modificados`;
    if (estadisticas.elementosEliminados)
      resumen += `, ${estadisticas.elementosEliminados} eliminados`;
    if (estadisticas.errores) resumen += `, ${estadisticas.errores} errores`;

    const historial = new HistorialModificacionModel({
      usuario: userId,
      fechaYHora: new Date(),
      resumenCambios: resumen,
      tipoModificacion: "masiva",
      referenciaOperacion,
      estadisticas,
    });

    if (session) {
      return await historial.save({ session });
    } else {
      return await historial.save();
    }
  }

  /**
   * Crear historial de descarga
   */
  static async crearHistorialDescarga(
    userId: string,
    formato: "CSV" | "Excel" | "PDF",
    cantidadRegistros: number,
    filtrosAplicados?: any,
    nombreArchivo?: string,
    session?: mongoose.ClientSession
  ) {
    const historial = new HistorialDescargaModel({
      usuario: userId,
      fechaYHora: new Date(),
      formato,
      cantidadRegistros,
      filtrosAplicados: filtrosAplicados
        ? JSON.stringify(filtrosAplicados)
        : undefined,
      nombreArchivo,
    });

    if (session) {
      return await historial.save({ session });
    } else {
      return await historial.save();
    }
  }

  /**
   * Crear múltiples historiales de modificación individual (para updates masivos)
   */
  static async crearHistorialesModificacionMultiples(
    userId: string,
    cambios: Array<{
      documentoId: string;
      campo: string;
      valorAnterior: string;
      valorNuevo: string;
    }>,
    session?: mongoose.ClientSession
  ) {
    // Agrupar cambios por documento
    const cambiosPorDocumento = new Map<
      string,
      Array<{
        campo: string;
        valorAnterior: string;
        valorNuevo: string;
      }>
    >();

    cambios.forEach((cambio) => {
      if (!cambiosPorDocumento.has(cambio.documentoId)) {
        cambiosPorDocumento.set(cambio.documentoId, []);
      }
      cambiosPorDocumento.get(cambio.documentoId)!.push({
        campo: cambio.campo,
        valorAnterior: cambio.valorAnterior,
        valorNuevo: cambio.valorNuevo,
      });
    });

    // Crear un historial por documento modificado
    const historiales = Array.from(cambiosPorDocumento.entries()).map(
      ([documentoId, camposModificados]) => {
        const resumenCambios = `Modificados ${
          camposModificados.length
        } campos: ${camposModificados.map((c) => c.campo).join(", ")}`;

        // Generar contexto a partir de los valores nuevos de los campos
        const datosParaContexto: Record<string, string> = {};
        camposModificados.forEach((campo) => {
          datosParaContexto[campo.campo] = campo.valorNuevo;
        });
        const contextoOperacion =
          this.generarContextoOperacion(datosParaContexto);

        return new HistorialModificacionModel({
          usuario: userId,
          fechaYHora: new Date(),
          documentoModificado: documentoId,
          resumenCambios,
          contextoOperacion,
          tipoModificacion: "individual",
          camposModificados,
        });
      }
    );

    if (session) {
      return await HistorialModificacionModel.insertMany(historiales, {
        session,
      });
    } else {
      return await HistorialModificacionModel.insertMany(historiales);
    }
  }
}
