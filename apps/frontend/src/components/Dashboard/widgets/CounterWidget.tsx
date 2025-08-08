import React from 'react';
import type { Widget, DashboardData } from '@/types/dashboard';

interface CounterWidgetProps {
  widget: Widget;
  data: DashboardData;
}

export const CounterWidget: React.FC<CounterWidgetProps> = ({ widget, data }) => {
  const { config } = widget;
  
  const calcularValor = (): number => {
    if (!config.campo) return 0;
    
    const campoData = data.personasPorCampo[config.campo];
    if (!campoData) return 0;
    
    switch (config.operacion) {
      case 'count':
        return campoData.total;
      case 'sum':
        // Para suma, necesitaríamos valores numéricos
        return Object.values(campoData.valores).reduce((acc: number, val) => acc + (val as number), 0);
      default:
        return campoData.total;
    }
  };

  const formatearValor = (valor: number): string => {
    switch (config.formato) {
      case 'currency':
        return new Intl.NumberFormat('es-CL', { 
          style: 'currency', 
          currency: 'CLP' 
        }).format(valor);
      case 'percentage':
        return `${valor}%`;
      default:
        return new Intl.NumberFormat('es-CL').format(valor);
    }
  };

  const valor = calcularValor();
  const valorFormateado = formatearValor(valor);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      {config.mostrarTitulo !== false && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {config.titulo || widget.title}
        </h3>
      )}
      
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {valorFormateado}
        </div>
        
        {config.descripcion && (
          <p className="text-sm text-gray-600">{config.descripcion}</p>
        )}
        
        {config.campo && (
          <p className="text-xs text-gray-500 mt-2">
            Campo: {config.campo}
          </p>
        )}
      </div>
    </div>
  );
};
