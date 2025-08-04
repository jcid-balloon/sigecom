import { useState, useEffect, type JSX } from "react";
import {
  Calendar,
  User,
  FileText,
  Download,
  Upload,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { historialService } from "../services/historial.service";
import type {
  HistorialCompleto,
  EstadisticasHistorial,
} from "../services/historial.service";

interface HistorialProps {
  tipoFiltro?: "todos" | "carga" | "modificacion" | "descarga";
}

export const Historial = ({
  tipoFiltro = "todos",
}: HistorialProps): JSX.Element => {
  const [historial, setHistorial] = useState<HistorialCompleto[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasHistorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<
    "todos" | "carga" | "modificacion" | "descarga"
  >(tipoFiltro);
  const [filtroFecha, setFiltroFecha] = useState({ desde: "", hasta: "" });

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, [filtroTipo, filtroFecha]);

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

      console.log("Respuesta del historial:", historialResponse);
      console.log("Respuesta de estadísticas:", estadisticasResponse);

      // Verificar estructura de la respuesta
      if (!historialResponse || !historialResponse.data) {
        console.error("Respuesta de historial inválida:", historialResponse);
        setError("Respuesta de historial inválida del servidor");
        return;
      }

      let historialFiltrado = historialResponse.data;

      // Filtrar por tipo si no es 'todos'
      if (filtroTipo !== "todos") {
        historialFiltrado = historialFiltrado.filter(
          (item) => item.tipoHistorial === filtroTipo
        );
      }

      console.log("Historial filtrado:", historialFiltrado);
      setHistorial(historialFiltrado);
      setEstadisticas(estadisticasResponse.data);
    } catch (err: any) {
      console.error("Error al cargar historial:", err);
      setError(err.response?.data?.detail || "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">
            Error al cargar el historial
          </p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {estadisticas && (
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
      )}

      {/* Filtros */}
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

          <button
            onClick={() => setFiltroFecha({ desde: "", hasta: "" })}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 mt-6"
          >
            Limpiar Fechas
          </button>
        </div>
      </div>

      {/* Lista de Historial */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Historial de Actividades
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {historial.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No se encontraron registros en el historial
              </p>
            </div>
          ) : (
            historial.map((item) => (
              <div
                key={item._id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${obtenerColorPorTipo(
                        item.tipoHistorial
                      )}`}
                    >
                      {obtenerIconoPorTipo(item.tipoHistorial)}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${obtenerColorPorTipo(
                            item.tipoHistorial
                          )}`}
                        >
                          {item.tipoHistorial.charAt(0).toUpperCase() +
                            item.tipoHistorial.slice(1)}
                        </span>
                        {obtenerEstadoIcon(item)}
                      </div>

                      <div className="text-sm text-gray-900 font-medium mb-1">
                        {item.tipoHistorial === "carga" &&
                          (item as any).nombreArchivo}
                        {item.tipoHistorial === "modificacion" &&
                          (item as any).resumenCambios}
                        {item.tipoHistorial === "descarga" &&
                          `Descarga en formato ${(item as any).formato}`}
                      </div>

                      {/* Mostrar contexto de operación si existe */}
                      {item.tipoHistorial === "modificacion" &&
                        (item as any).contextoOperacion && (
                          <div className="text-xs text-blue-600 mb-1 bg-blue-50 px-2 py-1 rounded">
                            {(item as any).contextoOperacion}
                          </div>
                        )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{item.usuario.nombre}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatearFecha(item.fechaYHora)}</span>
                        </span>
                        {(item.tipoHistorial === "carga" ||
                          item.tipoHistorial === "descarga") && (
                          <span>
                            {(item as any).cantidadRegistros} registros
                          </span>
                        )}
                      </div>

                      {/* Detalles adicionales según el tipo */}
                      {item.tipoHistorial === "modificacion" && (
                        <div className="space-y-1 text-xs text-blue-600 mb-1 bg-blue-50 px-2 py-1 rounded">
                          {/* Mostrar estadísticas para operaciones masivas */}
                          {(item as any).estadisticas && (
                            <div className="space-y-1">
                              <div className="font-medium">
                                Estadísticas de la operación:
                              </div>
                              {(item as any).estadisticas.elementosCreados >
                                0 && (
                                <div>
                                  • Creados:{" "}
                                  {(item as any).estadisticas.elementosCreados}
                                </div>
                              )}
                              {(item as any).estadisticas.elementosModificados >
                                0 && (
                                <div>
                                  • Modificados:{" "}
                                  {
                                    (item as any).estadisticas
                                      .elementosModificados
                                  }
                                </div>
                              )}
                              {(item as any).estadisticas.elementosEliminados >
                                0 && (
                                <div>
                                  • Eliminados:{" "}
                                  {
                                    (item as any).estadisticas
                                      .elementosEliminados
                                  }
                                </div>
                              )}
                              {(item as any).estadisticas.errores > 0 && (
                                <div className="text-red-600">
                                  • Errores:{" "}
                                  {(item as any).estadisticas.errores}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Mostrar campos modificados para operaciones individuales */}
                          {(item as any).camposModificados &&
                            (item as any).camposModificados.length > 0 && (
                              <div className="space-y-1 text-xs text-blue-600 mb-1 bg-blue-50 px-2 py-1 rounded">
                                <div className="font-medium">
                                  Campos modificados:
                                </div>
                                {(item as any).camposModificados.map(
                                  (campo: any, index: number) => (
                                    <div key={index} className="ml-2">
                                      <span className="font-medium">
                                        {campo.campo}:
                                      </span>
                                      <span className="ml-1">
                                        "{campo.valorAnterior}" → "
                                        {campo.valorNuevo}"
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                          {/* Backward compatibility: mostrar campo individual si existe */}
                          {(item as any).campoModificado &&
                            !(item as any).camposModificados && (
                              <div>
                                <span className="font-medium">Campo:</span>{" "}
                                {(item as any).campoModificado}
                                {(item as any).valorAnterior &&
                                  (item as any).valorNuevo && (
                                    <span className="ml-2">
                                      "{(item as any).valorAnterior}" → "
                                      {(item as any).valorNuevo}"
                                    </span>
                                  )}
                              </div>
                            )}
                        </div>
                      )}

                      {item.tipoHistorial === "carga" &&
                        (item as any).errorMessage && (
                          <div className="text-xs text-red-600 mt-1">
                            <span className="font-medium">Error:</span>{" "}
                            {(item as any).errorMessage}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {historial.length > 0 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                /* TODO: Implementar paginación */
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Cargar más registros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
