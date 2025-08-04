import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Usuario } from "../Usuario";

@modelOptions({ options: { allowMixed: 0 } })
export class HistorialDescarga {
  @prop({ ref: () => Usuario, required: true })
  usuario!: Ref<Usuario>;

  @prop({ required: true, default: () => new Date() })
  fechaYHora!: Date;

  @prop({
    required: true,
    enum: ["CSV", "Excel", "PDF"],
    default: "CSV",
  })
  formato!: string;

  @prop({ required: true, default: 0 })
  cantidadRegistros!: number;

  @prop()
  filtrosAplicados?: string; // JSON string con los filtros aplicados

  @prop()
  nombreArchivo?: string; // Nombre del archivo generado
}

export const HistorialDescargaModel = getModelForClass(HistorialDescarga);
