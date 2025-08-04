import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

export enum EstadoPreviewPersona {
  NUEVO = "nuevo",
  ACTUALIZAR = "actualizar",
  ERROR = "error",
  SIN_CAMBIOS = "sin_cambios",
}

@modelOptions({ options: { allowMixed: 0 } })
export class PersonaComunidadTemporal {
  @prop({ required: true, type: Map })
  datosAdicionales!: Map<string, string>; // Todos los datos van aquí, incluyendo rut, nombre, apellido, etc.

  @prop({ type: Map })
  datosAnteriores?: Map<string, string>; // Datos originales para comparar cambios

  @prop({ required: true, enum: EstadoPreviewPersona })
  estado!: EstadoPreviewPersona;

  @prop({ type: [String], default: [] })
  errores!: string[];

  @prop()
  personaExistenteId?: string; // ID de la persona existente si es una actualización

  @prop({ required: true })
  sesionCarga!: string; // ID de sesión para agrupar las cargas

  @prop({ default: Date.now })
  fechaCreacion!: Date;

  @prop()
  numeroFila?: number; // Número de fila del archivo original para referencia
}

export const PersonaComunidadTemporalModel = getModelForClass(
  PersonaComunidadTemporal
);
