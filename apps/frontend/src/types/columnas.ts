// Tipos compatibles con JSON que se pueden usar en formularios
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

export interface DiccionarioColumna {
  _id: string;
  nombre: string;
  tipo: TipoColumna;
  requerido: boolean;
  valorPorDefecto?: string;
  descripcion?: string;
  tipoValidacion?: "lista" | "regex" | "rango";
  validacion?: string; // JSON string para lista de valores, string para regex, o objeto para rango
  longitudMaxima?: number;
  longitudMinima?: number;
  valorMinimo?: number; // Para tipos numéricos
  valorMaximo?: number; // Para tipos numéricos
  patron?: string; // Patrón regex para validaciones específicas
  placeholder?: string; // Texto de ayuda para el frontend
}

export interface ValidacionError {
  campo: string;
  valor: any;
  mensaje: string;
  codigo: string;
}

export interface ValidacionResult {
  valido: boolean;
  errores: ValidacionError[];
  datosLimpios: Record<string, any>;
}

// Configuración para renderizar campos en formularios
export interface ConfiguracionCampo {
  tipo: TipoColumna;
  requerido: boolean;
  placeholder?: string;
  opciones?: string[]; // Para campos de tipo select
  valorMinimo?: number;
  valorMaximo?: number;
  longitudMinima?: number;
  longitudMaxima?: number;
  patron?: string;
}

// Metadatos para renderizar formularios dinámicos
export interface MetadatosFormulario {
  columnas: DiccionarioColumna[];
}
