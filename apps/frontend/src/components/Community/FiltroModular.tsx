import React from "react";
import { Trash2 } from "lucide-react";
import type { DiccionarioColumna } from "@/types/columnas";
import type { FiltroModular as FiltroModularType } from "@/utils/filterUtils";
import { obtenerOperadores } from "@/utils/filterUtils";

interface FiltroModularProps {
  filtro: FiltroModularType;
  index: number;
  columnas: DiccionarioColumna[];
  onUpdate: (filtro: FiltroModularType) => void;
  onRemove: (id: string) => void;
  onLogicChange?: (id: string, logica: "AND" | "OR") => void;
  showLogicSelector?: boolean;
}

export const FiltroModular: React.FC<FiltroModularProps> = ({
  filtro,
  index,
  columnas,
  onUpdate,
  onRemove,
  onLogicChange,
  showLogicSelector = true,
}) => {
  const columnaSeleccionada = columnas.find(
    (col) => col.nombre === filtro.columna
  );
  const operadoresDisponibles = columnaSeleccionada
    ? obtenerOperadores(columnaSeleccionada.tipo)
    : [];

  const actualizarFiltro = (campo: keyof FiltroModularType, valor: any) => {
    const filtroActualizado = { ...filtro, [campo]: valor };

    // Si cambió la columna, resetear operador y valor
    if (campo === "columna") {
      filtroActualizado.operador = "";
      filtroActualizado.valor = "";
    }

    onUpdate(filtroActualizado);
  };

  const renderCampoValor = () => {
    if (!columnaSeleccionada || !filtro.operador) return null;

    // Operadores que no necesitan valor
    if (["es_nulo", "no_es_nulo"].includes(filtro.operador)) {
      return (
        <div className="text-sm text-gray-500 italic px-3 py-2 bg-gray-100 rounded">
          Sin valor requerido
        </div>
      );
    }

    const tipoColumna = columnaSeleccionada.tipo;

    switch (tipoColumna) {
      case "boolean":
        return (
          <select
            value={filtro.valor || ""}
            onChange={(e) => actualizarFiltro("valor", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="true">Verdadero</option>
            <option value="false">Falso</option>
          </select>
        );

      case "select":
        let opciones: string[] = [];
        if (columnaSeleccionada.validacion) {
          try {
            opciones = JSON.parse(columnaSeleccionada.validacion);
          } catch (e) {
            opciones = [];
          }
        }

        return (
          <select
            value={filtro.valor || ""}
            onChange={(e) => actualizarFiltro("valor", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            {opciones.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        );

      case "date":
        if (filtro.operador === "entre") {
          return (
            <div className="flex gap-2">
              <input
                type="date"
                value={filtro.valor?.desde || ""}
                onChange={(e) =>
                  actualizarFiltro("valor", {
                    ...filtro.valor,
                    desde: e.target.value,
                  })
                }
                className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Desde"
              />
              <input
                type="date"
                value={filtro.valor?.hasta || ""}
                onChange={(e) =>
                  actualizarFiltro("valor", {
                    ...filtro.valor,
                    hasta: e.target.value,
                  })
                }
                className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Hasta"
              />
            </div>
          );
        } else {
          return (
            <input
              type="date"
              value={filtro.valor || ""}
              onChange={(e) => actualizarFiltro("valor", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          );
        }

      case "number":
        if (filtro.operador === "entre") {
          return (
            <div className="flex gap-2">
              <input
                type="number"
                value={filtro.valor?.desde || ""}
                onChange={(e) =>
                  actualizarFiltro("valor", {
                    ...filtro.valor,
                    desde: e.target.value,
                  })
                }
                className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Desde"
              />
              <input
                type="number"
                value={filtro.valor?.hasta || ""}
                onChange={(e) =>
                  actualizarFiltro("valor", {
                    ...filtro.valor,
                    hasta: e.target.value,
                  })
                }
                className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Hasta"
              />
            </div>
          );
        } else {
          return (
            <input
              type="number"
              value={filtro.valor || ""}
              onChange={(e) => actualizarFiltro("valor", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          );
        }

      default: // string, email, phone
        return (
          <input
            type="text"
            value={filtro.valor || ""}
            onChange={(e) => actualizarFiltro("valor", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            placeholder={`Ingrese ${columnaSeleccionada.nombre}...`}
          />
        );
    }
  };

  return (
    <div className="p-3 bg-white border rounded-lg">
      {/* Selector de lógica (AND/OR) */}
      {showLogicSelector && index > 0 && onLogicChange && (
        <div className="flex items-center mb-3">
          <span className="text-xs text-gray-500 mr-2">Condición:</span>
          <select
            value={filtro.logica}
            onChange={(e) =>
              onLogicChange(filtro.id, e.target.value as "AND" | "OR")
            }
            className="text-xs border rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
          >
            <option value="AND">Y (AND)</option>
            <option value="OR">O (OR)</option>
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {/* Selector de columna */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={filtro.columna}
            onChange={(e) => actualizarFiltro("columna", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Columna...</option>
            {columnas.map((col) => (
              <option key={col._id} value={col.nombre}>
                {col.nombre} ({col.tipo})
              </option>
            ))}
          </select>
        </div>

        {/* Selector de operador */}
        <div className="flex-1 min-w-[120px]">
          <select
            value={filtro.operador}
            onChange={(e) => actualizarFiltro("operador", e.target.value)}
            disabled={!filtro.columna}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Operador...</option>
            {operadoresDisponibles.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campo de valor */}
        <div className="flex-1 min-w-[150px]">{renderCampoValor()}</div>

        {/* Botón eliminar */}
        <button
          onClick={() => onRemove(filtro.id)}
          className="text-red-500 hover:text-red-700 p-1"
          title="Eliminar filtro"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
