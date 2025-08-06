import {
  User,
  FileText,
  Download,
  Upload,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { HistorialCompleto } from "@/services/historial.service";

interface HistoryListProps {
  historial: HistorialCompleto[];
}

export const HistoryList = ({ historial }: HistoryListProps) => {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerIconoPorTipo = (tipo: string) => {
    switch (tipo) {
      case "carga":
        return <Upload className="h-4 w-4" />;
      case "modificacion":
        return <Edit className="h-4 w-4" />;
      case "descarga":
        return <Download className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const obtenerColorPorTipo = (tipo: string) => {
    switch (tipo) {
      case "carga":
        return "bg-blue-100 text-blue-800";
      case "modificacion":
        return "bg-green-100 text-green-800";
      case "descarga":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const obtenerEstadoIcon = (item: HistorialCompleto) => {
    if (item.tipoHistorial === "carga") {
      const carga = item as any;
      switch (carga.estado) {
        case "completado":
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "fallido":
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        case "procesando":
          return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
        default:
          return null;
      }
    }
    return null;
  };

  if (historial.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="text-center py-8">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            No se encontraron registros
          </p>
          <p className="text-gray-400 text-sm">
            No hay actividad en el rango de fechas seleccionado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Historial de Actividad ({historial.length} registros)
        </h3>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {historial.map((item) => (
          <div key={item._id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full ${obtenerColorPorTipo(
                    item.tipoHistorial
                  )}`}
                >
                  {obtenerIconoPorTipo(item.tipoHistorial)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorPorTipo(
                        item.tipoHistorial
                      )}`}
                    >
                      {item.tipoHistorial.toUpperCase()}
                    </span>
                    {obtenerEstadoIcon(item)}
                  </div>

                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {item.tipoHistorial === "carga" &&
                      `Carga: ${(item as any).nombreArchivo}`}
                    {item.tipoHistorial === "modificacion" &&
                      (item as any).resumenCambios}
                    {item.tipoHistorial === "descarga" &&
                      `Descarga de ${
                        (item as any).cantidadRegistros
                      } registros`}
                  </p>

                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {item.usuario?.nombre || "Sistema"}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatearFecha(item.fechaYHora)}
                    </span>
                  </div>

                  {/* Detalles específicos por tipo */}
                  {item.tipoHistorial === "carga" && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span>
                        Registros: {(item as any).cantidadRegistros || "N/A"}
                      </span>
                      <span className="ml-2">
                        Estado: {(item as any).estado}
                      </span>
                      {(item as any).errorMessage && (
                        <span className="ml-2 text-red-600">
                          Error: {(item as any).errorMessage}
                        </span>
                      )}
                    </div>
                  )}

                  {item.tipoHistorial === "descarga" && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span>Formato: {(item as any).formato || "N/A"}</span>
                      <span className="ml-2">
                        Registros: {(item as any).cantidadRegistros || "N/A"}
                      </span>
                    </div>
                  )}

                  {item.tipoHistorial === "modificacion" && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span>
                        Tipo: {(item as any).tipoModificacion || "N/A"}
                      </span>
                      {(item as any).estadisticas && (
                        <span className="ml-2">
                          Creados:{" "}
                          {(item as any).estadisticas.elementosCreados || 0} |
                          Modificados:{" "}
                          {(item as any).estadisticas.elementosModificados || 0}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
