import api from './api';
import type { PersonaComunidad } from './persona-comunidad.service';
import type { DashboardFilter, DashboardData, DashboardLayout } from '@/types/dashboard';

export const dashboardService = {
  // Obtener datos procesados para dashboard
  async obtenerDatosDashboard(filtros: DashboardFilter[] = []): Promise<DashboardData> {
    try {
      // Obtener todas las personas (por ahora sin filtros en el backend)
      const response = await api.get('/personas');
      const personas: PersonaComunidad[] = response.data?.data || [];
      
      return this.procesarDatosParaDashboard(personas, filtros);
    } catch (error) {
      console.error('Error obteniendo datos para dashboard:', error);
      throw error;
    }
  },

  // Procesar datos localmente para generar estadísticas
  procesarDatosParaDashboard(personas: PersonaComunidad[], filtros: DashboardFilter[] = []): DashboardData {
    // Aplicar filtros
    const personasFiltradas = this.aplicarFiltros(personas, filtros);
    
    // Generar estadísticas por campo
    const personasPorCampo: Record<string, any> = {};
    
    // Obtener todos los campos únicos
    const camposUnicos = new Set<string>();
    personasFiltradas.forEach(persona => {
      if (persona.datosAdicionales) {
        Object.keys(persona.datosAdicionales).forEach(campo => {
          camposUnicos.add(campo);
        });
      }
    });

    // Generar estadísticas para cada campo
    camposUnicos.forEach(campo => {
      const valores = personasFiltradas
        .map(p => p.datosAdicionales?.[campo])
        .filter(v => v !== undefined && v !== null && v !== '');
      
      // Conteo por valor
      const conteo: Record<string, number> = {};
      valores.forEach(valor => {
        const valorStr = String(valor);
        conteo[valorStr] = (conteo[valorStr] || 0) + 1;
      });

      personasPorCampo[campo] = {
        total: valores.length,
        valores: conteo,
        valoresUnicos: Object.keys(conteo).length,
        top5: Object.entries(conteo)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([valor, cantidad]) => ({ valor, cantidad }))
      };
    });

    return {
      totalPersonas: personasFiltradas.length,
      personasPorCampo,
      datosProcesados: personasFiltradas
    };
  },

  // Aplicar filtros a los datos
  aplicarFiltros(personas: PersonaComunidad[], filtros: DashboardFilter[]): PersonaComunidad[] {
    if (!filtros.length) return personas;

    return personas.filter(persona => {
      return filtros.every(filtro => {
        if (!filtro.activo) return true;
        
        const valorPersona = persona.datosAdicionales?.[filtro.campo];
        if (valorPersona === undefined || valorPersona === null) return false;
        
        return this.evaluarFiltro(valorPersona, filtro);
      });
    });
  },

  // Evaluar un filtro individual
  evaluarFiltro(valor: any, filtro: DashboardFilter): boolean {
    const valorStr = String(valor).toLowerCase();
    const filtroValor = String(filtro.valor).toLowerCase();

    switch (filtro.operador) {
      case 'eq':
        return valorStr === filtroValor;
      case 'ne':
        return valorStr !== filtroValor;
      case 'contains':
        return valorStr.includes(filtroValor);
      case 'startsWith':
        return valorStr.startsWith(filtroValor);
      case 'endsWith':
        return valorStr.endsWith(filtroValor);
      case 'gt':
        return Number(valor) > Number(filtro.valor);
      case 'lt':
        return Number(valor) < Number(filtro.valor);
      case 'gte':
        return Number(valor) >= Number(filtro.valor);
      case 'lte':
        return Number(valor) <= Number(filtro.valor);
      case 'in':
        return Array.isArray(filtro.valor) && filtro.valor.includes(valorStr);
      case 'nin':
        return Array.isArray(filtro.valor) && !filtro.valor.includes(valorStr);
      default:
        return true;
    }
  },

  // Guardar layout en localStorage
  async guardarLayout(layout: DashboardLayout): Promise<void> {
    try {
      const layouts = this.obtenerLayouts();
      const index = layouts.findIndex(l => l.id === layout.id);
      
      if (index >= 0) {
        layouts[index] = { ...layout, fechaModificacion: new Date().toISOString() };
      } else {
        layouts.push({
          ...layout,
          fechaCreacion: new Date().toISOString(),
          fechaModificacion: new Date().toISOString()
        });
      }
      
      localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    } catch (error) {
      console.error('Error guardando layout:', error);
      throw error;
    }
  },

  // Obtener layouts guardados
  obtenerLayouts(): DashboardLayout[] {
    try {
      const stored = localStorage.getItem('dashboard-layouts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error obteniendo layouts:', error);
      return [];
    }
  },

  // Eliminar layout
  async eliminarLayout(id: string): Promise<void> {
    try {
      const layouts = this.obtenerLayouts().filter(l => l.id !== id);
      localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    } catch (error) {
      console.error('Error eliminando layout:', error);
      throw error;
    }
  },

  // Generar datos para gráficos
  generarDatosGrafico(data: DashboardData, campo: string, _tipo: 'bar' | 'pie' | 'line') {
    const campoData = data.personasPorCampo[campo];
    if (!campoData) return [];

    const valores = Object.entries(campoData.valores).map(([nombre, valor]) => ({
      nombre,
      valor: valor as number,
      porcentaje: Math.round(((valor as number) / data.totalPersonas) * 100)
    }));

    return valores.sort((a, b) => b.valor - a.valor);
  }
};
