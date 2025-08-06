import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TerritoryChartProps {
  territoryData: Array<{
    name: string;
    value: number;
  }>;
}

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const TerritoryChart = ({ territoryData }: TerritoryChartProps) => {
  return (
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
  );
};

export default TerritoryChart;
