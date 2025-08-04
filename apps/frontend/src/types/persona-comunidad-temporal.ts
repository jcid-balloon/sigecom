export const EstadoPreviewPersona = {
  NUEVO: "nuevo",
  ACTUALIZAR: "actualizar",
  ERROR: "error",
  SIN_CAMBIOS: "sin_cambios",
} as const;

export type EstadoPreviewPersona =
  (typeof EstadoPreviewPersona)[keyof typeof EstadoPreviewPersona];

export interface PersonaComunidadTemporal {
  _id?: string;
  datosAdicionales: Record<string, string>;
  datosAnteriores?: Record<string, string>; // Datos originales para comparar cambios
  estado: EstadoPreviewPersona;
  errores: string[];
  personaExistenteId?: string;
  numeroFila?: number;
}

export interface PreviewSesion {
  registros: PersonaComunidadTemporal[];
  resumen: {
    total: number;
    nuevos: number;
    actualizaciones: number;
    errores: number;
    sinCambios: number;
  };
}

export interface ResultadoProcesamiento {
  sesionId: string;
  registrosProcesados: number;
  nuevos: number;
  actualizaciones: number;
  errores: number;
  sinCambios: number;
}

export interface ResultadoCargaDefinitiva {
  creados: number;
  actualizados: number;
  errores: string[];
}
