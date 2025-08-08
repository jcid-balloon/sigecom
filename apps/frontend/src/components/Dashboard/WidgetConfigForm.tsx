import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Widget, WidgetType, WidgetConfig } from '@/types/dashboard';
import type { DiccionarioColumna } from '@/types/columnas';

interface WidgetConfigFormProps {
  widget: Widget | null;
  columnas: DiccionarioColumna[];
  onSave: (widget: Widget) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const TIPOS_WIDGET: { value: WidgetType; label: string; description: string }[] = [
  { value: 'counter', label: 'Contador', description: 'Muestra un valor numérico destacado' },
  { value: 'chart-bar', label: 'Gráfico de Barras', description: 'Gráfico de barras para comparar valores' },
  { value: 'chart-pie', label: 'Gráfico Circular', description: 'Gráfico circular para mostrar proporciones' },
  { value: 'progress', label: 'Progreso', description: 'Barra de progreso' }
];

const OPERADORES = [
  { value: 'count', label: 'Contar' },
  { value: 'sum', label: 'Sumar' },
  { value: 'avg', label: 'Promedio' }
];

const FORMATOS = [
  { value: 'number', label: 'Número' },
  { value: 'currency', label: 'Moneda' },
  { value: 'percentage', label: 'Porcentaje' }
];

export const WidgetConfigForm: React.FC<WidgetConfigFormProps> = ({
  widget,
  columnas,
  onSave,
  onCancel,
  isOpen
}) => {
  const [formData, setFormData] = useState<Widget>({
    id: '',
    type: 'counter',
    title: '',
    position: { x: 50, y: 50, width: 300, height: 200 },
    config: {}
  });

  useEffect(() => {
    if (widget) {
      setFormData(widget);
    } else {
      setFormData({
        id: `widget-${Date.now()}`,
        type: 'counter',
        title: 'Nuevo Widget',
        position: { x: 50, y: 50, width: 300, height: 200 },
        config: {
          mostrarTitulo: true
        }
      });
    }
  }, [widget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateConfig = (key: keyof WidgetConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  };

  const updateBasic = (key: keyof Widget, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const camposDisponibles = columnas.map(col => col.nombre);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {widget ? 'Editar Widget' : 'Nuevo Widget'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configuración básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateBasic('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Widget
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateBasic('type', e.target.value as WidgetType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIPOS_WIDGET.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {TIPOS_WIDGET.find(t => t.value === formData.type)?.description}
              </p>
            </div>
          </div>

          {/* Configuración específica del widget */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Configuración del Widget</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.config.mostrarTitulo !== false}
                    onChange={(e) => updateConfig('mostrarTitulo', e.target.checked)}
                    className="mr-2"
                  />
                  Mostrar título
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.config.descripcion || ''}
                  onChange={(e) => updateConfig('descripcion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              {/* Configuración para widgets de contador y progreso */}
              {(['counter', 'progress'].includes(formData.type)) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campo
                    </label>
                    <select
                      value={formData.config.campo || ''}
                      onChange={(e) => updateConfig('campo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar campo</option>
                      {camposDisponibles.map(campo => (
                        <option key={campo} value={campo}>
                          {campo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.type === 'counter' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Operación
                        </label>
                        <select
                          value={formData.config.operacion || 'count'}
                          onChange={(e) => updateConfig('operacion', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {OPERADORES.map(op => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Formato
                        </label>
                        <select
                          value={formData.config.formato || 'number'}
                          onChange={(e) => updateConfig('formato', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {FORMATOS.map(formato => (
                            <option key={formato.value} value={formato.value}>
                              {formato.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Configuración para gráficos */}
              {(['chart-bar', 'chart-pie'].includes(formData.type)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campo para graficar
                  </label>
                  <select
                    value={formData.config.campoX || ''}
                    onChange={(e) => updateConfig('campoX', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar campo</option>
                    {camposDisponibles.map(campo => (
                      <option key={campo} value={campo}>
                        {campo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Configuración para tabla */}
              {formData.type === 'table' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Columnas a mostrar
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {camposDisponibles.map(campo => (
                        <label key={campo} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            checked={formData.config.columnas?.includes(campo) || false}
                            onChange={(e) => {
                              const columnas = formData.config.columnas || [];
                              if (e.target.checked) {
                                updateConfig('columnas', [...columnas, campo]);
                              } else {
                                updateConfig('columnas', columnas.filter(c => c !== campo));
                              }
                            }}
                            className="mr-2"
                          />
                          {campo}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Límite de filas
                    </label>
                    <input
                      type="number"
                      value={formData.config.limiteFilas || 10}
                      onChange={(e) => updateConfig('limiteFilas', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="100"
                    />
                  </div>
                </>
              )}

              {/* Configuración para widget de texto */}
              {formData.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido
                  </label>
                  <textarea
                    value={formData.config.contenido || ''}
                    onChange={(e) => updateConfig('contenido', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Ejemplo: Total de personas: {totalPersonas}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usa variables como {'{totalPersonas}'} para mostrar datos dinámicos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Posición y tamaño */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Posición y Tamaño</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X
                </label>
                <input
                  type="number"
                  value={formData.position.x}
                  onChange={(e) => updateBasic('position', {
                    ...formData.position,
                    x: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y
                </label>
                <input
                  type="number"
                  value={formData.position.y}
                  onChange={(e) => updateBasic('position', {
                    ...formData.position,
                    y: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ancho
                </label>
                <input
                  type="number"
                  value={formData.position.width}
                  onChange={(e) => updateBasic('position', {
                    ...formData.position,
                    width: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alto
                </label>
                <input
                  type="number"
                  value={formData.position.height}
                  onChange={(e) => updateBasic('position', {
                    ...formData.position,
                    height: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="150"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
