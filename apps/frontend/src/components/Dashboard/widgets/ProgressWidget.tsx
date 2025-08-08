import React from 'react';
import type { Widget, DashboardData } from '@/types/dashboard';

interface ProgressWidgetProps {
  widget: Widget;
  data: DashboardData;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ widget, data }) => {
  const { config } = widget;
  
  const calcularProgreso = (): { valor: number; total: number; porcentaje: number } => {
    if (!config.campo) return { valor: 0, total: 100, porcentaje: 0 };
    
    const campoData = data.personasPorCampo[config.campo];
    if (!campoData) return { valor: 0, total: 100, porcentaje: 0 };
    
    const valor = campoData.total;
    const total = data.totalPersonas || 100;
    const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;
    
    return { valor, total, porcentaje };
  };

  const { valor, total, porcentaje } = calcularProgreso();

  const getColorClasse = (porcentaje: number): string => {
    if (porcentaje >= 80) return 'bg-green-500';
    if (porcentaje >= 60) return 'bg-blue-500';
    if (porcentaje >= 40) return 'bg-yellow-500';
    if (porcentaje >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border h-full flex flex-col">
      {config.mostrarTitulo !== false && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex-shrink-0">
          {config.titulo || widget.title}
        </h3>
      )}
      
      <div className="space-y-4">
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div
            className={`h-6 rounded-full transition-all duration-300 ${getColorClasse(porcentaje)}`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          ></div>
        </div>
        
        {/* Información del progreso */}
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            {porcentaje}%
          </div>
          <div className="text-sm text-gray-600">
            {valor} de {total}
          </div>
        </div>
        
        {/* Descripción del campo */}
        {config.campo && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Campo: <span className="font-medium">{config.campo}</span>
            </p>
          </div>
        )}
        
        {/* Etiquetas de estado */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
      
      {config.descripcion && (
        <p className="text-sm text-gray-600 mt-4 pt-4 border-t">
          {config.descripcion}
        </p>
      )}
    </div>
  );
};
