import { useState, useEffect } from "react";
import { historialService } from "@/services/historial.service";
import type {
  HistorialCompleto,
  EstadisticasHistorial,
} from "@/services/historial.service";
import { HistoryStats } from "./HistoryStats";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryList } from "./HistoryList";
import { LoadingState, ErrorState } from "./HistoryStates";

interface HistorialProps {
  tipoFiltro?: "todos" | "carga" | "modificacion" | "descarga";
}

export const Historial = ({ tipoFiltro = "todos" }: HistorialProps) => {
  const [historialCompleto, setHistorialCompleto] = useState<HistorialCompleto[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasHistorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<
    "todos" | "carga" | "modificacion" | "descarga"
  >(tipoFiltro);
  const [filtroFecha, setFiltroFecha] = useState({ desde: "", hasta: "" });

  // Filtrar historial según el tipo seleccionado
  const historial = filtroTipo === "todos" 
    ? historialCompleto 
    : historialCompleto.filter(item => item.tipoHistorial === filtroTipo);

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, [filtroFecha]); // Solo recargar cuando cambien las fechas

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Cargando historial...");
      const [historialResponse, estadisticasResponse] = await Promise.all([
        historialService.obtenerTodoElHistorial({
          limit: 50,
          fechaDesde: filtroFecha.desde || undefined,
          fechaHasta: filtroFecha.hasta || undefined,
        }),
        historialService.obtenerEstadisticasHistorial(),
      ]);

      if (historialResponse.success && estadisticasResponse.success) {
        setHistorialCompleto(historialResponse.data);
        setEstadisticas(estadisticasResponse.data);
        console.log("Datos cargados correctamente");
      } else {
        console.error(
          "Error en las respuestas:",
          historialResponse,
          estadisticasResponse
        );
        setError("Error al cargar los datos del historial");
        return;
      }
    } catch (error: any) {
      console.error("Error cargando historial:", error);
      setError(error.message || "Error desconocido al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Historial de Actividad</h1>

      {/* Estados de carga y error */}
      <LoadingState loading={loading} />
      <ErrorState error={error} onRetry={cargarDatos} />

      {/* Contenido principal cuando no hay loading ni error */}
      {!loading && !error && (
        <>
          {/* Estadísticas */}
          {estadisticas && <HistoryStats estadisticas={estadisticas} />}

          {/* Filtros */}
          <HistoryFilters
            filtroTipo={filtroTipo}
            setFiltroTipo={setFiltroTipo}
            filtroFecha={filtroFecha}
            setFiltroFecha={setFiltroFecha}
          />

          {/* Lista de historial */}
          <HistoryList historial={historial} />
        </>
      )}
    </div>
  );
};

export default Historial;
