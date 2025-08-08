import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, Eye, Maximize, Minimize } from 'lucide-react';
import { WidgetRenderer } from './WidgetRenderer';
import { WidgetConfigForm } from './WidgetConfigForm';
import { DashboardFilters } from './DashboardFilters';
import { dashboardService } from '@/services/dashboard.service';
import { diccionarioColumnaService } from '@/services/diccionario-columna.service';
import { useFullscreen } from '@/hooks/useFullscreen';
import type { Widget, DashboardFilter, DashboardData, DashboardLayout } from '@/types/dashboard';
import type { DiccionarioColumna } from '@/types/columnas';

const Dashboard: React.FC = () => {
  // Estados principales
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [filtrosGlobales, setFiltrosGlobales] = useState<DashboardFilter[]>([]);
  const [data, setData] = useState<DashboardData>({
    totalPersonas: 0,
    personasPorCampo: {},
    datosProcesados: []
  });
  const [columnas, setColumnas] = useState<DiccionarioColumna[]>([]);
  
  // Estados de UI
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de formularios
  const [showWidgetForm, setShowWidgetForm] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  
  // Hook de pantalla completa
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  // Estados de layout simplificado
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>({
    id: 'default',
    nombre: 'Dashboard Principal',
    descripcion: 'Dashboard de PersonaComunidad',
    widgets: [],
    filtrosGlobales: [],
    esPublico: false,
    creadoPor: 'usuario',
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString()
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Recargar datos cuando cambian los filtros
  useEffect(() => {
    if (filtrosGlobales.length > 0) {
      recargarDatos();
    }
  }, [filtrosGlobales]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar columnas del diccionario
      const columnasResponse = await diccionarioColumnaService.obtenerColumnas();
      setColumnas(columnasResponse);

      // Cargar datos del dashboard
      const dashboardData = await dashboardService.obtenerDatosDashboard(filtrosGlobales);
      setData(dashboardData);

      // Cargar layout guardado
      const layoutsGuardados = dashboardService.obtenerLayouts();
      const layoutGuardado = layoutsGuardados.find(l => l.id === 'default');
      if (layoutGuardado) {
        setCurrentLayout(layoutGuardado);
        setWidgets(layoutGuardado.widgets);
        setFiltrosGlobales(layoutGuardado.filtrosGlobales);
      }

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const recargarDatos = async () => {
    try {
      const dashboardData = await dashboardService.obtenerDatosDashboard(filtrosGlobales);
      setData(dashboardData);
    } catch (error) {
      console.error('Error recargando datos:', error);
      setError('Error al recargar los datos');
    }
  };

  // Handlers de widgets
  const handleSaveWidget = (widget: Widget) => {
    if (editingWidget) {
      // Editar widget existente
      setWidgets(prev => prev.map(w => w.id === widget.id ? widget : w));
    } else {
      // Agregar nuevo widget
      setWidgets(prev => [...prev, widget]);
    }
    
    setShowWidgetForm(false);
    setEditingWidget(null);
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
    setShowWidgetForm(true);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const handleWidgetPositionChange = (widgetId: string, position: { x: number; y: number; width: number; height: number }) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, posicion: position } : w
    ));
  };

  const handleSaveLayout = async () => {
    try {
      const layoutActualizado: DashboardLayout = {
        ...currentLayout,
        widgets,
        filtrosGlobales,
        fechaModificacion: new Date().toISOString()
      };
      
      dashboardService.guardarLayout(layoutActualizado);
      setCurrentLayout(layoutActualizado);
      
      // Mostrar mensaje de éxito (opcional)
      console.log('Layout guardado correctamente');
    } catch (error) {
      console.error('Error guardando layout:', error);
      setError('Error al guardar el layout');
    }
  };

  // Renderizado condicional para estados de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={cargarDatosIniciales}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 p-4 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header del Dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{currentLayout.nombre}</h1>
            <p className="text-gray-600">{currentLayout.descripcion}</p>
            <div className="text-sm text-gray-500 mt-1">
              Total de personas: <span className="font-medium">{data.totalPersonas}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              <span>{isFullscreen ? 'Salir' : 'Expandir'}</span>
            </button>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                isEditing 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditing ? <Eye size={16} /> : <Edit size={16} />}
              <span>{isEditing ? 'Vista' : 'Editar'}</span>
            </button>
            
            {isEditing && (
              <>
                <button
                  onClick={() => setShowWidgetForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Plus size={16} />
                  <span>Widget</span>
                </button>
                
                <button
                  onClick={handleSaveLayout}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Save size={16} />
                  <span>Guardar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Información adicional cuando está en modo edición */}
        {isEditing && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Widgets: {widgets.length} | Filtros activos: {filtrosGlobales.filter(f => f.activo).length}
            </div>
            <div className="text-xs text-gray-500">
              {isFullscreen && 'Presiona ESC para salir de pantalla completa'}
            </div>
          </div>
        )}
      </div>

      {/* Filtros Globales */}
      <div className="mb-6">
        <DashboardFilters
          filtros={filtrosGlobales}
          columnas={columnas}
          onChange={setFiltrosGlobales}
        />
      </div>

      {/* Área de Widgets */}
      <div className="relative bg-white rounded-lg shadow-md min-h-[600px] p-4">
        {widgets.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl mb-2">Dashboard Vacío</p>
              <p className="text-sm mb-4">Agrega widgets para comenzar a visualizar tus datos</p>
              {isEditing && (
                <button
                  onClick={() => setShowWidgetForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
                >
                  <Plus size={16} />
                  <span>Agregar Primer Widget</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          widgets.map(widget => (
            <WidgetRenderer
              key={widget.id}
              widget={widget}
              data={data}
              onEdit={handleEditWidget}
              onDelete={handleDeleteWidget}
              onPositionChange={handleWidgetPositionChange}
              isEditing={isEditing}
            />
          ))
        )}
      </div>

      {/* Formulario de configuración de widget */}
      <WidgetConfigForm
        widget={editingWidget}
        columnas={columnas}
        onSave={handleSaveWidget}
        onCancel={() => {
          setShowWidgetForm(false);
          setEditingWidget(null);
        }}
        isOpen={showWidgetForm}
      />
    </div>
  );
};

export default Dashboard;
