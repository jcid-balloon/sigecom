import React from "react";
import { FiltroModular } from "./FiltroModular";
import type { DiccionarioColumna } from "@/types/columnas";
import type { FiltroModular as FiltroModularType } from "@/utils/filterUtils";

interface FiltrosAvanzadosProps {
  show: boolean;
  filtros: FiltroModularType[];
  columnas: DiccionarioColumna[];
  onToggle: () => void;
  onAddFilter: () => void;
  onUpdateFilter: (filtro: FiltroModularType) => void;
  onRemoveFilter: (id: string) => void;
  onClearAllFilters: () => void;
  onLogicChange: (id: string, logica: "AND" | "OR") => void;
}

export const FiltrosAvanzados: React.FC<FiltrosAvanzadosProps> = ({
  show,
  filtros,
  columnas,
  onToggle,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  onClearAllFilters,
  onLogicChange,
}) => {
  const contarFiltrosActivos = () => {
    return filtros.filter(
      (f) =>
        f.columna &&
        f.operador &&
        (f.valor !== "" || ["es_nulo", "no_es_nulo"].includes(f.operador))
    ).length;
  };

  return (
    <div>
      {/* Botón toggle de filtros avanzados */}
      <button
        onClick={onToggle}
        className={`px-3 py-1 rounded text-sm border transition-colors ${
          show
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
        }`}
      >
        Filtros avanzados
        {contarFiltrosActivos() > 0 && (
          <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
            {contarFiltrosActivos()}
          </span>
        )}
      </button>

      {/* Panel de filtros modulares */}
      {show && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Filtros avanzados
            </h4>
            <button
              onClick={onAddFilter}
              disabled={columnas.length === 0}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Agregar filtro
            </button>
          </div>

          {filtros.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay filtros aplicados</p>
              <p className="text-xs mt-1">
                Haga clic en "Agregar filtro" para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtros.map((filtro, index) => (
                <FiltroModular
                  key={filtro.id}
                  filtro={filtro}
                  index={index}
                  columnas={columnas}
                  onUpdate={onUpdateFilter}
                  onRemove={onRemoveFilter}
                  onLogicChange={onLogicChange}
                  showLogicSelector={index > 0}
                />
              ))}
            </div>
          )}

          {filtros.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {filtros.length} filtro{filtros.length !== 1 ? "s" : ""}{" "}
                  aplicado{filtros.length !== 1 ? "s" : ""}
                  {contarFiltrosActivos() !== filtros.length && (
                    <span className="text-orange-600 ml-1">
                      ({contarFiltrosActivos()} activo
                      {contarFiltrosActivos() !== 1 ? "s" : ""})
                    </span>
                  )}
                </span>
                <button
                  onClick={onClearAllFilters}
                  className="text-red-600 hover:text-red-800"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
