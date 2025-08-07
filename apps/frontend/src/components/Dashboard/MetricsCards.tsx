import { Users, FileText } from "lucide-react";
import { Card } from "@/components/Card";

interface MetricsCardsProps {
  totalPersonas: number;
  totalTerritorios: number;
  totalProgramas: number;
}

const MetricsCards = ({
  totalPersonas,
  totalTerritorios,
  totalProgramas,
}: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        title="Total de Personas"
        value={totalPersonas}
        icon={<Users className="text-white" />}
        color="bg-blue-500"
      />
      <Card
        title="Territorios Activos"
        value={totalTerritorios}
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
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        color="bg-green-500"
      />
      <Card
        title="Programas Activos"
        value={totalProgramas}
        icon={<FileText className="text-white" />}
        color="bg-purple-500"
      />
    </div>
  );
};

export default MetricsCards;
