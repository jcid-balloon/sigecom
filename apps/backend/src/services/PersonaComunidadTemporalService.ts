import {
  PersonaComunidadTemporalModel,
  PersonaComunidadTemporal,
  EstadoPreviewPersona,
} from "../models/PersonaComunidadTemporal";
import { PersonaComunidadModel } from "../models/PersonaComunidad";
import { ValidacionService } from "./ValidacionService";
import { DiccionarioColumnaModel } from "../models/DiccionarioColumna";
import { HistorialService } from "./HistorialService";
import { randomUUID } from "crypto";

export class PersonaComunidadTemporalService {
  /**
   * Procesar datos desde archivo para previsualización
   */
  static async procesarDatosParaPreview(
    datosArchivo: any[],
    sesionCarga?: string
  ): Promise<{
    sesionId: string;
    registrosProcesados: number;
    nuevos: number;
    actualizaciones: number;
    errores: number;
    sinCambios: number;
  }> {
    const sesionId = sesionCarga || randomUUID();

    // Limpiar sesión anterior si existe
    await PersonaComunidadTemporalModel.deleteMany({ sesionCarga: sesionId });

    // Obtener columnas del diccionario para validación
    const columnas = await DiccionarioColumnaModel.find({});
    const columnasMap = new Map(columnas.map((col) => [col.nombre, col]));

    let nuevos = 0;
    let actualizaciones = 0;
    let errores = 0;
    let sinCambios = 0;

    for (let i = 0; i < datosArchivo.length; i++) {
      const fila = datosArchivo[i];
      const numeroFila = i + 1;

      try {
        const registroTemporal = await this.procesarFilaParaPreview(
          fila,
          columnasMap,
          sesionId,
          numeroFila
        );

        switch (registroTemporal.estado) {
          case EstadoPreviewPersona.NUEVO:
            nuevos++;
            break;
          case EstadoPreviewPersona.ACTUALIZAR:
            actualizaciones++;
            break;
          case EstadoPreviewPersona.ERROR:
            errores++;
            break;
          case EstadoPreviewPersona.SIN_CAMBIOS:
            sinCambios++;
            break;
        }
      } catch (error) {
        console.error(`Error procesando fila ${numeroFila}:`, error);
        errores++;
      }
    }

    return {
      sesionId,
      registrosProcesados: datosArchivo.length,
      nuevos,
      actualizaciones,
      errores,
      sinCambios,
    };
  }

  /**
   * Procesar una fila individual para previsualización
   */
  private static async procesarFilaParaPreview(
    fila: any,
    columnasMap: Map<string, any>,
    sesionId: string,
    numeroFila: number
  ): Promise<PersonaComunidadTemporal> {
    const erroresValidacion: string[] = [];
    const datosAdicionales = new Map<string, string>();

    // Validar y procesar cada campo
    for (const [nombreCampo, valor] of Object.entries(fila)) {
      if (valor === null || valor === undefined) continue;

      const columna = columnasMap.get(nombreCampo);
      if (!columna) {
        erroresValidacion.push(
          `Campo '${nombreCampo}' no está definido en el diccionario`
        );
        continue;
      }

      // Siempre guardar el valor (incluso si tiene errores para poder corregirlo después)
      const valorString = String(valor).trim();
      
      // Aplicar formateo automático si es RUT
      const valorFormateado = ValidacionService.formatearValorSiEsRut(
        valorString,
        columna
      );
      
      datosAdicionales.set(nombreCampo, valorFormateado);

      // Validar el valor formateado
      try {
        const errorValidacion = ValidacionService.validarTipo(
          valorFormateado,
          columna
        );

        if (errorValidacion) {
          erroresValidacion.push(`${nombreCampo}: ${errorValidacion}`);
        }
      } catch (error) {
        erroresValidacion.push(
          `${nombreCampo}: Error de validación - ${error}`
        );
      }
    }

    // Verificar campos requeridos
    for (const columna of columnasMap.values()) {
      if (columna.requerido && !datosAdicionales.has(columna.nombre)) {
        erroresValidacion.push(
          `Campo requerido '${columna.nombre}' no está presente`
        );
      }
    }

    // Determinar si es nuevo, actualización o error
    let estado = EstadoPreviewPersona.NUEVO;
    let personaExistenteId: string | undefined;
    let datosAnteriores: Map<string, string> | undefined;

    if (erroresValidacion.length > 0) {
      estado = EstadoPreviewPersona.ERROR;
    } else {
      // Buscar si ya existe una persona con estos datos
      const personaExistente = await this.buscarPersonaExistente(
        datosAdicionales
      );
      if (personaExistente) {
        // Verificar si realmente hay cambios
        const hayCambios = this.haycambiosReales(
          datosAdicionales,
          personaExistente.datosAdicionales
        );

        if (hayCambios) {
          estado = EstadoPreviewPersona.ACTUALIZAR;
          personaExistenteId = personaExistente._id?.toString();
          // Guardar datos anteriores para comparación
          datosAnteriores = new Map(
            Object.entries(personaExistente.datosAdicionales)
          );
        } else {
          // No hay cambios, marcar como sin cambios
          estado = EstadoPreviewPersona.SIN_CAMBIOS;
          personaExistenteId = personaExistente._id?.toString();
          datosAnteriores = new Map(
            Object.entries(personaExistente.datosAdicionales)
          );
        }
      }
    }

    // Crear registro temporal
    const registroTemporal = new PersonaComunidadTemporalModel({
      datosAdicionales,
      datosAnteriores,
      estado,
      errores: erroresValidacion,
      personaExistenteId,
      sesionCarga: sesionId,
      numeroFila,
    });

    await registroTemporal.save();
    return registroTemporal;
  }

  /**
   * Buscar persona existente basada en criterios de unicidad
   */
  private static async buscarPersonaExistente(
    datosAdicionales: Map<string, string>
  ) {
    // Buscar por RUT si existe (criterio principal de unicidad)
    const rut = datosAdicionales.get("rut");
    if (rut) {
      return await PersonaComunidadModel.findOne({
        "datosAdicionales.rut": rut,
      });
    }

    // Si no hay RUT, buscar por combinación de nombre y apellido
    const nombre = datosAdicionales.get("nombre");
    const apellido = datosAdicionales.get("apellido");

    if (nombre && apellido) {
      return await PersonaComunidadModel.findOne({
        "datosAdicionales.nombre": nombre,
        "datosAdicionales.apellido": apellido,
      });
    }

    return null;
  }

  /**
   * Comparar si realmente hay cambios entre datos nuevos y existentes
   */
  private static haycambiosReales(
    datosNuevos: Map<string, string>,
    datosExistentes: Record<string, string>
  ): boolean {
    // Convertir Map a objeto para comparación
    const nuevosObj = Object.fromEntries(datosNuevos);

    // Verificar si hay campos nuevos o con valores diferentes
    for (const [campo, valorNuevo] of Object.entries(nuevosObj)) {
      const valorExistente = datosExistentes[campo] || "";
      if (valorNuevo.trim() !== valorExistente.trim()) {
        return true;
      }
    }

    // Verificar si hay campos que se eliminarían (existían pero no están en los nuevos)
    for (const [campo, valorExistente] of Object.entries(datosExistentes)) {
      if (!nuevosObj.hasOwnProperty(campo) && valorExistente.trim() !== "") {
        return true;
      }
    }

    return false;
  }

  /**
   * Obtener datos de previsualización por sesión
   */
  static async obtenerPreviewPorSesion(sesionId: string) {
    const registros = await PersonaComunidadTemporalModel.find({
      sesionCarga: sesionId,
    }).sort({ numeroFila: 1 });

    const resumen = {
      total: registros.length,
      nuevos: registros.filter((r) => r.estado === EstadoPreviewPersona.NUEVO)
        .length,
      actualizaciones: registros.filter(
        (r) => r.estado === EstadoPreviewPersona.ACTUALIZAR
      ).length,
      errores: registros.filter((r) => r.estado === EstadoPreviewPersona.ERROR)
        .length,
      sinCambios: registros.filter(
        (r) => r.estado === EstadoPreviewPersona.SIN_CAMBIOS
      ).length,
    };

    return {
      registros: registros.map((r) => ({
        _id: r._id?.toString(),
        datosAdicionales: Object.fromEntries(r.datosAdicionales),
        datosAnteriores: r.datosAnteriores
          ? Object.fromEntries(r.datosAnteriores)
          : undefined,
        estado: r.estado,
        errores: r.errores,
        personaExistenteId: r.personaExistenteId,
        numeroFila: r.numeroFila,
      })),
      resumen,
    };
  }

  /**
   * Actualizar registro temporal (para correcciones)
   */
  static async actualizarRegistroTemporal(
    id: string,
    datosAdicionales: Record<string, string>
  ) {
    const registro = await PersonaComunidadTemporalModel.findById(id);
    if (!registro) {
      throw new Error("Registro temporal no encontrado");
    }

    // Obtener columnas para revalidar
    const columnas = await DiccionarioColumnaModel.find({});
    const columnasMap = new Map(columnas.map((col) => [col.nombre, col]));

    // Revalidar datos
    const erroresValidacion: string[] = [];
    const nuevosDatos = new Map<string, string>();

    for (const [campo, valor] of Object.entries(datosAdicionales)) {
      const columna = columnasMap.get(campo);
      if (!columna) {
        erroresValidacion.push(
          `Campo '${campo}' no está definido en el diccionario`
        );
        continue;
      }

      // Siempre guardar el valor (incluso si tiene errores para poder corregirlo después)
      nuevosDatos.set(campo, valor);

      // Validar el valor
      const errorValidacion = ValidacionService.validarTipo(valor, columna);
      if (errorValidacion) {
        erroresValidacion.push(`${campo}: ${errorValidacion}`);
      }
    }

    // Verificar campos requeridos (solo si no hay errores previos)
    for (const columna of columnasMap.values()) {
      if (columna.requerido && !nuevosDatos.has(columna.nombre)) {
        erroresValidacion.push(
          `Campo requerido '${columna.nombre}' no está presente`
        );
      }
    }

    // Actualizar estado
    let nuevoEstado = EstadoPreviewPersona.NUEVO;
    let personaExistenteId: string | undefined;
    let datosAnteriores: Map<string, string> | undefined;

    if (erroresValidacion.length > 0) {
      nuevoEstado = EstadoPreviewPersona.ERROR;
    } else {
      const personaExistente = await this.buscarPersonaExistente(nuevosDatos);
      if (personaExistente) {
        // Verificar si realmente hay cambios
        const hayCambios = this.haycambiosReales(
          nuevosDatos,
          personaExistente.datosAdicionales
        );

        if (hayCambios) {
          nuevoEstado = EstadoPreviewPersona.ACTUALIZAR;
          personaExistenteId = personaExistente._id?.toString();
          // Guardar datos anteriores para comparación
          datosAnteriores = new Map(
            Object.entries(personaExistente.datosAdicionales)
          );
        } else {
          // No hay cambios, marcar como sin cambios
          nuevoEstado = EstadoPreviewPersona.SIN_CAMBIOS;
          personaExistenteId = personaExistente._id?.toString();
          datosAnteriores = new Map(
            Object.entries(personaExistente.datosAdicionales)
          );
        }
      }
    }

    // Actualizar registro
    registro.datosAdicionales = nuevosDatos;
    registro.datosAnteriores = datosAnteriores;
    registro.estado = nuevoEstado;
    registro.errores = erroresValidacion;
    registro.personaExistenteId = personaExistenteId;

    await registro.save();
    return registro;
  }

  /**
   * Confirmar carga definitiva desde tabla temporal
   */
  static async confirmarCargaDefinitiva(sesionId: string, userId: string) {
    const session = await PersonaComunidadTemporalModel.startSession();
    session.startTransaction();

    try {
      const registros = await PersonaComunidadTemporalModel.find({
        sesionCarga: sesionId,
        estado: {
          $in: [EstadoPreviewPersona.NUEVO, EstadoPreviewPersona.ACTUALIZAR],
        },
      }).session(session);

      let creados = 0;
      let actualizados = 0;
      const errores: string[] = [];

      // Crear historial de carga inicial
      const historialCarga = await HistorialService.crearHistorialCarga(
        userId,
        `Carga masiva sesión ${sesionId} - ${registros.length} registros`,
        undefined,
        session
      );

      // Procesar cada registro
      for (const registro of registros) {
        try {
          const datosAdicionales = Object.fromEntries(
            registro.datosAdicionales
          );

          if (registro.estado === EstadoPreviewPersona.NUEVO) {
            // Crear nueva persona
            const nuevaPersona = await PersonaComunidadModel.create(
              [{ datosAdicionales }],
              { session }
            );
            creados++;
          } else if (
            registro.estado === EstadoPreviewPersona.ACTUALIZAR &&
            registro.personaExistenteId
          ) {
            // Actualizar persona existente
            const personaActualizada =
              await PersonaComunidadModel.findByIdAndUpdate(
                registro.personaExistenteId,
                { datosAdicionales },
                { new: true, session }
              );

            if (personaActualizada) {
              actualizados++;
            }
          }
        } catch (error) {
          errores.push(`Error en fila ${registro.numeroFila}: ${error}`);
        }
      }

      // Crear historial de modificación masiva (resumen de la operación)
      if (creados > 0 || actualizados > 0) {
        await HistorialService.crearHistorialModificacionMasiva(
          userId,
          {
            elementosCreados: creados,
            elementosModificados: actualizados,
            totalProcesados: registros.length,
            errores: errores.length,
          },
          `Carga masiva sesión ${sesionId} - ${new Date().toISOString()}`,
          session
        );
      }

      // Actualizar historial de carga con el resultado final
      await HistorialService.actualizarHistorialCarga(
        historialCarga._id.toString(),
        registros.length,
        errores.length > 0 ? "fallido" : "completado",
        errores.length > 0
          ? `${errores.length} errores durante el procesamiento`
          : undefined,
        session
      );

      // Limpiar tabla temporal
      await PersonaComunidadTemporalModel.deleteMany(
        { sesionCarga: sesionId },
        { session }
      );

      await session.commitTransaction();

      return {
        creados,
        actualizados,
        errores,
        historialCreado: (creados > 0 || actualizados > 0 ? 1 : 0) + 1, // 1 historial de carga + 1 de modificación masiva (si aplica)
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("Error en confirmarCargaDefinitiva:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancelar previsualización y limpiar datos temporales
   */
  static async cancelarPreview(sesionId: string) {
    await PersonaComunidadTemporalModel.deleteMany({ sesionCarga: sesionId });
    return { success: true };
  }

  /**
   * Eliminar registro temporal específico
   */
  static async eliminarRegistroTemporal(id: string) {
    await PersonaComunidadTemporalModel.findByIdAndDelete(id);
    return { success: true };
  }
}
