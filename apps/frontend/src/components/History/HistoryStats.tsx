import { Upload, Edit, Download } from "lucide-react";
import type { EstadisticasHistorial } from "@/services/historial.service";

interface HistoryStatsProps {
  estadisticas: EstadisticasHistorial;
}

export const HistoryStats = ({ estadisticas }: HistoryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Cargas</p>
            <p className="text-2xl font-bold text-blue-600">
              {estadisticas.cargas.total}
            </p>
            <p className="text-xs text-gray-400">
              Éxito: {estadisticas.cargas.tasaExito}%
            </p>
          </div>
          <Upload className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Modificaciones</p>
            <p className="text-2xl font-bold text-green-600">
              {estadisticas.modificaciones.total}
            </p>
          </div>
          <Edit className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Descargas</p>
            <p className="text-2xl font-bold text-purple-600">
              {estadisticas.descargas.total}
            </p>
          </div>
          <Download className="h-8 w-8 text-purple-500" />
        </div>
      </div>
    </div>
  );
};