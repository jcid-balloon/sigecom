export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
}

export type WidgetType = 
  | 'counter'
  | 'chart-bar'
  | 'chart-pie'
  | 'progress';

export interface WidgetConfig {
  // Configuración común
  titulo?: string;
  descripcion?: string;
  mostrarTitulo?: boolean;
  
  // Para widgets de contador
  campo?: string;
  operacion?: 'count' | 'sum' | 'avg' | 'min' | 'max';
  formato?: 'number' | 'currency' | 'percentage';
  
  // Para widgets de gráfico
  campoX?: string;
  campoY?: string;
  tipoAgrupacion?: 'count' | 'sum' | 'avg';
  colores?: string[];
  
  // Para widgets de tabla
  columnas?: string[];
  limiteFilas?: number;
  
  // Para widgets de texto
  contenido?: string;
  
  // Filtros específicos del widget
  filtros?: DashboardFilter[];
}

export interface DashboardFilter {
  id: string;
  campo: string;
  operador: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'nin';
  valor: any;
  activo: boolean;
}

export interface DashboardLayout {
  id: string;
  nombre: string;
  descripcion?: string;
  widgets: Widget[];
  filtrosGlobales: DashboardFilter[];
  esPublico: boolean;
  creadoPor: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface DashboardData {
  totalPersonas: number;
  personasPorCampo: Record<string, any>;
  datosProcesados: any[];
}
