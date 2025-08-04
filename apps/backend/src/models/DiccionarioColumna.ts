import { getModelForClass } from "@typegoose/typegoose";
import { prop } from "@typegoose/typegoose/lib/prop";

// Tipos compatibles con JSON
export type TipoColumna =
  | "string" // Texto
  | "number" // Número (entero o decimal)
  | "boolean" // Verdadero/Falso
  | "date" // Fecha (se almacena como string ISO)
  | "email" // Email (string con validación)
  | "url" // URL (string con validación)
  | "phone" // Teléfono (string con formato)
  | "select" // Lista de opciones predefinidas
  | "textarea"; // Texto largo

export class DiccionarioColumna {
  @prop({ required: true })
  nombre!: string;

  @prop({
    enum: [
      "string",
      "number",
      "boolean",
      "date",
      "email",
      "url",
      "phone",
      "select",
      "textarea",
    ],
    default: "string",
  })
  tipo!: TipoColumna;

  @prop({ default: false })
  requerido?: boolean;

  @prop()
  valorPorDefecto?: string;

  @prop()
  descripcion?: string;

  @prop({ enum: ["lista", "regex", "rango"] })
  tipoValidacion?: "lista" | "regex" | "rango";

  @prop()
  validacion?: string; // JSON string para lista de valores, string para regex, o objeto para rango

  @prop()
  longitudMaxima?: number;

  @prop()
  longitudMinima?: number;

  @prop()
  valorMinimo?: number; // Para tipos numéricos

  @prop()
  valorMaximo?: number; // Para tipos numéricos

  @prop()
  patron?: string; // Patrón regex para validaciones específicas

  @prop()
  placeholder?: string; // Texto de ayuda para el frontend
}

export const DiccionarioColumnaModel = getModelForClass(DiccionarioColumna);
