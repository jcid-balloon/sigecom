import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import type { DashboardFilter } from '@/types/dashboard';
import type { DiccionarioColumna } from '@/types/columnas';

interface DashboardFiltersProps {
  filtros: DashboardFilter[];
  columnas: DiccionarioColumna[];
  onChange: (filtros: DashboardFilter[]) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filtros,
  columnas,
  onChange
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const agregarFiltro = () => {
    const nuevoFiltro: DashboardFilter = {
      id: `filtro-${Date.now()}`,
      campo: '',
      operador: 'eq',
      valor: '',
      activo: true
    };
    onChange([...filtros, nuevoFiltro]);
  };

  const actualizarFiltro = (id: string, updates: Partial<DashboardFilter>) => {
    onChange(filtros.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const eliminarFiltro = (id: string) => {
    onChange(filtros.filter(f => f.id !== id));
  };

  const limpiarFiltros = () => {
    onChange([]);
  };

  const filtrosActivos = filtros.filter(f => f.activo);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header de filtros */}
      <div className="p-4 border-b">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <span className="font-medium text-gray-800">
              Filtros del Dashboard
            </span>
            {filtrosActivos.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {filtrosActivos.length}
              </span>
            )}
          </div>
          {mostrarFiltros ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Contenido de filtros */}
      {mostrarFiltros && (
        <div className="p-4 space-y-4">
          {filtros.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No hay filtros aplicados</p>
              <button
                onClick={agregarFiltro}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Agregar Primer Filtro
              </button>
            </div>
          ) : (
            <>
              {/* Lista de filtros */}
              <div className="space-y-3">
                {filtros.map((filtro) => (
                  <div key={filtro.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {/* Checkbox activo */}
                    <input
                      type="checkbox"
                      checked={filtro.activo}
                      onChange={(e) => actualizarFiltro(filtro.id, { activo: e.target.checked })}
                      className="rounded border-gray-300"
                    />

                    {/* Campo */}
                    <select
                      value={filtro.campo}
                      onChange={(e) => actualizarFiltro(filtro.id, { campo: e.target.value })}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar campo</option>
                      {columnas.map(columna => (
                        <option key={columna._id} value={columna.nombre}>
                          {columna.descripcion || columna.nombre}
                        </option>
                      ))}
                    </select>

                    {/* Operador */}
                    <select
                      value={filtro.operador}
                      onChange={(e) => actualizarFiltro(filtro.id, { operador: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="eq">Igual a</option>
                      <option value="contains">Contiene</option>
                      <option value="gt">Mayor que</option>
                      <option value="lt">Menor que</option>
                      <option value="ne">Diferente de</option>
                      <option value="startsWith">Empieza con</option>
                      <option value="endsWith">Termina con</option>
                    </select>

                    {/* Valor */}
                    <input
                      type="text"
                      value={filtro.valor}
                      onChange={(e) => actualizarFiltro(filtro.id, { valor: e.target.value })}
                      placeholder="Valor"
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md"
                    />

                    {/* Botón eliminar */}
                    <button
                      onClick={() => eliminarFiltro(filtro.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Eliminar filtro"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Controles */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={agregarFiltro}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar Filtro</span>
                </button>

                {filtros.length > 0 && (
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Limpiar Todo
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
