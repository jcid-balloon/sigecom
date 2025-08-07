interface Filters {
  territorio: string;
  tipo: string;
  programa: string;
}

interface DashboardFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  territories: string[];
  personTypes: string[];
  programs: string[];
}

const DashboardFilters = ({
  filters,
  setFilters,
  territories,
  personTypes,
  programs,
}: DashboardFiltersProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <select
        onChange={(e) =>
          setFilters((f) => ({ ...f, territorio: e.target.value }))
        }
        className="w-full p-2 border border-gray-300 rounded-lg"
        value={filters.territorio}
      >
        <option value="">Todos los Territorios</option>
        {territories.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        onChange={(e) => setFilters((f) => ({ ...f, tipo: e.target.value }))}
        className="w-full p-2 border border-gray-300 rounded-lg"
        value={filters.tipo}
      >
        <option value="">Todos los Tipos</option>
        {personTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        onChange={(e) =>
          setFilters((f) => ({ ...f, programa: e.target.value }))
        }
        className="w-full p-2 border border-gray-300 rounded-lg"
        value={filters.programa}
      >
        <option value="">Todos los Programas</option>
        {programs.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <button
        onClick={() => setFilters({ territorio: "", tipo: "", programa: "" })}
        className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300"
      >
        Limpiar Filtros
      </button>
    </div>
  );
};

export default DashboardFilters;
