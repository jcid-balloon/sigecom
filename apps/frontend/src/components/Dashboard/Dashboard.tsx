import { useState, useMemo } from "react";
import { mockCommunityData } from "@/utils/mocks";
import MetricsCards from "./MetricsCards";
import TerritoryChart from "./TerritoryChart";
import DashboardFilters from "./DashboardFilters";

type Filters = {
  territorio: string;
  tipo: string;
  programa: string;
};

const Dashboard = () => {
  // Datos únicos para filtros
  const territories = useMemo(
    () => [...new Set(mockCommunityData.map((p) => p.territorio))],
    []
  );
  const personTypes = useMemo(
    () => [...new Set(mockCommunityData.map((p) => p.tipo))],
    []
  );
  const programs = useMemo(
    () => [
      ...new Set(
        mockCommunityData.map((p) => p.programa).filter((p) => p !== "N/A")
      ),
    ],
    []
  );

  const [filters, setFilters] = useState<Filters>({
    territorio: "",
    tipo: "",
    programa: "",
  });

  // Datos filtrados
  const filteredData = useMemo(() => {
    return mockCommunityData.filter((person) => {
      return (
        (filters.territorio === "" ||
          person.territorio === filters.territorio) &&
        (filters.tipo === "" || person.tipo === filters.tipo) &&
        (filters.programa === "" || person.programa === filters.programa)
      );
    });
  }, [filters]);

  // Datos para el gráfico de territorio
  const territoryData = useMemo(() => {
    const counts: Record<string, number> = mockCommunityData.reduce(
      (acc, person) => {
        acc[person.territorio] = (acc[person.territorio] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Principal</h1>

      {/* Métricas */}
      <MetricsCards
        totalPersonas={mockCommunityData.length}
        totalTerritorios={territories.length}
        totalProgramas={programs.length}
      />

      {/* Gráfico de distribución */}
      <TerritoryChart territoryData={territoryData} />

      {/* Sección de comunidad con filtros y tabla */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Comunidad</h2>

        {/* Filtros */}
        <DashboardFilters
          filters={filters}
          setFilters={setFilters}
          territories={territories}
          personTypes={personTypes}
          programs={programs}
        />

        {/* Tabla de vista previa */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUT
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Territorio
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programa
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.slice(0, 5).map((person) => (
                <tr key={person.id}>
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {person.nombre}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {person.rut}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {person.territorio}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {person.tipo}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {person.programa}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length > 5 && (
          <p className="text-sm text-gray-600 mt-4 text-center">
            ...y {filteredData.length - 5} más. Ve a la sección 'Comunidad' para
            ver todos los registros.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
