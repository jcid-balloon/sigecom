import { useState, useEffect, type JSX } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Upload,
  X,
  AlertCircle,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { PersonaComunidadTemporalService } from "../services/persona-comunidad-temporal.service";
import { diccionarioColumnaService } from "../services/diccionario-columna.service";
import { ValidacionFrontend } from "../utils/validacion-frontend";
import type {
  PersonaComunidadTemporal,
  EstadoPreviewPersona,
  PreviewSesion,
} from "../types/persona-comunidad-temporal";
import type { DiccionarioColumna } from "../types/columnas";

interface PreviewCargaMasivaProps {
  sesionId: string;
  onConfirmarCarga: () => void;
  onCancelar: () => void;
}

export const PreviewCargaMasiva = ({
  sesionId,
  onConfirmarCarga,
  onCancelar,
}: PreviewCargaMasivaProps): JSX.Element => {
  const [preview, setPreview] = useState<PreviewSesion | null>(null);
  const [columnas, setColumnas] = useState<DiccionarioColumna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Record<string, string>>({});
  const [confirmandoCarga, setConfirmandoCarga] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [sesionId]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar preview y columnas en paralelo
      const [previewResponse, columnasResponse] = await Promise.all([
        PersonaComunidadTemporalService.obtenerPreviewPorSesion(sesionId),
        diccionarioColumnaService.obtenerColumnasParaFrontend(),
      ]);

      if (previewResponse.success) {
        setPreview(previewResponse.data);
      } else {
        throw new Error("Error al cargar previsualización");
      }

      setColumnas(columnasResponse || []);
    } catch (err: any) {
      console.error("Error cargando datos:", err);
      setError(
        err.response?.data?.message || err.message || "Error al cargar datos"
      );
    } finally {
      setLoading(false);
    }
  };

  const obtenerClaseEstado = (estado: EstadoPreviewPersona) => {
    switch (estado) {
      case "nuevo":
        return "bg-green-50 border-green-200";
      case "actualizar":
        return "bg-blue-50 border-blue-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "sin_cambios":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const obtenerIconoEstado = (estado: EstadoPreviewPersona) => {
    switch (estado) {
      case "nuevo":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "actualizar":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "sin_cambios":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const obtenerTextoEstado = (estado: EstadoPreviewPersona) => {
    switch (estado) {
      case "nuevo":
        return "Nuevo";
      case "actualizar":
        return "Actualizar";
      case "error":
        return "Error";
      case "sin_cambios":
        return "Sin cambios";
      default:
        return estado;
    }
  };

  const iniciarEdicion = (registro: PersonaComunidadTemporal) => {
    if (registro._id) {
      setEditingId(registro._id);
      setEditingData(registro.datosAdicionales);
    }
  };

  const guardarEdicion = async () => {
    if (!editingId) return;

    try {
      // Validar datos antes de enviar
      const errores = ValidacionFrontend.validarFormulario(
        editingData,
        columnas
      );
      if (errores.length > 0) {
        // Mostrar errores específicos por campo
        const erroresDetallados = errores
          .map((e) => `${e.campo}: ${e.mensaje}`)
          .join("\n");
        setError(`Errores de validación:\n${erroresDetallados}`);
        return;
      }

      const response =
        await PersonaComunidadTemporalService.actualizarRegistroTemporal(
          editingId,
          editingData
        );

      if (response.success) {
        // Actualizar el registro en el preview local
        setPreview((prev) => {
          if (!prev) return prev;

          const registrosActualizados = prev.registros.map((r) =>
            r._id === editingId ? response.data : r
          );

          // Recalcular resumen
          const nuevos = registrosActualizados.filter(
            (r) => r.estado === "nuevo"
          ).length;
          const actualizaciones = registrosActualizados.filter(
            (r) => r.estado === "actualizar"
          ).length;
          const errores = registrosActualizados.filter(
            (r) => r.estado === "error"
          ).length;
          const sinCambios = registrosActualizados.filter(
            (r) => r.estado === "sin_cambios"
          ).length;

          return {
            registros: registrosActualizados,
            resumen: {
              total: registrosActualizados.length,
              nuevos,
              actualizaciones,
              errores,
              sinCambios,
            },
          };
        });

        setEditingId(null);
        setEditingData({});
        setError(null);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al actualizar registro"
      );
    }
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setEditingData({});
    setError(null);
  };

  const eliminarRegistro = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este registro?"))
      return;

    try {
      const response =
        await PersonaComunidadTemporalService.eliminarRegistroTemporal(id);

      if (response.success) {
        // Remover del preview local
        setPreview((prev) => {
          if (!prev) return prev;

          const registrosFiltrados = prev.registros.filter((r) => r._id !== id);

          // Recalcular resumen
          const nuevos = registrosFiltrados.filter(
            (r) => r.estado === "nuevo"
          ).length;
          const actualizaciones = registrosFiltrados.filter(
            (r) => r.estado === "actualizar"
          ).length;
          const errores = registrosFiltrados.filter(
            (r) => r.estado === "error"
          ).length;
          const sinCambios = registrosFiltrados.filter(
            (r) => r.estado === "sin_cambios"
          ).length;

          return {
            registros: registrosFiltrados,
            resumen: {
              total: registrosFiltrados.length,
              nuevos,
              actualizaciones,
              errores,
              sinCambios,
            },
          };
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al eliminar registro"
      );
    }
  };

  const confirmarCarga = async () => {
    if (!preview || preview.resumen.errores > 0) {
      setError("No se puede confirmar la carga mientras haya errores");
      return;
    }

    setConfirmandoCarga(true);
    try {
      const response =
        await PersonaComunidadTemporalService.confirmarCargaDefinitiva(
          sesionId
        );

      if (response.success) {
        onConfirmarCarga();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Error al confirmar carga"
      );
    } finally {
      setConfirmandoCarga(false);
    }
  };

  const renderValorCampo = (
    registro: PersonaComunidadTemporal,
    columna: DiccionarioColumna
  ) => {
    const valorNuevo = registro.datosAdicionales[columna.nombre] || "";
    const valorAnterior = registro.datosAnteriores?.[columna.nombre] || "";

    // Verificar si este campo específico tiene errores
    const tieneErrorEnCampo = registro.errores.some((error) =>
      error.toLowerCase().includes(columna.nombre.toLowerCase())
    );

    // Si es una actualización y hay diferencias, mostrar ambos valores
    if (registro.estado === "actualizar" && valorAnterior !== valorNuevo) {
      return (
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Anterior:</div>
          <div className="text-sm text-red-600 line-through bg-red-50 px-2 py-1 rounded">
            {valorAnterior || "-"}
          </div>
          <div className="text-xs text-gray-500">Nuevo:</div>
          <div
            className={`text-sm px-2 py-1 rounded font-medium ${
              tieneErrorEnCampo
                ? "text-red-700 bg-red-100 border border-red-300"
                : "text-green-700 bg-green-50"
            }`}
          >
            {valorNuevo || "-"}
          </div>
        </div>
      );
    }

    // Valor normal (con indicador de error si aplica)
    return (
      <span
        className={`${
          tieneErrorEnCampo
            ? "text-red-700 bg-red-100 px-2 py-1 rounded border border-red-300"
            : registro.estado === "error"
            ? "text-red-700"
            : "text-gray-900"
        }`}
      >
        {valorNuevo || "-"}
      </span>
    );
  };

  const renderCampoInput = (
    columna: DiccionarioColumna,
    valor: string,
    onChange: (valor: string) => void,
    registro?: PersonaComunidadTemporal
  ) => {
    // Verificar si este campo específico tiene errores
    const tieneErrorEnCampo = registro?.errores.some((error) =>
      error.toLowerCase().includes(columna.nombre.toLowerCase())
    );

    const baseClassName = `w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
      tieneErrorEnCampo ? "border-red-300 bg-red-50" : "border-gray-300"
    }`;

    switch (columna.tipo) {
      case "select":
        let opciones: string[] = [];
        if (columna.tipoValidacion === "lista" && columna.validacion) {
          try {
            opciones = JSON.parse(columna.validacion);
          } catch {
            opciones = columna.validacion.split(",").map((opt) => opt.trim());
          }
        }

        return (
          <select
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseClassName}
          >
            <option value="">Seleccionar...</option>
            {opciones.map((opcion, index) => (
              <option key={index} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseClassName}
            rows={2}
          />
        );

      case "boolean":
        return (
          <select
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseClassName}
          >
            <option value="">Seleccionar...</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseClassName}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseClassName}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseClassName}
          />
        );

      default:
        return (
          <input
            type="text"
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
            className={baseClassName}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700">No se pudo cargar la previsualización.</p>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={cargarDatos}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
          <button
            onClick={onCancelar}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Ordenar registros: errores primero, luego por número de fila
  const registrosOrdenados = [...preview.registros].sort((a, b) => {
    if (a.estado === "error" && b.estado !== "error") return -1;
    if (a.estado !== "error" && b.estado === "error") return 1;
    return (a.numeroFila || 0) - (b.numeroFila || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Previsualización de Carga
          </h2>
          <button
            onClick={onCancelar}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">
              {preview.resumen.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {preview.resumen.nuevos}
            </div>
            <div className="text-sm text-green-700">Nuevos</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {preview.resumen.actualizaciones}
            </div>
            <div className="text-sm text-blue-700">Actualizaciones</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">
              {preview.resumen.sinCambios}
            </div>
            <div className="text-sm text-gray-700">Sin cambios</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {preview.resumen.errores}
            </div>
            <div className="text-sm text-red-700">Errores</div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-red-700">
                {error.includes("\n") ? (
                  <ul className="list-disc list-inside space-y-1">
                    {error.split("\n").map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{error}</p>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={confirmarCarga}
            disabled={preview.resumen.errores > 0 || confirmandoCarga}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>{confirmandoCarga ? "Cargando..." : "Confirmar Carga"}</span>
          </button>

          <button
            onClick={cargarDatos}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>

          <button
            onClick={onCancelar}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fila
                </th>
                {columnas.map((columna) => (
                  <th
                    key={columna._id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {columna.nombre}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrosOrdenados.map((registro) => (
                <tr
                  key={registro._id}
                  className={`${obtenerClaseEstado(
                    registro.estado
                  )} border-l-4`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {obtenerIconoEstado(registro.estado)}
                      <span className="text-sm font-medium">
                        {obtenerTextoEstado(registro.estado)}
                      </span>
                    </div>
                    {registro.errores.length > 0 && (
                      <div className="mt-1">
                        {registro.errores.map((error, index) => (
                          <div key={index} className="text-xs text-red-600">
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {registro.numeroFila}
                  </td>

                  {columnas.map((columna) => (
                    <td key={columna._id} className="px-4 py-3 text-sm">
                      {editingId === registro._id
                        ? renderCampoInput(
                            columna,
                            editingData[columna.nombre] || "",
                            (valor) =>
                              setEditingData((prev) => ({
                                ...prev,
                                [columna.nombre]: valor,
                              })),
                            registro
                          )
                        : renderValorCampo(registro, columna)}
                    </td>
                  ))}

                  <td className="px-4 py-3">
                    {editingId === registro._id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={guardarEdicion}
                          className="text-green-600 hover:text-green-700"
                          title="Guardar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="text-gray-600 hover:text-gray-700"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => iniciarEdicion(registro)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            registro._id && eliminarRegistro(registro._id)
                          }
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {registrosOrdenados.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay registros para mostrar
          </div>
        )}
      </div>
    </div>
  );
};
