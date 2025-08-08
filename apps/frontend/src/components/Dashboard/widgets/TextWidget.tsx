import React from 'react';
import type { Widget, DashboardData } from '@/types/dashboard';

interface TextWidgetProps {
  widget: Widget;
  data: DashboardData;
}

export const TextWidget: React.FC<TextWidgetProps> = ({ widget, data }) => {
  const { config } = widget;
  
  const procesarContenido = (contenido: string): string => {
    if (!contenido) return '';
    
    // Reemplazar variables dinámicas
    let contenidoProcesado = contenido;
    
    // Variable para total de personas
    contenidoProcesado = contenidoProcesado.replace(/\{totalPersonas\}/g, data.totalPersonas.toString());
    
    // Variables para campos específicos
    Object.keys(data.personasPorCampo).forEach(campo => {
      const campoData = data.personasPorCampo[campo];
      contenidoProcesado = contenidoProcesado.replace(
        new RegExp(`\\{${campo}\\.total\\}`, 'g'), 
        campoData.total.toString()
      );
      contenidoProcesado = contenidoProcesado.replace(
        new RegExp(`\\{${campo}\\.unicos\\}`, 'g'), 
        campoData.valoresUnicos.toString()
      );
    });
    
    return contenidoProcesado;
  };

  const contenido = procesarContenido(config.contenido || '');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
      {config.mostrarTitulo !== false && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {config.titulo || widget.title}
        </h3>
      )}
      
      <div className="prose prose-sm max-w-none">
        {contenido ? (
          <div className="whitespace-pre-wrap text-gray-700">
            {contenido}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Configura el contenido del widget de texto
          </div>
        )}
      </div>
      
      {config.descripcion && (
        <p className="text-sm text-gray-600 mt-4 border-t pt-4">
          {config.descripcion}
        </p>
      )}
      
      {/* Mostrar variables disponibles si no hay contenido */}
      {!config.contenido && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
          <h4 className="font-medium text-gray-800 mb-2">Variables disponibles:</h4>
          <ul className="text-gray-600 space-y-1">
            <li><code>{'{totalPersonas}'}</code> - Total de personas</li>
            {Object.keys(data.personasPorCampo).slice(0, 3).map(campo => (
              <li key={campo}>
                <code>{`{${campo}.total}`}</code> - Total para {campo}
              </li>
            ))}
            <li className="text-xs text-gray-500">...y más según tus datos</li>
          </ul>
        </div>
      )}
    </div>
  );
};
