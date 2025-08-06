interface FiltroFecha {
  desde: string;
  hasta: string;
}

interface HistoryFiltersProps {
  filtroTipo: "todos" | "carga" | "modificacion" | "descarga";
  setFiltroTipo: React.Dispatch<
    React.SetStateAction<"todos" | "carga" | "modificacion" | "descarga">
  >;
  filtroFecha: FiltroFecha;
  setFiltroFecha: React.Dispatch<React.SetStateAction<FiltroFecha>>;
}

export const HistoryFilters = ({
  filtroTipo,
  setFiltroTipo,
  filtroFecha,
  setFiltroFecha,
}: HistoryFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Tipo:
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="carga">Cargas</option>
            <option value="modificacion">Modificaciones</option>
            <option value="descarga">Descargas</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Desde:
          </label>
          <input
            type="date"
            value={filtroFecha.desde}
            onChange={(e) =>
              setFiltroFecha((prev) => ({ ...prev, desde: e.target.value }))
            }
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Hasta:
          </label>
          <input
            type="date"
            value={filtroFecha.hasta}
            onChange={(e) =>
              setFiltroFecha((prev) => ({ ...prev, hasta: e.target.value }))
            }
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setFiltroFecha({ desde: "", hasta: "" })}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300"
          >
            Limpiar fechas
          </button>
        </div>
      </div>
    </div>
  );
};
