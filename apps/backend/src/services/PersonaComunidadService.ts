import mongoose from "mongoose";
import { PersonaComunidadModel } from "@/models/PersonaComunidad";
import { HistorialService } from "./HistorialService";
import { ValidacionService } from "./ValidacionService";
import fs from "fs";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import os from "os";
import path from "path";

interface RegistroPersona {
  datosAdicionales: Record<string, string>; // Todos los datos van aquí, incluyendo rut, nombre, apellido
}

interface CargaJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalRegistros: number;
  registrosProcesados: number;
  errores: string[];
  historialCargaId?: string;
}

// Almacén temporal para jobs
const jobs = new Map<string, CargaJob>();

export class PersonaComunidadService {
  /**
   * Normalizar nombre de campo a minúsculas y limpiar caracteres especiales
   */
  private static normalizarNombreCampo(nombreCampo: string): string {
    return nombreCampo.toLowerCase().trim();
  }

  /**
   * Crear una nueva persona en la comunidad con historial
   */
  static async crearPersona(data: RegistroPersona, userId: string) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Validar datos contra el diccionario de columnas
        const validacion = await ValidacionService.validarDatos(
          data.datosAdicionales
        );
        if (!validacion.valido) {
          const erroresTexto = validacion.errores
            .map((e) => `${e.campo}: ${e.mensaje}`)
            .join("; ");
          throw new Error(`Errores de validación: ${erroresTexto}`);
        }

        // 2. Usar los datos limpios de la validación
        const datosLimpios = { datosAdicionales: validacion.datosLimpios };

        // 3. Verificar unicidad de RUT si existe
        if (datosLimpios.datosAdicionales.rut) {
          const rutFormateado = datosLimpios.datosAdicionales.rut;
          const personaConMismoRut = await PersonaComunidadModel.findOne({
            "datosAdicionales.rut": rutFormateado,
          }).session(session);

          if (personaConMismoRut) {
            throw new Error(
              `Ya existe una persona con el RUT: ${rutFormateado}`
            );
          }
        }

        // 4. Crear la persona con datos validados
        const persona = new PersonaComunidadModel(datosLimpios);
        const personaGuardada = await persona.save({ session });

        // 5. Crear historial de modificación
        const contextoOperacion = HistorialService.generarContextoOperacion(
          datosLimpios.datosAdicionales
        );

        await HistorialService.crearHistorialModificacionIndividual(
          userId,
          personaGuardada._id.toString(),
          "creacion",
          "Registro creado",
          undefined, // No hay campos modificados en una creación
          contextoOperacion,
          session
        );

        return personaGuardada;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Actualizar una persona con historial automático
   */
  static async actualizarPersona(
    personaId: string,
    updates: Partial<RegistroPersona>,
    userId: string
  ) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Obtener el registro original
        const personaOriginal = await PersonaComunidadModel.findById(
          personaId
        ).session(session);
        if (!personaOriginal) {
          throw new Error("Persona no encontrada");
        }

        // 1.5. Validar y formatear datos nuevos si hay datosAdicionales
        let datosValidados = updates.datosAdicionales;
        if (updates.datosAdicionales) {
          const validacion = await ValidacionService.validarDatos(
            updates.datosAdicionales
          );
          if (!validacion.valido) {
            const erroresTexto = validacion.errores
              .map((e) => `${e.campo}: ${e.mensaje}`)
              .join("; ");
            throw new Error(`Errores de validación: ${erroresTexto}`);
          }
          datosValidados = validacion.datosLimpios;
        }

        // 2. Verificar si se está cambiando el RUT y si ya existe
        if (datosValidados?.rut) {
          const nuevoRut = datosValidados.rut;
          const rutOriginal = personaOriginal.datosAdicionales?.rut;

          // Solo verificar si el RUT realmente cambió
          if (nuevoRut !== rutOriginal) {
            const personaConMismoRut = await PersonaComunidadModel.findOne({
              "datosAdicionales.rut": nuevoRut,
              _id: { $ne: personaId }, // Excluir la persona actual
            }).session(session);

            if (personaConMismoRut) {
              throw new Error(`Ya existe una persona con el RUT: ${nuevoRut}`);
            }
          }
        }

        // 3. Actualizar el registro
        const personaActualizada =
          await PersonaComunidadModel.findByIdAndUpdate(personaId, updates, {
            new: true,
            session,
          });

        // 4. Crear historiales para cada campo modificado en datosAdicionales
        if (datosValidados) {
          const cambios: Array<{
            documentoId: string;
            campo: string;
            valorAnterior: string;
            valorNuevo: string;
          }> = [];

          const datosOriginales = personaOriginal.datosAdicionales || {};

          Object.entries(datosValidados).forEach(([campo, valorNuevo]) => {
            const valorOriginal = datosOriginales[campo] || "";

            if (valorOriginal !== valorNuevo) {
              cambios.push({
                documentoId: personaId,
                campo,
                valorAnterior: valorOriginal,
                valorNuevo: valorNuevo || "",
              });
            }
          });

          if (cambios.length > 0) {
            await HistorialService.crearHistorialesModificacionMultiples(
              userId,
              cambios,
              session
            );
          }
        }

        // 5. Preparar los datos para actualizar
        const updateData: any = {};
        if (datosValidados) {
          // Usar los datos validados y formateados
          updateData.datosAdicionales = datosValidados;
        }

        // 6. Actualizar el registro
        await PersonaComunidadModel.findByIdAndUpdate(personaId, updateData, {
          new: true,
          session,
        });

        // 7. Obtener los datos actualizados
        const personaFinal = await PersonaComunidadModel.findById(
          personaId
        ).session(session);

        return {
          ...personaFinal!.toObject(),
          datosAdicionales: personaFinal!.datosAdicionales || {},
        };
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Eliminar una persona con historial
   */
  static async eliminarPersona(personaId: string, userId: string) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Obtener el registro antes de eliminarlo
        const persona = await PersonaComunidadModel.findById(personaId).session(
          session
        );
        if (!persona) {
          throw new Error("Persona no encontrada");
        }

        // 2. Eliminar el registro
        await PersonaComunidadModel.findByIdAndDelete(personaId).session(
          session
        );

        // 3. Crear historial de eliminación con datos de datosAdicionales
        const datosPersona = persona.datosAdicionales;
        const contextoOperacion =
          HistorialService.generarContextoOperacion(datosPersona);

        await HistorialService.crearHistorialModificacionIndividual(
          userId,
          personaId,
          "eliminacion",
          "Registro eliminado",
          undefined, // No hay campos modificados en una eliminación
          contextoOperacion,
          session
        );

        return persona;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Iniciar carga masiva desde archivo
   */
  static async iniciarCargaMasiva(
    filePath: string,
    tipo: "excel" | "csv",
    userId: string
  ): Promise<{ jobId: string; totalRegistros: number }> {
    const jobId = `carga_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 1. Leer el archivo para obtener el total de registros
    const registros = await this.leerArchivo(filePath);
    const totalRegistros = registros.length;

    // 2. Crear historial de carga inicial
    const historialCarga = await HistorialService.crearHistorialCarga(
      userId,
      filePath.split(/[/\\]/).pop() || "archivo",
      jobId
    );

    // 3. Crear job para tracking
    const job: CargaJob = {
      id: jobId,
      status: "pending",
      totalRegistros: totalRegistros,
      registrosProcesados: 0,
      errores: [],
      historialCargaId: historialCarga._id.toString(),
    };
    jobs.set(jobId, job);

    // 4. Iniciar procesamiento en background
    this.procesarArchivoEnBackground(
      jobId,
      filePath,
      userId,
      historialCarga._id.toString()
    );

    return {
      jobId: jobId,
      totalRegistros: totalRegistros,
    };
  }

  /**
   * Obtener progreso de carga masiva
   */
  static getProgresoCarga(jobId: string): CargaJob | undefined {
    return jobs.get(jobId);
  }

  /**
   * Procesar archivo en background
   */
  private static async procesarArchivoEnBackground(
    jobId: string,
    filePath: string,
    userId: string,
    historialCargaId: string
  ) {
    const job = jobs.get(jobId)!;
    job.status = "processing";

    try {
      // 1. Leer archivo según extensión
      const registros = await this.leerArchivo(filePath);
      job.totalRegistros = registros.length;

      // 2. Procesar en lotes
      const BATCH_SIZE = 100;
      let registrosProcesados = 0;
      let registrosCreados = 0;
      let registrosModificados = 0;
      let errores = 0;

      for (let i = 0; i < registros.length; i += BATCH_SIZE) {
        const lote = registros.slice(i, i + BATCH_SIZE);

        try {
          // Procesar cada registro individualmente para manejar duplicados
          for (const registro of lote) {
            try {
              const rut = registro.datosAdicionales.rut;

              if (rut) {
                // Buscar si ya existe una persona con este RUT
                const personaExistente = await PersonaComunidadModel.findOne({
                  "datosAdicionales.rut": rut,
                });

                if (personaExistente) {
                  // Actualizar registro existente
                  const datosOriginales =
                    personaExistente.datosAdicionales || {};
                  const cambios: Array<{
                    documentoId: string;
                    campo: string;
                    valorAnterior: string;
                    valorNuevo: string;
                  }> = [];

                  // Comparar campos y registrar cambios
                  Object.entries(registro.datosAdicionales).forEach(
                    ([campo, valorNuevo]) => {
                      const valorOriginal = datosOriginales[campo] || "";
                      if (valorOriginal !== valorNuevo) {
                        cambios.push({
                          documentoId: personaExistente._id.toString(),
                          campo,
                          valorAnterior: valorOriginal,
                          valorNuevo: valorNuevo || "",
                        });
                      }
                    }
                  );

                  if (cambios.length > 0) {
                    // Actualizar el registro
                    await PersonaComunidadModel.findByIdAndUpdate(
                      personaExistente._id,
                      { datosAdicionales: registro.datosAdicionales },
                      { new: true }
                    );

                    // Crear historial de modificación consolidado
                    await HistorialService.crearHistorialesModificacionMultiples(
                      userId,
                      cambios
                    );

                    registrosModificados += 1;
                  }

                  registrosProcesados += 1;
                } else {
                  // Crear nuevo registro
                  const nuevaPersona = await PersonaComunidadModel.create(
                    registro
                  );

                  // Crear historial de creación
                  const contextoOperacion =
                    HistorialService.generarContextoOperacion(
                      registro.datosAdicionales
                    );
                  await HistorialService.crearHistorialModificacionIndividual(
                    userId,
                    nuevaPersona._id.toString(),
                    "creacion",
                    "Registro creado en carga masiva",
                    undefined,
                    contextoOperacion
                  );

                  registrosProcesados += 1;
                  registrosCreados += 1;
                }
              } else {
                // Sin RUT, intentar crear (podría fallar si hay otros índices únicos)
                const nuevaPersona = await PersonaComunidadModel.create(
                  registro
                );

                // Crear historial de creación
                const contextoOperacion =
                  HistorialService.generarContextoOperacion(
                    registro.datosAdicionales
                  );
                await HistorialService.crearHistorialModificacionIndividual(
                  userId,
                  nuevaPersona._id.toString(),
                  "creacion",
                  "Registro creado en carga masiva",
                  undefined,
                  contextoOperacion
                );

                registrosProcesados += 1;
                registrosCreados += 1;
              }
            } catch (individualError: any) {
              console.error(
                "Error procesando registro individual:",
                individualError
              );
              errores += 1;
              job.errores.push(
                `Error en registro con RUT ${
                  registro.datosAdicionales.rut || "sin RUT"
                }: ${individualError.message}`
              );
            }
          }

          job.registrosProcesados = registrosProcesados;
        } catch (error) {
          console.error("Error en lote:", error);
          job.errores.push(`Error en lote ${i}-${i + BATCH_SIZE}: ${error}`);
          errores += lote.length;
        }
      }

      // 3. Actualizar historial de carga
      await HistorialService.actualizarHistorialCarga(
        historialCargaId,
        registrosProcesados,
        "completado"
      );

      // 4. Crear historial de modificación masiva
      await HistorialService.crearHistorialModificacionMasiva(
        userId,
        {
          elementosCreados: registrosCreados,
          elementosModificados: registrosModificados,
          totalProcesados: registrosProcesados,
          errores: errores,
        },
        historialCargaId
      );

      job.status = "completed";

      // 5. Limpiar archivo temporal
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error: any) {
      job.status = "failed";
      job.errores.push(`Error general: ${error.message || error}`);

      // Actualizar historial como fallido
      await HistorialService.actualizarHistorialCarga(
        historialCargaId,
        job.registrosProcesados,
        "fallido",
        error.message || String(error)
      );

      // 6. Limpiar archivo temporal también en caso de error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Leer archivo CSV o Excel y convertir a registros
   */
  private static async leerArchivo(
    filePath: string
  ): Promise<RegistroPersona[]> {
    const extension = filePath.split(".").pop()?.toLowerCase();

    if (extension === "csv") {
      return this.leerCSV(filePath);
    } else if (extension === "xlsx" || extension === "xls") {
      return this.leerExcel(filePath);
    } else {
      throw new Error("Formato de archivo no soportado");
    }
  }

  /**
   * Leer archivo CSV
   */
  private static async leerCSV(filePath: string): Promise<RegistroPersona[]> {
    return new Promise((resolve, reject) => {
      const registros: RegistroPersona[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row: any) => {
          // Crear registro con todos los datos en datosAdicionales
          const datosAdicionales: Record<string, string> = {};

          // Mapear todos los campos del CSV
          Object.keys(row).forEach((key) => {
            const valor = row[key];
            if (valor !== undefined && valor !== null && valor !== "") {
              // Normalizar nombres de campos a minúsculas
              const nombreCampo = this.normalizarNombreCampo(key);
              datosAdicionales[nombreCampo] = String(valor);
            }
          });

          const registro: RegistroPersona = {
            datosAdicionales,
          };

          registros.push(registro);
        })
        .on("end", () => resolve(registros))
        .on("error", reject);
    });
  }

  /**
   * Leer archivo Excel
   */
  private static async leerExcel(filePath: string): Promise<RegistroPersona[]> {
    // TODO: Implementar cuando se instale xlsx
    // throw new Error("Funcionalidad Excel pendiente de implementar");
    // /*
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    return rawData.map((row: any) => {
      // Crear registro con todos los datos en datosAdicionales
      const datosAdicionales: Record<string, string> = {};

      // Mapear todos los campos del Excel
      Object.keys(row).forEach((key) => {
        const valor = row[key];
        if (valor !== undefined && valor !== null && valor !== "") {
          // Normalizar nombres de campos a minúsculas
          const nombreCampo = this.normalizarNombreCampo(key);
          datosAdicionales[nombreCampo] = String(valor);
        }
      });

      const registro: RegistroPersona = {
        datosAdicionales,
      };

      return registro;
    });
  }

  /**
   * Registrar historial de descarga sin generar archivos
   */
  static async registrarHistorialDescarga(
    userId: string,
    formato: "CSV" | "Excel" | "PDF",
    cantidadRegistros: number,
    filtros: any,
    nombreArchivo: string
  ) {
    await HistorialService.crearHistorialDescarga(
      userId,
      formato,
      cantidadRegistros,
      filtros,
      nombreArchivo
    );
  }

  /**
   * Obtener todas las personas con filtros opcionales
   */
  static async obtenerPersonas(filtros: any = {}) {
    const query: any = {};

    // Los filtros ahora buscan dentro del Map de datosAdicionales
    if (filtros.nombre) {
      query["datosAdicionales.nombre"] = {
        $regex: filtros.nombre,
        $options: "i",
      };
    }

    if (filtros.apellido) {
      query["datosAdicionales.apellido"] = {
        $regex: filtros.apellido,
        $options: "i",
      };
    }

    if (filtros.rut) {
      query["datosAdicionales.rut"] = { $regex: filtros.rut, $options: "i" };
    }

    const personas = await PersonaComunidadModel.find(query).sort({
      createdAt: -1,
    });

    // Los datos ya vienen como Record, no necesitamos convertir
    return personas.map((persona) => ({
      ...persona.toObject(),
      datosAdicionales: persona.datosAdicionales || {},
    }));
  }

  /**
   * Obtener persona por ID
   */
  static async obtenerPersonaPorId(id: string) {
    const persona = await PersonaComunidadModel.findById(id);
    if (!persona) return null;

    // Los datos ya vienen como Record, no necesitamos convertir
    return {
      ...persona.toObject(),
      datosAdicionales: persona.datosAdicionales || {},
    };
  }

  /**
   * Procesar archivo Excel para carga masiva
   */
  static async procesarArchivoExcel(
    buffer: Buffer,
    filename: string,
    userId: string
  ) {
    // Crear un archivo temporal en el sistema de archivos temporal de Node.js
    const tempPath = path.join(os.tmpdir(), `${Date.now()}-${filename}`);
    fs.writeFileSync(tempPath, buffer);

    // No eliminamos el archivo aquí, se eliminará en el procesamiento en background
    return await this.iniciarCargaMasiva(tempPath, "excel", userId);
  }

  /**
   * Procesar archivo CSV para carga masiva
   */
  static async procesarArchivoCSV(
    buffer: Buffer,
    filename: string,
    userId: string
  ) {
    // Crear un archivo temporal en el sistema de archivos temporal de Node.js
    const tempPath = path.join(os.tmpdir(), `${Date.now()}-${filename}`);
    fs.writeFileSync(tempPath, buffer);

    // No eliminamos el archivo aquí, se eliminará en el procesamiento en background
    return await this.iniciarCargaMasiva(tempPath, "csv", userId);
  }

  /**
   * Obtener estado de un trabajo de carga
   */
  static async obtenerEstadoTrabajo(jobId: string) {
    const job = jobs.get(jobId);
    if (!job) return null;

    // Transformar la estructura CargaJob a la estructura esperada por el frontend
    return {
      jobId: job.id,
      status: job.status,
      progreso: {
        total: job.totalRegistros,
        procesados: job.registrosProcesados,
        porcentaje:
          job.totalRegistros > 0
            ? Math.round((job.registrosProcesados / job.totalRegistros) * 100)
            : 0,
      },
      errores: job.errores,
      historialCargaId: job.historialCargaId,
    };
  }

  /**
   * Limpiar columnas obsoletas de todas las personas comunidad
   * Elimina columnas que existen en los datos pero no en el diccionario actual
   */
  static async limpiarColumnasObsoletas(userId: string) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Obtener todas las columnas válidas actuales
        const { DiccionarioColumnaModel } = await import(
          "@/models/DiccionarioColumna"
        );
        const columnasValidas = await DiccionarioColumnaModel.find({}).session(
          session
        );
        const nombresColumnasValidas = new Set(
          columnasValidas.map((col) => col.nombre.toLowerCase())
        );

        // 2. Obtener todas las personas
        const personas = await PersonaComunidadModel.find({}).session(session);

        let personasActualizadas = 0;
        let columnasEliminadas: string[] = [];

        // 3. Procesar cada persona
        for (const persona of personas) {
          if (!persona.datosAdicionales) continue;

          const datosOriginales = { ...persona.datosAdicionales };
          const datosLimpios: Record<string, any> = {};
          let hayColumnasObsoletas = false;

          // 4. Filtrar solo las columnas que existen en el diccionario
          for (const [campo, valor] of Object.entries(datosOriginales)) {
            const campoNormalizado = campo.toLowerCase();

            if (nombresColumnasValidas.has(campoNormalizado)) {
              // Mantener la columna
              datosLimpios[campo] = valor;
            } else {
              // Columna obsoleta - la eliminamos
              hayColumnasObsoletas = true;
              if (!columnasEliminadas.includes(campo)) {
                columnasEliminadas.push(campo);
              }
            }
          }

          // 5. Actualizar la persona si había columnas obsoletas
          if (hayColumnasObsoletas) {
            await PersonaComunidadModel.findByIdAndUpdate(
              persona._id,
              { datosAdicionales: datosLimpios },
              { session }
            );
            personasActualizadas++;

            // 6. Crear historial de la limpieza
            const contextoOperacion =
              HistorialService.generarContextoOperacion(datosLimpios);
            await HistorialService.crearHistorialModificacionIndividual(
              userId,
              persona._id.toString(),
              "modificacion",
              `Eliminadas columnas obsoletas: ${Object.keys(datosOriginales)
                .filter(
                  (campo) => !nombresColumnasValidas.has(campo.toLowerCase())
                )
                .join(", ")}`,
              undefined,
              contextoOperacion,
              session
            );
          }
        }

        return {
          personasActualizadas,
          columnasEliminadas,
          mensaje: `Se actualizaron ${personasActualizadas} personas. Columnas eliminadas: ${columnasEliminadas.join(
            ", "
          )}`,
        };
      });
    } finally {
      await session.endSession();
    }
  }
}
