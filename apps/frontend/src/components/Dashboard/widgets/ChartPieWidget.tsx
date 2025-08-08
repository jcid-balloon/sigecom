import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Widget, DashboardData } from '@/types/dashboard';
import { dashboardService } from '@/services/dashboard.service';

interface ChartPieWidgetProps {
  widget: Widget;
  data: DashboardData;
}

const COLORES_DEFECTO = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export const ChartPieWidget: React.FC<ChartPieWidgetProps> = ({ widget, data }) => {
  const { config } = widget;
  
  const generarDatos = () => {
    if (!config.campoX) return [];
    
    const datosGrafico = dashboardService.generarDatosGrafico(data, config.campoX, 'pie');
    
    // Limitar a los primeros 8 elementos para mejor visualización
    return datosGrafico.slice(0, 8);
  };

  const datos = generarDatos();
  const colores = config.colores || COLORES_DEFECTO;

  const renderCustomLabel = ({ porcentaje }: any) => {
    return porcentaje > 5 ? `${porcentaje}%` : '';
  };

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
            <PieChart>
              <Pie
                data={datos}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius="70%"
                fill="#8884d8"
                dataKey="valor"
              >
                {datos.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Cantidad']}
                labelFormatter={(label) => `${config.campoX}: ${label}`}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconSize={12}
                fontSize={12}
                formatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
            </PieChart>
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
