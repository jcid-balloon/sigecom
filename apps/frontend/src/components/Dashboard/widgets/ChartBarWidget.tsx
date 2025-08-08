import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Widget, DashboardData } from '@/types/dashboard';
import { dashboardService } from '@/services/dashboard.service';

interface ChartBarWidgetProps {
  widget: Widget;
  data: DashboardData;
}

export const ChartBarWidget: React.FC<ChartBarWidgetProps> = ({ widget, data }) => {
  const { config } = widget;
  
  const generarDatos = () => {
    if (!config.campoX) return [];
    
    const datosGrafico = dashboardService.generarDatosGrafico(data, config.campoX, 'bar');
    
    // Limitar a los primeros 10 elementos para mejor visualización
    return datosGrafico.slice(0, 10);
  };

  const datos = generarDatos();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border h-full flex flex-col">
      {config.mostrarTitulo !== false && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex-shrink-0">
          {config.titulo || widget.title}
        </h3>
      )}
      
      {datos.length > 0 ? (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 10, right: 15, left: 15, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nombre" 
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value) => [value, 'Cantidad']}
                labelFormatter={(label) => `${config.campoX}: ${label}`}
              />
              <Bar 
                dataKey="valor" 
                fill={config.colores?.[0] || '#3B82F6'} 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          <div className="text-center">
            <p>No hay datos disponibles</p>
            {config.campoX && (
              <p className="text-sm mt-2">Campo: {config.campoX}</p>
            )}
          </div>
        </div>
      )}
      
      {config.descripcion && (
        <p className="text-xs text-gray-600 mt-2 flex-shrink-0">{config.descripcion}</p>
      )}
    </div>
  );
};
