import React from 'react';
import { Search, Download, UserPlus } from 'lucide-react';

interface ControlsCommunityProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onDownload: (format: 'CSV' | 'EXCEL') => void;
  onShowCreateForm: () => void;
  isDownloading?: boolean;
  totalPersonas: number;
  personasFiltradas: number;
  filtrosActivos: number;
}

export const ControlsCommunity: React.FC<ControlsCommunityProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onDownload,
  onShowCreateForm,
  isDownloading = false,
  totalPersonas,
  personasFiltradas,
  filtrosActivos
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      {/* Título y botones principales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Comunidad</h2>
          <p className="text-gray-600 mt-1">
            Gestión de personas de la comunidad
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onShowCreateForm}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nueva Persona</span>
          </button>

          <div className="relative">
            <button
              onClick={() => onDownload('CSV')}
              disabled={isDownloading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Descargando...' : 'CSV'}</span>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => onDownload('EXCEL')}
              disabled={isDownloading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Descargando...' : 'Excel'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar en todos los campos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas mejoradas */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <span>Total: {totalPersonas}</span>
        <span>Mostrando: {personasFiltradas}</span>
        {searchTerm && (
          <span className="text-blue-600">
            Búsqueda: "{searchTerm}"
          </span>
        )}
        {filtrosActivos > 0 && (
          <span className="text-blue-600">
            Filtros activos: {filtrosActivos}
          </span>
        )}
      </div>
    </div>
  );
};
