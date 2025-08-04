import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Usuario } from "../Usuario";

@modelOptions({ options: { allowMixed: 0 } })
export class HistorialCarga {
  @prop({ ref: () => Usuario, required: true })
  usuario!: Ref<Usuario>;

  @prop({ required: true, default: () => new Date() })
  fechaYHora!: Date;

  @prop({ required: true })
  nombreArchivo!: string;

  @prop({ required: true, default: 0 })
  cantidadRegistros!: number;

  @prop({
    required: true,
    enum: ["procesando", "completado", "fallido"],
    default: "procesando",
  })
  estado!: string;

  @prop()
  errorMessage?: string; // Mensaje de error si falló

  @prop()
  jobId?: string; // ID del job para tracking
}

export const HistorialCargaModel = getModelForClass(HistorialCarga);
