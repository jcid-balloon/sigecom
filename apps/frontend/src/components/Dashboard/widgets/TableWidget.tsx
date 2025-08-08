import React from 'react';
import type { Widget, DashboardData } from '@/types/dashboard';

interface TableWidgetProps {
  widget: Widget;
  data: DashboardData;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget, data }) => {
  const { config } = widget;
  
  const generarDatos = () => {
    if (!config.columnas?.length) return [];
    
    const limite = config.limiteFilas || 10;
    return data.datosProcesados.slice(0, limite);
  };

  const datos = generarDatos();
  const columnas = config.columnas || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
      {config.mostrarTitulo !== false && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {config.titulo || widget.title}
        </h3>
      )}
      
      {datos.length > 0 && columnas.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                {columnas.map((columna) => (
                  <th
                    key={columna}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datos.map((persona, index) => (
                <tr key={persona._id || index} className="hover:bg-gray-50">
                  {columnas.map((columna) => (
                    <td
                      key={columna}
                      className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200"
                    >
                      {persona.datosAdicionales?.[columna] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.datosProcesados.length > (config.limiteFilas || 10) && (
            <p className="text-sm text-gray-500 mt-2">
              Mostrando {datos.length} de {data.datosProcesados.length} registros
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p>No hay datos disponibles</p>
            {(!columnas.length) && (
              <p className="text-sm mt-2">Configura las columnas a mostrar</p>
            )}
          </div>
        </div>
      )}
      
      {config.descripcion && (
        <p className="text-sm text-gray-600 mt-4">{config.descripcion}</p>
      )}
    </div>
  );
};
