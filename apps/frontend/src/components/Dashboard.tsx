import { useState, useMemo, type JSX } from "react";
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, FileText } from "lucide-react";
import { Card } from "./Card";
import { mockCommunityData } from "../utils/mocks";

type CommunityPerson = {
  id: number;
  rut: string;
  nombre: string;
  territorio: string;
  tipo: string;
  programa: string;
  email: string;
  telefono: string;
  fecha_registro: string;
};

type Filters = {
  territorio: string;
  tipo: string;
  programa: string;
};

const Dashboard = (): JSX.Element => {
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

  const filteredData = useMemo(() => {
    return mockCommunityData.filter((person) => {
      return (
        (filters.territorio
          ? person.territorio === filters.territorio
          : true) &&
        (filters.tipo ? person.tipo === filters.tipo : true) &&
        (filters.programa ? person.programa === filters.programa : true)
      );
    });
  }, [filters]);

  const territoryData = useMemo(() => {
    const counts: Record<string, number> = mockCommunityData.reduce(
      (acc: Record<string, number>, person: CommunityPerson) => {
        acc[person.territorio] = (acc[person.territorio] || 0) + 1;
        return acc;
      },
      {}
    );
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Principal</h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Total de Personas"
          value={mockCommunityData.length}
          icon={<Users className="text-white" />}
          color="bg-blue-500"
        />
        <Card
          title="Territorios Activos"
          value={territories.length}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          }
          color="bg-green-500"
        />
        <Card
          title="Programas/Proyectos"
          value={programs.length}
          icon={<FileText className="text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Distribución por Territorio
        </h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={territoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {territoryData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Comunidad</h2>
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
            onChange={(e) =>
              setFilters((f) => ({ ...f, tipo: e.target.value }))
            }
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
            onClick={() =>
              setFilters({ territorio: "", tipo: "", programa: "" })
            }
            className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300"
          >
            Limpiar Filtros
          </button>
        </div>

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
          {filteredData.length > 5 && (
            <p className="text-center mt-4 text-sm text-gray-500">
              ...y {filteredData.length - 5} más. Ve a la sección 'Comunidad'
              para ver todos los registros.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
