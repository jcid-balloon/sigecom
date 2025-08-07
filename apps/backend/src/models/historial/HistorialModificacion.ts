import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  index,
} from "@typegoose/typegoose";
import { Usuario } from "../Usuario";
import { PersonaComunidad } from "../PersonaComunidad";

@modelOptions({ options: { allowMixed: 0 } })
@index({ fechaYHora: 1 }, { expireAfterSeconds: 604800 }) // 7 días en segundos
export class HistorialModificacion {
  @prop({ ref: () => Usuario, required: true })
  usuario!: Ref<Usuario>;

  @prop({ required: true, default: () => new Date() })
  fechaYHora!: Date;

  @prop({ ref: () => PersonaComunidad })
  documentoModificado?: Ref<PersonaComunidad>; // Referencia al documento modificado (para modificaciones individuales)

  @prop({ required: true })
  resumenCambios!: string; // Descripción general del cambio

  @prop()
  contextoOperacion?: string; // Información contextual (ej: "RUT: 12345678-9, Nombre: Juan Pérez")

  @prop({
    required: true,
    enum: ["individual", "masiva", "creacion", "eliminacion"],
    default: "individual",
  })
  tipoModificacion!: string; // Tipo de operación

  @prop()
  referenciaOperacion?: string; // ID de operación relacionada (ej: carga masiva, jobId)

  // Para modificaciones individuales: lista de campos modificados
  @prop({ type: () => [Object] })
  camposModificados?: Array<{
    campo: string;
    valorAnterior: string;
    valorNuevo: string;
  }>;

  // Para operaciones masivas: estadísticas
  @prop()
  estadisticas?: {
    elementosCreados?: number;
    elementosModificados?: number;
    elementosEliminados?: number;
    totalProcesados?: number;
    errores?: number;
  };
}

export const HistorialModificacionModel = getModelForClass(
  HistorialModificacion
);
